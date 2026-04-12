import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Shippo carrier token map — controls what builders can select
// Left side = display label, right side = Shippo carrier token
const CARRIER_TOKENS = {
  'UPS': 'ups',
  'FedEx': 'fedex',
  'USPS': 'usps',
  'DHL Express': 'dhl_express',
  'OnTrac': 'ontrac',
  'LaserShip': 'lasership',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { orderId, trackingNumber, trackingCarrier, shipDate, shippingService, signatureRequired, insuranceIncluded, builderShippingNotes } = await req.json();

    if (!orderId || !trackingNumber?.trim() || !trackingCarrier || !shipDate) {
      return Response.json({ error: 'orderId, trackingNumber, trackingCarrier, and shipDate are required' }, { status: 400 });
    }

    const sb = base44.asServiceRole;

    // Verify builder owns this order
    const [orders, profiles] = await Promise.all([
      sb.entities.Order.filter({ id: orderId }),
      sb.entities.UserProfile.filter({ user_id: user.id }),
    ]);
    if (!orders.length) return Response.json({ error: 'Order not found' }, { status: 404 });
    if (!profiles.length) return Response.json({ error: 'Builder profile not found' }, { status: 404 });

    const order = orders[0];
    const profile = profiles[0];

    if (order.builder_id !== profile.id) {
      return Response.json({ error: 'Not authorized to update this order' }, { status: 403 });
    }

    const blockedStatuses = ['pending_payment', 'cancelled', 'refunded', 'partially_refunded', 'disputed'];
    if (blockedStatuses.includes(order.current_status)) {
      return Response.json({ error: `Cannot submit tracking for an order with status: ${order.current_status}` }, { status: 400 });
    }

    // Resolve Shippo carrier token
    const shippoCarrier = CARRIER_TOKENS[trackingCarrier] || trackingCarrier.toLowerCase().replace(/\s+/g, '_');

    // Register tracker with Shippo
    const SHIPPO_API_KEY = Deno.env.get('SHIPPO_API_KEY');
    let shippoTrackerId = null;
    let shippoStatus = 'UNKNOWN';
    let shippoTrackingUrl = null;
    let shippoLatestEvent = null;
    let shippoLatestEventAt = null;

    const shippoRes = await fetch('https://api.goshippo.com/tracks/', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        carrier: shippoCarrier,
        tracking_number: trackingNumber.trim(),
        metadata: `order_id:${orderId}`,
      }),
    });

    if (shippoRes.ok) {
      const shippoData = await shippoRes.json();
      shippoTrackerId = shippoData.tracking_number; // Shippo uses tracking_number as identifier in tracker object
      shippoStatus = shippoData.tracking_status?.status || 'UNKNOWN';
      shippoTrackingUrl = shippoData.tracking_url_provider || null;
      const latestEvent = shippoData.tracking_history?.[shippoData.tracking_history.length - 1];
      if (latestEvent) {
        shippoLatestEvent = latestEvent.status_details || latestEvent.status;
        shippoLatestEventAt = latestEvent.status_date || null;
      }
      console.log(`Shippo tracker created: ${shippoTrackerId}, status: ${shippoStatus}`);
    } else {
      const errText = await shippoRes.text();
      console.error(`Shippo API error ${shippoRes.status}: ${errText}`);
      // Don't fail submission if Shippo is unavailable — still record tracking
    }

    const now = new Date().toISOString();

    await sb.entities.Order.update(orderId, {
      tracking_number: trackingNumber.trim(),
      tracking_carrier: trackingCarrier,
      ship_date: shipDate,
      shipping_service: shippingService || null,
      signature_required: signatureRequired || false,
      insurance_included: insuranceIncluded || false,
      builder_shipping_notes: builderShippingNotes || null,
      shippo_tracker_id: shippoTrackerId,
      shippo_tracking_status: shippoStatus,
      shippo_tracking_url_provider: shippoTrackingUrl,
      shippo_latest_event: shippoLatestEvent,
      shippo_latest_event_at: shippoLatestEventAt,
      tracking_submitted_at: now,
      tracking_verified: false,
      current_status: 'tracking_submitted',
      fulfillment_status: 'preparing_to_ship',
    });

    // Audit log
    await sb.entities.AuditLog.create({
      event_type: 'TRACKING_SUBMITTED',
      entity_type: 'Order',
      entity_id: orderId,
      order_id: orderId,
      actor_user_id: user.id,
      actor_role: 'builder',
      details_json: {
        tracking_number: trackingNumber.trim(),
        tracking_carrier: trackingCarrier,
        shippo_carrier: shippoCarrier,
        ship_date: shipDate,
        shippo_tracker_id: shippoTrackerId,
        shippo_status: shippoStatus,
      },
    });

    // Notify buyer
    await sb.functions.invoke('sendOrderNotification', {
      eventType: 'TRACKING_SUBMITTED',
      orderId,
    }).catch(e => console.error('Notification error:', e.message));

    return Response.json({
      success: true,
      shippo_tracker_id: shippoTrackerId,
      shippo_status: shippoStatus,
      tracking_url: shippoTrackingUrl,
      message: 'Tracking submitted and registered with Shippo.',
    });

  } catch (error) {
    console.error('submitTracking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});