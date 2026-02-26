import { base44 } from "@/api/base44Client";
import { Palette, Layout } from "lucide-react";

const LAYOUTS = [
  { id: "classic", label: "Classic", description: "Standard header with 3-col media grid" },
  { id: "bold", label: "Bold", description: "Tall banner, featured hero image" },
  { id: "editorial", label: "Editorial", description: "Magazine-style with name overlaid on banner" },
  { id: "minimal", label: "Minimal", description: "Clean, scrollable horizontal gallery" },
];

const COLOR_SCHEMES = [
  { id: "earthy", label: "Earthy Amber", swatch: "bg-amber-700" },
  { id: "dark-wood", label: "Dark Wood", swatch: "bg-stone-800" },
  { id: "slate", label: "Slate Blue", swatch: "bg-slate-700" },
  { id: "warm-cream", label: "Warm Terracotta", swatch: "bg-orange-700" },
  { id: "midnight", label: "Midnight Indigo", swatch: "bg-indigo-800" },
];

export default function StorefrontCustomizer({ form, setForm }) {
  async function handleBannerUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, banner_image_url: file_url }));
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
          <Palette className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <h2 className="font-bold text-stone-800">Storefront Style</h2>
          <p className="text-stone-400 text-xs mt-0.5">Customize how your profile page looks to buyers.</p>
        </div>
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
            <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
          </label>
          {form.banner_image_url && (
            <button type="button" onClick={() => setForm(f => ({ ...f, banner_image_url: "" }))} className="text-xs text-red-400 hover:text-red-600">Remove</button>
          )}
        </div>
        <p className="text-xs text-stone-400 mt-1">Recommended: 1600×400px or wider. This displays behind your profile name.</p>
      </div>

      {/* Layout */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-2 flex items-center gap-1">
          <Layout className="w-3 h-3" /> Layout Template
        </label>
        <div className="grid grid-cols-2 gap-2">
          {LAYOUTS.map(l => (
            <button
              key={l.id}
              type="button"
              onClick={() => setForm(f => ({ ...f, storefront_layout: l.id }))}
              className={`text-left p-3 rounded-xl border-2 transition-colors ${form.storefront_layout === l.id ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:border-stone-300"}`}
            >
              <p className="font-semibold text-stone-800 text-sm">{l.label}</p>
              <p className="text-xs text-stone-400 mt-0.5">{l.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Color Scheme */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-2">Color Scheme</label>
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