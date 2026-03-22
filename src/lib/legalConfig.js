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