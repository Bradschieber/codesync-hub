import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Check, ArrowRight, ArrowLeft, Store, BookOpen, Camera, Hammer,
  ShieldCheck, Users, Guitar, Sparkles, MapPin, Globe,
  Instagram, Facebook, Upload, X, AlertCircle
} from "lucide-react";
import MediaUploader from "../components/dashboard/MediaUploader";
import PoliciesEditor from "../components/dashboard/PoliciesEditor";
import ReferencesSection from "../components/dashboard/ReferencesSection";
import CustomBuildExamples from "../components/dashboard/CustomBuildExamples";

const NAVY = "#2F3E55";

// ── Shared UI primitives ────────────────────────────────────────────

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: "#5A5A5A" }}>{label}</label>
      {hint && <p className="text-xs mb-2" style={{ color: "#9A9A9A" }}>{hint}</p>}
      {children}
    </div>
  );
}

function Input({ field, value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value || ""}
      onChange={e => onChange(field, type === "number" ? Number(e.target.value) : e.target.value)}
      placeholder={placeholder}
      className="w-full border px-3 py-2.5 text-sm focus:outline-none"
      style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF" }}
    />
  );
}

// Warm editorial guidance card
function GuidanceCard({ children }) {
  return (
    <div className="px-5 py-4 border-l-2" style={{ borderColor: "#C8A870", backgroundColor: "#FEFCF7" }}>
      {children}
    </div>
  );
}

// Neutral form section
function SectionCard({ children, className = "" }) {
  return (
    <div className={"border p-6 " + className} style={{ borderColor: "#E3E0D8", backgroundColor: "#FFFFFF" }}>
      {children}
    </div>
  );
}

// ── Steps ────────────────────────────────────────────────────────────

const STEPS = [
  { id: "shop",       label: "Your Shop",       icon: Store },
  { id: "story",      label: "Your Story",      icon: BookOpen },
  { id: "craft",      label: "Show Your Craft", icon: Camera },
  { id: "business",   label: "Your Business",   icon: Hammer },
  { id: "policies",   label: "Shop Policies",   icon: ShieldCheck },
  { id: "references", label: "References",      icon: Users },
  { id: "instrument", label: "First Listing",   icon: Guitar },
  { id: "launch",     label: "Launch",          icon: Sparkles },
];

const INSTRUMENT_TYPES = ["Electric Guitar", "Acoustic Guitar", "Electric Bass", "Acoustic Electric Bass", "Other"];

const STORY_PROMPTS = [
  { label: "Who You Are", hint: "Introduce yourself — where you're from, your background, what makes you, you." },
  { label: "Why You Build", hint: "What drew you to lutherie? Was there a moment or person that started it all?" },
  { label: "Your Philosophy", hint: "What makes a great playing experience? What do you obsess over when building?" },
  { label: "Your Journey", hint: "How long have you been building? How has your craft evolved?" },
  { label: "Your Shop", hint: "Tell us about where the magic happens — your setup, your tools, your process." },
];

