import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Guitar, Search, ChevronDown, ChevronUp, X, ArrowRight, SlidersHorizontal } from "lucide-react";

const NAVY = "#1B2B4B";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const INSTRUMENT_TYPES = [
  { label: "Electric Guitar", value: "Electric Guitars" },
  { label: "Acoustic Guitar", value: "Acoustic Guitar" },
  { label: "Bass", value: "Electric Bass Guitar" },
  { label: "Acoustic Bass", value: "Acoustic Bass Guitar" },
  { label: "Other", value: "Other" },
];

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [builders, setBuilders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedBuilder, setSelectedBuilder] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [prods, bldrs] = await Promise.all([
      base44.entities.Product.filter({ status: "available" }, "-created_date", 200),
      base44.entities.UserProfile.filter({ is_seller: true, is_approved: true }, "-created_date", 200),
    ]);
    // Only show products from approved builders
    const approvedBuilderIds = new Set(bldrs.map(b => b.id));
    // Enforce limited visibility rule: only show listings with a builder-approved marketplace hero image
    const eligible = prods.filter(p =>
      approvedBuilderIds.has(p.builder_id) && (
        p.builder_approved_marketplace_hero === true ||
        p.hero_processing_status === "approved_by_builder" ||
        p.listing_visibility_state === "full_visibility"
      )
    );
    setProducts(eligible);
    setBuilders(bldrs);
    setLoading(false);
  }

  const builderOptions = [...new Set(products.map(p => p.builder_name).filter(Boolean))].sort();

  const filtered = products
    .filter(p => {
      const matchSearch = !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.builder_name?.toLowerCase().includes(search.toLowerCase());
      const matchType = selectedTypes.length === 0 ||
        selectedTypes.includes(p.specifications?.instrumentCategory);
      const matchMin = !minPrice || p.price >= Number(minPrice);
      const matchMax = !maxPrice || p.price <= Number(maxPrice);
      const matchBuilder = !selectedBuilder || p.builder_name === selectedBuilder;
      return matchSearch && matchType && matchMin && matchMax && matchBuilder;
    })
    .sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      return new Date(b.created_date) - new Date(a.created_date);
    });

  function toggleType(val) {
    setSelectedTypes(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  }

  const hasActiveFilters = selectedTypes.length > 0 || minPrice || maxPrice || selectedBuilder;
  const activeFilterCount = [selectedTypes.length > 0, !!minPrice || !!maxPrice, !!selectedBuilder].filter(Boolean).length;

  function clearFilters() {
    setSelectedTypes([]);
    setMinPrice("");
    setMaxPrice("");
    setSelectedBuilder("");
  }

  const count = filtered.length;
  const countLabel = `${count} ${count === 1 ? "instrument" : "instruments"} available from independent builders`;

  return (
    <div style={{ backgroundColor: "#FFFFFF", minHeight: "100vh" }}>

      {/* Page Header */}
      <div style={{ background: "linear-gradient(180deg, #F4F7FB 0%, #FFFFFF 100%)" }} className="pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2 tracking-tight" style={{ color: "#1A1A1A" }}>Handcrafted Instruments</h1>
          <p className="text-sm" style={{ color: "#7A7A7A" }}>Handcrafted instruments, ready to play — from independent builders around the world.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search + Sort + Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9A9A9A" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search instruments or builders..."
              className="w-full pl-9 pr-9 py-3 text-sm focus:outline-none border"
              style={{ borderColor: "#E5E8EC", backgroundColor: "#FFFFFF", color: "#1A1A1A" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-stone-400 hover:text-stone-700" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative flex-shrink-0">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="appearance-none border pl-3 pr-8 py-3 text-sm focus:outline-none"
              style={{ borderColor: "#E5E8EC", backgroundColor: "#FFFFFF", color: "#1A1A1A" }}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "#9A9A9A" }} />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors flex-shrink-0"
            style={{
              backgroundColor: showFilters || hasActiveFilters ? NAVY : "#FFFFFF",
              color: showFilters || hasActiveFilters ? "#FFFFFF" : NAVY,
              border: `1px solid ${NAVY}`,
            }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span
                className="ml-0.5 text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1.5"
                style={{
                  backgroundColor: showFilters || hasActiveFilters ? "#FFFFFF" : NAVY,
                  color: showFilters || hasActiveFilters ? NAVY : "#FFFFFF",
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="border mb-6" style={{ borderColor: "#E5E8EC", backgroundColor: "#FFFFFF", boxShadow: "0 8px 24px rgba(27,43,75,0.12)" }}>
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: "#E5E8EC" }}>
              <span className="text-sm font-bold" style={{ color: NAVY }}>Filter Results</span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold flex items-center gap-1 transition-colors"
                  style={{ color: "#7A7A7A" }}
                  onMouseEnter={e => { e.currentTarget.style.color = NAVY; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#7A7A7A"; }}
                >
                  <X className="w-3.5 h-3.5" /> Clear all
                </button>
              )}
            </div>
            <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Instrument Type */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wide mb-3" style={{ color: "#6B6B6B" }}>Instrument Type</h4>
                <div className="flex flex-col gap-2">
                  {INSTRUMENT_TYPES.map(t => (
                    <label key={t.value} className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: selectedTypes.includes(t.value) ? NAVY : "#4A4A4A" }}>
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(t.value)}
                        onChange={() => toggleType(t.value)}
                        className="w-4 h-4 accent-slate-700"
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wide mb-3" style={{ color: "#6B6B6B" }}>Price Range</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    placeholder="Min"
                    className="w-full border px-3 py-2 text-sm focus:outline-none"
                    style={{ borderColor: "#E5E8EC" }}
                  />
                  <span className="text-stone-400 text-sm">–</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    className="w-full border px-3 py-2 text-sm focus:outline-none"
                    style={{ borderColor: "#E5E8EC" }}
                  />
                </div>
              </div>

              {/* Builder */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wide mb-3" style={{ color: "#6B6B6B" }}>Builder</h4>
                <div className="relative">
                  <select
                    value={selectedBuilder}
                    onChange={e => setSelectedBuilder(e.target.value)}
                    className="appearance-none w-full border pl-3 pr-8 py-2 text-sm focus:outline-none"
                    style={{ borderColor: "#E5E8EC", backgroundColor: "#FFFFFF", color: "#4A4A4A" }}
                  >
                    <option value="">All Builders</option>
                    {builderOptions.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "#9A9A9A" }} />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Future sections can be inserted here (Recently Added, Featured, Ready to Ship) */}

        {/* Instrument Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-white">
                <div className="mb-3" style={{ aspectRatio: "4/3", backgroundColor: "#EBEBEB" }} />
                <div className="h-3 rounded w-3/4 mb-2" style={{ backgroundColor: "#EBEBEB" }} />
                <div className="h-3 rounded w-1/2" style={{ backgroundColor: "#EBEBEB" }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Guitar className="w-12 h-12 mx-auto mb-4" style={{ color: "#CCCCCC" }} />
            <h3 className="text-base font-bold mb-1" style={{ color: "#3D3D3D" }}>No instruments found</h3>
            <p className="text-sm" style={{ color: "#9A9A9A" }}>Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map(product => <InstrumentCard key={product.id} product={product} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function InstrumentCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const specs = product.specifications || {};

  const specParts = [
    specs.instrumentCategory === "Other" ? specs.otherInstrumentCategory : specs.instrumentCategory,
    specs.topWood === "Other" ? specs.otherTopWood : specs.topWood,
    specs.scaleLength ? `${specs.scaleLength}"` : null,
  ].filter(Boolean);

  const specLine = specParts.join(" • ");

  return (
    <Link
      to={createPageUrl("ProductDetail?id=" + product.id)}
      className="group block no-underline transition-all duration-200"
      style={{
        backgroundColor: "#FFFFFF",
        boxShadow: hovered ? "0 8px 24px rgba(27,43,75,0.12)" : "0 1px 3px rgba(27,43,75,0.06)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/5", backgroundColor: "#EBEBEB" }}>
        {(product.processed_hero_image_url || product.image_urls?.[0]) ? (
          <img
            src={product.processed_hero_image_url || product.image_urls[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Guitar className="w-10 h-10" style={{ color: "#CCCCCC" }} />
          </div>
        )}
        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-end justify-center pb-3 transition-opacity duration-200"
          style={{
            opacity: hovered ? 1 : 0,
            background: "linear-gradient(to top, rgba(27,43,75,0.6) 0%, transparent 60%)"
          }}
        >
          <span className="text-white text-xs font-semibold flex items-center gap-1">
            View Instrument <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="pt-3 pb-4 px-0.5">
        {/* Name + Price */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-sm leading-snug" style={{ color: "#1A1A1A" }}>{product.name}</h3>
          <span className="font-bold text-sm flex-shrink-0" style={{ color: NAVY }}>${product.price?.toLocaleString()}</span>
        </div>

        {/* Specs */}
        {specLine && (
          <p className="text-xs mb-1.5" style={{ color: "#8A8A8A" }}>{specLine}</p>
        )}

        {/* Builder attribution */}
        {product.builder_name && (
          <p
            className="text-xs font-medium"
            style={{ color: "#5A6A7A" }}
            onClick={e => { e.preventDefault(); e.stopPropagation(); window.location.href = createPageUrl("BuilderProfile?id=" + product.builder_id); }}
          >
            by <span className="underline hover:opacity-70 cursor-pointer">{product.builder_name}</span>
          </p>
        )}
      </div>
    </Link>
  );
}