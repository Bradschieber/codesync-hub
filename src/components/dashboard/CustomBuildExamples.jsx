import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Hammer, Upload, X } from "lucide-react";

export default function CustomBuildExamples({ form, setForm }) {
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
        custom_build_examples: [
          ...(prev.custom_build_examples || []),
          { image_url: file_url, caption: "", title: "", description: "" }
        ]
      }));
    }
    setUploading(false);
    e.target.value = "";
  }

  function updateField(index, field, value) {
    const updated = examples.map((ex, i) => i === index ? { ...ex, [field]: value } : ex);
    setForm({ ...form, custom_build_examples: updated });
  }

  function remove(index) {
    setForm({ ...form, custom_build_examples: examples.filter((_, i) => i !== index) });
  }

  return (
    <div className="mt-4 border p-4" style={{ borderColor: "#E3E0D8", backgroundColor: "#FAFAF8" }}>
      <div className="flex items-center gap-2 mb-1">
        <Hammer className="w-4 h-4" style={{ color: "#2F3E55" }} />
        <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>Custom Build Examples</p>
      </div>
      <p className="text-xs mb-4" style={{ color: "#9A9A9A" }}>
        Add photos of past custom work. An optional title and notes can be added to each — these appear on hover on your public storefront.
      </p>

      <div className="space-y-4 mb-4">
        {examples.map((ex, i) => (
          <div key={i} className="flex gap-3 items-start">
            {/* Thumbnail */}
            <div className="relative flex-shrink-0 w-20 h-20 group">
              <img src={ex.image_url} className="w-full h-full object-cover" style={{ border: "1px solid #E3E0D8" }} />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 bg-white p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" style={{ color: "#555" }} />
              </button>
            </div>

            {/* Metadata fields */}
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={ex.title || ""}
                onChange={e => updateField(i, "title", e.target.value)}
                placeholder="Project title (optional)"
                className="w-full border px-2.5 py-1.5 text-xs focus:outline-none bg-white"
                style={{ borderColor: "#DEDBD6" }}
              />
              <textarea
                rows={2}
                value={ex.description || ""}
                onChange={e => updateField(i, "description", e.target.value)}
                placeholder="Short notes — materials, specs, or anything worth sharing (optional)"
                className="w-full border px-2.5 py-1.5 text-xs focus:outline-none resize-none bg-white"
                style={{ borderColor: "#DEDBD6" }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Upload button */}
      <label
        className={`flex items-center gap-2 px-4 py-2.5 border-2 border-dashed cursor-pointer transition-colors w-full justify-center ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        style={{ borderColor: "#C8B89A", backgroundColor: "#FEFCF7", color: "#9A8878" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#2F3E55"; e.currentTarget.style.color = "#2F3E55"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#C8B89A"; e.currentTarget.style.color = "#9A8878"; }}
      >
        <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
        {uploading ? (
          <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#2F3E55", borderTopColor: "transparent" }} />
        ) : (
          <>
            <Upload className="w-4 h-4" />
            <span className="text-xs font-medium">Add Photos</span>
          </>
        )}
      </label>
    </div>
  );
}