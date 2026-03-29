import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Hammer, LayoutDashboard, Package, MessageSquare, Users, RotateCcw,
  ShoppingBag, User, Save, Bell, Mail, MessageCircle, ChevronRight, ArrowRight, BookOpen
} from "lucide-react";

const NAVY = "#1B2B4B";
const inputCls = "w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300";
const inputStyle = { borderColor: "#DEDBD6", backgroundColor: "#FFFFFF", color: "#1A1A1A" };

export default function BuilderAccountView({ user, profile, form, setForm, saving, saved, onSave }) {
  const [activeSection, setActiveSection] = useState("personal");

  const builderLinks = [
    { label: "Builder Dashboard", sub: "Overview & stats", icon: LayoutDashboard, page: "Dashboard" },
    { label: "Manage Products", sub: "Your listings", icon: Package, page: "DashboardProducts" },
    { label: "Incoming Orders", sub: "Fulfill orders", icon: ShoppingBag, page: "BuilderOrders" },
    { label: "Messages", sub: "Talk to buyers", icon: MessageSquare, page: "Messages" },
    { label: "Edit Builder Profile", sub: "Your public storefront", icon: User, page: "DashboardProfile" },
    { label: "My Customers", sub: "Customer roster", icon: Users, page: "BuilderCustomers" },
    { label: "Returns & Warranty", sub: "Manage claims", icon: RotateCcw, page: "BuilderReturnsWarranty" },
    { label: "Builder Resources", sub: "Guides, FAQ & best practices", icon: BookOpen, page: "BuilderResources" },
  ];

  const tabs = [
    { id: "personal", label: "Personal Details" },
    { id: "addresses", label: "Addresses" },
    { id: "notifications", label: "Notifications" },
  ];

  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-14 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" />
              ) : (
                <div className="w-14 h-14 flex items-center justify-center text-white font-bold text-xl flex-shrink-0" style={{ backgroundColor: NAVY }}>
                  {(user?.full_name || "B")[0]}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>{profile?.business_name || user?.full_name}</h1>
                <p className="text-sm" style={{ color: "#7A7A7A" }}>{user?.email}</p>
              </div>
            </div>
            <Link
              to={createPageUrl("Dashboard")}
              className="flex items-center gap-2 font-semibold text-sm px-5 py-3 text-white transition-colors"
              style={{ backgroundColor: NAVY }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
            >
              <LayoutDashboard className="w-4 h-4" /> Builder Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Builder Quick Links */}
        <div className="mb-8 border p-5" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
          <h2 className="font-bold text-xs uppercase tracking-widest mb-4" style={{ color: "#6B6B6B" }}>Builder Tools</h2>
          <div className="grid sm:grid-cols-2 gap-1">
            {builderLinks.map(({ label, sub, icon: Icon, page }) => (
              <Link
                key={page + label}
                to={createPageUrl(page)}
                className="flex items-center gap-3 p-3 transition-colors group"
                style={{ color: "#3D3D3D" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F5F3F0"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <div className="w-9 h-9 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EEF1F7" }}>
                  <Icon className="w-4 h-4" style={{ color: NAVY }} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm" style={{ color: "#1A1A1A" }}>{label}</p>
                  <p className="text-xs" style={{ color: "#9A9A9A" }}>{sub}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: NAVY }} />
              </Link>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest px-1 pb-2" style={{ color: "#9A9A9A" }}>Account Settings</p>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className="w-full text-left px-4 py-3 text-sm font-medium border transition-colors flex items-center justify-between"
                style={{
                  borderColor: activeSection === tab.id ? NAVY : "#E0DDD8",
                  backgroundColor: activeSection === tab.id ? "#EEF1F7" : "#FFFFFF",
                  color: activeSection === tab.id ? NAVY : "#3D3D3D",
                  fontWeight: activeSection === tab.id ? 600 : 400,
                }}
              >
                {tab.label}
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <form onSubmit={onSave}>

              {activeSection === "personal" && (
                <div className="p-6 border" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
                  <h2 className="font-bold mb-1" style={{ color: "#1A1A1A" }}>Personal Details</h2>
                  <p className="text-sm mb-6" style={{ color: "#7A7A7A" }}>Basic contact info for your account. To update your public builder profile, use Builder Dashboard → Edit Profile.</p>
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    {[
                      { label: "First Name", key: "first_name" },
                      { label: "Last Name", key: "last_name" },
                      { label: "Display Name", key: "display_name" },
                      { label: "Location", key: "location", placeholder: "City, State" },
                      { label: "Phone", key: "phone", placeholder: "+15551234567" },
                    ].map(({ label, key, placeholder }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>{label}</label>
                        <input
                          value={form[key] || ""}
                          onChange={e => setForm({ ...form, [key]: e.target.value })}
                          placeholder={placeholder}
                          className={inputCls}
                          style={inputStyle}
                        />
                      </div>
                    ))}
                  </div>
                  <SaveButton saving={saving} saved={saved} icon={<User className="w-4 h-4" />} label="Save Details" />
                </div>
              )}

              {activeSection === "addresses" && (
                <div className="p-6 border" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
                  <h2 className="font-bold mb-1" style={{ color: "#1A1A1A" }}>Addresses</h2>
                  <p className="text-sm mb-6" style={{ color: "#7A7A7A" }}>Your business and shipping addresses. Private — not shown publicly.</p>

                  <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#9A9A9A" }}>Business Address</p>
                  <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>Address Line 1</label>
                      <input value={form.business_address_1 || ""} onChange={e => setForm({ ...form, business_address_1: e.target.value })} placeholder="Street address" className={inputCls} style={inputStyle} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>Address Line 2</label>
                      <input value={form.business_address_2 || ""} onChange={e => setForm({ ...form, business_address_2: e.target.value })} placeholder="Suite, unit (optional)" className={inputCls} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>City</label>
                      <input value={form.business_city || ""} onChange={e => setForm({ ...form, business_city: e.target.value })} className={inputCls} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>State</label>
                      <input value={form.business_state || ""} onChange={e => setForm({ ...form, business_state: e.target.value })} className={inputCls} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>Postal Code</label>
                      <input value={form.business_postal_code || ""} onChange={e => setForm({ ...form, business_postal_code: e.target.value })} className={inputCls} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>Country</label>
                      <input value={form.business_country || ""} onChange={e => setForm({ ...form, business_country: e.target.value })} placeholder="United States" className={inputCls} style={inputStyle} />
                    </div>
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#9A9A9A" }}>Shipping Address</p>
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>Address Line 1</label>
                      <input value={form.shipping_address_1 || ""} onChange={e => setForm({ ...form, shipping_address_1: e.target.value })} placeholder="Street address" className={inputCls} style={inputStyle} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>Address Line 2</label>
                      <input value={form.shipping_address_2 || ""} onChange={e => setForm({ ...form, shipping_address_2: e.target.value })} placeholder="Suite, unit (optional)" className={inputCls} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>City</label>
                      <input value={form.shipping_city || ""} onChange={e => setForm({ ...form, shipping_city: e.target.value })} className={inputCls} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>State</label>
                      <input value={form.shipping_state || ""} onChange={e => setForm({ ...form, shipping_state: e.target.value })} className={inputCls} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>Postal Code</label>
                      <input value={form.shipping_postal_code || ""} onChange={e => setForm({ ...form, shipping_postal_code: e.target.value })} className={inputCls} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>Country</label>
                      <input value={form.shipping_country || ""} onChange={e => setForm({ ...form, shipping_country: e.target.value })} placeholder="United States" className={inputCls} style={inputStyle} />
                    </div>
                  </div>
                  <SaveButton saving={saving} saved={saved} icon={<Save className="w-4 h-4" />} label="Save Addresses" />
                </div>
              )}

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

function SaveButton({ saving, saved, icon, label }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="flex items-center justify-center gap-2 font-semibold px-8 py-3 text-sm text-white transition-colors"
      style={{ backgroundColor: saved ? "#27AE60" : NAVY }}
    >
      {icon}
      {saving ? "Saving..." : saved ? "Saved!" : label}
    </button>
  );
}

function NotificationsSection({ form, setForm, saving, saved }) {
  return (
    <div className="p-6 border" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
      <div className="flex items-center gap-2 mb-2">
        <Bell className="w-5 h-5" style={{ color: "#B07B30" }} />
        <h2 className="font-bold" style={{ color: "#1A1A1A" }}>Notification Preferences</h2>
      </div>
      <p className="text-sm mb-6" style={{ color: "#7A7A7A" }}>Choose how you'd like to be notified about orders and messages.</p>
      <div className="space-y-3 mb-6">
        <ToggleRow
          icon={<Mail className="w-5 h-5" style={{ color: "#9A9A9A" }} />}
          label="Email Notifications"
          sub="Sent to your account email"
          checked={form.notify_email !== false}
          onChange={() => setForm({ ...form, notify_email: !form.notify_email })}
        />
        <ToggleRow
          icon={<MessageCircle className="w-5 h-5" style={{ color: "#9A9A9A" }} />}
          label="SMS Text Notifications"
          sub="Receive a text on your phone"
          checked={!!form.notify_sms}
          onChange={() => setForm({ ...form, notify_sms: !form.notify_sms })}
        />
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
      <SaveButton saving={saving} saved={saved} icon={<Bell className="w-4 h-4" />} label="Save Preferences" />
    </div>
  );
}

function ToggleRow({ icon, label, sub, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 border" style={{ borderColor: "#E0DDD8" }}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="font-medium text-sm" style={{ color: "#1A1A1A" }}>{label}</p>
          <p className="text-xs" style={{ color: "#9A9A9A" }}>{sub}</p>
        </div>
      </div>
      <div
        onClick={onChange}
        className="w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0"
        style={{ backgroundColor: checked ? NAVY : "#DEDBD6" }}
      >
        <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </div>
    </div>
  );
}