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
    if (order.current_status !== 'final_payment_pending') {
      return Response.json({ error: `Order not eligible for final payment, current: ${order.current_status}` }, { status: 400 });
    }
    if (order.final_payment_paid) {
      return Response.json({ error: 'Final payment already received' }, { status: 400 });
    }

    const finalBalance = order.final_balance_amount;
    if (!finalBalance || finalBalance <= 0) {
      return Response.json({ error: 'No final balance amount set on this order' }, { status: 400 });
    }

    // Fetch builder
    const builderProfiles = await base44.asServiceRole.entities.UserProfile.filter({ id: order.builder_id });
    if (!builderProfiles.length) return Response.json({ error: 'Builder profile not found' }, { status: 404 });
    const builder = builderProfiles[0];

    if (!builder.stripe_payouts_enabled || builder.stripe_onboarding_status !== 'complete') {
      return Response.json({ error: 'Builder Stripe account is not ready' }, { status: 400 });
    }

    // Calculate tax on final balance using Stripe Tax
    let taxAmountCents = 0;
    let taxCalculationId = null;
    if (order.shipping_address) {
      try {
        const taxCalc = await stripe.tax.calculations.create({
          currency: 'usd',
          line_items: [{ amount: Math.round(finalBalance * 100), reference: 'final_balance', tax_behavior: 'exclusive', tax_code: 'txcd_99999999' }],
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
        console.error('Tax calculation failed for final payment, proceeding without tax:', taxErr.message);
      }
    }

    const finalCents = Math.round(finalBalance * 100);
    const totalFinalCents = finalCents + taxAmountCents;
    const platformFeeCents = Math.round(finalCents * 0.05);
    const stripeFeeCents = estimateStripeFee(totalFinalCents);
    const builderNetCents = finalCents - platformFeeCents - stripeFeeCents;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalFinalCents,
      currency: 'usd',
      application_fee_amount: platformFeeCents,
      transfer_data: { destination: builder.stripe_account_id },
      metadata: {
        order_id: order.id,
        builder_id: order.builder_id,
        buyer_id: user.id,
        payment_type: 'custom_build_final',
        platform: 'stringed_collective',
      },
    });

    await base44.asServiceRole.entities.Order.update(order.id, {
      stripe_final_payment_intent_id: paymentIntent.id,
      final_balance_platform_fee_amount: platformFeeCents / 100,
      final_balance_stripe_fee_amount: stripeFeeCents / 100,
      final_balance_builder_net: builderNetCents / 100,
      tax_amount_final: taxAmountCents / 100,
      stripe_tax_calculation_id_final: taxCalculationId,
    });

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      feeBreakdown: {
        finalBalance,
        taxAmount: taxAmountCents / 100,
        totalCharged: totalFinalCents / 100,
        platformFee: platformFeeCents / 100,
        estimatedStripeFee: stripeFeeCents / 100,
        estimatedBuilderNet: builderNetCents / 100,
      },
    });

  } catch (error) {
    console.error('createFinalPaymentIntent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});