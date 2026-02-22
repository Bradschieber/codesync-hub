import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Guitar, Hammer, Clock, DollarSign, MessageSquare, X, Check } from "lucide-react";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero */}
      <div className="bg-gradient-to-r from-stone-900 to-amber-950 text-white rounded-2xl p-8 md:p-12 mb-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800')] bg-cover bg-center" />
        <div className="relative">
          <Hammer className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-3">Custom Build Commissions</h1>
          <p className="text-stone-300 text-lg max-w-2xl mx-auto mb-6">
            Work directly with skilled luthiers to design and build your perfect instrument from scratch.
          </p>
          <Link to={createPageUrl("JoinBuilders")} className="inline-block bg-amber-500 hover:bg-amber-400 text-white font-semibold px-8 py-3 rounded-xl">
            Are you a builder? Join us →
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-stone-200">
              <div className="h-40 bg-stone-200 rounded-xl mb-4" />
              <div className="h-5 bg-stone-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-stone-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20">
          <Guitar className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-600">No custom listings yet</h3>
          <p className="text-stone-400 mt-1">Check back soon or become a builder yourself.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(listing => (
            <div key={listing.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-44 bg-stone-100 overflow-hidden">
                {listing.image_urls?.[0] ? (
                  <img src={listing.image_urls[0]} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Guitar className="w-12 h-12 text-stone-300" /></div>
                )}
              </div>
              <div className="p-5">
                <p className="text-xs text-amber-600 font-medium mb-1">{listing.builder_name}</p>
                <h3 className="font-bold text-stone-800 mb-2">{listing.listing_title}</h3>
                <p className="text-stone-500 text-sm mb-4 line-clamp-2">{listing.short_description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-stone-500 mb-4">
                  {listing.starting_price && (
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> From ${listing.starting_price?.toLocaleString()}</span>
                  )}
                  {listing.estimated_build_time && (
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {listing.estimated_build_time}</span>
                  )}
                  {listing.instrument_type && (
                    <span className="flex items-center gap-1"><Guitar className="w-3 h-3" /> {listing.instrument_type}</span>
                  )}
                  {listing.deposit_required && (
                    <span className="flex items-center gap-1 text-amber-600"><Check className="w-3 h-3" /> Deposit req.</span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedListing(listing)}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
                >
                  Request This Build
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4">
        <div className="flex items-center justify-between p-5 border-b border-stone-200">
          <h3 className="text-lg font-bold text-stone-800">Request Custom Build</h3>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700"><X className="w-5 h-5" /></button>
        </div>
        {submitted ? (
          <div className="p-8 text-center">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h4 className="text-xl font-bold text-stone-800 mb-2">Request Sent!</h4>
            <p className="text-stone-500 mb-4">{listing.builder_name} will review your request and get back to you.</p>
            <button onClick={onClose} className="bg-amber-600 text-white px-6 py-2.5 rounded-xl font-medium">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="bg-amber-50 rounded-xl p-3 text-sm text-amber-800 mb-2">
              <strong>Listing:</strong> {listing.listing_title} by {listing.builder_name}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Your Name *</label>
                <input required value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Email *</label>
                <input required type="email" value={form.customer_email} onChange={e => setForm({...form, customer_email: e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Phone (optional)</label>
              <input value={form.customer_phone} onChange={e => setForm({...form, customer_phone: e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Describe your dream guitar *</label>
              <textarea required rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Wood types, finish, pickups, electronics, neck profile..." className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Budget Range</label>
                <select value={form.budget_range} onChange={e => setForm({...form, budget_range: e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                  <option value="">Select...</option>
                  <option>Under $2,000</option>
                  <option>$2,000 - $5,000</option>
                  <option>$5,000 - $10,000</option>
                  <option>$10,000+</option>
                  <option>Flexible</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Timeline</label>
                <select value={form.timeline_preference} onChange={e => setForm({...form, timeline_preference: e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                  <option value="">Select...</option>
                  <option>3-6 months</option>
                  <option>6-12 months</option>
                  <option>1-2 years</option>
                  <option>No rush</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 rounded-xl transition-colors">
              Submit Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}