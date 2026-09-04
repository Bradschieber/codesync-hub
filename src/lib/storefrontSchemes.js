/**
 * Single source of truth for storefront color schemes.
 *
 * Used by:
 *  - StorefrontStylePickers (the picker UI in Dashboard + Onboarding Step 3)
 *  - CardPhotoUploader / BuilderCard (fallback card photo background + text color)
 *
 * `color` is the solid fallback background shown when no banner/card image is
 * uploaded. Uploaded photos always take priority over the scheme color.
 *
 * `getSchemeTextColor` returns the overlay text color for a scheme: white for all
 * dark/mid-tone schemes, dark navy for the light Warm Ivory scheme.
 */
export const STOREFRONT_SCHEMES = [
  { id: "earthy", label: "Earthy Amber", color: "#8B5E3C" },
  { id: "dark-wood", label: "Dark Wood", color: "#44403C" },
  { id: "slate", label: "Slate Blue", color: "#475569" },
  { id: "warm-cream", label: "Warm Terracotta", color: "#C2410C" },
  { id: "midnight", label: "Midnight Indigo", color: "#3730A3" },
  { id: "charcoal", label: "Charcoal", color: "#2B2B29" },
  { id: "forest", label: "Forest Green", color: "#3B4A32" },
  { id: "deep-wine", label: "Deep Wine", color: "#5C1F2E" },
  { id: "warm-graphite", label: "Warm Graphite", color: "#5A5347" },
  { id: "antique-brass", label: "Antique Brass", color: "#7A6A4F" },
  { id: "warm-ivory", label: "Warm Ivory", color: "#F0E6D6" },
];

export function getCardFallbackColor(scheme) {
  const found = STOREFRONT_SCHEMES.find(s => s.id === scheme);
  return found ? found.color : "#1B2B4B";
}

// Light scheme → dark navy text; everything else → white text.
export function getSchemeTextColor(scheme) {
  return scheme === "warm-ivory" ? "#1E2A44" : "#FFFFFF";
}