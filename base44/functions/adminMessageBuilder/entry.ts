import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const body = await req.json();
    const { builder_id, subject, message } = body;

    if (!builder_id || !subject || !message) {
      return Response.json({ error: 'builder_id, subject, and message are required' }, { status: 400 });
    }

    // Fetch the builder profile to get their email
    const builder = await base44.asServiceRole.entities.UserProfile.get(builder_id);
    if (!builder || !builder.email) {
      return Response.json({ error: 'Builder email not found' }, { status: 404 });
    }

    // Send the email with Brad as the sender name
    const emailBody = `${message}

--
Brad
Stringed Collective
brad@stringedcollective.com`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: builder.email,
      subject: subject,
      body: emailBody,
      from_name: 'Brad at Stringed Collective'
    });

    // Log to audit trail
    await base44.asServiceRole.entities.AuditLog.create({
      event_type: 'ADMIN_MESSAGE_BUILDER',
      entity_type: 'UserProfile',
      entity_id: builder_id,
      actor_user_id: user.id,
      actor_role: 'admin',
      details_json: { subject, recipient_email: builder.email }
    });

    return Response.json({ success: true, sent_to: builder.email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}