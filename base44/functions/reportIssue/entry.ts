import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { orderId, issueType, description } = await req.json();
    if (!orderId || !issueType || !description) {
      return Response.json({ error: 'orderId, issueType, and description are required' }, { status: 400 });
    }

    const orders = await base44.entities.Order.filter({ id: orderId });
    if (!orders.length) return Response.json({ error: 'Order not found' }, { status: 404 });
    const order = orders[0];

    // Confirm this buyer owns the order
    if (order.user_id !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check no open issue already exists
    const existing = await base44.asServiceRole.entities.Dispute.filter({ order_id: orderId, status: 'open' });
    if (existing.length) {
      return Response.json({ error: 'An open issue already exists for this order.' }, { status: 409 });
    }

    // Find primary payment
    const payments = await base44.asServiceRole.entities.Payment.filter({ order_id: orderId });
    const payment = payments[0] || null;

    // Create dispute/issue record
    const dispute = await base44.asServiceRole.entities.Dispute.create({
      order_id: orderId,
      payment_id: payment?.id || null,
      builder_id: order.builder_id,
      buyer_id: user.id,
      buyer_email: user.email,
      builder_name: order.builder_name,
      stripe_charge_id: order.stripe_charge_id || payment?.stripe_charge_id || null,
      type: 'buyer_issue',
      reason: issueType,
      status: 'open',
      amount_disputed: order.total_gross_amount || order.total_amount || 0,
      buyer_notes: description,
    });

    // Update order status to issue_review
    await base44.asServiceRole.entities.Order.update(orderId, {
      current_status: 'issue_review',
    });

    // Place a soft payout hold if payout not yet released
    if (!['fully_released'].includes(order.payout_status)) {
      const tis = await base44.asServiceRole.entities.TransferInstruction.filter({ order_id: orderId, status: 'ready_for_transfer' });
      for (const ti of tis) {
        await base44.asServiceRole.entities.TransferInstruction.update(ti.id, { status: 'pending_hold_resolution' });
      }
      await base44.asServiceRole.entities.Order.update(orderId, {
        payout_status: 'held_issue_review',
      });
      await base44.asServiceRole.entities.PayoutHold.create({
        order_id: orderId,
        builder_id: order.builder_id,
        amount_held: order.builder_net_payout_expected || 0,
        reason: 'issue_review',
        status: 'active',
        hold_start_date: new Date().toISOString(),
        admin_notes: `Buyer-reported issue: ${issueType}`,
      });
    }

    // Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      event_type: 'ISSUE_REPORTED',
      entity_type: 'Dispute',
      entity_id: dispute.id,
      order_id: orderId,
      actor_user_id: user.id,
      actor_role: 'buyer',
      details_json: { issue_type: issueType, description, dispute_id: dispute.id },
    });

    return Response.json({ success: true, disputeId: dispute.id, message: 'Your issue has been reported. Our team will review it shortly.' });
  } catch (error) {
    console.error('reportIssue error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});