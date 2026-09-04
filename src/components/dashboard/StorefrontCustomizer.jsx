import { base44 } from "@/api/base44Client";
import { Palette } from "lucide-react";
import CardPhotoUploader from "../builder/CardPhotoUploader";
import StorefrontStylePickers from "../builder/StorefrontStylePickers";

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

      {/* Layout + Color Scheme pickers (shared with onboarding) */}
      <StorefrontStylePickers form={form} setForm={setForm} />
    </div>
  );
}