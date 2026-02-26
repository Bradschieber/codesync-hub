import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Palette, Layout, ImagePlus, Check } from "lucide-react";

const LAYOUTS = [
  {
    id: "classic",
    label: "Classic",
    description: "Elegant header with story and gallery below",
    preview: (
      <div className="w-full h-16 rounded-lg overflow-hidden border border-stone-200 flex flex-col gap-1 p-1.5">
        <div className="h-4 bg-stone-300 rounded w-full" />
        <div className="flex gap-1 flex-1">
          <div className="flex-1 bg-stone-200 rounded" />
          <div className="w-1/3 bg-stone-100 rounded" />
        </div>
      </div>
    ),
  },
  {
    id: "bold",
    label: "Bold",
    description: "Full-width hero banner with large text overlay",
    preview: (
      <div className="w-full h-16 rounded-lg overflow-hidden border border-stone-200 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-700 to-stone-500" />
        <div className="absolute bottom-2 left-2 right-2 space-y-1">
          <div className="h-2 bg-white/60 rounded w-2/3" />
          <div className="h-1.5 bg-white/40 rounded w-1/2" />
        </div>
      </div>
    ),
  },
  {
    id: "gallery",
    label: "Gallery",
    description: "Photo-first layout with a masonry media grid",
    preview: (
      <div className="w-full h-16 rounded-lg overflow-hidden border border-stone-200 p-1.5 grid grid-cols-3 gap-1">
        <div className="bg-stone-300 rounded row-span-2 col-span-1" />
        <div className="bg-stone-200 rounded" />
        <div className="bg-stone-200 rounded" />
        <div className="bg-stone-100 rounded col-span-2" />
      </div>
    ),
  },
];

const COLOR_SCHEMES = [
  { id: "earthy", label: "Earthy", primary: "#8B4513", accent: "#D4A847", bg: "#FDF8F3" },
  { id: "midnight", label: "Midnight", primary: "#1E293B", accent: "#6366F1", bg: "#F8FAFC" },
  { id: "natural", label: "Natural", primary: "#3D5A3E", accent: "#A3B899", bg: "#F6FAF6" },
  { id: "forge", label: "Forge", primary: "#374151", accent: "#F59E0B", bg: "#F9FAFB" },
  { id: "ocean", label: "Ocean", primary: "#0C4A6E", accent: "#38BDF8", bg: "#F0F9FF" },
];

export default function StorefrontCustomizer({ form, setForm }) {
  const [uploading, setUploading] = useState(false);

  async function handleBannerUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, banner_image_url: file_url }));
    setUploading(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-8">
      <div>
        <h2 className="font-bold text-stone-800 mb-1 flex items-center gap-2">
          <Palette className="w-4 h-4 text-amber-600" /> Storefront Customization
        </h2>
        <p className="text-stone-400 text-xs">Choose how your builder page looks to visitors.</p>
      </div>

      {/* Banner Image */}
      <div>
        <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <ImagePlus className="w-3.5 h-3.5" /> Banner Image
        </label>
        <p className="text-xs text-stone-400 mb-3">Used as the hero header on your storefront and as the thumbnail when browsing builders.</p>
        <div
          className="relative rounded-xl overflow-hidden border-2 border-dashed border-stone-300 hover:border-amber-400 transition-colors cursor-pointer group"
          style={{ height: "160px" }}
          onClick={() => document.getElementById("banner-upload").click()}
        >
          {form.banner_image_url ? (
            <>
              <img src={form.banner_image_url} className="w-full h-full object-cover" alt="Banner" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium">Change Banner</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-stone-400 gap-2">
              {uploading ? (
                <div className="animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full" />
              ) : (
                <>
                  <ImagePlus className="w-8 h-8" />
                  <span className="text-sm">Click to upload banner image</span>
                  <span className="text-xs text-stone-300">Recommended: 1400×400px or wider</span>
                </>
              )}
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
            </div>
          )}
        </div>
        <input id="banner-upload" type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
      </div>

      {/* Layout Templates */}
      <div>
        <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Layout className="w-3.5 h-3.5" /> Layout Template
        </label>
        <div className="grid grid-cols-3 gap-3">
          {LAYOUTS.map(layout => (
            <button
              key={layout.id}
              type="button"
              onClick={() => setForm(f => ({ ...f, storefront_layout: layout.id }))}
              className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                form.storefront_layout === layout.id
                  ? "border-amber-500 bg-amber-50"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              {form.storefront_layout === layout.id && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </span>
              )}
              {layout.preview}
              <p className="text-xs font-semibold text-stone-700 mt-2">{layout.label}</p>
              <p className="text-xs text-stone-400 leading-tight mt-0.5">{layout.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Color Schemes */}
      <div>
        <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5" /> Color Scheme
        </label>
        <div className="flex flex-wrap gap-3">
          {COLOR_SCHEMES.map(scheme => (
            <button
              key={scheme.id}
              type="button"
              onClick={() => setForm(f => ({ ...f, storefront_color_scheme: scheme.id }))}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${
                form.storefront_color_scheme === scheme.id
                  ? "border-amber-500 bg-amber-50"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded-full border border-stone-200" style={{ backgroundColor: scheme.primary }} />
                <div className="w-4 h-4 rounded-full border border-stone-200" style={{ backgroundColor: scheme.accent }} />
              </div>
              <span className="text-xs font-medium text-stone-700">{scheme.label}</span>
              {form.storefront_color_scheme === scheme.id && (
                <Check className="w-3 h-3 text-amber-600" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}