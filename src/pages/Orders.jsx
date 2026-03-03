import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ShoppingBag, Package, ChevronLeft, Calendar } from "lucide-react";
import { format } from "date-fns";
import FulfillmentStatusBadge from "../components/orders/FulfillmentStatusBadge";
import OrderProgressTracker from "../components/orders/OrderProgressTracker";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    try {
      const u = await base44.auth.me();
      const data = await base44.entities.Order.filter({ user_id: u.id }, "-created_date", 50);
      setOrders(data);
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  function toggleExpand(id) {
    setExpanded(e => ({ ...e, [id]: !e[id] }));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link to={createPageUrl("Account")} className="text-stone-400 hover:text-indigo-600"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold" style={{ color: "#1B2B4B" }}>My Orders</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-stone-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-600 mb-2">No orders yet</h3>
          <Link to={createPageUrl("Catalog")} className="text-indigo-600 hover:underline">Browse guitars →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">

              {/* Summary Row */}
              <button
                className="w-full text-left p-5 hover:bg-stone-50 transition-colors"
                onClick={() => toggleExpand(order.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-stone-400 mb-0.5">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-stone-500">{order.created_date ? format(new Date(order.created_date), "MMM d, yyyy") : ""}</p>
                    {order.order_type === "custom" && (
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">Custom Build</span>
                    )}
                    {order.builder_name && <p className="text-xs text-stone-400 mt-0.5">Builder: {order.builder_name}</p>}
                  </div>
                  <div className="text-right">
                    <FulfillmentStatusBadge status={order.fulfillment_status || "order_received"} />
                    <p className="font-bold mt-1" style={{ color: "#A0692A" }}>${order.total_amount?.toLocaleString()}</p>
                  </div>
                </div>
              </button>

              {/* Expanded Detail */}
              {expanded[order.id] && (
                <div className="border-t border-stone-100 px-5 pb-5 pt-4 space-y-4">

                  {/* Progress Tracker */}
                  <OrderProgressTracker order={order} />

                  {/* Items */}
                  {order.items?.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          {item.product_image && <img src={item.product_image} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                          <span className="text-stone-700 flex-1">{item.product_name}</span>
                          <span className="text-stone-400">${item.product_price?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Custom Build Dates */}
                  {order.order_type === "custom" && (order.build_start_date || order.estimated_build_completion_date) && (
                    <div className="flex flex-wrap gap-4 text-sm text-stone-600">
                      {order.build_start_date && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-indigo-400" />
                          <span>Build starts: <strong>{format(new Date(order.build_start_date), "MMM d, yyyy")}</strong></span>
                        </div>
                      )}
                      {order.estimated_build_completion_date && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-green-500" />
                          <span>Est. completion: <strong>{format(new Date(order.estimated_build_completion_date), "MMM d, yyyy")}</strong></span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tracking */}
                  {order.tracking_number && (
                    <p className="text-xs text-stone-400 flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {order.tracking_carrier && <span>{order.tracking_carrier}:</span>}
                      <span>{order.tracking_number}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}