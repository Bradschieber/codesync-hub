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

    if (event.type !== 'payment_intent.succeeded') {
      return Response.json({ received: true });
    }

    const paymentIntent = event.data.object;
    const paymentType = paymentIntent.metadata?.payment_type;

    if (!['custom_build_deposit', 'custom_build_final'].includes(paymentType)) {
      return Response.json({ received: true }); // Not our concern here
    }

    const orderId = paymentIntent.metadata?.order_id;
    if (!orderId) return Response.json({ received: true });

    const orders = await base44.asServiceRole.entities.Order.filter({ id: orderId });
    if (!orders.length) {
      console.error('Order not found for payment intent:', paymentIntent.id);
      return Response.json({ received: true });
    }
    const order = orders[0];

    // Get actual Stripe fee
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
        console.error('Could not retrieve charge:', e.message);
      }
    }

    const paidAmount = paymentIntent.amount / 100;
    const platformFee = Math.round(paidAmount * 0.05 * 100) / 100;
    const builderNet = paidAmount - platformFee - actualStripeFee;

    if (paymentType === 'custom_build_deposit') {
      // First-sale protection: use builder-level flag, not order-type-specific flag
      const builderProfiles = await base44.asServiceRole.entities.UserProfile.filter({ id: order.builder_id });
      const builder = builderProfiles[0] || {};
      const isFirstSale = !builder.is_first_sale_completed;
      // Deposit release still requires admin approval on first sale (regardless of stock/custom)
      const newStatus = isFirstSale ? 'deposit_paid_pending_admin_release' : 'build_authorized';
      const newPayoutStatus = isFirstSale ? 'held_first_custom_deposit' : 'awaiting_release';
      const tiStatus = isFirstSale ? 'pending_admin_approval' : 'ready_for_transfer';

      await base44.asServiceRole.entities.Order.update(order.id, {
        current_status: newStatus,
        payout_status: newPayoutStatus,
        payment_stage: 'deposit_paid',
        deposit_amount_paid: paidAmount,
        deposit_stripe_fee_amount: actualStripeFee,
        deposit_builder_net: builderNet,
        stripe_charge_id: stripeChargeId,
        fulfillment_status: 'deposit_paid',
      });

      await base44.asServiceRole.entities.Payment.create({
        order_id: order.id,
        builder_id: order.builder_id,
        buyer_id: order.user_id,
        amount: paidAmount,
        currency: 'usd',
        type: 'deposit',
        status: 'succeeded',
        stripe_payment_intent_id: paymentIntent.id,
        stripe_charge_id: stripeChargeId,
        platform_fee_amount: platformFee,
        stripe_fee_amount: actualStripeFee,
        net_for_builder: builderNet,
        paid_at: new Date().toISOString(),
      });

      const transferInstruction = await base44.asServiceRole.entities.TransferInstruction.create({
        order_id: order.id,
        builder_id: order.builder_id,
        stripe_account_id_destination: order.stripe_account_id_destination,
        type: 'deposit_release',
        transfer_amount_gross: paidAmount,
        platform_fee_amount: platformFee,
        stripe_fee_amount: actualStripeFee,
        transfer_amount_net: builderNet,
        status: tiStatus,
      });

      if (isFirstSale) {
        await base44.asServiceRole.entities.PayoutHold.create({
          transfer_instruction_id: transferInstruction.id,
          order_id: order.id,
          builder_id: order.builder_id,
          amount_held: builderNet,
          reason: 'first_custom_deposit_hold',
          status: 'active',
          hold_start_date: new Date().toISOString(),
        });
      }

      await base44.asServiceRole.entities.AuditLog.create({
        event_type: 'CUSTOM_BUILD_DEPOSIT_PAID',
        entity_type: 'Order',
        entity_id: order.id,
        order_id: order.id,
        actor_role: 'system',
        stripe_event_id: event.id,
        details_json: {
          payment_intent_id: paymentIntent.id,
          amount: paidAmount,
          is_first_sale: isFirstSale,
          new_status: newStatus,
          transfer_instruction_id: transferInstruction.id,
        },
      });
    }

    if (paymentType === 'custom_build_final') {
      // Re-check builder flag at time of final payment (may have changed since deposit)
      const builderProfilesFinal = await base44.asServiceRole.entities.UserProfile.filter({ id: order.builder_id });
      const builderFinal = builderProfilesFinal[0] || {};
      const isFirstSaleFinal = !builderFinal.is_first_sale_completed;

      const finalBalance = order.final_balance_amount || paidAmount;
      const finalPlatformFee = Math.round(finalBalance * 0.05 * 100) / 100;
      const finalBuilderNet = finalBalance - finalPlatformFee - actualStripeFee;

      // TI starts as 'created' — becomes ready_for_transfer after shipment verified
      // If first-sale protection is still active, it will be held after shipment verification too
      await base44.asServiceRole.entities.Order.update(order.id, {
        current_status: 'final_payment_paid',
        payout_status: 'pending',
        payment_stage: 'final_payment_received',
        final_payment_paid: true,
        final_balance_amount_paid: paidAmount,
        final_balance_stripe_fee_amount: actualStripeFee,
        final_balance_builder_net: finalBuilderNet,
        stripe_final_charge_id: stripeChargeId,
        fulfillment_status: 'build_complete',
        is_first_transaction: isFirstSaleFinal,
      });

      await base44.asServiceRole.entities.Payment.create({
        order_id: order.id,
        builder_id: order.builder_id,
        buyer_id: order.user_id,
        amount: paidAmount,
        currency: 'usd',
        type: 'final_balance',
        status: 'succeeded',
        stripe_payment_intent_id: paymentIntent.id,
        stripe_charge_id: stripeChargeId,
        platform_fee_amount: finalPlatformFee,
        stripe_fee_amount: actualStripeFee,
        net_for_builder: finalBuilderNet,
        paid_at: new Date().toISOString(),
      });

      // TransferInstruction — will become ready_for_transfer after shipment verified
      // verifyShipment will re-check builder.is_first_sale_completed at that point
      await base44.asServiceRole.entities.TransferInstruction.create({
        order_id: order.id,
        builder_id: order.builder_id,
        stripe_account_id_destination: order.stripe_account_id_destination,
        type: 'final_payout',
        transfer_amount_gross: paidAmount,
        platform_fee_amount: finalPlatformFee,
        stripe_fee_amount: actualStripeFee,
        transfer_amount_net: finalBuilderNet,
        status: 'created',
      });

      await base44.asServiceRole.entities.AuditLog.create({
        event_type: 'CUSTOM_BUILD_FINAL_PAYMENT_PAID',
        entity_type: 'Order',
        entity_id: order.id,
        order_id: order.id,
        actor_role: 'system',
        stripe_event_id: event.id,
        details_json: {
          payment_intent_id: paymentIntent.id,
          amount: paidAmount,
          final_builder_net: finalBuilderNet,
        },
      });
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('handleCustomBuildPaymentWebhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});