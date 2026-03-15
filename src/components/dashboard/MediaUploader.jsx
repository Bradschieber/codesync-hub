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
          <div key={i} className="relative group rounded-xl overflow-hidden border border-stone-200 aspect-video bg-stone-100">
            {isVideo(url) ? (
              <video src={url} className="w-full h-full object-cover" muted />
            ) : (
              <img src={url} alt="" className="w-full h-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => removeMedia(url)}
              className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-400 aspect-video text-stone-400 hover:text-amber-500 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Upload className="w-6 h-6 mb-1" />
              <span className="text-xs">Add Photo/Video</span>
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
      <p className="text-xs text-stone-500 font-medium mb-1">Great photos to include:</p>
      <ul className="text-xs text-stone-400 space-y-0.5 list-none">
        <li>• Your workshop</li>
        <li>• Tools or workbench</li>
        <li>• In-progress instruments</li>
        <li>• Tonewoods and materials</li>
        <li>• Closeups of craftsmanship</li>
        <li>• You working on a build</li>
      </ul>
    </div>
  );
}