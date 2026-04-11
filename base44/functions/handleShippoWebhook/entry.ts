import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Maps Shippo tracking status → internal order current_status
function mapShippoStatusToOrderStatus(shippoStatus) {
  switch (shippoStatus) {
    case 'PRE_TRANSIT': return 'tracking_submitted';
    case 'TRANSIT':     return 'in_transit';
    case 'DELIVERED':   return 'delivered';
    case 'RETURNED':    return 'shipment_verified'; // treat return as still verified
    case 'FAILURE':     return 'shipment_verified'; // exception — keep verified but don't auto-advance
    default:            return null; // UNKNOWN — no status change
  }
}

// Determine if payout should be advanced based on delivery/verification event
async function evaluatePayoutRelease(order, builder, newStatus, sb) {
  // Never auto-release if any hold is active
  const blockedPayoutStatuses = [
    'held_dispute', 'held_admin', 'held_issue_review', 'held_chargeback', 'held_first_custom_deposit',
  ];
  if (blockedPayoutStatuses.includes(order.payout_status)) {
    console.log(`Payout hold active (${order.payout_status}) — skipping payout progression`);
    return null;
  }

  const isFirstSale = order.is_first_transaction && !builder?.is_first_sale_completed;

  if (newStatus === 'delivered') {
    // Carrier-confirmed delivery — both first-sale and standard can advance to awaiting_release
    return 'awaiting_release';
  }

  if (newStatus === 'in_transit' || newStatus === 'shipment_verified') {
    if (isFirstSale) {
      // First-sale builder: hold until delivery
      return 'awaiting_delivery_confirmation';
    } else {
      // Standard builder: shipment verified is enough to move toward release
      return 'awaiting_release';
    }
  }

  return null;
}

