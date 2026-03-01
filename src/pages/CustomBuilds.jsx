import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Guitar, Clock, DollarSign, X, Check, ArrowRight } from "lucide-react";

const NAVY = "#1B2B4B";

export default function CustomBuilds() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try { const u = await base44.auth.me(); setUser(u); } catch {}
    const data = await base44.entities.CustomBuildListing.filter({ is_published: true }, "-created_date", 100);
    setListings(data);
    setLoading(false);
  }

  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>
      {/* Page Header */}
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-8 items-end">
            <div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight" style={{ color: "#1A1A1A" }}>Custom Builds</h1>
              <p className="text-base" style={{ color: "#5A5A5A" }}>Work directly with a builder to commission your instrument.</p>
            </div>
            <div className="sm:text-right">
              <Link
                to={createPageUrl("JoinBuilders")}
                className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3 border transition-colors"
                style={{ borderColor: NAVY, color: NAVY, backgroundColor: "#FFFFFF" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#EEF1F7"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#FFFFFF"; }}
              >
                Are you a builder? Apply <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse border p-5" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
                <div className="mb-4" style={{ height: 180, backgroundColor: "#EBEBEB" }} />
                <div className="h-4 rounded w-3/4 mb-2" style={{ backgroundColor: "#EBEBEB" }} />
                <div className="h-3 rounded w-full" style={{ backgroundColor: "#F0F0F0" }} />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-24">
            <Guitar className="w-12 h-12 mx-auto mb-4" style={{ color: "#CCCCCC" }} />
            <h3 className="text-base font-bold mb-1" style={{ color: "#3D3D3D" }}>No custom listings yet</h3>
            <p className="text-sm" style={{ color: "#9A9A9A" }}>Check back soon or become a builder yourself.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <div key={listing.id} className="border flex flex-col" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
                <div className="overflow-hidden" style={{ height: 200, backgroundColor: "#EBEBEB" }}>
                  {listing.image_urls?.[0] ? (
                    <img src={listing.image_urls[0]} className="w-full h-full object-cover" alt={listing.listing_title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Guitar className="w-12 h-12" style={{ color: "#CCCCCC" }} />
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#8A8A8A" }}>{listing.builder_name}</p>
                  <h3 className="font-bold text-base mb-2 leading-snug" style={{ color: "#1A1A1A" }}>{listing.listing_title}</h3>
                  <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: "#5A5A5A" }}>{listing.short_description}</p>
                  <div className="flex flex-wrap gap-4 text-xs mb-5" style={{ color: "#7A7A7A" }}>
                    {listing.starting_price && (
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> From ${listing.starting_price.toLocaleString()}</span>
                    )}
                    {listing.estimated_build_time && (
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {listing.estimated_build_time}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedListing(listing)}
                    className="w-full font-semibold py-3 text-sm text-white transition-colors"
                    style={{ backgroundColor: NAVY }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
                  >
                    Request This Build
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedListing && (
        <CustomBuildRequestModal
          listing={selectedListing}
          user={user}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  );
}

function CustomBuildRequestModal({ listing, user, onClose }) {
  const [form, setForm] = useState({
    customer_name: user?.full_name || "",
    customer_email: user?.email || "",
    customer_phone: "",
    description: "",
    budget_range: "",
    timeline_preference: "",
  });
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    await base44.entities.CustomBuildRequest.create({
      ...form,
      builder_id: listing.builder_id,
      listing_id: listing.id,
      build_type: listing.instrument_type,
      status: "pending",
    });
    setSubmitted(true);
  }

  const inputClass = "w-full border px-3 py-2.5 text-sm focus:outline-none";
  const inputStyle = { borderColor: "#DEDBD6", backgroundColor: "#FFFFFF", color: "#1A1A1A" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg shadow-2xl my-4" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "#E0DDD8" }}>
          <h3 className="text-base font-bold" style={{ color: "#1A1A1A" }}>Request Custom Build</h3>
          <button onClick={onClose} className="p-1 hover:opacity-60 transition-opacity" style={{ color: "#6B6B6B" }}>
            <X className="w-5 h-5" />
          </button>
        </div>
        {submitted ? (
          <div className="p-10 text-center">
            <Check className="w-10 h-10 mx-auto mb-4" style={{ color: "#27AE60" }} />
            <h4 className="text-lg font-bold mb-2" style={{ color: "#1A1A1A" }}>Request Sent</h4>
            <p className="text-sm mb-6" style={{ color: "#5A5A5A" }}>{listing.builder_name} will review your request and follow up with you.</p>
            <button onClick={onClose} className="font-semibold px-8 py-3 text-sm text-white" style={{ backgroundColor: NAVY }}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="p-3 text-sm" style={{ backgroundColor: "#EEF1F7", color: "#1B2B4B" }}>
              <strong>{listing.listing_title}</strong> by {listing.builder_name}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>Your Name *</label>
                <input required value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>Email *</label>
                <input required type="email" value={form.customer_email} onChange={e => setForm({ ...form, customer_email: e.target.value })} className={inputClass} style={inputStyle} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>Phone (optional)</label>
              <input value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })} className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>Describe your instrument *</label>
              <textarea required rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Wood types, finish, pickups, neck profile, scale length..." className={inputClass + " resize-none"} style={inputStyle} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>Budget Range</label>
                <select value={form.budget_range} onChange={e => setForm({ ...form, budget_range: e.target.value })} className={inputClass} style={inputStyle}>
                  <option value="">Select...</option>
                  <option>Under $2,000</option>
                  <option>$2,000 - $5,000</option>
                  <option>$5,000 - $10,000</option>
                  <option>$10,000+</option>
                  <option>Flexible</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#6B6B6B" }}>Timeline</label>
                <select value={form.timeline_preference} onChange={e => setForm({ ...form, timeline_preference: e.target.value })} className={inputClass} style={inputStyle}>
                  <option value="">Select...</option>
                  <option>3-6 months</option>
                  <option>6-12 months</option>
                  <option>1-2 years</option>
                  <option>No rush</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full font-semibold py-3 text-sm text-white transition-colors" style={{ backgroundColor: NAVY }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
            >
              Submit Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}