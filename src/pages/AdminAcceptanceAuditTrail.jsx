import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, ShieldCheck, Search, X, Download, ChevronDown, FileText } from "lucide-react";
import { format } from "date-fns";

const NAVY = "#2F3E55";

const AGREEMENT_TYPE_LABELS = {
  terms_of_use: "Terms of Use",
  privacy_policy: "Privacy Policy",
  builder_terms: "Builder Terms",
  builder_policy_confirmation: "Builder Policy Confirmation",
  buyer_terms: "Buyer Terms",
  stock_order_terms: "Stock Order Terms",
  custom_build_agreement: "Custom Build Agreement",
  deposit_authorization: "Deposit Authorization",
  final_payment_authorization: "Final Payment Authorization",
};

const ROLE_LABELS = {
  user: "Buyer",
  seller: "Builder",
  admin: "Admin",
  guest: "Guest",
};

const ROLE_COLORS = {
  user: { bg: "#EFF6FF", color: "#3B82F6" },
  seller: { bg: "#FDF3E3", color: "#C57A1F" },
  admin: { bg: "#F3E8FF", color: "#7C3AED" },
  guest: { bg: "#F5F5F5", color: "#9A9A9A" },
};

export default function AdminAcceptanceAuditTrail() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterVersion, setFilterVersion] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      if (u.role !== "admin") { setLoading(false); return; }
      const data = await base44.entities.LegalAcceptanceEvent.list("-accepted_at_utc", 500);
      setEvents(data);
    } catch {
      base44.auth.redirectToLogin();
    }
    setLoading(false);
  }

  const versions = useMemo(() => {
    const vs = new Set(events.map(e => e.agreement_version).filter(Boolean));
    return Array.from(vs).sort();
  }, [events]);

  const filtered = useMemo(() => {
    return events.filter(e => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !e.email_at_acceptance?.toLowerCase().includes(q) &&
          !e.user_id?.toLowerCase().includes(q) &&
          !e.order_id?.toLowerCase().includes(q) &&
          !e.transaction_id?.toLowerCase().includes(q) &&
          !e.source_screen?.toLowerCase().includes(q)
        ) return false;
      }
      if (filterType && e.agreement_type !== filterType) return false;
      if (filterRole && e.role_at_acceptance !== filterRole) return false;
      if (filterVersion && e.agreement_version !== filterVersion) return false;
      if (filterDateFrom && new Date(e.accepted_at_utc) < new Date(filterDateFrom)) return false;
      if (filterDateTo && new Date(e.accepted_at_utc) > new Date(filterDateTo + "T23:59:59")) return false;
      return true;
    });
  }, [events, search, filterType, filterRole, filterVersion, filterDateFrom, filterDateTo]);

  const hasFilters = search || filterType || filterRole || filterVersion || filterDateFrom || filterDateTo;

  function clearFilters() {
    setSearch("");
    setFilterType("");
    setFilterRole("");
    setFilterVersion("");
    setFilterDateFrom("");
    setFilterDateTo("");
  }

  function exportCSV() {
    const headers = ["accepted_at", "email", "role", "agreement_type", "agreement_version", "source_flow", "source_screen", "order_id", "transaction_id", "ip_address"];
    const rows = filtered.map(e => [
      e.accepted_at_utc || "",
      e.email_at_acceptance || "",
      e.role_at_acceptance || "",
      e.agreement_type || "",
      e.agreement_version || "",
      e.source_flow || "",
      e.source_screen || "",
      e.order_id || "",
      e.transaction_id || "",
      e.ip_address || "",
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `acceptance-audit-trail-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

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
      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl("AdminDashboard")} className="inline-flex items-center gap-1.5 text-sm mb-4 hover:opacity-70" style={{ color: NAVY }}>
            <ArrowLeft className="w-4 h-4" /> Admin Dashboard
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>Acceptance Audit Trail</h1>
              <p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>{filtered.length} records{events.length !== filtered.length ? ` (of ${events.length} total)` : ""}</p>
            </div>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border transition-colors"
              style={{ borderColor: NAVY, color: NAVY, backgroundColor: "transparent" }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = NAVY; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = NAVY; }}
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filters */}
        <div className="bg-white border p-4 mb-6 space-y-3" style={{ borderColor: "#E0DDD8" }}>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9A9A9A" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by email, user ID, order ID, screen..."
              className="w-full pl-9 pr-9 py-2.5 border text-sm focus:outline-none"
              style={{ borderColor: "#DEDBD6", backgroundColor: "#FAFAF9" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-stone-400 hover:text-stone-700" />
              </button>
            )}
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-3 items-center">
            <FilterSelect
              value={filterType}
              onChange={setFilterType}
              options={[{ label: "All Agreement Types", value: "" }, ...Object.entries(AGREEMENT_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))]}
            />
            <FilterSelect
              value={filterRole}
              onChange={setFilterRole}
              options={[{ label: "All Roles", value: "" }, ...Object.entries(ROLE_LABELS).map(([v, l]) => ({ value: v, label: l }))]}
            />
            <FilterSelect
              value={filterVersion}
              onChange={setFilterVersion}
              options={[{ label: "All Versions", value: "" }, ...versions.map(v => ({ value: v, label: `v${v}` }))]}
            />
            <div className="flex items-center gap-2 text-sm" style={{ color: "#6B6B6B" }}>
              <label>From</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={e => setFilterDateFrom(e.target.value)}
                className="border px-2 py-1.5 text-sm focus:outline-none"
                style={{ borderColor: "#DEDBD6" }}
              />
              <label>To</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={e => setFilterDateTo(e.target.value)}
                className="border px-2 py-1.5 text-sm focus:outline-none"
                style={{ borderColor: "#DEDBD6" }}
              />
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs underline hover:opacity-70" style={{ color: "#7A7A7A" }}>
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border overflow-x-auto" style={{ borderColor: "#E0DDD8" }}>
          {/* Table Header */}
          <div className="grid min-w-[1000px] px-4 py-2 border-b text-xs font-semibold uppercase tracking-wide"
            style={{ borderColor: "#E0DDD8", color: "#7A7A7A", backgroundColor: "#F5F3F0",
              gridTemplateColumns: "160px 180px 70px 200px 60px 130px 130px 120px 90px" }}>
            <div>Accepted At</div>
            <div>Email</div>
            <div>Role</div>
            <div>Agreement</div>
            <div>Version</div>
            <div>Source Flow</div>
            <div>Source Screen</div>
            <div>Order / Txn ID</div>
            <div>IP Address</div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: "#CCCCCC" }} />
              <p className="text-sm" style={{ color: "#9A9A9A" }}>No acceptance records found.</p>
            </div>
          ) : (
            filtered.map(event => (
              <div key={event.id}>
                <div
                  className="grid min-w-[1000px] px-4 py-3 border-b items-center cursor-pointer hover:bg-stone-50 transition-colors"
                  style={{ borderColor: "#F0EDE8", gridTemplateColumns: "160px 180px 70px 200px 60px 130px 130px 120px 90px" }}
                  onClick={() => setExpandedRow(expandedRow === event.id ? null : event.id)}
                >
                  <div className="text-xs" style={{ color: "#4A4A4A" }}>
                    {event.accepted_at_utc ? format(new Date(event.accepted_at_utc), "MMM d, yyyy HH:mm") : "—"}
                  </div>
                  <div className="text-xs truncate" style={{ color: "#1A1A1A" }}>{event.email_at_acceptance || "—"}</div>
                  <div>
                    {event.role_at_acceptance && (
                      <span className="text-xs font-semibold px-2 py-0.5"
                        style={{
                          backgroundColor: ROLE_COLORS[event.role_at_acceptance]?.bg || "#F5F5F5",
                          color: ROLE_COLORS[event.role_at_acceptance]?.color || "#9A9A9A"
                        }}>
                        {ROLE_LABELS[event.role_at_acceptance] || event.role_at_acceptance}
                      </span>
                    )}
                  </div>
                  <div className="text-xs" style={{ color: "#1A1A1A" }}>{AGREEMENT_TYPE_LABELS[event.agreement_type] || event.agreement_type}</div>
                  <div className="text-xs font-mono" style={{ color: "#5A5A5A" }}>{event.agreement_version || "—"}</div>
                  <div className="text-xs truncate" style={{ color: "#5A5A5A" }}>{event.source_flow || "—"}</div>
                  <div className="text-xs truncate" style={{ color: "#5A5A5A" }}>{event.source_screen || "—"}</div>
                  <div className="text-xs font-mono truncate" style={{ color: "#7A7A7A" }}>
                    {event.order_id ? `#${event.order_id.slice(-6)}` : event.transaction_id ? event.transaction_id.slice(0, 12) + "…" : "—"}
                  </div>
                  <div className="text-xs font-mono" style={{ color: "#9A9A9A" }}>{event.ip_address || "—"}</div>
                </div>

                {/* Expanded Detail Row */}
                {expandedRow === event.id && (
                  <div className="px-6 py-5 border-b" style={{ borderColor: "#F0EDE8", backgroundColor: "#FAFAF9" }}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                      <Detail label="User ID" value={event.user_id} mono />
                      <Detail label="Agreement Title" value={event.agreement_title} />
                      <Detail label="Acceptance Method" value={event.acceptance_method} />
                      <Detail label="Is Current Version" value={event.is_current_version ? "Yes" : "No"} />
                      <Detail label="Full Order ID" value={event.order_id} mono />
                      <Detail label="Full Transaction ID" value={event.transaction_id} mono />
                      <Detail label="Session ID" value={event.session_id} mono />
                      <Detail label="Snapshot Ref" value={event.snapshot_url_or_id} mono />
                      <div className="col-span-2 lg:col-span-4">
                        <Detail label="User Agent" value={event.user_agent} />
                      </div>
                      {event.notes && (
                        <div className="col-span-2 lg:col-span-4">
                          <Detail label="Notes" value={event.notes} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 text-sm border focus:outline-none cursor-pointer"
        style={{ borderColor: value ? NAVY : "#DEDBD6", backgroundColor: value ? NAVY : "#FFFFFF", color: value ? "#FFFFFF" : "#4A4A4A" }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: value ? "#FFFFFF" : "#9A9A9A" }} />
    </div>
  );
}

function Detail({ label, value, mono }) {
  return (
    <div>
      <p className="font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#9A9A9A", fontSize: "10px" }}>{label}</p>
      <p className={`text-xs break-all ${mono ? "font-mono" : ""}`} style={{ color: value ? "#1A1A1A" : "#CCCCCC" }}>
        {value || "—"}
      </p>
    </div>
  );
}