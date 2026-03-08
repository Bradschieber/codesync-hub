import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ShieldCheck, ChevronLeft, CheckCircle2, XCircle, Clock,
  DollarSign, Truck, Package, AlertTriangle, RefreshCw, Search
} from "lucide-react";
import { format } from "date-fns";

const NAVY = "#2F3E55";

function getPayoutState(order) {
  const isCustom = order.order_type === "custom";

  if (isCustom) {
    const depositEligible =
      order.purchase_agreement_signed &&
      ["deposit_paid", "awaiting_final_payment", "final_payment_received", "fully_paid"].includes(order.payment_stage);

    const finalPaymentReceived = order.final_payment_paid;
    const trackingUploaded = !!order.tracking_number;
    const trackingVerified = order.tracking_verified;
    const firstTransactionSatisfied = order.is_first_transaction
      ? order.delivery_confirmed
      : trackingVerified;

    const finalPayoutEligible =
      finalPaymentReceived && trackingUploaded && trackingVerified && firstTransactionSatisfied;

    if (order.deposit_payout_released && order.final_payout_released) return "paid";
    if (finalPayoutEligible && !order.final_payout_released) return "final_payout_ready";
    if (depositEligible && !order.deposit_payout_released) return "deposit_ready";
    if (order.payment_stage === "awaiting_final_payment") return "waiting_final_payment";
    if (finalPaymentReceived && !trackingUploaded) return "waiting_tracking";
    if (finalPaymentReceived && trackingUploaded && order.is_first_transaction && !order.delivery_confirmed) return "waiting_delivery";
    return "pending";
  } else {
    const buyerPaid = order.status === "paid";
    const trackingUploaded = !!order.tracking_number;
    const trackingVerified = order.tracking_verified;
    const firstTransactionSatisfied = order.is_first_transaction
      ? order.delivery_confirmed
      : trackingVerified;

    const payoutEligible = buyerPaid && trackingUploaded && trackingVerified && firstTransactionSatisfied;

    if (order.final_payout_released) return "paid";
    if (payoutEligible) return "final_payout_ready";
    if (buyerPaid && !trackingUploaded) return "waiting_tracking";
    if (buyerPaid && trackingUploaded && order.is_first_transaction && !order.delivery_confirmed) return "waiting_delivery";
    return "pending";
  }
}

const PAYOUT_STATE_CONFIG = {
  deposit_ready:        { label: "Deposit Ready",             color: "#166534", bg: "#DCFCE7", icon: DollarSign },
  final_payout_ready:   { label: "Final Payout Ready",        color: "#14532D", bg: "#BBF7D0", icon: DollarSign },
  waiting_final_payment:{ label: "Waiting for Final Payment", color: "#92400E", bg: "#FEF3C7", icon: Clock },
  waiting_tracking:     { label: "Waiting for Tracking",      color: "#1E40AF", bg: "#DBEAFE", icon: Truck },
  waiting_delivery:     { label: "Waiting for Delivery",      color: "#7C2D12", bg: "#FED7AA", icon: Package },
  paid:                 { label: "Paid Out",                  color: "#6B7280", bg: "#F3F4F6", icon: CheckCircle2 },
  pending:              { label: "Pending",                   color: "#374151", bg: "#F9FAFB", icon: Clock },
};

