import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Guitar, Eye, EyeOff, Pencil } from "lucide-react";

export default function DashboardActiveListings() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) {
        const prods = await base44.entities.Product.filter({ builder_id: profiles[0].id, status: "available" }, "-created_date", 100);
        setProducts(prods);
      }
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  async function toggleAvailability(product) {
    const updated = await base44.entities.Product.update(product.id, {
      status: product.status === "available" ? "sold" : "available",
      is_available: product.status !== "available"
    });
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, ...updated } : p).filter(p => p.status === "available"));
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Link to={createPageUrl("Dashboard")} className="text-stone-400 hover:text-amber-600"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-stone-800">Active Listings</h1>
      </div>
      <p className="text-stone-500 mb-6 ml-8">{products.length} active listing{products.length !== 1 ? "s" : ""}</p>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Guitar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 mb-4">No active listings.</p>
          <Link to={createPageUrl("DashboardProducts")} className="bg-amber-600 hover:bg-amber-500 text-white font-medium px-5 py-2.5 rounded-xl text-sm">
            Manage Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-2xl border border-stone-200 p-4 flex gap-4 items-center">
              <div className="w-16 h-16 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0">
                {product.image_urls?.[0] ? (
                  <img src={product.image_urls[0]} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Guitar className="w-6 h-6 text-stone-300" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-stone-800 text-sm truncate">{product.name}</h3>
                <p className="text-amber-700 font-bold text-sm">${product.price?.toLocaleString()}</p>
                {product.categories?.length > 0 && (
                  <p className="text-xs text-stone-400">{product.categories.join(", ")}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleAvailability(product)} title="Mark as sold" className="p-2 text-stone-400 hover:text-amber-600 rounded-lg">
                  <EyeOff className="w-4 h-4" />
                </button>
                <Link to={createPageUrl("DashboardProducts")} className="p-2 text-stone-400 hover:text-blue-600 rounded-lg">
                  <Pencil className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}