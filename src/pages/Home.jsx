import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Guitar, Star, ArrowRight, Hammer, Package, Shield, ChevronLeft, ChevronRight } from "lucide-react";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [builders, setBuilders] = useState([]);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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

  const heroSlides = [
    {
      title: "Handcrafted Guitars,\nBuilt for Players",
      sub: "Discover one-of-a-kind instruments from the world's finest independent luthiers.",
      bg: "from-stone-900 via-stone-800 to-amber-950",
      img: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80",
    },
    {
      title: "Commission Your\nDream Guitar",
      sub: "Work directly with master builders to create an instrument perfectly tailored to you.",
      bg: "from-amber-950 via-stone-800 to-stone-900",
      img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    },
  ];

  const slide = heroSlides[carouselIdx];

  return (
    <div className="bg-stone-50">
      {/* Hero */}
      <section className={`relative bg-gradient-to-r ${slide.bg} text-white overflow-hidden min-h-[560px] flex items-center`}>
        <div className="absolute inset-0">
          <img src={slide.img} className="w-full h-full object-cover opacity-20" alt="" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid md:grid-cols-2 gap-12 items-center w-full">
          <div>
            <span className="inline-block bg-amber-500/20 text-amber-400 text-sm font-medium px-3 py-1 rounded-full mb-6 border border-amber-500/30">
              Handcrafted Marketplace
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight whitespace-pre-line mb-6">
              {slide.title}
            </h1>
            <p className="text-lg text-stone-300 mb-8 leading-relaxed">{slide.sub}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={createPageUrl("Catalog")} className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-center">
                Browse Guitars
              </Link>
              <Link to={createPageUrl("CustomBuilds")} className="border border-white/30 hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-center">
                Custom Orders
              </Link>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="w-72 h-72 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
              <Guitar className="w-32 h-32 text-amber-400 opacity-60" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 right-6 flex gap-2">
          <button onClick={() => setCarouselIdx(0)} className={`w-2 h-2 rounded-full ${carouselIdx === 0 ? "bg-amber-400" : "bg-white/30"}`} />
          <button onClick={() => setCarouselIdx(1)} className={`w-2 h-2 rounded-full ${carouselIdx === 1 ? "bg-amber-400" : "bg-white/30"}`} />
        </div>
      </section>

      {/* Features strip */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { icon: Hammer, title: "Master Craftsmen", text: "Every builder is vetted for quality and skill" },
            { icon: Package, title: "Safe Shipping", text: "Instruments packed and insured for safe delivery" },
            { icon: Shield, title: "Buyer Protection", text: "Secure payments and satisfaction guarantee" },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex flex-col items-center gap-2 p-4">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
                <Icon className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-stone-800">{title}</h3>
              <p className="text-sm text-stone-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-stone-800">Featured Guitars</h2>
            <p className="text-stone-500 mt-1">Handpicked instruments from our top builders</p>
          </div>
          <Link to={createPageUrl("Catalog")} className="flex items-center gap-1 text-amber-600 hover:text-amber-500 font-medium text-sm">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-52 bg-stone-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-stone-200 rounded w-3/4" />
                  <div className="h-4 bg-stone-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
            {featured.length === 0 && (
              <div className="col-span-4 text-center py-12 text-stone-400">
                No featured products yet.
                <Link to={createPageUrl("Catalog")} className="ml-2 text-amber-600 hover:underline">Browse all</Link>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Builders */}
      <section className="bg-stone-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Meet Our Builders</h2>
              <p className="text-stone-400 mt-1">Independent luthiers with decades of combined experience</p>
            </div>
            <Link to={createPageUrl("Builders")} className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium text-sm">
              All builders <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {builders.map(builder => (
              <BuilderCard key={builder.id} builder={builder} />
            ))}
            {builders.length === 0 && (
              <div className="col-span-3 text-center py-8 text-stone-500">
                No featured builders yet. <Link to={createPageUrl("JoinBuilders")} className="text-amber-400 hover:underline">Be the first!</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA - Custom Builds */}
      <section className="bg-amber-50 border-y border-amber-200 py-14">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Guitar className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-stone-800 mb-3">Want Something Truly Unique?</h2>
          <p className="text-stone-600 mb-6 text-lg">Browse custom build listings from our builders and commission your perfect instrument.</p>
          <Link to={createPageUrl("CustomBuilds")} className="inline-block bg-amber-600 hover:bg-amber-500 text-white font-semibold px-10 py-4 rounded-xl transition-colors text-lg">
            Explore Custom Builds
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-2xl mx-auto px-4 py-14 text-center">
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Stay in the Loop</h2>
        <p className="text-stone-500 mb-6">Get notified about new instruments, builder spotlights, and exclusive drops.</p>
        {subscribed ? (
          <p className="text-amber-600 font-medium">Thanks for subscribing! 🎸</p>
        ) : (
          <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 border border-stone-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              Subscribe
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <Link to={createPageUrl(`ProductDetail?id=${product.id}`)} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-stone-200">
      <div className="h-52 bg-stone-100 overflow-hidden">
        {product.image_urls?.[0] ? (
          <img src={product.image_urls[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Guitar className="w-16 h-16 text-stone-300" />
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-stone-400 mb-1">{product.builder_name}</p>
        <h3 className="font-semibold text-stone-800 text-sm leading-tight mb-2">{product.name}</h3>
        {product.average_rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs text-stone-500">{product.average_rating?.toFixed(1)} ({product.review_count})</span>
          </div>
        )}
        <p className="text-amber-700 font-bold">${product.price?.toLocaleString()}</p>
      </div>
    </Link>
  );
}

function BuilderCard({ builder }) {
  return (
    <Link to={createPageUrl(`BuilderProfile?id=${builder.id}`)} className="group bg-stone-800 hover:bg-stone-700 rounded-2xl p-5 transition-colors flex gap-4 items-start">
      {builder.avatar_url ? (
        <img src={builder.avatar_url} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-full bg-amber-900/40 flex items-center justify-center flex-shrink-0">
          <span className="text-amber-400 font-bold text-xl">{builder.business_name?.[0] || builder.display_name?.[0] || "B"}</span>
        </div>
      )}
      <div className="min-w-0">
        <h3 className="font-semibold text-white truncate">{builder.business_name || builder.display_name}</h3>
        {builder.location && <p className="text-stone-400 text-xs mb-1">{builder.location}</p>}
        {builder.average_rating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs text-stone-400">{builder.average_rating?.toFixed(1)}</span>
          </div>
        )}
        {builder.specialties?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {builder.specialties.slice(0, 2).map(s => (
              <span key={s} className="bg-stone-700 text-stone-300 text-xs px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}