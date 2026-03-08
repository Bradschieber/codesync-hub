import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const APP_URL = "https://app.base44.com"; // Replace with actual domain when custom domain is set

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { event, data, old_data, payload_too_large } = body;

    if (event?.type !== 'update') {
      return Response.json({ ok: true });
    }

    const base44 = createClientFromRequest(req);
    const sb = base44.asServiceRole;

    let order = data;
    let prev = old_data;

    // If payload was too large, fetch from DB
    if (payload_too_large) {
      order = await sb.entities.Order.get('Order', event.entity_id);
      prev = {};
    }

    if (!order) return Response.json({ ok: true });

    const orderRef = `#${order.id.slice(-8).toUpperCase()}`;

    // ─────────────────────────────────────────────────────────────
    // PART 1: build_complete → notify buyer, set payment_stage
    // ─────────────────────────────────────────────────────────────
    if (
      order.fulfillment_status === 'build_complete' &&
      prev.fulfillment_status !== 'build_complete' &&
      order.order_type === 'custom'
    ) {
      await sb.entities.Order.update(order.id, { payment_stage: 'awaiting_final_payment' });

      if (order.buyer_email) {
        await sb.integrations.Core.SendEmail({
          from_name: 'Stringed Collective',
          to: order.buyer_email,
          subject: `Your instrument is complete — final payment required | Order ${orderRef}`,
          body: `
<div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #FDFBF8; color: #1B2B4B;">
  <div style="margin-bottom: 24px;">
    <span style="font-size: 1.1rem; font-weight: 700; letter-spacing: 0.02em;">Stringed</span>
    <span style="font-size: 1.1rem; font-weight: 400; letter-spacing: 0.1em;"> Collective</span>
  </div>
  <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 12px;">Your instrument is complete 🎸</h2>
  <p style="color: #4A5568; margin-bottom: 12px;">Hi ${order.buyer_name || 'there'},</p>
  <p style="color: #4A5568; margin-bottom: 12px;">Exciting news — your custom-built instrument from <strong>${order.builder_name}</strong> is now complete and ready for shipment.</p>
  <p style="color: #4A5568; margin-bottom: 24px;">To proceed with shipping, your <strong>final balance payment is now required</strong>. Once payment is received, your builder will carefully prepare and ship your instrument.</p>
  <div style="background: #FEF3E2; border: 1px solid #F6AD55; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
    <p style="margin: 0; font-weight: 600; color: #744210;">Order ${orderRef}</p>
    <p style="margin: 4px 0 0; color: #744210; font-size: 0.9rem;">Shipping will begin after final payment is confirmed.</p>
  </div>
  <p style="text-align: center; margin: 28px 0;">
    <a href="${APP_URL}" style="background-color: #2F3E55; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 0.95rem; display: inline-block;">Pay Final Balance</a>
  </p>
  <p style="color: #9CA3AF; font-size: 0.8rem; margin-top: 32px; border-top: 1px solid #E5E7EB; padding-top: 16px;">Questions? Reply to this email or visit your orders page on Stringed Collective.</p>
</div>`
        });
      }

      // Notify admins
      await notifyAdmins(sb, `[SC] Build complete — buyer final payment pending | Order ${orderRef}`,
        `Build complete for order ${orderRef}. Buyer final payment is now pending.\n\nBuilder: ${order.builder_name}\nBuyer: ${order.buyer_email}\nAmount: $${order.total_amount?.toLocaleString()}`
      );
    }

    // ─────────────────────────────────────────────────────────────
    // PART 2: final_payment_paid → notify builder + admins
    // ─────────────────────────────────────────────────────────────
    if (order.final_payment_paid === true && prev.final_payment_paid !== true) {
      await sb.entities.Order.update(order.id, { payment_stage: 'final_payment_received' });

      // Get builder's email from their UserProfile
      const builderProfiles = await sb.entities.UserProfile.filter({ id: order.builder_id });
      const builderEmail = builderProfiles[0]?.email;

      if (builderEmail) {
        await sb.integrations.Core.SendEmail({
          from_name: 'Stringed Collective',
          to: builderEmail,
          subject: `Final payment received — Order ${orderRef} is cleared to ship`,
          body: `
<div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #FDFBF8; color: #1B2B4B;">
  <div style="margin-bottom: 24px;">
    <span style="font-size: 1.1rem; font-weight: 700; letter-spacing: 0.02em;">Stringed</span>
    <span style="font-size: 1.1rem; font-weight: 400; letter-spacing: 0.1em;"> Collective</span>
  </div>
  <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 12px;">Final payment received ✓</h2>
  <p style="color: #4A5568; margin-bottom: 12px;">The buyer has completed their final payment for Order ${orderRef}.</p>
  <p style="color: #4A5568; margin-bottom: 24px;">You may now prepare the instrument for shipment. Please log in to your Builder Dashboard to update the order status and add tracking information.</p>
  <div style="background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
    <p style="margin: 0; font-weight: 600; color: #166534;">Order ${orderRef} — Cleared to ship</p>
  </div>
  <p style="color: #9CA3AF; font-size: 0.8rem; margin-top: 32px; border-top: 1px solid #E5E7EB; padding-top: 16px;">— The Stringed Collective Team</p>
</div>`
        });
      }

      await notifyAdmins(sb, `[SC] Final payment received | Order ${orderRef}`,
        `Final payment received for order ${orderRef}.\n\nBuilder: ${order.builder_name}\nBuyer: ${order.buyer_email}\n\nNote: If this is the builder's first transaction (is_first_transaction = ${order.is_first_transaction}), final payout should be held until delivery confirmation.`
      );
    }

    // ─────────────────────────────────────────────────────────────
    // PART 6: received_by_buyer → set warranty & return start dates
    // ─────────────────────────────────────────────────────────────
    if (
      order.fulfillment_status === 'received_by_buyer' &&
      prev.fulfillment_status !== 'received_by_buyer'
    ) {
      const today = new Date().toISOString().split('T')[0];
      await sb.entities.Order.update(order.id, {
        delivery_confirmed: true,
        warranty_start_date: today,
        return_period_start_date: today,
      });

      // If first transaction → final payout now eligible; notify admins
      if (order.is_first_transaction) {
        await notifyAdmins(sb, `[SC] First transaction delivered — final payout now eligible | Order ${orderRef}`,
          `Order ${orderRef} has been delivered and confirmed. This was the builder's first transaction. Final payout is now eligible for release.\n\nBuilder: ${order.builder_name}`
        );
      }
    }

    // ─────────────────────────────────────────────────────────────
    // Deposit payout readiness notification
    // ─────────────────────────────────────────────────────────────
    if (
      order.order_type === 'custom' &&
      order.purchase_agreement_signed === true &&
      prev.purchase_agreement_signed !== true &&
      (order.payment_stage === 'deposit_paid' || order.payment_stage === 'awaiting_final_payment')
    ) {
      await notifyAdmins(sb, `[SC] Deposit payout ready | Order ${orderRef}`,
        `Deposit payout conditions met for order ${orderRef}. Purchase agreement is signed and deposit has been received.\n\nBuilder: ${order.builder_name}\nDeposit amount: $${order.deposit_amount?.toLocaleString() || 'N/A'}`
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function notifyAdmins(sb, subject, text) {
  try {
    const admins = await sb.entities.User.filter({ role: 'admin' });
    for (const admin of admins) {
      if (admin.email) {
        await sb.integrations.Core.SendEmail({
          from_name: 'Stringed Collective Admin',
          to: admin.email,
          subject,
          body: `<pre style="font-family: sans-serif; white-space: pre-wrap;">${text}</pre>`
        });
      }
    }
  } catch (_) { /* silent */ }
}