import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Guitar, Star, ArrowRight, Hammer, Package, Shield, MapPin, ChevronRight } from "lucide-react";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [builders, setBuilders] = useState([]);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [prods, bldrs] = await Promise.all([
      base44.entities.Product.filter({ is_featured: true, status: "available" }, "-created_date", 8),
      base44.entities.UserProfile.filter({ is_seller: true, is_featured: true }, "-created_date", 6),
    ]);
    setFeatured(prods);
    setBuilders(bldrs);
    setLoading(false);
  }

  async function handleSubscribe(e) {
    e.preventDefault();
    if (!email) return;
    await base44.entities.NewsletterSubscription.create({ email });
    setSubscribed(true);
  }

  return (
    <div className="bg-white">

      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-0 min-h-[580px] items-center">
            <div className="py-20 lg:py-28 lg:pr-12">
              <span className="inline-block bg-indigo-900 text-white text-xs font-semibold tracking-widest uppercase px-3 py-1.5 mb-6">
                Curated Marketplace
              </span>
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6 tracking-tight">
                Handcrafted<br />
                <span className="text-indigo-900">Guitars</span> Built<br />
                for Players
              </h1>
              <p className="text-lg text-gray-500 mb-10 leading-relaxed max-w-md">
                Discover one-of-a-kind instruments from the world's finest independent luthiers.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to={createPageUrl("Catalog")} className="bg-indigo-900 hover:bg-indigo-800 text-white font-semibold px-8 py-4 rounded-lg text-sm transition-colors text-center">
                  Browse Guitars
                </Link>
                <Link to={createPageUrl("CustomBuilds")} className="border-2 border-gray-200 hover:border-indigo-900 hover:text-indigo-900 text-gray-700 font-semibold px-8 py-4 rounded-lg text-sm transition-colors text-center">
                  Commission a Build
                </Link>
              </div>
            </div>
            <div className="hidden lg:block relative h-full min-h-[580px] bg-gray-100">
              <img src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=900&q=85" alt="Handcrafted guitar" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-indigo-900/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
            {[
              { icon: Hammer, title: "Vetted Luthiers", text: "Every builder reviewed for quality and craftsmanship" },
              { icon: Package, title: "Protected Shipping", text: "Instruments packed, insured, and tracked door-to-door" },
              { icon: Shield, title: "Buyer Confidence", text: "Secure payments and clear satisfaction framework" },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-center gap-4 px-8 py-6">
                <div className="w-10 h-10 bg-indigo-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-0.5">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Instruments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-indigo-900 mb-2">Featured Instruments</p>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">In Stock Now</h2>
          </div>
          <Link to={createPageUrl("Catalog")} className="flex items-center gap-1.5 text-sm font-semibold text-indigo-900 hover:text-indigo-700 transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-56 bg-gray-100 rounded-xl mb-3" />
                <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
            {featured.length === 0 && (
              <div className="col-span-4 text-center py-16 text-gray-400 text-sm">
                No featured products yet.{" "}
                <Link to={createPageUrl("Catalog")} className="text-indigo-900 font-semibold hover:underline">Browse all</Link>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Custom Builds CTA */}
      <section className="bg-indigo-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-indigo-300 text-xs font-bold tracking-widest uppercase mb-4">Bespoke Commissions</p>
              <h2 className="text-4xl font-bold text-white mb-5 tracking-tight leading-tight">
                Commission Your<br />Dream Instrument
              </h2>
              <p className="text-indigo-200 text-base leading-relaxed mb-8 max-w-md">
                Work directly with a master builder to create an instrument built around your vision, your hands, and your sound.
              </p>
              <Link to={createPageUrl("CustomBuilds")} className="inline-flex items-center gap-2 bg-white text-indigo-900 hover:bg-gray-100 font-bold px-8 py-4 rounded-lg text-sm transition-colors">
                Explore Custom Builds <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="hidden lg:block rounded-2xl overflow-hidden h-72 relative">
              <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=85" alt="Custom guitar build" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Builders */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-indigo-900 mb-2">The Makers</p>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Featured Builders</h2>
          </div>
          <Link to={createPageUrl("Builders")} className="flex items-center gap-1.5 text-sm font-semibold text-indigo-900 hover:text-indigo-700 transition-colors">
            All builders <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {builders.map(builder => (
            <BuilderCard key={builder.id} builder={builder} />
          ))}
          {builders.length === 0 && (
            <div className="col-span-3 text-center py-10 text-gray-400 text-sm">
              No featured builders yet.{" "}
              <Link to={createPageUrl("JoinBuilders")} className="text-indigo-900 font-semibold hover:underline">Be the first!</Link>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-gray-100 bg-gray-50 py-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Stay in the Loop</h2>
          <p className="text-gray-500 text-sm mb-8">New instruments, builder spotlights, and updates. No noise.</p>
          {subscribed ? (
            <p className="text-indigo-900 font-semibold text-sm">You're on the list. Thank you.</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex max-w-sm mx-auto overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 text-sm focus:outline-none bg-transparent"
              />
              <button type="submit" className="bg-indigo-900 hover:bg-indigo-800 text-white text-sm font-semibold px-6 py-3 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <Link to={createPageUrl("ProductDetail?id=" + product.id)} className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-indigo-200 hover:shadow-lg transition-all duration-200">
      <div className="h-56 bg-gray-100 overflow-hidden">
        {product.image_urls && product.image_urls[0] ? (
          <img src={product.image_urls[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Guitar className="w-14 h-14 text-gray-300" />
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{product.builder_name}</p>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2">{product.name}</h3>
        {product.average_rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-gray-500">{product.average_rating.toFixed(1)} ({product.review_count})</span>
          </div>
        )}
        <p className="text-indigo-900 font-bold text-base">${product.price && product.price.toLocaleString()}</p>
      </div>
    </Link>
  );
}

function BuilderCard({ builder }) {
  return (
    <Link to={createPageUrl("BuilderProfile?id=" + builder.id)} className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-200 hover:shadow-md transition-all flex gap-4 items-start">
      {builder.avatar_url ? (
        <img src={builder.avatar_url} className="w-14 h-14 rounded-full object-cover flex-shrink-0 border border-gray-200" alt={builder.business_name} />
      ) : (
        <div className="w-14 h-14 rounded-full bg-indigo-900 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xl">{(builder.business_name || builder.display_name || "B")[0]}</span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-gray-900 text-sm mb-0.5 truncate">{builder.business_name || builder.display_name}</h3>
        {builder.location && (
          <p className="text-gray-400 text-xs flex items-center gap-1 mb-2">
            <MapPin className="w-3 h-3" />{builder.location}
          </p>
        )}
        {builder.average_rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-gray-500">{builder.average_rating.toFixed(1)}</span>
          </div>
        )}
        {builder.specialties && builder.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {builder.specialties.slice(0, 2).map(s => (
              <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-700 transition-colors flex-shrink-0 mt-1" />
    </Link>
  );
}