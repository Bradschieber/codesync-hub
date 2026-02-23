import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Search, Star, MapPin, Award, Guitar, Ribbon } from "lucide-react";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-stone-800 mb-3">Our Builders</h1>
        <p className="text-stone-500 text-lg max-w-xl mx-auto">
          Independent luthiers and craftspeople dedicated to creating extraordinary instruments.
        </p>
      </div>

      <div className="max-w-md mx-auto mb-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search builders, specialties, location..."
            className="w-full pl-9 pr-4 py-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse border border-stone-200">
              <div className="flex gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-stone-200" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-200 rounded w-1/2" />
                </div>
              </div>
              <div className="h-12 bg-stone-100 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Guitar className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-600">No builders found</h3>
          <p className="text-stone-400 mt-1">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(builder => (
            <BuilderCard key={builder.id} builder={builder} />
          ))}
        </div>
      )}
    </div>
  );
}

function BuilderCard({ builder }) {
  return (
    <Link to={createPageUrl(`BuilderProfile?id=${builder.id}`)} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-stone-200">
      <div className="h-28 bg-gradient-to-r from-stone-800 to-amber-900 relative">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600')] bg-cover bg-center" />
        {builder.is_featured && (
          <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
            <Award className="w-3 h-3" /> Featured
          </span>
        )}
      </div>
      <div className="px-5 pb-5">
        <div className="flex items-end gap-3 -mt-8 mb-4">
          {builder.avatar_url ? (
            <img src={builder.avatar_url} className="w-16 h-16 rounded-full object-cover border-4 border-white shadow" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-amber-100 border-4 border-white shadow flex items-center justify-center">
              <span className="text-amber-700 font-bold text-2xl">{(builder.business_name || builder.display_name || "B")[0]}</span>
            </div>
          )}
          <div className="pb-1">
            <h3 className="font-bold text-stone-800 leading-tight">{builder.business_name || builder.display_name}</h3>
            {builder.location && (
              <p className="text-xs text-stone-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {builder.location}
              </p>
            )}
          </div>
        </div>

        {builder.bio && <p className="text-stone-500 text-sm leading-relaxed mb-3 line-clamp-2">{builder.bio}</p>}

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {builder.specialties?.slice(0, 2).map(s => (
              <span key={s} className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full border border-amber-200">{s}</span>
            ))}
          </div>
          {builder.average_rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-sm font-medium text-stone-600">{builder.average_rating?.toFixed(1)}</span>
              <span className="text-xs text-stone-400">({builder.review_count})</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          {builder.years_experience > 0 && (
            <p className="text-xs text-stone-400">{builder.years_experience} years of experience</p>
          )}
          {builder.is_verified && (
            <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.19 8.62L2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2z"/></svg>
              Verified
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}