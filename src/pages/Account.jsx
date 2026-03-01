import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ShoppingBag, Heart, LayoutDashboard, Save, Hammer, ExternalLink } from "lucide-react";

const NAVY = "#1B2B4B";

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
      <div className="animate-spin w-7 h-7 border-2 border-t-transparent rounded-full" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
    </div>
  );

  const isSeller = profile?.account === "seller" || profile?.account === "admin";
  const inputStyle = { borderColor: "#DEDBD6", backgroundColor: "#FFFFFF", color: "#1A1A1A" };

  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>
      {/* Page Header */}
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-14 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>My Account</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Builder Banner */}
        {isSeller && (
          <div className="mb-8 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ backgroundColor: NAVY }}>
            <div className="flex items-center gap-3">
              <Hammer className="w-5 h-5 text-white opacity-70 flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="font-bold text-white text-sm">Builder Account</p>
                <p className="text-sm" style={{ color: "#A8B8D0" }}>{profile?.business_name || "Your builder storefront is active"}</p>
              </div>
            </div>
            <Link
              to={createPageUrl("Dashboard")}
              className="flex items-center gap-2 font-semibold text-sm px-5 py-2.5 transition-colors whitespace-nowrap"
              style={{ backgroundColor: "#FFFFFF", color: NAVY }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#EEF1F7"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#FFFFFF"}
            >
              <LayoutDashboard className="w-4 h-4" /> Builder Dashboard
            </Link>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-2">
            {[
              { label: isSeller ? "Incoming Orders" : "Orders", icon: ShoppingBag, page: isSeller ? "BuilderOrders" : "Orders" },
              ...(!isSeller ? [{ label: "Wishlist", icon: Heart, page: "Wishlist" }] : []),
            ].map(({ label, icon: Icon, page }) => (
              <Link
                key={page}
                to={createPageUrl(page)}
                className="flex items-center gap-3 p-4 border text-sm font-medium transition-colors"
                style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF", color: "#3D3D3D" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = NAVY; e.currentTarget.style.color = NAVY; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#E0DDD8"; e.currentTarget.style.color = "#3D3D3D"; }}
              >
                <Icon className="w-4 h-4" style={{ color: "#9A9A9A" }} />
                {label}
              </Link>
            ))}
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-5">

            {/* Builder Profile Card */}
            {isSeller && (
              <div className="p-6 border" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="font-bold text-base mb-1" style={{ color: "#1A1A1A" }}>Builder Profile</h2>
                    <p className="text-sm" style={{ color: "#7A7A7A" }}>Keep your profile up to date — it's your storefront to buyers.</p>
                  </div>
                  <Link
                    to={createPageUrl("DashboardProfile")}
                    className="flex items-center gap-1.5 font-semibold text-sm px-4 py-2.5 text-white transition-colors"
                    style={{ backgroundColor: NAVY }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
                  >
                    Edit Profile <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { label: "Business Name", value: profile?.business_name || "—" },
                    { label: "Location", value: profile?.location || "—" },
                    { label: "Years Experience", value: profile?.years_experience ? `${profile.years_experience} yrs` : "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-3" style={{ backgroundColor: "#EEF1F7" }}>
                      <p className="text-xs mb-1 font-medium uppercase tracking-wide" style={{ color: "#7A7A7A" }}>{label}</p>
                      <p className="font-bold text-sm truncate" style={{ color: "#1A1A1A" }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Account Details */}
            <div className="p-6 border" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
              <div className="flex items-center gap-4 mb-6 pb-5" style={{ borderBottom: "1px solid #F0EDE8" }}>
                <div className="w-14 h-14 flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: NAVY }}>
                  {(user?.full_name || "U")[0]}
                </div>
                <div>
                  <h2 className="font-bold" style={{ color: "#1A1A1A" }}>{user?.full_name}</h2>
                  <p className="text-sm" style={{ color: "#7A7A7A" }}>{user?.email}</p>
                </div>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: "First Name", key: "first_name" },
                    { label: "Last Name", key: "last_name" },
                    { label: "Display Name", key: "display_name" },
                    { label: "Location", key: "location", placeholder: "City, State" },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>{label}</label>
                      <input
                        value={form[key] || ""}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full border px-3 py-2.5 text-sm focus:outline-none"
                        style={inputStyle}
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 font-semibold px-8 py-3 text-sm text-white transition-colors"
                  style={{ backgroundColor: saved ? "#27AE60" : NAVY }}
                  onMouseEnter={e => { if (!saved) e.currentTarget.style.backgroundColor = "#152038"; }}
                  onMouseLeave={e => { if (!saved) e.currentTarget.style.backgroundColor = NAVY; }}
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}