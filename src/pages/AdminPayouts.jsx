import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ShieldCheck, ChevronLeft, CheckCircle2, XCircle, Clock,
  DollarSign, Truck, Package, AlertTriangle, RefreshCw, Search,
  ChevronDown, ChevronUp, Shield, Send
} from "lucide-react";
import { format } from "date-fns";
import PayoutBreakdown from "../components/orders/PayoutBreakdown";

const NAVY = "#2F3E55";

const CURRENT_STATUS_LABELS = {
  pending_payment: "Pending Payment",
  payment_succeeded: "Payment Succeeded",
  awaiting_shipment: "Awaiting Shipment",
  tracking_submitted: "Tracking Submitted",
  shipment_verified: "Shipment Verified",
  shipped: "Shipped",
  delivered: "Delivered",
  refunded: "Refunded",
  disputed: "Disputed",
  cancelled: "Cancelled",
};

const PAYOUT_STATUS_CONFIG = {
  pending:                  { label: "Pending",            color: "#6B7280", bg: "#F9FAFB" },
  held_first_sale:          { label: "Held — 1st Sale",    color: "#92400E", bg: "#FEF3C7" },
  held_tracking_unverified: { label: "Held — Tracking",   color: "#1E40AF", bg: "#DBEAFE" },
  held_dispute:             { label: "Held — Dispute",     color: "#991B1B", bg: "#FEE2E2" },
  held_admin:               { label: "Held — Admin",       color: "#374151", bg: "#F3F4F6" },
  awaiting_release:         { label: "Awaiting Release",   color: "#065F46", bg: "#D1FAE5" },
  fully_released:           { label: "Paid Out",           color: "#166534", bg: "#DCFCE7" },
  payout_failed:            { label: "Payout Failed",      color: "#991B1B", bg: "#FEE2E2" },
};

