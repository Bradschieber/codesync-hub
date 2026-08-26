import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

import { APP_URL } from '../../shared/appUrl.js';
const ONBOARDING_URL = `${APP_URL}/BuilderOnboarding`;
const QUICK_START_URL = `${APP_URL}/BuilderQuickStartGuide`;

// Reminder thresholds (hours since last activity), processed sequentially
const REMINDER_CONFIG = [
  { reminder: 1, hours: 24 },   // first reminder: 24h
  { reminder: 2, hours: 72 },   // second reminder: 72h (3 days)
  { reminder: 3, hours: 168 },  // final reminder: 168h (1 week)
];

const STEP_LABELS = [
  'Your Shop', 'Your Story', 'Show Your Craft', 'Your Business',
  'Shop Policies', 'References', 'Payments', 'Next Steps',
];

function getStepName(profile) {
  if (profile.onboarding_step_name) return profile.onboarding_step_name;
  if (typeof profile.onboarding_step === 'number' && STEP_LABELS[profile.onboarding_step]) {
    return STEP_LABELS[profile.onboarding_step];
  }
  return 'Your Shop';
}

function getStepNumber(profile) {
  const idx = typeof profile.onboarding_step === 'number' ? profile.onboarding_step : 0;
  return idx + 1;
}

function hoursSince(dateStr) {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return (now - then) / (1000 * 60 * 60);
}

function buildEmail(profile, reminderNum) {
  const stepName = getStepName(profile);
  const stepNum = getStepNumber(profile);
  const firstName = profile.first_name || profile.display_name || 'there';

  const subject =
    reminderNum === 1 ? `Your storefront is almost ready, ${firstName}`
    : reminderNum === 2 ? `Still thinking it over? Your builder profile is saved`
    : `Last reminder: your Stringed Collective profile`;

  const intro =
    reminderNum === 1
      ? `We noticed you started setting up your builder storefront but haven't finished yet. You're on <strong>Step ${stepNum} of 8 — ${stepName}</strong>. You're closer than you think!`
      : reminderNum === 2
      ? `Just a friendly nudge — your builder profile is saved and waiting. You left off on <strong>Step ${stepNum} of 8 — ${stepName}</strong>. If you hit a snag or have questions, we're here to help.`
      : `This is our last reminder about your builder profile. You're on <strong>Step ${stepNum} of 8 — ${stepName}</strong>. Your progress is saved, and you can pick up right where you left off anytime. We'd love to have you in the Collective.`;

  const body = `<div style="font-family:'DM Sans',sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#FDFBF8;color:#1B2B4B;">
  <div style="margin-bottom:24px;">
    <span style="font-size:1.1rem;font-weight:700;letter-spacing:0.02em;">Stringed</span>
    <span style="font-size:1.1rem;font-weight:400;letter-spacing:0.1em;"> Collective</span>
  </div>
  <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:12px;">Hi ${firstName},</h2>
  <p style="color:#4A5568;margin-bottom:20px;line-height:1.6;">${intro}</p>
  <p style="color:#4A5568;margin-bottom:24px;">Most builders finish in under 30 minutes, and your progress is saved automatically — so just pick up where you left off.</p>
  <p style="text-align:center;margin:28px 0;">
    <a href="${ONBOARDING_URL}" style="background-color:#2F3E55;color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:700;font-size:0.95rem;display:inline-block;">Continue Your Onboarding</a>
  </p>
  <p style="color:#9CA3AF;font-size:0.85rem;margin-top:20px;">
    Need a hand? Check out our <a href="${QUICK_START_URL}" style="color:#2F3E55;">Builder Quick Start Guide</a> for step-by-step help.
  </p>
  <p style="color:#9CA3AF;font-size:0.8rem;margin-top:32px;border-top:1px solid #E5E7EB;padding-top:16px;">You're receiving this because you started a builder profile on Stringed Collective but haven't completed it yet. If you no longer wish to receive these reminders, you can reply to this email.</p>
</div>`;

  return { subject, body };
}

function buildSms(profile, reminderNum) {
  const stepName = getStepName(profile);
  const stepNum = getStepNumber(profile);
  const firstName = profile.first_name || profile.display_name || 'there';

  if (reminderNum === 1) {
    return `Hi ${firstName}, it's Stringed Collective. You're on Step ${stepNum} of 8 (${stepName}) of your builder profile. Pick up where you left off: ${ONBOARDING_URL} Reply STOP to opt out.`;
  }
  if (reminderNum === 2) {
    return `Hi ${firstName}, friendly reminder from Stringed Collective. Your builder profile is saved on Step ${stepNum} of 8 (${stepName}). Continue here: ${ONBOARDING_URL} Reply STOP to opt out.`;
  }
  return `Hi ${firstName}, this is our last reminder about your Stringed Collective builder profile (Step ${stepNum} of 8 — ${stepName}). Your progress is saved — pick up anytime: ${ONBOARDING_URL} Reply STOP to opt out.`;
}

