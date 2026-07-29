/**
 * Centralized analytics tracking for Stringed Collective.
 * Organized into two categories: Buyer Activity and Builder Activity.
 *
 * Usage:
 *   import { track } from '@/lib/analytics';
 *   track.buyer.addToCart({ product_id, builder_id, price });
 *
 * Or for raw events:
 *   import { base44 } from '@/api/base44Client';
 *   base44.analytics.track({ eventName: '...', properties: {...} });
 */
import { base44 } from '@/api/base44Client';

function safeTrack(eventName, properties = {}) {
  try {
    base44.analytics.track({ eventName, properties });
  } catch (e) {
    // Silently ignore analytics failures - never break user flow
  }
}

export const track = {
  /* ----------------------- BUYER ACTIVITY ----------------------- */
  buyer: {
    // Buyer funnel
    addToCart: (props = {}) => safeTrack('buyer_add_to_cart', props),
    checkoutStarted: (props = {}) => safeTrack('buyer_checkout_started', props),
    messageBuilder: (props = {}) => safeTrack('buyer_message_builder', props),

    // Builder discovery & trust
    viewBuilderProfile: (props = {}) => safeTrack('buyer_view_builder_profile', props),

    // Custom build funnel
    customBuildRequestSubmitted: (props = {}) => safeTrack('buyer_custom_build_request_submitted', props),
    customBuildDepositPaid: (props = {}) => safeTrack('buyer_custom_build_deposit_paid', props),
    customBuildFinalPaymentPaid: (props = {}) => safeTrack('buyer_custom_build_final_payment_paid', props),

    // Content engagement (From The Bench)
    followThisBuild: (props = {}) => safeTrack('buyer_follow_this_build', props),
    fromTheBenchPostOpened: (props = {}) => safeTrack('buyer_from_the_bench_post_opened', props),

    // Catalog behavior
    catalogFilterApplied: (props = {}) => safeTrack('buyer_catalog_filter_applied', props),
    catalogSearch: (props = {}) => safeTrack('buyer_catalog_search', props),
  },

  /* ----------------------- BUILDER ACTIVITY ----------------------- */
  builder: {
    // Acquisition & setup
    becomeFoundingBuilder: (props = {}) => safeTrack('builder_become_founding_builder_clicked', props),
    onboardingCompleted: (props = {}) => safeTrack('builder_onboarding_completed', props),

    // Catalog management
    listingPublished: (props = {}) => safeTrack('builder_listing_published', props),
  },
};

export default track;