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

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) loadCartCount();
  }, [user]);

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

  function handleLogout() {
    base44.auth.logout();
  }

  const navLinks = [
    { label: "Home", page: "Home" },
    { label: "Catalog", page: "Catalog" },
    { label: "Builders", page: "Builders" },
    { label: "Custom Builds", page: "CustomBuilds" },
    { label: "About", page: "About" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F4] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
        :root {
          --color-primary: #7C5C3E;
          --color-primary-dark: #5C3F26;
          --color-accent: #C09A5B;
          --color-wood: #B8895A;
          --color-cream: #FAF8F4;
          --color-charcoal: #1C1917;
        }
        body { font-family: 'Inter', system-ui, sans-serif; background: #FAF8F4; }
        .font-display { font-family: 'Playfair Display', Georgia, serif; }
        .font-sans { font-family: 'Inter', system-ui, sans-serif; }
      `}</style>

      {/* Header */}
      <header className="bg-[#1C1917] text-white shadow-lg sticky top-0 z-50 border-b border-stone-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <Guitar className="w-6 h-6 text-[#C09A5B] group-hover:text-[#D4B47A] transition-colors" />
              <span className="text-lg font-semibold tracking-widest text-[#C09A5B] group-hover:text-[#D4B47A] transition-colors uppercase" style={{fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.12em"}}>
                Stringed Collective
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map(l => (
                <Link
                  key={l.page}
                  to={createPageUrl(l.page)}
                  className={`text-sm font-medium transition-colors hover:text-amber-400 ${
                    currentPageName === l.page ? "text-amber-400" : "text-stone-300"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <button
                    onClick={() => { setCartOpen(true); }}
                    className="relative p-2 text-stone-300 hover:text-amber-400 transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-1 text-stone-300 hover:text-amber-400 transition-colors"
                    >
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-stone-200 py-1 z-50">
                        <Link to={createPageUrl("Account")} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
                          <User className="w-4 h-4" /> My Account
                        </Link>
                        <Link to={createPageUrl("Orders")} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
                          <ShoppingCart className="w-4 h-4" /> Orders
                        </Link>
                        <Link to={createPageUrl("Wishlist")} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
                          <Heart className="w-4 h-4" /> Wishlist
                        </Link>
                        {(profile?.account === 'seller' || profile?.account === 'admin') && (
                          <Link to={createPageUrl("Dashboard")} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
                            <LayoutDashboard className="w-4 h-4" /> Builder Dashboard
                          </Link>
                        )}
                        <hr className="my-1 border-stone-200" />
                        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-stone-50 w-full">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Sign In
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-stone-300 hover:text-amber-400"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden bg-stone-800 border-t border-stone-700 px-4 py-3 space-y-2">
            {navLinks.map(l => (
              <Link
                key={l.page}
                to={createPageUrl(l.page)}
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-stone-300 hover:text-amber-400 font-medium"
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Page Content */}
      <main onClick={() => { setUserMenuOpen(false); }}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Guitar className="w-6 h-6 text-amber-400" />
              <span className="text-white font-bold text-lg">Stringed Collective</span>
            </div>
            <p className="text-sm leading-relaxed">A curated marketplace connecting independent guitar builders with players who appreciate craftsmanship.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Marketplace</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to={createPageUrl("Catalog")} className="hover:text-amber-400 transition-colors">Browse Guitars</Link></li>
              <li><Link to={createPageUrl("Builders")} className="hover:text-amber-400 transition-colors">Find Builders</Link></li>
              <li><Link to={createPageUrl("CustomBuilds")} className="hover:text-amber-400 transition-colors">Custom Builds</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to={createPageUrl("About")} className="hover:text-amber-400 transition-colors">About</Link></li>
              <li><Link to={createPageUrl("JoinBuilders")} className="hover:text-amber-400 transition-colors">Join as Builder</Link></li>
              <li><Link to={createPageUrl("Contact")} className="hover:text-amber-400 transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to={createPageUrl("Terms")} className="hover:text-amber-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-stone-800 px-4 py-4 text-center text-xs text-stone-600">
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