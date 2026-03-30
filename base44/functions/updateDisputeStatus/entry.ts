import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const { disputeId, status, resolutionNotes, type, adminNotes, applyPayoutHold, releasePayoutHold } = await req.json();
    if (!disputeId || !status) {
      return Response.json({ error: 'disputeId and status are required' }, { status: 400 });
    }

    const disputes = await base44.asServiceRole.entities.Dispute.filter({ id: disputeId });
    if (!disputes.length) return Response.json({ error: 'Dispute not found' }, { status: 404 });
    const dispute = disputes[0];

    const isResolved = ['resolved_buyer_favor', 'resolved_builder_favor', 'resolved_partial', 'closed', 'won', 'lost'].includes(status);

    await base44.asServiceRole.entities.Dispute.update(disputeId, {
      status,
      ...(type ? { type } : {}),
      ...(resolutionNotes ? { resolution_notes: resolutionNotes } : {}),
      ...(adminNotes ? { admin_notes: adminNotes } : {}),
      ...(isResolved ? { resolution_date: new Date().toISOString() } : {}),
      admin_user_id: user.id,
    });

    // Apply payout hold if requested
    if (applyPayoutHold && dispute.order_id) {
      const orders = await base44.asServiceRole.entities.Order.filter({ id: dispute.order_id });
      const order = orders[0];
      if (order) {
        await base44.asServiceRole.entities.Order.update(order.id, { payout_status: 'held_dispute' });
        const tis = await base44.asServiceRole.entities.TransferInstruction.filter({ order_id: order.id, status: 'ready_for_transfer' });
        for (const ti of tis) {
          await base44.asServiceRole.entities.TransferInstruction.update(ti.id, { status: 'pending_hold_resolution' });
        }
        // Create hold record if none active
        const activeHolds = await base44.asServiceRole.entities.PayoutHold.filter({ order_id: order.id, status: 'active' });
        if (!activeHolds.length) {
          await base44.asServiceRole.entities.PayoutHold.create({
            order_id: order.id,
            builder_id: order.builder_id,
            amount_held: order.builder_net_payout_expected || 0,
            reason: 'dispute_open',
            status: 'active',
            hold_start_date: new Date().toISOString(),
            admin_notes: adminNotes || `Dispute hold applied by admin`,
            admin_user_id: user.id,
          });
        }
      }
    }

    // Release payout hold if resolved in builder's favor
    if (releasePayoutHold && dispute.order_id) {
      const holds = await base44.asServiceRole.entities.PayoutHold.filter({ order_id: dispute.order_id, status: 'active' });
      for (const hold of holds) {
        await base44.asServiceRole.entities.PayoutHold.update(hold.id, {
          status: 'resolved',
          actual_release_date: new Date().toISOString(),
          resolved_by_event: 'dispute_resolved',
          admin_user_id: user.id,
        });
      }
      // Re-queue TI if appropriate
      const orders = await base44.asServiceRole.entities.Order.filter({ id: dispute.order_id });
      if (orders.length) {
        await base44.asServiceRole.entities.Order.update(orders[0].id, { payout_status: 'awaiting_release' });
        const tis = await base44.asServiceRole.entities.TransferInstruction.filter({ order_id: dispute.order_id, status: 'pending_hold_resolution' });
        for (const ti of tis) {
          await base44.asServiceRole.entities.TransferInstruction.update(ti.id, { status: 'ready_for_transfer' });
        }
      }
    }

    // Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      event_type: 'DISPUTE_STATUS_UPDATED',
      entity_type: 'Dispute',
      entity_id: disputeId,
      order_id: dispute.order_id,
      actor_user_id: user.id,
      actor_role: 'admin',
      details_json: { new_status: status, type, resolution_notes: resolutionNotes, apply_hold: applyPayoutHold, release_hold: releasePayoutHold },
    });

    return Response.json({ success: true, message: 'Case updated successfully.' });
  } catch (error) {
    console.error('updateDisputeStatus error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});