import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const { orderId, adminNotes } = await req.json();
    if (!orderId) return Response.json({ error: 'orderId is required' }, { status: 400 });

    const orders = await base44.asServiceRole.entities.Order.filter({ id: orderId });
    if (!orders.length) return Response.json({ error: 'Order not found' }, { status: 404 });
    const order = orders[0];

    if (!['awaiting_release', 'held_first_sale'].includes(order.payout_status)) {
      return Response.json({ error: `Order payout status must be awaiting_release or held_first_sale, current: ${order.payout_status}` }, { status: 400 });
    }

    if (!order.delivery_confirmed) {
      return Response.json({ error: 'Delivery must be confirmed before releasing payout' }, { status: 400 });
    }

    // Fetch builder profile — try by id, then user_id
    let builderProfile = null;
    if (order.builder_id) {
      const byId = await base44.asServiceRole.entities.UserProfile.filter({ id: order.builder_id });
      if (byId.length) {
        builderProfile = byId[0];
      } else {
        const byUserId = await base44.asServiceRole.entities.UserProfile.filter({ user_id: order.builder_id });
        if (byUserId.length) builderProfile = byUserId[0];
      }
    }

    if (!builderProfile) {
      return Response.json({
        error: 'Cannot release payout — builder profile not found.',
        error_code: 'BUILDER_NOT_FOUND',
        builder_id: order.builder_id,
      }, { status: 400 });
    }

    if (!builderProfile.stripe_account_id) {
      return Response.json({
        error: 'Cannot release payout — builder has not completed Stripe Connect setup.',
        error_code: 'STRIPE_NOT_CONNECTED',
        builder_id: order.builder_id,
      }, { status: 400 });
    }

    if (!builderProfile.stripe_payouts_enabled) {
      return Response.json({
        error: 'Cannot release payout — builder Stripe Connect account is not fully enabled for payouts.',
        error_code: 'STRIPE_PAYOUTS_DISABLED',
        builder_id: order.builder_id,
      }, { status: 400 });
    }

    // Calculate payout amounts
    const grossAmount = order.total_gross_amount || order.total_amount || 0;
    const platformFee = order.platform_fee_amount || Math.round(grossAmount * (order.platform_fee_percent || 0.05) * 100) / 100;
    const stripeFee = order.stripe_fee_amount || 0;
    const builderNet = order.builder_net_payout_expected || Math.round((grossAmount - platformFee - stripeFee) * 100) / 100;

    if (builderNet <= 0) {
      return Response.json({ error: 'Builder net payout amount must be greater than zero' }, { status: 400 });
    }

    // Find or create TransferInstruction
    let ti = null;
    const existingTIs = await base44.asServiceRole.entities.TransferInstruction.filter({ order_id: order.id });
    if (existingTIs.length) {
      ti = existingTIs[0];
      await base44.asServiceRole.entities.TransferInstruction.update(ti.id, {
        status: 'ready_for_transfer',
        stripe_account_id_destination: builderProfile.stripe_account_id,
        transfer_amount_gross: grossAmount,
        platform_fee_amount: platformFee,
        stripe_fee_amount: stripeFee,
        transfer_amount_net: builderNet,
        admin_notes: adminNotes,
        admin_user_id: user.id,
      });
    } else {
      ti = await base44.asServiceRole.entities.TransferInstruction.create({
        order_id: order.id,
        builder_id: order.builder_id,
        stripe_account_id_destination: builderProfile.stripe_account_id,
        type: 'final_payout',
        transfer_amount_gross: grossAmount,
        platform_fee_amount: platformFee,
        stripe_fee_amount: stripeFee,
        transfer_amount_net: builderNet,
        status: 'ready_for_transfer',
        admin_user_id: user.id,
      });
    }

    // Resolve any active holds
    const holds = await base44.asServiceRole.entities.PayoutHold.filter({ order_id: order.id, status: 'active' });
    for (const hold of holds) {
      await base44.asServiceRole.entities.PayoutHold.update(hold.id, {
        status: 'resolved',
        actual_release_date: new Date().toISOString(),
        resolved_by_event: 'admin_release',
        admin_notes: adminNotes,
        admin_user_id: user.id,
      });
    }

    // If this is a test order with no real Stripe charge, skip the actual transfer
    const hasRealCharge = !!order.stripe_charge_id;

    if (!hasRealCharge) {
      await base44.asServiceRole.entities.TransferInstruction.update(ti.id, {
        status: 'succeeded',
        actual_release_date: new Date().toISOString(),
        admin_notes: `Manual release (no real Stripe charge on order): ${adminNotes || ''}`,
      });
      await base44.asServiceRole.entities.Order.update(order.id, {
        payout_status: 'fully_released',
        final_payout_released: true,
        platform_fee_amount: platformFee,
        stripe_fee_amount: stripeFee,
        builder_net_payout_expected: builderNet,
        stripe_account_id_destination: builderProfile.stripe_account_id,
      });

      if (!builderProfile.is_first_sale_completed) {
        await base44.asServiceRole.entities.UserProfile.update(builderProfile.id, {
          is_first_sale_completed: true,
          last_successful_sale_date: new Date().toISOString().split('T')[0],
        });
      }

      await base44.asServiceRole.entities.AuditLog.create({
        event_type: 'PAYOUT_RELEASED',
        entity_type: 'Order',
        entity_id: order.id,
        order_id: order.id,
        actor_user_id: user.id,
        actor_role: 'admin',
        details_json: { amount: builderNet, skip_stripe: true, reason: 'no_real_charge', admin_notes: adminNotes },
      });

      return Response.json({ success: true, message: 'Payout released (manual — no Stripe transfer, no real charge on order).', amount: builderNet });
    }

    // Real Stripe transfer
    await base44.asServiceRole.entities.TransferInstruction.update(ti.id, {
      status: 'transfer_initiated',
    });

    const transferAmountCents = Math.round(builderNet * 100);
    let stripeTransfer;
    try {
      stripeTransfer = await stripe.transfers.create({
        amount: transferAmountCents,
        currency: 'usd',
        destination: builderProfile.stripe_account_id,
        metadata: {
          transfer_instruction_id: ti.id,
          order_id: order.id,
          builder_id: order.builder_id,
          platform: 'stringed_collective',
        },
      });
    } catch (stripeError) {
      await base44.asServiceRole.entities.TransferInstruction.update(ti.id, {
        status: 'failed',
        failure_reason: stripeError.message,
      });
      await base44.asServiceRole.entities.Order.update(order.id, { payout_status: 'payout_failed' });
      await base44.asServiceRole.entities.AuditLog.create({
        event_type: 'TRANSFER_FAILED',
        entity_type: 'TransferInstruction',
        entity_id: ti.id,
        order_id: order.id,
        actor_user_id: user.id,
        actor_role: 'admin',
        details_json: { error: stripeError.message },
      });
      return Response.json({ error: 'Stripe transfer failed: ' + stripeError.message }, { status: 500 });
    }

    await base44.asServiceRole.entities.TransferInstruction.update(ti.id, {
      status: 'succeeded',
      stripe_transfer_id: stripeTransfer.id,
      actual_release_date: new Date().toISOString(),
    });

    await base44.asServiceRole.entities.Order.update(order.id, {
      payout_status: 'fully_released',
      final_payout_released: true,
      platform_fee_amount: platformFee,
      stripe_fee_amount: stripeFee,
      builder_net_payout_expected: builderNet,
      stripe_account_id_destination: builderProfile.stripe_account_id,
    });

    if (!builderProfile.is_first_sale_completed) {
      await base44.asServiceRole.entities.UserProfile.update(builderProfile.id, {
        is_first_sale_completed: true,
        last_successful_sale_date: new Date().toISOString().split('T')[0],
      });
    }

    await base44.asServiceRole.entities.AuditLog.create({
      event_type: 'TRANSFER_SUCCEEDED',
      entity_type: 'TransferInstruction',
      entity_id: ti.id,
      order_id: order.id,
      actor_user_id: user.id,
      actor_role: 'admin',
      details_json: {
        stripe_transfer_id: stripeTransfer.id,
        amount: builderNet,
        destination: builderProfile.stripe_account_id,
      },
    });

    return Response.json({ success: true, stripeTransferId: stripeTransfer.id, amountTransferred: builderNet });

  } catch (error) {
    console.error('releasePayout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});