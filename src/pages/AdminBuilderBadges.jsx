import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, MapPin } from "lucide-react";
import BuilderBadges from "../components/builder/BuilderBadges";

export default function AdminBuilderBadges() {
  const [user, setUser] = useState(null);
  const [builders, setBuilders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      if (u.role !== "admin") { setLoading(false); return; }
      const all = await base44.entities.UserProfile.filter({ is_seller: true }, "-created_date", 200);
      setBuilders(all);
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  async function toggleBadge(builder, field) {
    setSaving(prev => ({ ...prev, [builder.id + field]: true }));
    const updated = { [field]: !builder[field] };
    await base44.entities.UserProfile.update(builder.id, updated);
    setBuilders(prev => prev.map(b => b.id === builder.id ? { ...b, ...updated } : b));
    setSaving(prev => { const n = { ...prev }; delete n[builder.id + field]; return n; });
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: "#2F3E55", borderTopColor: "transparent" }} />
    </div>
  );

  if (user?.role !== "admin") return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <p style={{ color: "#7A7A7A" }}>Admin access required.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8" style={{ minHeight: "100vh", backgroundColor: "#F7F6F3" }}>
      <div className="flex items-center gap-3 mb-8">
        <Link to={createPageUrl("Dashboard")} style={{ color: "#9A9A9A" }} className="hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>Builder Badges</h1>
          <p className="text-sm mt-0.5" style={{ color: "#7A7A7A" }}>Manage trust badges for verified and founding builders.</p>
        </div>
      </div>

      {builders.length === 0 ? (
        <p className="text-center py-16" style={{ color: "#9A9A9A" }}>No builder profiles found.</p>
      ) : (
        <div className="space-y-3">
          {builders.map(builder => (
            <div key={builder.id} className="bg-white rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4" style={{ borderColor: "#E3E0D8" }}>
              {/* Avatar + info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {builder.avatar_url ? (
                  <img src={builder.avatar_url} className="w-11 h-11 rounded-full object-cover flex-shrink-0 border" style={{ borderColor: "#E3E0D8" }} />
                ) : (
                  <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-base" style={{ backgroundColor: "#F2F0EA", color: "#2F3E55" }}>
                    {(builder.business_name || "B")[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: "#1A1A1A" }}>{builder.business_name || builder.display_name}</p>
                  {builder.location && (
                    <p className="flex items-center gap-1 text-xs" style={{ color: "#7A7A7A" }}>
                      <MapPin className="w-3 h-3" />{builder.location}
                    </p>
                  )}
                  <div className="mt-1.5">
                    <BuilderBadges builder={builder} size="sm" />
                  </div>
                </div>
              </div>

              {/* Badge toggles */}
              <div className="flex flex-wrap gap-3 flex-shrink-0">
                <BadgeToggle
                  label="Verified Builder"
                  active={!!builder.is_verified}
                  loading={!!saving[builder.id + "is_verified"]}
                  activeColor="#2F3E55"
                  onClick={() => toggleBadge(builder, "is_verified")}
                />
                <BadgeToggle
                  label="Founding Builder"
                  active={!!builder.founding_builder}
                  loading={!!saving[builder.id + "founding_builder"]}
                  activeColor="#6B4C2A"
                  onClick={() => toggleBadge(builder, "founding_builder")}
                />
                <BadgeToggle
                  label="Featured Builder"
                  active={!!builder.is_featured}
                  loading={!!saving[builder.id + "is_featured"]}
                  activeColor="#C57A1F"
                  onClick={() => toggleBadge(builder, "is_featured")}
                />
                <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border" style={{ borderColor: "#E3E0D8", color: "#9A9A9A", backgroundColor: "#FAFAF8" }}>
                  Custom Shop: {builder.offers_custom_builds ? <span style={{ color: "#4A4A4A", fontWeight: 600 }}>Auto ✓</span> : <span>Off</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BadgeToggle({ label, active, loading, activeColor, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded border transition-all"
      style={{
        borderColor: active ? activeColor : "#D8D4CC",
        backgroundColor: active ? activeColor : "#FFFFFF",
        color: active ? "#FFFFFF" : "#5A5A5A",
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? (
        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
      ) : (
        <span>{active ? "✓" : "○"}</span>
      )}
      {label}
    </button>
  );
}