import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, Image, Video, Loader2, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

const NAVY = "#1B2B4B";

const TAGS = [
  "Wood Selection", "Neck Carving", "Body Shaping",
  "Electronics", "Finishing", "Setup", "Sound Test"
];

export default function BuildUpdateComposer({ order, profile, onUpdatePosted }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [photoUrls, setPhotoUrls] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handlePhotoUpload(e) {
    const files = Array.from(e.target.files).slice(0, 5 - photoUrls.length);
    if (!files.length) return;
    setUploading(true);
    const results = await Promise.all(files.map(f => base44.integrations.Core.UploadFile({ file: f })));
    setPhotoUrls(prev => [...prev, ...results.map(r => r.file_url)].slice(0, 5));
    setUploading(false);
  }

  async function handleVideoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const result = await base44.integrations.Core.UploadFile({ file });
    setVideoUrl(result.file_url);
    setUploading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const update = await base44.entities.BuildUpdate.create({
      order_id: order.id,
      builder_id: profile.id,
      builder_name: profile.business_name || profile.display_name,
      builder_location: profile.location || null,
      builder_avatar_url: profile.avatar_url || null,
      builder_slug: profile.slug || null,
      buyer_id: order.user_id,
      buyer_email: order.buyer_email,
      title: title.trim(),
      description: description.trim(),
      tag: tag || null,
      photo_urls: photoUrls,
      video_url: videoUrl || null,
      is_public: isPublic,
    });
    // Notify buyer
    await base44.functions.invoke("notifyBuildUpdate", { updateId: update.id, orderId: order.id });
    setSaving(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setOpen(false);
      setTitle(""); setDescription(""); setTag(""); setPhotoUrls([]); setVideoUrl(""); setIsPublic(false);
      onUpdatePosted?.();
    }, 1800);
  }

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-stone-50 hover:bg-stone-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4" style={{ color: NAVY }} />
          <span className="text-sm font-semibold" style={{ color: NAVY }}>Post Build Update</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4 bg-white">
          {success ? (
            <div className="flex items-center gap-2 py-4 justify-center text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold text-sm">Update posted! Buyer has been notified.</span>
            </div>
          ) : (
            <>
              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-1">Update Title *</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Body wood selected and cut"
                  required
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-stone-400"
                />
              </div>

              {/* Tag */}
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-1">Stage Tag (optional)</label>
                <div className="flex flex-wrap gap-1.5">
                  {TAGS.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTag(tag === t ? "" : t)}
                      className="text-xs px-2.5 py-1 rounded-full border transition-all"
                      style={tag === t
                        ? { backgroundColor: NAVY, color: "#fff", borderColor: NAVY }
                        : { backgroundColor: "#fff", color: "#555", borderColor: "#D1CCC4" }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Share details about this stage of the build..."
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-stone-400 resize-none"
                />
              </div>

              {/* Photos */}
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-2">
                  Photos ({photoUrls.length}/5)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {photoUrls.map((url, i) => (
                    <div key={i} className="relative w-16 h-16">
                      <img src={url} className="w-16 h-16 object-cover rounded-lg border border-stone-200" />
                      <button
                        type="button"
                        onClick={() => setPhotoUrls(p => p.filter((_, j) => j !== i))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {photoUrls.length < 5 && (
                    <label className="w-16 h-16 border-2 border-dashed border-stone-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-stone-400 transition-colors">
                      <Image className="w-5 h-5 text-stone-400" />
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                    </label>
                  )}
                </div>
              </div>

              {/* Video */}
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-2">Video (optional)</label>
                {videoUrl ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600 font-medium">Video uploaded ✓</span>
                    <button type="button" onClick={() => setVideoUrl("")}
                      className="text-xs text-red-500 hover:underline">Remove</button>
                  </div>
                ) : (
                  <label className="inline-flex items-center gap-2 border border-dashed border-stone-300 rounded-lg px-4 py-2 cursor-pointer hover:border-stone-400 transition-colors text-xs text-stone-500">
                    <Video className="w-4 h-4" />
                    Upload Video
                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                  </label>
                )}
              </div>

              {/* Visibility toggle */}
              <div className="rounded-xl border border-stone-200 p-3 bg-stone-50">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={e => setIsPublic(e.target.checked)}
                    className="mt-0.5 flex-shrink-0 accent-[#1B2B4B]"
                  />
                  <div>
                    <p className="text-xs font-semibold text-stone-700">Share on From The Bench</p>
                    <p className="text-xs text-stone-400 mt-0.5">This update will appear publicly on the From The Bench page, helping others discover your work.</p>
                  </div>
                </label>
              </div>

              {uploading && (
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading media...
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 border border-stone-200 py-2 rounded-lg text-sm text-stone-500 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
                  style={{ backgroundColor: NAVY }}
                >
                  {saving ? "Posting..." : "Post Update"}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
}