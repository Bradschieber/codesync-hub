import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Search, Guitar, X, ChevronDown, User, MapPin, ArrowRight } from "lucide-react";
import FeaturedBuilders from "../components/builders/FeaturedBuilders";
import BuilderCard from "../components/builders/BuilderCard";
import BuildersMap from "../components/builders/BuildersMap";

const NAVY = "#1B2B4B";
const AMBER = "#C57A1F";
const PAGE_SIZE = 16;

const INSTRUMENT_OPTIONS = [
  { label: "Instrument Type", value: "" },
  { label: "Electric Guitar", value: "Electric Guitar" },
  { label: "Acoustic Guitar", value: "Acoustic Guitar" },
  { label: "Electric Bass", value: "Electric Bass" },
  { label: "Acoustic Electric Bass", value: "Acoustic Electric Bass" },
  { label: "Other", value: "Other" },
];

const EXPERIENCE_OPTIONS = [
  { label: "Experience", value: "" },
  { label: "1–5 years", value: "1-5" },
  { label: "6–10 years", value: "6-10" },
  { label: "11–20 years", value: "11-20" },
  { label: "20+ years", value: "20+" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function matchesExperience(years, range) {
  if (!range) return true;
  if (!years) return false;
  if (range === "1-5") return years >= 1 && years <= 5;
  if (range === "6-10") return years >= 6 && years <= 10;
  if (range === "11-20") return years >= 11 && years <= 20;
  if (range === "20+") return years > 20;
  return true;
}

export default function Builders() {
  const [builders, setBuilders] = useState([]);
  const [shuffled, setShuffled] = useState([]);
  const [builderListings, setBuilderListings] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [instrumentFilter, setInstrumentFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [customBuildsOnly, setCustomBuildsOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    loadBuilders();
    const onFocus = () => loadBuilders();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  async function loadBuilders() {
    let data, products;
    try {
      [data, products] = await Promise.all([
        base44.entities.UserProfile.filter({ is_seller: true, is_approved: true }, "-created_date", 200),
        base44.entities.Product.filter({ status: "available" }, "-created_date", 500),
      ]);
    } catch (e) {
      setLoading(false);
      return;
    }

    // Build listings map: up to 3 products per builder with image + price for card thumbnails
    const approvedBuilderIds = new Set(data.map(b => b.id));
    const listingsMap = {};
    // Prefer featured products first, then most recent
    const sortedProducts = [...products].sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return new Date(b.created_date) - new Date(a.created_date);
    });
    sortedProducts.forEach(p => {
      if (!approvedBuilderIds.has(p.builder_id)) return;
      const img = p.processed_hero_image_url || p.image_urls?.[0] || null;
      if (!img) return;
      if (!listingsMap[p.builder_id]) listingsMap[p.builder_id] = [];
      if (listingsMap[p.builder_id].length < 3) {
        listingsMap[p.builder_id].push({ image: img, price: p.price, name: p.name });
      }
    });

    setBuilderListings(listingsMap);
    setBuilders(data);
    setShuffled(shuffle(data));
    setLoading(false);
  }

  const locations = useMemo(() => {
    const locs = new Set();
    builders.forEach(b => { if (b.location) locs.add(b.location); });
    return Array.from(locs).sort();
  }, [builders]);

  const filtered = useMemo(() => {
    return shuffled.filter(b => {
      const rawTypes = (b.instrument_types_built || []).map(i => i.type);
      const instrumentLabels = (b.instrument_types_built || []).map(i =>
        i.type === "Other" && i.other_description ? i.other_description : i.type
      );

      if (search) {
        const q = search.toLowerCase();
        const matches =
          b.business_name?.toLowerCase().includes(q) ||
          b.display_name?.toLowerCase().includes(q) ||
          b.location?.toLowerCase().includes(q) ||
          instrumentLabels.some(t => t.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (instrumentFilter && !rawTypes.includes(instrumentFilter)) return false;
      if (locationFilter && b.location !== locationFilter) return false;
      if (experienceFilter && !matchesExperience(b.years_experience, experienceFilter)) return false;
      if (customBuildsOnly && !b.offers_custom_builds) return false;

      return true;
    });
  }, [shuffled, search, instrumentFilter, locationFilter, experienceFilter, customBuildsOnly]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const hasActiveFilters = search || instrumentFilter || locationFilter || experienceFilter || customBuildsOnly;

  function clearFilters() {
    setSearch("");
    setInstrumentFilter("");
    setLocationFilter("");
    setExperienceFilter("");
    setCustomBuildsOnly(false);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div style={{ backgroundColor: "#FFFFFF", minHeight: "100vh" }}>

      {/* HERO */}
      <div style={{ background: "linear-gradient(180deg, #F4F7FB 0%, #FFFFFF 100%)" }} className="pt-14 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight" style={{ color: "#1A1A1A" }}>Meet Our Builders</h1>
          <p className="text-base" style={{ color: "#5A5A5A" }}>Independent makers. Verified craft. Real stories.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* SEARCH + FILTERS */}
        <div className="mb-10">
          <div className="relative max-w-lg mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9A9A9A" }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE); }}
              placeholder="Search builders by name, location, or instrument type"
              className="w-full pl-9 pr-10 py-3 border text-sm focus:outline-none"
              style={{ borderColor: "#E5E8EC", backgroundColor: "#FFFFFF", color: "#1A1A1A" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-stone-400 hover:text-stone-700" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect
              value={instrumentFilter}
              onChange={v => { setInstrumentFilter(v); setVisibleCount(PAGE_SIZE); }}
              options={INSTRUMENT_OPTIONS}
              active={!!instrumentFilter}
            />
            <FilterSelect
              value={locationFilter}
              onChange={v => { setLocationFilter(v); setVisibleCount(PAGE_SIZE); }}
              options={[{ label: "Location", value: "" }, ...locations.map(l => ({ label: l, value: l }))]}
              active={!!locationFilter}
            />
            <FilterSelect
              value={experienceFilter}
              onChange={v => { setExperienceFilter(v); setVisibleCount(PAGE_SIZE); }}
              options={EXPERIENCE_OPTIONS}
              active={!!experienceFilter}
            />
            <label className="flex items-center gap-2 cursor-pointer text-sm select-none" style={{ color: customBuildsOnly ? NAVY : "#4A4A4A" }}>
              <input
                type="checkbox"
                checked={customBuildsOnly}
                onChange={e => { setCustomBuildsOnly(e.target.checked); setVisibleCount(PAGE_SIZE); }}
                className="w-4 h-4 accent-slate-700"
              />
              Accepting Custom Builds
            </label>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs underline hover:opacity-60 transition-opacity" style={{ color: "#7A7A7A" }}>
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* FEATURED BUILDERS */}
        <FeaturedBuilders builders={builders} builderListings={builderListings} />

        {/* MAP */}
        <BuildersMap builders={builders} />

        {/* ALL BUILDERS */}
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>All Builders</h2>
          {!loading && (
            <span className="text-sm" style={{ color: "#9A9A9A" }}>
              Showing {visible.length} of {filtered.length} builders
            </span>
          )}
        </div>

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
            <p className="text-sm mb-4" style={{ color: "#9A9A9A" }}>Try a different search or clear the filters.</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm font-semibold underline" style={{ color: NAVY }}>Clear filters</button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {visible.map(builder => (
                <BuilderCard
                   key={builder.id}
                   builder={builder}
                   listings={builderListings[builder.id] || []}
                 />
              ))}
            </div>
            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                  className="font-semibold px-8 py-3 text-sm border transition-colors"
                  style={{ borderColor: NAVY, color: NAVY, backgroundColor: "transparent" }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = NAVY; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = NAVY; }}
                >
                  Load More ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <section className="mt-20 py-14 px-8 sm:px-14 text-center" style={{ backgroundColor: "#F4F7FB" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#7A7A7A" }}>Looking for something specific?</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight" style={{ color: NAVY }}>Commission your dream instrument.</h2>
          <p className="text-sm leading-relaxed max-w-xl mx-auto mb-8" style={{ color: "#4A4A4A" }}>
            Many of our builders take custom orders. Browse their profiles, explore past work, and reach out directly to start a conversation about your build.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={createPageUrl("CustomBuilds")}
              className="inline-block font-semibold px-8 py-4 text-sm tracking-wide text-white transition-colors"
              style={{ backgroundColor: NAVY }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
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

function FilterSelect({ value, onChange, options, active }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 text-sm border focus:outline-none cursor-pointer transition-colors"
        style={{
          borderColor: active ? NAVY : "#E5E8EC",
          backgroundColor: active ? NAVY : "#FFFFFF",
          color: active ? "#FFFFFF" : "#4A4A4A",
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: active ? "#FFFFFF" : "#9A9A9A" }} />
    </div>
  );
}