import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, ChevronDown, Save, Sparkles, User, Hammer, Music, Clock, Store, Camera, Shield, Heart, CheckCircle2 } from "lucide-react";
import MediaUploader from "../components/dashboard/MediaUploader";
import ReferencesSection from "../components/dashboard/ReferencesSection";
import StorefrontCustomizer from "../components/dashboard/StorefrontCustomizer";
import PoliciesEditor from "../components/dashboard/PoliciesEditor";
import CustomBuildExamples from "../components/dashboard/CustomBuildExamples";
import StorefrontProgressTracker from "../components/dashboard/StorefrontProgressTracker";

const STORY_PROMPTS = [
  { icon: User, label: "Who You Are", hint: "Introduce yourself. Where are you from? What's your background? What makes you, you?", example: "I'm a builder based in Asheville, North Carolina, focused on handbuilt electric guitars and basses." },
  { icon: Hammer, label: "Why You Build", hint: "What drew you to lutherie? Was there a moment, a person, a first guitar that started it all?", example: "I started building because I wanted instruments that felt more personal, responsive, and inspiring to play." },
  { icon: Music, label: "Your Philosophy", hint: "What makes a great playing experience for a musician? What do you obsess over when you're building?" },
  { icon: Clock, label: "Your Journey", hint: "How long have you been building? How has your craft evolved over time?" },
  { icon: Store, label: "Your Shop", hint: "Tell us about where the magic happens. What's your setup? What tools do you love?", example: "I build one instrument at a time in a small workshop using carefully selected materials and hands-on processes." },
  { icon: Camera, label: "Meet the Builder & Shop Tour", hint: "Add photos and videos below — let buyers see your face, your hands, your workspace." },
  { icon: Shield, label: "Your Commitment to Buyers", hint: "What's your warranty policy? Your satisfaction guarantee? How do you stand behind your work?" },
  { icon: Heart, label: "Why Stringed Collective", hint: "Why did you choose to sell here? What excites you about connecting directly with players who care about craftsmanship?" },
];

function sectionComplete(id, form, productCount) {
  switch (id) {
    case "basics":    return !!(form.business_name && form.location);
    case "storefront":return !!(form.logo_url || form.banner_url);
    case "story":     return !!(form.brand_story && form.brand_story.length > 80);
    case "photos":    return !!(form.media_urls && form.media_urls.length > 0);
    case "business":  return !!(form.years_experience && (form.offers_stock_builds || form.offers_custom_builds));
    case "policies":  return !!(form.warranty_duration || form.returns_accepted || form.shipping_insurance_included || form.shipping_timeline || form.payment_schedule);
    case "references":return false; // managed externally
    default:          return false;
  }
}

function AccordionSection({ id, title, children, isOpen, onToggle, complete }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-800">{title}</span>
          {complete && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
          {!complete && <span className="text-xs text-gray-400 font-normal">Incomplete</span>}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-100 pt-5">
          {children}
        </div>
      )}
    </div>
  );
}

