import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const APP_URL = "https://app.base44.com";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { formId } = await req.json();
    const sb = base44.asServiceRole;

    const forms = await sb.entities.CustomBuildOrderForm.filter({ id: formId });
    if (!forms.length) return Response.json({ error: 'Order form not found' }, { status: 404 });
    const form = forms[0];

    // Verify the user is the buyer
    if (form.buyer_id !== user.id && form.buyer_email !== user.email) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (form.status !== 'sent') {
      return Response.json({ error: 'This order form is not in a reviewable state.' }, { status: 400 });
    }

    // Check if this builder has completed a first sale
    const builderProfiles = await sb.entities.UserProfile.filter({ id: form.builder_id });
    const builder = builderProfiles[0];
    const isFirstCustomBuild = !builder?.is_first_sale_completed;

    // Create the Order
    const order = await sb.entities.Order.create({
      user_id: user.id,
      buyer_email: user.email,
      buyer_name: user.full_name,
      builder_id: form.builder_id,
      builder_name: form.builder_name,
      order_type: 'custom',
      current_status: 'agreement_pending',
      fulfillment_status: 'order_received',
      payout_status: 'pending',
      status: 'pending',
      total_amount: form.total_price,
      total_gross_amount: form.total_price,
      deposit_amount: form.deposit_amount,
      final_balance_amount: form.final_balance,
      platform_fee_percent: 0.05,
      items: [{
        product_name: form.title || 'Custom Build',
        product_price: form.total_price,
        builder_name: form.builder_name,
        product_image: '',
      }],
      custom_build_specs: form.specifications || {},
      is_first_transaction: isFirstCustomBuild,
      is_first_custom_build: isFirstCustomBuild,
    });

    // Update order form
    await sb.entities.CustomBuildOrderForm.update(formId, {
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      linked_order_id: order.id,
    });

    // Update request
    if (form.custom_build_request_id) {
      await sb.entities.CustomBuildRequest.update(form.custom_build_request_id, {
        status: 'converted_to_order',
      });
    }

    // Notify builder
    if (builder?.email) {
      await sb.integrations.Core.SendEmail({
        from_name: 'Stringed Collective',
        to: builder.email,
        subject: `Order Form accepted — ${user.full_name} is ready to proceed`,
        body: `
<div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #FDFBF8; color: #1B2B4B;">
  <div style="margin-bottom: 24px;">
    <span style="font-size: 1.1rem; font-weight: 700; letter-spacing: 0.02em;">Stringed</span>
    <span style="font-size: 1.1rem; font-weight: 400; letter-spacing: 0.1em;"> Collective</span>
  </div>
  <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 12px;">Order Form Accepted ✓</h2>
  <p style="color: #4A5568; margin-bottom: 12px;"><strong>${user.full_name}</strong> has accepted your Custom Build Order Form.</p>
  <p style="color: #4A5568; margin-bottom: 12px;">A custom order has been created. The buyer will now review the Purchase Agreement and pay their deposit to authorize the build.</p>
  <div style="background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
    <p style="margin: 0; font-weight: 600; color: #166534;">Order #${order.id.slice(-8).toUpperCase()} — Awaiting Buyer Agreement</p>
    <p style="margin: 4px 0 0; font-size: 0.85rem; color: #166534;">Total: $${(form.total_price || 0).toLocaleString()} | Deposit: $${(form.deposit_amount || 0).toLocaleString()}</p>
  </div>
  <p style="text-align: center; margin: 28px 0;">
    <a href="${APP_URL}/BuilderOrders" style="background-color: #1B2B4B; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 0.95rem; display: inline-block;">View in Dashboard</a>
  </p>
  <p style="color: #9CA3AF; font-size: 0.8rem; margin-top: 32px; border-top: 1px solid #E5E7EB; padding-top: 16px;">— The Stringed Collective Team</p>
</div>`
      });
    }

    // Notify admins
    const admins = await sb.entities.User.filter({ role: 'admin' });
    for (const admin of admins) {
      if (admin.email) {
        await sb.integrations.Core.SendEmail({
          from_name: 'Stringed Collective Admin',
          to: admin.email,
          subject: `[SC] Custom Build Order Form accepted — Order created | ${order.id.slice(-8).toUpperCase()}`,
          body: `<pre style="font-family: sans-serif; white-space: pre-wrap;">Custom order created from Order Form acceptance.\n\nOrder ID: ${order.id}\nBuilder: ${form.builder_name}\nBuyer: ${user.full_name} (${user.email})\nTotal: $${(form.total_price || 0).toLocaleString()}\nDeposit: $${(form.deposit_amount || 0).toLocaleString()}\nIs First Build: ${isFirstCustomBuild}</pre>`
        });
      }
    }

    return Response.json({ success: true, orderId: order.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});