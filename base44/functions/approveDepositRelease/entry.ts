import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const { orderId, approved, adminNotes } = await req.json();
    if (!orderId || approved === undefined) {
      return Response.json({ error: 'orderId and approved (boolean) are required' }, { status: 400 });
    }

    const orders = await base44.asServiceRole.entities.Order.filter({ id: orderId });
    if (!orders.length) return Response.json({ error: 'Order not found' }, { status: 404 });
    const order = orders[0];

    if (order.current_status !== 'deposit_paid_pending_admin_release') {
      return Response.json({ error: `Order must be in deposit_paid_pending_admin_release state, current: ${order.current_status}` }, { status: 400 });
    }

    if (!approved) {
      // Admin holds the deposit — keep in pending state with a hold note
      const tiList = await base44.asServiceRole.entities.TransferInstruction.filter({ order_id: order.id });
      for (const ti of tiList) {
        if (ti.status === 'pending_admin_approval') {
          await base44.asServiceRole.entities.TransferInstruction.update(ti.id, {
            status: 'pending_admin_approval',
            admin_notes: adminNotes || 'Deposit release held by admin',
            admin_user_id: user.id,
          });
        }
      }

      await base44.asServiceRole.entities.AuditLog.create({
        event_type: 'DEPOSIT_RELEASE_HELD',
        entity_type: 'Order',
        entity_id: order.id,
        order_id: order.id,
        actor_user_id: user.id,
        actor_role: 'admin',
        details_json: { admin_notes: adminNotes },
      });

      return Response.json({ success: true, message: 'Deposit release held. Order remains pending admin approval.' });
    }

    // Approved — authorize build to begin
    await base44.asServiceRole.entities.Order.update(order.id, {
      current_status: 'build_authorized',
      deposit_payout_released: false, // actual Stripe transfer still pending
      payout_status: 'awaiting_release',
    });

    // Move TransferInstruction to ready_for_transfer
    const tiList = await base44.asServiceRole.entities.TransferInstruction.filter({ order_id: order.id });
    let depositTI = null;
    for (const ti of tiList) {
      if (ti.status === 'pending_admin_approval') {
        await base44.asServiceRole.entities.TransferInstruction.update(ti.id, {
          status: 'ready_for_transfer',
          admin_notes: adminNotes,
          admin_user_id: user.id,
          expected_release_date: new Date().toISOString(),
        });
        depositTI = ti;
      }
    }

    // Resolve any first-custom-deposit hold
    const holds = await base44.asServiceRole.entities.PayoutHold.filter({ order_id: order.id, status: 'active' });
    for (const hold of holds) {
      if (hold.reason === 'first_custom_deposit_hold') {
        await base44.asServiceRole.entities.PayoutHold.update(hold.id, {
          status: 'resolved',
          actual_release_date: new Date().toISOString(),
          resolved_by_event: 'admin_approved_deposit_release',
          admin_notes: adminNotes,
          admin_user_id: user.id,
        });
      }
    }

    await base44.asServiceRole.entities.AuditLog.create({
      event_type: 'DEPOSIT_RELEASE_APPROVED',
      entity_type: 'Order',
      entity_id: order.id,
      order_id: order.id,
      actor_user_id: user.id,
      actor_role: 'admin',
      details_json: {
        admin_notes: adminNotes,
        transfer_instruction_id: depositTI?.id,
      },
    });

    return Response.json({
      success: true,
      message: 'Deposit release approved. Build is now authorized. Transfer instruction is ready for processing.',
    });

  } catch (error) {
    console.error('approveDepositRelease error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});