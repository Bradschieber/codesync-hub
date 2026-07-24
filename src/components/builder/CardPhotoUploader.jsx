import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, X, Loader2, Check } from "lucide-react";

const EXPORT_WIDTH = 1200;
const EXPORT_HEIGHT = 900;

// Maps storefront color scheme → hex color (used for card fallback by BuilderCard)
export const SCHEME_COLORS = {
  earthy: "#8B5E3C",
  "dark-wood": "#44403C",
  slate: "#475569",
  "warm-cream": "#C2410C",
  midnight: "#3730A3",
};

export function getCardFallbackColor(scheme) {
  return SCHEME_COLORS[scheme] || "#1B2B4B";
}

export default function CardPhotoUploader({ cardPhotoUrl, onChange, label = "Builder Card Photo", compact = false }) {
  const [cropMode, setCropMode] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [imgEl, setImgEl] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [frameSize, setFrameSize] = useState({ w: 0, h: 0 });

  const frameRef = useRef(null);
  const fileInputRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, startY: 0, baseX: 0, baseY: 0 });

  // Measure frame size when entering crop mode
  useEffect(() => {
    if (cropMode && frameRef.current) {
      const rect = frameRef.current.getBoundingClientRect();
      setFrameSize({ w: rect.width, h: rect.height });
    }
  }, [cropMode]);

  // Cover scale: at zoom=1, the image fills the frame (like object-fit: cover)
  const coverScale = imgEl && frameSize.w > 0
    ? Math.max(frameSize.w / imgEl.naturalWidth, frameSize.h / imgEl.naturalHeight)
    : 1;

  // Set centered initial offset after frame is measured and image is loaded
  useEffect(() => {
    if (cropMode && imgEl && frameSize.w > 0) {
      const dispW = imgEl.naturalWidth * coverScale;
      const dispH = imgEl.naturalHeight * coverScale;
      setOffset({
        x: (frameSize.w - dispW) / 2,
        y: (frameSize.h - dispH) / 2,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropMode, imgEl, frameSize.w]);

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setImgEl(img);
        setImageSrc(reader.result);
        setCropMode(true);
        setZoom(1);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  // Clamp offset so image always covers the frame (no gaps)
  function clampOffset(x, y, z) {
    if (!imgEl || frameSize.w === 0) return { x, y };
    const dispW = imgEl.naturalWidth * coverScale * z;
    const dispH = imgEl.naturalHeight * coverScale * z;
    const minX = frameSize.w - dispW;
    const minY = frameSize.h - dispH;
    return {
      x: Math.min(0, Math.max(minX, x)),
      y: Math.min(0, Math.max(minY, y)),
    };
  }

  function onPointerDown(e) {
    if (!imgEl) return;
    dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, baseX: offset.x, baseY: offset.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e) {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const clamped = clampOffset(dragRef.current.baseX + dx, dragRef.current.baseY + dy, zoom);
    setOffset(clamped);
  }
  function onPointerUp() {
    dragRef.current.active = false;
  }

  function handleZoom(e) {
    const newZoom = parseFloat(e.target.value);
    // Keep the center point stable when zooming
    const effectiveScale = coverScale * zoom;
    const centerImgX = (frameSize.w / 2 - offset.x) / effectiveScale;
    const centerImgY = (frameSize.h / 2 - offset.y) / effectiveScale;
    const newOffsetX = frameSize.w / 2 - centerImgX * coverScale * newZoom;
    const newOffsetY = frameSize.h / 2 - centerImgY * coverScale * newZoom;
    const clamped = clampOffset(newOffsetX, newOffsetY, newZoom);
    setOffset(clamped);
    setZoom(newZoom);
  }

  // Draw the visible crop region to a canvas and upload
  async function handleSave() {
    setSaving(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = EXPORT_WIDTH;
      canvas.height = EXPORT_HEIGHT;
      const ctx = canvas.getContext("2d");

      const effectiveScale = coverScale * zoom;
      const srcX = -offset.x / effectiveScale;
      const srcY = -offset.y / effectiveScale;
      const srcW = frameSize.w / effectiveScale;
      const srcH = frameSize.h / effectiveScale;

      ctx.drawImage(imgEl, srcX, srcY, srcW, srcH, 0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.92));
      const file = new File([blob], "card-photo.jpg", { type: "image/jpeg" });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      onChange(file_url);
      setCropMode(false);
      setImageSrc(null);
      setImgEl(null);
    } catch (err) {
      console.error("Card photo upload error:", err);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setCropMode(false);
    setImageSrc(null);
    setImgEl(null);
  }

  // ── Display state ──
  if (!cropMode) {
    return (
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
        {!compact && (
          <p className="text-xs text-stone-400 mb-3 leading-relaxed">
            This photo introduces your storefront to buyers — it's often the first thing they'll see. Choose an image of you or your workshop that represents your craft well.
          </p>
        )}

        {cardPhotoUrl ? (
          <div className="space-y-2">
            <div className="relative overflow-hidden border border-stone-200" style={{ aspectRatio: "4/3", backgroundColor: "#F4F4F4" }}>
              <img src={cardPhotoUrl} alt="Card photo" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2 items-center">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-medium px-3 py-1.5 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors">
                Change Photo
              </button>
              <button type="button" onClick={() => onChange("")} className="text-xs text-red-400 hover:text-red-600">
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center border-2 border-dashed transition-colors"
            style={{ aspectRatio: "4/3", borderColor: "#C8B89A", backgroundColor: "#FEFCF7", color: "#9A8878" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#2F3E55"; e.currentTarget.style.color = "#2F3E55"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#C8B89A"; e.currentTarget.style.color = "#9A8878"; }}
          >
            <Upload className="w-6 h-6 mb-2" />
            <span className="text-xs font-medium">Upload Card Photo</span>
          </button>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      </div>
    );
  }

  // ── Crop state (modal overlay) ──
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-800">Crop Your Card Photo</h3>
          <button type="button" onClick={handleCancel} className="text-stone-400 hover:text-stone-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-xs text-stone-500 mb-4 leading-relaxed">
            This is exactly how your photo will appear on builder cards across the marketplace. Drag to reposition and use the slider to zoom.
          </p>

          {/* Crop frame — 4:3 */}
          <div
            ref={frameRef}
            className="relative overflow-hidden bg-stone-100 cursor-grab active:cursor-grabbing select-none mx-auto"
            style={{ aspectRatio: "4/3", width: "100%" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {imageSrc && imgEl && frameSize.w > 0 && (
              <img
                src={imageSrc}
                alt="Crop preview"
                className="absolute top-0 left-0 pointer-events-none"
                style={{
                  width: imgEl.naturalWidth * coverScale * zoom,
                  height: imgEl.naturalHeight * coverScale * zoom,
                  transform: `translate(${offset.x}px, ${offset.y}px)`,
                }}
                draggable={false}
              />
            )}
          </div>

          {/* Zoom slider */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs text-stone-500">Zoom</span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={handleZoom}
              className="flex-1"
              style={{ accentColor: "#1B2B4B" }}
            />
            <span className="text-xs text-stone-400 w-8 text-right">{zoom.toFixed(1)}x</span>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-stone-200 flex items-center justify-end gap-2">
          <button type="button" onClick={handleCancel} className="text-sm font-medium px-4 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="text-sm font-semibold px-5 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            style={{ backgroundColor: "#1B2B4B" }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Photo"}
          </button>
        </div>
      </div>
    </div>
  );
}