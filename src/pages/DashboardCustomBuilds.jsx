import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Save, X, Check, Hammer, Settings } from "lucide-react";
import BuilderSpecificationsEditor from "../components/dashboard/BuilderSpecificationsEditor";

export default function DashboardCustomBuilds() {
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState(null);
  const [specListing, setSpecListing] = useState(null); // single record per builder
  const [specOptions, setSpecOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("specs");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) {
        const p = profiles[0];
        setProfile(p);
        const [listings, rs] = await Promise.all([
          base44.entities.CustomBuildListing.filter({ builder_id: p.id }, "-created_date", 1),
          base44.entities.CustomBuildRequest.filter({ builder_id: p.id }, "-created_date", 50),
        ]);
        if (listings.length > 0) {
          setSpecListing(listings[0]);
          setSpecOptions(listings[0].available_spec_options || {});
        }
        setRequests(rs);
      }
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  async function handleSaveSpecs() {
    setSaving(true);
    const data = {
      builder_id: profile.id,
      builder_name: profile.business_name || profile.display_name,
      available_spec_options: specOptions,
      is_published: true,
    };
    let updated;
    if (specListing) {
      updated = await base44.entities.CustomBuildListing.update(specListing.id, data);
    } else {
      updated = await base44.entities.CustomBuildListing.create(data);
    }
    setSpecListing(updated);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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

      {!profile?.stripe_payouts_enabled && (
        <div className="mb-5 flex items-start gap-3 p-4 border rounded-xl bg-amber-50 border-amber-200">
          <span className="text-amber-500 text-lg flex-shrink-0">⚠</span>
          <div>
            <p className="text-sm font-semibold text-amber-900">Stripe account required to accept custom builds</p>
            <p className="text-xs text-amber-700 mt-0.5">Connect your Stripe account before activating custom build listings. <a href="/Dashboard" className="underline font-medium">Set up Stripe →</a></p>
          </div>
        </div>
      )}

      <div className="border-b border-stone-200 mb-6 flex gap-1">
        {[
          { id: "specs", label: "My Specifications" },
          { id: "requests", label: `Requests (${requests.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === t.id ? "border-amber-500 text-amber-700" : "border-transparent text-stone-500 hover:text-stone-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "specs" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h2 className="font-semibold text-stone-800 text-sm">Your Custom Build Specifications</h2>
                <p className="text-xs text-stone-400">Define what you offer — buyers will see only your available options when requesting a quote.</p>
              </div>
            </div>
            <button
              onClick={handleSaveSpecs}
              disabled={saving}
              className={`flex items-center gap-2 font-medium px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 ${saved ? "bg-green-600 text-white" : "bg-amber-600 hover:bg-amber-500 text-white"}`}
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : saved ? "Saved!" : "Update Specs"}
            </button>
          </div>

          <BuilderSpecificationsEditor
            specOptions={specOptions}
            onChange={setSpecOptions}
          />

          <div className="mt-6">
            <button
              onClick={handleSaveSpecs}
              disabled={saving}
              className={`w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 ${saved ? "bg-green-600 text-white" : "bg-amber-600 hover:bg-amber-500 text-white"}`}
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : saved ? "Saved!" : "Update Specs"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "requests" && (
        requests.length === 0 ? (
          <div className="text-center py-16"><Hammer className="w-12 h-12 text-stone-300 mx-auto mb-3" /><p className="text-stone-500">No requests received yet.</p></div>
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
                {r.specifications && Object.keys(r.specifications).length > 0 && (
                  <div className="bg-stone-50 rounded-lg p-3 mb-4">
                    <p className="text-xs font-semibold text-stone-600 mb-2">Requested Specifications:</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {Object.entries(r.specifications).filter(([, v]) => v).map(([k, v]) => (
                        <div key={k} className="text-xs text-stone-500">
                          <span className="font-medium capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}:</span> {String(v)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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