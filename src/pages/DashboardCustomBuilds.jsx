import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Save, X, Check, Hammer, Settings, MessageSquare, FileText, AlertTriangle, Clock, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import BuilderSpecificationsEditor from "../components/dashboard/BuilderSpecificationsEditor";
import DeclineRequestModal from "../components/builder/DeclineRequestModal";
import RequestMessageModal from "../components/builder/RequestMessageModal";
import { formatDistanceToNow } from "date-fns";

const REQUEST_STATUS_CONFIG = {
  pending:                    { label: "Pending", bg: "bg-amber-100", text: "text-amber-700" },
  in_discussion:              { label: "In Discussion", bg: "bg-blue-100", text: "text-blue-700" },
  order_form_sent:            { label: "Order Form Sent", bg: "bg-indigo-100", text: "text-indigo-700" },
  order_form_declined_by_buyer: { label: "Form Declined", bg: "bg-red-100", text: "text-red-700" },
  declined_by_builder:        { label: "Declined", bg: "bg-stone-100", text: "text-stone-500" },
  converted_to_order:         { label: "Converted to Order", bg: "bg-green-100", text: "text-green-700" },
  // Legacy
  accepted:  { label: "Accepted", bg: "bg-green-100", text: "text-green-700" },
  reviewed:  { label: "Reviewed", bg: "bg-stone-100", text: "text-stone-600" },
  quoted:    { label: "Order Form Sent", bg: "bg-indigo-100", text: "text-indigo-700" },
  declined:  { label: "Declined", bg: "bg-red-100", text: "text-red-700" },
  completed: { label: "Completed", bg: "bg-green-100", text: "text-green-700" },
};

export default function DashboardCustomBuilds() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [specListing, setSpecListing] = useState(null);
  const [specOptions, setSpecOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("requests");
  const [declineTarget, setDeclineTarget] = useState(null);
  const [messageTarget, setMessageTarget] = useState(null);
  const [expandedRequest, setExpandedRequest] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) {
        const p = profiles[0];
        setProfile(p);
        const [listings, rs] = await Promise.all([
          base44.entities.CustomBuildListing.filter({ builder_id: p.id }, "-created_date", 1),
          base44.entities.CustomBuildRequest.filter({ builder_id: p.id }, "-created_date", 100),
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

  function handleDeclined(requestId) {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: "declined_by_builder" } : r));
  }

  function handleStatusUpdated(requestId, status) {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" /></div>;

  return (
    <>
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
            { id: "requests", label: `Requests (${requests.length})` },
            { id: "specs", label: "My Specifications" },
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
            <BuilderSpecificationsEditor specOptions={specOptions} onChange={setSpecOptions} />
            <div className="mt-6">
              <button onClick={handleSaveSpecs} disabled={saving}
                className={`w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 ${saved ? "bg-green-600 text-white" : "bg-amber-600 hover:bg-amber-500 text-white"}`}>
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : saved ? "Saved!" : "Update Specs"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "requests" && (
          requests.length === 0 ? (
            <div className="text-center py-16">
              <Hammer className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500 font-medium">No custom build requests yet.</p>
              <p className="text-stone-400 text-sm mt-1">When buyers submit requests, they\'ll appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map(r => {
                const statusCfg = REQUEST_STATUS_CONFIG[r.status] || { label: r.status, bg: "bg-stone-100", text: "text-stone-600" };
                const isExpanded = expandedRequest === r.id;
                const isActive = !["declined_by_builder", "declined", "converted_to_order", "completed"].includes(r.status);
                return (
                  <div key={r.id} className={`bg-white rounded-2xl border overflow-hidden ${
                    r.status === "pending" ? "border-amber-200" : "border-stone-200"
                  }`}>
                    <button className="w-full text-left p-5 hover:bg-stone-50 transition-colors"
                      onClick={() => setExpandedRequest(isExpanded ? null : r.id)}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-stone-800 text-sm">{r.customer_name}</h3>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${statusCfg.bg} ${statusCfg.text}`}>{statusCfg.label}</span>
                          </div>
                          <p className="text-xs text-stone-400">{r.customer_email}{r.customer_phone ? ` · ${r.customer_phone}` : ""}</p>
                          {r.created_date && <p className="text-xs text-stone-400 mt-0.5">Submitted {formatDistanceToNow(new Date(r.created_date), { addSuffix: true })}</p>}
                          {r.budget_range && <p className="text-xs text-stone-500 mt-1">Budget: <strong>{r.budget_range}</strong></p>}
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-stone-400 flex-shrink-0 mt-1" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-stone-100 px-5 pb-5 pt-4 space-y-4">
                        {r.description && (
                          <div>
                            <p className="text-xs font-semibold text-stone-400 mb-1">Vision</p>
                            <p className="text-sm text-stone-600 leading-relaxed">{r.description}</p>
                          </div>
                        )}
                        {r.specifications && Object.keys(r.specifications).filter(k => r.specifications[k]).length > 0 && (
                          <div className="bg-stone-50 rounded-xl p-3">
                            <p className="text-xs font-semibold text-stone-500 mb-2">Requested Specifications</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              {Object.entries(r.specifications).filter(([, v]) => v).map(([k, v]) => (
                                <div key={k} className="text-xs text-stone-500">
                                  <span className="font-medium capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}:</span> {String(v)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {isActive && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            <button onClick={() => setMessageTarget(r)}
                              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50">
                              <MessageSquare className="w-3.5 h-3.5" /> Message Buyer
                            </button>
                            {!["converted_to_order", "order_form_declined_by_buyer"].includes(r.status) && (
                              <button onClick={() => navigate(`/OrderFormEditor?requestId=${r.id}`)}
                                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg text-white"
                                style={{ backgroundColor: "#C57A1F" }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#a8661a"}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#C57A1F"}>
                                <FileText className="w-3.5 h-3.5" /> Create Order Form
                              </button>
                            )}
                            {!["declined_by_builder", "converted_to_order"].includes(r.status) && (
                              <button onClick={() => setDeclineTarget(r)}
                                className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                                <X className="w-3.5 h-3.5" /> Decline Request
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {declineTarget && (
        <DeclineRequestModal
          request={declineTarget}
          profile={profile}
          onClose={() => setDeclineTarget(null)}
          onDeclined={() => { handleDeclined(declineTarget.id); setDeclineTarget(null); }}
        />
      )}
      {messageTarget && (
        <RequestMessageModal
          request={messageTarget}
          profile={profile}
          user={user}
          onClose={() => setMessageTarget(null)}
          onStatusUpdated={(status) => handleStatusUpdated(messageTarget.id, status)}
        />
      )}
    </>
  );
}