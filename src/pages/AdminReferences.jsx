import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle, XCircle, Clock, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminReferences() {
  const [user, setUser] = useState(null);
  const [references, setReferences] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      if (u.role !== "admin") return;
      const refs = await base44.entities.BuilderReference.list("-created_date", 200);
      setReferences(refs);
      // Load builder profiles for display
      const builderIds = [...new Set(refs.map(r => r.builder_id).filter(Boolean))];
      const profileMap = {};
      await Promise.all(builderIds.map(async (id) => {
        const p = await base44.entities.UserProfile.filter({ id });
        if (p.length > 0) profileMap[id] = p[0];
      }));
      setProfiles(profileMap);
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  async function updateRefStatus(ref, status) {
    await base44.entities.BuilderReference.update(ref.id, { status });
    setReferences(prev => prev.map(r => r.id === ref.id ? { ...r, status } : r));

    // Check if builder now has 2 verified refs → auto-set is_verified
    const builderId = ref.builder_id;
    const updatedRefs = references.map(r => r.id === ref.id ? { ...r, status } : r);
    const verifiedCount = updatedRefs.filter(r => r.builder_id === builderId && r.status === "verified").length;
    const profile = profiles[builderId];
    if (profile) {
      const shouldBeVerified = verifiedCount >= 2;
      if (shouldBeVerified !== profile.is_verified) {
        await base44.entities.UserProfile.update(profile.id, { is_verified: shouldBeVerified });
        setProfiles(prev => ({ ...prev, [builderId]: { ...prev[builderId], is_verified: shouldBeVerified } }));
      }
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" /></div>;

  if (user?.role !== "admin") return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <p className="text-stone-500">Admin access required.</p>
    </div>
  );

  const filtered = references.filter(r => filter === "all" || r.status === filter);

  const counts = {
    pending: references.filter(r => r.status === "pending").length,
    verified: references.filter(r => r.status === "verified").length,
    rejected: references.filter(r => r.status === "rejected").length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("Dashboard")} className="text-stone-400 hover:text-amber-600"><ChevronLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-bold text-stone-800">Manage Builder References</h1>
        </div>
        <Link to={createPageUrl("AdminBuilderBadges")} className="text-xs font-semibold px-4 py-2 rounded-lg border transition-colors" style={{ borderColor: "#2F3E55", color: "#2F3E55" }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#2F3E55"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#2F3E55"; }}>
          Manage Badges →
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-stone-200 pb-0">
        {[
          { key: "pending", label: `Pending (${counts.pending})` },
          { key: "verified", label: `Verified (${counts.verified})` },
          { key: "rejected", label: `Rejected (${counts.rejected})` },
          { key: "all", label: "All" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${filter === key ? "border-amber-500 text-amber-700" : "border-transparent text-stone-500 hover:text-stone-700"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-stone-400 text-center py-16">No references in this category.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map(ref => {
            const builderProfile = profiles[ref.builder_id];
            return (
              <div key={ref.id} className="bg-white border border-stone-200 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-stone-800 text-sm">{ref.buyer_name}</span>
                      <span className="text-stone-400 text-xs">→</span>
                      <span className="text-amber-700 text-sm font-medium">{builderProfile?.business_name || ref.builder_name}</span>
                      {builderProfile?.is_verified && (
                        <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">✦ Verified Builder</span>
                      )}
                    </div>
                    <p className="text-stone-600 text-sm italic mb-3">"{ref.quote}"</p>
                    <div className="flex items-center gap-4 text-xs text-stone-400 flex-wrap">
                      {ref.contact_email && <span>✉ {ref.contact_email}</span>}
                      {ref.contact_phone && <span>📞 {ref.contact_phone}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {ref.status !== "verified" && (
                      <button
                        onClick={() => updateRefStatus(ref, "verified")}
                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Verify
                      </button>
                    )}
                    {ref.status !== "rejected" && (
                      <button
                        onClick={() => updateRefStatus(ref, "rejected")}
                        className="flex items-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium px-3 py-1.5 rounded-lg"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    )}
                    {ref.status !== "pending" && (
                      <button
                        onClick={() => updateRefStatus(ref, "pending")}
                        className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-medium px-3 py-1.5 rounded-lg"
                      >
                        <Clock className="w-3.5 h-3.5" /> Reset
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-stone-100">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${
                    ref.status === "verified" ? "bg-green-50 text-green-700 border-green-200" :
                    ref.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                    "bg-yellow-50 text-yellow-700 border-yellow-200"
                  }`}>
                    {ref.status === "verified" ? <CheckCircle className="w-3 h-3" /> : ref.status === "rejected" ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {ref.status.charAt(0).toUpperCase() + ref.status.slice(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}