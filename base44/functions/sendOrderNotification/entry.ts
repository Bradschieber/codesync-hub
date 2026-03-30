import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const APP_URL = 'https://stringed-collective.base44.app';

const EMAIL_TEMPLATES = {
  // ── BUYER notifications ──────────────────────────────────────────────
  PAYMENT_CONFIRMED_BUYER: (order, ref) => ({
    subject: `Payment confirmed — Order ${ref}`,
    body: emailWrap(`
      <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:12px;">Payment received ✓</h2>
      <p style="color:#4A5568;margin-bottom:12px;">Hi ${order.buyer_name || 'there'},</p>
      <p style="color:#4A5568;margin-bottom:20px;">Your payment for Order ${ref} has been confirmed. Your builder, <strong>${order.builder_name}</strong>, has been notified and will begin processing your order.</p>
      ${infoBox(ref, order.order_type === 'custom' ? 'Your builder will update you as the build progresses.' : 'Tracking information will be provided once your instrument ships.')}
      ${cta('View Your Order', APP_URL)}
    `)
  }),

  TRACKING_SUBMITTED_BUYER: (order, ref) => ({
    subject: `Your order has shipped — Order ${ref}`,
    body: emailWrap(`
      <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:12px;">Your instrument is on its way 📦</h2>
      <p style="color:#4A5568;margin-bottom:12px;">Hi ${order.buyer_name || 'there'},</p>
      <p style="color:#4A5568;margin-bottom:20px;">Your builder has submitted tracking information for Order ${ref}. Our team is verifying shipment details.</p>
      ${order.tracking_number ? infoBox(ref, `Carrier: ${order.tracking_carrier || 'TBD'}<br/>Tracking: ${order.tracking_number}`) : infoBox(ref, 'Tracking details are being verified.')}
      ${cta('Track Your Order', APP_URL)}
    `)
  }),

  SHIPMENT_VERIFIED_BUYER: (order, ref) => ({
    subject: `Shipment verified — Order ${ref}`,
    body: emailWrap(`
      <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:12px;">Shipment confirmed ✓</h2>
      <p style="color:#4A5568;margin-bottom:12px;">Hi ${order.buyer_name || 'there'},</p>
      <p style="color:#4A5568;margin-bottom:20px;">We've verified that your instrument from <strong>${order.builder_name}</strong> is on its way. Expect delivery based on the carrier's estimated timeline.</p>
      ${order.tracking_number ? infoBox(ref, `Carrier: ${order.tracking_carrier || 'TBD'}<br/>Tracking: <strong>${order.tracking_number}</strong>`) : infoBox(ref, 'Your instrument is en route.')}
      ${cta('View Order Status', APP_URL)}
    `)
  }),

  ISSUE_OPENED_BUYER: (order, ref) => ({
    subject: `Issue reported — we're on it | Order ${ref}`,
    body: emailWrap(`
      <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:12px;">We've received your issue report</h2>
      <p style="color:#4A5568;margin-bottom:12px;">Hi ${order.buyer_name || 'there'},</p>
      <p style="color:#4A5568;margin-bottom:20px;">Your issue for Order ${ref} has been received. Our team will review the case and reach out within 1–2 business days. Your payment is protected while this case is under review.</p>
      ${infoBox(ref, 'Case status: <strong>Under Review</strong>')}
      ${cta('View Order', APP_URL)}
    `)
  }),

  REFUND_ISSUED_BUYER: (order, ref, amount) => ({
    subject: `Refund issued — Order ${ref}`,
    body: emailWrap(`
      <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:12px;">Refund processed ✓</h2>
      <p style="color:#4A5568;margin-bottom:12px;">Hi ${order.buyer_name || 'there'},</p>
      <p style="color:#4A5568;margin-bottom:20px;">A refund of <strong>$${Number(amount).toFixed(2)}</strong> has been issued for Order ${ref}. Please allow 5–10 business days for the funds to appear depending on your bank.</p>
      ${infoBox(ref, `Refund amount: <strong>$${Number(amount).toFixed(2)}</strong>`)}
      ${cta('View Order', APP_URL)}
    `)
  }),

  DISPUTE_UPDATE_BUYER: (order, ref, status) => ({
    subject: `Update on your case — Order ${ref}`,
    body: emailWrap(`
      <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:12px;">Case update</h2>
      <p style="color:#4A5568;margin-bottom:20px;">There's an update on your open case for Order ${ref}. Current status: <strong>${status}</strong>.</p>
      ${cta('View Order', APP_URL)}
    `)
  }),

  // ── BUILDER notifications ─────────────────────────────────────────────
  NEW_ORDER_BUILDER: (order, ref) => ({
    subject: `New order received — Order ${ref}`,
    body: emailWrap(`
      <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:12px;">New order received 🎸</h2>
      <p style="color:#4A5568;margin-bottom:12px;">You have a new ${order.order_type === 'custom' ? 'custom build' : 'stock'} order (${ref}) from <strong>${order.buyer_name || order.buyer_email}</strong>.</p>
      <p style="color:#4A5568;margin-bottom:20px;">Order amount: <strong>$${(order.total_gross_amount || order.total_amount || 0).toLocaleString()}</strong></p>
      ${infoBox(ref, order.order_type === 'custom' ? 'Review the custom build agreement in your Builder Dashboard.' : 'Prepare the instrument for shipment and submit tracking once shipped.')}
      ${cta('View in Builder Dashboard', APP_URL)}
    `)
  }),

  DEPOSIT_APPROVED_BUILDER: (order, ref) => ({
    subject: `Deposit approved — build authorized | Order ${ref}`,
    body: emailWrap(`
      <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:12px;">Build authorized ✓</h2>
      <p style="color:#4A5568;margin-bottom:12px;">The deposit for Order ${ref} has been reviewed and approved. You are now authorized to begin the build.</p>
      ${infoBox(ref, `Deposit: $${(order.deposit_amount || 0).toLocaleString()}`)}
      ${cta('View Order', APP_URL)}
    `)
  }),

  DEPOSIT_HELD_BUILDER: (order, ref) => ({
    subject: `Deposit hold — admin review required | Order ${ref}`,
    body: emailWrap(`
      <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:12px;">Deposit under admin review</h2>
      <p style="color:#4A5568;margin-bottom:20px;">The deposit for Order ${ref} is currently under admin review as part of our standard first-sale verification process. You will be notified once it is approved and you are cleared to begin building. This typically takes 1–2 business days.</p>
      ${cta('View Order', APP_URL)}
    `)
  }),

  PAYOUT_RELEASED_BUILDER: (order, ref, amount) => ({
    subject: `Payout released — $${Number(amount).toFixed(2)} | Order ${ref}`,
    body: emailWrap(`
      <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:12px;">Payout released ✓</h2>
      <p style="color:#4A5568;margin-bottom:12px;">Your payout for Order ${ref} has been released.</p>
      ${infoBox(ref, `Net payout: <strong>$${Number(amount).toFixed(2)}</strong><br/>Please allow 1–3 business days for funds to arrive in your Stripe account.`)}
      ${cta('View in Dashboard', APP_URL)}
    `)
  }),

  PAYOUT_HELD_BUILDER: (order, ref, reason) => ({
    subject: `Payout hold — Order ${ref}`,
    body: emailWrap(`
      <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:12px;">Payout is on hold</h2>
      <p style="color:#4A5568;margin-bottom:20px;">Your payout for Order ${ref} is currently on hold. Reason: <strong>${reason || 'Under review'}</strong>. Our team will reach out if any action is needed from you.</p>
      ${cta('View Order', APP_URL)}
    `)
  }),

  ISSUE_OPENED_BUILDER: (order, ref) => ({
    subject: `Buyer issue reported — Order ${ref}`,
    body: emailWrap(`
      <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:12px;">Buyer has reported an issue</h2>
      <p style="color:#4A5568;margin-bottom:20px;">A buyer has reported an issue with Order ${ref}. Our team is reviewing the case. Your payout for this order is temporarily on hold while the case is under review. We will contact you if we need additional information.</p>
      ${cta('View Order', APP_URL)}
    `)
  }),

  REFUND_ISSUED_BUILDER: (order, ref, amount) => ({
    subject: `Refund notice — Order ${ref}`,
    body: emailWrap(`
      <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:12px;">Refund has been issued</h2>
      <p style="color:#4A5568;margin-bottom:20px;">A refund of <strong>$${Number(amount).toFixed(2)}</strong> has been issued to the buyer for Order ${ref}. This may affect your payout for this order. Please check your Builder Dashboard for details.</p>
      ${cta('View in Dashboard', APP_URL)}
    `)
  }),

  // ── ADMIN notifications ───────────────────────────────────────────────
  TRACKING_SUBMITTED_ADMIN: (order, ref) => ({
    subject: `[SC Admin] Tracking submitted — needs verification | Order ${ref}`,
    body: `<pre style="font-family:sans-serif;white-space:pre-wrap;">Order ${ref} tracking submitted and requires admin verification.\n\nBuilder: ${order.builder_name}\nBuyer: ${order.buyer_email}\nCarrier: ${order.tracking_carrier}\nTracking #: ${order.tracking_number}\n\nLogin to Admin Payouts to verify.</pre>`
  }),

  PAYMENT_RECEIVED_ADMIN: (order, ref) => ({
    subject: `[SC Admin] Payment received | Order ${ref}`,
    body: `<pre style="font-family:sans-serif;white-space:pre-wrap;">Payment received for order ${ref}.\n\nBuilder: ${order.builder_name}\nBuyer: ${order.buyer_email}\nAmount: $${(order.total_gross_amount || order.total_amount || 0).toLocaleString()}\nType: ${order.order_type}</pre>`
  }),

  DEPOSIT_PENDING_ADMIN: (order, ref) => ({
    subject: `[SC Admin] First-sale deposit awaiting approval | Order ${ref}`,
    body: `<pre style="font-family:sans-serif;white-space:pre-wrap;">First-sale custom build deposit received for order ${ref}. Admin approval required before build can be authorized.\n\nBuilder: ${order.builder_name}\nDeposit: $${(order.deposit_amount || 0).toLocaleString()}\n\nLogin to Admin Payouts to approve.</pre>`
  }),

  PAYOUT_READY_ADMIN: (order, ref, amount) => ({
    subject: `[SC Admin] Payout ready for release | Order ${ref}`,
    body: `<pre style="font-family:sans-serif;white-space:pre-wrap;">Payout is ready for release for order ${ref}.\n\nBuilder: ${order.builder_name}\nNet amount: $${Number(amount).toFixed(2)}\n\nLogin to Admin Payouts to release.</pre>`
  }),

  ISSUE_REPORTED_ADMIN: (order, ref, issueType) => ({
    subject: `[SC Admin] Buyer issue reported | Order ${ref}`,
    body: `<pre style="font-family:sans-serif;white-space:pre-wrap;">A buyer has reported an issue with order ${ref}.\n\nIssue type: ${issueType}\nBuyer: ${order.buyer_email}\nBuilder: ${order.builder_name}\n\nLogin to Admin Issues to review.</pre>`
  }),

  REFUND_INITIATED_ADMIN: (order, ref, amount) => ({
    subject: `[SC Admin] Refund initiated | Order ${ref}`,
    body: `<pre style="font-family:sans-serif;white-space:pre-wrap;">Refund of $${Number(amount).toFixed(2)} has been initiated for order ${ref}.\n\nBuyer: ${order.buyer_email}\nBuilder: ${order.builder_name}</pre>`
  }),

  BUYER_DEFAULT_ADMIN: (order, ref) => ({
    subject: `[SC Admin] Buyer default flagged | Order ${ref}`,
    body: `<pre style="font-family:sans-serif;white-space:pre-wrap;">Order ${ref} has been flagged for buyer default. Final payment has not been received.\n\nBuilder: ${order.builder_name}\nBuyer: ${order.buyer_email}\nFinal balance: $${(order.final_balance_amount || 0).toLocaleString()}\n\nLogin to Admin Payouts to review.</pre>`
  }),
};

