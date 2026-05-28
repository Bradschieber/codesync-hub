import { useState, useEffect } from "react";
import { CheckCircle2, ImageIcon, Eye, X, Upload, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const NAVY = "#1B2B4B";

/**
 * Hero image review screen/panel for builders.
 * Props:
 *   product       — the product object
 *   onApproved    — callback after builder approves; receives updated product
 *   onKeepLimited — callback when builder chooses to keep live with limited visibility
 *   onClose       — dismiss
 */
export default function HeroImageReviewPanel({ product, onApproved, onKeepLimited, onClose }) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localProcessedUrl, setLocalProcessedUrl] = useState(product.processed_hero_image_url || null);
  const [approved, setApproved] = useState(false);
  const [processingError, setProcessingError] = useState(null);

  // Keep localProcessedUrl in sync if parent updates the product prop (after processing completes)
  useEffect(() => {
    if (product.processed_hero_image_url) {
      setLocalProcessedUrl(product.processed_hero_image_url);
    }
  }, [product.processed_hero_image_url]);

  // Poll for processed image if not yet available
  useEffect(() => {
    if (localProcessedUrl) return; // already have it

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 20; // ~40 seconds

    async function poll() {
      if (cancelled || attempts >= maxAttempts) {
        if (!cancelled) setProcessingError("Image processing timed out. Please try uploading a different photo.");
        return;
      }
      attempts++;
      try {
        const products = await base44.entities.Product.filter({ id: product.id });
        const p = products[0];
        if (p?.processed_hero_image_url) {
          if (!cancelled) setLocalProcessedUrl(p.processed_hero_image_url);
          return;
        }
        if (p?.hero_processing_status === 'failed') {
          if (!cancelled) setProcessingError(p.processing_error_message || "Image processing failed. Please try uploading a different photo.");
          return;
        }
      } catch {}
      setTimeout(poll, 2000);
    }

    // Start polling after a short delay
    const timer = setTimeout(poll, 2000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [product.id, localProcessedUrl]);

  async function handleApprove() {
    setSaving(true);
    const updated = await base44.entities.Product.update(product.id, {
      builder_approved_marketplace_hero: true,
      hero_processing_status: "approved_by_builder",
      listing_visibility_state: "full_visibility",
      marketplace_hero_approved_at: new Date().toISOString(),
      processed_hero_image_url: localProcessedUrl || product.processed_hero_image_url,
    });
    setSaving(false);
    setApproved(true);
    setTimeout(() => onApproved(updated), 1800);
  }

  async function handleUploadNewHero(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setLocalProcessedUrl(file_url);
    await base44.entities.Product.update(product.id, {
      processed_hero_image_url: file_url,
      hero_processing_status: "preview_ready",
      builder_approved_marketplace_hero: false,
      listing_visibility_state: "limited_visibility",
    });
    setUploading(false);
    e.target.value = "";
  }

  const originalImage = product.original_hero_image_url || product.image_urls?.[0] || null;
  const processedImage = localProcessedUrl;
  const isProcessing = !processedImage && !processingError;

  if (approved) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
        <div className="bg-white w-full max-w-md shadow-2xl text-center p-10">
          <div className="w-14 h-14 flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "#DCFCE7" }}>
            <CheckCircle2 className="w-7 h-7" style={{ color: "#16A34A" }} />
          </div>
          <h2 className="text-xl font-bold mb-3" style={{ color: "#1A1A1A" }}>Clean marketplace version approved</h2>
          <p className="text-sm leading-relaxed text-gray-500">
            Your listing is now eligible for catalog, search, homepage features, and other marketplace browsing areas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b" style={{ borderColor: "#E8E5E0" }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: "#1A1A1A" }}>Review your clean marketplace version</h2>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "#7A7A7A" }}>
              We create a clean marketplace version so listings across Stringed Collective look polished, consistent, and professional wherever shoppers browse multiple instruments. Nothing about your instrument is changed — we only standardize the background and presentation.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 flex-shrink-0 ml-4">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview comparison */}
        <div className="p-6 border-b" style={{ borderColor: "#E8E5E0" }}>
          <div className="grid sm:grid-cols-2 gap-4">

            {/* Original */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Eye className="w-3.5 h-3.5" style={{ color: "#7A7A7A" }} />
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#7A7A7A" }}>Original photo</p>
              </div>
              <div className="overflow-hidden" style={{ aspectRatio: "4/3", backgroundColor: "#F0EDE8" }}>
                {originalImage ? (
                  <img src={originalImage} alt="Original" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <ImageIcon className="w-8 h-8" style={{ color: "#C8C4BC" }} />
                    <p className="text-xs" style={{ color: "#9A9A9A" }}>No photo uploaded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Clean marketplace version */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Eye className="w-3.5 h-3.5" style={{ color: NAVY }} />
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: NAVY }}>Clean marketplace version</p>
              </div>
              <div className="overflow-hidden relative" style={{ aspectRatio: "4/3", backgroundColor: "#EEF1F7" }}>
                {processedImage ? (
                  <img src={processedImage} alt="Clean marketplace version" className="w-full h-full object-cover" />
                ) : processingError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
                    <ImageIcon className="w-8 h-8" style={{ color: "#C8C4BC" }} />
                    <p className="text-xs leading-relaxed" style={{ color: "#9A6A6A" }}>{processingError}</p>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4 text-center">
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#8A9BB0" }} />
                    <p className="text-xs leading-relaxed" style={{ color: "#7A7A7A" }}>
                      Generating clean marketplace version…
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-3">
          {/* Upload new primary photo */}
          <label className={`flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed cursor-pointer text-sm font-medium transition-colors ${uploading ? "border-blue-300 bg-blue-50 text-blue-600" : "border-stone-300 text-stone-500 hover:border-stone-400 hover:bg-stone-50"}`}>
            <input type="file" accept="image/*" className="hidden" onChange={handleUploadNewHero} disabled={uploading} />
            {uploading ? (
              <><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="w-4 h-4" /> Try a different primary photo</>
            )}
          </label>

          {/* Primary: approve */}
          <button
            onClick={handleApprove}
            disabled={saving || !processedImage}
            className="w-full font-semibold py-3 text-sm text-white transition-colors disabled:opacity-40"
            style={{ backgroundColor: NAVY }}
            onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#152038")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = NAVY)}
          >
            {saving ? "Saving..." : "Approve clean marketplace version"}
          </button>

          {/* Secondary: keep limited */}
          <button
            onClick={onKeepLimited}
            className="w-full font-medium py-2.5 text-sm transition-opacity hover:opacity-70"
            style={{ color: "#7A7A7A" }}
          >
            Keep listing live with limited visibility
          </button>
        </div>
      </div>
    </div>
  );
}