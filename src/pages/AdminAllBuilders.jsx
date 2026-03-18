import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, ShieldCheck, MapPin, CheckCircle, XCircle, ArrowLeft, Trash2 } from "lucide-react";

const NAVY = "#2F3E55";

export default function AdminAllBuilders() {
  const [user, setUser] = useState(null);
  const [builders, setBuilders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      if (u.role !== "admin") { setLoading(false); return; }
      const data = await base44.entities.UserProfile.filter({ is_seller: true }, "-created_date", 200);
      setBuilders(data);
    } catch {
      base44.auth.redirectToLogin();
    }
    setLoading(false);
  }

  async function deleteBuilder(builder) {
    setUpdating(builder.id);
    try {
      await base44.functions.invoke("deleteBuilderAccount", { builder_id: builder.id });
      setBuilders(prev => prev.filter(b => b.id !== builder.id));
    } catch (e) {
      alert("Failed to delete builder: " + e.message);
    }
    setUpdating(null);
    setConfirmDelete(null);
  }

  async function toggleApproval(builder) {
    setUpdating(builder.id);
    await base44.entities.UserProfile.update(builder.id, { is_approved: !builder.is_approved });
    setBuilders(prev => prev.map(b => b.id === builder.id ? { ...b, is_approved: !b.is_approved } : b));
    setUpdating(null);
  }

  const filtered = builders.filter(b => {
    const matchSearch = !search ||
      b.business_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.location?.toLowerCase().includes(search.toLowerCase()) ||
      b.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "approved" && b.is_approved) ||
      (filter === "pending" && !b.is_approved) ||
      (filter === "verified" && b.is_verified) ||
      (filter === "founding" && b.founding_builder);
    return matchSearch && matchFilter;
  });

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
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>All Builders</h1>
          <p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>{builders.length} total builders on the platform</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9A9A9A" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, or location..."
              className="w-full pl-9 pr-4 py-2.5 border text-sm focus:outline-none bg-white"
              style={{ borderColor: "#DEDBD6" }}
            />
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border px-4 py-2.5 text-sm bg-white focus:outline-none"
            style={{ borderColor: "#DEDBD6" }}
          >
            <option value="all">All Builders</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Approval</option>
            <option value="verified">Verified</option>
            <option value="founding">Founding Builders</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border" style={{ borderColor: "#E0DDD8" }}>
          <div className="grid grid-cols-12 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wide" style={{ borderColor: "#E0DDD8", color: "#7A7A7A", backgroundColor: "#F5F3F0" }}>
            <div className="col-span-4">Builder</div>
            <div className="col-span-3">Location</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3 text-right">Approval</div>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-sm" style={{ color: "#9A9A9A" }}>No builders found.</div>
          ) : (
            filtered.map(b => (
              <div key={b.id} className="grid grid-cols-12 px-4 py-4 border-b items-center" style={{ borderColor: "#F0EDE8" }}>
                <div className="col-span-4">
                  <Link to={createPageUrl("BuilderProfile?id=" + b.id)} className="font-semibold text-sm hover:underline" style={{ color: "#1A1A1A" }}>
                    {b.business_name || b.display_name}
                  </Link>
                  <p className="text-xs mt-0.5" style={{ color: "#9A9A9A" }}>{b.email}</p>
                </div>
                <div className="col-span-3 text-sm flex items-center gap-1" style={{ color: "#5A5A5A" }}>
                  {b.location && <><MapPin className="w-3 h-3 flex-shrink-0" />{b.location}</>}
                </div>
                <div className="col-span-2">
                  <div className="flex flex-col gap-1">
                    {b.is_verified && <span className="text-xs font-semibold px-2 py-0.5 inline-block" style={{ backgroundColor: "#E8F5E9", color: "#27AE60" }}>Verified</span>}
                    {b.founding_builder && <span className="text-xs font-semibold px-2 py-0.5 inline-block" style={{ backgroundColor: "#FDF3E3", color: "#6B4C2A" }}>Founding</span>}
                  </div>
                </div>
                <div className="col-span-3 flex justify-end gap-2">
                  <button
                    onClick={() => toggleApproval(b)}
                    disabled={updating === b.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border transition-colors"
                    style={{
                      borderColor: b.is_approved ? "#27AE60" : "#C57A1F",
                      color: b.is_approved ? "#27AE60" : "#C57A1F",
                      backgroundColor: b.is_approved ? "#E8F5E9" : "#FEF3E2",
                      opacity: updating === b.id ? 0.5 : 1,
                    }}
                  >
                    {b.is_approved ? <><CheckCircle className="w-3 h-3" /> Approved</> : <><XCircle className="w-3 h-3" /> Pending</>}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(b)}
                    disabled={updating === b.id}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                    style={{ opacity: updating === b.id ? 0.5 : 1 }}
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <p className="text-xs mt-3" style={{ color: "#9A9A9A" }}>Showing {filtered.length} of {builders.length} builders</p>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-6 h-6 text-red-500 flex-shrink-0" />
              <h3 className="text-base font-bold" style={{ color: "#1A1A1A" }}>Delete Builder Account</h3>
            </div>
            <p className="text-sm mb-2" style={{ color: "#5A5A5A" }}>
              Are you sure you want to permanently delete <strong>{confirmDelete.business_name || confirmDelete.display_name}</strong>?
            </p>
            <p className="text-xs mb-6 p-3" style={{ backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
              This will also delete all their products, custom build listings, workshop posts, reviews, and references. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm font-medium border" style={{ borderColor: "#DEDBD6", color: "#4A4A4A" }}>
                Cancel
              </button>
              <button
                onClick={() => deleteBuilder(confirmDelete)}
                disabled={updating === confirmDelete.id}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {updating === confirmDelete.id ? "Deleting..." : "Delete Builder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}