import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { LayoutDashboard, Package, Hammer, MessageSquare, User, Star, ShoppingBag, TrendingUp, Plus } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reviews, setReviews] = useState([]);
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
        const [prods, reqs, msgs, revs] = await Promise.all([
          base44.entities.Product.filter({ builder_id: p.id }, "-created_date", 20),
          base44.entities.CustomBuildRequest.filter({ builder_id: p.id }, "-created_date", 20),
          base44.entities.Message.filter({ recipient_id: p.id }, "-created_date", 10),
          base44.entities.BuilderReview.filter({ builder_id: p.id }, "-created_date", 10),
        ]);
        setProducts(prods);
        setRequests(reqs);
        setMessages(msgs);
        setReviews(revs);
      }
    } catch {
      base44.auth.redirectToLogin();
    }
    setLoading(false);
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" /></div>;

  if (!profile?.is_seller && profile?.account !== "seller" && profile?.account !== "admin") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Hammer className="w-16 h-16 text-stone-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-stone-700 mb-3">Builder Access Required</h2>
        <p className="text-stone-500 mb-6">You need a builder account to access the dashboard.</p>
        <Link to={createPageUrl("JoinBuilders")} className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-8 py-3 rounded-xl">
          Apply to Join as Builder
        </Link>
      </div>
    );
  }

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const pendingRequests = requests.filter(r => r.status === "pending").length;
  const unreadMessages = messages.filter(m => !m.is_read).length;

  const stats = [
    { label: "Active Listings", value: products.filter(p => p.status === "available").length, icon: Package, color: "bg-blue-50 text-blue-600" },
    { label: "Pending Requests", value: pendingRequests, icon: Hammer, color: "bg-amber-50 text-amber-600" },
    { label: "Avg. Rating", value: avgRating > 0 ? avgRating.toFixed(1) : "—", icon: Star, color: "bg-yellow-50 text-yellow-600" },
    { label: "Unread Messages", value: unreadMessages, icon: MessageSquare, color: "bg-green-50 text-green-600" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Builder Dashboard</h1>
          <p className="text-stone-500">Welcome back, {profile?.business_name || user?.full_name}</p>
        </div>
        <Link to={createPageUrl("DashboardProducts")} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-stone-200">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-stone-800">{value}</p>
            <p className="text-sm text-stone-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <h2 className="font-bold text-stone-800 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: "Manage Products", sub: `${products.length} listings`, icon: Package, page: "DashboardProducts" },
              { label: "Custom Build Listings", sub: "Manage your offerings", icon: Hammer, page: "DashboardCustomBuilds" },
              { label: "Edit Profile", sub: "Update your builder page", icon: User, page: "DashboardProfile" },
            ].map(({ label, sub, icon: Icon, page }) => (
              <Link key={page} to={createPageUrl(page)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors group">
                <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <Icon className="w-5 h-5 text-stone-500 group-hover:text-amber-600 transition-colors" />
                </div>
                <div>
                  <p className="font-medium text-stone-700 text-sm">{label}</p>
                  <p className="text-xs text-stone-400">{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-stone-800">Recent Build Requests</h2>
            <Link to={createPageUrl("DashboardCustomBuilds")} className="text-xs text-amber-600 hover:underline">View all</Link>
          </div>
          {requests.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-6">No requests yet.</p>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 5).map(r => (
                <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl bg-stone-50">
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${r.status === "pending" ? "bg-amber-500" : r.status === "accepted" ? "bg-green-500" : "bg-stone-400"}`} />
                  <div>
                    <p className="font-medium text-stone-700 text-sm">{r.customer_name}</p>
                    <p className="text-xs text-stone-400 line-clamp-1">{r.description}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                      r.status === "pending" ? "bg-amber-100 text-amber-700" :
                      r.status === "accepted" ? "bg-green-100 text-green-700" :
                      "bg-stone-100 text-stone-600"
                    }`}>{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 lg:col-span-2">
          <h2 className="font-bold text-stone-800 mb-4">Recent Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-4">No reviews yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {reviews.slice(0, 4).map(r => (
                <div key={r.id} className="p-4 bg-stone-50 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-stone-700 text-sm">{r.reviewer_name}</span>
                    <div className="flex">{[1,2,3,4,5].map(n => <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? "text-amber-400 fill-amber-400" : "text-stone-300"}`} />)}</div>
                  </div>
                  <p className="text-stone-500 text-xs line-clamp-2">{r.review_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}