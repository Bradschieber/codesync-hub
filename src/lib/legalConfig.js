// Central source of truth for all legal document URLs and versions.
// Update the version strings here whenever a document changes.

export const LEGAL_VERSIONS = {
  terms_of_use: "1.0",
  privacy_policy: "1.0",
  builder_terms: "1.0",
  buyer_terms: "1.0",
};

export const LEGAL_URLS = {
  terms_of_use: "/Terms",
  privacy_policy: "/Terms#privacy",
  builder_terms: "/Terms#builder-terms",
  buyer_terms: "/Terms#buyer-terms",
};

export const LEGAL_LABELS = {
  terms_of_use: "Terms of Use",
  privacy_policy: "Privacy Policy",
  builder_terms: "Builder Terms",
  buyer_terms: "Buyer Terms",
};

/**
 * Log a legal acceptance event to the LegalAgreement entity.
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
}) {
  const entry = {
    user_id: user.id,
    user_email: user.email,
    role: user.role || "user",
    agreement_type: agreementType,
    checkbox_labels_accepted: checkboxLabels,
    document_urls: documentUrls,
    terms_of_use_version: versions.terms_of_use || LEGAL_VERSIONS.terms_of_use,
    privacy_policy_version: versions.privacy_policy || LEGAL_VERSIONS.privacy_policy,
    builder_terms_version: versions.builder_terms || LEGAL_VERSIONS.builder_terms,
    buyer_terms_version: versions.buyer_terms || LEGAL_VERSIONS.buyer_terms,
    builder_policy_snapshot_version: versions.builder_policy_snapshot,
    custom_build_agreement_version: versions.custom_build_agreement,
    source_screen: sourceScreen,
    transaction_id: transactionId,
    order_id: orderId,
    user_agent: navigator.userAgent,
    accepted_at: new Date().toISOString(),
  };

  await base44.entities.LegalAgreement.create(entry);
}