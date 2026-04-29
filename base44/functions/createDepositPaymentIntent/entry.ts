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

    // First-sale protection: active until builder has completed one fully paid-out sale
    const isFirstSale = !builder.is_first_sale_completed;

    // Calculate tax on deposit amount using Stripe Tax
    let taxAmountCents = 0;
    let taxCalculationId = null;
    if (order.shipping_address) {
      try {
        const taxCalc = await stripe.tax.calculations.create({
          currency: 'usd',
          line_items: [{ amount: Math.round(order.deposit_amount * 100), reference: 'deposit', tax_behavior: 'exclusive', tax_code: 'txcd_99999999' }],
          customer_details: {
            address: {
              line1: order.shipping_address.line1 || '',
              city: order.shipping_address.city || '',
              state: order.shipping_address.state || '',
              postal_code: order.shipping_address.postal_code || '',
              country: order.shipping_address.country || 'US',
            },
            address_source: 'shipping',
          },
        });
        taxAmountCents = taxCalc.tax_amount_exclusive;
        taxCalculationId = taxCalc.id;
      } catch (taxErr) {
        console.error('Tax calculation failed for deposit, proceeding without tax:', taxErr.message);
      }
    }

    const depositCents = Math.round(order.deposit_amount * 100);
    const totalDepositCents = depositCents + taxAmountCents;
    const platformFeeCents = Math.round(depositCents * 0.05);
    const stripeFeeCents = estimateStripeFee(totalDepositCents);
    const builderNetCents = depositCents - platformFeeCents - stripeFeeCents;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalDepositCents,
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
      tax_amount_deposit: taxAmountCents / 100,
      stripe_tax_calculation_id_deposit: taxCalculationId,
      payment_stage: 'awaiting_deposit',
      is_first_transaction: isFirstSale,
    });

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      feeBreakdown: {
        depositAmount: order.deposit_amount,
        taxAmount: taxAmountCents / 100,
        totalCharged: totalDepositCents / 100,
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