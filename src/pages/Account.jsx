import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ShoppingBag, Heart, LayoutDashboard, Save, Hammer, Bell, Mail, MessageCircle, User } from "lucide-react";

const NAVY = "#1B2B4B";

export default function Account() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("personal");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        setForm(profiles[0]);
      } else {
        setForm({ first_name: "", last_name: "", display_name: u.full_name || "", location: "", phone: "" });
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
  const inputCls = "w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300";
  const inputStyle = { borderColor: "#DEDBD6", backgroundColor: "#FFFFFF", color: "#1A1A1A" };

  const tabs = [
    { id: "personal", label: "Personal Details" },
    { id: "addresses", label: "Addresses" },
    { id: "notifications", label: "Notifications" },
  ];

  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-14 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>My Account</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              className="flex items-center gap-2 font-semibold text-sm px-5 py-2.5 whitespace-nowrap"
              style={{ backgroundColor: "#FFFFFF", color: NAVY }}
            >
              <LayoutDashboard className="w-4 h-4" /> Builder Dashboard
            </Link>
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className="w-full text-left px-4 py-3 text-sm font-medium border transition-colors"
                style={{
                  borderColor: activeSection === tab.id ? NAVY : "#E0DDD8",
                  backgroundColor: activeSection === tab.id ? "#EEF1F7" : "#FFFFFF",
                  color: activeSection === tab.id ? NAVY : "#3D3D3D",
                  fontWeight: activeSection === tab.id ? 600 : 400,
                }}
              >
                {tab.label}
              </button>
            ))}

            <div className="pt-4 space-y-1">
              {[
                { label: isSeller ? "Incoming Orders" : "My Orders", icon: ShoppingBag, page: isSeller ? "BuilderOrders" : "Orders" },
                ...(!isSeller ? [{ label: "Wishlist", icon: Heart, page: "Wishlist" }] : []),
              ].map(({ label, icon: Icon, page }) => (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className="flex items-center gap-3 px-4 py-3 border text-sm font-medium transition-colors"
                  style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF", color: "#3D3D3D" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = NAVY; e.currentTarget.style.color = NAVY; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E0DDD8"; e.currentTarget.style.color = "#3D3D3D"; }}
                >
                  <Icon className="w-4 h-4" style={{ color: "#9A9A9A" }} />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <form onSubmit={handleSave}>

              {/* ── Personal Details ── */}
              {activeSection === "personal" && (
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

                  <h3 className="font-semibold text-sm mb-4 uppercase tracking-wide" style={{ color: "#6B6B6B" }}>Personal Details</h3>
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    {[
                      { label: "First Name", key: "first_name" },
                      { label: "Last Name", key: "last_name" },
                      { label: "Display Name", key: "display_name" },
                      { label: "Location", key: "location", placeholder: "City, State" },
                      { label: "Phone", key: "phone", placeholder: "+15551234567", note: "🔒 Private — not shown publicly." },
                    ].map(({ label, key, placeholder, note }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>{label}</label>
                        <input
                          value={form[key] || ""}
                          onChange={e => setForm({ ...form, [key]: e.target.value })}
                          placeholder={placeholder}
                          className={inputCls}
                          style={inputStyle}
                        />
                        {note && <p className="text-xs mt-1" style={{ color: "#9A9A9A" }}>{note}</p>}
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 font-semibold px-8 py-3 text-sm text-white transition-colors"
                    style={{ backgroundColor: saved ? "#27AE60" : NAVY }}
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
                  </button>
                </div>
              )}

              {/* ── Addresses ── */}
              {activeSection === "addresses" && (
                <div className="p-6 border" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
                  <h2 className="font-bold mb-1" style={{ color: "#1A1A1A" }}>Addresses</h2>
                  <p className="text-sm mb-6" style={{ color: "#7A7A7A" }}>Your business and shipping addresses. Private — not shown publicly.</p>

                  <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#9A9A9A" }}>Business Address</p>
                  <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>Address 1</label>
                      <input value={form.business_address_1 || ""} onChange={e => setForm({...form, business_address_1: e.target.value})} placeholder="Street address" className={inputCls} style={inputStyle} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>Address 2</label>
                      <input value={form.business_address_2 || ""} onChange={e => setForm({...form, business_address_2: e.target.value})} placeholder="Suite, unit (optional)" className={inputCls} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>City</label>
                      <input value={form.business_city || ""} onChange={e => setForm({...form, business_city: e.target.value})} className={inputCls} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>State / Province</label>
                      <input value={form.business_state || ""} onChange={e => setForm({...form, business_state: e.target.value})} className={inputCls} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>Postal Code</label>
                      <input value={form.business_postal_code || ""} onChange={e => setForm({...form, business_postal_code: e.target.value})} className={inputCls} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>Country</label>
                      <input value={form.business_country || ""} onChange={e => setForm({...form, business_country: e.target.value})} placeholder="e.g. United States" className={inputCls} style={inputStyle} />
                    </div>
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#9A9A9A" }}>Shipping Address</p>
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>Address 1</label>
                      <input value={form.shipping_address_1 || ""} onChange={e => setForm({...form, shipping_address_1: e.target.value})} placeholder="Street address" className={inputCls} style={inputStyle} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>Address 2</label>
                      <input value={form.shipping_address_2 || ""} onChange={e => setForm({...form, shipping_address_2: e.target.value})} placeholder="Suite, unit (optional)" className={inputCls} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>City</label>
                      <input value={form.shipping_city || ""} onChange={e => setForm({...form, shipping_city: e.target.value})} className={inputCls} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>State / Province</label>
                      <input value={form.shipping_state || ""} onChange={e => setForm({...form, shipping_state: e.target.value})} className={inputCls} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>Postal Code</label>
                      <input value={form.shipping_postal_code || ""} onChange={e => setForm({...form, shipping_postal_code: e.target.value})} className={inputCls} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>Country</label>
                      <input value={form.shipping_country || ""} onChange={e => setForm({...form, shipping_country: e.target.value})} placeholder="e.g. United States" className={inputCls} style={inputStyle} />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 font-semibold px-8 py-3 text-sm text-white"
                    style={{ backgroundColor: saved ? "#27AE60" : NAVY }}
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : saved ? "Saved" : "Save Addresses"}
                  </button>
                </div>
              )}

              {/* ── Notifications ── */}
              {activeSection === "notifications" && (
                <NotificationsSection form={form} setForm={setForm} saving={saving} saved={saved} />
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsSection({ form, setForm, saving, saved }) {
  const NAVY = "#1B2B4B";

  return (
    <div className="p-6 border" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
      <div className="flex items-center gap-2 mb-2">
        <Bell className="w-5 h-5" style={{ color: "#B07B30" }} />
        <h2 className="font-bold" style={{ color: "#1A1A1A" }}>Notification Preferences</h2>
      </div>
      <p className="text-sm mb-6" style={{ color: "#7A7A7A" }}>Choose how you'd like to be notified about messages and activity.</p>

      <div className="space-y-3 mb-6">
        {/* Email toggle */}
        <div className="flex items-center justify-between p-4 border" style={{ borderColor: "#E0DDD8" }}>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5" style={{ color: "#9A9A9A" }} />
            <div>
              <p className="font-medium text-sm" style={{ color: "#1A1A1A" }}>Email Notifications</p>
              <p className="text-xs" style={{ color: "#9A9A9A" }}>Sent to your account email address</p>
            </div>
          </div>
          <div
            onClick={() => setForm({ ...form, notify_email: !form.notify_email })}
            className="w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0"
            style={{ backgroundColor: form.notify_email !== false ? NAVY : "#DEDBD6" }}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${form.notify_email !== false ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </div>

        {/* SMS toggle */}
        <div className="flex items-center justify-between p-4 border" style={{ borderColor: "#E0DDD8" }}>
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5" style={{ color: "#9A9A9A" }} />
            <div>
              <p className="font-medium text-sm" style={{ color: "#1A1A1A" }}>SMS Text Notifications</p>
              <p className="text-xs" style={{ color: "#9A9A9A" }}>Receive a text on your phone</p>
            </div>
          </div>
          <div
            onClick={() => setForm({ ...form, notify_sms: !form.notify_sms })}
            className="w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0"
            style={{ backgroundColor: form.notify_sms ? NAVY : "#DEDBD6" }}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${form.notify_sms ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </div>

        {form.notify_sms && (
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>Phone Number for SMS</label>
            <input
              type="tel"
              value={form.notification_phone || ""}
              onChange={e => setForm({ ...form, notification_phone: e.target.value })}
              placeholder="+15551234567"
              className="w-full border px-3 py-2.5 text-sm focus:outline-none"
              style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF", color: "#1A1A1A" }}
            />
            <p className="text-xs mt-1" style={{ color: "#9A9A9A" }}>Enter in E.164 format, e.g. +15551234567</p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex items-center justify-center gap-2 font-semibold px-8 py-3 text-sm text-white"
        style={{ backgroundColor: saved ? "#27AE60" : NAVY }}
      >
        <Bell className="w-4 h-4" />
        {saving ? "Saving..." : saved ? "Saved" : "Save Preferences"}
      </button>
    </div>
  );
}