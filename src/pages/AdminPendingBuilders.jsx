import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, ShieldCheck, MapPin, CheckCircle, ArrowLeft, Clock } from "lucide-react";

const NAVY = "#2F3E55";

export default function AdminPendingBuilders() {
  const [user, setUser] = useState(null);
  const [builders, setBuilders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      if (u.role !== "admin") { setLoading(false); return; }
      const data = await base44.entities.UserProfile.filter({ is_seller: true }, "-created_date", 200);
      setBuilders(data.filter(b => !b.is_approved));
    } catch {
      base44.auth.redirectToLogin();
    }
    setLoading(false);
  }

  async function approveBuilder(builder) {
    setUpdating(builder.id);
    await base44.entities.UserProfile.update(builder.id, { is_approved: true });
    setBuilders(prev => prev.filter(b => b.id !== builder.id));
    setUpdating(null);
  }

  const filtered = builders.filter(b =>
    !search ||
    b.business_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.location?.toLowerCase().includes(search.toLowerCase()) ||
    b.email?.toLowerCase().includes(search.toLowerCase())
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
      <div style={{ background: "linear-gradient(180deg, #FEF3E2 0%, #FAF9F7 100%)" }} className="pt-14 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl("AdminDashboard")} className="inline-flex items-center gap-1.5 text-sm mb-4 hover:opacity-70" style={{ color: NAVY }}>
            <ArrowLeft className="w-4 h-4" /> Admin Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6" style={{ color: "#C57A1F" }} />
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>Pending Builder Approvals</h1>
          </div>
          <p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>
            {builders.length} builder{builders.length !== 1 ? "s" : ""} waiting for approval. Review their profile before approving their storefront.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9A9A9A" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or location..."
            className="w-full pl-9 pr-4 py-2.5 border text-sm focus:outline-none bg-white"
            style={{ borderColor: "#DEDBD6" }}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24 bg-white border" style={{ borderColor: "#E0DDD8" }}>
            <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "#27AE60" }} strokeWidth={1.5} />
            <h3 className="font-bold text-base mb-1" style={{ color: "#1A1A1A" }}>All caught up!</h3>
            <p className="text-sm" style={{ color: "#9A9A9A" }}>No builders are pending approval.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(b => (
              <div key={b.id} className="bg-white border p-6" style={{ borderColor: "#E0DDD8", borderLeftWidth: 4, borderLeftColor: "#C57A1F" }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {b.avatar_url ? (
                        <img src={b.avatar_url} className="w-12 h-12 object-cover flex-shrink-0" style={{ borderRadius: 2 }} />
                      ) : (
                        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: "#EEF1F7" }}>
                          <span className="text-lg font-bold" style={{ color: NAVY }}>{(b.business_name || b.display_name || "?")[0].toUpperCase()}</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-base" style={{ color: "#1A1A1A" }}>{b.business_name || b.display_name}</h3>
                        <p className="text-xs mt-0.5" style={{ color: "#7A7A7A" }}>{b.email}</p>
                        {b.location && (
                          <p className="text-xs flex items-center gap-1 mt-1" style={{ color: "#9A9A9A" }}>
                            <MapPin className="w-3 h-3" />{b.location}
                          </p>
                        )}
                        {b.bio && <p className="text-sm mt-2 leading-relaxed line-clamp-2" style={{ color: "#5A5A5A" }}>{b.bio}</p>}
                        <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: "#9A9A9A" }}>
                          {b.years_experience > 0 && <span>{b.years_experience} yrs experience</span>}
                          {b.specialties?.length > 0 && <span>{b.specialties.join(", ")}</span>}
                        </div>
                        <p className="text-xs mt-1" style={{ color: "#BBBBBB" }}>
                          Applied {new Date(b.created_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Link
                      to={createPageUrl("BuilderProfile?id=" + b.id)}
                      className="text-xs font-semibold px-4 py-2 border transition-colors"
                      style={{ borderColor: NAVY, color: NAVY }}
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={() => approveBuilder(b)}
                      disabled={updating === b.id}
                      className="flex items-center gap-1.5 text-xs font-semibold px-5 py-2 text-white transition-colors"
                      style={{ backgroundColor: updating === b.id ? "#AAAAAA" : "#27AE60" }}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {updating === b.id ? "Approving..." : "Approve"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}