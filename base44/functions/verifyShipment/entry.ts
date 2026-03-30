import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const { orderId, verified, adminNotes } = await req.json();
    if (!orderId || verified === undefined) {
      return Response.json({ error: 'orderId and verified (boolean) are required' }, { status: 400 });
    }

    const orders = await base44.asServiceRole.entities.Order.filter({ id: orderId });
    if (!orders.length) return Response.json({ error: 'Order not found' }, { status: 404 });
    const order = orders[0];

    if (order.current_status !== 'tracking_submitted') {
      return Response.json({ error: `Order must be in tracking_submitted state, current: ${order.current_status}` }, { status: 400 });
    }

    if (!verified) {
      // Rejected — send back to awaiting shipment
      await base44.asServiceRole.entities.Order.update(order.id, {
        current_status: 'awaiting_shipment',
        tracking_verified: false,
        payout_status: 'held_tracking_unverified',
      });

      // Update TransferInstruction status
      const tiList = await base44.asServiceRole.entities.TransferInstruction.filter({ order_id: order.id });
      for (const ti of tiList) {
        await base44.asServiceRole.entities.TransferInstruction.update(ti.id, { status: 'created' });
      }

      await base44.asServiceRole.entities.AuditLog.create({
        event_type: 'SHIPMENT_VERIFICATION_REJECTED',
        entity_type: 'Order',
        entity_id: order.id,
        order_id: order.id,
        actor_user_id: user.id,
        actor_role: 'admin',
        details_json: { admin_notes: adminNotes, tracking_number: order.tracking_number },
      });

      return Response.json({ success: true, message: 'Tracking rejected. Order returned to awaiting_shipment.' });
    }

    // Verified — determine payout eligibility based on first-sale logic
    const isFirstTransaction = order.is_first_transaction || false;
    const newPayoutStatus = isFirstTransaction ? 'held_first_sale' : 'awaiting_release';
    const newTiStatus = isFirstTransaction ? 'pending_hold_resolution' : 'ready_for_transfer';

    await base44.asServiceRole.entities.Order.update(order.id, {
      current_status: 'shipment_verified',
      tracking_verified: true,
      payout_status: newPayoutStatus,
      fulfillment_status: 'shipped',
      status: 'shipped',
    });

    // Update TransferInstruction
    const tiList = await base44.asServiceRole.entities.TransferInstruction.filter({ order_id: order.id });
    for (const ti of tiList) {
      await base44.asServiceRole.entities.TransferInstruction.update(ti.id, {
        status: newTiStatus,
        admin_notes: adminNotes,
        admin_user_id: user.id,
      });
    }

    await base44.asServiceRole.entities.AuditLog.create({
      event_type: 'SHIPMENT_VERIFIED',
      entity_type: 'Order',
      entity_id: order.id,
      order_id: order.id,
      actor_user_id: user.id,
      actor_role: 'admin',
      details_json: {
        admin_notes: adminNotes,
        tracking_number: order.tracking_number,
        tracking_carrier: order.tracking_carrier,
        is_first_transaction: isFirstTransaction,
        payout_status: newPayoutStatus,
      },
    });

    return Response.json({
      success: true,
      message: isFirstTransaction
        ? 'Shipment verified. Payout held pending delivery confirmation (first sale).'
        : 'Shipment verified. Payout is now awaiting release.',
      payoutStatus: newPayoutStatus,
      isFirstTransaction,
    });

  } catch (error) {
    console.error('verifyShipment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});