/**
 * Reusable Banner Layout + Color Scheme pickers.
 * Shared by the Dashboard "Update Builder Profile" view and Onboarding Step 3
 * so both surfaces stay in sync.
 *
 * Layout: "classic" (Text-Forward) | "showcase" (Banner Showcase)
 * Color scheme: used as the fallback background for the Storefront Banner AND
 * the Builder Card Photo whenever no image is uploaded. If an image exists,
 * it takes priority over the scheme.
 */
const LAYOUTS = [
  {
    id: "classic",
    label: "Text-Forward",
    description: "Strong text overlay covers most of the banner - works great without a banner image.",
    preview: (
      <svg viewBox="0 0 160 80" className="w-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="160" height="80" fill="#57534e"/>
        {/* heavy dark overlay on left 2/3 */}
        <rect x="0" y="0" width="160" height="80" fill="rgba(0,0,0,0.55)"/>
        {/* text lines near top */}
        <rect x="10" y="14" width="70" height="7" rx="3" fill="rgba(255,255,255,0.9)"/>
        <rect x="10" y="25" width="48" height="4" rx="2" fill="rgba(255,255,255,0.55)"/>
        <rect x="10" y="33" width="36" height="3" rx="1.5" fill="rgba(255,255,255,0.4)"/>
        {/* CTA buttons */}
        <rect x="10" y="44" width="44" height="12" rx="3" fill="#9B1B30"/>
        <rect x="58" y="44" width="44" height="12" rx="3" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5"/>
        {/* avatar at bottom */}
        <circle cx="22" cy="80" r="10" fill="#fff" stroke="#d6d3d1" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: "showcase",
    label: "Banner Showcase",
    description: "Taller banner with text anchored at the bottom - lets a great banner image take center stage.",
    preview: (
      <svg viewBox="0 0 160 80" className="w-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="160" height="80" fill="#57534e"/>
        {/* gradient from bottom */}
        <defs>
          <linearGradient id="showcaseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,0,0,0.0)"/>
            <stop offset="100%" stopColor="rgba(0,0,0,0.75)"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="160" height="80" fill="url(#showcaseGrad)"/>
        {/* text lines near bottom */}
        <rect x="10" y="48" width="70" height="7" rx="3" fill="rgba(255,255,255,0.9)"/>
        <rect x="10" y="59" width="48" height="4" rx="2" fill="rgba(255,255,255,0.55)"/>
        {/* avatar at bottom */}
        <circle cx="22" cy="80" r="10" fill="#fff" stroke="#d6d3d1" strokeWidth="1.5"/>
      </svg>
    ),
  },
];

const COLOR_SCHEMES = [
  { id: "earthy", label: "Earthy Amber", swatch: "bg-amber-700" },
  { id: "dark-wood", label: "Dark Wood", swatch: "bg-stone-800" },
  { id: "slate", label: "Slate Blue", swatch: "bg-slate-700" },
  { id: "warm-cream", label: "Warm Terracotta", swatch: "bg-orange-700" },
  { id: "midnight", label: "Midnight Indigo", swatch: "bg-indigo-800" },
];

export default function StorefrontStylePickers({ form, setForm }) {
  return (
    <div className="space-y-6">
      {/* Layout Picker */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-3">Banner Layout</label>
        <div className="grid grid-cols-2 gap-3">
          {LAYOUTS.map(l => (
            <button
              key={l.id}
              type="button"
              onClick={() => setForm(f => ({ ...f, storefront_layout: l.id }))}
              className={`text-left p-3 rounded-xl border-2 transition-colors ${(form.storefront_layout || "classic") === l.id ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:border-stone-300"}`}
            >
              <div className="rounded-lg overflow-hidden border border-stone-200 mb-2">
                {l.preview}
              </div>
              <p className="font-semibold text-stone-800 text-sm">{l.label}</p>
              <p className="text-xs text-stone-400 mt-0.5 leading-snug">{l.description}</p>
            </button>
          ))}
        </div>
        {!form.banner_image_url && (form.storefront_layout === "showcase" || !form.storefront_layout) && (
          <p className="text-xs text-amber-600 mt-2">💡 "Banner Showcase" works best with a banner image uploaded above.</p>
        )}
      </div>

      {/* Color Scheme */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-2">Color Scheme</label>
        <p className="text-xs text-stone-400 mb-2">Sets the fallback background for your storefront banner and builder card when no image is uploaded. Uploaded photos always take priority.</p>
        <div className="flex flex-wrap gap-2">
          {COLOR_SCHEMES.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setForm(f => ({ ...f, storefront_color_scheme: c.id }))}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-colors text-sm ${form.storefront_color_scheme === c.id ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:border-stone-300"}`}
            >
              <span className={`w-4 h-4 rounded-full ${c.swatch}`} />
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}