export default function DashboardProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productCount, setProductCount] = useState(0);
  const [openSection, setOpenSection] = useState("basics");

  const sectionRefs = {
    basics: useRef(null),
    storefront: useRef(null),
    story: useRef(null),
    photos: useRef(null),
    business: useRef(null),
    policies: useRef(null),
    references: useRef(null),
  };

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) {
        const p = profiles[0];
        setProfile(p);
        setForm(p);
        const prods = await base44.entities.Product.filter({ builder_id: p.id });
        setProductCount(prods.length);
      } else {
        setForm({ user_id: u.id, email: u.email, display_name: u.full_name, is_seller: true, account: "seller" });
      }
    } catch (err) {
      console.error("DashboardProfile loadProfile error:", err);
      base44.auth.redirectToLogin(window.location.href);
    }
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

  function handleTrackerSectionClick(sectionId) {
    setOpenSection(sectionId);
    setTimeout(() => {
      sectionRefs[sectionId]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function toggleSection(id) {
    setOpenSection(prev => prev === id ? null : id);
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: "#1B2B4B", borderTopColor: "transparent" }} /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Link to={createPageUrl("Dashboard")} className="text-gray-400 hover:text-gray-700"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-900">Builder Profile</h1>
      </div>
      <p className="text-gray-400 text-sm mb-6 ml-8">Build your storefront — tell your story, show your craft, earn trust.</p>

      <StorefrontProgressTracker
        form={form}
        profile={profile}
        productCount={productCount}
        onSectionClick={handleTrackerSectionClick}
      />

      <form onSubmit={handleSave} className="space-y-3">

        {/* 1. The Basics */}
        <div ref={sectionRefs.basics}>
          <AccordionSection id="basics" title="The Basics" isOpen={openSection === "basics"} onToggle={toggleSection} complete={sectionComplete("basics", form, productCount)}>
            <p className="text-gray-400 text-xs mb-5">Your public storefront identity — how buyers find and recognize you.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Business / Brand Name</label>
                <input value={form.business_name || ""} onChange={e => setForm({...form, business_name: e.target.value})} placeholder="e.g. Hartman Guitars" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Location (public)</label>
                <input value={form.location || ""} onChange={e => setForm({...form, location: e.target.value})} placeholder="City, State" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Website</label>
                <input value={form.website_url || ""} onChange={e => setForm({...form, website_url: e.target.value})} placeholder="https://..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Facebook</label>
                <input value={form.facebook_url || ""} onChange={e => setForm({...form, facebook_url: e.target.value})} placeholder="https://facebook.com/..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Instagram</label>
                <input value={form.instagram_url || ""} onChange={e => setForm({...form, instagram_url: e.target.value})} placeholder="https://instagram.com/..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">X (Twitter)</label>
                <input value={form.x_url || ""} onChange={e => setForm({...form, x_url: e.target.value})} placeholder="https://x.com/..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">To update your name, phone, or personal details, visit <a href="/account" className="text-gray-600 hover:underline">My Account</a>.</p>
          </AccordionSection>
        </div>

        {/* 2. Storefront Style */}
        <div ref={sectionRefs.storefront}>
          <AccordionSection id="storefront" title="Storefront Style" isOpen={openSection === "storefront"} onToggle={toggleSection} complete={sectionComplete("storefront", form, productCount)}>
            <StorefrontCustomizer form={form} setForm={setForm} />
          </AccordionSection>
        </div>

        {/* 3. Tell Your Story */}
        <div ref={sectionRefs.story}>
          <AccordionSection id="story" title="Tell Your Story" isOpen={openSection === "story"} onToggle={toggleSection} complete={sectionComplete("story", form, productCount)}>
            <div className="mb-4 p-4 bg-stone-50 border border-stone-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-stone-700 mb-1">Your story helps buyers understand who you are, why you build, and what makes your instruments unique.</p>
                  <p className="text-xs text-stone-500 leading-relaxed">This is your stage. Buyers aren't just buying a guitar — they're buying into you. Make it personal, make it real.</p>
                </div>
              </div>
            </div>
            <div className="mb-5 grid sm:grid-cols-2 gap-3">
              {STORY_PROMPTS.map(({ icon: Icon, label, hint, example }) => (
                <div key={label} className="flex items-start gap-2.5 bg-stone-50 border border-stone-200 rounded-lg p-3">
                  <Icon className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{hint}</p>
                    {example && <p className="text-xs text-stone-400 italic mt-1.5 border-l-2 border-stone-200 pl-2 leading-relaxed">"{example}"</p>}
                  </div>
                </div>
              ))}
            </div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Your Brand Story</label>
            <textarea
              rows={14}
              value={form.brand_story || ""}
              onChange={e => setForm({...form, brand_story: e.target.value})}
              placeholder={`Use the prompts above as a guide — but write in your own voice.\n\nE.g. "I grew up in a small town in Tennessee where my grandfather had a workshop that smelled like sawdust and linseed oil..."`}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none leading-relaxed"
            />
            <p className="text-xs text-gray-400 mt-2">Tip: Longer, more personal stories build significantly more trust with buyers.</p>
          </AccordionSection>
        </div>

        {/* 4. Show Buyers Your Craft */}
        <div ref={sectionRefs.photos}>
          <AccordionSection id="photos" title="Show Buyers Your Craft" isOpen={openSection === "photos"} onToggle={toggleSection} complete={sectionComplete("photos", form, productCount)}>
            <MediaUploader
              mediaUrls={form.media_urls || []}
              onChange={urls => setForm({ ...form, media_urls: urls })}
            />
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">Introduction Video</h3>
              <p className="text-xs text-gray-400 mb-1">A short shop or intro video can help buyers connect with your process and workspace.</p>
              <div className="mb-4 text-xs text-stone-500 space-y-0.5">
                <p className="font-medium text-stone-600">Great video ideas:</p>
                {["Workshop walkthrough","You talking about your builds","Process footage","Tools or in-progress work"].map(v => (
                  <p key={v} className="flex items-center gap-1"><span className="text-stone-300">•</span> {v}</p>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Video URL</label>
                  <input value={form.introduction_video_url || ""} onChange={e => setForm({...form, introduction_video_url: e.target.value})} placeholder="https://youtube.com/watch?v=..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Video Title / Caption (optional)</label>
                  <input value={form.introduction_video_title || ""} onChange={e => setForm({...form, introduction_video_title: e.target.value})} placeholder='e.g. "A day in my shop"' className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
              </div>
            </div>
          </AccordionSection>
        </div>

        {/* 5. Your Business */}
        <div ref={sectionRefs.business}>
          <AccordionSection id="business" title="Your Business" isOpen={openSection === "business"} onToggle={toggleSection} complete={sectionComplete("business", form, productCount)}>
            <p className="text-gray-400 text-xs mb-5">Help buyers understand what working with you looks like.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Years Building</label>
                <input type="number" min="0" value={form.years_experience || ""} onChange={e => setForm({...form, years_experience: Number(e.target.value)})} placeholder="e.g. 12" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Total Instruments Built</label>
                <input type="number" min="0" value={form.total_instruments_built || ""} onChange={e => setForm({...form, total_instruments_built: Number(e.target.value)})} placeholder="e.g. 150" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Instruments Built Per Year</label>
                <input type="number" min="0" value={form.instruments_per_year || ""} onChange={e => setForm({...form, instruments_per_year: Number(e.target.value)})} placeholder="e.g. 10" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Typical Build Time</label>
                <input value={form.typical_build_time || ""} onChange={e => setForm({...form, typical_build_time: e.target.value})} placeholder="e.g. 3–6 months" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
            </div>
            <div className="mt-4 p-4 bg-stone-50 border border-stone-200 rounded-xl mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-1">What kind of instruments do you build? <span className="text-red-500">*</span></p>
              <p className="text-xs text-gray-400 mb-3">Select all that apply.</p>
              <div className="space-y-2">
                {["Electric Guitar", "Acoustic Guitar", "Electric Bass", "Acoustic Electric Bass", "Other"].map(type => {
                  const current = form.instrument_types_built || [];
                  const entry = current.find(i => i.type === type);
                  const checked = !!entry;
                  return (
                    <div key={type}>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`inst_${type}`}
                          checked={checked}
                          onChange={e => {
                            let updated = [...current];
                            if (e.target.checked) {
                              updated.push({ type });
                            } else {
                              updated = updated.filter(i => i.type !== type);
                            }
                            setForm({ ...form, instrument_types_built: updated });
                          }}
                          className="h-4 w-4 rounded"
                          style={{ accentColor: "#1B2B4B" }}
                        />
                        <label htmlFor={`inst_${type}`} className="text-sm text-gray-700 cursor-pointer">{type}</label>
                      </div>
                      {checked && type === "Other" && (
                        <input
                          className="mt-1 ml-6 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                          placeholder="Describe your instrument type..."
                          value={entry.other_description || ""}
                          onChange={e => {
                            const updated = current.map(i => i.type === "Other" ? { ...i, other_description: e.target.value } : i);
                            setForm({ ...form, instrument_types_built: updated });
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
              <p className="text-sm font-semibold text-gray-700 mb-1">What do you offer? <span className="text-red-500">*</span></p>
              <p className="text-xs text-gray-400 mb-3">Select at least one. This determines what buyers can do on your storefront.</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <input type="checkbox" id="offers_stock_builds" checked={form.offers_stock_builds || false} onChange={e => setForm({ ...form, offers_stock_builds: e.target.checked })} className="h-4 w-4 rounded mt-0.5" style={{ accentColor: "#1B2B4B" }} />
                  <div>
                    <label htmlFor="offers_stock_builds" className="text-sm font-semibold text-gray-700 cursor-pointer">Stock Builds</label>
                    <p className="text-xs text-gray-400 mt-0.5">Pre-made instruments listed with full specs, photos, and a fixed price — ready to ship.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" id="offers_custom_builds" checked={form.offers_custom_builds || false} onChange={e => setForm({ ...form, offers_custom_builds: e.target.checked })} className="h-4 w-4 rounded mt-0.5" style={{ accentColor: "#1B2B4B" }} />
                  <div>
                    <label htmlFor="offers_custom_builds" className="text-sm font-semibold text-gray-700 cursor-pointer">Custom Builds</label>
                    <p className="text-xs text-gray-400 mt-0.5">Buyers submit a quote request with their desired specs — you build it to order.</p>
                    {form.offers_custom_builds && (
                      <div className="mt-2 space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Custom Build Description</label>
                          <textarea rows={3} value={form.custom_build_description || ""} onChange={e => setForm({ ...form, custom_build_description: e.target.value })} placeholder="Describe what you offer — instrument types, options, process, lead times, starting prices, etc." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none" />
                        </div>
                        <CustomBuildExamples form={form} setForm={setForm} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {!form.offers_stock_builds && !form.offers_custom_builds && (
                <p className="text-xs text-red-500 mt-2">⚠ Please select at least one offering type.</p>
              )}
            </div>
          </AccordionSection>
        </div>

        {/* 6. Shop Policies */}
        <div ref={sectionRefs.policies}>
          <AccordionSection id="policies" title="Shop Policies" isOpen={openSection === "policies"} onToggle={toggleSection} complete={sectionComplete("policies", form, productCount)}>
            <p className="text-gray-400 text-xs mb-5">Clear policies build buyer confidence. Define your pricing, warranty, returns, and shipping terms.</p>
            <PoliciesEditor form={form} setForm={setForm} />
          </AccordionSection>
        </div>

        {/* 7. Buyer References */}
        <div ref={sectionRefs.references}>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("references")}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-semibold text-gray-800">Buyer References</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openSection === "references" ? "rotate-180" : ""}`} />
            </button>
            {openSection === "references" && (
              <div className="border-t border-gray-100">
                <ReferencesSection profile={profile} />
              </div>
            )}
          </div>
        </div>

        <button type="submit" disabled={saving} className={`w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-xl transition-colors ${saved ? "bg-green-600 text-white" : "text-white"} disabled:opacity-50`} style={!saved ? { backgroundColor: "#1B2B4B" } : {}}>
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : saved ? "Saved!" : "Save Profile"}
        </button>
      </form>
    </div>
  );
}