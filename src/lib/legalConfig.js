// Central source of truth for legal document configuration.
// URLs now point to the stable public routes served from the LegalDocument entity.

export const LEGAL_VERSIONS = {
  terms_of_use: "1.0",
  privacy_policy: "1.0",
  builder_terms: "1.0",
  buyer_terms: "1.0",
};

export const LEGAL_URLS = {
  terms_of_use:   "/legal/terms-of-use",
  privacy_policy: "/legal/privacy-policy",
  builder_terms:  "/legal/builder-terms",
  buyer_terms:    "/legal/buyer-terms",
};

export const LEGAL_LABELS = {
  terms_of_use:   "Terms of Use",
  privacy_policy: "Privacy Policy",
  builder_terms:  "Builder Terms",
  buyer_terms:    "Buyer Terms",
};

/**
 * Fetch the active version number for a document type from the database.
 * Falls back to the static LEGAL_VERSIONS constant if no record is found.
 */
export async function getActiveVersion(base44, docType) {
  try {
    const results = await base44.entities.LegalDocument.filter({ document_type: docType, status: "active" });
    if (results.length > 0) return results[0].version_number;
  } catch {}
  return LEGAL_VERSIONS[docType] || "1.0";
}

/**
 * Log a legal acceptance event to the LegalAcceptanceEvent entity
 * (the immutable audit trail read by /AdminAcceptanceAuditTrail).
 * Call this after the user submits the form containing the acceptance block.
 */
export async function logLegalAcceptance(base44, {
  user,
  agreementType,
  checkboxLabels,
  documentUrls,
  versions = {},
  sourceScreen,
  transactionId,
  orderId,
  sourceFlow,
}) {
  // Map the caller-facing agreement type to the LegalAcceptanceEvent enum
  const TYPE_MAP = {
    builder_account_creation:      { type: "builder_terms",                title: "Builder Terms",                 flow: "builder_onboarding" },
    buyer_account_creation:        { type: "buyer_terms",                  title: "Buyer Terms",                   flow: "signup" },
    builder_policy_confirmation:   { type: "builder_policy_confirmation",  title: "Builder Policy Confirmation",   flow: "builder_onboarding" },
    stock_build_checkout:          { type: "stock_order_terms",            title: "Stock Order Terms",             flow: "checkout" },
    custom_build_agreement:        { type: "custom_build_agreement",       title: "Custom Build Agreement",        flow: "custom_build_negotiation" },
    final_payment_authorization:   { type: "final_payment_authorization",  title: "Final Payment Authorization",   flow: "checkout" },
    deposit_authorization:         { type: "deposit_authorization",         title: "Deposit Authorization",        flow: "checkout" },
  };

  const mapped = TYPE_MAP[agreementType] || { type: agreementType, title: agreementType, flow: sourceFlow || "unknown" };

  // Pick the correct version field from the versions object
  const VERSION_KEY = {
    builder_terms: "builder_terms",
    buyer_terms: "buyer_terms",
    builder_policy_confirmation: "builder_policy_snapshot",
    stock_order_terms: "buyer_terms",
    custom_build_agreement: "custom_build_agreement",
    final_payment_authorization: "buyer_terms",
    deposit_authorization: "buyer_terms",
  }[mapped.type] || "terms_of_use";

  const agreementVersion = versions[VERSION_KEY] || LEGAL_VERSIONS[VERSION_KEY] || "1.0";

  const entry = {
    user_id: user.id,
    email_at_acceptance: user.email,
    role_at_acceptance: user.role || "user",
    agreement_type: mapped.type,
    agreement_title: mapped.title,
    agreement_version: agreementVersion,
    accepted_at_utc: new Date().toISOString(),
    acceptance_method: "click_checkbox",
    source_flow: sourceFlow || mapped.flow,
    source_screen: sourceScreen || "Unknown",
    user_agent: navigator.userAgent,
    transaction_id: transactionId || null,
    order_id: orderId || null,
    is_current_version: true,
    notes: checkboxLabels ? checkboxLabels.join("; ") : null,
  };

  await base44.entities.LegalAcceptanceEvent.create(entry);
}