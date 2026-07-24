import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), { apiVersion: '2023-10-16' });

  const { return_url } = await req.json();
  const baseUrl = return_url || 'https://app.base44.com';

  // Look up the builder's UserProfile (using service role to bypass user-level validation)
  const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: user.id });
  if (!profiles.length) return Response.json({ error: 'UserProfile not found' }, { status: 404 });
  const profile = profiles[0];

  let stripeAccountId = profile.stripe_account_id;

  // Create a new Connect account if none exists
  if (!stripeAccountId) {
    // Phase 2: Map builder's country to ISO code for international support
    const COUNTRY_LABEL_TO_CODE = {
      'United States': 'US', 'Canada': 'CA', 'United Kingdom': 'GB',
      'Australia': 'AU', 'New Zealand': 'NZ', 'Japan': 'JP', 'Singapore': 'SG',
      'Austria': 'AT', 'Belgium': 'BE', 'Bulgaria': 'BG', 'Croatia': 'HR',
      'Cyprus': 'CY', 'Czech Republic': 'CZ', 'Denmark': 'DK', 'Estonia': 'EE',
      'Finland': 'FI', 'France': 'FR', 'Germany': 'DE', 'Greece': 'GR',
      'Hungary': 'HU', 'Ireland': 'IE', 'Italy': 'IT', 'Latvia': 'LV',
      'Lithuania': 'LT', 'Luxembourg': 'LU', 'Malta': 'MT', 'Netherlands': 'NL',
      'Poland': 'PL', 'Portugal': 'PT', 'Romania': 'RO', 'Slovakia': 'SK',
      'Slovenia': 'SI', 'Spain': 'ES', 'Sweden': 'SE',
    };
    const builderCountry = COUNTRY_LABEL_TO_CODE[profile.business_country] || 'US';

    const account = await stripe.accounts.create({
      type: 'custom',
      country: builderCountry,
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: { builder_profile_id: profile.id, user_id: user.id },
    });
    stripeAccountId = account.id;

    // Sanitize warranty_coverage if it contains plain strings instead of objects
    const updateData = {
      stripe_account_id: stripeAccountId,
      stripe_onboarding_status: 'in_progress',
    };
    if (Array.isArray(profile.warranty_coverage) && profile.warranty_coverage.length > 0 && typeof profile.warranty_coverage[0] === 'string') {
      updateData.warranty_coverage = profile.warranty_coverage.map(label => ({ label, duration: '' }));
    }
    await base44.asServiceRole.entities.UserProfile.update(profile.id, updateData);
  }

  // Create account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${baseUrl}/Dashboard?stripe_refresh=1`,
    return_url: `${baseUrl}/Dashboard?stripe_return=1`,
    type: 'account_onboarding',
  });

  return Response.json({ url: accountLink.url, stripe_account_id: stripeAccountId });
});