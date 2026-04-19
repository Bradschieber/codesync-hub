import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Check, ArrowRight, ArrowLeft, Store, BookOpen, Camera, Hammer,
  ShieldCheck, Users, Sparkles, Globe,
  Instagram, Facebook
} from "lucide-react";
import MediaUploader from "../components/dashboard/MediaUploader";
import LocationFields from "../components/onboarding/LocationFields";
import PoliciesEditor from "../components/dashboard/PoliciesEditor";
import ReferencesSection from "../components/dashboard/ReferencesSection";
import CustomBuildExamples from "../components/dashboard/CustomBuildExamples";
import LegalAcceptanceBlock from "../components/legal/LegalAcceptanceBlock";
import LegalLink from "../components/legal/LegalLink";
import { LEGAL_URLS, LEGAL_VERSIONS, logLegalAcceptance } from "../lib/legalConfig";
import StripeConnectOnboarding from "../components/builder/StripeConnectOnboarding";

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
  { id: "stripe",     label: "Payments",        icon: ShieldCheck },
  { id: "complete",   label: "Next Steps",      icon: Sparkles },
];

const INSTRUMENT_TYPES = ["Electric Guitars", "Acoustic Guitars", "Electric Bass Guitars", "Acoustic Electric Bass Guitars", "Other"];

