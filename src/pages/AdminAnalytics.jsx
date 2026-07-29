import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ShieldCheck, ArrowLeft, ShoppingCart, CreditCard, MessageSquare, UserSearch,
  FileText, Banknote, Wallet, Heart, Newspaper, Filter, Search, AlertCircle,
  Hammer, CheckCircle2, Package, Activity, TrendingUp
} from "lucide-react";

const NAVY = "#2F3E55";

const BUYER_EVENTS = [
  { name: 'buyer_add_to_cart', label: 'Add to Cart', icon: ShoppingCart },
  { name: 'buyer_checkout_started', label: 'Checkout Started', icon: CreditCard },
  { name: 'buyer_message_builder', label: 'Message Builder', icon: MessageSquare },
  { name: 'buyer_view_builder_profile', label: 'View Builder Profile', icon: UserSearch },
  { name: 'buyer_custom_build_request_submitted', label: 'Custom Build Request', icon: FileText },
  { name: 'buyer_custom_build_deposit_paid', label: 'Deposit Paid', icon: Banknote },
  { name: 'buyer_custom_build_final_payment_paid', label: 'Final Payment Paid', icon: Wallet },
  { name: 'buyer_follow_this_build', label: 'Follow This Build', icon: Heart },
  { name: 'buyer_from_the_bench_post_opened', label: 'Bench Post Opened', icon: Newspaper },
  { name: 'buyer_catalog_filter_applied', label: 'Catalog Filter Applied', icon: Filter },
  { name: 'buyer_catalog_search', label: 'Catalog Search', icon: Search },
];

const BUILDER_EVENTS = [
  { name: 'builder_become_founding_builder_clicked', label: 'Become a Builder Clicked', icon: Hammer },
  { name: 'builder_onboarding_completed', label: 'Onboarding Completed', icon: CheckCircle2 },
  { name: 'builder_listing_published', label: 'Listing Published', icon: Package },
];

const RANGES = [
  { key: '7d', label: 'Last 7 days', days: 7 },
  { key: '30d', label: 'Last 30 days', days: 30 },
  { key: 'all', label: 'All time', days: null },
];

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function EventStatCard({ event, count, recent }) {
  const Icon = event.icon;
  const hasData = count > 0;
  return (
    <div
      className="p-4 border bg-white transition-all"
      style={{ borderColor: hasData ? "#E0DDD8" : "#EDEBE8" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: hasData ? "#EEF1F7" : "#F5F3F0" }}
        >
          <Icon className="w-4 h-4" strokeWidth={1.5} style={{ color: hasData ? NAVY : "#C4C0BB" }} />
        </div>
        {hasData && recent && (
          <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "#9A9A9A" }}>
            {timeAgo(recent.created_date)}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold mb-0.5" style={{ color: hasData ? "#1A1A1A" : "#C4C0BB" }}>{count}</p>
      <p className="text-xs font-medium leading-snug" style={{ color: hasData ? "#5A5A5A" : "#B8B4AF" }}>{event.label}</p>
    </div>
  );
}

