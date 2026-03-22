import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Package, Hammer, MessageSquare, User, Star, ShoppingBag, Plus, ArrowRight, RotateCcw, Users, ShieldCheck, Camera, X, Eye, Rocket } from "lucide-react";

const NAVY = "#1B2B4B";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workshopPosts, setWorkshopPosts] = useState([]);
  const [workshopPromptDismissed, setWorkshopPromptDismissed] = useState(() => sessionStorage.getItem("workshop_prompt_dismissed") === "1");

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
        const posts = await base44.entities.WorkshopPost.filter({ builder_id: p.id }, "-created_date", 1);
        setWorkshopPosts(posts);
      }
    } catch {
      base44.auth.redirectToLogin();
    }
    setLoading(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin w-7 h-7 border-2 border-t-transparent rounded-full" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
    </div>
  );

  if (!profile?.is_seller && profile?.account !== "seller" && profile?.account !== "admin") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Hammer className="w-12 h-12 mx-auto mb-5" style={{ color: "#CCCCCC" }} strokeWidth={1.5} />
        <h2 className="text-2xl font-bold mb-3" style={{ color: "#1A1A1A" }}>Builder Access Required</h2>
        <p className="text-base mb-8" style={{ color: "#5A5A5A" }}>You need a builder account to access the dashboard.</p>
        <Link
          to={createPageUrl("JoinBuilders")}
          className="inline-block font-semibold px-8 py-4 text-sm text-white transition-colors"
          style={{ backgroundColor: NAVY }}
        >
          Apply to Join as Builder
        </Link>
      </div>
    );
  }

  const hasCompleteListing = products.some(p =>
    p.name && p.price && p.description &&
    p.specifications?.instrumentCategory &&
    p.image_urls?.length >= 1
  );
  const storefrontSetupComplete = !!(profile?.business_name && (profile?.business_city || profile?.location));
  const showLaunchBanner = storefrontSetupComplete && !hasCompleteListing && !profile?.is_approved;

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const pendingRequests = requests.filter(r => r.status === "pending").length;
  const unreadMessages = messages.filter(m => !m.is_read).length;

  const stats = [
    { label: "Active Listings", value: products.filter(p => p.status === "available").length, icon: Package, page: "DashboardActiveListings" },
    { label: "Pending Requests", value: pendingRequests, icon: Hammer, page: "DashboardCustomBuilds" },
    { label: "Avg. Rating", value: avgRating > 0 ? avgRating.toFixed(1) : "—", icon: Star, page: "DashboardRatings" },
    { label: "Unread Messages", value: unreadMessages, icon: MessageSquare, page: "Messages" },
  ];

  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>
      {/* Page Header */}
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-14 pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-1" style={{ color: "#1A1A1A" }}>Builder Dashboard</h1>
              <p className="text-base" style={{ color: "#5A5A5A" }}>Welcome back, {profile?.business_name || user?.full_name}</p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              {profile?.id && (
                <Link
                  to={createPageUrl("BuilderProfile") + `?id=${profile.id}`}
                  className="flex items-center gap-2 font-semibold px-5 py-3 text-sm transition-colors"
                  style={{ backgroundColor: "transparent", color: NAVY, border: `1px solid ${NAVY}` }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = NAVY; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = NAVY; }}
                >
                  <Eye className="w-4 h-4" /> View Store
                </Link>
              )}
              <Link
                to={createPageUrl("DashboardProducts")}
                className="flex items-center gap-2 font-semibold px-5 py-3 text-sm text-white transition-colors"
                style={{ backgroundColor: NAVY }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
              >
                <Plus className="w-4 h-4" /> Add Product
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Launch Progress Banner */}
        {showLaunchBanner && (
          <div className="mb-6 border p-6" style={{ borderColor: "#D8D4CC", backgroundColor: "#FFFFFF" }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Rocket className="w-4 h-4 flex-shrink-0" style={{ color: NAVY }} />
                  <p className="text-sm font-bold" style={{ color: "#1A1A1A" }}>Add your first listing to launch your storefront</p>
                </div>
                <p className="text-xs leading-relaxed mb-4" style={{ color: "#5A5A5A" }}>
                  Your builder profile is set up and looking good. The next step is to add one complete instrument listing. Once that's done, your storefront can be submitted for review.
                </p>
                {/* Progress milestones */}
                <div className="flex flex-wrap items-center gap-4 mb-5">
                  {[
                    { label: "Storefront setup", done: true },
                    { label: "First listing", done: false },
                    { label: "Submitted for review", done: false },
                  ].map(({ label, done }, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: done ? "#4A9A6A" : "#E3E0D8" }}>
                        {done
                          ? <Check className="w-2.5 h-2.5 text-white" />
                          : <span className="w-1.5 h-1.5 rounded-full" style={{ display: "block", backgroundColor: "#C8C4BC" }} />
                        }
                      </div>
                      <span className="text-xs" style={{ color: done ? "#3A6A4A" : "#7A7A7A" }}>{label}</span>
                      {i < 2 && <span className="text-xs" style={{ color: "#D8D4CC" }}>→</span>}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to={createPageUrl("DashboardProducts")}
                    className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
                    style={{ backgroundColor: NAVY }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
                  >
                    <Plus className="w-4 h-4" /> Create First Listing
                  </Link>
                  {profile?.id && (
                    <Link
                      to={createPageUrl("BuilderProfile") + `?id=${profile.id}`}
                      className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 border transition-colors"
                      style={{ color: NAVY, borderColor: NAVY, backgroundColor: "transparent" }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = NAVY; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = NAVY; }}
                    >
                      <Eye className="w-4 h-4" /> Preview Storefront
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Workshop Activity soft prompt */}
        {workshopPosts.length === 0 && !workshopPromptDismissed && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 relative">
            <Camera className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-900 mb-0.5">Show buyers what you're working on.</p>
              <p className="text-xs text-amber-700 leading-relaxed mb-3">Builders who share workshop updates create stronger storefronts and build more buyer trust.</p>
              <Link
                to={createPageUrl("DashboardWorkshop")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: "#C57A1F" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#a8661a"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#C57A1F"}
              >
                <Camera className="w-3.5 h-3.5" /> Add Workshop Update
              </Link>
            </div>
            <button
              onClick={() => { setWorkshopPromptDismissed(true); sessionStorage.setItem("workshop_prompt_dismissed", "1"); }}
              className="text-amber-400 hover:text-amber-600 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, page }) => (
            <Link
              key={label}
              to={createPageUrl(page || "Dashboard")}
              className="block p-5 border transition-all group"
              style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = NAVY}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#E0DDD8"}
            >
              <div className="mb-3" style={{ color: NAVY }}>
                <Icon className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <p className="text-3xl font-bold mb-1" style={{ color: "#1A1A1A" }}>{value}</p>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#7A7A7A" }}>{label}</p>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="border p-5" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
            <h2 className="font-bold text-sm uppercase tracking-widest mb-5" style={{ color: "#6B6B6B" }}>Quick Actions</h2>
            <div className="space-y-1">
              {[
                { label: "Incoming Orders", sub: `${recentOrders.length} recent orders`, icon: ShoppingBag, page: "BuilderOrders" },
                { label: "Manage Products", sub: `${products.length} listings`, icon: Package, page: "DashboardProducts" },
                { label: "Custom Build Listings", sub: "Manage your offerings", icon: Hammer, page: "DashboardCustomBuilds" },
                { label: "Messages", sub: `${unreadMessages} unread`, icon: MessageSquare, page: "Messages" },
                { label: "Workshop Activity", sub: "Share your process & builds", icon: Camera, page: "DashboardWorkshop" },
                { label: "Edit Profile", sub: "Update your builder page", icon: User, page: "DashboardProfile" },
                { label: "My Customers", sub: "Customer roster & history", icon: Users, page: "BuilderCustomers" },
                { label: "Returns & Warranty", sub: "Manage claims", icon: RotateCcw, page: "BuilderReturnsWarranty" },
                ...(profile?.account === "admin" ? [{ label: "Admin Dashboard", sub: "Badges, references & platform tools", icon: ShieldCheck, page: "AdminDashboard" }] : []),
              ].map(({ label, sub, icon: Icon, page }) => (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className="flex items-center gap-3 p-3 transition-colors group"
                  style={{ color: "#3D3D3D" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F5F3F0"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <div className="w-9 h-9 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EEF1F7" }}>
                    <Icon className="w-4 h-4" style={{ color: NAVY }} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm" style={{ color: "#1A1A1A" }}>{label}</p>
                    <p className="text-xs" style={{ color: "#9A9A9A" }}>{sub}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: NAVY }} />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Build Requests */}
          <div className="border p-5" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-sm uppercase tracking-widest" style={{ color: "#6B6B6B" }}>Recent Build Requests</h2>
              <Link to={createPageUrl("DashboardCustomBuilds")} className="text-xs font-semibold flex items-center gap-0.5 hover:opacity-70 transition-opacity" style={{ color: NAVY }}>
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {requests.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "#9A9A9A" }}>No requests yet.</p>
            ) : (
              <div className="space-y-2">
                {requests.slice(0, 5).map(r => (
                  <div key={r.id} className="flex items-start gap-3 p-3" style={{ backgroundColor: "#F5F3F0" }}>
                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0`} style={{ backgroundColor: r.status === "pending" ? NAVY : r.status === "accepted" ? "#27AE60" : "#AAAAAA" }} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm" style={{ color: "#1A1A1A" }}>{r.customer_name}</p>
                      <p className="text-xs truncate" style={{ color: "#7A7A7A" }}>{r.description}</p>
                      <span className="text-xs font-semibold mt-1 inline-block uppercase tracking-wide" style={{ color: r.status === "pending" ? NAVY : r.status === "accepted" ? "#27AE60" : "#888888" }}>{r.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="border p-5 lg:col-span-2" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-sm uppercase tracking-widest" style={{ color: "#6B6B6B" }}>Recent Incoming Orders</h2>
              <Link to={createPageUrl("BuilderOrders")} className="text-xs font-semibold flex items-center gap-0.5 hover:opacity-70 transition-opacity" style={{ color: NAVY }}>
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: "#9A9A9A" }}>No orders yet.</p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map(order => {
                  const builderName = profile?.business_name || profile?.display_name;
                  const myItems = order.items?.filter(i => i.builder_name === builderName) || [];
                  const myTotal = myItems.reduce((sum, i) => sum + (i.product_price || 0) * (i.quantity || 1), 0);
                  return (
                    <div key={order.id} className="flex items-center justify-between p-3" style={{ backgroundColor: "#F5F3F0" }}>
                      <div>
                        <p className="font-medium text-sm" style={{ color: "#1A1A1A" }}>Order #{order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs" style={{ color: "#7A7A7A" }}>{order.buyer_email} · {myItems.length} item{myItems.length !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: order.status === "paid" ? "#27AE60" : order.status === "pending" ? NAVY : "#888888" }}>{order.status}</span>
                        <p className="font-bold text-sm" style={{ color: NAVY }}>${myTotal.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Reviews */}
          <div className="border p-5 lg:col-span-2" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
            <h2 className="font-bold text-sm uppercase tracking-widest mb-5" style={{ color: "#6B6B6B" }}>Recent Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: "#9A9A9A" }}>No reviews yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {reviews.slice(0, 4).map(r => (
                  <div key={r.id} className="p-4" style={{ backgroundColor: "#F5F3F0" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm" style={{ color: "#1A1A1A" }}>{r.reviewer_name}</span>
                      <div className="flex gap-0.5">{[1,2,3,4,5].map(n => <Star key={n} className={`w-3.5 h-3.5`} style={{ color: n <= r.rating ? "#D4AC0D" : "#DDDDDD", fill: n <= r.rating ? "#D4AC0D" : "none" }} />)}</div>
                    </div>
                    <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#5A5A5A" }}>{r.review_text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}