import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), { apiVersion: '2023-10-16' });
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;
  event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

  if (event.type !== 'account.updated') {
    return Response.json({ received: true });
  }

  const account = event.data.object;
  const stripeAccountId = account.id;

  const base44 = createClientFromRequest(req);

  // Find the builder profile by stripe_account_id
  const profiles = await base44.asServiceRole.entities.UserProfile.filter({ stripe_account_id: stripeAccountId });
  if (!profiles.length) {
    return Response.json({ received: true, note: 'No matching profile found' });
  }

  const profile = profiles[0];
  const chargesEnabled = account.charges_enabled || false;
  const payoutsEnabled = account.payouts_enabled || false;

  let onboardingStatus = 'in_progress';
  if (chargesEnabled && payoutsEnabled) {
    onboardingStatus = 'complete';
  } else if (account.requirements?.pending_verification?.length > 0) {
    onboardingStatus = 'pending_verification';
  }

  await base44.asServiceRole.entities.UserProfile.update(profile.id, {
    stripe_payouts_enabled: payoutsEnabled,
    stripe_charges_enabled: chargesEnabled,
    stripe_onboarding_status: onboardingStatus,
  });

  // Audit log
  await base44.asServiceRole.entities.AuditLog.create({
    event_type: 'STRIPE_ACCOUNT_UPDATED',
    entity_type: 'UserProfile',
    entity_id: profile.id,
    actor_role: 'system',
    stripe_event_id: event.id,
    details_json: {
      charges_enabled: chargesEnabled,
      payouts_enabled: payoutsEnabled,
      onboarding_status: onboardingStatus,
    },
  });

  return Response.json({ received: true });
});