import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ShieldCheck, ChevronLeft, AlertTriangle, Search, RefreshCw,
  ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock,
  DollarSign, Shield, FileText, Send
} from "lucide-react";
import { format } from "date-fns";

const NAVY = "#2F3E55";

const TYPE_CONFIG = {
  buyer_issue:    { label: "Buyer Issue",     color: "#92400E", bg: "#FEF3C7" },
  refund_review:  { label: "Refund Review",   color: "#1E40AF", bg: "#DBEAFE" },
  formal_dispute: { label: "Formal Dispute",  color: "#7C3AED", bg: "#EDE9FE" },
  chargeback:     { label: "Chargeback",      color: "#991B1B", bg: "#FEE2E2" },
};

const STATUS_CONFIG = {
  open:                   { label: "Open",                 color: "#92400E", bg: "#FEF3C7" },
  under_review:           { label: "Under Review",         color: "#1E40AF", bg: "#DBEAFE" },
  awaiting_buyer:         { label: "Awaiting Buyer",       color: "#7C3AED", bg: "#EDE9FE" },
  awaiting_builder:       { label: "Awaiting Builder",     color: "#065F46", bg: "#D1FAE5" },
  resolved_buyer_favor:   { label: "Resolved — Buyer",     color: "#166534", bg: "#DCFCE7" },
  resolved_builder_favor: { label: "Resolved — Builder",   color: "#374151", bg: "#F3F4F6" },
  resolved_partial:       { label: "Partially Resolved",   color: "#92400E", bg: "#FEF3C7" },
  closed:                 { label: "Closed",               color: "#6B7280", bg: "#F9FAFB" },
  won:                    { label: "Won",                  color: "#166534", bg: "#DCFCE7" },
  lost:                   { label: "Lost",                 color: "#991B1B", bg: "#FEE2E2" },
};

function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || { label: type, color: "#6B7280", bg: "#F9FAFB" };
  return <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "#6B7280", bg: "#F9FAFB" };
  return <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
}

const ISSUE_REASON_LABELS = {
  item_not_received: "Item Not Received",
  builder_delay: "Builder Delay",
  item_not_as_described: "Not As Described",
  payment_problem: "Payment Problem",
  return_refund_request: "Return / Refund",
  other: "Other",
};

const STATUS_OPTIONS = [
  "open", "under_review", "awaiting_buyer", "awaiting_builder",
  "resolved_buyer_favor", "resolved_builder_favor", "resolved_partial", "closed"
];

const TYPE_OPTIONS = ["buyer_issue", "refund_review", "formal_dispute", "chargeback"];

