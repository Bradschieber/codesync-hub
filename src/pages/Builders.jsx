import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Search, MapPin, ArrowRight, User, Guitar, X } from "lucide-react";
import BuildersMap from "../components/builders/BuildersMap";
import FeaturedBuilders from "../components/builders/FeaturedBuilders";

const NAVY = "#2F3E55";
const AMBER = "#C57A1F";

const INSTRUMENT_FILTERS = [
  { label: "Electric Guitar", match: ["Electric Guitar"] },
  { label: "Bass", match: ["Electric Bass", "Acoustic Electric Bass"] },
  { label: "Acoustic Guitar", match: ["Acoustic Guitar"] },
  { label: "Other", match: ["Other"] },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PAGE_SIZE = 16;

export default function Builders() {
  const [builders, setBuilders] = useState([]);
  const [shuffled, setShuffled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [instrumentFilter, setInstrumentFilter] = useState(null);
  const [customBuildsOnly, setCustomBuildsOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => { loadBuilders(); }, []);

  async function loadBuilders() {
    const data = await base44.entities.UserProfile.filter({ is_seller: true, is_approved: true }, "-created_date", 200);
    setBuilders(data);
    setShuffled(shuffle(data));
    setLoading(false);
  }

  const filtered = useMemo(() => {
    return shuffled.filter(b => {
      const instrumentTypes = (b.instrument_types_built || []).map(i =>
        i.type === "Other" && i.other_description ? i.other_description : i.type
      );
      const rawTypes = (b.instrument_types_built || []).map(i => i.type);

      // Search
      if (search) {
        const q = search.toLowerCase();
        const matchesSearch =
          b.business_name?.toLowerCase().includes(q) ||
          b.display_name?.toLowerCase().includes(q) ||
          b.location?.toLowerCase().includes(q) ||
          instrumentTypes.some(t => t.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      // Instrument filter
      if (instrumentFilter) {
        const filterMatches = INSTRUMENT_FILTERS.find(f => f.label === instrumentFilter);
        if (filterMatches && !rawTypes.some(t => filterMatches.match.includes(t))) return false;
      }

      // Custom builds filter
      if (customBuildsOnly && !b.offers_custom_builds) return false;

      return true;
    });
  }, [shuffled, search, instrumentFilter, customBuildsOnly]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function clearFilters() {
    setSearch("");
    setInstrumentFilter(null);
    setCustomBuildsOnly(false);
  }

  const hasActiveFilters = search || instrumentFilter || customBuildsOnly;

  return (
    <div style={{ backgroundColor: "#F7F6F3", minHeight: "100vh" }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ background: "linear-gradient(180deg, #F2F0EA 0%, #F7F6F3 100%)" }} className="pt-14 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight" style={{ color: "#1A1A1A" }}>Meet our Builders</h1>
          <p className="text-base" style={{ color: "#5A5A5A" }}>Independent makers. Verified craft. Real stories.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── FEATURED BUILDERS ── */}
        <FeaturedBuilders builders={builders} />

        {/* ── MAP ── */}
        <BuildersMap builders={builders} />

        {/* ── SEARCH ── */}
        <div className="max-w-md mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9A9A9A" }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE); }}
              placeholder="Search builders by name, location, or instrument type"
              className="w-full pl-9 pr-4 py-3 border text-sm focus:outline-none"
              style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF", color: "#1A1A1A" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── FILTERS ── */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {INSTRUMENT_FILTERS.map(f => (
            <button
              key={f.label}
              onClick={() => { setInstrumentFilter(instrumentFilter === f.label ? null : f.label); setVisibleCount(PAGE_SIZE); }}
              className="text-xs font-medium px-3 py-1.5 border transition-colors"
              style={{
                borderColor: instrumentFilter === f.label ? NAVY : "#DEDBD6",
                backgroundColor: instrumentFilter === f.label ? NAVY : "#FFFFFF",
                color: instrumentFilter === f.label ? "#FFFFFF" : "#3D3D3D",
              }}
            >
              {f.label}
            </button>
          ))}

          <button
            onClick={() => { setCustomBuildsOnly(!customBuildsOnly); setVisibleCount(PAGE_SIZE); }}
            className="text-xs font-medium px-3 py-1.5 border transition-colors"
            style={{
              borderColor: customBuildsOnly ? AMBER : "#DEDBD6",
              backgroundColor: customBuildsOnly ? AMBER : "#FFFFFF",
              color: customBuildsOnly ? "#FFFFFF" : "#3D3D3D",
            }}
          >
            ✦ Accepting Custom Builds
          </button>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs underline transition-opacity hover:opacity-60" style={{ color: "#7A7A7A" }}>
              Clear all
            </button>
          )}
        </div>

        {/* ── BUILDER GALLERY GRID ── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse border overflow-hidden" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
                <div className="aspect-square" style={{ backgroundColor: "#EBEBEB" }} />
                <div className="p-3 space-y-2">
                  <div className="h-3.5 rounded w-3/4" style={{ backgroundColor: "#EBEBEB" }} />
                  <div className="h-3 rounded w-1/2" style={{ backgroundColor: "#EBEBEB" }} />
                  <div className="h-3 rounded w-2/3" style={{ backgroundColor: "#EBEBEB" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Guitar className="w-12 h-12 mx-auto mb-4" style={{ color: "#CCCCCC" }} />
            <h3 className="text-base font-bold mb-1" style={{ color: "#3D3D3D" }}>No builders found</h3>
            <p className="text-sm mb-4" style={{ color: "#9A9A9A" }}>Try a different search term or clear the filters.</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm font-semibold underline" style={{ color: NAVY }}>Clear filters</button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {visible.map(builder => <BuilderCard key={builder.id} builder={builder} />)}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                  className="inline-block font-semibold px-8 py-3 text-sm border transition-colors"
                  style={{ borderColor: NAVY, color: NAVY, backgroundColor: "transparent" }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = NAVY; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = NAVY; }}
                >
                  Load More Builders ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            )}

            <p className="text-xs text-center mt-4" style={{ color: "#BBBBBB" }}>
              Showing {visible.length} of {filtered.length} builders
            </p>
          </>
        )}

        {/* ── BUYER CTA ── */}
        <section className="mt-20 py-14 px-8 sm:px-14 text-center" style={{ backgroundColor: "#F2F0EA" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#7A7A7A" }}>Looking for something specific?</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight" style={{ color: NAVY }}>
            Commission your dream instrument.
          </h2>
          <p className="text-sm leading-relaxed max-w-xl mx-auto mb-8" style={{ color: "#4A4A4A" }}>
            Many of our builders take custom orders. Browse their profiles, explore past work, and reach out directly to start a conversation about your build.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={createPageUrl("CustomBuilds")}
              className="inline-block font-semibold px-8 py-4 text-sm tracking-wide text-white transition-colors"
              style={{ backgroundColor: AMBER }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#a8661a"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = AMBER}
            >
              Explore Custom Builds
            </Link>
            <Link
              to={createPageUrl("Catalog")}
              className="inline-flex items-center gap-1.5 font-semibold text-sm transition-opacity hover:opacity-70"
              style={{ color: NAVY }}
            >
              Browse in-stock instruments <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}

function BuilderCard({ builder }) {
  const [hovered, setHovered] = useState(false);

  const instrumentTypes = (builder.instrument_types_built || []).map(i =>
    i.type === "Other" && i.other_description ? i.other_description : i.type
  );

  // Image priority: banner > first media > avatar
  const heroImage = builder.banner_image_url || builder.media_urls?.[0] || builder.avatar_url || null;

  return (
    <Link
      to={createPageUrl("BuilderProfile?id=" + builder.id)}
      className="group block border overflow-hidden transition-all duration-300 no-underline"
      style={{
        borderColor: hovered ? NAVY : "#E0DDD8",
        backgroundColor: "#FFFFFF",
        boxShadow: hovered ? "0 6px 24px rgba(27,43,75,0.1)" : "none",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-stone-100" style={{ aspectRatio: "1/1" }}>
        {heroImage ? (
          <img
            src={heroImage}
            alt={builder.business_name || builder.display_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#EEF1F7" }}>
            <User className="w-8 h-8" style={{ color: "#CCCCCC" }} strokeWidth={1} />
          </div>
        )}
        {builder.is_verified && (
          <span className="absolute top-2 left-2 text-xs font-semibold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.92)", color: NAVY, fontSize: "10px" }}>
            ✓ Verified
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-bold text-sm leading-tight mb-0.5 truncate" style={{ color: "#1A1A1A" }}>
          {builder.business_name || builder.display_name}
        </h3>
        {builder.location && (
          <p className="text-xs flex items-center gap-0.5 mb-1.5" style={{ color: "#7A7A7A" }}>
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{builder.location}</span>
          </p>
        )}
        {instrumentTypes.length > 0 && (
          <p className="text-xs font-medium mb-1 truncate" style={{ color: "#4A5566" }}>
            {instrumentTypes.join(" • ")}
          </p>
        )}
        {builder.years_experience > 0 && (
          <p className="text-xs" style={{ color: "#9A9A9A" }}>{builder.years_experience} yrs experience</p>
        )}
      </div>
    </Link>
  );
}