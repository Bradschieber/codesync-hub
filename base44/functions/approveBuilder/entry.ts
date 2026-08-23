import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const APP_URL = 'https://stringed-collective.base44.app';

// Approves a builder storefront and sends them a notification email
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { builder_profile_id } = await req.json();
    if (!builder_profile_id) {
      return Response.json({ error: 'builder_profile_id is required' }, { status: 400 });
    }

    const sb = base44.asServiceRole;

    // Fetch the builder profile
    const profiles = await sb.entities.UserProfile.filter({ id: builder_profile_id });
    if (!profiles || profiles.length === 0) {
      return Response.json({ error: 'Builder profile not found' }, { status: 404 });
    }
    const builder = profiles[0];

    // Approve the storefront
    await sb.entities.UserProfile.update(builder_profile_id, { is_approved: true });

    // Send notification email (non-blocking - don't fail approval if email fails)
    if (builder.email) {
      try {
        const builderName = builder.first_name || builder.display_name || builder.business_name || 'there';
        const dashboardUrl = `${APP_URL}/Dashboard`;
        const storefrontUrl = `${APP_URL}/BuilderProfile?id=${builder.id}`;

        await sb.integrations.Core.SendEmail({
          from_name: 'Stringed Collective',
          to: builder.email,
          subject: 'Your storefront is approved and live on Stringed Collective',
          body: `<div style="font-family:'DM Sans',sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#FDFBF8;color:#1B2B4B;">
  <div style="margin-bottom:24px;">
    <span style="font-size:1.1rem;font-weight:700;letter-spacing:0.02em;">Stringed</span>
    <span style="font-size:1.1rem;font-weight:400;letter-spacing:0.1em;"> Collective</span>
  </div>
  <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:12px;">Your storefront is live ✓</h2>
  <p style="color:#4A5568;margin-bottom:12px;">Hi ${builderName},</p>
  <p style="color:#4A5568;margin-bottom:20px;">Great news - your builder storefront on Stringed Collective has been reviewed and approved. Your profile and instruments are now visible to buyers on the marketplace.</p>
  <p style="color:#4A5568;margin-bottom:20px;">Here's what you can do next:</p>
  <ul style="color:#4A5568;margin-bottom:24px;padding-left:20px;line-height:1.8;">
    <li>Make sure your storefront is complete with photos, bio, and instruments listed</li>
    <li>Connect your Stripe account if you haven't already, so you can receive payments</li>
    <li>Review your store policies to make sure they're up to date</li>
  </ul>
  <p style="text-align:center;margin:28px 0;">
    <a href="${dashboardUrl}" style="background-color:#1B2B4B;color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:700;font-size:0.95rem;display:inline-block;">Go to Builder Dashboard</a>
  </p>
  <p style="color:#4A5568;margin-bottom:12px;">You can also view your public storefront here:</p>
  <p style="margin-bottom:24px;">
    <a href="${storefrontUrl}" style="color:#1B2B4B;text-decoration:underline;">${storefrontUrl}</a>
  </p>
  <p style="color:#4A5568;margin-bottom:24px;">If you have any questions or need help getting set up, just reply to this email and we'll be happy to help.</p>
  <p style="color:#9CA3AF;font-size:0.8rem;margin-top:32px;border-top:1px solid #E5E7EB;padding-top:16px;">Questions? Visit your account on Stringed Collective or reply to this email.</p>
</div>`
        });
      } catch (emailErr) {
        console.error('approveBuilder: email send failed:', emailErr);
      }
    }

    return Response.json({ success: true, sent_email: !!builder.email });
  } catch (error) {
    console.error('approveBuilder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});