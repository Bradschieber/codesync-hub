import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { X, Hammer, CheckCircle } from "lucide-react";

const NAVY = "#1B2B4B";
const SPECIALTIES = ["Electric Guitars", "Acoustic Guitars", "Bass Guitars", "Classical", "Archtop", "Custom Finishes", "Repairs"];

export default function BuilderAccountFormModal({ onClose }) {
  const [user, setUser] = useState(undefined);
  const [existingProfile, setExistingProfile] = useState(null);
  const [form, setForm] = useState({ business_name: "", first_name: "", last_name: "", email: "", location: "", bio: "", years_experience: "", specialties: [], website_url: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
            <div className="text-center py-8">
              <p className="text-sm mb-4" style={{ color: "#5A5A5A" }}>You need to be signed in to create a builder account.</p>
              <button
                onClick={() => base44.auth.redirectToLogin(window.location.href)}
                className="font-semibold px-6 py-3 text-sm text-white transition-colors"
                style={{ backgroundColor: NAVY }}
              >
                Sign In / Sign Up
              </button>
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
              <h3 className="text-xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Builder Profile Created!</h3>
              <p className="text-sm mb-3" style={{ color: "#5A5A5A" }}>
                Your builder profile has been set up. Head to your Builder Profile page to continue completing your profile and building your storefront.
              </p>
              <p className="text-sm mb-6" style={{ color: "#5A5A5A" }}>
                Once you've finished, our team will review your storefront — usually within 1–2 business days.
              </p>
              <button
                onClick={() => { window.location.href = createPageUrl("DashboardProfile"); }}
                className="font-semibold px-6 py-3 text-sm text-white transition-colors"
                style={{ backgroundColor: NAVY }}
              >
                Go to Builder Profile
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

                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: "#4A5566" }}>Specialties</label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTIES.map(s => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => toggleSpec(s)}
                        className="px-3 py-1.5 text-xs border transition-colors"
                        style={form.specialties.includes(s)
                          ? { backgroundColor: NAVY, color: "#fff", borderColor: NAVY }
                          : { backgroundColor: "#fff", color: "#4A5566", borderColor: "#D1D5DB" }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#4A5566" }}>About You & Your Craft *</label>
                  <textarea
                    required
                    rows={4}
                    value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    placeholder="Tell us about your building experience, style, and what makes your instruments unique..."
                    className="w-full border px-3 py-2 text-sm focus:outline-none focus:ring-1 resize-none"
                    style={{ borderColor: "#D1D5DB" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full font-semibold py-3 text-sm text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: NAVY }}
                >
                  {loading ? "Creating Storefront..." : "Create My Storefront"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}