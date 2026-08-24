const PLATFORM_BASES = {
  instagram: "https://www.instagram.com/",
  facebook: "https://www.facebook.com/",
  x: "https://twitter.com/",
};

/**
 * Normalizes social media URLs entered by builders in various formats:
 * - "@handle" → "https://www.instagram.com/handle"
 * - "handle" (bare, no dots) → "https://www.instagram.com/handle"
 * - "www.site.com" → "https://www.site.com"
 * - "https://..." → used as-is
 */
export function normalizeSocialUrl(rawUrl, platform) {
  if (!rawUrl) return null;
  let url = rawUrl.trim();
  // Strip leading @ (builders often enter @handle)
  if (url.startsWith("@")) url = url.slice(1);
  // Already a full URL with protocol — use as-is
  if (/^https?:\/\//i.test(url)) return url;
  // Contains a dot — it's a domain-style URL missing the protocol
  if (/\./.test(url)) return `https://${url}`;
  // Bare handle — prepend the platform base URL if we know the platform
  if (platform && PLATFORM_BASES[platform]) return `${PLATFORM_BASES[platform]}${url}`;
  // Fallback
  return `https://${url}`;
}