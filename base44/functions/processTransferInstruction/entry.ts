import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const { transferInstructionId } = await req.json();
    if (!transferInstructionId) return Response.json({ error: 'transferInstructionId is required' }, { status: 400 });

    const tiList = await base44.asServiceRole.entities.TransferInstruction.filter({ id: transferInstructionId });
    if (!tiList.length) return Response.json({ error: 'TransferInstruction not found' }, { status: 404 });
    const ti = tiList[0];

    if (ti.status !== 'ready_for_transfer') {
      return Response.json({ error: `TransferInstruction must be ready_for_transfer, current: ${ti.status}` }, { status: 400 });
    }

    if (!ti.stripe_account_id_destination) {
      return Response.json({ error: 'No Stripe destination account set on TransferInstruction' }, { status: 400 });
    }

    const transferAmountCents = Math.round(ti.transfer_amount_net * 100);
    if (transferAmountCents <= 0) {
      return Response.json({ error: 'Transfer amount must be greater than zero' }, { status: 400 });
    }

    // Mark as initiated before calling Stripe
    await base44.asServiceRole.entities.TransferInstruction.update(ti.id, {
      status: 'transfer_initiated',
      admin_user_id: user.id,
    });

    // Create Stripe transfer
    let stripeTransfer;
    try {
      stripeTransfer = await stripe.transfers.create({
        amount: transferAmountCents,
        currency: 'usd',
        destination: ti.stripe_account_id_destination,
        metadata: {
          transfer_instruction_id: ti.id,
          order_id: ti.order_id,
          builder_id: ti.builder_id,
          platform: 'stringed_collective',
        },
      });
    } catch (stripeError) {
      // Mark as failed
      await base44.asServiceRole.entities.TransferInstruction.update(ti.id, {
        status: 'failed',
        failure_reason: stripeError.message,
      });
      await base44.asServiceRole.entities.Order.update(ti.order_id, { payout_status: 'payout_failed' });
      await base44.asServiceRole.entities.AuditLog.create({
        event_type: 'TRANSFER_FAILED',
        entity_type: 'TransferInstruction',
        entity_id: ti.id,
        order_id: ti.order_id,
        actor_user_id: user.id,
        actor_role: 'admin',
        details_json: { error: stripeError.message },
      });
      return Response.json({ error: 'Stripe transfer failed: ' + stripeError.message }, { status: 500 });
    }

    // Transfer succeeded
    await base44.asServiceRole.entities.TransferInstruction.update(ti.id, {
      status: 'succeeded',
      stripe_transfer_id: stripeTransfer.id,
      actual_release_date: new Date().toISOString(),
    });

    await base44.asServiceRole.entities.Order.update(ti.order_id, {
      payout_status: 'fully_released',
      final_payout_released: true,
    });

    await base44.asServiceRole.entities.AuditLog.create({
      event_type: 'TRANSFER_SUCCEEDED',
      entity_type: 'TransferInstruction',
      entity_id: ti.id,
      order_id: ti.order_id,
      actor_user_id: user.id,
      actor_role: 'admin',
      details_json: {
        stripe_transfer_id: stripeTransfer.id,
        amount: ti.transfer_amount_net,
        destination: ti.stripe_account_id_destination,
      },
    });

    return Response.json({
      success: true,
      stripeTransferId: stripeTransfer.id,
      amountTransferred: ti.transfer_amount_net,
    });

  } catch (error) {
    console.error('processTransferInstruction error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});