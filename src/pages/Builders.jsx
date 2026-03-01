import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Search, Star, MapPin, Guitar, ArrowRight, User } from "lucide-react";

const NAVY = "#1B2B4B";

export default function Builders() {
  const [builders, setBuilders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { loadBuilders(); }, []);

  async function loadBuilders() {
    const data = await base44.entities.UserProfile.filter({ is_seller: true }, "-created_date", 100);
    setBuilders(data);
    setLoading(false);
  }

  const filtered = builders.filter(b =>
    !search ||
    b.business_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.location?.toLowerCase().includes(search.toLowerCase()) ||
    b.specialties?.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>
      {/* Page Header */}
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2 tracking-tight" style={{ color: "#1A1A1A" }}>The Builders</h1>
          <p className="text-base" style={{ color: "#5A5A5A" }}>Independent makers. Verified craft.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="max-w-md mb-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9A9A9A" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, location, specialty..."
              className="w-full pl-9 pr-4 py-3 border text-sm focus:outline-none"
              style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF", color: "#1A1A1A" }}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse p-6 border" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
                <div className="flex gap-4 mb-4">
                  <div className="w-16 h-16 rounded" style={{ backgroundColor: "#EBEBEB" }} />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 rounded w-3/4" style={{ backgroundColor: "#EBEBEB" }} />
                    <div className="h-3 rounded w-1/2" style={{ backgroundColor: "#EBEBEB" }} />
                  </div>
                </div>
                <div className="h-12 rounded" style={{ backgroundColor: "#F5F5F5" }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Guitar className="w-12 h-12 mx-auto mb-4" style={{ color: "#CCCCCC" }} />
            <h3 className="text-base font-bold mb-1" style={{ color: "#3D3D3D" }}>No builders found</h3>
            <p className="text-sm" style={{ color: "#9A9A9A" }}>Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(builder => <BuilderCard key={builder.id} builder={builder} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function BuilderCard({ builder }) {
  return (
    <Link
      to={createPageUrl("BuilderProfile?id=" + builder.id)}
      className="group flex gap-5 items-start p-6 border transition-all"
      style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = NAVY}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#E0DDD8"}
    >
      {builder.avatar_url ? (
        <img
          src={builder.avatar_url}
          alt={builder.business_name || builder.display_name}
          className="w-16 h-16 object-cover flex-shrink-0"
          style={{ borderRadius: 2 }}
        />
      ) : (
        <div className="w-16 h-16 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EEF1F7", borderRadius: 2 }}>
          <User className="w-7 h-7" style={{ color: NAVY }} strokeWidth={1.5} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-sm mb-1 truncate" style={{ color: "#1A1A1A" }}>{builder.business_name || builder.display_name}</h3>
        {builder.location && (
          <p className="text-xs flex items-center gap-1 mb-2" style={{ color: "#7A7A7A" }}>
            <MapPin className="w-3 h-3 flex-shrink-0" />{builder.location}
          </p>
        )}
        {builder.average_rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3 h-3 fill-current" style={{ color: "#D4AC0D" }} />
            <span className="text-xs" style={{ color: "#7A7A7A" }}>{builder.average_rating.toFixed(1)} ({builder.review_count})</span>
          </div>
        )}
        {builder.bio && (
          <p className="text-xs leading-relaxed line-clamp-2 mb-2" style={{ color: "#5A5A5A" }}>{builder.bio}</p>
        )}
        {builder.years_experience > 0 && (
          <p className="text-xs" style={{ color: "#9A9A9A" }}>{builder.years_experience} years experience</p>
        )}
        <div className="mt-3 text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: NAVY }}>
          View instruments <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </Link>
  );
}