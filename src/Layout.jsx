import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { ShoppingCart, Menu, X, User, Heart, LogOut, LayoutDashboard, ChevronDown, Hammer } from "lucide-react";
import CartModal from "./components/marketplace/CartModal";
import BuilderAccountFormModal from "./components/builder/BuilderAccountFormModal";

export default function Layout({ children, currentPageName }) {
  const { logout, user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [builderModalOpen, setBuilderModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { loadUser(); }, [authUser, location.pathname]);
  useEffect(() => {
    if (!user) return;
    loadCartCount();
    const unsub = base44.entities.CartItem.subscribe(() => loadCartCount());
    return unsub;
  }, [user]);

  async function loadUser() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) setProfile(profiles[0]);
      else setProfile(null);
    } catch {
      setUser(null);
      setProfile(null);
    }
  }

  async function loadCartCount() {
    try {
      const items = await base44.entities.CartItem.filter({ user_id: user.id });
      setCartCount(items.length);
    } catch { setCartCount(0); }
  }

  function handleLogout() { logout("/"); }

  const isBuilder = profile?.account === 'seller' || profile?.account === 'admin';

  const navLinks = [
    { label: "Home", page: "Home" },
    { label: "Catalog", page: "Catalog" },
    { label: "Our Builders", page: "Builders" },
    { label: "About", page: "About" },
    { label: "From The Bench", page: "FromTheBench" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        body { font-family: 'DM Sans', system-ui, sans-serif; background: #FDFBF8; color: #1B2B4B; }
        * { font-family: 'DM Sans', system-ui, sans-serif; }
        h1, h2, h3, h4, h5, h6 { font-family: 'DM Sans', system-ui, sans-serif; }
        .logo-wordmark { font-family: 'DM Sans', system-ui, sans-serif; }
      `}</style>

      {/* Header */}
      <header className="border-b sticky top-0 z-50" style={{ backgroundColor: "#F7F6F3", borderColor: "#E3E0D8" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex flex-col group" style={{ gap: "0px", lineHeight: 1.05 }}>
              <span className="logo-wordmark group-hover:opacity-75 transition-opacity" style={{ fontWeight: 700, fontSize: "1.15rem", color: "#2C3E55", letterSpacing: "0.02em" }}>Stringed</span>
              <span className="logo-wordmark group-hover:opacity-75 transition-opacity" style={{ fontWeight: 400, fontSize: "1.15rem", color: "#2C3E55", letterSpacing: "0.13em" }}>Collective</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(l => (
                <Link
                  key={l.page}
                  to={createPageUrl(l.page)}
                  className={`text-sm font-medium transition-colors ${
                    currentPageName === l.page ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
                  }`}
                  style={currentPageName === l.page ? { color: "#24324A" } : {}}
                >
                  {l.label}
                </Link>
              ))}
              <button
                onClick={() => setBuilderModalOpen(true)}
                className="text-sm font-medium transition-colors px-4 py-1.5 border"
                style={{ color: "#2F3E55", borderColor: "#2F3E55", backgroundColor: "transparent" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#2F3E55"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#2F3E55"; }}
              >
                Create Your Builder Profile
              </button>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <button
                    onClick={() => setCartOpen(true)}
                    className="relative p-2 text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium" style={{ backgroundColor: "#1B2B4B" }}>
                        {cartCount}
                      </span>
                    )}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors p-2"
                    >
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} className="w-7 h-7 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 truncate">{profile?.business_name || user?.full_name}</p>
                          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                        <Link to={createPageUrl("Account")} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                          <User className="w-4 h-4" /> My Account
                        </Link>
                        {isBuilder ? (
                          <>
                            <Link to={createPageUrl("BuilderOrders")} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                              <ShoppingCart className="w-4 h-4" /> Orders
                            </Link>
                            <Link to={createPageUrl("Dashboard")} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                              <LayoutDashboard className="w-4 h-4" /> Builder Dashboard
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link to={createPageUrl("Orders")} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                              <ShoppingCart className="w-4 h-4" /> Orders
                            </Link>
                            <Link to={createPageUrl("Wishlist")} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                              <Heart className="w-4 h-4" /> Wishlist
                            </Link>
                            <button onClick={() => { setUserMenuOpen(false); setBuilderModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 w-full text-left">
                              <Hammer className="w-4 h-4" /> Become a Builder
                            </button>
                          </>
                        )}
                        <hr className="my-1 border-gray-100" />
                        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50 w-full">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                  style={{ backgroundColor: "#2F3E55" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#243349"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "#2F3E55"}
                >
                  Sign In
                </button>
              )}

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-gray-500 hover:text-indigo-700"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
        <div className="md:hidden border-t px-4 py-3 space-y-1" style={{ backgroundColor: "#F7F6F3", borderColor: "#E3E0D8" }}>
            {navLinks.map(l => (
              <Link
                key={l.page}
                to={createPageUrl(l.page)}
                onClick={() => setMenuOpen(false)}
                className={`block py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                  currentPageName === l.page ? "bg-stone-100 text-gray-900" : "text-gray-700 hover:bg-stone-50 hover:text-gray-900"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <button
              onClick={() => { setMenuOpen(false); setBuilderModalOpen(true); }}
              className="block w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors"
              style={{ color: "#2F3E55", backgroundColor: "#F2F0EA" }}
            >
              Join As A Builder
            </button>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main onClick={() => setUserMenuOpen(false)}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex flex-col mb-4" style={{ gap: "1px", lineHeight: 1.15 }}>
              <span className="logo-wordmark" style={{ fontWeight: 500, fontSize: "0.9rem", color: "#7A90AA", letterSpacing: "0.01em" }}>Stringed</span>
              <span className="logo-wordmark" style={{ fontWeight: 400, fontSize: "0.9rem", color: "#7A90AA", letterSpacing: "0.08em" }}>Collective</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">Connecting independent builders with players around the world who appreciate the craft and story behind every instrument.</p>
          </div>
          <div>
            <h4 className="text-white text-xs font-semibold tracking-widest uppercase mb-4">Marketplace</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to={createPageUrl("Catalog")} className="hover:text-indigo-400 transition-colors">Browse Guitars</Link></li>
              <li><Link to={createPageUrl("Builders")} className="hover:text-indigo-400 transition-colors">Find Builders</Link></li>
              <li><Link to={createPageUrl("Builders")} className="hover:text-indigo-400 transition-colors">Find a Custom Builder</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs font-semibold tracking-widest uppercase mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to={createPageUrl("About")} className="hover:text-indigo-400 transition-colors">About</Link></li>
              <li><button onClick={() => setBuilderModalOpen(true)} className="hover:text-indigo-400 transition-colors">Join as Builder</button></li>
              <li><Link to={createPageUrl("Contact")} className="hover:text-indigo-400 transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs font-semibold tracking-widest uppercase mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to={createPageUrl("Terms")} className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 px-4 py-5 text-center text-xs text-gray-600 tracking-wide">
          © 2025 Stringed Collective. All rights reserved.
        </div>
      </footer>

      {cartOpen && (
        <CartModal
          user={user}
          onClose={() => { setCartOpen(false); loadCartCount(); }}
        />
      )}
      {builderModalOpen && (
        <BuilderAccountFormModal onClose={() => setBuilderModalOpen(false)} />
      )}
    </div>
  );
}