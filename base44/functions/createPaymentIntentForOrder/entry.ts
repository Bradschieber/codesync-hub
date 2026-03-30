import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Estimate Stripe fee: 2.9% + $0.30
function estimateStripeFee(amountCents) {
  return Math.round(amountCents * 0.029 + 30);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { orderId } = await req.json();
    if (!orderId) return Response.json({ error: 'orderId is required' }, { status: 400 });

    // Fetch the order
    const orders = await base44.asServiceRole.entities.Order.filter({ id: orderId });
    if (!orders.length) return Response.json({ error: 'Order not found' }, { status: 404 });
    const order = orders[0];

    if (order.order_type !== 'stock') {
      return Response.json({ error: 'This endpoint only handles stock build orders' }, { status: 400 });
    }
    if (order.current_status !== 'pending_payment') {
      return Response.json({ error: 'Order is not in pending_payment state' }, { status: 400 });
    }

    // Fetch builder profile
    const builderProfiles = await base44.asServiceRole.entities.UserProfile.filter({ id: order.builder_id });
    if (!builderProfiles.length) return Response.json({ error: 'Builder profile not found' }, { status: 404 });
    const builder = builderProfiles[0];

    // Enforce payout-readiness
    if (!builder.stripe_payouts_enabled || !builder.stripe_charges_enabled || builder.stripe_onboarding_status !== 'complete') {
      return Response.json({ error: 'Builder Stripe account is not ready to accept payments' }, { status: 400 });
    }
    if (!builder.stripe_account_id) {
      return Response.json({ error: 'Builder does not have a Stripe account connected' }, { status: 400 });
    }

    // Calculate fees
    const grossAmountCents = Math.round((order.total_gross_amount || 0) * 100);
    if (grossAmountCents <= 0) return Response.json({ error: 'Order has no valid amount' }, { status: 400 });

    const platformFeeCents = Math.round(grossAmountCents * 0.05);
    const stripeFeeCents = estimateStripeFee(grossAmountCents);
    const builderNetCents = grossAmountCents - platformFeeCents - stripeFeeCents;

    // Check if this is the builder's first stock sale
    const existingOrders = await base44.asServiceRole.entities.Order.filter({ builder_id: order.builder_id, order_type: 'stock' });
    const completedSales = existingOrders.filter(o =>
      o.id !== order.id &&
      ['payment_succeeded', 'awaiting_shipment', 'tracking_submitted', 'shipment_verified', 'shipped', 'delivered'].includes(o.current_status)
    );
    const isFirstTransaction = completedSales.length === 0;

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: grossAmountCents,
      currency: 'usd',
      application_fee_amount: platformFeeCents,
      transfer_data: {
        destination: builder.stripe_account_id,
      },
      metadata: {
        order_id: order.id,
        builder_id: order.builder_id,
        buyer_id: user.id,
        platform: 'stringed_collective',
      },
    });

    // Update order with PaymentIntent and fee calculations
    await base44.asServiceRole.entities.Order.update(order.id, {
      stripe_payment_intent_id: paymentIntent.id,
      stripe_account_id_destination: builder.stripe_account_id,
      platform_fee_percent: 0.05,
      platform_fee_amount: platformFeeCents / 100,
      stripe_fee_estimated: stripeFeeCents / 100,
      builder_net_payout_expected: builderNetCents / 100,
      is_first_transaction: isFirstTransaction,
      user_id: user.id,
    });

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      feeBreakdown: {
        grossAmount: grossAmountCents / 100,
        platformFee: platformFeeCents / 100,
        estimatedStripeFee: stripeFeeCents / 100,
        estimatedBuilderNet: builderNetCents / 100,
      },
      isFirstTransaction,
    });

  } catch (error) {
    console.error('createPaymentIntentForOrder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});