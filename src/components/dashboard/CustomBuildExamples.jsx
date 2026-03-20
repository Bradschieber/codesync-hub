import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Hammer, Plus, X, Upload } from "lucide-react";

export default function CustomBuildExamples({ profile, form, setForm }) {
  const [uploading, setUploading] = useState(false);

  const examples = form.custom_build_examples || [];

  async function handleUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(prev => ({
        ...prev,
        custom_build_examples: [...(prev.custom_build_examples || []), { image_url: file_url, caption: "" }]
      }));
    }
    setUploading(false);
    e.target.value = "";
  }

  function updateCaption(index, caption) {
    const updated = examples.map((ex, i) => i === index ? { ...ex, caption } : ex);
    setForm({ ...form, custom_build_examples: updated });
  }

  function remove(index) {
    setForm({ ...form, custom_build_examples: examples.filter((_, i) => i !== index) });
  }

  return (
    <div className="mt-4 border p-4" style={{ borderColor: "#E3E0D8", backgroundColor: "#FAFAF8" }}>
      <div className="flex items-center gap-2 mb-3">
        <Hammer className="w-4 h-4" style={{ color: "#2F3E55" }} />
        <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>Custom Build Examples</p>
      </div>
      <p className="text-xs mb-4" style={{ color: "#9A9A9A" }}>Show off past custom work. These photos will appear on your public profile to inspire buyers.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {examples.map((ex, i) => (
          <div key={i} className="relative group">
            <img src={ex.image_url} className="w-full aspect-square object-cover" style={{ border: "1px solid #E3E0D8" }} />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1.5 right-1.5 bg-white p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" style={{ color: "#555" }} />
            </button>
            <input
              type="text"
              value={ex.caption || ""}
              onChange={e => updateCaption(i, e.target.value)}
              placeholder="Caption (optional)"
              className="mt-1.5 w-full text-xs border px-2 py-1 focus:outline-none bg-white"
              style={{ borderColor: "#DEDBD6" }}
            />
          </div>
        ))}

        <label
          className={`flex flex-col items-center justify-center aspect-square border-2 border-dashed cursor-pointer transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}
          style={{ borderColor: "#C8B89A", backgroundColor: "#FEFCF7", color: "#9A8878" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#2F3E55"; e.currentTarget.style.color = "#2F3E55"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#C8B89A"; e.currentTarget.style.color = "#9A8878"; }}
        >
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
          {uploading ? (
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#2F3E55", borderTopColor: "transparent" }} />
          ) : (
            <>
              <Upload className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Add Photos</span>
            </>
          )}
        </label>
      </div>
    </div>
  );
}