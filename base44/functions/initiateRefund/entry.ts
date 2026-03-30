import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const { orderId, paymentId, refundAmount, reason, adminNotes, disputeId } = await req.json();
    if (!orderId || !refundAmount || refundAmount <= 0) {
      return Response.json({ error: 'orderId and refundAmount are required' }, { status: 400 });
    }

    const orders = await base44.asServiceRole.entities.Order.filter({ id: orderId });
    if (!orders.length) return Response.json({ error: 'Order not found' }, { status: 404 });
    const order = orders[0];

    // Determine payment to refund
    let payment = null;
    if (paymentId) {
      const payments = await base44.asServiceRole.entities.Payment.filter({ id: paymentId });
      payment = payments[0] || null;
    } else {
      const payments = await base44.asServiceRole.entities.Payment.filter({ order_id: orderId, status: 'succeeded' });
      payment = payments[0] || null;
    }

    if (!payment?.stripe_charge_id) {
      return Response.json({ error: 'No eligible payment with Stripe charge found' }, { status: 400 });
    }

    const grossAmount = order.total_gross_amount || order.total_amount || 0;
    const isFullRefund = Math.abs(refundAmount - grossAmount) < 0.01;

    // Issue refund via Stripe
    let stripeRefund;
    try {
      stripeRefund = await stripe.refunds.create({
        charge: payment.stripe_charge_id,
        amount: Math.round(refundAmount * 100),
        reason: 'requested_by_customer',
        metadata: {
          order_id: orderId,
          admin_user_id: user.id,
          dispute_id: disputeId || '',
        },
      });
    } catch (stripeErr) {
      return Response.json({ error: `Stripe refund failed: ${stripeErr.message}` }, { status: 400 });
    }

    // Determine payout impact
    const payoutAlreadyReleased = order.payout_status === 'fully_released';
    const platformFeeRefundPortion = Math.round(refundAmount * (order.platform_fee_percent || 0.05) * 100) / 100;
    const builderNetImpact = refundAmount - platformFeeRefundPortion;

    // Update Payment record
    const newRefundTotal = (payment.refund_amount || 0) + refundAmount;
    const newPaymentStatus = isFullRefund ? 'refunded' : 'partially_refunded';
    await base44.asServiceRole.entities.Payment.update(payment.id, {
      status: newPaymentStatus,
      refund_amount: newRefundTotal,
      stripe_refund_id: stripeRefund.id,
    });

    // Update Order
    const newOrderStatus = isFullRefund ? 'refunded' : 'partially_refunded';
    const newRefundTotal2 = (order.refund_amount || 0) + refundAmount;
    await base44.asServiceRole.entities.Order.update(orderId, {
      current_status: newOrderStatus,
      refund_amount: newRefundTotal2,
      payout_status: payoutAlreadyReleased ? 'adjusted_after_refund' : 'pending',
    });

    // If dispute linked, update dispute record
    if (disputeId) {
      await base44.asServiceRole.entities.Dispute.update(disputeId, {
        status: 'resolved_buyer_favor',
        resolution_notes: adminNotes || `Refund of $${refundAmount} issued`,
        resolution_date: new Date().toISOString(),
        admin_user_id: user.id,
      });
    }

    // Cancel any pending transfer instructions if payout not yet released
    if (!payoutAlreadyReleased) {
      const tis = await base44.asServiceRole.entities.TransferInstruction.filter({ order_id: orderId });
      for (const ti of tis) {
        if (!['succeeded', 'cancelled'].includes(ti.status)) {
          await base44.asServiceRole.entities.TransferInstruction.update(ti.id, {
            status: 'cancelled',
            admin_notes: `Cancelled due to refund of $${refundAmount}. ${adminNotes || ''}`,
            admin_user_id: user.id,
          });
        }
      }
      // Resolve active holds
      const holds = await base44.asServiceRole.entities.PayoutHold.filter({ order_id: orderId, status: 'active' });
      for (const hold of holds) {
        await base44.asServiceRole.entities.PayoutHold.update(hold.id, {
          status: 'resolved',
          actual_release_date: new Date().toISOString(),
          resolved_by_event: 'refund_issued',
          admin_notes: adminNotes || `Resolved by refund`,
          admin_user_id: user.id,
        });
      }
    }

    // Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      event_type: 'REFUND_INITIATED',
      entity_type: 'Payment',
      entity_id: payment.id,
      order_id: orderId,
      actor_user_id: user.id,
      actor_role: 'admin',
      details_json: {
        refund_amount: refundAmount,
        is_full_refund: isFullRefund,
        stripe_refund_id: stripeRefund.id,
        payout_already_released: payoutAlreadyReleased,
        builder_net_impact: builderNetImpact,
        platform_fee_refund_portion: platformFeeRefundPortion,
        reason: reason || 'admin_initiated',
        admin_notes: adminNotes || '',
        dispute_id: disputeId || null,
      },
    });

    return Response.json({
      success: true,
      message: `Refund of $${refundAmount} ${isFullRefund ? '(full)' : '(partial)'} issued successfully.`,
      stripeRefundId: stripeRefund.id,
      payoutAlreadyReleased,
      builderNetImpact,
    });
  } catch (error) {
    console.error('initiateRefund error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});