// ─── Main handler ───────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { eventType, orderId, extra } = await req.json();

    if (!eventType || !orderId) {
      return Response.json({ error: 'eventType and orderId are required' }, { status: 400 });
    }

    const sb = base44.asServiceRole;
    const orders = await sb.entities.Order.filter({ id: orderId });
    if (!orders.length) return Response.json({ error: 'Order not found' }, { status: 404 });
    const order = orders[0];
    const ref = `#${order.id.slice(-8).toUpperCase()}`;

    // Fetch builder email if needed
    let builderEmail = null;
    if (order.builder_id) {
      const profiles = await sb.entities.UserProfile.filter({ id: order.builder_id });
      builderEmail = profiles[0]?.email || null;
    }

    const buyerEmail = order.buyer_email;
    const admins = await sb.entities.User.filter({ role: 'admin' });

    const sendTo = async (toEmail, templateKey, ...args) => {
      if (!toEmail) return;
      const tmpl = EMAIL_TEMPLATES[templateKey];
      if (!tmpl) return;
      const { subject, body } = tmpl(order, ref, ...args);
      await sb.integrations.Core.SendEmail({ from_name: 'Stringed Collective', to: toEmail, subject, body });
    };

    const sendToAdmins = async (templateKey, ...args) => {
      const tmpl = EMAIL_TEMPLATES[templateKey];
      if (!tmpl) return;
      for (const admin of admins) {
        if (admin.email) {
          const { subject, body } = tmpl(order, ref, ...args);
          await sb.integrations.Core.SendEmail({ from_name: 'Stringed Collective', to: admin.email, subject, body });
        }
      }
    };

    switch (eventType) {
      case 'PAYMENT_CONFIRMED':
        await sendTo(buyerEmail, 'PAYMENT_CONFIRMED_BUYER');
        await sendTo(builderEmail, 'NEW_ORDER_BUILDER');
        await sendToAdmins('PAYMENT_RECEIVED_ADMIN');
        break;

      case 'TRACKING_SUBMITTED':
        await sendTo(buyerEmail, 'TRACKING_SUBMITTED_BUYER');
        await sendToAdmins('TRACKING_SUBMITTED_ADMIN');
        break;

      case 'SHIPMENT_VERIFIED':
        await sendTo(buyerEmail, 'SHIPMENT_VERIFIED_BUYER');
        break;

      case 'DEPOSIT_APPROVED':
        await sendTo(builderEmail, 'DEPOSIT_APPROVED_BUILDER');
        break;

      case 'DEPOSIT_HELD':
        await sendTo(builderEmail, 'DEPOSIT_HELD_BUILDER');
        await sendToAdmins('DEPOSIT_PENDING_ADMIN');
        break;

      case 'PAYOUT_RELEASED':
        await sendTo(builderEmail, 'PAYOUT_RELEASED_BUILDER', extra?.amount || 0);
        await sendToAdmins('PAYOUT_READY_ADMIN', extra?.amount || 0);
        break;

      case 'PAYOUT_HELD':
        await sendTo(builderEmail, 'PAYOUT_HELD_BUILDER', extra?.reason || 'Under review');
        break;

      case 'ISSUE_REPORTED':
        await sendTo(buyerEmail, 'ISSUE_OPENED_BUYER');
        await sendTo(builderEmail, 'ISSUE_OPENED_BUILDER');
        await sendToAdmins('ISSUE_REPORTED_ADMIN', extra?.issueType || '');
        break;

      case 'REFUND_ISSUED':
        await sendTo(buyerEmail, 'REFUND_ISSUED_BUYER', extra?.amount || 0);
        await sendTo(builderEmail, 'REFUND_ISSUED_BUILDER', extra?.amount || 0);
        await sendToAdmins('REFUND_INITIATED_ADMIN', extra?.amount || 0);
        break;

      case 'DISPUTE_UPDATE':
        await sendTo(buyerEmail, 'DISPUTE_UPDATE_BUYER', extra?.status || '');
        break;

      case 'BUYER_DEFAULT':
        await sendToAdmins('BUYER_DEFAULT_ADMIN');
        break;

      default:
        return Response.json({ skipped: true, reason: `Unknown eventType: ${eventType}` });
    }

    return Response.json({ success: true, eventType, orderId });
  } catch (error) {
    console.error('sendOrderNotification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ─── Email helpers ───────────────────────────────────────────────────────────
function emailWrap(content) {
  return `<div style="font-family:'DM Sans',sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#FDFBF8;color:#1B2B4B;">
  <div style="margin-bottom:24px;">
    <span style="font-size:1.1rem;font-weight:700;letter-spacing:0.02em;">Stringed</span>
    <span style="font-size:1.1rem;font-weight:400;letter-spacing:0.1em;"> Collective</span>
  </div>
  ${content}
  <p style="color:#9CA3AF;font-size:0.8rem;margin-top:32px;border-top:1px solid #E5E7EB;padding-top:16px;">Questions? Visit your account on Stringed Collective or reply to this email.</p>
</div>`;
}

function infoBox(ref, detail) {
  return `<div style="background:#FEF3E2;border:1px solid #F6AD55;border-radius:8px;padding:16px;margin-bottom:24px;">
  <p style="margin:0;font-weight:600;color:#744210;">Order ${ref}</p>
  <p style="margin:4px 0 0;color:#744210;font-size:0.9rem;">${detail}</p>
</div>`;
}

function cta(label, url) {
  return `<p style="text-align:center;margin:28px 0;">
  <a href="${url}" style="background-color:#2F3E55;color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:700;font-size:0.95rem;display:inline-block;">${label}</a>
</p>`;
}