// ── First Instrument Form ─────────────────────────────────────────────

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
        <label className="block text-xs font-semibold mb-1" style={{ color: "#5A5A5A" }}>Instrument Name *</label>
        <input
          value={product.name || ""}
          onChange={e => setProduct(p => ({ ...p, name: e.target.value }))}
          placeholder='e.g. "Walnut Short Scale Bass"'
          className="w-full border px-3 py-2.5 text-sm focus:outline-none"
          style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF" }}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "#5A5A5A" }}>Price ($) *</label>
          <input
            type="number"
            value={product.price || ""}
            onChange={e => setProduct(p => ({ ...p, price: Number(e.target.value) }))}
            placeholder="e.g. 2500"
            className="w-full border px-3 py-2.5 text-sm focus:outline-none"
            style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF" }}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "#5A5A5A" }}>Instrument Type</label>
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
        <label className="block text-xs font-semibold mb-1" style={{ color: "#5A5A5A" }}>Description</label>
        <textarea
          rows={3}
          value={product.description || ""}
          onChange={e => setProduct(p => ({ ...p, description: e.target.value }))}
          placeholder="Describe this instrument — materials, inspiration, what makes it special."
          className="w-full border px-3 py-2.5 text-sm focus:outline-none resize-none"
          style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF" }}
        />
      </div>

      {/* Photo upload — prominent */}
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: "#5A5A5A" }}>Photos</label>
        <p className="text-xs mb-3" style={{ color: "#9A9A9A" }}>Strong photos are the single biggest factor in whether a buyer reaches out. Add your best angles — front, back, detail shots.</p>
        <div className="flex flex-wrap gap-3">
          {(product.image_urls || []).map((url, i) => (
            <div key={i} className="relative w-28 h-28 overflow-hidden" style={{ border: "1px solid #DEDBD6" }}>
              <img src={url} className="w-full h-full object-cover" alt="" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow"
              >
                <X className="w-3 h-3" style={{ color: "#555" }} />
              </button>
            </div>
          ))}
          <label
            className="w-28 h-28 flex flex-col items-center justify-center cursor-pointer gap-1.5 transition-colors"
            style={{ border: "2px dashed #C8B99A", backgroundColor: "#FDFAF4", color: "#9A8A7A" }}
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span className="text-xs font-medium">Add photo</span>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </label>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────

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

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const currentStep = STEPS[step];
  const progressPct = Math.round((step / (STEPS.length - 1)) * 100);

  // Launch readiness
  const requiredItems = [
    { label: "Shop name & location", done: !!(form.business_name && form.location) },
    { label: "Shop policies (warranty, returns, shipping)", done: !!(form.warranty_duration || form.returns_accepted || form.shipping_insurance_included) },
    { label: "What you build & offer", done: !!(form.offers_stock_builds || form.offers_custom_builds) },
  ];
  const allRequiredDone = requiredItems.every(r => r.done);

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "#F7F6F3" }}>
      <div className="w-8 h-8 rounded-full animate-spin" style={{ border: "3px solid #E3E0D8", borderTopColor: NAVY }} />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F6F3" }}>

      {/* ── TOP STEPPER ── */}
      <div className="sticky top-0 z-40" style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E8E5E0" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex flex-col flex-shrink-0" style={{ lineHeight: 1.1 }}>
              <span className="font-bold text-sm" style={{ color: NAVY, letterSpacing: "0.02em" }}>Stringed</span>
              <span className="font-normal text-sm" style={{ color: NAVY, letterSpacing: "0.12em" }}>Collective</span>
            </div>

            {/* Step indicators — desktop */}
            <div className="hidden lg:flex items-center gap-0">
              {STEPS.map((s, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <div key={s.id} className="flex items-center">
                    <div
                      className="flex items-center gap-1.5 px-3 text-xs transition-all"
                      style={{
                        fontWeight: active ? 600 : 400,
                        color: active ? NAVY : done ? "#90B89A" : "#CCCCC0",
                        paddingTop: "4px",
                        paddingBottom: "6px",
                        borderBottom: active ? `2px solid ${NAVY}` : done ? "2px solid transparent" : "2px solid transparent",
                        opacity: active ? 1 : done ? 0.85 : 0.5,
                      }}
                    >
                      {done
                        ? <Check className="w-3 h-3 flex-shrink-0" style={{ color: "#90B89A" }} />
                        : <span className="flex-shrink-0" style={{ color: active ? NAVY : "#C8C4BC" }}>{i + 1}</span>
                      }
                      <span className="hidden xl:inline">{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="w-3 h-px" style={{ backgroundColor: "#E8E4DC" }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step count — mobile */}
            <div className="lg:hidden text-xs font-medium" style={{ color: "#8A8A8A" }}>
              Step {step + 1} of {STEPS.length}
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-px w-full" style={{ backgroundColor: "#E8E5E0" }}>
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
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#AAAA9A", letterSpacing: "0.12em" }}>
              Step {step + 1} of {STEPS.length} — {currentStep.label}
            </p>

            {step === 0 && <>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Welcome. Let's build your shop.</h1>
              <p className="text-base leading-relaxed" style={{ color: "#5A5A5A" }}>This is where buyers will find you, learn your story, and decide to reach out. Start with the basics — you can always refine later.</p>
            </>}
            {step === 1 && <>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Tell your story.</h1>
              <p className="text-base leading-relaxed" style={{ color: "#5A5A5A" }}>Buyers aren't just purchasing an instrument — they're investing in you. A genuine story is one of the most powerful things on your storefront.</p>
            </>}
            {step === 2 && <>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Show your craft.</h1>
              <p className="text-base leading-relaxed" style={{ color: "#5A5A5A" }}>Photos of your workshop, process, and materials bring your storefront to life. This is what earns trust before a word is read.</p>
            </>}
            {step === 3 && <>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Your business.</h1>
              <p className="text-base leading-relaxed" style={{ color: "#5A5A5A" }}>Help buyers understand what working with you looks like — your experience, your output, and what you offer.</p>
            </>}
            {step === 4 && <>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Shop policies.</h1>
              <p className="text-base leading-relaxed" style={{ color: "#5A5A5A" }}>Clear policies are embedded in every purchase agreement and protect both you and the buyer. These are required before your storefront goes live.</p>
            </>}
            {step === 5 && <>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Buyer references.</h1>
              <p className="text-base leading-relaxed" style={{ color: "#5A5A5A" }}>Past buyers who vouch for your work give new customers the confidence to reach out. This step is optional — you can add references anytime.</p>
            </>}
            {step === 6 && <>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Add your first instrument.</h1>
              <p className="text-base leading-relaxed" style={{ color: "#5A5A5A" }}>A listing gives your storefront immediate credibility. It shows buyers what your craft looks like in finished form — and often starts the conversation.</p>
            </>}
            {step === 7 && <>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#1A1A1A" }}>
                {allRequiredDone ? "Your storefront is ready for review." : "Almost there."}
              </h1>
              <p className="text-base leading-relaxed" style={{ color: "#5A5A5A" }}>
                {allRequiredDone
                  ? "You've completed everything needed. Our team will review your storefront within 1–2 business days."
                  : "A few required items still need attention before your storefront can be submitted for review."}
              </p>
            </>}
          </div>

          {/* ── STEP CONTENT ── */}

          {/* STEP 1: Your Shop */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Shop / Brand Name *" hint="The name buyers will see on your storefront.">
                  <Input field="business_name" value={form.business_name} onChange={updateForm} placeholder="e.g. Hartman Guitars" />
                </Field>
                <Field label="Location" hint="City, State — shown publicly.">
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#BBBBBB" }} />
                    <input
                      value={form.location || ""}
                      onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                      placeholder="e.g. Asheville, NC"
                      className="w-full border pl-8 pr-3 py-2.5 text-sm focus:outline-none"
                      style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF" }}
                    />
                  </div>
                </Field>
              </div>
              <Field label="Tagline" hint="One sentence that sums up your shop's identity.">
                <Input field="tag_line" value={form.tag_line} onChange={updateForm} placeholder='e.g. "Handbuilt electric guitars from the Pacific Northwest"' />
              </Field>

              <div className="pt-4 border-t" style={{ borderColor: "#E3E0D8" }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#BBBBBB" }}>Online presence <span className="normal-case font-normal">(optional)</span></p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Website">
                    <div className="relative">
                      <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#BBBBBB" }} />
                      <input value={form.website_url || ""} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} placeholder="https://..." className="w-full border pl-8 pr-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF" }} />
                    </div>
                  </Field>
                  <Field label="Instagram">
                    <div className="relative">
                      <Instagram className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#BBBBBB" }} />
                      <input value={form.instagram_url || ""} onChange={e => setForm(f => ({ ...f, instagram_url: e.target.value }))} placeholder="https://instagram.com/..." className="w-full border pl-8 pr-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF" }} />
                    </div>
                  </Field>
                  <Field label="Facebook">
                    <div className="relative">
                      <Facebook className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#BBBBBB" }} />
                      <input value={form.facebook_url || ""} onChange={e => setForm(f => ({ ...f, facebook_url: e.target.value }))} placeholder="https://facebook.com/..." className="w-full border pl-8 pr-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF" }} />
                    </div>
                  </Field>
                  <Field label="X (Twitter)">
                    <input value={form.x_url || ""} onChange={e => setForm(f => ({ ...f, x_url: e.target.value }))} placeholder="https://x.com/..." className="w-full border px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF" }} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Your Story */}
          {step === 1 && (
            <div className="space-y-6">
              <GuidanceCard>
                <p className="text-xs font-semibold mb-1" style={{ color: "#7A6030" }}>What good looks like</p>
                <p className="text-xs leading-relaxed" style={{ color: "#8A7040" }}>The best brand stories are specific and personal. Mention where you're from, who taught you, what you obsess over, and why you haven't stopped building. Buyers connect with people, not credentials.</p>
              </GuidanceCard>

              {/* Writing prompts */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#AAAA9A" }}>Writing prompts — tap one for inspiration</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {STORY_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActivePrompt(activePrompt === i ? null : i)}
                      className="text-left px-4 py-3 border transition-all"
                      style={{
                        borderColor: activePrompt === i ? NAVY : "#E3E0D8",
                        backgroundColor: activePrompt === i ? "#F2F5FA" : "#FFFFFF",
                      }}
                    >
                      <p className="text-xs font-semibold mb-0.5" style={{ color: activePrompt === i ? NAVY : "#4A4A4A" }}>{p.label}</p>
                      {activePrompt === i
                        ? <p className="text-xs leading-relaxed" style={{ color: "#5A5A5A" }}>{p.hint}</p>
                        : <p className="text-xs" style={{ color: "#C0BBB3" }}>Tap to expand →</p>
                      }
                    </button>
                  ))}
                </div>
              </div>

              <div className="border p-5" style={{ borderColor: "#E3E0D8", backgroundColor: "#FFFFFF" }}>
                <label className="block text-sm font-semibold mb-0.5" style={{ color: "#1A1A1A" }}>Your Brand Story</label>
                <p className="text-xs mb-3" style={{ color: "#8A8A8A" }}>Write in your own voice. The more personal and specific, the more buyers will connect with you.</p>
                <textarea
                  rows={14}
                  value={form.brand_story || ""}
                  onChange={e => setForm(f => ({ ...f, brand_story: e.target.value }))}
                  placeholder={`Write in your own voice — no need to be formal.\n\nE.g. "I grew up in a small town in Tennessee where my grandfather had a workshop that smelled like sawdust and linseed oil..."`}
                  className="w-full border-0 px-0 py-0 text-sm focus:outline-none resize-none leading-relaxed"
                  style={{ backgroundColor: "transparent", color: "#1A1A1A" }}
                />
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid #F0EDE8" }}>
                  <p className="text-xs" style={{ color: "#CCCCCC" }}>{form.brand_story?.length || 0} characters</p>
                  {(form.brand_story?.length || 0) > 80 && (
                    <p className="text-xs font-medium" style={{ color: "#90B89A" }}>Looking good ✓</p>
                  )}
                </div>
              </div>

              <Field label="Short Bio" hint="A 1–2 sentence summary shown on your profile card across the site. Optional.">
                <textarea
                  rows={2}
                  value={form.bio || ""}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="e.g. Builder of hand-carved electric guitars from Portland, OR. 15 years, ~120 instruments."
                  className="w-full border px-3 py-2.5 text-sm focus:outline-none resize-none"
                  style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF" }}
                />
              </Field>
            </div>
          )}

          {/* STEP 3: Show Your Craft */}
          {step === 2 && (
            <div className="space-y-8">
              <GuidanceCard>
                <p className="text-xs font-semibold mb-2" style={{ color: "#7A6030" }}>What to upload here</p>
                <ul className="text-xs space-y-1" style={{ color: "#8A7040" }}>
                  {[
                    "Your workshop or build space",
                    "In-progress builds — neck carving, body shaping, finishing",
                    "Close-ups of materials, grain, and inlay work",
                    "Tools and process details",
                    "Finished builds (save product photos for the listing step)",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2"><span>–</span> {item}</li>
                  ))}
                </ul>
                <p className="text-xs mt-3 font-medium" style={{ color: "#9A8060" }}>Workshop, process, material, and detail shots work best. Recommended: 4–8 photos.</p>
              </GuidanceCard>

              <MediaUploader
                mediaUrls={form.media_urls || []}
                onChange={urls => setForm(f => ({ ...f, media_urls: urls }))}
              />

              <div className="border-t pt-6" style={{ borderColor: "#E3E0D8" }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#AAAA9A" }}>Introduction Video <span className="normal-case font-normal">(optional)</span></p>
                <p className="text-xs mb-4" style={{ color: "#9A9A9A" }}>A shop walkthrough or short interview adds a powerful human element. Paste a YouTube or Vimeo link.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Video URL">
                    <input value={form.introduction_video_url || ""} onChange={e => setForm(f => ({ ...f, introduction_video_url: e.target.value }))} placeholder="https://youtube.com/watch?v=..." className="w-full border px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF" }} />
                  </Field>
                  <Field label="Video Caption">
                    <input value={form.introduction_video_title || ""} onChange={e => setForm(f => ({ ...f, introduction_video_title: e.target.value }))} placeholder='e.g. "A day in my shop"' className="w-full border px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF" }} />
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
                  <Input field="years_experience" value={form.years_experience} onChange={updateForm} placeholder="e.g. 12" type="number" />
                </Field>
                <Field label="Total Instruments Built">
                  <Input field="total_instruments_built" value={form.total_instruments_built} onChange={updateForm} placeholder="e.g. 150" type="number" />
                </Field>
                <Field label="Instruments Per Year">
                  <Input field="instruments_per_year" value={form.instruments_per_year} onChange={updateForm} placeholder="e.g. 10" type="number" />
                </Field>
                <Field label="Typical Build Time">
                  <Input field="typical_build_time" value={form.typical_build_time} onChange={updateForm} placeholder="e.g. 3–6 months" />
                </Field>
              </div>

              {/* What do you build */}
              <SectionCard>
                <p className="text-sm font-bold mb-1" style={{ color: "#1A1A1A" }}>What do you build?</p>
                <p className="text-xs mb-4" style={{ color: "#7A7A7A" }}>This appears prominently on your storefront and helps buyers find the right builder. Select all that apply.</p>
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
                          className="px-4 py-2 text-xs font-semibold border transition-all"
                          style={{
                            borderColor: checked ? NAVY : "#DEDBD6",
                            backgroundColor: checked ? NAVY : "#FAFAF8",
                            color: checked ? "#FFFFFF" : "#4A4A4A",
                          }}
                        >
                          {checked && <Check className="w-3 h-3 inline mr-1" />}
                          {type}
                        </button>
                        {checked && type === "Other" && (
                          <input
                            className="mt-1.5 border px-3 py-1.5 text-sm focus:outline-none"
                            style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF" }}
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
              </SectionCard>

              {/* What do you offer */}
              <SectionCard>
                <p className="text-sm font-bold mb-1" style={{ color: "#1A1A1A" }}>What do you offer?</p>
                <p className="text-xs mb-5" style={{ color: "#7A7A7A" }}>This shapes how buyers interact with your storefront. You can offer stock instruments, custom commissions, or both.</p>
                <div className="space-y-4">
                  <label
                    className="flex items-start gap-4 cursor-pointer p-4 border transition-all"
                    style={{
                      borderColor: form.offers_stock_builds ? NAVY : "#E3E0D8",
                      backgroundColor: form.offers_stock_builds ? "#F2F5FA" : "#FAFAF8",
                    }}
                  >
                    <input type="checkbox" checked={form.offers_stock_builds || false} onChange={e => setForm(f => ({ ...f, offers_stock_builds: e.target.checked }))} className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ accentColor: NAVY }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>Stock Builds</p>
                      <p className="text-xs mt-0.5" style={{ color: "#7A7A7A" }}>Pre-made instruments listed with specs and a fixed price — ready to ship.</p>
                    </div>
                  </label>
                  <label
                    className="flex items-start gap-4 cursor-pointer p-4 border transition-all"
                    style={{
                      borderColor: form.offers_custom_builds ? NAVY : "#E3E0D8",
                      backgroundColor: form.offers_custom_builds ? "#F2F5FA" : "#FAFAF8",
                    }}
                  >
                    <input type="checkbox" checked={form.offers_custom_builds || false} onChange={e => setForm(f => ({ ...f, offers_custom_builds: e.target.checked }))} className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ accentColor: NAVY }} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>Custom Builds</p>
                      <p className="text-xs mt-0.5" style={{ color: "#7A7A7A" }}>Buyers submit a quote request with their desired specs — you build to order.</p>
                      {form.offers_custom_builds && (
                        <div className="mt-4 space-y-3">
                          <textarea
                            rows={3}
                            value={form.custom_build_description || ""}
                            onChange={e => setForm(f => ({ ...f, custom_build_description: e.target.value }))}
                            placeholder="Describe your custom build offering — instrument types, options, lead times, starting prices."
                            className="w-full border px-3 py-2.5 text-sm focus:outline-none resize-none"
                            style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF" }}
                          />
                          <CustomBuildExamples form={form} setForm={setForm} />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </SectionCard>
            </div>
          )}

          {/* STEP 5: Shop Policies */}
          {step === 4 && (
            <div>
              <GuidanceCard>
                <p className="text-xs font-semibold mb-1" style={{ color: "#7A6030" }}>Required before your storefront goes live</p>
                <p className="text-xs leading-relaxed" style={{ color: "#8A7040" }}>These terms are embedded in every purchase agreement. Clear policies set expectations for buyers upfront and protect you if a dispute ever arises. You can refine them anytime from your dashboard.</p>
              </GuidanceCard>
              <PoliciesEditor form={form} setForm={setForm} />
            </div>
          )}

          {/* STEP 6: Buyer References */}
          {step === 5 && (
            <div className="space-y-5">
              <p className="text-xs leading-relaxed" style={{ color: "#7A7A7A" }}>
                Past buyers can submit a short testimonial about their experience working with you. Once verified by our team, these appear on your storefront as social proof. This step is entirely optional — most builders add references after their first sale.
              </p>
              {profile ? (
                <ReferencesSection profile={profile} />
              ) : (
                <p className="text-sm text-center py-10" style={{ color: "#9A9A9A" }}>Save your profile first to add references.</p>
              )}
            </div>
          )}

          {/* STEP 7: First Instrument */}
          {step === 6 && (
            <div className="space-y-6">
              {!skipInstrument ? (
                <>
                  <GuidanceCard>
                    <p className="text-xs font-semibold mb-1" style={{ color: "#7A6030" }}>Why this matters</p>
                    <p className="text-xs leading-relaxed" style={{ color: "#8A7040" }}>
                      A listing gives buyers immediate context — your pricing, your craftsmanship, your aesthetic. It's often the first thing that makes someone decide to reach out about a custom commission. Even one listing dramatically strengthens your storefront.
                    </p>
                  </GuidanceCard>
                  <FirstInstrumentForm product={product} setProduct={setProduct} />
                  <button
                    type="button"
                    onClick={() => setSkipInstrument(true)}
                    className="text-xs"
                    style={{ color: "#AAAAAA", textDecoration: "underline" }}
                  >
                    I don't have a finished instrument to list right now — skip for now
                  </button>
                </>
              ) : (
                <div className="py-12 text-center">
                  <Guitar className="w-10 h-10 mx-auto mb-4" style={{ color: "#D0CAC0" }} strokeWidth={1.5} />
                  <p className="text-sm font-semibold mb-1" style={{ color: "#3D3D3D" }}>No problem — you can add listings anytime.</p>
                  <p className="text-xs mb-1" style={{ color: "#9A9A9A" }}>From your dashboard, go to <strong>Manage Products</strong> to add your first instrument.</p>
                  <p className="text-xs mb-5" style={{ color: "#BBBBBB" }}>Storefronts with at least one listing get significantly more buyer interest.</p>
                  <button type="button" onClick={() => setSkipInstrument(false)} className="text-xs font-semibold" style={{ color: NAVY, textDecoration: "underline" }}>
                    Actually, I'll add one now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 8: Launch */}
          {step === 7 && (
            <div className="space-y-6">
              {/* Required items */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: allRequiredDone ? "#5A8A6A" : "#B04040" }}>
                  {allRequiredDone ? "Required — all complete" : "Required — action needed"}
                </p>
                <div className="space-y-2">
                  {requiredItems.map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-3 px-4 py-3 border" style={{
                      borderColor: done ? "#C0DEC8" : "#F0C0C0",
                      backgroundColor: done ? "#F4FBF6" : "#FFF5F5"
                    }}>
                      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full"
                        style={{ backgroundColor: done ? "#4A9A6A" : "#DC5050" }}>
                        {done
                          ? <Check className="w-3 h-3 text-white" />
                          : <span className="text-white text-xs font-bold leading-none">!</span>
                        }
                      </div>
                      <span className="text-sm font-medium" style={{ color: done ? "#1A5A3A" : "#7A2020" }}>{label}</span>
                      <span className="ml-auto text-xs font-semibold" style={{ color: done ? "#4A9A6A" : "#DC5050" }}>
                        {done ? "Complete" : "Needed"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended items */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#AAAA9A" }}>Recommended — strengthen your storefront</p>
                <div className="space-y-2">
                  {[
                    { label: "Brand story", done: !!(form.brand_story && form.brand_story.length > 80) },
                    { label: "Workshop photos", done: !!(form.media_urls && form.media_urls.length > 0) },
                    { label: "First instrument listing", done: !skipInstrument && !!(product.name && product.price) },
                    { label: "Buyer references", done: false },
                    { label: "Payout account connected", done: false, note: "Set up from your dashboard" },
                  ].map(({ label, done, note }) => (
                    <div key={label} className="flex items-center gap-3 px-4 py-3 border" style={{
                      borderColor: "#E3E0D8",
                      backgroundColor: done ? "#F4FBF6" : "#FFFFFF"
                    }}>
                      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full"
                        style={{ backgroundColor: done ? "#4A9A6A" : "#E3E0D8" }}>
                        {done && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm" style={{ color: done ? "#1A5A3A" : "#7A7A7A" }}>{label}</span>
                      <span className="ml-auto text-xs" style={{ color: done ? "#4A9A6A" : "#BBBBBB" }}>
                        {done ? "Complete" : (note || "Add later")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status card */}
              {allRequiredDone ? (
                <div className="p-6 text-center border" style={{ borderColor: "#C0DEC8", backgroundColor: "#F4FBF6" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: "#4A9A6A" }}>
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-bold mb-1" style={{ color: "#1A5A3A" }}>Ready for review</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#3A7A5A" }}>Our team will review your storefront and get you live within 1–2 business days. You can continue refining everything from your dashboard in the meantime.</p>
                </div>
              ) : (
                <div className="p-5 border" style={{ borderColor: "#F0C0C0", backgroundColor: "#FFF5F5" }}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#DC5050" }} />
                    <div>
                      <p className="text-sm font-semibold mb-1" style={{ color: "#7A2020" }}>Not ready for review yet</p>
                      <p className="text-xs leading-relaxed" style={{ color: "#9A4040" }}>Please complete the required items above. You can go back to any step to fill in missing information. Your progress is saved automatically.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── NAV BUTTONS ── */}
          <div className="flex items-center justify-between mt-12 pt-6" style={{ borderTop: "1px solid #E3E0D8" }}>
            {step > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={saving}
                className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 transition-colors"
                style={{ color: "#6A6A6A", border: "1px solid #DEDBD6", backgroundColor: "transparent" }}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={saving}
                className="flex items-center gap-2 text-sm font-semibold px-7 py-3 text-white transition-colors"
                style={{ backgroundColor: saving ? "#AAAAAA" : NAVY }}
              >
                {saving ? "Saving..." : "Continue"} <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLaunch}
                disabled={saving || savingProduct}
                className="flex items-center gap-2 text-sm font-bold px-8 py-3 text-white transition-colors"
                style={{ backgroundColor: saving || savingProduct ? "#AAAAAA" : (allRequiredDone ? "#4A9A6A" : NAVY) }}
              >
                {saving || savingProduct ? "Saving..." : <>Go to Builder Dashboard <ArrowRight className="w-4 h-4" /></>}
              </button>
            )}
          </div>

          {step < STEPS.length - 1 && (
            <p className="text-center text-xs mt-4" style={{ color: "#BBBBBB" }}>
              Progress is saved automatically when you continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}