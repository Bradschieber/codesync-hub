import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, RotateCcw, Shield, ChevronDown, ChevronUp, Save } from "lucide-react";
import { format } from "date-fns";

const RETURN_STATUSES = ["requested", "approved", "rejected", "item_received", "refunded", "closed"];
const WARRANTY_STATUSES = ["submitted", "under_review", "approved", "rejected", "repair_in_progress", "resolved", "closed"];

const STATUS_COLORS = {
  requested: "bg-amber-100 text-amber-700",
  submitted: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  under_review: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  item_received: "bg-teal-100 text-teal-700",
  refunded: "bg-green-100 text-green-700",
  repair_in_progress: "bg-violet-100 text-violet-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-stone-100 text-stone-500",
};

export default function BuilderReturnsWarranty() {
  const [tab, setTab] = useState("returns");
  const [returns, setReturns] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [expanded, setExpanded] = useState({});

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) {
        const p = profiles[0];
        setProfile(p);
        const [r, w] = await Promise.all([
          base44.entities.Return.filter({ builder_id: p.id }, "-created_date", 100),
          base44.entities.WarrantyClaim.filter({ builder_id: p.id }, "-created_date", 100),
        ]);
        setReturns(r);
        setClaims(w);
      }
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  async function updateReturn(id, data) {
    await base44.entities.Return.update(id, data);
    setReturns(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  }

  async function updateClaim(id, data) {
    await base44.entities.WarrantyClaim.update(id, data);
    setClaims(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }

  function toggleExpand(id) {
    setExpanded(e => ({ ...e, [id]: !e[id] }));
  }

  const activeReturns = returns.filter(r => !["refunded", "closed"].includes(r.status));
  const activeClaims = claims.filter(c => !["resolved", "closed"].includes(c.status));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link to={createPageUrl("Dashboard")} className="text-stone-400 hover:text-indigo-600"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold" style={{ color: "#1B2B4B" }}>Returns & Warranty</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-6">
        {[
          { key: "returns", label: "Returns", icon: RotateCcw, count: activeReturns.length },
          { key: "warranty", label: "Warranty Claims", icon: Shield, count: activeClaims.length },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.key ? "border-indigo-600 text-indigo-700" : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.count > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full font-semibold">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{Array(3).fill(0).map((_, i) => <div key={i} className="h-20 bg-stone-200 rounded-2xl animate-pulse" />)}</div>
      ) : tab === "returns" ? (
        <ReturnsList returns={returns} expanded={expanded} onToggle={toggleExpand} onUpdate={updateReturn} />
      ) : (
        <ClaimsList claims={claims} expanded={expanded} onToggle={toggleExpand} onUpdate={updateClaim} />
      )}
    </div>
  );
}

function ReturnsList({ returns, expanded, onToggle, onUpdate }) {
  if (returns.length === 0) return (
    <div className="text-center py-20">
      <RotateCcw className="w-12 h-12 text-stone-300 mx-auto mb-3" />
      <p className="text-stone-500 font-medium">No return requests</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {returns.map(r => (
        <ReturnCard key={r.id} item={r} expanded={!!expanded[r.id]} onToggle={() => onToggle(r.id)} onUpdate={onUpdate} statuses={RETURN_STATUSES} />
      ))}
    </div>
  );
}

function ClaimsList({ claims, expanded, onToggle, onUpdate }) {
  if (claims.length === 0) return (
    <div className="text-center py-20">
      <Shield className="w-12 h-12 text-stone-300 mx-auto mb-3" />
      <p className="text-stone-500 font-medium">No warranty claims</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {claims.map(c => (
        <ClaimCard key={c.id} item={c} expanded={!!expanded[c.id]} onToggle={() => onToggle(c.id)} onUpdate={onUpdate} statuses={WARRANTY_STATUSES} />
      ))}
    </div>
  );
}

