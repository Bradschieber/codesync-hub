import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  CreditCard, Truck, DollarSign, AlertTriangle, Shield, FileText,
  CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, RefreshCw
} from "lucide-react";
import { format } from "date-fns";

const CATEGORY_CONFIG = {
  payment:   { icon: CreditCard,     color: "#065F46", bg: "#D1FAE5", label: "Payment" },
  payout:    { icon: DollarSign,     color: "#1E40AF", bg: "#DBEAFE", label: "Payout"  },
  shipment:  { icon: Truck,          color: "#0369A1", bg: "#E0F2FE", label: "Shipment"},
  dispute:   { icon: AlertTriangle,  color: "#991B1B", bg: "#FEE2E2", label: "Dispute" },
  hold:      { icon: Shield,         color: "#92400E", bg: "#FEF3C7", label: "Hold"    },
  agreement: { icon: FileText,       color: "#5B21B6", bg: "#EDE9FE", label: "Agreement"},
  system:    { icon: Clock,          color: "#374151", bg: "#F3F4F6", label: "System"  },
};

const ACTOR_BADGE = {
  admin:   { label: "Admin",   style: "bg-slate-100 text-slate-700" },
  buyer:   { label: "Buyer",   style: "bg-blue-50 text-blue-700"   },
  builder: { label: "Builder", style: "bg-amber-50 text-amber-700" },
  system:  { label: "System",  style: "bg-gray-100 text-gray-500"  },
};

export default function OrderTimeline({ orderId }) {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderId) load();
  }, [orderId]);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await base44.functions.invoke("getOrderTimeline", { orderId });
    if (res.data?.success) {
      setTimeline(res.data.timeline || []);
    } else {
      setError(res.data?.error || "Failed to load timeline");
    }
    setLoading(false);
  }

  function toggle(id) {
    setExpanded(e => ({ ...e, [id]: !e[id] }));
  }

  if (loading) return (
    <div className="space-y-3 py-4">
      {[0,1,2].map(i => <div key={i} className="h-12 bg-stone-100 rounded-lg animate-pulse" />)}
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-2 py-4 text-sm text-red-600">
      <XCircle className="w-4 h-4" /> {error}
    </div>
  );

  if (!timeline.length) return (
    <p className="text-sm text-stone-400 py-4 italic">No timeline events yet.</p>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Activity Timeline</p>
        <button onClick={load} className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-stone-100" />

        <div className="space-y-2">
          {timeline.map((event) => {
            const cfg = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.system;
            const Icon = cfg.icon;
            const actor = ACTOR_BADGE[event.actor_role] || ACTOR_BADGE.system;
            const isExpanded = expanded[event.id];
            const hasDetail = event.detail || (event.raw && Object.keys(event.raw).length > 0);

            return (
              <div key={event.id} className="relative pl-12">
                {/* Icon dot */}
                <div
                  className="absolute left-2.5 top-3 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: cfg.bg }}
                >
                  <Icon className="w-3 h-3" style={{ color: cfg.color }} />
                </div>

                <div className="bg-white border border-stone-100 rounded-lg overflow-hidden">
                  <div
                    className={`flex items-start justify-between gap-3 px-4 py-3 ${hasDetail ? 'cursor-pointer hover:bg-stone-50' : ''}`}
                    onClick={() => hasDetail && toggle(event.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-stone-800">{event.label}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${actor.style}`}>
                          {actor.label}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {event.timestamp
                          ? format(new Date(event.timestamp), "MMM d, yyyy 'at' h:mm a")
                          : "Date unknown"}
                      </p>
                    </div>
                    {hasDetail && (
                      isExpanded
                        ? <ChevronUp className="w-4 h-4 text-stone-300 flex-shrink-0 mt-1" />
                        : <ChevronDown className="w-4 h-4 text-stone-300 flex-shrink-0 mt-1" />
                    )}
                  </div>

                  {isExpanded && hasDetail && (
                    <div className="border-t border-stone-100 px-4 py-3 bg-stone-50">
                      {event.detail && (
                        <p className="text-xs text-stone-600 leading-relaxed mb-2">{event.detail}</p>
                      )}
                      {event.stripe_event_id && (
                        <p className="text-xs text-stone-400 font-mono">Stripe event: {event.stripe_event_id}</p>
                      )}
                      {event.raw && Object.entries(event.raw).filter(([, v]) => v).map(([k, v]) => (
                        <p key={k} className="text-xs text-stone-400 font-mono">{k}: {String(v)}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}