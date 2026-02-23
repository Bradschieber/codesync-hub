import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Save } from "lucide-react";
import MediaUploader from "../components/dashboard/MediaUploader";

export default function DashboardProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        setForm(profiles[0]);
      } else {
        setForm({ user_id: u.id, email: u.email, display_name: u.full_name, is_seller: true, account: "seller" });
      }
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, form);
    } else {
      const created = await base44.entities.UserProfile.create(form);
      setProfile(created);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to={createPageUrl("Dashboard")} className="text-stone-400 hover:text-amber-600"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-stone-800">Builder Profile</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-bold text-stone-800 mb-4">Basic Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Business Name</label>
              <input value={form.business_name || ""} onChange={e => setForm({...form, business_name: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Display Name</label>
              <input value={form.display_name || ""} onChange={e => setForm({...form, display_name: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Location</label>
              <input value={form.location || ""} onChange={e => setForm({...form, location: e.target.value})} placeholder="City, State" className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Years of Experience</label>
              <input type="number" min="0" value={form.years_experience || ""} onChange={e => setForm({...form, years_experience: Number(e.target.value)})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Website</label>
              <input value={form.website_url || ""} onChange={e => setForm({...form, website_url: e.target.value})} placeholder="https://..." className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Phone</label>
              <input value={form.phone || ""} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-stone-600 mb-1">Bio</label>
            <textarea rows={4} value={form.bio || ""} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Tell buyers about yourself, your craft, your journey..." className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
          </div>
        </div>

        {/* Specialties */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-bold text-stone-800 mb-4">Specialties</h2>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map(s => (
              <button type="button" key={s} onClick={() => toggleSpecialty(s)} className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${form.specialties?.includes(s) ? "bg-amber-600 text-white border-amber-600" : "border-stone-300 text-stone-600 hover:border-amber-400"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Story Media */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-bold text-stone-800 mb-1">Your Story in Photos & Video</h2>
          <p className="text-stone-400 text-sm mb-4">Show buyers your shop, your process, and your past builds.</p>
          <MediaUploader
            mediaUrls={form.media_urls || []}
            onChange={urls => setForm({ ...form, media_urls: urls })}
          />
        </div>

        {/* Addresses */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-bold text-stone-800 mb-4">Addresses</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Business Address</label>
              <input value={form.business_address || ""} onChange={e => setForm({...form, business_address: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Shipping Address</label>
              <input value={form.shipping_address || ""} onChange={e => setForm({...form, shipping_address: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className={`w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-xl transition-colors ${saved ? "bg-green-600 text-white" : "bg-amber-600 hover:bg-amber-500 text-white"} disabled:opacity-50`}>
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : saved ? "Saved!" : "Save Profile"}
        </button>
      </form>
    </div>
  );
}