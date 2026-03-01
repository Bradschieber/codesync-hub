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
    <div className="mt-4 border border-indigo-100 rounded-xl p-4 bg-indigo-50">
      <div className="flex items-center gap-2 mb-3">
        <Hammer className="w-4 h-4 text-indigo-600" />
        <p className="text-sm font-semibold text-gray-700">Custom Build Examples</p>
      </div>
      <p className="text-xs text-gray-400 mb-4">Show off past custom work. These photos will appear on your public profile to inspire buyers.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {examples.map((ex, i) => (
          <div key={i} className="relative group">
            <img src={ex.image_url} className="w-full aspect-square object-cover rounded-lg border border-gray-200" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1.5 right-1.5 bg-white rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <input
              type="text"
              value={ex.caption || ""}
              onChange={e => updateCaption(i, e.target.value)}
              placeholder="Caption (optional)"
              className="mt-1.5 w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-white"
            />
          </div>
        ))}

        <label className={`flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-indigo-200 cursor-pointer hover:bg-indigo-100 transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
          {uploading ? (
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Upload className="w-5 h-5 text-indigo-400 mb-1" />
              <span className="text-xs text-indigo-500 font-medium">Add Photos</span>
            </>
          )}
        </label>
      </div>
    </div>
  );
}