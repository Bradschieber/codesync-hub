import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Hammer, CheckCircle, Users, DollarSign, Globe, LogIn } from "lucide-react";

export default function JoinBuilders() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in
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
        setExistingProfile(profiles[0]);
        const p = profiles[0];
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
      }
    }).catch(() => setUser(null));
  }, []);

  const SPECIALTIES = ["Electric Guitars", "Acoustic Guitars", "Bass Guitars", "Classical", "Archtop", "Custom Finishes", "Repairs"];

  function toggleSpec(s) {
    setForm(f => ({ ...f, specialties: f.specialties.includes(s) ? f.specialties.filter(x => x !== s) : [...f.specialties, s] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const u = await base44.auth.me();
      if (!u) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }
      await base44.entities.UserProfile.create({
        ...form,
        display_name: `${form.first_name} ${form.last_name}`.trim(),
        user_id: u.id,
        years_experience: Number(form.years_experience),
        is_seller: true,
        account: "seller",
        is_featured: false,
        is_published: false,
      });
      setSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    }
    setLoading(false);
  }

  if (user === undefined) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
    </div>
  );

  if (user === null) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 p-10 text-center shadow-sm">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <Hammer className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-stone-800 mb-3">Create a Free Account First</h1>
        <p className="text-stone-500 mb-6 leading-relaxed">
          To set up your builder storefront, you'll need a Stringed Collective account. It's free and only takes a minute.
        </p>
        <button
          onClick={() => base44.auth.redirectToLogin(window.location.href)}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
        >
          <LogIn className="w-5 h-5" /> Sign Up / Log In
        </button>
        <p className="text-stone-400 text-xs mt-4">Already have an account? The button above will log you in.</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-stone-800 mb-3">Storefront Created!</h1>
      <p className="text-stone-500 text-lg mb-6">Your builder storefront has been set up. It will go live once our team reviews and approves it — usually within 1–2 business days.</p>
      <Link to={createPageUrl("Dashboard")} className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-8 py-3 rounded-xl inline-block">Go to Dashboard</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-stone-900 to-amber-950 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Hammer className="w-14 h-14 text-amber-400 mx-auto mb-5" />
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Sell Your Guitars Here</h1>
          <p className="text-stone-300 text-xl mb-8 max-w-2xl mx-auto">
            Join a community of independent luthiers reaching thousands of discerning guitar buyers.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-5xl mx-auto px-4 py-12 grid sm:grid-cols-3 gap-6 text-center">
        {[
          { icon: Users, title: "Reach More Buyers", text: "Connect with players actively looking for handcrafted instruments." },
          { icon: DollarSign, title: "Keep More Earnings", text: "Competitive commission rates — you keep the majority of every sale." },
          { icon: Globe, title: "Build Your Brand", text: "Your own builder profile page, reviews, and custom build showcase." },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="bg-white rounded-2xl p-6 border border-stone-200">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-bold text-stone-800 mb-2">{title}</h3>
            <p className="text-stone-500 text-sm">{text}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl border border-stone-200 p-8">
          <h2 className="text-2xl font-bold text-stone-800 mb-1">Create Your Storefront</h2>
          <p className="text-stone-400 text-sm mb-6">Fill out the form below to get started. Your storefront will be reviewed before going live.</p>
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Business/Workshop Name *</label>
                <input required value={form.business_name} onChange={e => setForm({...form, business_name: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">First Name *</label>
                <input required value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Last Name *</label>
                <input required value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Email *</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Location</label>
                <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="City, State" className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Years of Experience</label>
                <input type="number" min="0" value={form.years_experience} onChange={e => setForm({...form, years_experience: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Website (optional)</label>
                <input value={form.website_url} onChange={e => setForm({...form, website_url: e.target.value})} placeholder="https://..." className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-2">Specialties</label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map(s => (
                  <button type="button" key={s} onClick={() => toggleSpec(s)} className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${form.specialties.includes(s) ? "bg-amber-600 text-white border-amber-600" : "border-stone-300 text-stone-600 hover:border-amber-400"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">About You & Your Craft *</label>
              <textarea required rows={4} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Tell us about your building experience, style, and what makes your instruments unique..." className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl transition-colors text-lg disabled:opacity-50">
              {loading ? "Creating Storefront..." : "Create My Storefront"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}