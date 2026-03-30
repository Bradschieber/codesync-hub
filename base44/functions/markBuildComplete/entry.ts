import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { orderId, estimatedCompletionDate, builderNotes, finalPaymentDueDays } = await req.json();
    if (!orderId) return Response.json({ error: 'orderId is required' }, { status: 400 });

    const orders = await base44.asServiceRole.entities.Order.filter({ id: orderId });
    if (!orders.length) return Response.json({ error: 'Order not found' }, { status: 404 });
    const order = orders[0];

    // Verify the user is the builder
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: user.id });
    if (!profiles.length) return Response.json({ error: 'Builder profile not found' }, { status: 404 });
    const profile = profiles[0];

    if (order.builder_id !== profile.id) {
      return Response.json({ error: 'You are not authorized to update this order' }, { status: 403 });
    }

    if (!['build_authorized', 'build_in_progress'].includes(order.current_status)) {
      return Response.json({ error: `Order must be in build_authorized or build_in_progress state, current: ${order.current_status}` }, { status: 400 });
    }

    // Calculate final payment due date (default 7 days)
    const dueDays = finalPaymentDueDays || 7;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueDays);
    const finalPaymentDueDate = dueDate.toISOString().split('T')[0];

    await base44.asServiceRole.entities.Order.update(order.id, {
      current_status: 'final_payment_pending',
      fulfillment_status: 'build_complete',
      final_payment_due_date: finalPaymentDueDate,
      next_payment_due_date: finalPaymentDueDate,
      ...(builderNotes ? { builder_notes: builderNotes } : {}),
      ...(estimatedCompletionDate ? { estimated_build_completion_date: estimatedCompletionDate } : {}),
    });

    await base44.asServiceRole.entities.AuditLog.create({
      event_type: 'BUILD_MARKED_COMPLETE',
      entity_type: 'Order',
      entity_id: order.id,
      order_id: order.id,
      actor_user_id: user.id,
      actor_role: 'builder',
      details_json: {
        final_payment_due_date: finalPaymentDueDate,
        builder_notes: builderNotes,
      },
    });

    return Response.json({
      success: true,
      finalPaymentDueDate,
      message: 'Build marked complete. Buyer has been notified to pay final balance.',
    });

  } catch (error) {
    console.error('markBuildComplete error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});