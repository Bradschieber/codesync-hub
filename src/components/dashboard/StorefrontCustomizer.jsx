import { base44 } from "@/api/base44Client";
import { Palette } from "lucide-react";
import CardPhotoUploader from "../builder/CardPhotoUploader";

const LAYOUTS = [
  {
    id: "classic",
    label: "Text-Forward",
    description: "Strong text overlay covers most of the banner — works great without a banner image.",
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
        <rect x="10" y="44" width="44" height="12" rx="3" fill="#C57A1F"/>
        <rect x="58" y="44" width="44" height="12" rx="3" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5"/>
        {/* avatar at bottom */}
        <circle cx="22" cy="80" r="10" fill="#fff" stroke="#d6d3d1" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: "showcase",
    label: "Banner Showcase",
    description: "Taller banner with text anchored at the bottom — lets a great banner image take center stage.",
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

export default function StorefrontCustomizer({ form, setForm }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
          <Palette className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <h2 className="font-bold text-stone-800">Storefront Style</h2>
          <p className="text-stone-400 text-xs mt-0.5">Customize how your profile page looks to buyers.</p>
        </div>
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-2">Logo</label>
        {form.logo_url && (
          <div className="mb-2 w-32 h-20 rounded-xl overflow-hidden border border-stone-200 bg-stone-50 flex items-center justify-center">
            <img src={form.logo_url} alt="Logo" className="max-w-full max-h-full object-contain p-2" />
          </div>
        )}
        <div className="flex gap-2 items-center">
          <label className="cursor-pointer border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors">
            {form.logo_url ? "Change Logo" : "Upload Logo"}
            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const { file_url } = await base44.integrations.Core.UploadFile({ file });
              setForm(f => ({ ...f, logo_url: file_url }));
            }} />
          </label>
          {form.logo_url && (
            <button type="button" onClick={() => setForm(f => ({ ...f, logo_url: "" }))} className="text-xs text-red-400 hover:text-red-600">Remove</button>
          )}
        </div>
        <p className="text-xs text-stone-400 mt-1">Your logo will appear prominently in your storefront header.</p>
      </div>

      {/* Card Photo Upload */}
      <div className="pt-2 border-t border-stone-100 mt-4">
        <CardPhotoUploader
          cardPhotoUrl={form.card_photo_url}
          onChange={url => setForm(f => ({ ...f, card_photo_url: url }))}
        />
      </div>

      {/* Banner Upload */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-2">Banner Image</label>
        {form.banner_image_url && (
          <div className="mb-2 rounded-xl overflow-hidden h-32">
            <img src={form.banner_image_url} alt="Banner" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex gap-2 items-center">
          <label className="cursor-pointer border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors">
            {form.banner_image_url ? "Change Banner" : "Upload Banner"}
            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const { file_url } = await base44.integrations.Core.UploadFile({ file });
              setForm(f => ({ ...f, banner_image_url: file_url }));
            }} />
          </label>
          {form.banner_image_url && (
            <button type="button" onClick={() => setForm(f => ({ ...f, banner_image_url: "" }))} className="text-xs text-red-400 hover:text-red-600">Remove</button>
          )}
        </div>
        <p className="text-xs text-stone-400 mt-1">Recommended: 1600×400px or wider.</p>
      </div>

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
        <p className="text-xs text-stone-400 mb-2">Sets the banner background color when no banner image is uploaded.</p>
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