import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const APP_URL = 'https://stringed-collective.base44.app';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // Only handle create events
    if (payload?.event?.type !== 'create') {
      return Response.json({ skipped: true });
    }

    const request = payload.data;
    if (!request || !request.builder_id) {
      return Response.json({ skipped: true, reason: 'No request data or builder_id' });
    }

    const sb = base44.asServiceRole;

    // Look up the builder's profile to get their email
    const profiles = await sb.entities.UserProfile.filter({ id: request.builder_id });
    if (!profiles || profiles.length === 0) {
      return Response.json({ error: 'Builder profile not found' }, { status: 404 });
    }
    const builder = profiles[0];

    const builderEmail = builder.email;
    if (!builderEmail) {
      return Response.json({ skipped: true, reason: 'Builder has no email on profile' });
    }

    const customerName = request.customer_name || 'A customer';
    const buildType = request.build_type || 'instrument';
    const dashboardUrl = `${APP_URL}/Dashboard`;

    await sb.integrations.Core.SendEmail({
      from_name: 'Stringed Collective',
      to: builderEmail,
      subject: `New custom build request from ${customerName}`,
      body: `<div style="font-family:'DM Sans',sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#FDFBF8;color:#1B2B4B;">
  <div style="margin-bottom:24px;">
    <span style="font-size:1.1rem;font-weight:700;letter-spacing:0.02em;">Stringed</span>
    <span style="font-size:1.1rem;font-weight:400;letter-spacing:0.1em;"> Collective</span>
  </div>
  <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:12px;">New Custom Build Request 🎸</h2>
  <p style="color:#4A5568;margin-bottom:12px;">Hi ${builder.first_name || builder.display_name || 'there'},</p>
  <p style="color:#4A5568;margin-bottom:20px;"><strong>${customerName}</strong> has submitted a custom build request for a <strong>${buildType}</strong>.</p>
  ${request.description ? `<div style="background:#F7F6F3;border:1px solid #E3E0D8;border-radius:8px;padding:16px;margin-bottom:20px;"><p style="margin:0;color:#4A5568;font-style:italic;">"${request.description}"</p></div>` : ''}
  ${request.budget_range ? `<p style="color:#4A5568;margin-bottom:12px;">Budget range: <strong>${request.budget_range}</strong></p>` : ''}
  <p style="color:#4A5568;margin-bottom:24px;">Log in to your Builder Dashboard to review the full request and respond.</p>
  <p style="text-align:center;margin:28px 0;">
    <a href="${dashboardUrl}" style="background-color:#2F3E55;color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:700;font-size:0.95rem;display:inline-block;">View Request in Dashboard</a>
  </p>
  <p style="color:#9CA3AF;font-size:0.8rem;margin-top:32px;border-top:1px solid #E5E7EB;padding-top:16px;">Questions? Visit your account on Stringed Collective or reply to this email.</p>
</div>`
    });

    return Response.json({ success: true, sent_to: builderEmail });
  } catch (error) {
    console.error('notifyBuilderNewRequest error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});