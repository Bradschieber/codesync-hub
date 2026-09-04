import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Loader2 } from "lucide-react";

/**
 * Large drag-and-drop style uploader for storefront images (Banner, Logo).
 * Matches the visual treatment of CardPhotoUploader but without the crop step.
 */
export default function StorefrontImageUploader({
  imageUrl,
  onChange,
  uploadLabel = "Upload Image",
  aspectRatio = "16/5",
  objectFit = "cover",
}) {
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
    } catch (err) {
      console.error("Image upload error:", err);
    } finally {
      setSaving(false);
    }
    e.target.value = "";
  }

  return (
    <div>
      {imageUrl ? (
        <div className="space-y-2">
          <div
            className="relative overflow-hidden border border-stone-200 flex items-center justify-center"
            style={{ aspectRatio, backgroundColor: "#F4F4F4" }}
          >
            <img
              src={imageUrl}
              alt={uploadLabel}
              className="w-full h-full"
              style={{ objectFit }}
            />
          </div>
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
              className="text-xs font-medium px-3 py-1.5 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors disabled:opacity-50"
            >
              {saving ? "Uploading..." : `Change ${uploadLabel.replace("Upload ", "")}`}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-red-400 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={saving}
          className="w-full flex flex-col items-center justify-center border-2 border-dashed transition-colors disabled:opacity-50"
          style={{ aspectRatio, borderColor: "#9B1B30", backgroundColor: "#F9E5E8", color: "#7A1526" }}
          onMouseEnter={e => { if (!saving) { e.currentTarget.style.borderColor = "#7A1526"; e.currentTarget.style.color = "#5C0F1C"; } }}
          onMouseLeave={e => { if (!saving) { e.currentTarget.style.borderColor = "#9B1B30"; e.currentTarget.style.color = "#7A1526"; } }}
        >
          {saving ? (
            <Loader2 className="w-6 h-6 mb-2 animate-spin" />
          ) : (
            <Upload className="w-6 h-6 mb-2" />
          )}
          <span className="text-xs font-medium">{saving ? "Uploading..." : uploadLabel}</span>
        </button>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
    </div>
  );
}