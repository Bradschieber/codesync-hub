import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Guitar, CheckCircle, Pencil, Trash2, X, Upload } from "lucide-react";
import SpecificationsForm from "../components/dashboard/SpecificationsForm";

const CATEGORIES = ["Electric", "Acoustic", "Bass", "Classical", "Semi-Hollow", "12-String", "Archtop", "Other"];

export default function DashboardActiveListings() {
  const [products, setProducts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        const prods = await base44.entities.Product.filter({ builder_id: profiles[0].id, status: "available" }, "-created_date", 100);
        setProducts(prods);
      }
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  async function markAsSold(product) {
    if (!confirm(`Mark "${product.name}" as sold?`)) return;
    await base44.entities.Product.update(product.id, { status: "sold", is_available: false });
    setProducts(prev => prev.filter(p => p.id !== product.id));
  }

  async function deleteProduct(product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    await base44.entities.Product.delete(product.id);
    setProducts(prev => prev.filter(p => p.id !== product.id));
  }

  function handleSaved(updated) {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    setEditingId(null);
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Link to={createPageUrl("Dashboard")} className="text-stone-400 hover:text-amber-600"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-stone-800">Active Listings</h1>
      </div>
      <p className="text-stone-500 mb-6 ml-8">{products.length} active listing{products.length !== 1 ? "s" : ""}</p>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Guitar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 mb-4">No active listings.</p>
          <Link to={createPageUrl("DashboardProducts")} className="bg-amber-600 hover:bg-amber-500 text-white font-medium px-5 py-2.5 rounded-xl text-sm">
            Manage Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              {/* Row */}
              <div className="p-4 flex gap-4 items-center">
                <div className="w-16 h-16 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0">
                  {product.image_urls?.[0] ? (
                    <img src={product.image_urls[0]} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Guitar className="w-6 h-6 text-stone-300" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-800 text-sm truncate">{product.name}</h3>
                  <p className="text-amber-700 font-bold text-sm">${product.price?.toLocaleString()}</p>
                  {product.categories?.length > 0 && (
                    <p className="text-xs text-stone-400">{product.categories.join(", ")}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => markAsSold(product)}
                    title="Mark as Sold"
                    className="p-2 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(editingId === product.id ? null : product.id)}
                    title="Edit Listing"
                    className={`p-2 rounded-lg transition-colors ${editingId === product.id ? "text-blue-600 bg-blue-50" : "text-stone-400 hover:text-blue-600 hover:bg-blue-50"}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteProduct(product)}
                    title="Delete Listing"
                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Inline Edit Form */}
              {editingId === product.id && (
                <div className="border-t border-stone-200 bg-stone-50 p-5">
                  <EditForm
                    product={product}
                    profile={profile}
                    onSave={handleSaved}
                    onClose={() => setEditingId(null)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditForm({ product, profile, onSave, onClose }) {
  const [form, setForm] = useState({ ...product });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const data = { ...form, price: Number(form.price), builder_id: profile.id, builder_name: profile.business_name || profile.display_name };
    const saved = await base44.entities.Product.update(product.id, data);
    onSave(saved);
    setSaving(false);
  }

  async function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, image_urls: [...(f.image_urls || []), file_url] }));
    }
    setUploading(false);
    e.target.value = "";
  }

  function toggleCat(cat) {
    setForm(f => ({
      ...f,
      categories: f.categories?.includes(cat) ? f.categories.filter(c => c !== cat) : [...(f.categories || []), cat]
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-stone-700 text-sm">Editing: {product.name}</h3>
        <button type="button" onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700" title="Close editor"><X className="w-4 h-4" /></button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Product Name *</label>
          <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Price ($) *</label>
          <input required type="number" min="1" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">Description</label>
        <textarea rows={3} value={form.description || ""} onChange={e => setForm({...form, description: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-2">Categories</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button type="button" key={cat} onClick={() => toggleCat(cat)} className={`px-3 py-1 rounded-lg text-xs border transition-colors ${form.categories?.includes(cat) ? "bg-amber-600 text-white border-amber-600" : "border-stone-300 text-stone-600 hover:border-amber-400"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-2">Photos & Videos</label>
        <label className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl px-4 py-4 cursor-pointer transition-colors ${uploading ? "border-amber-300 bg-amber-50" : "border-stone-300 hover:border-amber-400 hover:bg-amber-50"}`}>
          <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileUpload} disabled={uploading} />
          {uploading ? (
            <span className="text-amber-600 text-sm flex items-center gap-2"><div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /> Uploading...</span>
          ) : (
            <><Upload className="w-4 h-4 text-stone-400" /><span className="text-sm text-stone-500">Click to upload photos or videos</span></>
          )}
        </label>
        {form.image_urls?.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-3">
            {form.image_urls.map((url, i) => (
              <div key={i} className="relative group w-20 h-20">
                {url.match(/\.(mp4|mov|webm|ogg)$/i) ? (
                  <video src={url} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <img src={url} className="w-full h-full object-cover rounded-lg" />
                )}
                <button type="button" onClick={() => setForm(f => ({...f, image_urls: f.image_urls.filter((_, j) => j !== i)}))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <SpecificationsForm
        specs={form.specifications || {}}
        onChange={specs => setForm(f => ({ ...f, specifications: specs }))}
      />
      <div className="flex items-center gap-4 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.offers_local_pickup || false} onChange={e => setForm({...form, offers_local_pickup: e.target.checked})} className="rounded border-stone-300" />
          <span className="text-stone-600">Local pickup available</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_featured || false} onChange={e => setForm({...form, is_featured: e.target.checked})} className="rounded border-stone-300" />
          <span className="text-stone-600">Mark as featured</span>
        </label>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 border border-stone-300 text-stone-600 py-2.5 rounded-xl text-sm">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 rounded-xl text-sm disabled:opacity-50">
          {saving ? "Saving..." : "Update Listing"}
        </button>
      </div>
    </form>
  );
}