async function sendSms(phone, text) {
  const accountSid = secrets.get('TWILIO_ACCOUNT_SID');
  const authToken = secrets.get('TWILIO_AUTH_TOKEN');
  const fromPhone = secrets.get('TWILIO_PHONE_NUMBER');
  if (!accountSid || !authToken || !fromPhone) {
    console.error('Twilio credentials not fully configured — skipping SMS');
    return false;
  }
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const auth = btoa(`${accountSid}:${authToken}`);
  const body = new URLSearchParams({ From: fromPhone, To: phone, Body: text });
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
    console.error('Twilio SMS failed:', errText);
    return false;
  }
  return true;
}

async function processBuilder(sb, profile) {
  // Re-check at send time: skip if onboarding is now complete
  if (profile.onboarding_completed_at) {
    return { builder_id: profile.id, action: 'skipped_completed' };
  }

  // Skip if no last activity timestamp (never started onboarding flow)
  if (!profile.onboarding_last_activity_at) {
    return { builder_id: profile.id, action: 'skipped_no_activity' };
  }

  const remindersSent = profile.onboarding_reminders_sent || 0;

  // Permanent stop after 3 reminders
  if (remindersSent >= 3) {
    return { builder_id: profile.id, action: 'skipped_max_reminders' };
  }

  const hoursElapsed = hoursSince(profile.onboarding_last_activity_at);

  // Determine which reminder is due (sequential — can't skip ahead)
  let dueReminder = null;
  if (remindersSent === 0 && hoursElapsed >= 24) {
    dueReminder = 1;
  } else if (remindersSent === 1 && hoursElapsed >= 72) {
    dueReminder = 2;
  } else if (remindersSent === 2 && hoursElapsed >= 168) {
    dueReminder = 3;
  }

  if (!dueReminder) {
    return {
      builder_id: profile.id,
      action: 'skipped_not_due',
      reminders_sent: remindersSent,
      hours_elapsed: Math.round(hoursElapsed),
    };
  }

  // Respect notification preferences from Step 4
  const wantEmail = profile.notify_email !== false; // default true
  const wantSms = profile.notify_sms === true && !!profile.notification_phone;

  const channels = {};

  // Send email
  if (wantEmail && profile.email) {
    const { subject, body } = buildEmail(profile, dueReminder);
    try {
      await sb.integrations.Core.SendEmail({
        from_name: 'Stringed Collective',
        to: profile.email,
        subject,
        body,
      });
      channels.email = 'sent';
    } catch (e) {
      channels.email = `failed: ${e.message}`;
    }
  }

  // Send SMS (only if consent given in Step 4)
  if (wantSms) {
    const smsText = buildSms(profile, dueReminder);
    const ok = await sendSms(profile.notification_phone, smsText);
    channels.sms = ok ? 'sent' : 'failed';
  }

  // Update reminder counter so this reminder isn't sent again
  await sb.entities.UserProfile.update(profile.id, { onboarding_reminders_sent: dueReminder });

  return {
    builder_id: profile.id,
    action: 'sent',
    reminder: dueReminder,
    step_name: getStepName(profile),
    step_number: getStepNumber(profile),
    channels,
  };
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const sb = base44.asServiceRole;

    const payload = await req.json().catch(() => ({}));

    // ── Manual trigger: process a single builder by ID (for testing) ──
    if (payload?.builder_id) {
      const profiles = await sb.entities.UserProfile.filter({ id: payload.builder_id });
      if (!profiles || profiles.length === 0) {
        return Response.json({ error: 'Builder profile not found' }, { status: 404 });
      }
      const result = await processBuilder(sb, profiles[0]);
      return Response.json({ mode: 'single', result });
    }

    // ── Scheduled run: scan all sellers who started but haven't finished ──
    const allSellers = await sb.entities.UserProfile.filter(
      { is_seller: true },
      '-updated_date',
      500
    );

    // In-code filter: has onboarding activity AND hasn't completed
    const incomplete = allSellers.filter(
      p => p.onboarding_last_activity_at && !p.onboarding_completed_at
    );

    const results = [];
    for (const profile of incomplete) {
      try {
        const result = await processBuilder(sb, profile);
        results.push(result);
      } catch (e) {
        results.push({ builder_id: profile.id, action: 'error', error: e.message });
      }
    }

    const sent = results.filter(r => r.action === 'sent');
    const skipped = results.filter(r => r.action.startsWith('skipped'));
    const errors = results.filter(r => r.action === 'error');

    return Response.json({
      mode: 'scheduled',
      total_scanned: incomplete.length,
      sent: sent.length,
      skipped: skipped.length,
      errors: errors.length,
      details: results,
    });
  } catch (error) {
    console.error('sendOnboardingReminder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}