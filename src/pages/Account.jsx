import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ShoppingBag, Heart, LayoutDashboard, Save, Hammer, ExternalLink } from "lucide-react";

export default function Account() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        setForm({ first_name: profiles[0].first_name || "", last_name: profiles[0].last_name || "", display_name: profiles[0].display_name || u.full_name, location: profiles[0].location || "" });
      } else {
        setForm({ first_name: "", last_name: "", display_name: u.full_name || "", location: "" });
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
      const created = await base44.entities.UserProfile.create({ ...form, user_id: user.id, email: user.email });
      setProfile(created);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
    </div>
  );

  const isSeller = profile?.account === "seller" || profile?.account === "admin";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-stone-800 mb-8">My Account</h1>

      {/* Builder Banner */}
      {isSeller && (
        <div className="mb-6 bg-gradient-to-r from-amber-700 to-amber-500 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Hammer className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">Builder Account</p>
              <p className="text-amber-100 text-sm">{profile?.business_name || "Your builder storefront is active"}</p>
            </div>
          </div>
          <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2 bg-white text-amber-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-amber-50 transition-colors whitespace-nowrap">
            <LayoutDashboard className="w-4 h-4" /> Builder Dashboard
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-2">
          {[
            { label: isSeller ? "Incoming Orders" : "Orders", icon: ShoppingBag, page: isSeller ? "BuilderOrders" : "Orders" },
            { label: "Wishlist", icon: Heart, page: "Wishlist" },
          ].map(({ label, icon: Icon, page }) => (
            <Link key={page} to={createPageUrl(page)} className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-sm font-medium transition-colors">
              <Icon className="w-4 h-4 text-stone-400" />
              {label}
            </Link>
          ))}
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">

          {/* Builder Profile Card */}
          {isSeller && (
            <div className="bg-white rounded-2xl border-2 border-amber-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-stone-800 text-lg">Builder Profile</h2>
                  <p className="text-stone-400 text-sm mt-0.5">Keep your profile up to date — it's your storefront to buyers.</p>
                </div>
                <Link to={createPageUrl("DashboardProfile")} className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors">
                  Edit Builder Profile <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-center">
                {[
                  { label: "Business Name", value: profile?.business_name || "—" },
                  { label: "Location", value: profile?.location || "—" },
                  { label: "Years Experience", value: profile?.years_experience ? `${profile.years_experience} yrs` : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-amber-50 rounded-xl p-3">
                    <p className="text-xs text-stone-400 mb-0.5">{label}</p>
                    <p className="font-semibold text-stone-700 text-sm truncate">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account Details */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-amber-700 font-bold text-2xl">{(user?.full_name || "U")[0]}</span>
              </div>
              <div>
                <h2 className="font-bold text-stone-800">{user?.full_name}</h2>
                <p className="text-stone-400 text-sm">{user?.email}</p>
              </div>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">First Name</label>
                  <input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Last Name</label>
                  <input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Display Name</label>
                  <input value={form.display_name} onChange={e => setForm({...form, display_name: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Location</label>
                  <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="City, State" className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
              </div>
              <button type="submit" disabled={saving} className={`flex items-center justify-center gap-2 font-semibold px-8 py-2.5 rounded-xl transition-colors text-sm ${saved ? "bg-green-600 text-white" : "bg-amber-600 hover:bg-amber-500 text-white"}`}>
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}