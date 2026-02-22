import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ShoppingBag, Package, ChevronLeft, ExternalLink } from "lucide-react";
import { format } from "date-fns";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    try {
      const u = await base44.auth.me();
      const data = await base44.entities.Order.filter({ user_id: u.id }, "-created_date", 50);
      setOrders(data);
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  const statusColors = {
    pending: "bg-amber-100 text-amber-700",
    paid: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link to={createPageUrl("Account")} className="text-stone-400 hover:text-amber-600"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-stone-800">Order History</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-stone-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-600 mb-2">No orders yet</h3>
          <Link to={createPageUrl("Catalog")} className="text-amber-600 hover:underline">Browse guitars →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-stone-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-stone-400 mb-1">Order #{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-stone-500">{order.created_date ? format(new Date(order.created_date), "MMM d, yyyy") : ""}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[order.status] || "bg-stone-100 text-stone-600"}`}>
                    {order.status}
                  </span>
                  <p className="font-bold text-amber-700 mt-1">${order.total_amount?.toLocaleString()}</p>
                </div>
              </div>

              {order.items?.length > 0 && (
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      {item.product_image && <img src={item.product_image} className="w-10 h-10 rounded-lg object-cover" />}
                      <span className="text-stone-700">{item.product_name}</span>
                      <span className="text-stone-400 ml-auto">${item.product_price?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {order.tracking_number && (
                <p className="text-xs text-stone-400 mt-3 flex items-center gap-1">
                  <Package className="w-3 h-3" /> Tracking: {order.tracking_number}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}