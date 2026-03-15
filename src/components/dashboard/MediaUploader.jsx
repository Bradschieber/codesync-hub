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
      {/* Guidance above upload area */}
      <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-xs font-semibold text-amber-800 mb-2">Great photos help buyers understand how you build and what makes your work unique.</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {["Your workshop","Tools or workbench","In-progress instruments","Tonewoods and materials","Closeups of craftsmanship","You working on a build"].map(tip => (
            <p key={tip} className="text-xs text-amber-700 flex items-center gap-1"><span className="text-amber-400">•</span> {tip}</p>
          ))}
        </div>
      </div>

      {/* Example tiles */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
        {[
          { label: "Workshop", color: "bg-stone-200", icon: "🏚" },
          { label: "Workbench", color: "bg-amber-100", icon: "🪚" },
          { label: "In Progress", color: "bg-yellow-100", icon: "🎸" },
          { label: "Tonewoods", color: "bg-orange-100", icon: "🪵" },
          { label: "Finishing", color: "bg-lime-100", icon: "✨" },
          { label: "Craft Details", color: "bg-blue-100", icon: "🔍" },
        ].map(({ label, color, icon }) => (
          <div key={label} className={`${color} rounded-lg aspect-square flex flex-col items-center justify-center gap-1 border border-white/50`}>
            <span className="text-xl">{icon}</span>
            <span className="text-xs font-medium text-stone-600 text-center leading-tight px-1">{label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-stone-400 mb-3">These are example content types — upload your own photos below.</p>

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
      <p className="text-xs text-stone-500 mt-2">Builders with workshop photos create stronger storefronts and give buyers more confidence. <span className="font-medium text-stone-600">Recommended: 4–8 photos.</span></p>
    </div>
  );
}