const STORY_PROMPTS = [
  { label: "Who You Are", hint: "Introduce yourself — where you're from, your background, what makes you, you." },
  { label: "Why You Build", hint: "What drew you to lutherie? Was there a moment or person that started it all?" },
  { label: "Your Philosophy", hint: "What makes a great playing experience? What do you obsess over when building?" },
  { label: "Your Journey", hint: "How long have you been building? How has your craft evolved?" },
  { label: "Your Shop", hint: "Tell us about where the magic happens — your setup, your tools, your process." },
];

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
  const [policyConfirmed, setPolicyConfirmed] = useState(false);


  useEffect(() => { loadUser(); }, []);

  async function loadUser() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      // Always start with a clean form — never pre-fill from an existing profile.
      // Setting profile to null ensures saveProfile always creates a new record.
      setProfile(null);
      setForm({
        is_seller: true,
        account: "seller",
        ships_domestically: true,
        user_id: u.id,
        email: u.email,
        display_name: u.full_name,
      });
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
    // On policies step, log acceptance if confirmed
    if (step === 4 && policyConfirmed) {
      const snapshotVersion = new Date().toISOString().slice(0, 10);
      await logLegalAcceptance(base44, {
        user,
        agreementType: "builder_policy_confirmation",
        checkboxLabels: ["I confirm that these builder-defined policies are accurate and understand that the policies shown at the time of purchase will govern the applicable transaction."],
        documentUrls: [LEGAL_URLS.builder_terms],
        versions: {
          builder_terms: LEGAL_VERSIONS.builder_terms,
          builder_policy_snapshot: snapshotVersion,
        },
        sourceScreen: "BuilderOnboarding/Policies",
      });
    }
    await saveProfile();
    if (step < STEPS.length - 1) setStep(s => s + 1);
  }

  async function handleBack() {
    await saveProfile();
    if (step > 0) setStep(s => s - 1);
  }

  async function handleLaunch() {
    await saveProfile();
    navigate(createPageUrl("Dashboard"));
  }

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const progressPct = Math.round((step / (STEPS.length - 1)) * 100);
  const shopName = form.business_name?.trim() || null;

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
            <div className="hidden lg:flex items-center">
              {STEPS.map((s, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <div key={s.id} className="flex items-center">
                    <div
                      className="flex items-center gap-1.5 px-2.5 text-xs transition-all"
                      style={{
                        fontWeight: active ? 600 : 400,
                        color: active ? NAVY : done ? "#90B89A" : "#C8C4BC",
                        paddingTop: "4px",
                        paddingBottom: "6px",
                        borderBottom: active ? `2px solid ${NAVY}` : "2px solid transparent",
                      }}
                    >
                      {done && <Check className="w-3 h-3 flex-shrink-0" style={{ color: "#90B89A" }} />}
                      <span className="hidden xl:inline">{s.label}</span>
                      {!done && <span className="xl:hidden" style={{ color: active ? NAVY : "#C8C4BC" }}>{i + 1}</span>}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="w-2 h-px flex-shrink-0" style={{ backgroundColor: "#E8E4DC" }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step count — mobile */}
            <div className="lg:hidden text-xs font-medium" style={{ color: "#8A8A8A" }}>
              Step {step + 1} of 7
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
              {step === 0 && "Foundation — Step 1 of 7"}
              {step === 1 && "Your Voice — Step 2 of 7"}
              {step === 2 && "Visual Identity — Step 3 of 7"}
              {step === 3 && "Your Offering — Step 4 of 7"}
              {step === 4 && "Step 5 of 7 — Shop Policies"}
              {step === 5 && "Step 6 of 8 — References"}
              {step === 6 && "Step 7 of 8 — Connect Stripe"}
              {step === 7 && "Step 8 of 8 — Next Steps"}
            </p>

            {step === 0 && <>
              <h1 className="text-3xl font-bold mb-3" style={{ color: "#1A1A1A" }}>Let's set up your storefront.</h1>
              <p className="text-base leading-relaxed" style={{ color: "#5A5A5A" }}>Start with the basics — your shop name, where you're based, and a line that says who you are. Everything here can be refined from your dashboard at any time.</p>
            </>}
            {step === 1 && <>
              <h1 className="text-3xl font-bold mb-3" style={{ color: "#1A1A1A" }}>
                {shopName ? `The story behind ${shopName}.` : "Tell buyers who you are."}
              </h1>
              <p className="text-base leading-relaxed" style={{ color: "#5A5A5A" }}>Buyers aren't just purchasing an instrument — they're choosing a maker. Your story is one of the most compelling things on your storefront. Start a first draft here and polish it anytime.</p>
            </>}
            {step === 2 && <>
              <h1 className="text-3xl font-bold mb-3" style={{ color: "#1A1A1A" }}>
                {shopName ? `Show what ${shopName} looks like.` : "Show your shop and your process."}
              </h1>
              <p className="text-base leading-relaxed" style={{ color: "#5A5A5A" }}>Workshop and process photos are what make a storefront feel real. They build trust before a buyer reads a single word — and often before they ever ask a question.</p>
            </>}
            {step === 3 && <>
              <h1 className="text-3xl font-bold mb-3" style={{ color: "#1A1A1A" }}>
                {shopName ? `How ${shopName} works.` : "How your shop works."}
              </h1>
              <p className="text-base leading-relaxed" style={{ color: "#5A5A5A" }}>Tell buyers what you make, how you work, and how they can purchase from you. This shapes how your storefront appears in search and how buyers decide to reach out.</p>
            </>}
            {step === 4 && <>
              <h1 className="text-3xl font-bold mb-3" style={{ color: "#1A1A1A" }}>Set clear expectations for buyers.</h1>
              <p className="text-base leading-relaxed" style={{ color: "#5A5A5A" }}>
                {shopName
                  ? `These policies shape how purchases work with ${shopName}. Clear terms help you and the buyer start from the same understanding — and create a stronger working relationship from the beginning.`
                  : "These policies shape how purchases work on your storefront. Clear terms help you and the buyer start from the same understanding — and create a stronger working relationship from the beginning."}
              </p>
            </>}
            {step === 5 && <>
              <h1 className="text-3xl font-bold mb-3" style={{ color: "#1A1A1A" }}>Add buyer references.</h1>
              <p className="text-base leading-relaxed" style={{ color: "#5A5A5A" }}>A few words from past buyers can help new customers feel more confident reaching out. This step is optional — you can add references now or later from your dashboard.</p>
            </>}
            {step === 6 && <>
              <h1 className="text-3xl font-bold mb-3" style={{ color: "#1A1A1A" }}>Connect your payment account.</h1>
              <p className="text-base leading-relaxed" style={{ color: "#5A5A5A" }}>Set up Stripe to receive payouts from your sales. This is required before you can publish listings.</p>
            </>}
            {step === 7 && <>
              <h1 className="text-3xl font-bold mb-3" style={{ color: "#1A1A1A" }}>Your storefront foundation is complete.</h1>
              <p className="text-base leading-relaxed" style={{ color: "#5A5A5A" }}>
                You've completed your builder profile, shop details, and policies. To submit your storefront for review, add at least one complete product listing buyers can explore.
              </p>
            </>}
          </div>

          {/* ── STEP CONTENT ── */}

          {/* STEP 1: Your Shop */}
          {step === 0 && (
            <div className="space-y-6">
              {/* Identity anchor — the name is the foundation */}
              <div className="border p-5" style={{ borderColor: "#D8D4CC", backgroundColor: "#FFFFFF" }}>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#2F3E55" }}>Shop or Brand Name *</label>
                <p className="text-xs mb-3" style={{ color: "#9A9A9A" }}>The name buyers will see on your storefront, in search results, and on every order. You can update this anytime.</p>
                <input
                  type="text"
                  value={form.business_name || ""}
                  onChange={e => updateForm("business_name", e.target.value)}
                  placeholder='e.g. "Hartman Guitars" or "Morrow Stringed Instruments"'
                  className="w-full border-0 border-b px-0 py-2 text-lg font-semibold focus:outline-none bg-transparent"
                  style={{ borderColor: "#E3E0D8", color: "#1A1A1A" }}
                />
              </div>

              <LocationFields form={form} setForm={setForm} />

              <Field label="Tagline (optional)" hint="A short line that captures your shop's identity — appears beneath your name on your storefront.">
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
                <p className="text-xs font-semibold mb-1" style={{ color: "#7A6030" }}>What buyers connect with</p>
                <p className="text-xs leading-relaxed" style={{ color: "#8A7040" }}>Buyers respond to specificity — your background, what you care about, how you work. A genuine story, at any stage of your career, is what makes someone choose to reach out. Start with a first draft and refine it whenever you're ready.</p>
              </GuidanceCard>

              {/* Writing prompts */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#AAAA9A" }}>Need a starting point?</p>
                <p className="text-xs mb-3" style={{ color: "#BBBBBB" }}>Tap a prompt to open it — use it as an anchor and let the rest follow.</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {STORY_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActivePrompt(activePrompt === i ? null : i)}
                      className="text-left px-4 py-3.5 border transition-all"
                      style={{
                        borderColor: activePrompt === i ? NAVY : "#E3E0D8",
                        backgroundColor: activePrompt === i ? "#F0F4FA" : "#FFFFFF",
                        boxShadow: activePrompt === i ? `inset 3px 0 0 ${NAVY}` : "none",
                      }}
                    >
                      <p className="text-xs font-bold mb-0.5" style={{ color: activePrompt === i ? NAVY : "#3A3A3A" }}>{p.label}</p>
                      {activePrompt === i
                        ? <p className="text-xs leading-relaxed mt-1.5" style={{ color: "#4A5A6A" }}>{p.hint}</p>
                        : <p className="text-xs" style={{ color: "#C0BDB8" }}>Expand →</p>
                      }
                    </button>
                  ))}
                </div>
              </div>

              {/* Story textarea — primary focal area */}
              <div className="border" style={{ borderColor: "#D8D4CC", backgroundColor: "#FFFFFF" }}>
                <div className="px-5 pt-5 pb-3">
                  <label className="block text-sm font-bold mb-0.5" style={{ color: "#1A1A1A" }}>
                    {shopName ? `The ${shopName} story` : "Your brand story"}
                  </label>
                  <p className="text-xs" style={{ color: "#9A9A9A" }}>In your own voice — honest, specific, and as long or short as feels right.</p>
                </div>
                <div className="px-5 pb-2">
                  <textarea
                    rows={13}
                    value={form.brand_story || ""}
                    onChange={e => setForm(f => ({ ...f, brand_story: e.target.value }))}
                    placeholder={`E.g. "I grew up in a small town in Tennessee where my grandfather had a workshop that smelled like sawdust and linseed oil. I've been building ever since — each instrument is a conversation between the wood and the player it's meant for..."`}
                    className="w-full border-0 px-0 py-0 text-sm focus:outline-none resize-none leading-relaxed"
                    style={{ backgroundColor: "transparent", color: "#1A1A1A" }}
                  />
                </div>
                <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid #F0EDE8" }}>
                  <p className="text-xs" style={{ color: "#CCCCCC" }}>{form.brand_story?.length || 0} characters</p>
                  {(form.brand_story?.length || 0) > 80 && (
                    <p className="text-xs font-semibold" style={{ color: "#90B89A" }}>Strong start ✓</p>
                  )}
                </div>
              </div>

              <Field label="Short Bio (optional)" hint="A brief public-facing introduction — shown on your profile card, in search results, and in other preview areas across the site. Your full story lives on your storefront.">
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

              {/* Elevated moment — this is the visual centrepiece of the flow */}
              <div className="border p-5" style={{ borderColor: "#D8D4CC", backgroundColor: "#FFFFFF" }}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-bold mb-1" style={{ color: "#1A1A1A" }}>
                      {shopName ? `Your ${shopName} gallery` : "Your craft gallery"}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "#7A7A7A" }}>
                      Workshop and process photos are what make buyers feel confident before they ever send a message. Show your bench, a build in progress, your materials — not just finished results. Start with 4–8 images. You can always add more.
                    </p>
                  </div>
                </div>

                {/* What to shoot */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                  {[
                    { label: "Workshop", sub: "Where you work" },
                    { label: "In Progress", sub: "Builds underway" },
                    { label: "Materials", sub: "Tonewoods, grain" },
                    { label: "Details", sub: "Craft up close" },
                  ].map(({ label, sub }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center justify-center py-3 px-2 text-center"
                      style={{ backgroundColor: "#F5F3EF", border: "1px solid #E8E4DC" }}
                    >
                      <span className="text-xs font-semibold mb-0.5" style={{ color: "#3A3A3A" }}>{label}</span>
                      <span className="text-xs" style={{ color: "#AAAAAA" }}>{sub}</span>
                    </div>
                  ))}
                </div>

                <MediaUploader
                  mediaUrls={form.media_urls || []}
                  onChange={urls => setForm(f => ({ ...f, media_urls: urls }))}
                />

                {(form.media_urls || []).length > 0 && (
                  <p className="text-xs mt-3 font-medium" style={{ color: "#90B89A" }}>
                    {(form.media_urls || []).length} photo{(form.media_urls || []).length !== 1 ? "s" : ""} added — your storefront is taking shape ✓
                  </p>
                )}
              </div>

              {/* Intro video — secondary */}
              <div className="border-t pt-6" style={{ borderColor: "#E3E0D8" }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#AAAA9A" }}>Introduction Video <span className="normal-case font-normal">(optional)</span></p>
                <p className="text-xs mb-4" style={{ color: "#9A9A9A" }}>A shop walkthrough or short interview adds a powerful human dimension to your storefront. Paste a YouTube or Vimeo link — it embeds directly on your builder page.</p>
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

              {/* Build credentials — framed as signal to buyers, not a form */}
              <div className="border p-5" style={{ borderColor: "#E3E0D8", backgroundColor: "#FFFFFF" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#2F3E55" }}>Your experience</p>
                <p className="text-xs mb-4" style={{ color: "#9A9A9A" }}>These figures appear on your storefront and help buyers understand the depth and pace of your work at a glance.</p>
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
              </div>

              {/* What do you build */}
              <SectionCard>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#2F3E55" }}>Instrument categories</p>
                <p className="text-xs mb-4" style={{ color: "#9A9A9A" }}>Used to match your storefront with buyers searching by instrument type. Select all that apply.</p>
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
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#2F3E55" }}>How buyers can purchase</p>
                <p className="text-xs mb-5" style={{ color: "#9A9A9A" }}>This shapes how buyers interact with your storefront — whether they're browsing finished instruments, requesting a custom quote, or both.</p>
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
                      <p className="text-xs mt-0.5" style={{ color: "#7A7A7A" }}>Finished instruments listed with specs and a set price — buyers purchase directly and you ship when ready.</p>
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
                      <p className="text-xs mt-0.5" style={{ color: "#7A7A7A" }}>Buyers submit a quote request with their specs — you build to order. Well suited to builders who work closely with clients from the start.</p>
                      {form.offers_custom_builds && (
                        <div className="mt-4 space-y-3">
                          <p className="text-xs" style={{ color: "#9A9A9A" }}>Describe your custom build offering so buyers know what to expect — instrument types, available options, lead times, starting prices, and how the process typically works.</p>
                          <textarea
                            rows={3}
                            value={form.custom_build_description || ""}
                            onChange={e => setForm(f => ({ ...f, custom_build_description: e.target.value }))}
                            placeholder="e.g. I build custom electric guitars and basses to order. Lead times are typically 4–8 months. Starting prices vary by spec. Reach out to start a conversation."
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
                <p className="text-xs font-semibold mb-1" style={{ color: "#7A6030" }}>How these policies are used</p>
                <p className="text-xs leading-relaxed" style={{ color: "#8A7040" }}>These terms are embedded into purchase agreements on the platform to protect both you and the buyer. Don't worry about making them perfect on the first pass — you can revise them anytime from your dashboard.</p>
              </GuidanceCard>
              <PoliciesEditor form={form} setForm={setForm} />

              {/* Policy confirmation */}
              <div className="mt-8 border p-5" style={{ borderColor: "#D8D4CC", backgroundColor: "#FFFFFF" }}>
                <p className="text-sm font-bold mb-1" style={{ color: "#1A1A1A" }}>Confirm your builder policies</p>
                <p className="text-xs mb-4 leading-relaxed" style={{ color: "#7A7A7A" }}>
                  These policies set expectations for buyers and will be incorporated into the applicable transaction agreement for custom-build orders.
                </p>

                {/* Policy summary */}
                <div className="grid sm:grid-cols-2 gap-3 mb-5">
                  {[
                    { label: "Deposit policy", value: form.deposit_required ? `${form.deposit_type === "fixed" ? `$${form.deposit_fixed_amount}` : `${form.deposit_percent}%`} deposit required` : "No deposit required" },
                    { label: "Expected build timeline", value: form.typical_build_time || "Not specified" },
                    { label: "Return policy", value: form.returns_accepted === "yes" ? `Returns accepted (${form.return_window_days || "?"}d window)` : form.returns_accepted === "no" ? "No returns" : form.returns_accepted === "case_by_case" ? "Case-by-case" : "Not specified" },
                    { label: "Warranty policy", value: form.warranty_duration || (form.warranty_coverage?.find(c => c.duration)?.duration ? "Coverage defined" : "Not specified") },
                  ].map(({ label, value }) => (
                    <div key={label} className="px-3 py-2" style={{ backgroundColor: "#F7F5F2", border: "1px solid #ECEAE5" }}>
                      <p className="text-xs font-semibold mb-0.5" style={{ color: "#5A5A5A" }}>{label}</p>
                      <p className="text-xs" style={{ color: "#1A1A1A" }}>{value}</p>
                    </div>
                  ))}
                </div>

                <LegalAcceptanceBlock
                  checkboxes={[{
                    id: "policy_confirm",
                    label: "I confirm that these builder-defined policies are accurate and understand that the policies shown at the time of purchase will govern the applicable transaction.",
                  }]}
                  checked={{ policy_confirm: policyConfirmed }}
                  onChange={(_, val) => setPolicyConfirmed(val)}
                  smallPrint="You can update these policies later, but the version shown to the buyer at the time of purchase will apply to that order."
                />
              </div>
            </div>
          )}

          {/* STEP 6: Buyer References */}
          {step === 5 && (
            <div className="space-y-6">
              <GuidanceCard>
                <p className="text-xs font-semibold mb-1" style={{ color: "#7A6030" }}>Why references help</p>
                <p className="text-xs leading-relaxed" style={{ color: "#8A7040" }}>
                  Buyer references act as social proof on your storefront. After our team verifies them, they help signal credibility to people discovering your work for the first time.
                </p>
              </GuidanceCard>
              {profile ? (
                <ReferencesSection profile={profile} />
              ) : (
                <p className="text-sm text-center py-10" style={{ color: "#9A9A9A" }}>Save your profile first to add references.</p>
              )}
              <p className="text-xs text-center" style={{ color: "#BBBBBB" }}>Most builders add references after they've made a few sales — you can always come back to this.</p>
            </div>
          )}

          {/* STEP 7: Connect Stripe */}
          {step === 6 && (
            <div className="space-y-6">
              <GuidanceCard>
                <p className="text-xs font-semibold mb-1" style={{ color: "#7A6030" }}>Why Stripe is required</p>
                <p className="text-xs leading-relaxed" style={{ color: "#8A7040" }}>All payments on Stringed Collective flow through Stripe. Connecting your account is required before you can publish listings or receive payouts. The setup takes about 5 minutes.</p>
              </GuidanceCard>
              <StripeConnectOnboarding profile={form} onStatusUpdate={(updates) => setForm(f => ({ ...f, ...updates }))} />
            </div>
          )}

          {/* STEP 8: Complete / Next Steps */}
          {step === 7 && (
            <div className="space-y-6">

              {/* What's complete */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#5A8A6A" }}>Complete</p>
                <div className="space-y-2">
                  {[
                    { label: "Shop name & location", done: !!(form.business_name && (form.business_city || form.location)) },
                    { label: "Builder story", done: !!(form.brand_story && form.brand_story.length > 80) },
                    { label: "Craft photos", done: !!(form.media_urls && form.media_urls.length > 0) },
                    { label: "Business details", done: !!(form.offers_stock_builds || form.offers_custom_builds) },
                    { label: "Shop policies", done: !!(form.warranty_duration || form.returns_accepted || form.shipping_insurance_included) },
                  ].map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-3 px-4 py-3 border" style={{
                      borderColor: done ? "#C0DEC8" : "#E3E0D8",
                      backgroundColor: done ? "#F4FBF6" : "#FAFAF8"
                    }}>
                      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full"
                        style={{ backgroundColor: done ? "#4A9A6A" : "#E3E0D8" }}>
                        {done && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm" style={{ color: done ? "#1A5A3A" : "#9A9A9A" }}>{label}</span>
                      <span className="ml-auto text-xs font-semibold" style={{ color: done ? "#4A9A6A" : "#BBBBBB" }}>
                        {done ? "Complete" : "Not yet"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required before launch */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#C8973A" }}>Required before launch</p>
                <div className="flex items-center gap-3 px-4 py-3 border" style={{ borderColor: "#E8D9B8", backgroundColor: "#FFFAF2" }}>
                  <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full" style={{ backgroundColor: "#E8D9B8" }}>
                    <span className="text-xs font-bold" style={{ color: "#C8973A" }}>1</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: "#6A4A10" }}>First product listing</span>
                  <span className="ml-auto text-xs font-semibold" style={{ color: "#C8973A" }}>Add from dashboard</span>
                </div>
              </div>

              {/* Context card */}
              <div className="px-5 py-4 border-l-2" style={{ borderColor: NAVY, backgroundColor: "#F2F5FA" }}>
                <p className="text-xs leading-relaxed" style={{ color: "#4A5A6A" }}>
                  You can continue refining your profile anytime, but at least one completed listing is required before your storefront can be submitted for review.
                </p>
              </div>
            </div>
          )}

          {/* ── NAV BUTTONS ── */}
          <div className="flex items-center justify-between mt-12 pt-6" style={{ borderTop: "1px solid #E8E4DC" }}>
            {step > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={saving}
                className="flex items-center gap-2 text-sm font-medium px-6 py-3 transition-all"
                style={{ color: "#7A7A7A", border: "1px solid #E0DDD8", backgroundColor: "transparent", letterSpacing: "0.01em" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#C0BBB3"; e.currentTarget.style.color = "#4A4A4A"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#E0DDD8"; e.currentTarget.style.color = "#7A7A7A"; }}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={saving || (step === 4 && !policyConfirmed)}
                className="flex items-center gap-2 text-sm font-semibold px-7 py-3 text-white transition-all"
                style={{ backgroundColor: (saving || (step === 4 && !policyConfirmed)) ? "#AAAAAA" : NAVY, letterSpacing: "0.01em" }}
              >
                {saving ? "Saving..." : "Save Policies & Continue"} <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-3">
                {profile?.id && (
                  <a
                    href={createPageUrl("BuilderProfile") + `?id=${profile.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm font-medium px-6 py-3 border transition-all"
                    style={{ color: NAVY, borderColor: NAVY, backgroundColor: "transparent" }}
                  >
                    Preview Storefront
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleLaunch}
                  disabled={saving}
                  className="flex items-center gap-2 text-sm font-semibold px-8 py-3 text-white transition-all"
                  style={{ backgroundColor: saving ? "#AAAAAA" : NAVY, letterSpacing: "0.01em" }}
                >
                  {saving ? "Saving..." : <>Go to Builder Dashboard <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            )}
          </div>

          {step < STEPS.length - 1 && (
            <p className="text-center text-xs mt-4" style={{ color: "#C8C4BC" }}>
              Progress is saved automatically when you continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}