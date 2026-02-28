import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { LayoutDashboard, Package, Hammer, MessageSquare, User, Star, ShoppingBag, Plus } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) {
        const p = profiles[0];
        setProfile(p);
        const builderName = p.business_name || p.display_name;
        const [prods, reqs, msgs, revs, allOrders] = await Promise.all([
          base44.entities.Product.filter({ builder_id: p.id }, "-created_date", 20),
          base44.entities.CustomBuildRequest.filter({ builder_id: p.id }, "-created_date", 20),
          base44.entities.Message.filter({ recipient_id: p.id }, "-created_date", 10),
          base44.entities.BuilderReview.filter({ builder_id: p.id }, "-created_date", 10),
          base44.entities.Order.list("-created_date", 200),
        ]);
        setProducts(prods);
        setRequests(reqs);
        setMessages(msgs);
        setReviews(revs);
        const builderOrders = allOrders.filter(o => o.items?.some(item => item.builder_name === builderName));
        setRecentOrders(builderOrders.slice(0, 5));
      }
    } catch {
      base44.auth.redirectToLogin();
    }
    setLoading(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin w-8 h-8 border-4 border-indigo-700 border-t-transparent rounded-full" />
    </div>
  );

  if (!profile?.is_seller && profile?.account !== "seller" && profile?.account !== "admin") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Hammer className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-3">Builder Access Required</h2>
        <p className="text-gray-500 mb-6">You need a builder account to access the dashboard.</p>
        <Link to={createPageUrl("JoinBuilders")} className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold px-8 py-3 rounded-xl">
          Apply to Join as Builder
        </Link>
      </div>
    );
  }

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const pendingRequests = requests.filter(r => r.status === "pending").length;
  const unreadMessages = messages.filter(m => !m.is_read).length;

  const stats = [
    { label: "Active Listings", value: products.filter(p => p.status === "available").length, icon: Package, color: "bg-blue-50 text-blue-600", page: "DashboardActiveListings" },
    { label: "Pending Requests", value: pendingRequests, icon: Hammer, color: "bg-indigo-50 text-indigo-600", page: "DashboardCustomBuilds" },
    { label: "Avg. Rating", value: avgRating > 0 ? avgRating.toFixed(1) : "—", icon: Star, color: "bg-yellow-50 text-yellow-600", page: "DashboardRatings" },
    { label: "Unread Messages", value: unreadMessages, icon: MessageSquare, color: "bg-green-50 text-green-600", page: "Messages" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Builder Dashboard</h1>
          <p className="text-gray-500">Welcome back, {profile?.business_name || user?.full_name}</p>
        </div>
        <Link to={createPageUrl("DashboardProducts")} className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, page }) => (
          <Link key={label} to={createPageUrl(page || "Dashboard")} className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-indigo-200 hover:shadow-sm transition-all block">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-1">
            {[
              { label: "Incoming Orders", sub: `${recentOrders.length} recent orders`, icon: ShoppingBag, page: "BuilderOrders" },
              { label: "Manage Products", sub: `${products.length} listings`, icon: Package, page: "DashboardProducts" },
              { label: "Custom Build Listings", sub: "Manage your offerings", icon: Hammer, page: "DashboardCustomBuilds" },
              { label: "Messages", sub: `${unreadMessages} unread`, icon: MessageSquare, page: "Messages" },
              { label: "Edit Profile", sub: "Update your builder page", icon: User, page: "DashboardProfile" },
              ...(profile?.account === "admin" ? [{ label: "Manage References", sub: "Verify buyer references", icon: Star, page: "AdminReferences" }] : []),
            ].map(({ label, sub, icon: Icon, page }) => (
              <Link key={page} to={createPageUrl(page)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                  <Icon className="w-5 h-5 text-gray-500 group-hover:text-indigo-700 transition-colors" />
                </div>
                <div>
                  <p className="font-medium text-gray-700 text-sm">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Recent Build Requests</h2>
            <Link to={createPageUrl("DashboardCustomBuilds")} className="text-xs text-indigo-700 hover:underline">View all</Link>
          </div>
          {requests.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No requests yet.</p>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 5).map(r => (
                <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${r.status === "pending" ? "bg-indigo-500" : r.status === "accepted" ? "bg-green-500" : "bg-gray-400"}`} />
                  <div>
                    <p className="font-medium text-gray-700 text-sm">{r.customer_name}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{r.description}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                      r.status === "pending" ? "bg-indigo-100 text-indigo-700" :
                      r.status === "accepted" ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Recent Incoming Orders</h2>
            <Link to={createPageUrl("BuilderOrders")} className="text-xs text-indigo-700 hover:underline">View all</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => {
                const builderName = profile?.business_name || profile?.display_name;
                const myItems = order.items?.filter(i => i.builder_name === builderName) || [];
                const myTotal = myItems.reduce((sum, i) => sum + (i.product_price || 0) * (i.quantity || 1), 0);
                return (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-700 text-sm">Order #{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-400">{order.buyer_email} · {myItems.length} item{myItems.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === "paid" ? "bg-blue-100 text-blue-700" : order.status === "pending" ? "bg-indigo-100 text-indigo-700" : order.status === "shipped" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>{order.status}</span>
                      <p className="font-bold text-indigo-700 text-sm mt-0.5">${myTotal.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 lg:col-span-2">
          <h2 className="font-bold text-gray-900 mb-4">Recent Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No reviews yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {reviews.slice(0, 4).map(r => (
                <div key={r.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-700 text-sm">{r.reviewer_name}</span>
                    <div className="flex">{[1,2,3,4,5].map(n => <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />)}</div>
                  </div>
                  <p className="text-gray-500 text-xs line-clamp-2">{r.review_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}