import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { order_id, updates } = await req.json();
    if (!order_id || !updates) return Response.json({ error: 'Missing order_id or updates' }, { status: 400 });

    // Verify the caller is the builder for this order
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: user.id });
    if (!profiles.length) return Response.json({ error: 'No builder profile found' }, { status: 403 });

    const profile = profiles[0];
    const order = await base44.asServiceRole.entities.Order.get(order_id);
    if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });

    // Only allow if this builder owns the order
    const builderName = profile.business_name || profile.display_name;
    const isBuilder = order.builder_id === profile.id || order.items?.some(i => i.builder_name === builderName);
    if (!isBuilder) return Response.json({ error: 'Forbidden' }, { status: 403 });

    // Whitelist of fields builders are allowed to update
    const ALLOWED_FIELDS = [
      'tracking_number', 'tracking_carrier', 'builder_notes',
      'build_start_date', 'estimated_build_completion_date', 'fulfillment_status'
    ];
    const safeUpdates = Object.fromEntries(
      Object.entries(updates).filter(([k]) => ALLOWED_FIELDS.includes(k))
    );

    const updated = await base44.asServiceRole.entities.Order.update(order_id, safeUpdates);
    return Response.json({ success: true, order: updated });
  } catch (error) {
    console.error('updateOrderByBuilder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});