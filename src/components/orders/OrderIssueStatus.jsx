import { AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react";

const ISSUE_TYPE_LABELS = {
  buyer_issue: "Issue Under Review",
  refund_review: "Refund Review",
  formal_dispute: "Formal Dispute",
  chargeback: "Chargeback",
};

const STATUS_CONFIG = {
  open:                   { label: "Open",                 color: "#92400E", bg: "#FEF3C7", icon: Clock },
  under_review:           { label: "Under Review",         color: "#1E40AF", bg: "#DBEAFE", icon: Clock },
  awaiting_buyer:         { label: "Awaiting Your Response", color: "#7C3AED", bg: "#EDE9FE", icon: AlertTriangle },
  awaiting_builder:       { label: "Awaiting Builder",     color: "#065F46", bg: "#D1FAE5", icon: Clock },
  resolved_buyer_favor:   { label: "Resolved in Your Favor", color: "#166534", bg: "#DCFCE7", icon: CheckCircle },
  resolved_builder_favor: { label: "Resolved — No Action", color: "#374151", bg: "#F3F4F6", icon: CheckCircle },
  resolved_partial:       { label: "Partially Resolved",   color: "#92400E", bg: "#FEF3C7", icon: CheckCircle },
  closed:                 { label: "Closed",               color: "#6B7280", bg: "#F9FAFB", icon: XCircle },
  won:                    { label: "Resolved in Your Favor", color: "#166534", bg: "#DCFCE7", icon: CheckCircle },
  lost:                   { label: "Closed",               color: "#6B7280", bg: "#F9FAFB", icon: XCircle },
};

export default function OrderIssueStatus({ dispute }) {
  if (!dispute) return null;
  const cfg = STATUS_CONFIG[dispute.status] || STATUS_CONFIG.open;
  const Icon = cfg.icon;
  const typeLabel = ISSUE_TYPE_LABELS[dispute.type] || "Issue";

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#E3E0D8" }}>
      <div className="flex items-center gap-2 px-4 py-3" style={{ backgroundColor: cfg.bg }}>
        <Icon className="w-4 h-4 flex-shrink-0" style={{ color: cfg.color }} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold" style={{ color: cfg.color }}>{typeLabel}</p>
          <p className="text-xs font-medium" style={{ color: cfg.color }}>Status: {cfg.label}</p>
        </div>
      </div>
      {dispute.buyer_notes && (
        <div className="px-4 py-3 bg-white border-t border-stone-100">
          <p className="text-xs font-semibold text-stone-400 mb-1">Your reported issue</p>
          <p className="text-sm text-stone-600 leading-relaxed">{dispute.buyer_notes}</p>
        </div>
      )}
      {dispute.resolution_notes && ['resolved_buyer_favor', 'resolved_partial', 'resolved_builder_favor', 'closed', 'won', 'lost'].includes(dispute.status) && (
        <div className="px-4 py-3 bg-stone-50 border-t border-stone-100">
          <p className="text-xs font-semibold text-stone-400 mb-1">Resolution</p>
          <p className="text-sm text-stone-600 leading-relaxed">{dispute.resolution_notes}</p>
        </div>
      )}
    </div>
  );
}