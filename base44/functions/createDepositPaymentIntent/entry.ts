import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

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

    const orders = await base44.asServiceRole.entities.Order.filter({ id: orderId });
    if (!orders.length) return Response.json({ error: 'Order not found' }, { status: 404 });
    const order = orders[0];

    if (order.order_type !== 'custom') {
      return Response.json({ error: 'This endpoint only handles custom build orders' }, { status: 400 });
    }
    if (!['agreement_accepted', 'deposit_pending'].includes(order.current_status)) {
      return Response.json({ error: `Order not eligible for deposit payment, current: ${order.current_status}` }, { status: 400 });
    }
    if (!order.deposit_amount || order.deposit_amount <= 0) {
      return Response.json({ error: 'No deposit amount set on this order' }, { status: 400 });
    }

    // Fetch builder
    const builderProfiles = await base44.asServiceRole.entities.UserProfile.filter({ id: order.builder_id });
    if (!builderProfiles.length) return Response.json({ error: 'Builder profile not found' }, { status: 404 });
    const builder = builderProfiles[0];

    if (!builder.stripe_payouts_enabled || builder.stripe_onboarding_status !== 'complete') {
      return Response.json({ error: 'Builder Stripe account is not ready' }, { status: 400 });
    }

    const depositCents = Math.round(order.deposit_amount * 100);
    const platformFeeCents = Math.round(depositCents * 0.05);
    const stripeFeeCents = estimateStripeFee(depositCents);
    const builderNetCents = depositCents - platformFeeCents - stripeFeeCents;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: depositCents,
      currency: 'usd',
      application_fee_amount: platformFeeCents,
      transfer_data: { destination: builder.stripe_account_id },
      metadata: {
        order_id: order.id,
        builder_id: order.builder_id,
        buyer_id: user.id,
        payment_type: 'custom_build_deposit',
        platform: 'stringed_collective',
      },
    });

    await base44.asServiceRole.entities.Order.update(order.id, {
      current_status: 'deposit_pending',
      stripe_deposit_payment_intent_id: paymentIntent.id,
      stripe_payment_intent_id: paymentIntent.id,
      deposit_platform_fee_amount: platformFeeCents / 100,
      deposit_stripe_fee_amount: stripeFeeCents / 100,
      deposit_builder_net: builderNetCents / 100,
      payment_stage: 'awaiting_deposit',
    });

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      feeBreakdown: {
        depositAmount: order.deposit_amount,
        platformFee: platformFeeCents / 100,
        estimatedStripeFee: stripeFeeCents / 100,
        estimatedBuilderNet: builderNetCents / 100,
      },
    });

  } catch (error) {
    console.error('createDepositPaymentIntent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});