Deno.serve(async (req) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const sb = base44.asServiceRole;

    const payload = await req.json();
    console.log('Shippo webhook received:', JSON.stringify(payload).slice(0, 500));

    // Shippo wraps events in { event, data } or sends the tracking object directly
    const event = payload.event || 'track_updated';
    const trackingObj = payload.data || payload;

    const trackingNumber = trackingObj.tracking_number;
    const carrier = trackingObj.carrier;
    const shippoStatus = trackingObj.tracking_status?.status || trackingObj.status;
    const statusDetails = trackingObj.tracking_status?.status_details || trackingObj.status_details || '';
    const statusDate = trackingObj.tracking_status?.status_date || null;
    const trackingUrl = trackingObj.tracking_url_provider || null;

    if (!trackingNumber) {
      console.warn('Shippo webhook missing tracking_number — ignoring');
      return Response.json({ received: true });
    }

    // Find matching order by tracking_number
    const orders = await sb.entities.Order.filter({ tracking_number: trackingNumber });
    if (!orders.length) {
      console.warn(`No order found for tracking_number: ${trackingNumber}`);
      // Still return 200 so Shippo stops retrying
      return Response.json({ received: true, note: 'No matching order' });
    }

    const order = orders[0];

    // Skip if order is already in a terminal/protected state
    const terminalStatuses = ['delivered', 'refunded', 'cancelled', 'dispute_review', 'issue_review'];
    if (terminalStatuses.includes(order.current_status) && shippoStatus !== 'DELIVERED') {
      console.log(`Order ${order.id} is in ${order.current_status} — skipping non-delivery update`);
      return Response.json({ received: true });
    }

    const newOrderStatus = mapShippoStatusToOrderStatus(shippoStatus);
    const now = new Date().toISOString();

    const updatePayload = {
      shippo_tracking_status: shippoStatus,
      shippo_latest_event: statusDetails,
      shippo_latest_event_at: statusDate || now,
      shippo_tracking_url_provider: trackingUrl || order.shippo_tracking_url_provider,
    };

    if (newOrderStatus && newOrderStatus !== order.current_status) {
      updatePayload.current_status = newOrderStatus;
    }

    // Mark shipment_verified when first real transit event arrives
    if (['TRANSIT', 'DELIVERED'].includes(shippoStatus) && !order.shipment_verified_at) {
      updatePayload.shipment_verified_at = now;
      updatePayload.tracking_verified = true;
      if (!newOrderStatus || newOrderStatus === 'tracking_submitted') {
        updatePayload.current_status = 'shipment_verified';
      }
    }

    // Mark delivered
    if (shippoStatus === 'DELIVERED') {
      updatePayload.delivered_at = statusDate || now;
      updatePayload.delivery_confirmed = true;
      updatePayload.fulfillment_status = 'received_by_buyer';
    }

    // Payout logic — load builder profile
    let payoutUpdate = null;
    const profiles = await sb.entities.UserProfile.filter({ id: order.builder_id });
    const builder = profiles[0] || null;
    const effectiveStatus = updatePayload.current_status || order.current_status;
    payoutUpdate = await evaluatePayoutRelease(order, builder, effectiveStatus, sb);
    if (payoutUpdate) updatePayload.payout_status = payoutUpdate;

    await sb.entities.Order.update(order.id, updatePayload);

    // Audit log
    await sb.entities.AuditLog.create({
      event_type: `SHIPPO_${shippoStatus}`,
      entity_type: 'Order',
      entity_id: order.id,
      order_id: order.id,
      actor_user_id: 'system',
      actor_role: 'system',
      details_json: {
        shippo_status: shippoStatus,
        status_details: statusDetails,
        status_date: statusDate,
        tracking_number: trackingNumber,
        carrier,
        payout_update: payoutUpdate,
        new_order_status: updatePayload.current_status || null,
      },
    });

    // Buyer notifications
    if (shippoStatus === 'TRANSIT' && !order.shipment_verified_at) {
      // First transit scan — notify buyer shipment is on its way
      await sb.integrations.Core.SendEmail({
        from_name: 'Stringed Collective',
        to: order.buyer_email,
        subject: `Your order from ${order.builder_name} has shipped`,
        body: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #FDFBF8; color: #1B2B4B;">
  <h2 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 12px;">Your order is on its way!</h2>
  <p style="color: #4A5568; margin-bottom: 12px;">Hi ${order.buyer_name || 'there'},</p>
  <p style="color: #4A5568; margin-bottom: 12px;"><strong>${order.builder_name}</strong> has shipped your order.</p>
  <p style="color: #4A5568; margin-bottom: 8px;"><strong>Carrier:</strong> ${order.tracking_carrier}</p>
  <p style="color: #4A5568; margin-bottom: 24px;"><strong>Tracking #:</strong> <span style="font-family: monospace;">${trackingNumber}</span></p>
  ${trackingUrl ? `<p style="text-align:center; margin: 24px 0;"><a href="${trackingUrl}" style="background:#1B2B4B; color:white; padding:12px 28px; text-decoration:none; border-radius:6px; font-weight:700;">Track Your Shipment</a></p>` : ''}
  <p style="color: #9CA3AF; font-size: 0.8rem; margin-top: 32px; border-top: 1px solid #E5E7EB; padding-top: 16px;">You'll receive another notification when your instrument is delivered.</p>
</div>`
      }).catch(e => console.error('Email error:', e.message));
    }

    if (shippoStatus === 'DELIVERED') {
      const APP_URL = 'https://app.base44.com';
      await sb.integrations.Core.SendEmail({
        from_name: 'Stringed Collective',
        to: order.buyer_email,
        subject: `Your instrument has been delivered — Order from ${order.builder_name}`,
        body: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #FDFBF8; color: #1B2B4B;">
  <h2 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 12px;">Your instrument has arrived!</h2>
  <p style="color: #4A5568; margin-bottom: 12px;">Hi ${order.buyer_name || 'there'},</p>
  <p style="color: #4A5568; margin-bottom: 20px;">Your order from <strong>${order.builder_name}</strong> has been delivered according to the carrier.</p>
  <p style="color: #4A5568; margin-bottom: 16px;">How did everything go?</p>
  <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px;">
    <a href="${APP_URL}/Orders" style="background:#27AE60; color:white; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:700; display:inline-block;">Everything looks good ✓</a>
    <a href="${APP_URL}/Orders?report=true&orderId=${order.id}" style="background:#E53E3E; color:white; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:700; display:inline-block;">Report an issue</a>
  </div>
  <p style="color: #9CA3AF; font-size: 0.8rem; margin-top: 24px; border-top: 1px solid #E5E7EB; padding-top: 16px;">Your response is appreciated but not required. If you have concerns, please report an issue within your order.</p>
</div>`
      }).catch(e => console.error('Email error:', e.message));
    }

    return Response.json({ received: true, order_id: order.id, new_status: updatePayload.current_status || order.current_status });

  } catch (error) {
    console.error('handleShippoWebhook error:', error);
    // Always return 200 to prevent Shippo infinite retry
    return Response.json({ received: true, error: error.message });
  }
});