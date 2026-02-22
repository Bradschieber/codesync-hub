import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Guitar, Search, SlidersHorizontal, Star, X, ChevronDown } from "lucide-react";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">Guitar Catalog</h1>
        <p className="text-stone-500">Browse {products.length} handcrafted instruments</p>
      </div>

      {/* Search + Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search guitars, builders..."
            className="w-full pl-9 pr-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50">
          <SlidersHorizontal className="w-4 h-4" />
          Filters {selectedCats.length > 0 && <span className="bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{selectedCats.length}</span>}
        </button>
        <select value={sort} onChange={e => setSort(e.target.value)} className="border border-stone-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-stone-700 mb-3 text-sm">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => toggleCat(cat)} className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${selectedCats.includes(cat) ? "bg-amber-600 text-white border-amber-600" : "border-stone-300 text-stone-600 hover:border-amber-400"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-stone-700 mb-3 text-sm">Max Price</h4>
              <input
                type="number"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full border border-stone-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
          {(selectedCats.length > 0 || maxPrice) && (
            <button onClick={() => { setSelectedCats([]); setMaxPrice(""); }} className="mt-4 text-xs text-red-500 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
              <div className="h-52 bg-stone-200" />
              <div className="p-4 space-y-2"><div className="h-4 bg-stone-200 rounded w-3/4" /><div className="h-4 bg-stone-200 rounded w-1/2" /></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Guitar className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-600 mb-2">No guitars found</h3>
          <p className="text-stone-400">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <Link to={createPageUrl(`ProductDetail?id=${product.id}`)} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-stone-200">
      <div className="h-52 bg-stone-100 overflow-hidden relative">
        {product.image_urls?.[0] ? (
          <img src={product.image_urls[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Guitar className="w-16 h-16 text-stone-300" /></div>
        )}
        {product.is_featured && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">Featured</span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-stone-400 mb-1">{product.builder_name}</p>
        <h3 className="font-semibold text-stone-800 text-sm leading-tight mb-2 line-clamp-2">{product.name}</h3>
        {product.categories?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.categories.slice(0, 2).map(c => (
              <span key={c} className="bg-stone-100 text-stone-500 text-xs px-2 py-0.5 rounded-full">{c}</span>
            ))}
          </div>
        )}
        {product.average_rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs text-stone-500">{product.average_rating?.toFixed(1)}</span>
          </div>
        )}
        <p className="text-amber-700 font-bold text-lg">${product.price?.toLocaleString()}</p>
      </div>
    </Link>
  );
}