function PayoutStateBadge({ state }) {
  const cfg = PAYOUT_STATE_CONFIG[state] || PAYOUT_STATE_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function CheckRow({ label, satisfied }) {
  return (
    <div className="flex items-center gap-2 py-1">
      {satisfied
        ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
        : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
      <span className={`text-xs ${satisfied ? "text-gray-700" : "text-gray-400"}`}>{label}</span>
    </div>
  );
}

function OrderPayoutCard({ order, onUpdate }) {
  const [saving, setSaving] = useState(false);
  const state = getPayoutState(order);
  const isCustom = order.order_type === "custom";

  const depositReady =
    order.purchase_agreement_signed &&
    ["deposit_paid", "awaiting_final_payment", "final_payment_received", "fully_paid"].includes(order.payment_stage);

  const finalPaymentReceived = order.final_payment_paid;
  const trackingUploaded = !!order.tracking_number;
  const trackingVerified = order.tracking_verified;
  const firstTransactionSatisfied = order.is_first_transaction
    ? order.delivery_confirmed
    : trackingVerified;

  const finalPayoutEligible = isCustom
    ? finalPaymentReceived && trackingUploaded && trackingVerified && firstTransactionSatisfied
    : order.status === "paid" && trackingUploaded && trackingVerified && firstTransactionSatisfied;

  async function update(fields) {
    setSaving(true);
    await base44.entities.Order.update(order.id, fields);
    onUpdate(order.id, fields);
    setSaving(false);
  }

  return (
    <div className="bg-white border rounded-xl p-5 space-y-4" style={{ borderColor: "#E0DDD8" }}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-sm" style={{ color: "#1A1A1A" }}>
              Order #{order.id.slice(-8).toUpperCase()}
            </p>
            <PayoutStateBadge state={state} />
            {isCustom && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">Custom Build</span>
            )}
            {order.is_first_transaction && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">1st Transaction</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {order.builder_name} → {order.buyer_name || order.buyer_email}
            {order.created_date && ` · ${format(new Date(order.created_date), "MMM d, yyyy")}`}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-base" style={{ color: "#A0692A" }}>${order.total_amount?.toLocaleString()}</p>
          {isCustom && order.deposit_amount && (
            <p className="text-xs text-gray-500">Deposit: ${order.deposit_amount?.toLocaleString()}</p>
          )}
        </div>
      </div>

      {/* Checklist */}
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-0 border-t pt-4" style={{ borderColor: "#F3F2EF" }}>
        {isCustom ? (
          <>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Deposit Payout</p>
              <CheckRow label="Purchase agreement signed" satisfied={order.purchase_agreement_signed} />
              <CheckRow
                label="Deposit payment received"
                satisfied={["deposit_paid","awaiting_final_payment","final_payment_received","fully_paid"].includes(order.payment_stage)}
              />
              {order.deposit_payout_released && (
                <p className="text-xs text-green-600 font-medium mt-1">✓ Deposit released</p>
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Final Payout</p>
              <CheckRow label="Final payment received" satisfied={order.final_payment_paid} />
              <CheckRow label="Tracking uploaded" satisfied={trackingUploaded} />
              <CheckRow label="Tracking verified" satisfied={order.tracking_verified} />
              {order.is_first_transaction
                ? <CheckRow label="Delivery confirmed (1st transaction)" satisfied={order.delivery_confirmed} />
                : <CheckRow label="First transaction rule N/A" satisfied={true} />
              }
              {order.final_payout_released && (
                <p className="text-xs text-green-600 font-medium mt-1">✓ Final payout released</p>
              )}
            </div>
          </>
        ) : (
          <div className="sm:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Payout Requirements</p>
            <div className="grid sm:grid-cols-2 gap-x-6">
              <div>
                <CheckRow label="Buyer payment received" satisfied={order.status === "paid"} />
                <CheckRow label="Tracking uploaded" satisfied={trackingUploaded} />
              </div>
              <div>
                <CheckRow label="Tracking verified" satisfied={order.tracking_verified} />
                {order.is_first_transaction
                  ? <CheckRow label="Delivery confirmed (1st transaction)" satisfied={order.delivery_confirmed} />
                  : <CheckRow label="First transaction rule N/A" satisfied={true} />
                }
              </div>
            </div>
            {order.final_payout_released && (
              <p className="text-xs text-green-600 font-medium mt-1">✓ Payout released</p>
            )}
          </div>
        )}
      </div>

      {/* Admin Controls */}
      <div className="border-t pt-4 space-y-3" style={{ borderColor: "#F3F2EF" }}>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Admin Controls</p>

        <div className="flex flex-wrap gap-2">
          {/* Toggle flags */}
          {isCustom && !order.purchase_agreement_signed && (
            <button onClick={() => update({ purchase_agreement_signed: true })} disabled={saving}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
              ✓ Mark Agreement Signed
            </button>
          )}
          {isCustom && !order.final_payment_paid && (
            <button onClick={() => update({ final_payment_paid: true, payment_stage: "final_payment_received" })} disabled={saving}
              className="text-xs px-3 py-1.5 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors">
              ✓ Mark Final Payment Received
            </button>
          )}
          {!order.tracking_verified && trackingUploaded && (
            <button onClick={() => update({ tracking_verified: true })} disabled={saving}
              className="text-xs px-3 py-1.5 rounded-lg border border-indigo-300 text-indigo-700 hover:bg-indigo-50 transition-colors">
              ✓ Verify Tracking
            </button>
          )}
          {!order.delivery_confirmed && (
            <button onClick={() => update({ delivery_confirmed: true })} disabled={saving}
              className="text-xs px-3 py-1.5 rounded-lg border border-teal-300 text-teal-700 hover:bg-teal-50 transition-colors">
              ✓ Confirm Delivery
            </button>
          )}
          <button
            onClick={() => update({ is_first_transaction: !order.is_first_transaction })}
            disabled={saving}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              order.is_first_transaction
                ? "border-amber-300 text-amber-700 bg-amber-50"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}>
            {order.is_first_transaction ? "1st Txn: ON" : "Mark 1st Transaction"}
          </button>
        </div>

        {/* Payout release buttons */}
        <div className="flex flex-wrap gap-3">
          {isCustom && (
            <button
              disabled={saving || order.deposit_payout_released || !depositReady}
              onClick={() => update({ deposit_payout_released: true })}
              className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
                order.deposit_payout_released
                  ? "bg-gray-100 text-gray-400 cursor-default"
                  : depositReady
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}>
              {order.deposit_payout_released ? "Deposit Released ✓" : "Release Deposit"}
            </button>
          )}
          <button
            disabled={saving || order.final_payout_released || !finalPayoutEligible}
            onClick={() => update({ final_payout_released: true })}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
              order.final_payout_released
                ? "bg-gray-100 text-gray-400 cursor-default"
                : finalPayoutEligible
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}>
            {order.final_payout_released
              ? "Final Payout Released ✓"
              : isCustom ? "Release Final Payout" : "Release Payout"}
          </button>
          {!finalPayoutEligible && !order.final_payout_released && (
            <p className="text-xs text-gray-400 self-center">
              {isCustom && !order.final_payment_paid
                ? "Awaiting final payment"
                : !trackingUploaded
                ? "Awaiting tracking"
                : !order.tracking_verified
                ? "Tracking not verified"
                : order.is_first_transaction && !order.delivery_confirmed
                ? "Awaiting delivery confirmation (1st transaction)"
                : "Requirements not met"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const FILTER_OPTIONS = [
  { key: "all", label: "All Orders" },
  { key: "deposit_ready", label: "Deposit Ready" },
  { key: "final_payout_ready", label: "Final Payout Ready" },
  { key: "waiting_final_payment", label: "Waiting Final Payment" },
  { key: "waiting_tracking", label: "Waiting Tracking" },
  { key: "waiting_delivery", label: "Waiting Delivery" },
  { key: "paid", label: "Paid Out" },
];

export default function AdminPayouts() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      if (u.role !== "admin") { setLoading(false); return; }
      const allOrders = await base44.entities.Order.list("-created_date", 300);
      // Only show paid or in-progress orders (skip pending/cancelled)
      setOrders(allOrders.filter(o => o.status !== "cancelled"));
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  function handleUpdate(orderId, fields) {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...fields } : o));
  }

  const filtered = orders.filter(o => {
    const state = getPayoutState(o);
    const matchesFilter = filter === "all" || state === filter;
    const matchesSearch = !search ||
      o.builder_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.buyer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.buyer_email?.toLowerCase().includes(search.toLowerCase()) ||
      o.id.slice(-8).toUpperCase().includes(search.toUpperCase());
    return matchesFilter && matchesSearch;
  });

  const urgentCount = orders.filter(o => ["deposit_ready","final_payout_ready"].includes(getPayoutState(o))).length;

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
              <p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>Review payout readiness and release builder payouts.</p>
            </div>
            {urgentCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-semibold">{urgentCount} payout{urgentCount !== 1 ? "s" : ""} ready for release</span>
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
            {FILTER_OPTIONS.map(opt => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
          <button onClick={() => loadData()} className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Count */}
        <p className="text-xs text-gray-400">{filtered.length} order{filtered.length !== 1 ? "s" : ""} shown</p>

        {/* Order Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No orders match this filter.</div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => (
              <OrderPayoutCard key={order.id} order={order} onUpdate={handleUpdate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}