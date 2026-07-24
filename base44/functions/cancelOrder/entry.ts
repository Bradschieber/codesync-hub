import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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

    const cancellableStatuses = ['pending_payment', 'agreement_pending'];
    if (!cancellableStatuses.includes(order.current_status)) {
      return Response.json({ error: `Order can only be cancelled from pending_payment or agreement_pending states, current: ${order.current_status}` }, { status: 400 });
    }

    // Block cancellation if there's an active payment — use refund flow instead
    if (order.stripe_charge_id || order.stripe_payment_intent_id) {
      return Response.json({ error: 'Order has an active payment — use the refund flow instead of cancellation' }, { status: 400 });
    }

    const previousStatus = order.current_status;

    await base44.asServiceRole.entities.Order.update(order.id, {
      current_status: 'cancelled',
      status: 'cancelled',
      fulfillment_status: 'cancelled',
      payout_status: 'pending',
      builder_notes: adminNotes ? `Admin cancelled: ${adminNotes}` : 'Admin cancelled order',
    });

    await base44.asServiceRole.entities.AuditLog.create({
      event_type: 'ORDER_CANCELLED',
      entity_type: 'Order',
      entity_id: order.id,
      order_id: order.id,
      actor_user_id: user.id,
      actor_role: 'admin',
      details_json: {
        previous_status: previousStatus,
        admin_notes: adminNotes,
      },
    });

    return Response.json({ success: true, message: 'Order cancelled.' });

  } catch (error) {
    console.error('cancelOrder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});