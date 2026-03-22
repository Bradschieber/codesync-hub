import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { X, Hammer, CheckCircle } from "lucide-react";
import LegalAcceptanceBlock from "@/components/legal/LegalAcceptanceBlock";
import LegalLink from "@/components/legal/LegalLink";
import { LEGAL_URLS, LEGAL_VERSIONS, logLegalAcceptance } from "@/lib/legalConfig";

const NAVY = "#1B2B4B";
const SPECIALTIES = ["Electric Guitars", "Acoustic Guitars", "Bass Guitars", "Classical", "Archtop", "Custom Finishes", "Repairs"];

export default function BuilderAccountFormModal({ onClose }) {
  const [user, setUser] = useState(undefined);
  const [existingProfile, setExistingProfile] = useState(null);
  const [form, setForm] = useState({ business_name: "", first_name: "", last_name: "", email: "", location: "", bio: "", years_experience: "", specialties: [], website_url: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [legalChecked, setLegalChecked] = useState({ terms_privacy: false, builder_terms: false });

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) {
        const p = profiles[0];
        setExistingProfile(p);
        setForm(f => ({
          ...f,
          first_name: p.first_name || "",
          last_name: p.last_name || "",
          email: p.email || u.email || "",
          location: p.location || "",
          bio: p.bio || "",
          years_experience: p.years_experience || "",
          website_url: p.website_url || "",
          specialties: p.specialties || [],
        }));
      } else {
        setForm(f => ({ ...f, email: u.email || "" }));
      }
    }).catch(() => setUser(null));
  }, []);

  function toggleSpec(s) {
    setForm(f => ({ ...f, specialties: f.specialties.includes(s) ? f.specialties.filter(x => x !== s) : [...f.specialties, s] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const u = await base44.auth.me();
      if (!u) { base44.auth.redirectToLogin(window.location.href); return; }
      const profileData = {
        ...form,
        display_name: `${form.first_name} ${form.last_name}`.trim(),
        user_id: u.id,
        years_experience: Number(form.years_experience),
        is_seller: true,
        account: "seller",
      };
      if (existingProfile) {
        await base44.entities.UserProfile.update(existingProfile.id, profileData);
      } else {
        await base44.entities.UserProfile.create({ ...profileData, is_featured: false });
      }
      // Log legal acceptance
      await logLegalAcceptance(base44, {
        user: u,
        agreementType: "builder_account_creation",
        checkboxLabels: [
          "I agree to the Terms of Use and Privacy Policy.",
          "I agree to the Builder Terms.",
        ],
        documentUrls: [LEGAL_URLS.terms_of_use, LEGAL_URLS.privacy_policy, LEGAL_URLS.builder_terms],
        versions: {
          terms_of_use: LEGAL_VERSIONS.terms_of_use,
          privacy_policy: LEGAL_VERSIONS.privacy_policy,
          builder_terms: LEGAL_VERSIONS.builder_terms,
        },
        sourceScreen: "BuilderAccountFormModal",
      });
      setSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#E0DDD8" }}>
          <div className="flex items-center gap-2">
            <Hammer className="w-5 h-5" style={{ color: NAVY }} strokeWidth={1.5} />
            <h2 className="font-bold text-base" style={{ color: "#1A1A1A" }}>
              {submitted ? "Builder Profile Created" : "Create Your Builder Profile"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-6">
          {/* Not logged in */}
          {user === null && (
            <div className="py-6">
              <p className="text-sm font-semibold mb-2" style={{ color: "#1A1A1A" }}>Create your builder account and start building your storefront.</p>
              <p className="text-xs mb-6 leading-relaxed" style={{ color: "#7A7A7A" }}>It takes just a minute to create your account. Then we'll guide you through your complete storefront setup — step by step.</p>
              <div className="space-y-3 mb-6">
                {[
                  { step: "1", label: "Create a free account", detail: "Sign up with your email and verify — takes under a minute." },
                  { step: "2", label: "Build your storefront", detail: "We'll walk you through your shop, story, policies, and first listing." },
                  { step: "3", label: "Go live after review", detail: "Our team approves your storefront within 1–2 business days." },
                ].map(({ step, label, detail }) => (
                  <div key={step} className="flex items-start gap-4">
                    <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white rounded-full" style={{ backgroundColor: NAVY }}>{step}</div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>{label}</p>
                      <p className="text-xs" style={{ color: "#7A7A7A" }}>{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mb-6 p-3 border-l-2" style={{ borderColor: "#C57A1F", backgroundColor: "#FFF9F0" }}>
                <p className="text-xs font-bold mb-0.5" style={{ color: "#7A4000" }}>After you verify your email</p>
                <p className="text-xs leading-relaxed" style={{ color: "#9A6030" }}>You'll be taken directly into your storefront setup. No need to come back here.</p>
              </div>
              <button
                onClick={() => base44.auth.redirectToLogin("/BuilderOnboarding")}
                className="w-full font-semibold px-6 py-3 text-sm text-white transition-colors"
                style={{ backgroundColor: NAVY }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
              >
                Create a Free Account & Get Started →
              </button>
              <p className="text-xs text-center mt-3" style={{ color: "#9A9A9A" }}>Already have an account? Sign in to go straight to your builder setup.</p>
            </div>
          )}

          {/* Loading auth */}
          {user === undefined && (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
            </div>
          )}

          {/* Success state */}
          {user && submitted && (
            <div className="text-center py-8">
              <CheckCircle className="w-14 h-14 mx-auto mb-4" style={{ color: "#27AE60" }} />
              <h3 className="text-xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Account ready — let's build your storefront.</h3>
              <p className="text-sm mb-6" style={{ color: "#5A5A5A" }}>
                We'll walk you through your shop setup step by step. Once complete, our team will review and get you live within 1–2 business days.
              </p>
              <button
                onClick={() => { window.location.href = createPageUrl("BuilderOnboarding"); }}
                className="font-semibold px-6 py-3 text-sm text-white transition-colors"
                style={{ backgroundColor: NAVY }}
              >
                Continue to Builder Setup →
              </button>
            </div>
          )}

          {/* Form */}
          {user && !submitted && (
            <>
              <p className="text-sm mb-5" style={{ color: "#6B6B6B" }}>Fill out the form below to create your builder profile. You'll be able to complete your storefront from there before it goes live.</p>
              {error && <div className="mb-4 p-3 text-sm rounded" style={{ backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium mb-1" style={{ color: "#4A5566" }}>Business / Workshop Name *</label>
                    <input required value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} className="w-full border px-3 py-2 text-sm focus:outline-none focus:ring-1" style={{ borderColor: "#D1D5DB", focusRingColor: NAVY }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "#4A5566" }}>First Name *</label>
                    <input required value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className="w-full border px-3 py-2 text-sm focus:outline-none focus:ring-1" style={{ borderColor: "#D1D5DB" }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "#4A5566" }}>Last Name *</label>
                    <input required value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className="w-full border px-3 py-2 text-sm focus:outline-none focus:ring-1" style={{ borderColor: "#D1D5DB" }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "#4A5566" }}>Email *</label>
                    <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border px-3 py-2 text-sm focus:outline-none focus:ring-1" style={{ borderColor: "#D1D5DB" }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "#4A5566" }}>Location</label>
                    <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="City, State" className="w-full border px-3 py-2 text-sm focus:outline-none focus:ring-1" style={{ borderColor: "#D1D5DB" }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "#4A5566" }}>Years of Experience</label>
                    <input type="number" min="0" value={form.years_experience} onChange={e => setForm({ ...form, years_experience: e.target.value })} className="w-full border px-3 py-2 text-sm focus:outline-none focus:ring-1" style={{ borderColor: "#D1D5DB" }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "#4A5566" }}>Website (optional)</label>
                    <input value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} placeholder="https://..." className="w-full border px-3 py-2 text-sm focus:outline-none focus:ring-1" style={{ borderColor: "#D1D5DB" }} />
                  </div>
                </div>


                <LegalAcceptanceBlock
                  checkboxes={[
                    {
                      id: "terms_privacy",
                      label: <>I agree to the <LegalLink href={LEGAL_URLS.terms_of_use}>Terms of Use</LegalLink> and <LegalLink href={LEGAL_URLS.privacy_policy}>Privacy Policy</LegalLink>.</>,
                    },
                    {
                      id: "builder_terms",
                      label: <>I agree to the <LegalLink href={LEGAL_URLS.builder_terms}>Builder Terms</LegalLink>.</>,
                    },
                  ]}
                  checked={legalChecked}
                  onChange={(id, val) => setLegalChecked(prev => ({ ...prev, [id]: val }))}
                  smallPrint='By selecting "Create My Builder Profile," you agree to the Terms of Use, Privacy Policy, and Builder Terms.'
                />
                <button
                  type="submit"
                  disabled={loading || !legalChecked.terms_privacy || !legalChecked.builder_terms}
                  className="w-full font-semibold py-3 text-sm text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: NAVY }}
                >
                  {loading ? "Creating Profile..." : "Create My Builder Profile"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}