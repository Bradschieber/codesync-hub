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

    if (order.current_status !== 'final_payment_pending') {
      return Response.json({ error: `Order must be in final_payment_pending state, current: ${order.current_status}` }, { status: 400 });
    }

    await base44.asServiceRole.entities.Order.update(order.id, {
      current_status: 'buyer_default_review',
    });

    // Create a hold on any pending transfer instructions
    const tiList = await base44.asServiceRole.entities.TransferInstruction.filter({ order_id: order.id });
    for (const ti of tiList) {
      if (['created', 'ready_for_transfer'].includes(ti.status)) {
        await base44.asServiceRole.entities.TransferInstruction.update(ti.id, {
          status: 'pending_hold_resolution',
          admin_notes: `Buyer default: ${adminNotes || 'Final payment not received'}`,
          admin_user_id: user.id,
        });
        await base44.asServiceRole.entities.PayoutHold.create({
          transfer_instruction_id: ti.id,
          order_id: order.id,
          builder_id: order.builder_id,
          amount_held: ti.transfer_amount_net,
          reason: 'buyer_default_pending',
          status: 'active',
          hold_start_date: new Date().toISOString(),
          admin_notes: adminNotes,
          admin_user_id: user.id,
        });
      }
    }

    await base44.asServiceRole.entities.AuditLog.create({
      event_type: 'BUYER_DEFAULT_FLAGGED',
      entity_type: 'Order',
      entity_id: order.id,
      order_id: order.id,
      actor_user_id: user.id,
      actor_role: 'admin',
      details_json: { admin_notes: adminNotes },
    });

    return Response.json({ success: true, message: 'Order moved to buyer_default_review.' });

  } catch (error) {
    console.error('flagBuyerDefault error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});