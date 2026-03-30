import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Stripe webhook event:', event.type);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.order_id;
      if (!orderId) {
        console.log('No order_id in metadata, skipping');
        return Response.json({ received: true });
      }

      // Fetch the order
      const orders = await base44.asServiceRole.entities.Order.filter({ stripe_payment_intent_id: paymentIntent.id });
      if (!orders.length) {
        console.error('Order not found for payment intent:', paymentIntent.id);
        return Response.json({ received: true });
      }
      const order = orders[0];

      // Get the charge for actual Stripe fee
      let actualStripeFee = 0;
      let stripeChargeId = null;
      if (paymentIntent.latest_charge) {
        try {
          const charge = await stripe.charges.retrieve(paymentIntent.latest_charge, {
            expand: ['balance_transaction'],
          });
          stripeChargeId = charge.id;
          if (charge.balance_transaction?.fee) {
            actualStripeFee = charge.balance_transaction.fee / 100;
          }
        } catch (e) {
          console.error('Could not retrieve charge details:', e.message);
        }
      }

      const grossAmount = paymentIntent.amount / 100;
      const platformFee = order.platform_fee_amount || Math.round(grossAmount * 0.05 * 100) / 100;
      const builderNet = grossAmount - platformFee - actualStripeFee;

      // Update Order
      await base44.asServiceRole.entities.Order.update(order.id, {
        current_status: 'awaiting_shipment',
        payout_status: 'pending',
        status: 'paid',
        stripe_charge_id: stripeChargeId,
        stripe_fee_amount: actualStripeFee,
        builder_net_payout_expected: builderNet,
        total_gross_amount: grossAmount,
      });

      // Create Payment record
      await base44.asServiceRole.entities.Payment.create({
        order_id: order.id,
        builder_id: order.builder_id,
        buyer_id: order.user_id,
        amount: grossAmount,
        currency: 'usd',
        type: 'full_purchase',
        status: 'succeeded',
        stripe_payment_intent_id: paymentIntent.id,
        stripe_charge_id: stripeChargeId,
        platform_fee_amount: platformFee,
        stripe_fee_amount: actualStripeFee,
        net_for_builder: builderNet,
        paid_at: new Date().toISOString(),
      });

      // First-sale protection: fetch builder profile to check completion flag
      const builderProfiles = await base44.asServiceRole.entities.UserProfile.filter({ id: order.builder_id });
      const builder = builderProfiles[0] || {};
      const isFirstTransaction = !builder.is_first_sale_completed;
      const tiStatus = isFirstTransaction ? 'pending_hold_resolution' : 'ready_for_transfer';

      const transferInstruction = await base44.asServiceRole.entities.TransferInstruction.create({
        order_id: order.id,
        builder_id: order.builder_id,
        stripe_account_id_destination: order.stripe_account_id_destination,
        type: 'final_payout',
        transfer_amount_gross: grossAmount,
        platform_fee_amount: platformFee,
        stripe_fee_amount: actualStripeFee,
        transfer_amount_net: builderNet,
        status: tiStatus,
      });

      // Create PayoutHold for first sale
      if (isFirstTransaction) {
        await base44.asServiceRole.entities.PayoutHold.create({
          transfer_instruction_id: transferInstruction.id,
          order_id: order.id,
          builder_id: order.builder_id,
          amount_held: builderNet,
          reason: 'first_stock_sale_hold',
          status: 'active',
          hold_start_date: new Date().toISOString(),
        });
      }

      // Audit log
      await base44.asServiceRole.entities.AuditLog.create({
        event_type: 'PAYMENT_SUCCEEDED',
        entity_type: 'Order',
        entity_id: order.id,
        order_id: order.id,
        actor_role: 'system',
        stripe_event_id: event.id,
        details_json: {
          stripe_payment_intent_id: paymentIntent.id,
          gross_amount: grossAmount,
          platform_fee: platformFee,
          stripe_fee: actualStripeFee,
          builder_net: builderNet,
          is_first_transaction: isFirstTransaction,
          transfer_instruction_id: transferInstruction.id,
        },
      });

      console.log('Payment succeeded processed for order:', order.id);
    }

    if (event.type === 'transfer.paid' || event.type === 'transfer.created') {
      const transfer = event.data.object;
      if (transfer.metadata?.transfer_instruction_id) {
        const tiId = transfer.metadata.transfer_instruction_id;
        const tiList = await base44.asServiceRole.entities.TransferInstruction.filter({ id: tiId });
        if (tiList.length) {
          const ti = tiList[0];
          await base44.asServiceRole.entities.TransferInstruction.update(ti.id, {
            status: 'succeeded',
            stripe_transfer_id: transfer.id,
            actual_release_date: new Date().toISOString(),
          });
          await base44.asServiceRole.entities.Order.update(ti.order_id, {
            payout_status: 'fully_released',
            current_status: 'delivered',
          });

          // First-sale protection: mark builder as having completed their first payout
          if (ti.builder_id) {
            const builderProfiles = await base44.asServiceRole.entities.UserProfile.filter({ id: ti.builder_id });
            if (builderProfiles.length && !builderProfiles[0].is_first_sale_completed) {
              await base44.asServiceRole.entities.UserProfile.update(ti.builder_id, {
                is_first_sale_completed: true,
                last_successful_sale_date: new Date().toISOString().split('T')[0],
              });
            }
          }

          await base44.asServiceRole.entities.AuditLog.create({
            event_type: 'TRANSFER_SUCCEEDED',
            entity_type: 'TransferInstruction',
            entity_id: ti.id,
            order_id: ti.order_id,
            actor_role: 'system',
            stripe_event_id: event.id,
            details_json: { stripe_transfer_id: transfer.id, amount: transfer.amount / 100 },
          });
        }
      }
    }

    if (event.type === 'transfer.failed') {
      const transfer = event.data.object;
      if (transfer.metadata?.transfer_instruction_id) {
        const tiId = transfer.metadata.transfer_instruction_id;
        const tiList = await base44.asServiceRole.entities.TransferInstruction.filter({ id: tiId });
        if (tiList.length) {
          const ti = tiList[0];
          await base44.asServiceRole.entities.TransferInstruction.update(ti.id, {
            status: 'failed',
            failure_reason: transfer.failure_message || 'Transfer failed',
          });
          await base44.asServiceRole.entities.Order.update(ti.order_id, {
            payout_status: 'payout_failed',
          });
        }
      }
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('handleStripePaymentWebhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});