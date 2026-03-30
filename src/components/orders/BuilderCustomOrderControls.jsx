import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Hammer, CheckCircle2, Clock, AlertCircle, Shield } from "lucide-react";

const NAVY = "#1B2B4B";

const STATUS_LABELS = {
  agreement_pending: { label: "Agreement Pending", color: "#6B7280", bg: "#F9FAFB" },
  agreement_accepted: { label: "Agreement Accepted", color: "#1D4ED8", bg: "#DBEAFE" },
  deposit_pending: { label: "Deposit Pending", color: "#92400E", bg: "#FEF3C7" },
  deposit_paid: { label: "Deposit Paid", color: "#065F46", bg: "#D1FAE5" },
  deposit_paid_pending_admin_release: { label: "Deposit Held — Awaiting Platform Approval", color: "#92400E", bg: "#FEF3C7" },
  build_authorized: { label: "Build Authorized", color: "#065F46", bg: "#D1FAE5" },
  build_in_progress: { label: "Build In Progress", color: "#1D4ED8", bg: "#DBEAFE" },
  build_complete: { label: "Build Complete", color: "#065F46", bg: "#D1FAE5" },
  final_payment_pending: { label: "Awaiting Final Payment", color: "#92400E", bg: "#FEF3C7" },
  final_payment_paid: { label: "Final Payment Received", color: "#065F46", bg: "#D1FAE5" },
  awaiting_shipment: { label: "Awaiting Shipment", color: "#1D4ED8", bg: "#DBEAFE" },
  tracking_submitted: { label: "Tracking Submitted", color: "#6D28D9", bg: "#EDE9FE" },
  shipment_verified: { label: "Shipment Verified", color: "#065F46", bg: "#D1FAE5" },
  delivered: { label: "Delivered", color: "#374151", bg: "#F3F4F6" },
  buyer_default_review: { label: "Buyer Default — Under Review", color: "#991B1B", bg: "#FEE2E2" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_LABELS[status] || { label: status, color: "#6B7280", bg: "#F9FAFB" };
  return (
    <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

export default function BuilderCustomOrderControls({ order, onOrderUpdated }) {
  const [marking, setMarking] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [buildNotes, setBuildNotes] = useState(order.builder_notes || "");
  const [dueDays, setDueDays] = useState(7);
  const [result, setResult] = useState(null);

  async function handleMarkInProgress() {
    setUpdatingStatus(true);
    await base44.entities.Order.update(order.id, { current_status: "build_in_progress", fulfillment_status: "build_in_progress" });
    onOrderUpdated?.({ current_status: "build_in_progress" });
    setUpdatingStatus(false);
  }

  async function handleMarkComplete() {
    setMarking(true);
    setResult(null);
    const res = await base44.functions.invoke("markBuildComplete", {
      orderId: order.id,
      builderNotes: buildNotes,
      finalPaymentDueDays: dueDays,
    });
    if (res.data?.success) {
      setResult({ type: "success", msg: `Build marked complete. Buyer has ${dueDays} days to pay final balance.` });
      onOrderUpdated?.({ current_status: "final_payment_pending", builder_notes: buildNotes });
    } else {
      setResult({ type: "error", msg: res.data?.error || "Failed to mark build complete." });
    }
    setMarking(false);
  }

  const isDepositHeld = order.current_status === "deposit_paid_pending_admin_release";
  const canMarkInProgress = order.current_status === "build_authorized";
  const canMarkComplete = ["build_authorized", "build_in_progress"].includes(order.current_status);
  const isFinalPaymentPending = order.current_status === "final_payment_pending";
  const isShipmentBlocked = isFinalPaymentPending || order.current_status === "build_complete";

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Build Status</p>
        <StatusBadge status={order.current_status} />
      </div>

      {/* First custom build notice */}
      {isDepositHeld && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">First Custom Build — Deposit Held</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Because this is your first custom build, the deposit is being held for platform review before being released to you.
              You will be notified once it's approved and you are authorized to begin work.
            </p>
          </div>
        </div>
      )}

      {/* Shipment blocked notice */}
      {isShipmentBlocked && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-red-800">
            Shipment is blocked until the buyer pays the final balance.
          </p>
        </div>
      )}

      {/* Mark In Progress */}
      {canMarkInProgress && (
        <button
          onClick={handleMarkInProgress}
          disabled={updatingStatus}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg text-white w-full justify-center transition-colors disabled:opacity-50"
          style={{ backgroundColor: "#1D4ED8" }}
        >
          <Hammer className="w-4 h-4" />
          {updatingStatus ? "Updating..." : "Mark Build In Progress"}
        </button>
      )}

      {/* Mark Build Complete */}
      {canMarkComplete && (
        <div className="border border-stone-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Build Complete
          </p>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Builder Notes for Buyer (optional)</label>
            <textarea
              rows={2}
              value={buildNotes}
              onChange={e => setBuildNotes(e.target.value)}
              placeholder="Any notes for the buyer about the completed build..."
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Days for Buyer to Pay Final Balance</label>
            <select
              value={dueDays}
              onChange={e => setDueDays(Number(e.target.value))}
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              {[3, 5, 7, 10, 14].map(d => <option key={d} value={d}>{d} days</option>)}
            </select>
          </div>

          {result && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-xs border ${
              result.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-700"
            }`}>
              {result.type === "success" ? <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />}
              {result.msg}
            </div>
          )}

          <button
            onClick={handleMarkComplete}
            disabled={marking}
            className="w-full py-2.5 text-sm font-bold text-white rounded-lg transition-colors disabled:opacity-50"
            style={{ backgroundColor: NAVY }}
          >
            {marking ? "Marking Complete..." : "Mark Build Complete & Request Final Payment"}
          </button>
        </div>
      )}

      {/* Final payment pending notice */}
      {isFinalPaymentPending && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Awaiting Final Payment from Buyer</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Final balance of <strong>${order.final_balance_amount?.toLocaleString()}</strong> is due.
              {order.final_payment_due_date && ` Due date: ${order.final_payment_due_date}.`}
              <br />Shipment is blocked until payment is received.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}