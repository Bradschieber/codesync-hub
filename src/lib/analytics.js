/**
 * Centralized analytics tracking for Stringed Collective.
 * Organized into two categories: Buyer Activity and Builder Activity.
 *
 * Each tracked event is:
 *   1. Sent to the Base44 platform analytics dashboard (Dashboard > Analytics)
 *   2. Persisted as an AnalyticsEvent record so admins can view it in-app
 *
 * Usage:
 *   import { track } from '@/lib/analytics';
 *   track.buyer.addToCart({ product_id, builder_id, price });
 */
import { base44 } from '@/api/base44Client';

const EVENT_META = {
  // ----------------------- BUYER ACTIVITY -----------------------
  buyer_add_to_cart: { category: 'buyer', label: 'Add to Cart' },
  buyer_checkout_started: { category: 'buyer', label: 'Checkout Started' },
  buyer_message_builder: { category: 'buyer', label: 'Message Builder' },
  buyer_view_builder_profile: { category: 'buyer', label: 'View Builder Profile' },
  buyer_custom_build_request_submitted: { category: 'buyer', label: 'Custom Build Request' },
  buyer_custom_build_deposit_paid: { category: 'buyer', label: 'Custom Build Deposit Paid' },
  buyer_custom_build_final_payment_paid: { category: 'buyer', label: 'Custom Build Final Payment' },
  buyer_follow_this_build: { category: 'buyer', label: 'Follow This Build' },
  buyer_from_the_bench_post_opened: { category: 'buyer', label: 'From The Bench Post Opened' },
  buyer_catalog_filter_applied: { category: 'buyer', label: 'Catalog Filter Applied' },
  buyer_catalog_search: { category: 'buyer', label: 'Catalog Search' },

  // ----------------------- BUILDER ACTIVITY -----------------------
  builder_become_founding_builder_clicked: { category: 'builder', label: 'Become a Builder Clicked' },
  builder_onboarding_completed: { category: 'builder', label: 'Onboarding Completed' },
  builder_listing_published: { category: 'builder', label: 'Listing Published' },
};

function record(eventName, properties = {}) {
  const meta = EVENT_META[eventName];
  if (!meta) return;

  // 1. Platform analytics dashboard
  try { base44.analytics.track({ eventName, properties }); } catch (e) { /* ignore */ }

  // 2. Persist to AnalyticsEvent for in-app admin dashboard (fire-and-forget)
  try {
    base44.entities.AnalyticsEvent.create({
      event_name: eventName,
      category: meta.category,
      label: meta.label,
      properties,
    });
  } catch (e) { /* ignore - never break user flow */ }
}

export const track = {
  /* ----------------------- BUYER ACTIVITY ----------------------- */
  buyer: {
    addToCart: (props = {}) => record('buyer_add_to_cart', props),
    checkoutStarted: (props = {}) => record('buyer_checkout_started', props),
    messageBuilder: (props = {}) => record('buyer_message_builder', props),
    viewBuilderProfile: (props = {}) => record('buyer_view_builder_profile', props),
    customBuildRequestSubmitted: (props = {}) => record('buyer_custom_build_request_submitted', props),
    customBuildDepositPaid: (props = {}) => record('buyer_custom_build_deposit_paid', props),
    customBuildFinalPaymentPaid: (props = {}) => record('buyer_custom_build_final_payment_paid', props),
    followThisBuild: (props = {}) => record('buyer_follow_this_build', props),
    fromTheBenchPostOpened: (props = {}) => record('buyer_from_the_bench_post_opened', props),
    catalogFilterApplied: (props = {}) => record('buyer_catalog_filter_applied', props),
    catalogSearch: (props = {}) => record('buyer_catalog_search', props),
  },

  /* ----------------------- BUILDER ACTIVITY ----------------------- */
  builder: {
    becomeFoundingBuilder: (props = {}) => record('builder_become_founding_builder_clicked', props),
    onboardingCompleted: (props = {}) => record('builder_onboarding_completed', props),
    listingPublished: (props = {}) => record('builder_listing_published', props),
  },
};

export default track;