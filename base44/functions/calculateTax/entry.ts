import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // item_amount: the taxable item subtotal in dollars
    // shipping_amount: shipping cost in dollars (may be 0 for free flat-rate shipping)
    // shipping_address: { line1, city, state, postal_code, country }
    const { item_amount, shipping_amount, shipping_address } = await req.json();

    if (item_amount === undefined || item_amount === null || !shipping_address) {
      return Response.json({ error: 'item_amount and shipping_address are required' }, { status: 400 });
    }

    // Phase 1: US-only enforcement
    const country = (shipping_address.country || 'US').toUpperCase();
    if (country !== 'US') {
      return Response.json({
        error: 'international_not_supported',
        message: "International orders aren't currently supported — check back soon."
      }, { status: 400 });
    }

    const itemAmountCents = Math.round(Number(item_amount) * 100);
    const shippingAmountCents = Math.round((Number(shipping_amount) || 0) * 100);

    // Line items — product only. Shipping is passed separately via shipping_cost
    // so Stripe Tax can determine whether shipping itself is taxable in the
    // buyer's jurisdiction.
    const lineItems = [
      {
        amount: itemAmountCents,
        reference: 'instrument',
        tax_behavior: 'exclusive',
        tax_code: 'txcd_99999999', // General physical goods
      },
    ];

    const calcParams = {
      currency: 'usd',
      line_items: lineItems,
      customer_details: {
        address: {
          line1: shipping_address.line1 || shipping_address.address || '',
          city: shipping_address.city,
          state: shipping_address.state,
          postal_code: shipping_address.postal_code || shipping_address.zip,
          country: country,
        },
        address_source: 'shipping',
      },
    };

    // Only include shipping cost when it has a cost.
    // $0/free shipping produces no shipping tax but item tax still calculates.
    if (shippingAmountCents > 0) {
      calcParams.shipping_cost = {
        amount: shippingAmountCents,
        tax_behavior: 'exclusive',
        tax_code: 'txcd_92010001', // Shipping
      };
    }

    const calculation = await stripe.tax.calculations.create(calcParams);

    // Extract per-component tax breakdown
    let itemTaxCents = 0;
    if (calculation.line_items?.data) {
      for (const li of calculation.line_items.data) {
        itemTaxCents += li.amount_tax || 0;
      }
    }

    const shippingTaxCents = calculation.shipping_cost?.amount_tax || 0;
    const totalTaxCents = calculation.tax_amount_exclusive;

    return Response.json({
      tax_amount: totalTaxCents / 100,
      tax_amount_cents: totalTaxCents,
      tax_amount_item: itemTaxCents / 100,
      tax_amount_shipping: shippingTaxCents / 100,
      stripe_tax_calculation_id: calculation.id,
      tax_jurisdiction_state: shipping_address.state,
      tax_jurisdiction_country: country,
      total_amount: (itemAmountCents + shippingAmountCents + totalTaxCents) / 100,
    });

  } catch (error) {
    console.error('calculateTax error:', error);
    // Hard error — do NOT return zero tax. The frontend must block checkout
    // when tax calculation fails so orders never proceed without tax charged.
    return Response.json({
      error: 'tax_calculation_failed',
      message: 'We could not calculate sales tax for your address. Please verify your shipping address and try again.'
    }, { status: 500 });
  }
});