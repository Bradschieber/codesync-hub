import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Check, ArrowRight, ArrowLeft, Store, BookOpen, Camera, Hammer,
  ShieldCheck, Users, CreditCard, Guitar, Sparkles, MapPin, Globe,
  Instagram, Facebook, User, Clock, Package, Upload, X
} from "lucide-react";
import MediaUploader from "../components/dashboard/MediaUploader";
import PoliciesEditor from "../components/dashboard/PoliciesEditor";
import ReferencesSection from "../components/dashboard/ReferencesSection";
import CustomBuildExamples from "../components/dashboard/CustomBuildExamples";

const NAVY = "#2F3E55";
const AMBER = "#C57A1F";

const STEPS = [
  { id: "shop",       label: "Your Shop",         icon: Store },
  { id: "story",      label: "Your Story",         icon: BookOpen },
  { id: "craft",      label: "Show Your Craft",    icon: Camera },
  { id: "business",   label: "Your Business",      icon: Hammer },
  { id: "policies",   label: "Shop Policies",      icon: ShieldCheck },
  { id: "references", label: "Buyer References",   icon: Users },
  { id: "payments",   label: "Payments",           icon: CreditCard },
  { id: "instrument", label: "First Instrument",   icon: Guitar },
  { id: "launch",     label: "Launch",             icon: Sparkles },
];

const INSTRUMENT_TYPES = ["Electric Guitar", "Acoustic Guitar", "Electric Bass", "Acoustic Electric Bass", "Other"];

const STORY_PROMPTS = [
  { label: "Who You Are", hint: "Introduce yourself — where you're from, your background, what makes you, you." },
  { label: "Why You Build", hint: "What drew you to lutherie? Was there a moment or person that started it all?" },
  { label: "Your Philosophy", hint: "What makes a great playing experience? What do you obsess over when building?" },
  { label: "Your Journey", hint: "How long have you been building? How has your craft evolved?" },
  { label: "Your Shop", hint: "Tell us about where the magic happens — your setup, your tools, your process." },
];

// Minimal product form for first instrument step
function FirstInstrumentForm({ product, setProduct }) {
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setProduct(p => ({ ...p, image_urls: [...(p.image_urls || []), file_url] }));
    setUploading(false);
  }

  function removeImage(idx) {
    setProduct(p => ({ ...p, image_urls: p.image_urls.filter((_, i) => i !== idx) }));
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: "#6B6B6B" }}>Instrument Name *</label>
        <input
          value={product.name || ""}
          onChange={e => setProduct(p => ({ ...p, name: e.target.value }))}
          placeholder='e.g. "Walnut Short Scale Bass"'
          className="w-full border px-3 py-2.5 text-sm focus:outline-none"
          style={{ borderColor: "#DEDBD6" }}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "#6B6B6B" }}>Price ($) *</label>
          <input
            type="number"
            value={product.price || ""}
            onChange={e => setProduct(p => ({ ...p, price: Number(e.target.value) }))}
            placeholder="e.g. 2500"
            className="w-full border px-3 py-2.5 text-sm focus:outline-none"
            style={{ borderColor: "#DEDBD6" }}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "#6B6B6B" }}>Instrument Category</label>
          <select
            value={product.specifications?.instrumentCategory || ""}
            onChange={e => setProduct(p => ({ ...p, specifications: { ...(p.specifications || {}), instrumentCategory: e.target.value } }))}
            className="w-full border px-3 py-2.5 text-sm focus:outline-none bg-white"
            style={{ borderColor: "#DEDBD6" }}
          >
            <option value="">Select type...</option>
            {["Electric Guitars", "Electric Bass Guitar", "Acoustic Guitar", "Acoustic Bass Guitar", "Other"].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: "#6B6B6B" }}>Description</label>
        <textarea
          rows={3}
          value={product.description || ""}
          onChange={e => setProduct(p => ({ ...p, description: e.target.value }))}
          placeholder="Describe this instrument — materials, inspiration, what makes it special."
          className="w-full border px-3 py-2.5 text-sm focus:outline-none resize-none"
          style={{ borderColor: "#DEDBD6" }}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: "#6B6B6B" }}>Photos</label>
        <div className="flex flex-wrap gap-3">
          {(product.image_urls || []).map((url, i) => (
            <div key={i} className="relative w-24 h-24 overflow-hidden" style={{ border: "1px solid #DEDBD6" }}>
              <img src={url} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow"
              >
                <X className="w-3 h-3" style={{ color: "#333" }} />
              </button>
            </div>
          ))}
          <label className="w-24 h-24 flex flex-col items-center justify-center cursor-pointer text-xs font-medium gap-1"
            style={{ border: "1px dashed #BDBBB6", backgroundColor: "#FAFAF8", color: "#9A9A9A" }}>
            {uploading ? (
              <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Add photo
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </label>
        </div>
      </div>
    </div>
  );
}

