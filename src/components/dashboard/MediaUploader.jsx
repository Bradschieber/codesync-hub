import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, X, Image, Loader2 } from "lucide-react";

export default function MediaUploader({ mediaUrls = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  async function handleFiles(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const uploaded = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploaded.push(file_url);
    }
    onChange([...mediaUrls, ...uploaded]);
    setUploading(false);
    e.target.value = "";
  }

  function removeMedia(url) {
    onChange(mediaUrls.filter(u => u !== url));
  }

  function isVideo(url) {
    return url?.match(/\.(mp4|mov|webm|ogg)(\?|$)/i);
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
        {mediaUrls.map((url, i) => (
          <div key={i} className="relative group overflow-hidden border aspect-square bg-stone-100" style={{ borderColor: "#E3E0D8" }}>
            {isVideo(url) ? (
              <video src={url} className="w-full h-full object-cover" muted />
            ) : (
              <img src={url} alt="" className="w-full h-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => removeMedia(url)}
              className="absolute top-1.5 right-1.5 bg-black/50 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center justify-center aspect-square border-2 border-dashed transition-colors disabled:opacity-50"
          style={{ borderColor: "#C8B89A", backgroundColor: "#FEFCF7", color: "#9A8878" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#2F3E55"; e.currentTarget.style.color = "#2F3E55"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#C8B89A"; e.currentTarget.style.color = "#9A8878"; }}
        >
          {uploading ? (
            <Loader2 className="w-7 h-7 animate-spin" />
          ) : (
            <>
              <Upload className="w-7 h-7 mb-2" />
              <span className="text-xs font-medium">Add Photo / Video</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
    </div>
  );
}