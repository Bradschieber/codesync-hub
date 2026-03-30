import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const { orderId, deliveryDate, adminNotes } = await req.json();
    if (!orderId) return Response.json({ error: 'orderId is required' }, { status: 400 });

    const orders = await base44.asServiceRole.entities.Order.filter({ id: orderId });
    if (!orders.length) return Response.json({ error: 'Order not found' }, { status: 404 });
    const order = orders[0];

    if (!['shipment_verified', 'shipped'].includes(order.current_status)) {
      return Response.json({ error: `Order must be in shipment_verified or shipped state, current: ${order.current_status}` }, { status: 400 });
    }

    const confirmedDate = deliveryDate || new Date().toISOString().split('T')[0];

    // Update order
    await base44.asServiceRole.entities.Order.update(order.id, {
      current_status: 'delivered',
      delivery_confirmed: true,
      delivery_confirmed_date: confirmedDate,
      payout_status: 'awaiting_release',
      fulfillment_status: 'received_by_buyer',
      status: 'delivered',
    });

    // Resolve any active first-sale hold
    const holds = await base44.asServiceRole.entities.PayoutHold.filter({ order_id: order.id, status: 'active' });
    for (const hold of holds) {
      await base44.asServiceRole.entities.PayoutHold.update(hold.id, {
        status: 'resolved',
        actual_release_date: new Date().toISOString(),
        resolved_by_event: 'delivery_confirmed',
        admin_notes: adminNotes,
        admin_user_id: user.id,
      });
    }

    // Move TransferInstruction to ready_for_transfer
    const tiList = await base44.asServiceRole.entities.TransferInstruction.filter({ order_id: order.id });
    for (const ti of tiList) {
      if (['pending_hold_resolution', 'created'].includes(ti.status)) {
        await base44.asServiceRole.entities.TransferInstruction.update(ti.id, {
          status: 'ready_for_transfer',
          admin_notes: adminNotes,
          admin_user_id: user.id,
          expected_release_date: new Date().toISOString(),
        });
      }
    }

    // Mark builder's first sale complete if applicable
    if (order.is_first_transaction) {
      const builderProfiles = await base44.asServiceRole.entities.UserProfile.filter({ id: order.builder_id });
      if (builderProfiles.length) {
        await base44.asServiceRole.entities.UserProfile.update(builderProfiles[0].id, {
          is_first_sale_completed: true,
          last_successful_sale_date: confirmedDate,
        });
      }
    }

    await base44.asServiceRole.entities.AuditLog.create({
      event_type: 'DELIVERY_CONFIRMED',
      entity_type: 'Order',
      entity_id: order.id,
      order_id: order.id,
      actor_user_id: user.id,
      actor_role: 'admin',
      details_json: {
        delivery_date: confirmedDate,
        admin_notes: adminNotes,
        holds_resolved: holds.length,
        is_first_transaction: order.is_first_transaction,
      },
    });

    return Response.json({ success: true, message: 'Delivery confirmed. Payout is now awaiting release.' });

  } catch (error) {
    console.error('confirmDelivery error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});