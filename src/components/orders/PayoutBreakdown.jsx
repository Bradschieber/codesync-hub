import { DollarSign, Shield, Info } from "lucide-react";

const NAVY = "#1B2B4B";

const PAYOUT_STATUS_CONFIG = {
  pending:                { label: "Pending",                  color: "#6B7280", bg: "#F9FAFB" },
  held_first_sale:        { label: "Held — First Sale",        color: "#92400E", bg: "#FEF3C7" },
  held_tracking_unverified:{ label: "Held — Tracking Unverified", color: "#1E40AF", bg: "#DBEAFE" },
  held_dispute:           { label: "Held — Dispute",          color: "#991B1B", bg: "#FEE2E2" },
  held_admin:             { label: "Held — Admin",            color: "#374151", bg: "#F3F4F6" },
  awaiting_release:       { label: "Awaiting Release",        color: "#065F46", bg: "#D1FAE5" },
  partially_released:     { label: "Partially Released",      color: "#166534", bg: "#DCFCE7" },
  fully_released:         { label: "Paid Out",                color: "#166534", bg: "#DCFCE7" },
  payout_failed:          { label: "Payout Failed",           color: "#991B1B", bg: "#FEE2E2" },
};

function StatusBadge({ status }) {
  const cfg = PAYOUT_STATUS_CONFIG[status] || PAYOUT_STATUS_CONFIG.pending;
  return (
    <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

export default function PayoutBreakdown({ order, showAdminDetail = false }) {
  const gross = order.total_gross_amount || order.total_amount || 0;
  const platformFee = order.platform_fee_amount || (gross * 0.05);
  const stripeFee = order.stripe_fee_amount || order.stripe_fee_estimated || null;
  const builderNet = order.builder_net_payout_expected || (gross - platformFee - (stripeFee || 0));

  return (
    <div className="border border-stone-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5" /> Payout Summary
        </p>
        <StatusBadge status={order.payout_status || "pending"} />
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-stone-700">
          <span>Gross Sale Amount</span>
          <span className="font-medium">${gross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-stone-500">
          <span>Stringed Collective Fee (5%)</span>
          <span>−${platformFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-stone-500">
          <span className="flex items-center gap-1">
            Stripe Processing Fee
            {!stripeFee && <span className="text-xs text-stone-400">(est.)</span>}
          </span>
          <span>−${(stripeFee || gross * 0.029 + 0.30).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between font-bold text-stone-800 pt-1.5 border-t border-stone-200">
          <span>Builder Net Payout</span>
          <span style={{ color: NAVY }}>${builderNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      {order.is_first_transaction && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-800">First Sale Protection Active</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Payout is held until delivery is confirmed by the buyer or admin. This protects all parties on your first transaction.
            </p>
          </div>
        </div>
      )}

      {showAdminDetail && order.stripe_payment_intent_id && (
        <div className="text-xs text-stone-400 pt-1 border-t border-stone-100 space-y-0.5">
          <p>PI: <span className="font-mono">{order.stripe_payment_intent_id}</span></p>
          {order.stripe_charge_id && <p>Charge: <span className="font-mono">{order.stripe_charge_id}</span></p>}
          {order.stripe_account_id_destination && <p>Destination: <span className="font-mono">{order.stripe_account_id_destination}</span></p>}
        </div>
      )}
    </div>
  );
}