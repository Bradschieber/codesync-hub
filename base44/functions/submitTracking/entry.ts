import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { orderId, trackingNumber, trackingCarrier } = await req.json();
    if (!orderId || !trackingNumber || !trackingCarrier) {
      return Response.json({ error: 'orderId, trackingNumber, and trackingCarrier are required' }, { status: 400 });
    }

    // Fetch order
    const orders = await base44.asServiceRole.entities.Order.filter({ id: orderId });
    if (!orders.length) return Response.json({ error: 'Order not found' }, { status: 404 });
    const order = orders[0];

    // Verify the user is the builder for this order
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: user.id });
    if (!profiles.length) return Response.json({ error: 'Builder profile not found' }, { status: 404 });
    const profile = profiles[0];

    if (order.builder_id !== profile.id) {
      return Response.json({ error: 'You are not authorized to update this order' }, { status: 403 });
    }

    if (order.current_status !== 'awaiting_shipment') {
      return Response.json({ error: `Order must be in awaiting_shipment status, current: ${order.current_status}` }, { status: 400 });
    }

    // Update order with tracking info
    await base44.asServiceRole.entities.Order.update(order.id, {
      tracking_number: trackingNumber,
      tracking_carrier: trackingCarrier,
      current_status: 'tracking_submitted',
      fulfillment_status: 'preparing_to_ship',
      tracking_verified: false,
    });

    // Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      event_type: 'TRACKING_SUBMITTED',
      entity_type: 'Order',
      entity_id: order.id,
      order_id: order.id,
      actor_user_id: user.id,
      actor_role: 'builder',
      details_json: { tracking_number: trackingNumber, tracking_carrier: trackingCarrier },
    });

    return Response.json({ success: true, message: 'Tracking submitted. Awaiting admin verification.' });

  } catch (error) {
    console.error('submitTracking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});