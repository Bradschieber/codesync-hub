import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Guitar, Search, SlidersHorizontal, Star, X } from "lucide-react";

const NAVY = "#2F3E55";
const AMBER = "#C57A1F";
const CATEGORIES = ["Electric", "Acoustic", "Bass", "Classical", "Semi-Hollow", "12-String", "Archtop", "Other"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCats, setSelectedCats] = useState([]);
  const [sort, setSort] = useState("newest");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    const data = await base44.entities.Product.filter({ status: "available" }, "-created_date", 100);
    setProducts(data);
    setLoading(false);
  }

  const filtered = products
    .filter(p => {
      const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.builder_name?.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCats.length === 0 || selectedCats.some(c => p.categories?.includes(c));
      const matchPrice = !maxPrice || p.price <= Number(maxPrice);
      return matchSearch && matchCat && matchPrice;
    })
    .sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "rating") return (b.average_rating || 0) - (a.average_rating || 0);
      return new Date(b.created_date) - new Date(a.created_date);
    });

  function toggleCat(cat) {
    setSelectedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  }

  return (
    <div style={{ backgroundColor: "#F7F6F3", minHeight: "100vh" }}>
      {/* Page Header */}
      <div style={{ background: "linear-gradient(180deg, #F2F0EA 0%, #F7F6F3 100%)" }} className="pt-14 pb-10 px-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2 tracking-tight" style={{ color: "#1A1A1A" }}>Instruments</h1>
          <p className="text-base" style={{ color: "#5A5A5A" }}>{products.length} instruments available from independent builders</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9A9A9A" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search instruments or builders..."
              className="w-full pl-9 pr-4 py-3 text-sm focus:outline-none border"
              style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF", color: "#1A1A1A" }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium border transition-colors"
            style={{
              borderColor: showFilters ? NAVY : "#DEDBD6",
              color: showFilters ? NAVY : "#3D3D3D",
              backgroundColor: "#FFFFFF"
            }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {selectedCats.length > 0 && `(${selectedCats.length})`}
          </button>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="border px-4 py-3 text-sm focus:outline-none"
            style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF", color: "#1A1A1A" }}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border p-6 mb-6" style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF" }}>
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-sm mb-3 uppercase tracking-wide" style={{ color: "#6B6B6B" }}>Category</h4>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => toggleCat(cat)}
                      className="px-3 py-1.5 text-sm border transition-colors"
                      style={{
                        borderColor: selectedCats.includes(cat) ? NAVY : "#E3E0D8",
                        backgroundColor: selectedCats.includes(cat) ? NAVY : "#FFFFFF",
                        color: selectedCats.includes(cat) ? "#FFFFFF" : "#3D3D3D"
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-3 uppercase tracking-wide" style={{ color: "#6B6B6B" }}>Max Price</h4>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full border px-4 py-2 text-sm focus:outline-none"
                  style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF" }}
                />
              </div>
            </div>
            {(selectedCats.length > 0 || maxPrice) && (
              <button
                onClick={() => { setSelectedCats([]); setMaxPrice(""); }}
                className="mt-5 text-xs flex items-center gap-1 font-semibold"
                style={{ color: "#6A6A6A" }}
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-3" style={{ height: 220, backgroundColor: "#EBEBEB" }} />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  const specs = product.specifications || {};
  const specLine = [specs.topWood, specs.scaleLength ? `${specs.scaleLength}"` : null].filter(Boolean).join(" · ");

  return (
    <Link
      to={createPageUrl("ProductDetail?id=" + product.id)}
      className="group block"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="overflow-hidden mb-3" style={{ aspectRatio: "4/3", backgroundColor: "#EBEBEB" }}>
        {product.image_urls?.[0] ? (
          <img
            src={product.image_urls[0]}
            alt={product.name}
            className="w-full h-full object-cover"
            style={{ transition: "transform 0.4s ease" }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Guitar className="w-12 h-12" style={{ color: "#CCCCCC" }} />
          </div>
        )}
      </div>
      <div className="pt-1">
        <p style={{ fontFamily: "'DM Sans', 'Inter', sans-serif", fontSize: "0.68rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8A7F75", marginBottom: "3px" }}>{product.builder_name}</p>
        <h3 style={{ fontFamily: "'DM Sans', 'Inter', sans-serif", fontSize: "0.925rem", fontWeight: 500, color: "#1e2a3a", lineHeight: 1.35, marginBottom: "4px" }}>{product.name}</h3>
        {specLine && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", fontWeight: 400, color: "#8A8A8A", marginBottom: "6px" }}>{specLine}</p>}
        {product.average_rating > 0 && (
          <div className="flex items-center gap-1 mb-1">
            <Star className="w-3 h-3 fill-current" style={{ color: "#D4AC0D" }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "#7A7A7A" }}>{product.average_rating.toFixed(1)}</span>
          </div>
        )}
        <p style={{ fontFamily: "'DM Sans', 'Inter', sans-serif", fontSize: "0.95rem", fontWeight: 600, color: "#C57A1F", marginTop: "6px" }}>${product.price?.toLocaleString()}</p>
      </div>
    </Link>
  );
}