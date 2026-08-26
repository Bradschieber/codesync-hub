import { sendAdminSms } from '../../shared/adminSms.js';

const APP_URL = 'https://stringed-collective.base44.app';
const ADMIN_BUILDERS_URL = `${APP_URL}/AdminAllBuilders`;

/**
 * Triggered by an entity automation when a new UserProfile is created
 * with is_seller === true. Sends the admin an SMS alert.
 *
 * Payload (entity automation): { event, data: <UserProfile> }
 */
export default async function(req) {
  try {
    const payload = await req.json().catch(() => ({}));
    const profile = payload?.data;
    const event = payload?.event;

    if (!profile) {
      return Response.json({ error: 'No profile data in payload' }, { status: 400 });
    }

    const builderName =
      profile.business_name ||
      profile.display_name ||
      [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
      'New builder';
    const email = profile.email || 'no email on file';

    const message =
      `Stringed Collective: New builder profile created — ${builderName} (${email}). ` +
      `Review in admin: ${ADMIN_BUILDERS_URL}`;

    const sent = await sendAdminSms(message);

    return Response.json({
      event,
      sent,
      builder_id: profile.id,
      builder_name: builderName,
    });
  } catch (error) {
    console.error('notifyAdminNewBuilder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}