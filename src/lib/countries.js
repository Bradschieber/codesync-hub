// Shared country allowlist for Phase 2 internationalization.
// Used by Checkout (buyer shipping), Builder Onboarding (business address),
// and calculateTax (validation). Single source of truth.

export const ALLOWED_COUNTRIES = [
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
  { code: "GB", label: "United Kingdom" },
  { code: "AU", label: "Australia" },
  { code: "NZ", label: "New Zealand" },
  { code: "JP", label: "Japan" },
  { code: "SG", label: "Singapore" },
  // European Union member states
  { code: "AT", label: "Austria" },
  { code: "BE", label: "Belgium" },
  { code: "BG", label: "Bulgaria" },
  { code: "HR", label: "Croatia" },
  { code: "CY", label: "Cyprus" },
  { code: "CZ", label: "Czech Republic" },
  { code: "DK", label: "Denmark" },
  { code: "EE", label: "Estonia" },
  { code: "FI", label: "Finland" },
  { code: "FR", label: "France" },
  { code: "DE", label: "Germany" },
  { code: "GR", label: "Greece" },
  { code: "HU", label: "Hungary" },
  { code: "IE", label: "Ireland" },
  { code: "IT", label: "Italy" },
  { code: "LV", label: "Latvia" },
  { code: "LT", label: "Lithuania" },
  { code: "LU", label: "Luxembourg" },
  { code: "MT", label: "Malta" },
  { code: "NL", label: "Netherlands" },
  { code: "PL", label: "Poland" },
  { code: "PT", label: "Portugal" },
  { code: "RO", label: "Romania" },
  { code: "SK", label: "Slovakia" },
  { code: "SI", label: "Slovenia" },
  { code: "ES", label: "Spain" },
  { code: "SE", label: "Sweden" },
];

export const ALLOWED_COUNTRY_CODES = ALLOWED_COUNTRIES.map(c => c.code);

export function isAllowedCountry(code) {
  return ALLOWED_COUNTRY_CODES.includes((code || "").toUpperCase());
}

// Map a display name (e.g. "United States") back to an ISO code (e.g. "US")
export function countryCodeFromLabel(label) {
  const match = ALLOWED_COUNTRIES.find(c => c.label === label);
  return match ? match.code : null;
}

// Map an ISO code to display name
export function countryLabelFromCode(code) {
  const match = ALLOWED_COUNTRIES.find(c => c.code === (code || "").toUpperCase());
  return match ? match.label : code;
}

// US + Canada get state/province dropdowns; others use free text
export const COUNTRIES_WITH_STATE_DROPDOWN = ["US", "CA"];