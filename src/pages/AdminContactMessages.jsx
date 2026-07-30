import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ShieldCheck, ArrowLeft, Mail, X, Trash2, Inbox, RefreshCw } from "lucide-react";

const NAVY = "#2F3E55";

const STATUS_STYLES = {
  new: { bg: "#F9E5E8", color: "#7A1526", border: "#E08894" },
  read: { bg: "#EEF1F7", color: NAVY, border: "#C7D0DE" },
  responded: { bg: "#E8F5E9", color: "#27AE60", border: "#A5D6A7" },
  archived: { bg: "#F5F5F5", color: "#9A9A9A", border: "#E0E0E0" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.new;
  return (
    <span className="text-xs px-2 py-0.5 font-semibold capitalize" style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  );
}

export default function AdminContactMessages() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const u = await base44.auth.me();
      setUser(u);
      if (u.role !== "admin") { setLoading(false); return; }
      const data = await base44.entities.ContactMessage.filter({}, "-created_date", 500);
      setMessages(data);
    } catch {
      base44.auth.redirectToLogin();
    }
    setLoading(false);
  }

  async function markStatus(msg, status) {
    setUpdating(msg.id);
    try {
      await base44.entities.ContactMessage.update(msg.id, { status });
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status } : m));
      setSelected(prev => prev?.id === msg.id ? { ...prev, status } : prev);
    } catch (e) {
      alert("Failed to update: " + (e.message || "unknown error"));
    }
    setUpdating(null);
  }

  async function deleteMessage(msg) {
    setUpdating(msg.id);
    try {
      await base44.entities.ContactMessage.delete(msg.id);
      setMessages(prev => prev.filter(m => m.id !== msg.id));
      setSelected(null);
    } catch (e) {
      alert("Failed to delete: " + (e.message || "unknown error"));
    }
    setUpdating(null);
  }

  const filtered = messages.filter(m => filter === "all" || m.status === filter);
  const newCount = messages.filter(m => m.status === "new").length;

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
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-14 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl("AdminDashboard")} className="inline-flex items-center gap-1.5 text-sm mb-4 hover:opacity-70" style={{ color: NAVY }}>
            <ArrowLeft className="w-4 h-4" /> Admin Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-7 h-7" style={{ color: NAVY }} strokeWidth={1.5} />
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>Contact Messages</h1>
          </div>
          <p className="text-sm" style={{ color: "#5A5A5A" }}>
            {messages.length} total messages{newCount > 0 && <span className="font-semibold" style={{ color: "#7A1526" }}> · {newCount} new</span>}
          </p>

          <div className="flex items-center gap-2 mt-5">
            {["all", "new", "read", "responded", "archived"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-1.5 text-xs font-semibold border capitalize transition-all"
                style={{
                  borderColor: filter === f ? NAVY : "#E0DDD8",
                  backgroundColor: filter === f ? NAVY : "#FFFFFF",
                  color: filter === f ? "#FFFFFF" : "#5A5A5A",
                }}
              >
                {f}
              </button>
            ))}
            <button onClick={loadData} className="ml-auto p-1.5 hover:opacity-70" title="Refresh">
              <RefreshCw className="w-4 h-4" style={{ color: "#5A5A5A" }} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filtered.length === 0 ? (
          <div className="bg-white border py-20 text-center" style={{ borderColor: "#E0DDD8" }}>
            <Inbox className="w-10 h-10 mx-auto mb-3" style={{ color: "#CCCCCC" }} />
            <p className="text-sm" style={{ color: "#9A9A9A" }}>No {filter === "all" ? "" : filter} messages.</p>
          </div>
        ) : (
          <div className="bg-white border" style={{ borderColor: "#E0DDD8" }}>
            <div className="grid grid-cols-12 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wide" style={{ borderColor: "#E0DDD8", color: "#7A7A7A", backgroundColor: "#F5F3F0" }}>
              <div className="col-span-4">From</div>
              <div className="col-span-5">Subject</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Date</div>
            </div>
            {filtered.map(m => (
              <button
                key={m.id}
                onClick={() => { setSelected(m); if (m.status === "new") markStatus(m, "read"); }}
                className="grid grid-cols-12 px-4 py-3.5 border-b items-center w-full text-left hover:bg-stone-50 transition-colors"
                style={{ borderColor: "#F0EDE8" }}
              >
                <div className="col-span-4">
                  <p className="font-semibold text-sm truncate" style={{ color: "#1A1A1A" }}>{m.name}</p>
                  <p className="text-xs truncate" style={{ color: "#9A9A9A" }}>{m.email}</p>
                </div>
                <div className="col-span-5 text-sm truncate" style={{ color: "#4A4A4A" }}>{m.subject}</div>
                <div className="col-span-2"><StatusBadge status={m.status} /></div>
                <div className="col-span-1 text-xs text-right" style={{ color: "#B8B4AF" }}>
                  {new Date(m.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setSelected(null)}>
          <div className="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between p-6 border-b" style={{ borderColor: "#E0DDD8" }}>
              <div className="min-w-0 pr-4">
                <h3 className="text-lg font-bold mb-1" style={{ color: "#1A1A1A" }}>{selected.subject}</h3>
                <p className="text-sm" style={{ color: "#5A5A5A" }}>From <span className="font-semibold" style={{ color: "#1A1A1A" }}>{selected.name}</span></p>
                <a href={`mailto:${selected.email}`} className="text-sm hover:underline" style={{ color: NAVY }}>{selected.email}</a>
                <p className="text-xs mt-1" style={{ color: "#B8B4AF" }}>{new Date(selected.created_date).toLocaleString()}</p>
                <div className="mt-2"><StatusBadge status={selected.status} /></div>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 hover:opacity-70 flex-shrink-0">
                <X className="w-5 h-5" style={{ color: "#5A5A5A" }} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#1A1A1A" }}>{selected.message}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-t" style={{ borderColor: "#E0DDD8", backgroundColor: "#FAF9F7" }}>
              <a
                href={`mailto:${selected.email}?subject=RE: ${encodeURIComponent(selected.subject)}`}
                className="px-4 py-2 text-xs font-semibold text-white"
                style={{ backgroundColor: NAVY }}
              >
                Reply via Email
              </a>
              <button
                onClick={() => markStatus(selected, "responded")}
                disabled={updating === selected.id}
                className="px-4 py-2 text-xs font-semibold border"
                style={{ borderColor: "#27AE60", color: "#27AE60", backgroundColor: "#E8F5E9", opacity: updating === selected.id ? 0.5 : 1 }}
              >
                Mark Responded
              </button>
              <button
                onClick={() => markStatus(selected, "archived")}
                disabled={updating === selected.id}
                className="px-4 py-2 text-xs font-semibold border"
                style={{ borderColor: "#DEDBD6", color: "#5A5A5A", backgroundColor: "#FFFFFF", opacity: updating === selected.id ? 0.5 : 1 }}
              >
                Archive
              </button>
              <button
                onClick={() => deleteMessage(selected)}
                disabled={updating === selected.id}
                className="ml-auto flex items-center gap-1 px-4 py-2 text-xs font-semibold border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                style={{ opacity: updating === selected.id ? 0.5 : 1 }}
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}