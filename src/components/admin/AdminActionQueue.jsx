import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Truck, DollarSign, Shield, AlertTriangle, XCircle, Clock, RefreshCw, ChevronRight
} from "lucide-react";

const QUEUE_CONFIG = [
  {
    key: "tracking",
    label: "Tracking Needs Verification",
    summaryKey: "tracking_needs_review",
    icon: Truck,
    color: "#0369A1",
    bg: "#E0F2FE",
    urgentBg: "#FEF3C7",
    urgentColor: "#92400E",
    page: "AdminPayouts",
    getRows: (q) => q.tracking,
    rowLabel: (o) => `Order #${o.id.slice(-8).toUpperCase()} · ${o.builder_name} · ${o.tracking_carrier || ''} ${o.tracking_number || ''}`,
  },
  {
    key: "deposit_approval",
    label: "Deposits Awaiting Approval",
    summaryKey: "deposit_needs_approval",
    icon: Shield,
    color: "#92400E",
    bg: "#FEF3C7",
    urgent: true,
    page: "AdminPayouts",
    getRows: (q) => q.deposit_approval,
    rowLabel: (o) => `Order #${o.id.slice(-8).toUpperCase()} · ${o.builder_name} · Deposit $${(o.deposit_amount || 0).toLocaleString()}`,
  },
  {
    key: "payout_release",
    label: "Payouts Ready for Release",
    summaryKey: "payout_ready_for_release",
    icon: DollarSign,
    color: "#065F46",
    bg: "#D1FAE5",
    urgent: true,
    page: "AdminPayouts",
    getRows: (q) => q.payout_release,
    rowLabel: (o) => `Order #${o.id.slice(-8).toUpperCase()} · ${o.builder_name} · Net $${(o._ti?.transfer_amount_net || 0).toFixed(2)}`,
  },
  {
    key: "issues",
    label: "Open Issues & Disputes",
    summaryKey: "open_issues",
    icon: AlertTriangle,
    color: "#991B1B",
    bg: "#FEE2E2",
    urgent: true,
    page: "AdminIssues",
    getRows: (q) => q.issues,
    rowLabel: (d) => `Order #${(d.order_id || '').slice(-8).toUpperCase()} · ${d.reason || d.type} · ${d.status?.replace(/_/g, ' ')}`,
  },
  {
    key: "buyer_default",
    label: "Buyer Default Review",
    summaryKey: "buyer_default_review",
    icon: XCircle,
    color: "#7C3AED",
    bg: "#EDE9FE",
    urgent: true,
    page: "AdminPayouts",
    getRows: (q) => q.buyer_default,
    rowLabel: (o) => `Order #${o.id.slice(-8).toUpperCase()} · ${o.builder_name} · Buyer: ${o.buyer_email || ''}`,
  },
  {
    key: "payout_failed",
    label: "Payout Failures",
    summaryKey: "payout_failed",
    icon: XCircle,
    color: "#991B1B",
    bg: "#FEE2E2",
    urgent: true,
    page: "AdminPayouts",
    getRows: (q) => q.payout_failed,
    rowLabel: (o) => `Order #${o.id.slice(-8).toUpperCase()} · ${o.builder_name}`,
  },
];

export default function AdminActionQueue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await base44.functions.invoke("getAdminActionQueue", {});
    if (res.data?.success) setData(res.data);
    setLoading(false);
  }

  function toggle(key) {
    setExpanded(e => ({ ...e, [key]: !e[key] }));
  }

  if (loading) return (
    <div className="space-y-3">
      {[0,1,2].map(i => <div key={i} className="h-16 bg-stone-100 rounded-xl animate-pulse" />)}
    </div>
  );

  if (!data) return null;

  const { summary, queues } = data;
  const activeQueues = QUEUE_CONFIG.filter(cfg => (summary[cfg.summaryKey] || 0) > 0);

  if (activeQueues.length === 0) return (
    <div className="rounded-xl border border-stone-200 bg-white px-6 py-8 text-center">
      <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
        <Clock className="w-5 h-5 text-green-600" />
      </div>
      <p className="text-sm font-semibold text-stone-600">All clear</p>
      <p className="text-xs text-stone-400 mt-1">No items require immediate attention.</p>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">Action Queue</h2>
          {summary.total_urgent > 0 && (
            <p className="text-xs text-red-600 font-semibold mt-0.5">
              {summary.total_urgent} item{summary.total_urgent !== 1 ? "s" : ""} need attention
            </p>
          )}
        </div>
        <button onClick={load} className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      <div className="space-y-3">
        {activeQueues.map(cfg => {
          const count = summary[cfg.summaryKey] || 0;
          const rows = cfg.getRows(queues) || [];
          const Icon = cfg.icon;
          const isExpanded = expanded[cfg.key];

          return (
            <div key={cfg.key} className="rounded-xl border overflow-hidden bg-white"
              style={{ borderColor: cfg.urgent ? "#FCA5A5" : "#E0DDD8" }}>

              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-stone-50 transition-colors"
                onClick={() => rows.length && toggle(cfg.key)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: cfg.bg }}>
                    <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-800">{cfg.label}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{count} item{count !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: cfg.urgent ? "#FEE2E2" : "#F3F4F6", color: cfg.urgent ? "#991B1B" : "#6B7280" }}>
                    {count}
                  </span>
                  <Link
                    to={createPageUrl(cfg.page)}
                    onClick={e => e.stopPropagation()}
                    className="text-xs font-medium text-stone-400 hover:text-stone-700 flex items-center gap-0.5"
                  >
                    View all <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {isExpanded && rows.length > 0 && (
                <div className="border-t border-stone-100 divide-y divide-stone-50">
                  {rows.slice(0, 5).map((row, i) => (
                    <div key={i} className="px-5 py-2.5 flex items-center justify-between gap-3">
                      <p className="text-xs text-stone-600 truncate">{cfg.rowLabel(row)}</p>
                      <Link
                        to={createPageUrl(cfg.page)}
                        className="text-xs font-medium flex-shrink-0 hover:underline"
                        style={{ color: cfg.color }}
                      >
                        Act
                      </Link>
                    </div>
                  ))}
                  {rows.length > 5 && (
                    <div className="px-5 py-2 text-xs text-stone-400 italic">
                      +{rows.length - 5} more — view in {cfg.label}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}