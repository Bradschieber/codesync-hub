import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Plus, Pencil, Trash2, Upload, X, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TAGS = ["Wood Selection", "Neck Carving", "Body Shaping", "Electronics", "Finishing", "Setup", "Sound Test"];
const NAVY = "#1B2B4B";

export default function DashboardWorkshop() {
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) {
        const p = profiles[0];
        setProfile(p);
        const all = await base44.entities.WorkshopPost.filter({ builder_id: p.id }, "-created_date", 100);
        setPosts(all);
      }
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  async function deletePost(id) {
    if (!confirm("Delete this post?")) return;
    await base44.entities.WorkshopPost.delete(id);
    setPosts(prev => prev.filter(p => p.id !== id));
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin w-7 h-7 border-2 border-t-transparent rounded-full" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Link to={createPageUrl("Dashboard")} className="text-stone-400 hover:text-stone-700"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-stone-800">Workshop Activity</h1>
      </div>
      <p className="text-stone-500 mb-6 ml-8">Showcase your process, materials, and in-progress work. These posts appear on your storefront and optionally in the public From The Bench feed.</p>

      {!showForm && (
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 text-white font-medium px-5 py-2.5 rounded-xl text-sm mb-6"
          style={{ backgroundColor: NAVY }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
        >
          <Plus className="w-4 h-4" /> New Workshop Post
        </button>
      )}

      {showForm && (
        <WorkshopPostForm
          post={editing}
          profile={profile}
          onSave={(saved) => {
            if (editing) {
              setPosts(prev => prev.map(p => p.id === saved.id ? saved : p));
            } else {
              setPosts(prev => [saved, ...prev]);
            }
            setShowForm(false);
            setEditing(null);
          }}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {posts.length === 0 && !showForm ? (
        <div className="text-center py-16 border border-dashed border-stone-200 rounded-2xl">
          <div className="text-4xl mb-3">🔨</div>
          <p className="text-stone-500 font-medium mb-1">No workshop posts yet</p>
          <p className="text-stone-400 text-sm">Share what's happening in your shop to build buyer trust.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              {post.photo_url && (
                <div className="aspect-video bg-stone-100 overflow-hidden">
                  <img src={post.photo_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                {post.caption && (
                  <p className="text-sm text-stone-700 mb-2 leading-relaxed">{post.caption}</p>
                )}
                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-stone-400">
                      {post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : ""}
                    </p>
                    {post.is_public && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">Public</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditing(post); setShowForm(true); }}
                      className="p-2 text-stone-400 hover:text-blue-600 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="p-2 text-stone-400 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WorkshopPostForm({ post, profile, onSave, onClose }) {
  const [form, setForm] = useState(post ? {
    photo_url: post.photo_url || "",
    caption: post.caption || "",
    tags: post.tags || [],
    is_public: post.is_public !== false,
  } : {
    photo_url: "",
    caption: "",
    tags: [],
    is_public: true,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, photo_url: file_url }));
    setUploading(false);
    e.target.value = "";
  }

  function toggleTag(tag) {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag]
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.photo_url) return;
    setSaving(true);
    const data = {
      ...form,
      builder_id: profile.id,
      builder_name: profile.business_name || profile.display_name,
    };
    let saved;
    if (post) {
      saved = await base44.entities.WorkshopPost.update(post.id, data);
    } else {
      saved = await base44.entities.WorkshopPost.create(data);
    }
    onSave(saved);
    setSaving(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-amber-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-stone-800">{post ? "Edit Post" : "New Workshop Post"}</h2>
        <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700"><X className="w-5 h-5" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Photo Upload */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-2">Photo *</label>
          {form.photo_url ? (
            <div className="relative rounded-xl overflow-hidden aspect-video bg-stone-100 max-w-sm">
              <img src={form.photo_url} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, photo_url: "" }))}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className={`flex flex-col items-center justify-center gap-2 max-w-sm aspect-video border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading ? "border-amber-300 bg-amber-50" : "border-stone-300 hover:border-amber-400 hover:bg-amber-50"}`}>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
              {uploading ? (
                <><Loader2 className="w-6 h-6 animate-spin text-amber-500" /><span className="text-sm text-amber-600">Uploading...</span></>
              ) : (
                <><Upload className="w-6 h-6 text-stone-400" /><span className="text-sm text-stone-500">Click to upload photo</span></>
              )}
            </label>
          )}
        </div>

        {/* Caption */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">Caption <span className="font-normal text-stone-400">(optional, max 200 chars)</span></label>
          <textarea
            rows={2}
            maxLength={200}
            value={form.caption}
            onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
            placeholder="e.g. Carving the neck for a walnut short-scale bass."
            className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
          <p className="text-xs text-stone-400 mt-1 text-right">{form.caption.length}/200</p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-2">Tags <span className="font-normal text-stone-400">(optional)</span></label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className="text-xs px-3 py-1.5 rounded-full border transition-colors"
                style={{
                  borderColor: form.tags.includes(tag) ? NAVY : "#D1CDC6",
                  backgroundColor: form.tags.includes(tag) ? NAVY : "transparent",
                  color: form.tags.includes(tag) ? "#fff" : "#5A5A5A",
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Share toggle */}
        <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl">
          <input
            type="checkbox"
            id="is_public"
            checked={form.is_public}
            onChange={e => setForm(f => ({ ...f, is_public: e.target.checked }))}
            className="mt-0.5 rounded border-stone-300 accent-stone-800"
          />
          <div>
            <label htmlFor="is_public" className="text-sm font-medium text-stone-800 cursor-pointer">Share to public From The Bench feed</label>
            <p className="text-xs text-stone-500 mt-0.5">This post always appears on your storefront. Enable this to also share it with the Stringed Collective community feed.</p>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 border border-stone-300 text-stone-600 py-2.5 rounded-xl text-sm">Cancel</button>
          <button
            type="submit"
            disabled={saving || !form.photo_url}
            className="flex-1 text-white font-medium py-2.5 rounded-xl text-sm disabled:opacity-50"
            style={{ backgroundColor: NAVY }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
          >
            {saving ? "Saving..." : post ? "Update Post" : "Post to Workshop"}
          </button>
        </div>
      </form>
    </div>
  );
}