import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // Only handle create events
    if (payload?.event?.type !== 'create') {
      return Response.json({ skipped: true });
    }

    const message = payload.data;
    if (!message || !message.recipient_id) {
      return Response.json({ skipped: true });
    }

    // Find the recipient's profile
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ id: message.recipient_id });
    if (!profiles || profiles.length === 0) {
      return Response.json({ error: 'Recipient profile not found' }, { status: 404 });
    }
    const profile = profiles[0];

    const senderName = message.sender_name || 'Someone';
    const subject = message.subject || 'a new message';
    const results = { email: null, sms: null };

    // Send email notification
    if (profile.notify_email !== false && profile.email) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: profile.email,
        subject: `New Message: "${subject}"`,
        body: `Hi ${profile.first_name || profile.display_name || 'Builder'},\n\n${senderName} sent you a new message on Stringed Collective:\n\nSubject: "${subject}"\n\nLog in to your dashboard to read and reply.\n\n— Stringed Collective`,
      });
      results.email = 'sent';
    }

    // Send SMS notification via Twilio
    if (profile.notify_sms && profile.notification_phone) {
      const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

      const twilioRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: fromNumber,
            To: profile.notification_phone,
            Body: `Stringed Collective: ${senderName} sent you a new message: "${subject}". Log in to reply.`,
          }),
        }
      );
      const twilioData = await twilioRes.json();
      results.sms = twilioData.sid ? 'sent' : twilioData.message;
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});