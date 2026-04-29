import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // item_amount: the taxable item subtotal in cents (or dollars — we accept dollars here)
    // shipping_amount: shipping cost in dollars
    // shipping_address: { line1, city, state, postal_code, country }
    const { item_amount, shipping_amount, shipping_address } = await req.json();

    if (!item_amount || !shipping_address) {
      return Response.json({ error: 'item_amount and shipping_address are required' }, { status: 400 });
    }

    const itemAmountCents = Math.round(item_amount * 100);
    const shippingAmountCents = Math.round((shipping_amount || 0) * 100);

    const lineItems = [
      {
        amount: itemAmountCents,
        reference: 'instrument',
        tax_behavior: 'exclusive',
        tax_code: 'txcd_99999999', // General physical goods
      },
    ];

    if (shippingAmountCents > 0) {
      lineItems.push({
        amount: shippingAmountCents,
        reference: 'shipping',
        tax_behavior: 'exclusive',
        tax_code: 'txcd_92010001', // Shipping
      });
    }

    const calculation = await stripe.tax.calculations.create({
      currency: 'usd',
      line_items: lineItems,
      customer_details: {
        address: {
          line1: shipping_address.line1 || shipping_address.address_line1 || '',
          city: shipping_address.city,
          state: shipping_address.state,
          postal_code: shipping_address.postal_code || shipping_address.zip,
          country: shipping_address.country || 'US',
        },
        address_source: 'shipping',
      },
    });

    const taxAmountCents = calculation.tax_amount_exclusive;

    return Response.json({
      tax_amount: taxAmountCents / 100,
      tax_amount_cents: taxAmountCents,
      stripe_tax_calculation_id: calculation.id,
      total_amount: (itemAmountCents + shippingAmountCents + taxAmountCents) / 100,
    });

  } catch (error) {
    console.error('calculateTax error:', error);
    // Return zero tax on error so checkout is not blocked — tax calc failures should be non-fatal
    return Response.json({ tax_amount: 0, tax_amount_cents: 0, stripe_tax_calculation_id: null, total_amount: 0, error: error.message });
  }
});