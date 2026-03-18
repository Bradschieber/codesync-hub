import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, ShieldCheck, ArrowLeft, Trash2, UserX, UserCheck, AlertTriangle } from "lucide-react";

const NAVY = "#2F3E55";

export default function AdminUserAccounts() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [builderUserIds, setBuilderUserIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      if (u.role !== "admin") { setLoading(false); return; }
      const [allUsers, builders] = await Promise.all([
        base44.entities.User.list("-created_date", 500),
        base44.entities.UserProfile.filter({ is_seller: true }, "-created_date", 500),
      ]);
      const builderIds = new Set(builders.map(b => b.user_id).filter(Boolean));
      setBuilderUserIds(builderIds);
      // Filter to non-builder, non-admin users
      setUsers(allUsers.filter(u => !builderIds.has(u.id) && u.role !== "admin"));
    } catch {
      base44.auth.redirectToLogin();
    }
    setLoading(false);
  }

  async function toggleActive(u) {
    setUpdating(u.id);
    try {
      await base44.functions.invoke("manageUserAccount", { action: "toggle", user_id: u.id, is_active: !u.is_active });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: !u.is_active } : x));
    } catch (e) {
      alert("Failed to update account: " + e.message);
    }
    setUpdating(null);
  }

  async function deleteUser(u) {
    setUpdating(u.id);
    try {
      await base44.functions.invoke("manageUserAccount", { action: "delete", user_id: u.id });
      setUsers(prev => prev.filter(x => x.id !== u.id));
    } catch (e) {
      alert("Failed to delete account: " + e.message);
    }
    setUpdating(null);
    setConfirmDelete(null);
  }

  const filtered = users.filter(u =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>Buyer Accounts</h1>
          <p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>{users.length} registered buyer accounts</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9A9A9A" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2.5 border text-sm focus:outline-none bg-white"
              style={{ borderColor: "#DEDBD6" }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border" style={{ borderColor: "#E0DDD8" }}>
          <div className="grid grid-cols-12 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wide" style={{ borderColor: "#E0DDD8", color: "#7A7A7A", backgroundColor: "#F5F3F0" }}>
            <div className="col-span-4">User</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-sm" style={{ color: "#9A9A9A" }}>No buyer accounts found.</div>
          ) : (
            filtered.map(u => (
              <div key={u.id} className="grid grid-cols-12 px-4 py-4 border-b items-center" style={{ borderColor: "#F0EDE8" }}>
                <div className="col-span-4">
                  <p className="font-semibold text-sm" style={{ color: "#1A1A1A" }}>{u.full_name || "—"}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#9A9A9A" }}>
                    Joined {u.created_date ? new Date(u.created_date).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div className="col-span-3 text-sm truncate" style={{ color: "#5A5A5A" }}>{u.email}</div>
                <div className="col-span-2">
                  <span className="text-xs font-semibold px-2 py-0.5 inline-block"
                    style={{
                      backgroundColor: u.is_active === false ? "#FEF2F2" : "#E8F5E9",
                      color: u.is_active === false ? "#DC2626" : "#27AE60"
                    }}>
                    {u.is_active === false ? "Deactivated" : "Active"}
                  </span>
                </div>
                <div className="col-span-3 flex justify-end gap-2">
                  <button
                    onClick={() => toggleActive(u)}
                    disabled={updating === u.id}
                    title={u.is_active === false ? "Activate Account" : "Deactivate Account"}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border transition-colors"
                    style={{
                      borderColor: u.is_active === false ? "#27AE60" : "#C57A1F",
                      color: u.is_active === false ? "#27AE60" : "#C57A1F",
                      backgroundColor: u.is_active === false ? "#E8F5E9" : "#FEF3E2",
                      opacity: updating === u.id ? 0.5 : 1,
                    }}
                  >
                    {u.is_active === false ? <><UserCheck className="w-3 h-3" /> Activate</> : <><UserX className="w-3 h-3" /> Deactivate</>}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(u)}
                    disabled={updating === u.id}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-600 bg-red-50 transition-colors hover:bg-red-100"
                    style={{ opacity: updating === u.id ? 0.5 : 1 }}
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <p className="text-xs mt-3" style={{ color: "#9A9A9A" }}>Showing {filtered.length} of {users.length} buyers</p>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <h3 className="text-base font-bold" style={{ color: "#1A1A1A" }}>Delete Buyer Account</h3>
            </div>
            <p className="text-sm mb-6" style={{ color: "#5A5A5A" }}>
              Are you sure you want to permanently delete the account for <strong>{confirmDelete.full_name || confirmDelete.email}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm font-medium border"
                style={{ borderColor: "#DEDBD6", color: "#4A4A4A" }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteUser(confirmDelete)}
                disabled={updating === confirmDelete.id}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {updating === confirmDelete.id ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}