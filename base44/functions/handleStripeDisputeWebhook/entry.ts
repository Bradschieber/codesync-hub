import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_DISPUTE_WEBHOOK_SECRET') || Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
    } catch (err) {
      console.error('Dispute webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Stripe dispute webhook event:', event.type);

    if (event.type === 'charge.dispute.created' || event.type === 'charge.dispute.updated' || event.type === 'charge.dispute.closed') {
      const stripeDispute = event.data.object;
      const chargeId = stripeDispute.charge;

      // Find order by charge ID
      const orders = await base44.asServiceRole.entities.Order.filter({ stripe_charge_id: chargeId });
      let order = orders[0] || null;
      // Also try final charge
      if (!order) {
        const orders2 = await base44.asServiceRole.entities.Order.filter({ stripe_final_charge_id: chargeId });
        order = orders2[0] || null;
      }

      // Find payment by charge ID
      const payments = await base44.asServiceRole.entities.Payment.filter({ stripe_charge_id: chargeId });
      const payment = payments[0] || null;

      const isNew = event.type === 'charge.dispute.created';
      const isClosed = event.type === 'charge.dispute.closed';

      let internalStatus = 'open';
      if (stripeDispute.status === 'under_review') internalStatus = 'under_review';
      else if (stripeDispute.status === 'won') internalStatus = 'won';
      else if (stripeDispute.status === 'lost') internalStatus = 'lost';
      else if (isClosed) internalStatus = 'closed';

      const disputeAmount = stripeDispute.amount / 100;

      if (isNew) {
        // Create internal dispute record
        const newDispute = await base44.asServiceRole.entities.Dispute.create({
          order_id: order?.id || null,
          payment_id: payment?.id || null,
          builder_id: order?.builder_id || null,
          buyer_id: order?.user_id || null,
          buyer_email: order?.buyer_email || null,
          builder_name: order?.builder_name || null,
          stripe_charge_id: chargeId,
          stripe_dispute_id: stripeDispute.id,
          type: 'chargeback',
          reason: stripeDispute.reason || 'unknown',
          status: internalStatus,
          amount_disputed: disputeAmount,
          admin_notes: `Stripe chargeback. Reason: ${stripeDispute.reason}. Status: ${stripeDispute.status}`,
        });

        // Update order status and apply payout hold
        if (order) {
          await base44.asServiceRole.entities.Order.update(order.id, {
            current_status: 'dispute_review',
            payout_status: 'held_chargeback',
          });

          // Freeze any ready transfer instructions
          const tis = await base44.asServiceRole.entities.TransferInstruction.filter({ order_id: order.id });
          for (const ti of tis) {
            if (!['succeeded', 'cancelled'].includes(ti.status)) {
              await base44.asServiceRole.entities.TransferInstruction.update(ti.id, { status: 'pending_hold_resolution' });
            }
          }

          // Create payout hold
          await base44.asServiceRole.entities.PayoutHold.create({
            order_id: order.id,
            builder_id: order.builder_id,
            amount_held: order.builder_net_payout_expected || disputeAmount,
            reason: 'chargeback_open',
            status: 'active',
            hold_start_date: new Date().toISOString(),
            admin_notes: `Stripe chargeback created: ${stripeDispute.id}`,
          });
        }

        // Audit log
        await base44.asServiceRole.entities.AuditLog.create({
          event_type: 'CHARGEBACK_CREATED',
          entity_type: 'Dispute',
          entity_id: newDispute.id,
          order_id: order?.id || null,
          actor_role: 'system',
          stripe_event_id: event.id,
          details_json: {
            stripe_dispute_id: stripeDispute.id,
            stripe_charge_id: chargeId,
            amount_disputed: disputeAmount,
            reason: stripeDispute.reason,
          },
        });
      } else {
        // Update existing dispute record
        const existing = await base44.asServiceRole.entities.Dispute.filter({ stripe_dispute_id: stripeDispute.id });
        if (existing.length) {
          const d = existing[0];
          await base44.asServiceRole.entities.Dispute.update(d.id, {
            status: internalStatus,
            admin_notes: `Stripe dispute updated: ${stripeDispute.status}`,
          });

          // If won, release hold and restore transfer
          if (internalStatus === 'won' && order) {
            await base44.asServiceRole.entities.Order.update(order.id, { payout_status: 'awaiting_release', current_status: 'delivered' });
            const holds = await base44.asServiceRole.entities.PayoutHold.filter({ order_id: order.id, status: 'active' });
            for (const hold of holds) {
              await base44.asServiceRole.entities.PayoutHold.update(hold.id, {
                status: 'resolved', actual_release_date: new Date().toISOString(), resolved_by_event: 'dispute_won',
              });
            }
            const tis = await base44.asServiceRole.entities.TransferInstruction.filter({ order_id: order.id, status: 'pending_hold_resolution' });
            for (const ti of tis) {
              await base44.asServiceRole.entities.TransferInstruction.update(ti.id, { status: 'ready_for_transfer' });
            }
          }

          // Audit log
          await base44.asServiceRole.entities.AuditLog.create({
            event_type: 'CHARGEBACK_UPDATED',
            entity_type: 'Dispute',
            entity_id: d.id,
            order_id: order?.id || null,
            actor_role: 'system',
            stripe_event_id: event.id,
            details_json: { stripe_dispute_id: stripeDispute.id, new_status: internalStatus, stripe_status: stripeDispute.status },
          });
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('handleStripeDisputeWebhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});