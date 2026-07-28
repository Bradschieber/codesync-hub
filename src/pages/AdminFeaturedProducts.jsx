import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ShieldCheck, Star, ChevronLeft, Search } from "lucide-react";

const NAVY = "#1B2B4B";

export default function AdminFeaturedProducts() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [builders, setBuilders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      if (u.role !== "admin") { setLoading(false); return; }

      const [allProducts, approvedBuilders] = await Promise.all([
        base44.entities.Product.filter({ status: "available" }, "-created_date", 500),
        base44.entities.UserProfile.filter({ is_seller: true, is_approved: true }, "-created_date", 200),
      ]);

      const builderMap = {};
      approvedBuilders.forEach(b => { builderMap[b.id] = b; });

      const eligible = allProducts.filter(p => builderMap[p.builder_id]);
      setProducts(eligible);
      setBuilders(approvedBuilders);
    } catch {
      base44.auth.redirectToLogin();
    }
    setLoading(false);
  }

  async function toggleFeatured(product) {
    setTogglingId(product.id);
    try {
      await base44.entities.Product.update(product.id, { is_featured: !product.is_featured });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_featured: !p.is_featured } : p));
    } catch (err) {
      console.error("Failed to toggle featured:", err);
    }
    setTogglingId(null);
  }

  const featuredCount = products.filter(p => p.is_featured).length;

  const filtered = products.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.builder_name?.toLowerCase().includes(q)
    );
  });

  // Sort: featured first, then most recent
  const sorted = [...filtered].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return new Date(b.created_date) - new Date(a.created_date);
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
    </div>
  );

  if (user?.role !== "admin") return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <ShieldCheck className="w-12 h-12 mx-auto mb-4" style={{ color: "#CCCCCC" }} />
      <h2 className="text-xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Admin Access Required</h2>
      <p style={{ color: "#7A7A7A" }}>You don't have permission to view this page.</p>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-12 pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link to={createPageUrl("AdminDashboard")} className="inline-flex items-center gap-1 text-sm mb-4 opacity-60 hover:opacity-100 transition-opacity" style={{ color: NAVY }}>
            <ChevronLeft className="w-4 h-4" /> Admin Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-6 h-6" style={{ color: NAVY }} strokeWidth={1.5} />
            <h1 className="text-3xl font-bold" style={{ color: "#1A1A1A" }}>Featured Products</h1>
          </div>
          <p className="text-sm" style={{ color: "#5A5A5A" }}>
            Curate which instruments appear on the homepage and other discovery surfaces. {featuredCount} currently featured.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9A9A9A" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by instrument or builder name..."
            className="w-full pl-9 pr-4 py-2.5 border text-sm focus:outline-none bg-white"
            style={{ borderColor: "#DEDBD6" }}
          />
        </div>

        {/* Product list */}
        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: "#9A9A9A" }}>
              {search ? "No products match your search." : "No eligible products yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(product => {
              const img = product.processed_hero_image_url || product.image_urls?.[0];
              return (
                <div
                  key={product.id}
                  className="bg-white border flex flex-col sm:flex-row sm:items-center gap-4 p-4"
                  style={{ borderColor: product.is_featured ? NAVY : "#E0DDD8", borderWidth: product.is_featured ? 2 : 1 }}
                >
                  {/* Image */}
                  <div className="w-20 h-16 flex-shrink-0 overflow-hidden" style={{ backgroundColor: "#F0EDE8" }}>
                    {img ? (
                      <img src={img} alt={product.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Star className="w-6 h-6" style={{ color: "#C8C4BC" }} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-sm" style={{ color: "#1A1A1A" }}>{product.name}</h3>
                      {product.is_featured && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>
                          <Star className="w-3 h-3" /> Featured
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold" style={{ color: NAVY }}>${product.price?.toLocaleString()}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#7A7A7A" }}>by {product.builder_name}</p>
                  </div>

                  {/* Toggle */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => toggleFeatured(product)}
                      disabled={togglingId === product.id}
                      className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 border transition-colors disabled:opacity-40"
                      style={{
                        borderColor: product.is_featured ? NAVY : "#DEDBD6",
                        color: product.is_featured ? "#FFFFFF" : NAVY,
                        backgroundColor: product.is_featured ? NAVY : "#FFFFFF",
                      }}
                    >
                      <Star className="w-3.5 h-3.5" style={{ fill: product.is_featured ? "#FFFFFF" : "none" }} />
                      {togglingId === product.id ? "..." : product.is_featured ? "Featured" : "Feature"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}