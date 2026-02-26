import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ShoppingBag, ChevronLeft, Package } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function BuilderOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    try {
      const u = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        // Fetch all orders and filter those containing this builder's products
        const allOrders = await base44.entities.Order.list("-created_date", 200);
        const builderName = profiles[0].business_name || profiles[0].display_name;
        const builderOrders = allOrders.filter(order =>
          order.items?.some(item => item.builder_name === builderName)
        );
        setOrders(builderOrders);
      }
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link to={createPageUrl("Account")} className="text-stone-400 hover:text-amber-600"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-stone-800">Incoming Orders</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-stone-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-600 mb-2">No orders yet</h3>
          <p className="text-stone-400 text-sm">Orders from customers will appear here once they purchase your listings.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            // Only show items belonging to this builder
            const builderName = profile?.business_name || profile?.display_name;
            const myItems = order.items?.filter(item => item.builder_name === builderName) || [];
            const myTotal = myItems.reduce((sum, item) => sum + (item.product_price || 0) * (item.quantity || 1), 0);

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-stone-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-stone-400 mb-1">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-stone-500">{order.created_date ? format(new Date(order.created_date), "MMM d, yyyy") : ""}</p>
                    {order.buyer_email && <p className="text-xs text-stone-400 mt-0.5">Buyer: {order.buyer_email}</p>}
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[order.status] || "bg-stone-100 text-stone-600"}`}>
                      {order.status}
                    </span>
                    <p className="font-bold text-amber-700 mt-1">${myTotal.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {myItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      {item.product_image && <img src={item.product_image} className="w-10 h-10 rounded-lg object-cover" />}
                      <span className="text-stone-700">{item.product_name}</span>
                      <span className="text-stone-400 ml-auto">${item.product_price?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {order.tracking_number && (
                  <p className="text-xs text-stone-400 mt-3 flex items-center gap-1">
                    <Package className="w-3 h-3" /> Tracking: {order.tracking_number}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}