import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ShoppingCart, Menu, X, Guitar, User, Heart, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import CartModal from "./components/marketplace/CartModal";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { loadUser(); }, []);
  useEffect(() => { if (user) loadCartCount(); }, [user]);

  async function loadUser() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) setProfile(profiles[0]);
    } catch {
      setUser(null);
    }
  }

  async function loadCartCount() {
    try {
      const items = await base44.entities.CartItem.filter({ user_id: user.id });
      setCartCount(items.length);
    } catch { setCartCount(0); }
  }

  function handleLogout() { base44.auth.logout(); }

  const navLinks = [
    { label: "Home", page: "Home" },
    { label: "Catalog", page: "Catalog" },
    { label: "Builders", page: "Builders" },
    { label: "About", page: "About" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', system-ui, sans-serif; background: #FDFBF8; color: #1e2a3a; }
        .font-sans { font-family: 'Inter', system-ui, sans-serif; }
        h1, h2, h3, .font-display { font-family: 'Playfair Display', Georgia, serif; }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-2.5 group">
              <Guitar className="w-5 h-5 text-indigo-700 group-hover:text-indigo-600 transition-colors" />
              <span className="text-base font-bold tracking-tight text-gray-900 group-hover:text-indigo-700 transition-colors uppercase" style={{ letterSpacing: "0.08em" }}>
                Stringed Collective
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(l => (
                <Link
                  key={l.page}
                  to={createPageUrl(l.page)}
                  className={`text-sm font-medium transition-colors hover:text-indigo-700 ${
                    currentPageName === l.page ? "text-indigo-700" : "text-gray-600"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <button
                    onClick={() => setCartOpen(true)}
                    className="relative p-2 text-gray-500 hover:text-indigo-700 transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-indigo-700 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-1 text-gray-500 hover:text-indigo-700 transition-colors p-2"
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
                        <Link to={createPageUrl("Account")} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-700">
                          <User className="w-4 h-4" /> My Account
                        </Link>
                        <Link to={createPageUrl("Orders")} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-700">
                          <ShoppingCart className="w-4 h-4" /> Orders
                        </Link>
                        <Link to={createPageUrl("Wishlist")} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-700">
                          <Heart className="w-4 h-4" /> Wishlist
                        </Link>
                        {(profile?.account === 'seller' || profile?.account === 'admin') && (
                          <Link to={createPageUrl("Dashboard")} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-700">
                            <LayoutDashboard className="w-4 h-4" /> Builder Dashboard
                          </Link>
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
                  className="bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
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
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
            {navLinks.map(l => (
              <Link
                key={l.page}
                to={createPageUrl(l.page)}
                onClick={() => setMenuOpen(false)}
                className={`block py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                  currentPageName === l.page ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50 hover:text-indigo-700"
                }`}
              >
                {l.label}
              </Link>
            ))}
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
            <div className="flex items-center gap-2 mb-4">
              <Guitar className="w-5 h-5 text-indigo-400" />
              <span className="text-white font-bold text-sm tracking-tight uppercase" style={{ letterSpacing: "0.08em" }}>Stringed Collective</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">A curated marketplace connecting independent luthiers with players who appreciate fine craftsmanship.</p>
          </div>
          <div>
            <h4 className="text-white text-xs font-semibold tracking-widest uppercase mb-4">Marketplace</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to={createPageUrl("Catalog")} className="hover:text-indigo-400 transition-colors">Browse Guitars</Link></li>
              <li><Link to={createPageUrl("Builders")} className="hover:text-indigo-400 transition-colors">Find Builders</Link></li>
              <li><Link to={createPageUrl("CustomBuilds")} className="hover:text-indigo-400 transition-colors">Custom Builds</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs font-semibold tracking-widest uppercase mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to={createPageUrl("About")} className="hover:text-indigo-400 transition-colors">About</Link></li>
              <li><Link to={createPageUrl("JoinBuilders")} className="hover:text-indigo-400 transition-colors">Join as Builder</Link></li>
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
    </div>
  );
}