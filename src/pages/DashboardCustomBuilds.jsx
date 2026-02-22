import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Plus, Pencil, Trash2, Eye, EyeOff, X, Check, Hammer } from "lucide-react";

export default function DashboardCustomBuilds() {
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [activeTab, setActiveTab] = useState("listings");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) {
        const p = profiles[0];
        setProfile(p);
        const [ls, rs] = await Promise.all([
          base44.entities.CustomBuildListing.filter({ builder_id: p.id }, "-created_date", 50),
          base44.entities.CustomBuildRequest.filter({ builder_id: p.id }, "-created_date", 50),
        ]);
        setListings(ls);
        setRequests(rs);
      }
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  async function togglePublish(listing) {
    const updated = await base44.entities.CustomBuildListing.update(listing.id, { is_published: !listing.is_published });
    setListings(prev => prev.map(l => l.id === listing.id ? { ...l, is_published: updated.is_published } : l));
  }

  async function deleteListing(id) {
    if (!confirm("Delete this listing?")) return;
    await base44.entities.CustomBuildListing.delete(id);
    setListings(prev => prev.filter(l => l.id !== id));
  }

  async function updateRequestStatus(requestId, status) {
    await base44.entities.CustomBuildRequest.update(requestId, { status });
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to={createPageUrl("Dashboard")} className="text-stone-400 hover:text-amber-600"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-stone-800">Custom Builds</h1>
      </div>

      <div className="border-b border-stone-200 mb-6 flex gap-1">
        {[
          { id: "listings", label: `My Listings (${listings.length})` },
          { id: "requests", label: `Requests (${requests.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === t.id ? "border-amber-500 text-amber-700" : "border-transparent text-stone-500 hover:text-stone-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "listings" && (
        <>
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-medium px-5 py-2.5 rounded-xl text-sm mb-6">
            <Plus className="w-4 h-4" /> New Listing
          </button>

          {showForm && (
            <ListingForm
              listing={editing}
              profile={profile}
              onSave={(saved) => {
                if (editing) setListings(prev => prev.map(l => l.id === saved.id ? saved : l));
                else setListings(prev => [saved, ...prev]);
                setShowForm(false); setEditing(null);
              }}
              onClose={() => { setShowForm(false); setEditing(null); }}
            />
          )}

          {listings.length === 0 && !showForm ? (
            <div className="text-center py-16"><Hammer className="w-12 h-12 text-stone-300 mx-auto mb-3" /><p className="text-stone-500">No listings yet.</p></div>
          ) : (
            <div className="space-y-3">
              {listings.map(l => (
                <div key={l.id} className="bg-white rounded-2xl border border-stone-200 p-4 flex gap-4 items-center">
                  <div className="flex-1">
                    <h3 className="font-semibold text-stone-800 text-sm">{l.listing_title}</h3>
                    <p className="text-stone-400 text-xs">{l.instrument_type} • {l.starting_price ? `From $${l.starting_price.toLocaleString()}` : "Price on request"}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${l.is_published ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                      {l.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => togglePublish(l)} className="p-2 text-stone-400 hover:text-amber-600 rounded-lg" title={l.is_published ? "Unpublish" : "Publish"}>
                      {l.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => { setEditing(l); setShowForm(true); }} className="p-2 text-stone-400 hover:text-blue-600 rounded-lg"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => deleteListing(l.id)} className="p-2 text-stone-400 hover:text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "requests" && (
        requests.length === 0 ? (
          <div className="text-center py-16"><p className="text-stone-500">No requests received yet.</p></div>
        ) : (
          <div className="space-y-4">
            {requests.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-stone-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-stone-800">{r.customer_name}</h3>
                    <p className="text-stone-400 text-sm">{r.customer_email} {r.customer_phone && `• ${r.customer_phone}`}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    r.status === "pending" ? "bg-amber-100 text-amber-700" :
                    r.status === "accepted" ? "bg-green-100 text-green-700" :
                    r.status === "declined" ? "bg-red-100 text-red-700" :
                    r.status === "quoted" ? "bg-blue-100 text-blue-700" :
                    "bg-stone-100 text-stone-600"
                  }`}>{r.status}</span>
                </div>
                <p className="text-stone-600 text-sm mb-3">{r.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-stone-500 mb-4">
                  {r.budget_range && <span>Budget: <strong>{r.budget_range}</strong></span>}
                  {r.timeline_preference && <span>Timeline: <strong>{r.timeline_preference}</strong></span>}
                  {r.build_type && <span>Type: <strong>{r.build_type}</strong></span>}
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-2">
                    <button onClick={() => updateRequestStatus(r.id, "accepted")} className="flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white text-xs font-medium px-4 py-2 rounded-lg">
                      <Check className="w-3 h-3" /> Accept
                    </button>
                    <button onClick={() => updateRequestStatus(r.id, "quoted")} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2 rounded-lg">
                      Send Quote
                    </button>
                    <button onClick={() => updateRequestStatus(r.id, "declined")} className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium px-4 py-2 rounded-lg">
                      <X className="w-3 h-3" /> Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function ListingForm({ listing, profile, onSave, onClose }) {
  const [form, setForm] = useState(listing || {
    listing_title: "", instrument_type: "", body_shape: "", short_description: "",
    starting_price: "", max_price: "", estimated_build_time: "", payment_terms: "",
    consult_required: false, can_get_instant_quote: false, deposit_required: false,
    deposit_amount: "", is_published: false, image_urls: [],
  });
  const [saving, setSaving] = useState(false);
  const [imgUrl, setImgUrl] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const data = { ...form, builder_id: profile.id, builder_name: profile.business_name || profile.display_name,
      starting_price: form.starting_price ? Number(form.starting_price) : null,
      max_price: form.max_price ? Number(form.max_price) : null,
      deposit_amount: form.deposit_amount ? Number(form.deposit_amount) : null,
    };
    let saved;
    if (listing) saved = await base44.entities.CustomBuildListing.update(listing.id, data);
    else saved = await base44.entities.CustomBuildListing.create(data);
    onSave(saved);
    setSaving(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-amber-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-stone-800">{listing ? "Edit Listing" : "New Listing"}</h2>
        <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700"><X className="w-5 h-5" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Listing Title *</label>
          <input required value={form.listing_title} onChange={e => setForm({...form, listing_title: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Instrument Type</label>
            <input value={form.instrument_type} onChange={e => setForm({...form, instrument_type: e.target.value})} placeholder="Electric, Acoustic..." className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Body Shape</label>
            <input value={form.body_shape} onChange={e => setForm({...form, body_shape: e.target.value})} placeholder="Strat, LP, Tele..." className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Starting Price ($)</label>
            <input type="number" value={form.starting_price} onChange={e => setForm({...form, starting_price: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Est. Build Time</label>
            <input value={form.estimated_build_time} onChange={e => setForm({...form, estimated_build_time: e.target.value})} placeholder="6-12 months" className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Short Description</label>
          <textarea rows={3} value={form.short_description} onChange={e => setForm({...form, short_description: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          {[
            { key: "consult_required", label: "Consultation required" },
            { key: "deposit_required", label: "Deposit required" },
            { key: "is_published", label: "Publish immediately" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form[key]} onChange={e => setForm({...form, [key]: e.target.checked})} className="rounded border-stone-300" />
              <span className="text-stone-600">{label}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-stone-300 text-stone-600 py-2.5 rounded-xl text-sm">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 rounded-xl text-sm disabled:opacity-50">
            {saving ? "Saving..." : listing ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}