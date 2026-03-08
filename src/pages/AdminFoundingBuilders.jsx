import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, ShieldCheck, MapPin, ArrowLeft, Award } from "lucide-react";

const NAVY = "#2F3E55";

export default function AdminFoundingBuilders() {
  const [user, setUser] = useState(null);
  const [builders, setBuilders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      if (u.role !== "admin") { setLoading(false); return; }
      const data = await base44.entities.UserProfile.filter({ is_seller: true, founding_builder: true }, "-created_date", 200);
      setBuilders(data);
    } catch {
      base44.auth.redirectToLogin();
    }
    setLoading(false);
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
      <div style={{ background: "linear-gradient(180deg, #FDF3E3 0%, #FAF9F7 100%)" }} className="pt-14 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl("AdminDashboard")} className="inline-flex items-center gap-1.5 text-sm mb-4 hover:opacity-70" style={{ color: NAVY }}>
            <ArrowLeft className="w-4 h-4" /> Admin Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6" style={{ color: "#6B4C2A" }} />
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>Founding Builders</h1>
          </div>
          <p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>{builders.length} founding builder{builders.length !== 1 ? "s" : ""} on the platform</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9A9A9A" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search builders..."
            className="w-full pl-9 pr-4 py-2.5 border text-sm focus:outline-none bg-white"
            style={{ borderColor: "#DEDBD6" }}
          />
        </div>

        <div className="bg-white border" style={{ borderColor: "#E0DDD8" }}>
          <div className="grid grid-cols-12 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wide" style={{ borderColor: "#E0DDD8", color: "#7A7A7A", backgroundColor: "#F5F3F0" }}>
            <div className="col-span-5">Builder</div>
            <div className="col-span-4">Location</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-sm" style={{ color: "#9A9A9A" }}>No founding builders found.</div>
          ) : (
            filtered.map(b => (
              <div key={b.id} className="grid grid-cols-12 px-4 py-4 border-b items-center" style={{ borderColor: "#F0EDE8" }}>
                <div className="col-span-5">
                  <p className="font-semibold text-sm" style={{ color: "#1A1A1A" }}>{b.business_name || b.display_name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#9A9A9A" }}>{b.email}</p>
                  <span className="text-xs font-semibold px-2 py-0.5 mt-1 inline-block" style={{ backgroundColor: "#FDF3E3", color: "#6B4C2A" }}>★ Founding Builder</span>
                </div>
                <div className="col-span-4 text-sm flex items-center gap-1" style={{ color: "#5A5A5A" }}>
                  {b.location && <><MapPin className="w-3 h-3 flex-shrink-0" />{b.location}</>}
                </div>
                <div className="col-span-3 flex justify-end gap-2">
                  <Link to={createPageUrl("BuilderProfile?id=" + b.id)} className="text-xs font-semibold px-3 py-1.5 border" style={{ borderColor: NAVY, color: NAVY }}>View Profile</Link>
                  <Link to={createPageUrl("AdminBuilderBadges")} className="text-xs font-semibold px-3 py-1.5 border" style={{ borderColor: "#E0DDD8", color: "#5A5A5A" }}>Manage Badges</Link>
                </div>
              </div>
            ))
          )}
        </div>
        <p className="text-xs mt-3" style={{ color: "#9A9A9A" }}>Showing {filtered.length} of {builders.length} founding builders</p>
      </div>
    </div>
  );
}