function EventFeed({ events, emptyText }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-10 text-sm" style={{ color: "#9A9A9A" }}>{emptyText}</div>
    );
  }
  return (
    <div className="divide-y" style={{ borderColor: "#F0EDE8" }}>
      {events.map((e) => {
        const meta = [...BUYER_EVENTS, ...BUILDER_EVENTS].find(x => x.name === e.event_name);
        const Icon = meta?.icon || Activity;
        return (
          <div key={e.id} className="flex items-start gap-3 py-3 px-1">
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "#F5F3F0" }}>
              <Icon className="w-3.5 h-3.5" strokeWidth={1.5} style={{ color: "#5A5A5A" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "#1A1A1A" }}>{e.label || e.event_name}</p>
              <p className="text-xs truncate" style={{ color: "#9A9A9A" }}>
                {e.properties && Object.keys(e.properties).length > 0
                  ? Object.entries(e.properties).map(([k, v]) => `${k}: ${v}`).join('  ·  ')
                  : '—'}
              </p>
            </div>
            <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: "#B8B4AF" }}>{timeAgo(e.created_date)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminAnalytics() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [range, setRange] = useState('30d');

  useEffect(() => { loadData(); }, [range]);

  async function loadData() {
    setLoading(true);
    setLoadError(null);
    try {
      const u = await base44.auth.me();
      setUser(u);
      if (u.role !== "admin") { setLoading(false); return; }
    } catch (authErr) {
      base44.auth.redirectToLogin();
      return;
    }

    try {
      const selected = RANGES.find(r => r.key === range);
      const filter = {};
      if (selected.days) {
        const cutoff = new Date(Date.now() - selected.days * 86400000).toISOString();
        filter.created_date = { $gte: cutoff };
      }
      const data = await base44.entities.AnalyticsEvent.filter(filter, "-created_date", 1000);
      setEvents(data);
    } catch (dataErr) {
      setLoadError(dataErr.message || "Failed to load analytics data.");
    }
    setLoading(false);
  }

  function countFor(eventName) {
    return events.filter(e => e.event_name === eventName).length;
  }
  function recentFor(eventName) {
    return events.find(e => e.event_name === eventName);
  }
  function feedFor(category) {
    return events.filter(e => e.category === category).slice(0, 8);
  }

  const buyerTotal = events.filter(e => e.category === 'buyer').length;
  const builderTotal = events.filter(e => e.category === 'builder').length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
    </div>
  );

  if (user?.role !== "admin") return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <ShieldCheck className="w-12 h-12 mx-auto mb-4" style={{ color: "#CCCCCC" }} />
      <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
      <p style={{ color: "#7A7A7A" }}>You don't have permission to view this page.</p>
    </div>
  );

  if (loadError) return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "#9B1B30" }} />
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p className="text-sm mb-4" style={{ color: "#7A7A7A" }}>{loadError}</p>
      <button
        onClick={() => { setLoading(true); setLoadError(null); loadData(); }}
        className="px-5 py-2 text-sm font-semibold text-white"
        style={{ backgroundColor: NAVY }}
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-14 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl("AdminDashboard")} className="inline-flex items-center gap-1.5 text-sm mb-4 hover:opacity-70" style={{ color: NAVY }}>
            <ArrowLeft className="w-4 h-4" /> Admin Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-7 h-7" style={{ color: NAVY }} strokeWidth={1.5} />
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>Analytics</h1>
          </div>
          <p className="text-sm" style={{ color: "#5A5A5A" }}>
            Buyer and builder activity across the platform. {events.length} events in current range.
          </p>

          {/* Range selector */}
          <div className="flex gap-1 mt-5">
            {RANGES.map(r => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className="px-4 py-1.5 text-xs font-semibold border transition-all"
                style={{
                  borderColor: range === r.key ? NAVY : "#E0DDD8",
                  backgroundColor: range === r.key ? NAVY : "#FFFFFF",
                  color: range === r.key ? "#FFFFFF" : "#5A5A5A",
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="p-5 border bg-white" style={{ borderColor: "#E0DDD8" }}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4" strokeWidth={1.5} style={{ color: NAVY }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#7A7A7A" }}>Buyer Activity</span>
            </div>
            <p className="text-3xl font-bold" style={{ color: "#1A1A1A" }}>{buyerTotal}</p>
            <p className="text-xs" style={{ color: "#9A9A9A" }}>total buyer events</p>
          </div>
          <div className="p-5 border bg-white" style={{ borderColor: "#E0DDD8" }}>
            <div className="flex items-center gap-2 mb-3">
              <Hammer className="w-4 h-4" strokeWidth={1.5} style={{ color: "#7A1526" }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#7A7A7A" }}>Builder Activity</span>
            </div>
            <p className="text-3xl font-bold" style={{ color: "#1A1A1A" }}>{builderTotal}</p>
            <p className="text-xs" style={{ color: "#9A9A9A" }}>total builder events</p>
          </div>
        </div>

        {/* Buyer Activity Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4" strokeWidth={1.5} style={{ color: NAVY }} />
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#6B6B6B" }}>Buyer Activity</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {BUYER_EVENTS.map(event => (
              <EventStatCard key={event.name} event={event} count={countFor(event.name)} recent={recentFor(event.name)} />
            ))}
          </div>
          <div className="bg-white border" style={{ borderColor: "#E0DDD8" }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: "#F0EDE8", backgroundColor: "#F5F3F0" }}>
              <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#7A7A7A" }}>Recent Buyer Events</h3>
            </div>
            <div className="px-4">
              <EventFeed events={feedFor('buyer')} emptyText="No buyer events in this range yet." />
            </div>
          </div>
        </div>

        {/* Builder Activity Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Hammer className="w-4 h-4" strokeWidth={1.5} style={{ color: "#7A1526" }} />
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#6B6B6B" }}>Builder Activity</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {BUILDER_EVENTS.map(event => (
              <EventStatCard key={event.name} event={event} count={countFor(event.name)} recent={recentFor(event.name)} />
            ))}
          </div>
          <div className="bg-white border" style={{ borderColor: "#E0DDD8" }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: "#F0EDE8", backgroundColor: "#F5F3F0" }}>
              <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#7A7A7A" }}>Recent Builder Events</h3>
            </div>
            <div className="px-4">
              <EventFeed events={feedFor('builder')} emptyText="No builder events in this range yet." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}