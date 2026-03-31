import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ChevronLeft, RefreshCw, Download, CheckCircle2, XCircle,
  AlertTriangle, Clock, RotateCcw, Filter, ShieldCheck
} from "lucide-react";
import QAItemDrawer from "../components/admin/QAItemDrawer";

const NAVY = "#2F3E55";

const STATUS_CONFIG = {
  "Not Started": { color: "bg-gray-100 text-gray-600", icon: Clock },
  "Pass":        { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  "Fail":        { color: "bg-red-100 text-red-700", icon: XCircle },
  "Blocked":     { color: "bg-orange-100 text-orange-700", icon: AlertTriangle },
  "Retest Needed": { color: "bg-yellow-100 text-yellow-700", icon: RotateCcw },
};

const PRIORITY_COLOR = {
  "Critical": "bg-red-100 text-red-700",
  "High":     "bg-orange-100 text-orange-700",
  "Medium":   "bg-yellow-100 text-yellow-700",
  "Low":      "bg-gray-100 text-gray-500",
};

const RETEST_CONFIG = {
  "Not Needed": "text-gray-400",
  "Pending":    "text-blue-600 font-medium",
  "Pass":       "text-green-600 font-medium",
  "Fail":       "text-red-600 font-medium",
};

const CATEGORIES = [
  "Builder Onboarding / Payout Readiness",
  "Stock Builds",
  "Custom Builds",
  "Payout Holds",
  "Refunds",
  "Issues / Disputes",
  "Audit / Admin Controls",
  "Regression / Edge Cases",
];

function exportCSV(items) {
  const headers = ["#","Title","Category","Priority","Status","Retest","Tester","Date Run","Bug Link","Notes"];
  const rows = items.map((item, i) => [
    i + 1,
    `"${(item.title || "").replace(/"/g, '""')}"`,
    `"${item.category || ""}"`,
    item.priority || "",
    item.status || "",
    item.retest_status || "",
    `"${item.tester_name || ""}"`,
    item.date_run || "",
    `"${item.bug_link || ""}"`,
    `"${(item.notes || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
  ]);
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `qa-checklist-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminQAChecklist() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [quickFilter, setQuickFilter] = useState(null); // "critical_failures" | "ready_for_retest"

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      if (u.role !== "admin") { setLoading(false); return; }
      const all = await base44.entities.QAChecklistItem.list("sort_order", 200);
      setItems(all.filter(i => i.is_active !== false));
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  const filtered = useMemo(() => {
    return items.filter(item => {
      if (quickFilter === "critical_failures") return item.priority === "Critical" && item.status === "Fail";
      if (quickFilter === "ready_for_retest") return item.retest_status === "Pending" || item.status === "Retest Needed";
      if (filterStatus !== "all" && item.status !== filterStatus) return false;
      if (filterPriority !== "all" && item.priority !== filterPriority) return false;
      if (filterCategory !== "all" && item.category !== filterCategory) return false;
      return true;
    });
  }, [items, filterStatus, filterPriority, filterCategory, quickFilter]);

  const stats = useMemo(() => ({
    total: items.length,
    pass: items.filter(i => i.status === "Pass").length,
    fail: items.filter(i => i.status === "Fail").length,
    blocked: items.filter(i => i.status === "Blocked").length,
    retest: items.filter(i => i.status === "Retest Needed").length,
    not_started: items.filter(i => i.status === "Not Started").length,
    critical_failures: items.filter(i => i.priority === "Critical" && i.status === "Fail").length,
    all_critical_passed: items.filter(i => i.priority === "Critical").every(i => i.status === "Pass"),
  }), [items]);

  function clearFilters() {
    setFilterStatus("all");
    setFilterPriority("all");
    setFilterCategory("all");
    setQuickFilter(null);
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
    </div>
  );

  if (user?.role !== "admin") return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-10 pb-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Link to={createPageUrl("AdminDashboard")} className="inline-flex items-center gap-1 text-sm mb-5 opacity-60 hover:opacity-100 transition-opacity" style={{ color: NAVY }}>
            <ChevronLeft className="w-4 h-4" /> Admin Dashboard
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Release QA Checklist</h1>
              <p className="text-sm text-gray-500 mt-1">Internal UAT tracker for the commercial transaction layer.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => loadData()} className="flex items-center gap-1.5 text-xs px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
              <button onClick={() => exportCSV(filtered)} className="flex items-center gap-1.5 text-xs px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-gray-700", bg: "bg-white" },
            { label: "Not Started", value: stats.not_started, color: "text-gray-500", bg: "bg-white" },
            { label: "Pass", value: stats.pass, color: "text-green-700", bg: "bg-green-50" },
            { label: "Fail", value: stats.fail, color: "text-red-700", bg: "bg-red-50" },
            { label: "Blocked", value: stats.blocked, color: "text-orange-700", bg: "bg-orange-50" },
            { label: "Retest", value: stats.retest, color: "text-yellow-700", bg: "bg-yellow-50" },
            {
              label: stats.all_critical_passed ? "✓ All Critical Passed" : `${stats.critical_failures} Critical Fail${stats.critical_failures !== 1 ? "s" : ""}`,
              value: null,
              color: stats.all_critical_passed ? "text-green-700" : "text-red-700",
              bg: stats.all_critical_passed ? "bg-green-50" : "bg-red-50",
            },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} border border-gray-100 rounded-xl px-4 py-3 text-center`}>
              {s.value !== null && <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>}
              <p className={`text-xs font-medium ${s.color} ${s.value !== null ? "mt-0.5" : "text-sm font-semibold"}`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />

          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setQuickFilter(null); }}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
            <option value="all">All Statuses</option>
            {["Not Started","Pass","Fail","Blocked","Retest Needed"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select value={filterPriority} onChange={e => { setFilterPriority(e.target.value); setQuickFilter(null); }}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
            <option value="all">All Priorities</option>
            {["Critical","High","Medium","Low"].map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setQuickFilter(null); }}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <div className="flex gap-2 ml-auto flex-wrap">
            <button
              onClick={() => setQuickFilter(quickFilter === "critical_failures" ? null : "critical_failures")}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${quickFilter === "critical_failures" ? "bg-red-600 text-white border-red-600" : "border-red-200 text-red-600 hover:bg-red-50"}`}>
              Critical Failures
            </button>
            <button
              onClick={() => setQuickFilter(quickFilter === "ready_for_retest" ? null : "ready_for_retest")}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${quickFilter === "ready_for_retest" ? "bg-yellow-500 text-white border-yellow-500" : "border-yellow-300 text-yellow-700 hover:bg-yellow-50"}`}>
              Ready for Retest
            </button>
            {(filterStatus !== "all" || filterPriority !== "all" || filterCategory !== "all" || quickFilter) && (
              <button onClick={clearFilters} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                Clear
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-400">{filtered.length} item{filtered.length !== 1 ? "s" : ""} shown</p>

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-8">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Scenario</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24 hidden sm:table-cell">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28 hidden md:table-cell">Retest</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24 hidden lg:table-cell">Tester</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24 hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((item, idx) => {
                const StatusIcon = STATUS_CONFIG[item.status]?.icon || Clock;
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="hover:bg-stone-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{item.sort_order ?? idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800 group-hover:text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5 hidden sm:block">{item.category}</div>
                      {item.bug_link && (
                        <a href={item.bug_link} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-xs text-indigo-500 hover:underline mt-0.5 inline-block">
                          Bug link ↗
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_COLOR[item.priority] || "bg-gray-100 text-gray-500"}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${STATUS_CONFIG[item.status]?.color || "bg-gray-100 text-gray-500"}`}>
                        <StatusIcon className="w-3 h-3" />
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs ${RETEST_CONFIG[item.retest_status] || "text-gray-400"}`}>
                        {item.retest_status || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500">{item.tester_name || "—"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-400">{item.date_run || "—"}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-sm text-gray-400">
                    No items match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedItem && (
        <QAItemDrawer
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSaved={() => { loadData(); setSelectedItem(null); }}
        />
      )}
    </div>
  );
}