function DisputeCard({ dispute, order, payments, auditLogs, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [newStatus, setNewStatus] = useState(dispute.status);
  const [newType, setNewType] = useState(dispute.type);
  const [resolutionNotes, setResolutionNotes] = useState(dispute.resolution_notes || "");
  const [adminNotes, setAdminNotes] = useState("");
  const [applyHold, setApplyHold] = useState(false);
  const [releaseHold, setReleaseHold] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  // Refund section
  const [showRefund, setShowRefund] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundProcessing, setRefundProcessing] = useState(false);

  const orderPayments = payments.filter(p => p.order_id === dispute.order_id);
  const disputeLogs = auditLogs.filter(l => l.order_id === dispute.order_id);

  async function handleUpdateStatus() {
    setProcessing(true);
    setActionResult(null);
    const res = await base44.functions.invoke("updateDisputeStatus", {
      disputeId: dispute.id,
      status: newStatus,
      type: newType,
      resolutionNotes,
      adminNotes,
      applyPayoutHold: applyHold,
      releasePayoutHold: releaseHold,
    });
    if (res.data?.success) {
      setActionResult({ type: "success", msg: res.data.message });
      onUpdate();
    } else {
      setActionResult({ type: "error", msg: res.data?.error || "Update failed." });
    }
    setProcessing(false);
  }

  async function handleRefund() {
    if (!refundAmount || parseFloat(refundAmount) <= 0) return;
    setRefundProcessing(true);
    setActionResult(null);
    const res = await base44.functions.invoke("initiateRefund", {
      orderId: dispute.order_id,
      refundAmount: parseFloat(refundAmount),
      reason: refundReason,
      adminNotes,
      disputeId: dispute.id,
    });
    if (res.data?.success) {
      setActionResult({ type: "success", msg: res.data.message });
      setShowRefund(false);
      onUpdate();
    } else {
      setActionResult({ type: "error", msg: res.data?.error || "Refund failed." });
    }
    setRefundProcessing(false);
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden" style={{ borderColor: "#E0DDD8" }}>
      <div className="flex flex-wrap items-start justify-between gap-3 p-5 cursor-pointer hover:bg-stone-50 transition-colors" onClick={() => setExpanded(e => !e)}>
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <TypeBadge type={dispute.type} />
            <StatusBadge status={dispute.status} />
            {dispute.stripe_dispute_id && (
              <span className="text-xs font-mono bg-stone-100 text-stone-500 px-2 py-0.5 rounded">
                {dispute.stripe_dispute_id.slice(0, 16)}…
              </span>
            )}
          </div>
          <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>
            {ISSUE_REASON_LABELS[dispute.reason] || dispute.reason}
          </p>
          <p className="text-xs text-stone-400 mt-0.5">
            {dispute.buyer_email}
            {dispute.builder_name && ` → ${dispute.builder_name}`}
            {dispute.created_date && ` · ${format(new Date(dispute.created_date), "MMM d, yyyy")}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm" style={{ color: "#A0692A" }}>
            ${dispute.amount_disputed?.toLocaleString() || "—"}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t px-5 pb-5 pt-4 space-y-5" style={{ borderColor: "#F3F2EF" }}>

          {/* Buyer notes */}
          {dispute.buyer_notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-700 mb-1">Buyer Reported</p>
              <p className="text-sm text-amber-900 leading-relaxed">{dispute.buyer_notes}</p>
            </div>
          )}

          {/* Linked order info */}
          {order && (
            <div className="border border-stone-200 rounded-xl p-4 text-sm space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Linked Order</p>
              <div className="flex justify-between text-stone-600">
                <span>Order</span>
                <span className="font-mono font-medium">#{order.id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Order Type</span>
                <span className="capitalize">{order.order_type}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Current Status</span>
                <span className="capitalize">{order.current_status?.replace(/_/g, " ")}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Payout Status</span>
                <span className="capitalize">{order.payout_status?.replace(/_/g, " ")}</span>
              </div>
              <div className="flex justify-between font-medium text-stone-800">
                <span>Gross Amount</span>
                <span>${(order.total_gross_amount || order.total_amount || 0).toFixed(2)}</span>
              </div>
              {order.refund_amount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Refunded</span>
                  <span>−${order.refund_amount.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {/* Payments */}
          {orderPayments.length > 0 && (
            <div className="border border-stone-200 rounded-xl p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Payments</p>
              {orderPayments.map(p => (
                <div key={p.id} className="flex flex-wrap justify-between items-center py-1.5 border-b border-stone-50 last:border-0 gap-2">
                  <div>
                    <span className="capitalize font-medium text-stone-700">{p.type?.replace(/_/g, " ")}</span>
                    <span className="ml-2 text-xs text-stone-400">{p.stripe_charge_id?.slice(-8)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'succeeded' ? 'bg-green-100 text-green-700' : p.status === 'refunded' ? 'bg-red-100 text-red-700' : 'bg-stone-100 text-stone-600'}`}>
                      {p.status}
                    </span>
                    <span className="font-bold text-stone-700">${p.amount?.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Audit log */}
          {disputeLogs.length > 0 && (
            <div className="border border-stone-200 rounded-xl p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">Audit Trail</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {disputeLogs.slice(-10).reverse().map(log => (
                  <div key={log.id} className="flex items-start gap-2 text-xs">
                    <span className="font-mono text-stone-400 flex-shrink-0">{log.created_date ? format(new Date(log.created_date), "MM/dd HH:mm") : "—"}</span>
                    <span className="font-semibold text-stone-600">{log.event_type?.replace(/_/g, " ")}</span>
                    <span className="text-stone-400">{log.actor_role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Update Status */}
          <div className="border border-stone-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Update Case</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Case Type</label>
                <select value={newType} onChange={e => setNewType(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
                  {TYPE_OPTIONS.map(t => <option key={t} value={t}>{TYPE_CONFIG[t]?.label || t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Resolution Notes (shown to buyer on resolution)</label>
              <textarea rows={2} value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)}
                placeholder="Summarize the resolution outcome..."
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Internal Admin Notes</label>
              <textarea rows={2} value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                placeholder="Internal notes (not shown to buyer or builder)..."
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer">
                <input type="checkbox" checked={applyHold} onChange={e => setApplyHold(e.target.checked)} className="w-3.5 h-3.5 accent-slate-700" />
                Apply payout hold
              </label>
              <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer">
                <input type="checkbox" checked={releaseHold} onChange={e => setReleaseHold(e.target.checked)} className="w-3.5 h-3.5 accent-slate-700" />
                Release payout hold
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button disabled={processing} onClick={handleUpdateStatus}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-white disabled:opacity-50"
                style={{ backgroundColor: NAVY }}>
                <Send className="w-3.5 h-3.5" /> {processing ? "Saving..." : "Update Case"}
              </button>
              <button onClick={() => setShowRefund(r => !r)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 transition-colors">
                <DollarSign className="w-3.5 h-3.5" /> Initiate Refund
              </button>
            </div>
          </div>

          {/* Refund panel */}
          {showRefund && (
            <div className="border border-red-200 rounded-xl p-4 bg-red-50 space-y-3">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Initiate Refund</p>
              {order && (
                <p className="text-xs text-red-600">
                  Gross: ${(order.total_gross_amount || order.total_amount || 0).toFixed(2)} ·
                  Already refunded: ${(order.refund_amount || 0).toFixed(2)}
                </p>
              )}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-red-700 mb-1">Refund Amount ($)</label>
                  <input type="number" min="0.01" step="0.01" value={refundAmount} onChange={e => setRefundAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-red-700 mb-1">Reason</label>
                  <input type="text" value={refundReason} onChange={e => setRefundReason(e.target.value)}
                    placeholder="e.g. Item not received"
                    className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white" />
                </div>
              </div>
              <button disabled={refundProcessing || !refundAmount} onClick={handleRefund}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors">
                <DollarSign className="w-3.5 h-3.5" /> {refundProcessing ? "Processing..." : `Issue Refund`}
              </button>
            </div>
          )}

          {/* Action result */}
          {actionResult && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-sm border ${
              actionResult.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-700"
            }`}>
              {actionResult.type === "success" ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
              {actionResult.msg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const FILTER_OPTIONS = [
  { key: "all", label: "All Cases" },
  { key: "open", label: "Open" },
  { key: "under_review", label: "Under Review" },
  { key: "awaiting_buyer", label: "Awaiting Buyer" },
  { key: "awaiting_builder", label: "Awaiting Builder" },
  { key: "buyer_issue", label: "Buyer Issues" },
  { key: "chargeback", label: "Chargebacks" },
  { key: "refund_review", label: "Refund Reviews" },
  { key: "resolved_buyer_favor", label: "Resolved — Buyer" },
  { key: "resolved_builder_favor", label: "Resolved — Builder" },
  { key: "closed", label: "Closed" },
];

export default function AdminIssues() {
  const [user, setUser] = useState(null);
  const [disputes, setDisputes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      if (u.role !== "admin") { setLoading(false); return; }
      const [allDisputes, allOrders, allPayments, allLogs] = await Promise.all([
        base44.entities.Dispute.list("-created_date", 200),
        base44.entities.Order.list("-created_date", 300),
        base44.entities.Payment.list("-created_date", 300),
        base44.entities.AuditLog.list("-created_date", 500),
      ]);
      setDisputes(allDisputes);
      setOrders(allOrders);
      setPayments(allPayments);
      setAuditLogs(allLogs);
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  const filtered = disputes.filter(d => {
    const matchFilter =
      filter === "all" ? true :
      ["open","under_review","awaiting_buyer","awaiting_builder","resolved_buyer_favor","resolved_builder_favor","resolved_partial","closed","won","lost"].includes(filter)
        ? d.status === filter
        : d.type === filter;
    const matchSearch = !search ||
      d.buyer_email?.toLowerCase().includes(search.toLowerCase()) ||
      d.builder_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.stripe_dispute_id?.includes(search) ||
      d.order_id?.includes(search);
    return matchFilter && matchSearch;
  });

  const openCount = disputes.filter(d => ["open", "under_review", "awaiting_buyer", "awaiting_builder"].includes(d.status)).length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
    </div>
  );

  if (user?.role !== "admin") return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <ShieldCheck className="w-12 h-12 mx-auto mb-4" style={{ color: "#CCCCCC" }} />
      <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-12 pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link to={createPageUrl("AdminDashboard")} className="inline-flex items-center gap-1 text-sm mb-6 opacity-60 hover:opacity-100 transition-opacity" style={{ color: NAVY }}>
            <ChevronLeft className="w-4 h-4" /> Admin Dashboard
          </Link>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: "#1A1A1A" }}>Issues & Disputes</h1>
              <p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>Review buyer issues, manage disputes, and initiate refunds.</p>
            </div>
            {openCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-semibold">{openCount} case{openCount !== 1 ? "s" : ""} need attention</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by buyer, builder, order ID, or Stripe dispute ID..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300" />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-300">
            {FILTER_OPTIONS.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
          </select>
          <button onClick={loadData} className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <p className="text-xs text-gray-400">{filtered.length} case{filtered.length !== 1 ? "s" : ""} shown</p>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            No cases match this filter.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(dispute => {
              const order = orders.find(o => o.id === dispute.order_id) || null;
              return (
                <DisputeCard
                  key={dispute.id}
                  dispute={dispute}
                  order={order}
                  payments={payments}
                  auditLogs={auditLogs}
                  onUpdate={loadData}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}