export default function BuilderOnboarding() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    is_seller: true,
    account: "seller",
    ships_domestically: true,
  });
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activePrompt, setActivePrompt] = useState(null);
  const [product, setProduct] = useState({ image_urls: [], status: "available", is_available: true });
  const [savingProduct, setSavingProduct] = useState(false);
  const [skipInstrument, setSkipInstrument] = useState(false);

  useEffect(() => { loadUser(); }, []);

  async function loadUser() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const existing = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (existing.length > 0) {
        setProfile(existing[0]);
        setForm(existing[0]);

      } else {
        setForm(f => ({
          ...f,
          user_id: u.id,
          email: u.email,
          display_name: u.full_name,
        }));
      }
    } catch {
      base44.auth.redirectToLogin(window.location.href);
    }
    setLoading(false);
  }

  async function saveProfile() {
    setSaving(true);
    try {
      if (profile) {
        const updated = await base44.entities.UserProfile.update(profile.id, form);
        setProfile(updated);
      } else {
        const created = await base44.entities.UserProfile.create(form);
        setProfile(created);
        setForm(created);
      }
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        base44.auth.redirectToLogin("/BuilderOnboarding");
        return;
      }
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleNext() {
    await saveProfile();
    if (step < STEPS.length - 1) setStep(s => s + 1);
  }

  async function handleBack() {
    await saveProfile();
    if (step > 0) setStep(s => s - 1);
  }

  async function handleLaunch() {
    // Save first instrument if not skipped
    if (!skipInstrument && product.name && product.price && profile) {
      setSavingProduct(true);
      await base44.entities.Product.create({
        ...product,
        builder_id: profile.id,
        builder_name: form.business_name || form.display_name,
      });
      setSavingProduct(false);
    }
    await saveProfile();
    navigate(createPageUrl("Dashboard"));
  }

  const currentStep = STEPS[step];
  const progressPct = Math.round(((step) / (STEPS.length - 1)) * 100);

  function Field({ label, children, hint }) {
    return (
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: "#6B6B6B" }}>{label}</label>
        {hint && <p className="text-xs mb-2" style={{ color: "#9A9A9A" }}>{hint}</p>}
        {children}
      </div>
    );
  }

  function Input({ field, placeholder, type = "text" }) {
    return (
      <input
        type={type}
        value={form[field] || ""}
        onChange={e => setForm(f => ({ ...f, [field]: type === "number" ? Number(e.target.value) : e.target.value }))}
        placeholder={placeholder}
        className="w-full border px-3 py-2.5 text-sm focus:outline-none"
        style={{ borderColor: "#DEDBD6" }}
      />
    );
  }

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "#F7F6F3" }}>
      <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: NAVY, borderTopColor: "transparent", borderWidth: 3 }} />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F6F3" }}>

      {/* ── TOP PROGRESS BAR ── */}
      <div className="sticky top-0 z-40" style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E3E0D8" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex flex-col" style={{ lineHeight: 1.1 }}>
              <span className="font-bold text-sm" style={{ color: NAVY, letterSpacing: "0.02em" }}>Stringed</span>
              <span className="font-normal text-sm" style={{ color: NAVY, letterSpacing: "0.12em" }}>Collective</span>
            </div>

            {/* Step pills — desktop */}
            <div className="hidden lg:flex items-center gap-1">
              {STEPS.map((s, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <div key={s.id} className="flex items-center gap-1">
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: active ? NAVY : done ? "#E8F4EC" : "transparent",
                        color: active ? "#FFFFFF" : done ? "#27AE60" : "#9A9A9A",
                      }}
                    >
                      {done ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
                      <span className="hidden xl:inline">{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && <div className="w-3 h-px" style={{ backgroundColor: "#DEDBD6" }} />}
                  </div>
                );
              })}
            </div>

            {/* Step count — mobile */}
            <div className="lg:hidden text-xs font-medium" style={{ color: "#7A7A7A" }}>
              Step {step + 1} of {STEPS.length}
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-0.5 w-full" style={{ backgroundColor: "#E3E0D8" }}>
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${progressPct}%`, backgroundColor: NAVY }}
            />
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col items-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-2xl">

          {/* Step header */}
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#9A9A9A" }}>
              Step {step + 1} — {currentStep.label}
            </p>
            {step === 0 && <>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Welcome. Let's build your shop.</h1>
              <p className="text-base" style={{ color: "#5A5A5A" }}>This is where buyers will find you, learn your story, and decide to reach out. Let's start with the basics.</p>
            </>}
            {step === 1 && <>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Tell your story.</h1>
              <p className="text-base" style={{ color: "#5A5A5A" }}>Buyers aren't just buying an instrument — they're buying into you. Make it personal, make it real.</p>
            </>}
            {step === 2 && <>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Show your craft.</h1>
              <p className="text-base" style={{ color: "#5A5A5A" }}>Photos of your workshop, process, and materials bring your storefront to life. This is what builds trust at first glance.</p>
            </>}
            {step === 3 && <>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Your business.</h1>
              <p className="text-base" style={{ color: "#5A5A5A" }}>Help buyers understand what working with you looks like — your experience, output, and what you offer.</p>
            </>}
            {step === 4 && <>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Shop policies.</h1>
              <p className="text-base" style={{ color: "#5A5A5A" }}>Clear policies build buyer confidence and are included in every purchase agreement. These are required before your storefront goes live.</p>
            </>}
            {step === 5 && <>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Buyer references.</h1>
              <p className="text-base" style={{ color: "#5A5A5A" }}>Past buyers can vouch for your work. These show up on your storefront and build trust with new customers. <span style={{ color: "#9A9A9A" }}>(Optional)</span></p>
            </>}
            {step === 6 && <>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Payments & payouts.</h1>
              <p className="text-base" style={{ color: "#5A5A5A" }}>Understand how the platform handles money so you can build with confidence.</p>
            </>}
            {step === 7 && <>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Add your first instrument.</h1>
              <p className="text-base" style={{ color: "#5A5A5A" }}>A listing makes your storefront tangible. It shows buyers what your craft looks like in finished form.</p>
            </>}
            {step === 8 && <>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Your storefront is ready.</h1>
              <p className="text-base" style={{ color: "#5A5A5A" }}>You've built the foundation. Here's what's been completed and what you can strengthen over time.</p>
            </>}
          </div>

          {/* ── STEP CONTENT ── */}

          {/* STEP 1: Your Shop */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Shop / Brand Name *" hint="The name buyers will see on your storefront.">
                  <Input field="business_name" placeholder="e.g. Hartman Guitars" />
                </Field>
                <Field label="Location" hint="City, State — shown publicly.">
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#AAAAAA" }} />
                    <input
                      value={form.location || ""}
                      onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                      placeholder="e.g. Asheville, NC"
                      className="w-full border pl-8 pr-3 py-2.5 text-sm focus:outline-none"
                      style={{ borderColor: "#DEDBD6" }}
                    />
                  </div>
                </Field>
              </div>
              <Field label="Tagline" hint="One sentence that sums up your shop's identity.">
                <Input field="tag_line" placeholder='e.g. "Handbuilt electric guitars from the Pacific Northwest"' />
              </Field>
              <div className="pt-2 border-t" style={{ borderColor: "#E3E0D8" }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "#9A9A9A" }}>Online presence (optional)</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Website">
                    <div className="relative">
                      <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#AAAAAA" }} />
                      <input value={form.website_url || ""} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} placeholder="https://..." className="w-full border pl-8 pr-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: "#DEDBD6" }} />
                    </div>
                  </Field>
                  <Field label="Instagram">
                    <div className="relative">
                      <Instagram className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#AAAAAA" }} />
                      <input value={form.instagram_url || ""} onChange={e => setForm(f => ({ ...f, instagram_url: e.target.value }))} placeholder="https://instagram.com/..." className="w-full border pl-8 pr-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: "#DEDBD6" }} />
                    </div>
                  </Field>
                  <Field label="Facebook">
                    <div className="relative">
                      <Facebook className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#AAAAAA" }} />
                      <input value={form.facebook_url || ""} onChange={e => setForm(f => ({ ...f, facebook_url: e.target.value }))} placeholder="https://facebook.com/..." className="w-full border pl-8 pr-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: "#DEDBD6" }} />
                    </div>
                  </Field>
                  <Field label="X (Twitter)">
                    <input value={form.x_url || ""} onChange={e => setForm(f => ({ ...f, x_url: e.target.value }))} placeholder="https://x.com/..." className="w-full border px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: "#DEDBD6" }} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Tell Your Story */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Prompts */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#8A8A8A" }}>Writing prompts — tap one for inspiration</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {STORY_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActivePrompt(activePrompt === i ? null : i)}
                      className="text-left p-3 border transition-all"
                      style={{
                        borderColor: activePrompt === i ? NAVY : "#E3E0D8",
                        backgroundColor: activePrompt === i ? "#F0F3F8" : "#FAFAF8",
                      }}
                    >
                      <p className="text-xs font-bold mb-0.5" style={{ color: NAVY }}>{p.label}</p>
                      {activePrompt === i && <p className="text-xs leading-relaxed" style={{ color: "#5A5A5A" }}>{p.hint}</p>}
                      {activePrompt !== i && <p className="text-xs" style={{ color: "#BBBBBB" }}>Tap for a prompt →</p>}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: "#1A1A1A" }}>Your Brand Story</label>
                <p className="text-xs mb-3" style={{ color: "#7A7A7A" }}>Use the prompts above as inspiration, then write your story in your own voice below. The more personal and specific, the more buyers will connect with you.</p>
                <textarea
                  rows={14}
                  value={form.brand_story || ""}
                  onChange={e => setForm(f => ({ ...f, brand_story: e.target.value }))}
                  placeholder={`Write in your own voice — no need to be formal.\n\nE.g. "I grew up in a small town in Tennessee where my grandfather had a workshop that smelled like sawdust and linseed oil..."`}
                  className="w-full border px-4 py-3 text-sm focus:outline-none resize-none leading-relaxed"
                  style={{ borderColor: "#DEDBD6" }}
                />
                <p className="text-xs mt-2" style={{ color: "#9A9A9A" }}>
                  {form.brand_story?.length || 0} characters — longer, genuine stories are consistently the biggest trust builder on a storefront.
                </p>
              </div>
              <Field label="Short Bio (optional)" hint="A 1–2 sentence summary shown on your profile cards across the site.">
                <textarea
                  rows={2}
                  value={form.bio || ""}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="e.g. Builder of hand-carved electric guitars from Portland, OR. 15 years, ~120 instruments."
                  className="w-full border px-3 py-2.5 text-sm focus:outline-none resize-none"
                  style={{ borderColor: "#DEDBD6" }}
                />
              </Field>
            </div>
          )}

          {/* STEP 3: Show Your Craft */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="p-4 border-l-4" style={{ borderColor: AMBER, backgroundColor: "#FFF9F0" }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#7A4000" }}>What to upload here</p>
                <ul className="text-xs space-y-1.5" style={{ color: "#7A5030" }}>
                  {["Your workshop or build space", "In-progress builds — neck carving, body shaping, finishing", "Close-ups of materials, grain, and inlay work", "Tools and process details", "Finished builds (save product photos for the listing step later)"].map(i => (
                    <li key={i} className="flex items-start gap-2"><span>—</span> {i}</li>
                  ))}
                </ul>
              </div>
              <MediaUploader
                mediaUrls={form.media_urls || []}
                onChange={urls => setForm(f => ({ ...f, media_urls: urls }))}
              />
              <div className="border-t pt-6" style={{ borderColor: "#E3E0D8" }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#6B6B6B" }}>Introduction Video (optional)</p>
                <p className="text-xs mb-4" style={{ color: "#9A9A9A" }}>A shop walkthrough or builder interview adds a powerful human element to your storefront.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Video URL">
                    <input value={form.introduction_video_url || ""} onChange={e => setForm(f => ({ ...f, introduction_video_url: e.target.value }))} placeholder="https://youtube.com/watch?v=..." className="w-full border px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: "#DEDBD6" }} />
                  </Field>
                  <Field label="Video Caption">
                    <input value={form.introduction_video_title || ""} onChange={e => setForm(f => ({ ...f, introduction_video_title: e.target.value }))} placeholder='e.g. "A day in my shop"' className="w-full border px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: "#DEDBD6" }} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Your Business */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Years Building">
                  <Input field="years_experience" placeholder="e.g. 12" type="number" />
                </Field>
                <Field label="Total Instruments Built">
                  <Input field="total_instruments_built" placeholder="e.g. 150" type="number" />
                </Field>
                <Field label="Instruments Built Per Year">
                  <Input field="instruments_per_year" placeholder="e.g. 10" type="number" />
                </Field>
                <Field label="Typical Build Time">
                  <Input field="typical_build_time" placeholder="e.g. 3–6 months" />
                </Field>
              </div>

              {/* Instrument types */}
              <div className="p-5 border" style={{ borderColor: "#E3E0D8", backgroundColor: "#FAFAF8" }}>
                <p className="text-sm font-bold mb-1" style={{ color: "#1A1A1A" }}>What do you build?</p>
                <p className="text-xs mb-4" style={{ color: "#6A6A6A" }}>This appears prominently on your storefront and helps buyers find the right builder. Select all that apply.</p>
                <div className="flex flex-wrap gap-2">
                  {INSTRUMENT_TYPES.map(type => {
                    const current = form.instrument_types_built || [];
                    const entry = current.find(i => i.type === type);
                    const checked = !!entry;
                    return (
                      <div key={type} className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => {
                            let updated = [...current];
                            if (checked) updated = updated.filter(i => i.type !== type);
                            else updated.push({ type });
                            setForm(f => ({ ...f, instrument_types_built: updated }));
                          }}
                          className="px-4 py-2 text-xs font-semibold border transition-colors"
                          style={{
                            borderColor: checked ? NAVY : "#DEDBD6",
                            backgroundColor: checked ? NAVY : "#FFFFFF",
                            color: checked ? "#FFFFFF" : "#4A4A4A",
                          }}
                        >
                          {checked && <Check className="w-3 h-3 inline mr-1" />}
                          {type}
                        </button>
                        {checked && type === "Other" && (
                          <input
                            className="mt-1 border px-3 py-1.5 text-sm focus:outline-none"
                            style={{ borderColor: "#DEDBD6" }}
                            placeholder="Describe your instrument type..."
                            value={entry.other_description || ""}
                            onChange={e => {
                              const updated = (form.instrument_types_built || []).map(i => i.type === "Other" ? { ...i, other_description: e.target.value } : i);
                              setForm(f => ({ ...f, instrument_types_built: updated }));
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* What you offer */}
              <div className="p-5 border" style={{ borderColor: "#E3E0D8", backgroundColor: "#FAFAF8" }}>
                <p className="text-sm font-bold mb-1" style={{ color: "#1A1A1A" }}>What do you offer?</p>
                <p className="text-xs mb-4" style={{ color: "#6A6A6A" }}>This shapes how buyers interact with your storefront — what they can browse, buy, and request. You can offer one or both.</p>
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.offers_stock_builds || false} onChange={e => setForm(f => ({ ...f, offers_stock_builds: e.target.checked }))} className="h-4 w-4 mt-0.5" style={{ accentColor: NAVY }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>Stock Builds</p>
                      <p className="text-xs" style={{ color: "#7A7A7A" }}>Pre-made instruments listed with specs and a fixed price — ready to ship.</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.offers_custom_builds || false} onChange={e => setForm(f => ({ ...f, offers_custom_builds: e.target.checked }))} className="h-4 w-4 mt-0.5" style={{ accentColor: NAVY }} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>Custom Builds</p>
                      <p className="text-xs" style={{ color: "#7A7A7A" }}>Buyers submit a quote request with their desired specs — you build to order.</p>
                      {form.offers_custom_builds && (
                        <div className="mt-3 space-y-3">
                          <textarea
                            rows={3}
                            value={form.custom_build_description || ""}
                            onChange={e => setForm(f => ({ ...f, custom_build_description: e.target.value }))}
                            placeholder="Describe your custom build offering — instrument types, options, lead times, starting prices."
                            className="w-full border px-3 py-2.5 text-sm focus:outline-none resize-none"
                            style={{ borderColor: "#DEDBD6" }}
                          />
                          <CustomBuildExamples form={form} setForm={setForm} />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Shop Policies */}
          {step === 4 && (
            <div>
              <div className="mb-6 p-4 border-l-4" style={{ borderColor: AMBER, backgroundColor: "#FFF9F0" }}>
                <p className="text-xs font-bold" style={{ color: "#7A4000" }}>Required before your storefront goes live</p>
                <p className="text-xs mt-0.5" style={{ color: "#9A6030" }}>These terms are included in every purchase agreement on the platform. Clear policies protect both you and your buyers.</p>
              </div>
              <PoliciesEditor form={form} setForm={setForm} />
            </div>
          )}

          {/* STEP 6: Buyer References */}
          {step === 5 && (
            <div>
              <div className="mb-6 p-4 border" style={{ borderColor: "#E3E0D8", backgroundColor: "#FAFAF8" }}>
                <p className="text-xs font-bold mb-1" style={{ color: "#1A1A1A" }}>What are buyer references?</p>
                <p className="text-xs leading-relaxed" style={{ color: "#5A5A5A" }}>Past buyers can submit a short quote about their experience working with you. Once verified by Stringed Collective, these appear on your storefront as social proof.</p>
              </div>
              {profile ? (
                <ReferencesSection profile={profile} />
              ) : (
                <p className="text-sm text-center py-10" style={{ color: "#9A9A9A" }}>Save your profile first to add references.</p>
              )}
            </div>
          )}

          {/* STEP 7: Payments */}
          {step === 6 && (
            <div className="space-y-5">
              {[
                { icon: ShieldCheck, title: "Buyer funds are protected", body: "When a buyer pays, their funds are held securely by Stringed Collective — not released to you until the instrument is confirmed received. This protects the buyer and gives them confidence to purchase from independent builders." },
                { icon: CreditCard, title: "Your payouts are guaranteed", body: "Once delivery is confirmed, your payout is released reliably. No chargebacks to worry about, no platform delays on standard transactions." },
                { icon: Package, title: "Deposits are released on schedule", body: "For custom builds, deposits are released when the build begins. The final balance is released on confirmed delivery. First-time transactions include a brief verification hold." },
                { icon: Clock, title: "Payout timeline", body: "Standard payouts are processed within 3–5 business days after delivery confirmation. Custom build deposits are released at build start." },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-4 p-5 border" style={{ borderColor: "#E3E0D8", backgroundColor: "#FFFFFF" }}>
                  <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: NAVY }} strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-bold mb-1" style={{ color: "#1A1A1A" }}>{title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: "#5A5A5A" }}>{body}</p>
                  </div>
                </div>
              ))}
              <div className="p-5 border" style={{ borderColor: "#E3E0D8", backgroundColor: "#FAFAF8" }}>
                <p className="text-sm font-bold mb-1" style={{ color: "#1A1A1A" }}>Payout setup</p>
                <p className="text-xs leading-relaxed mb-3" style={{ color: "#5A5A5A" }}>Payout account details can be connected from your dashboard after your storefront is live. You'll be prompted to connect a bank account before your first transaction is processed.</p>
                <p className="text-xs font-medium" style={{ color: AMBER }}>You can complete this step from your dashboard.</p>
              </div>
            </div>
          )}

          {/* STEP 8: First Instrument */}
          {step === 7 && (
            <div className="space-y-6">
              {!skipInstrument ? (
                <>
                  <div className="p-4 border" style={{ borderColor: "#E3E0D8", backgroundColor: "#FAFAF8" }}>
                    <p className="text-xs leading-relaxed" style={{ color: "#5A5A5A" }}>
                      A listing gives your storefront immediate substance. Buyers can see your pricing, craftsmanship, and what kind of instruments you make — before they even reach out about a custom build.
                    </p>
                  </div>
                  <FirstInstrumentForm product={product} setProduct={setProduct} />
                  <button
                    type="button"
                    onClick={() => setSkipInstrument(true)}
                    className="text-xs underline"
                    style={{ color: "#9A9A9A" }}
                  >
                    Skip for now — I'll add instruments from my dashboard
                  </button>
                </>
              ) : (
                <div className="py-10 text-center">
                  <Guitar className="w-10 h-10 mx-auto mb-3" style={{ color: "#CCCCCC" }} />
                  <p className="text-sm font-semibold mb-1" style={{ color: "#3D3D3D" }}>No problem — you can add instruments later.</p>
                  <p className="text-xs mb-4" style={{ color: "#9A9A9A" }}>From your dashboard, go to Manage Products to add your first listing.</p>
                  <button type="button" onClick={() => setSkipInstrument(false)} className="text-xs underline" style={{ color: NAVY }}>
                    Actually, I'll add one now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 9: Launch */}
          {step === 8 && (
            <div className="space-y-6">
              {/* Completion checklist */}
              <div className="space-y-2">
                {[
                  { label: "Shop identity", done: !!(form.business_name && form.location) },
                  { label: "Brand story", done: !!(form.brand_story && form.brand_story.length > 80) },
                  { label: "Workshop photos", done: !!(form.media_urls && form.media_urls.length > 0) },
                  { label: "Instrument types & offerings", done: !!(form.years_experience && (form.offers_stock_builds || form.offers_custom_builds)) },
                  { label: "Shop policies", done: !!(form.warranty_duration || form.returns_accepted || form.shipping_insurance_included) },
                  { label: "First instrument", done: !!(skipInstrument ? false : product.name && product.price) },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-3 px-4 py-3 border" style={{ borderColor: "#E3E0D8", backgroundColor: done ? "#F0FBF4" : "#FFFFFF" }}>
                    <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full"
                      style={{ backgroundColor: done ? "#27AE60" : "#E3E0D8" }}>
                      {done && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm font-medium" style={{ color: done ? "#1A6B3A" : "#9A9A9A" }}>{label}</span>
                    {done && <span className="ml-auto text-xs font-semibold" style={{ color: "#27AE60" }}>Complete</span>}
                    {!done && <span className="ml-auto text-xs" style={{ color: "#CCCCCC" }}>Incomplete</span>}
                  </div>
                ))}
              </div>

              {/* Status */}
              <div className="p-5 text-center border" style={{ borderColor: "#E3E0D8", backgroundColor: "#F7F6F3" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#8A8A8A" }}>Storefront Status</p>
                <p className="text-2xl font-bold mb-1" style={{ color: NAVY }}>Ready for Review</p>
                <p className="text-xs" style={{ color: "#7A7A7A" }}>Your storefront will go live once approved by the Stringed Collective team.</p>
              </div>

              {/* Next steps */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#8A8A8A" }}>Suggested next steps</p>
                <div className="space-y-2">
                  {[
                    "Add more instrument listings",
                    "Share workshop activity photos",
                    "Deepen your brand story",
                    "Request verified buyer references",
                    "Connect your payout account",
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm" style={{ color: "#4A4A4A" }}>
                      <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: AMBER }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── NAV BUTTONS ── */}
          <div className="flex items-center justify-between mt-10 pt-6" style={{ borderTop: "1px solid #E3E0D8" }}>
            {step > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={saving}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 border transition-colors"
                style={{ borderColor: "#DEDBD6", color: "#4A4A4A", backgroundColor: "#FFFFFF" }}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={saving}
                className="flex items-center gap-2 text-sm font-semibold px-7 py-3 text-white transition-colors"
                style={{ backgroundColor: saving ? "#8A8A8A" : NAVY }}
              >
                {saving ? "Saving..." : "Continue"} <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLaunch}
                disabled={saving || savingProduct}
                className="flex items-center gap-2 text-sm font-bold px-8 py-3 text-white transition-colors"
                style={{ backgroundColor: saving || savingProduct ? "#8A8A8A" : "#27AE60" }}
              >
                {saving || savingProduct ? "Saving..." : <>Go to My Dashboard <ArrowRight className="w-4 h-4" /></>}
              </button>
            )}
          </div>

          {/* Save indicator */}
          {step < STEPS.length - 1 && (
            <p className="text-center text-xs mt-4" style={{ color: "#9A9A9A" }}>
              Progress is saved automatically when you continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}