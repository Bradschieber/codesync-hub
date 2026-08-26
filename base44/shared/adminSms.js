import { secrets } from 'base44:runtime';

/**
 * Sends an SMS to the site admin via Twilio.
 * Reusable across backend functions for any important site event.
 * @param {string} text  The message body (keep under 1600 chars).
 * @returns {Promise<boolean>} true if sent successfully, false otherwise.
 */
export async function sendAdminSms(text) {
  const accountSid = secrets.get('TWILIO_ACCOUNT_SID');
  const authToken = secrets.get('TWILIO_AUTH_TOKEN');
  const fromPhone = secrets.get('TWILIO_PHONE_NUMBER');
  const toPhone = secrets.get('ADMIN_PHONE_NUMBER');

  if (!accountSid || !authToken || !fromPhone || !toPhone) {
    console.error('Admin SMS not fully configured — missing Twilio or ADMIN_PHONE_NUMBER credentials');
    return false;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const auth = btoa(`${accountSid}:${authToken}`);
  const body = new URLSearchParams({ From: fromPhone, To: toPhone, Body: text });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Admin SMS failed:', errText);
    return false;
  }
  return true;
}