function ReturnCard({ item, expanded, onToggle, onUpdate, statuses }) {
  const [response, setResponse] = useState(item.builder_notes || "");
  const [refund, setRefund] = useState(item.refund_amount || "");

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
      <div className="flex items-start justify-between p-4 cursor-pointer hover:bg-stone-50" onClick={onToggle}>
        <div>
          <p className="text-xs text-stone-400 mb-0.5">{item.buyer_name || item.buyer_email}</p>
          <p className="text-sm font-semibold text-stone-700">{item.product_name}</p>
          <p className="text-xs text-stone-400 mt-0.5">{item.created_date ? format(new Date(item.created_date), "MMM d, yyyy") : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[item.status] || "bg-stone-100 text-stone-500"}`}>
            {item.status.replace(/_/g, " ")}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-stone-100 px-4 pb-4 pt-3 space-y-4">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Reason</p>
            <p className="text-sm text-stone-600">{item.reason}</p>
            {item.description && <p className="text-sm text-stone-500 mt-1">{item.description}</p>}
          </div>

          {item.return_policy_terms && (
            <div className="bg-stone-50 rounded-lg p-3 text-xs text-stone-500">
              <p className="font-semibold mb-1 text-stone-600">Your Return Policy (at time of purchase)</p>
              {item.return_policy_terms.return_window_days && <p>Return window: {item.return_policy_terms.return_window_days} days</p>}
              {item.return_policy_terms.return_restocking_fee_percent > 0 && <p>Restocking fee: {item.return_policy_terms.return_restocking_fee_percent}%</p>}
              {item.return_policy_terms.return_shipping_paid_by && <p>Shipping paid by: {item.return_policy_terms.return_shipping_paid_by}</p>}
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {statuses.map(s => (
                <button key={s}
                  onClick={() => onUpdate(item.id, { status: s })}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                    item.status === s ? `${STATUS_COLORS[s]} border-transparent` : "bg-white border-stone-200 text-stone-500 hover:border-indigo-300"
                  }`}
                >
                  {s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Your Response / Notes</p>
              <textarea value={response} onChange={e => setResponse(e.target.value)} rows={2}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-indigo-400 resize-none" />
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-1">Refund Amount ($)</p>
              <input type="number" value={refund} onChange={e => setRefund(e.target.value)}
                className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-indigo-400 w-28" />
            </div>
            <button
              onClick={() => onUpdate(item.id, { builder_notes: response, refund_amount: parseFloat(refund) || undefined })}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg text-white"
              style={{ backgroundColor: "#1B2B4B" }}
            >
              <Save className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ClaimCard({ item, expanded, onToggle, onUpdate, statuses }) {
  const [response, setResponse] = useState(item.builder_response || "");
  const [resolution, setResolution] = useState(item.resolution_description || "");

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
      <div className="flex items-start justify-between p-4 cursor-pointer hover:bg-stone-50" onClick={onToggle}>
        <div>
          <p className="text-xs text-stone-400 mb-0.5">{item.buyer_name || item.buyer_email}</p>
          <p className="text-sm font-semibold text-stone-700">{item.product_name}</p>
          <p className="text-xs text-stone-400 mt-0.5">{item.issue_category} · {item.created_date ? format(new Date(item.created_date), "MMM d, yyyy") : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[item.status] || "bg-stone-100 text-stone-500"}`}>
            {item.status.replace(/_/g, " ")}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-stone-100 px-4 pb-4 pt-3 space-y-4">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Issue</p>
            <p className="text-sm text-stone-600">{item.issue_description}</p>
          </div>

          {item.image_urls?.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {item.image_urls.map((url, i) => (
                <img key={i} src={url} className="w-20 h-20 object-cover rounded-lg border border-stone-200" />
              ))}
            </div>
          )}

          {item.warranty_terms && (
            <div className="bg-stone-50 rounded-lg p-3 text-xs text-stone-500">
              <p className="font-semibold mb-1 text-stone-600">Your Warranty (at time of purchase)</p>
              {item.warranty_terms.warranty_duration && <p>Duration: {item.warranty_terms.warranty_duration}</p>}
              {item.warranty_terms.warranty_coverage?.length > 0 && <p>Covers: {item.warranty_terms.warranty_coverage.join(", ")}</p>}
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {statuses.map(s => (
                <button key={s}
                  onClick={() => onUpdate(item.id, { status: s })}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                    item.status === s ? `${STATUS_COLORS[s]} border-transparent` : "bg-white border-stone-200 text-stone-500 hover:border-indigo-300"
                  }`}
                >
                  {s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Your Response to Buyer</p>
              <textarea value={response} onChange={e => setResponse(e.target.value)} rows={2}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-indigo-400 resize-none" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Resolution Details</p>
              <textarea value={resolution} onChange={e => setResolution(e.target.value)} rows={2}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-indigo-400 resize-none" />
            </div>
            <button
              onClick={() => onUpdate(item.id, { builder_response: response, resolution_description: resolution })}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg text-white"
              style={{ backgroundColor: "#1B2B4B" }}
            >
              <Save className="w-3.5 h-3.5" /> Save Response
            </button>
          </div>
        </div>
      )}
    </div>
  );
}