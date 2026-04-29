import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { product_id, destination_address } = await req.json();
    if (!product_id || !destination_address) {
      return Response.json({ error: 'product_id and destination_address are required' }, { status: 400 });
    }

    // Fetch product
    const products = await base44.asServiceRole.entities.Product.filter({ id: product_id });
    if (!products.length) return Response.json({ error: 'Product not found' }, { status: 404 });
    const product = products[0];

    // Handle flat rate
    if (product.shipping_option_type === 'flat_rate' || !product.shipping_option_type) {
      const amount = product.flat_shipping_amount || 0;
      return Response.json({
        type: 'flat_rate',
        rates: [{
          carrier: "Builder's Choice",
          service: 'Flat Rate Shipping',
          amount: amount,
          currency: 'USD',
          estimated_days: null,
          shippo_rate_object_id: null,
        }],
      });
    }

    // Dynamic rates via Shippo REST API
    const builders = await base44.asServiceRole.entities.UserProfile.filter({ id: product.builder_id });
    if (!builders.length) return Response.json({ error: 'Builder profile not found' }, { status: 404 });
    const builder = builders[0];

    const originStreet = builder.shipping_address_1 || builder.business_address_1;
    const originCity = builder.shipping_city || builder.business_city;
    const originState = builder.shipping_state || builder.business_state;
    const originZip = builder.shipping_postal_code || builder.business_postal_code;
    const originCountry = builder.shipping_country || builder.business_country || 'US';

    if (!originStreet || !originCity || !originState || !originZip) {
      return Response.json({ error: 'Builder shipping origin address is incomplete. Please contact the builder.' }, { status: 400 });
    }

    if (!product.package_length_in || !product.package_width_in || !product.package_height_in || !product.package_weight_lb) {
      return Response.json({ error: 'Builder has not provided package dimensions for this listing.' }, { status: 400 });
    }

    const shippoApiKey = Deno.env.get('SHIPPO_API_KEY');

    const shipmentBody = {
      address_from: {
        name: builder.business_name || 'Builder',
        street1: originStreet,
        city: originCity,
        state: originState,
        zip: originZip,
        country: originCountry,
      },
      address_to: {
        name: destination_address.name || 'Buyer',
        street1: destination_address.line1 || destination_address.address_line1 || '',
        city: destination_address.city,
        state: destination_address.state,
        zip: destination_address.postal_code || destination_address.zip,
        country: destination_address.country || 'US',
      },
      parcels: [{
        length: String(product.package_length_in),
        width: String(product.package_width_in),
        height: String(product.package_height_in),
        distance_unit: 'in',
        weight: String(product.package_weight_lb),
        mass_unit: 'lb',
      }],
      async: false,
    };

    const shipmentRes = await fetch('https://api.goshippo.com/shipments/', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${shippoApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shipmentBody),
    });

    if (!shipmentRes.ok) {
      const errText = await shipmentRes.text();
      console.error('Shippo error:', errText);
      return Response.json({ error: 'Could not retrieve shipping rates. Please try again.' }, { status: 400 });
    }

    const shipment = await shipmentRes.json();

    const rates = (shipment.rates || [])
      .filter(r => r.object_state === 'VALID' && parseFloat(r.amount) > 0)
      .map(r => ({
        carrier: r.provider,
        service: r.servicelevel?.name || '',
        amount: parseFloat(r.amount),
        currency: r.currency || 'USD',
        estimated_days: r.estimated_days || null,
        shippo_rate_object_id: r.object_id,
      }))
      .sort((a, b) => a.amount - b.amount);

    if (!rates.length) {
      return Response.json({ error: 'No shipping rates available for this destination. Please contact the builder.' }, { status: 400 });
    }

    return Response.json({ type: 'dynamic_rates', rates });

  } catch (error) {
    console.error('calculateShippingCost error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});