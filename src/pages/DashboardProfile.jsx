import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Save, Sparkles, User, Hammer, Music, Clock, Store, Camera, Shield, Heart } from "lucide-react";
import MediaUploader from "../components/dashboard/MediaUploader";
import ReferencesSection from "../components/dashboard/ReferencesSection";
import NotificationPreferences from "../components/dashboard/NotificationPreferences";
import StorefrontCustomizer from "../components/dashboard/StorefrontCustomizer";
import PoliciesEditor from "../components/dashboard/PoliciesEditor";
import CustomBuildExamples from "../components/dashboard/CustomBuildExamples";

const STORY_PROMPTS = [
  { icon: User, label: "Who You Are", hint: "Introduce yourself. Where are you from? What's your background? What makes you, you?" },
  { icon: Hammer, label: "Why You Build", hint: "What drew you to lutherie? Was there a moment, a person, a first guitar that started it all?" },
  { icon: Music, label: "Your Philosophy", hint: "What makes a great playing experience for a musician? What do you obsess over when you're building?" },
  { icon: Clock, label: "Your Journey", hint: "How long have you been building? How has your craft evolved over time?" },
  { icon: Store, label: "Your Shop", hint: "Tell us about where the magic happens. What's your setup? What tools do you love?" },
  { icon: Camera, label: "Meet the Builder & Shop Tour", hint: "Add photos and videos below — let buyers see your face, your hands, your workspace." },
  { icon: Shield, label: "Your Commitment to Buyers", hint: "What's your warranty policy? Your satisfaction guarantee? How do you stand behind your work?" },
  { icon: Heart, label: "Why Stringed Collective", hint: "Why did you choose to sell here? What excites you about connecting directly with players who care about craftsmanship?" },
];

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

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;

  const sections = [
    { id: "basics", label: "The Basics" },
    { id: "story", label: "Brand Story" },
    { id: "storefront", label: "Storefront Style" },
    { id: "photos", label: "Photos & Video" },
    { id: "business", label: "Your Business" },
    { id: "addresses", label: "Addresses" },
    { id: "notifications", label: "Notifications" },
    { id: "references", label: "References" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Link to={createPageUrl("Dashboard")} className="text-gray-400 hover:text-indigo-700"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-900">Builder Profile</h1>
      </div>
      <p className="text-gray-400 text-sm mb-4 ml-8">Build your storefront — tell your story, show your craft, earn trust.</p>

      {/* Section Nav */}
      <div className="sticky top-16 z-30 bg-white border border-gray-200 rounded-xl px-4 py-2.5 mb-8 flex flex-wrap gap-x-4 gap-y-1 shadow-sm">
        {sections.map(s => (
          <a key={s.id} href={`#${s.id}`} className="text-xs text-gray-500 hover:text-indigo-700 font-medium transition-colors whitespace-nowrap">
            {s.label}
          </a>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* ── Section 1: The Basics ── */}
        <div id="basics" className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-1">The Basics</h2>
          <p className="text-gray-400 text-xs mb-5">How buyers will find and identify you.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Business / Brand Name</label>
              <input value={form.business_name || ""} onChange={e => setForm({...form, business_name: e.target.value})} placeholder="e.g. Hartman Guitars" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Display Name</label>
              <input value={form.display_name || ""} onChange={e => setForm({...form, display_name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
              <input value={form.location || ""} onChange={e => setForm({...form, location: e.target.value})} placeholder="City, State" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input value={form.phone || ""} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              <p className="text-xs text-gray-400 mt-1">🔒 Private — not shown on your store page.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Website</label>
              <input value={form.website_url || ""} onChange={e => setForm({...form, website_url: e.target.value})} placeholder="https://..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Facebook</label>
              <input value={form.facebook_url || ""} onChange={e => setForm({...form, facebook_url: e.target.value})} placeholder="https://facebook.com/..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Instagram</label>
              <input value={form.instagram_url || ""} onChange={e => setForm({...form, instagram_url: e.target.value})} placeholder="https://instagram.com/..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">X (Twitter)</label>
              <input value={form.x_url || ""} onChange={e => setForm({...form, x_url: e.target.value})} placeholder="https://x.com/..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>
        </div>

        {/* ── Section 3: Your Brand Story ── */}
        <div id="story" className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Tell Your Story</h2>
              <p className="text-gray-400 text-xs mt-0.5">This is your stage. Buyers aren't just buying a guitar — they're buying into you. Make it personal, make it real.</p>
            </div>
          </div>

          {/* Prompt Cards */}
          <div className="mt-5 mb-5 grid sm:grid-cols-2 gap-3">
            {STORY_PROMPTS.map(({ icon: Icon, label, hint }) => (
              <div key={label} className="flex items-start gap-2.5 bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                <Icon className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-700">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{hint}</p>
                </div>
              </div>
            ))}
          </div>

          <label className="block text-xs font-medium text-gray-600 mb-2">Your Brand Story</label>
          <textarea
            rows={14}
            value={form.brand_story || ""}
            onChange={e => setForm({...form, brand_story: e.target.value})}
            placeholder={`Use the prompts above as a guide — but write in your own voice. There's no right or wrong format. Just be genuine.\n\nE.g. "I grew up in a small town in Tennessee where my grandfather had a workshop that smelled like sawdust and linseed oil..."`}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none leading-relaxed"
          />
          <p className="text-xs text-gray-400 mt-2">Tip: Longer, more personal stories build significantly more trust with buyers. Don't be shy.</p>
        </div>

        {/* ── Storefront Style ── */}
        <div id="storefront"><StorefrontCustomizer form={form} setForm={setForm} /></div>

        {/* ── Section 3: Photos & Video ── */}
        <div id="photos" className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Camera className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Photos & Video</h2>
              <p className="text-gray-400 text-xs mt-0.5">Show buyers who you are and where your instruments come to life. Include a photo of yourself, your shop, your tools, and your builds in progress.</p>
            </div>
          </div>
          <MediaUploader
            mediaUrls={form.media_urls || []}
            onChange={urls => setForm({ ...form, media_urls: urls })}
          />
        </div>

        {/* ── Your Business ── */}
        <div id="business" className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-1">Your Business</h2>
          <p className="text-gray-400 text-xs mb-5">Help buyers understand what working with you looks like.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Years Building</label>
              <input type="number" min="0" value={form.years_experience || ""} onChange={e => setForm({...form, years_experience: Number(e.target.value)})} placeholder="e.g. 12" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Total Instruments Built</label>
              <input type="number" min="0" value={form.total_instruments_built || ""} onChange={e => setForm({...form, total_instruments_built: Number(e.target.value)})} placeholder="e.g. 150" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Instruments Built Per Year</label>
              <input type="number" min="0" value={form.instruments_per_year || ""} onChange={e => setForm({...form, instruments_per_year: Number(e.target.value)})} placeholder="e.g. 10" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Typical Build Time</label>
              <input value={form.typical_build_time || ""} onChange={e => setForm({...form, typical_build_time: e.target.value})} placeholder="e.g. 3–6 months" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>
          <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
            <p className="text-sm font-semibold text-gray-700 mb-1">What do you offer? <span className="text-red-500">*</span></p>
            <p className="text-xs text-gray-400 mb-3">Select at least one. This determines what buyers can do on your storefront.</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <input type="checkbox" id="offers_stock_builds" checked={form.offers_stock_builds || false} onChange={e => setForm({ ...form, offers_stock_builds: e.target.checked })} className="h-4 w-4 accent-indigo-600 rounded mt-0.5" />
                <div>
                  <label htmlFor="offers_stock_builds" className="text-sm font-semibold text-gray-700 cursor-pointer">Stock Builds</label>
                  <p className="text-xs text-gray-400 mt-0.5">Pre-made instruments listed with full specs, photos, and a fixed price — ready to ship.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <input type="checkbox" id="offers_custom_builds" checked={form.offers_custom_builds || false} onChange={e => setForm({ ...form, offers_custom_builds: e.target.checked })} className="h-4 w-4 accent-indigo-600 rounded mt-0.5" />
                <div>
                  <label htmlFor="offers_custom_builds" className="text-sm font-semibold text-gray-700 cursor-pointer">Custom Builds</label>
                  <p className="text-xs text-gray-400 mt-0.5">Buyers submit a quote request with their desired specs — you build it to order.</p>
                  {form.offers_custom_builds && (
                    <div className="mt-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Custom Build Description</label>
                      <textarea rows={3} value={form.custom_build_description || ""} onChange={e => setForm({ ...form, custom_build_description: e.target.value })} placeholder="Describe what you offer — instrument types, options, process, lead times, starting prices, etc." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            {!form.offers_stock_builds && !form.offers_custom_builds && (
              <p className="text-xs text-red-500 mt-2">⚠ Please select at least one offering type.</p>
            )}
          </div>
          <PoliciesEditor form={form} setForm={setForm} />
        </div>

        {/* ── Section 4: Addresses ── */}
        <div id="addresses" className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-5">Addresses</h2>

          {/* Business Address */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Business Address</p>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Address 1</label>
              <input value={form.business_address_1 || ""} onChange={e => setForm({...form, business_address_1: e.target.value})} placeholder="Street address" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Address 2</label>
              <input value={form.business_address_2 || ""} onChange={e => setForm({...form, business_address_2: e.target.value})} placeholder="Suite, unit, building (optional)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
              <input value={form.business_city || ""} onChange={e => setForm({...form, business_city: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">State / Province</label>
              <input value={form.business_state || ""} onChange={e => setForm({...form, business_state: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Postal Code</label>
              <input value={form.business_postal_code || ""} onChange={e => setForm({...form, business_postal_code: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
              <input value={form.business_country || ""} onChange={e => setForm({...form, business_country: e.target.value})} placeholder="e.g. United States" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>

          {/* Shipping Address */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Shipping Address</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Address 1</label>
              <input value={form.shipping_address_1 || ""} onChange={e => setForm({...form, shipping_address_1: e.target.value})} placeholder="Street address" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Address 2</label>
              <input value={form.shipping_address_2 || ""} onChange={e => setForm({...form, shipping_address_2: e.target.value})} placeholder="Suite, unit, building (optional)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
              <input value={form.shipping_city || ""} onChange={e => setForm({...form, shipping_city: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">State / Province</label>
              <input value={form.shipping_state || ""} onChange={e => setForm({...form, shipping_state: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Postal Code</label>
              <input value={form.shipping_postal_code || ""} onChange={e => setForm({...form, shipping_postal_code: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
              <input value={form.shipping_country || ""} onChange={e => setForm({...form, shipping_country: e.target.value})} placeholder="e.g. United States" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>
        </div>

        {/* ── Section 5: Notification Preferences ── */}
        <div id="notifications" />
        {profile && (
          <NotificationPreferences
            profile={profile}
            onSave={async (data) => {
              await base44.entities.UserProfile.update(profile.id, data);
              setProfile({ ...profile, ...data });
            }}
          />
        )}

        {/* ── Section 6: Buyer References ── */}
        <div id="references" />
        <ReferencesSection profile={profile} />

        <button type="submit" disabled={saving} className={`w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-xl transition-colors ${saved ? "bg-green-600 text-white" : "bg-indigo-700 hover:bg-indigo-800 text-white"} disabled:opacity-50`}>
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : saved ? "Saved!" : "Save Profile"}
        </button>
      </form>
    </div>
  );
}