function PayoutBadge({ status }) {
  const cfg = PAYOUT_STATUS_CONFIG[status] || PAYOUT_STATUS_CONFIG.pending;
  return (
    <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const label = CURRENT_STATUS_LABELS[status] || status;
  return (
    <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
      {label}
    </span>
  );
}

function AdminOrderCard({ order, transferInstructions, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [processing, setProcessing] = useState(false);
  const [actionResult, setActionResult] = useState(null);

  const relevantTI = transferInstructions.find(ti => ti.order_id === order.id);

  async function invokeAction(fn, payload, successMsg) {
    setProcessing(true);
    setActionResult(null);
    const res = await base44.functions.invoke(fn, payload);
    if (res.data?.success || res.data?.clientSecret === undefined) {
      setActionResult({ type: "success", msg: res.data?.message || successMsg });
      onUpdate();
    } else {
      setActionResult({ type: "error", msg: res.data?.error || "Action failed." });
    }
    setProcessing(false);
  }

  const canVerifyShipment = order.current_status === "tracking_submitted";
  const canConfirmDelivery = ["shipment_verified", "shipped"].includes(order.current_status) && !order.delivery_confirmed;
  const canProcessPayout = relevantTI?.status === "ready_for_transfer";

  return (
    <div className="bg-white border rounded-xl overflow-hidden" style={{ borderColor: "#E0DDD8" }}>
      {/* Header */}
      <div
        className="flex flex-wrap items-start justify-between gap-3 p-5 cursor-pointer hover:bg-stone-50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-bold text-sm" style={{ color: "#1A1A1A" }}>
              #{order.id.slice(-8).toUpperCase()}
            </p>
            <StatusBadge status={order.current_status} />
            <PayoutBadge status={order.payout_status} />
            {order.is_first_transaction && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
                <Shield className="w-3 h-3" /> 1st Sale
              </span>
            )}
            {order.order_type === "custom" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">Custom</span>
            )}
          </div>
          <p className="text-xs text-stone-400">
            <span className="font-medium text-stone-600">{order.builder_name}</span>
            {" → "}{order.buyer_name || order.buyer_email}
            {order.created_date && ` · ${format(new Date(order.created_date), "MMM d, yyyy")}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-bold" style={{ color: "#A0692A" }}>${(order.total_gross_amount || order.total_amount || 0).toLocaleString()}</p>
            {order.tracking_number && (
              <p className="text-xs text-stone-400 font-mono mt-0.5">{order.tracking_carrier} {order.tracking_number}</p>
            )}
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t px-5 pb-5 pt-4 space-y-5" style={{ borderColor: "#F3F2EF" }}>

          {/* Payout Breakdown */}
          <PayoutBreakdown order={order} showAdminDetail={true} />

          {/* Transfer Instruction Status */}
          {relevantTI && (
            <div className="border border-stone-200 rounded-xl p-4 text-sm space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Transfer Instruction</p>
              <div className="flex justify-between text-stone-600">
                <span>Status</span>
                <span className="font-medium capitalize">{relevantTI.status?.replace(/_/g, " ")}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Net Amount</span>
                <span className="font-bold" style={{ color: NAVY }}>${relevantTI.transfer_amount_net?.toFixed(2)}</span>
              </div>
              {relevantTI.stripe_transfer_id && (
                <div className="flex justify-between text-stone-400 text-xs">
                  <span>Transfer ID</span>
                  <span className="font-mono">{relevantTI.stripe_transfer_id}</span>
                </div>
              )}
            </div>
          )}

          {/* PayoutHold info */}
          {order.payout_status === "held_first_sale" && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800">First Sale Hold Active</p>
                <p className="text-xs text-amber-700 mt-0.5">Payout is held until delivery is confirmed. Use "Confirm Delivery" below to release.</p>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Admin Notes (optional)</label>
            <textarea
              rows={2}
              value={adminNotes}
              onChange={e => setAdminNotes(e.target.value)}
              placeholder="Internal notes for this action..."
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 resize-none"
            />
          </div>

          {/* Action Result */}
          {actionResult && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-sm border ${
              actionResult.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              {actionResult.type === "success"
                ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              }
              {actionResult.msg}
            </div>
          )}

          {/* Admin Action Buttons */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Admin Actions</p>
            <div className="flex flex-wrap gap-2">

              {/* Verify Shipment */}
              {canVerifyShipment && (
                <>
                  <button
                    disabled={processing}
                    onClick={() => invokeAction("verifyShipment", { orderId: order.id, verified: true, adminNotes }, "Shipment verified.")}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "#059669" }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verify Shipment
                  </button>
                  <button
                    disabled={processing}
                    onClick={() => invokeAction("verifyShipment", { orderId: order.id, verified: false, adminNotes }, "Tracking rejected.")}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border text-red-700 border-red-300 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject Tracking
                  </button>
                </>
              )}

              {/* Confirm Delivery */}
              {canConfirmDelivery && (
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                    className="border border-stone-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"
                  />
                  <button
                    disabled={processing}
                    onClick={() => invokeAction("confirmDelivery", { orderId: order.id, deliveryDate, adminNotes }, "Delivery confirmed. Payout queued.")}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "#0284C7" }}
                  >
                    <Package className="w-3.5 h-3.5" /> Confirm Delivery
                  </button>
                </div>
              )}

              {/* Process Payout */}
              {canProcessPayout && relevantTI && (
                <button
                  disabled={processing}
                  onClick={() => invokeAction("processTransferInstruction", { transferInstructionId: relevantTI.id }, "Payout transfer initiated.")}
                  className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: NAVY }}
                  onMouseEnter={e => !processing && (e.currentTarget.style.backgroundColor = "#1A2D45")}
                  onMouseLeave={e => !processing && (e.currentTarget.style.backgroundColor = NAVY)}
                >
                  <Send className="w-3.5 h-3.5" />
                  {processing ? "Processing..." : `Release Payout — $${relevantTI.transfer_amount_net?.toFixed(2)}`}
                </button>
              )}

              {/* Status label when no actions available */}
              {!canVerifyShipment && !canConfirmDelivery && !canProcessPayout && (
                <p className="text-xs text-stone-400 italic">
                  {order.payout_status === "fully_released"
                    ? "✓ Payout complete"
                    : order.payout_status === "payout_failed"
                    ? "⚠ Payout failed — check Stripe"
                    : "No actions available at this stage"}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const FILTER_OPTIONS = [
  { key: "all", label: "All Orders" },
  { key: "stock", label: "Stock Builds Only" },
  { key: "tracking_submitted", label: "Tracking Submitted" },
  { key: "awaiting_release", label: "Awaiting Payout Release" },
  { key: "held_first_sale", label: "Held — First Sale" },
  { key: "fully_released", label: "Paid Out" },
  { key: "payout_failed", label: "Payout Failed" },
];

export default function AdminPayouts() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [transferInstructions, setTransferInstructions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      if (u.role !== "admin") { setLoading(false); return; }
      const [allOrders, allTIs] = await Promise.all([
        base44.entities.Order.list("-created_date", 300),
        base44.entities.TransferInstruction.list("-created_date", 300),
      ]);
      setOrders(allOrders.filter(o => o.current_status !== "cancelled"));
      setTransferInstructions(allTIs);
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  const filtered = orders.filter(o => {
    const matchesFilter =
      filter === "all" ? true :
      filter === "stock" ? o.order_type === "stock" :
      ["pending", "awaiting_release", "held_first_sale", "held_tracking_unverified", "fully_released", "payout_failed"].includes(filter)
        ? o.payout_status === filter
        : o.current_status === filter;
    const matchesSearch = !search ||
      o.builder_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.buyer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.buyer_email?.toLowerCase().includes(search.toLowerCase()) ||
      o.id.slice(-8).toUpperCase().includes(search.toUpperCase());
    return matchesFilter && matchesSearch;
  });

  const urgentCount = orders.filter(o =>
    o.current_status === "tracking_submitted" ||
    o.payout_status === "awaiting_release" ||
    transferInstructions.some(ti => ti.order_id === o.id && ti.status === "ready_for_transfer")
  ).length;

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
              <h1 className="text-3xl font-bold" style={{ color: "#1A1A1A" }}>Payout Management</h1>
              <p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>
                Verify shipments, confirm deliveries, and release builder payouts.
              </p>
            </div>
            {urgentCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-semibold">{urgentCount} order{urgentCount !== 1 ? "s" : ""} need attention</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by builder, buyer, or order #..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300"
            />
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-300"
          >
            {FILTER_OPTIONS.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
          </select>
          <button onClick={loadData} className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <p className="text-xs text-gray-400">{filtered.length} order{filtered.length !== 1 ? "s" : ""} shown</p>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No orders match this filter.</div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => (
              <AdminOrderCard
                key={order.id}
                order={order}
                transferInstructions={transferInstructions}
                onUpdate={loadData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}