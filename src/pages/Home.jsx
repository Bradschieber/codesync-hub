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
    <div className="bg-[#FAF8F4]">
      {/* Hero */}
      <section className="relative bg-[#1C1917] text-white overflow-hidden min-h-[620px] flex items-center">
        <div className="absolute inset-0">
          <img src={slide.img} className="w-full h-full object-cover opacity-25" alt="" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C1917]/90 via-[#1C1917]/60 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#C09A5B] mb-5">Curated Handcraft Marketplace</p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.1] whitespace-pre-line mb-6" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>
              {slide.title}
            </h1>
            <p className="text-base text-stone-400 mb-10 leading-relaxed max-w-lg">{slide.sub}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl("Catalog")} className="bg-[#C09A5B] hover:bg-[#A8844A] text-white text-xs font-medium tracking-widest uppercase px-10 py-4 transition-colors text-center">
                Browse Guitars
              </Link>
              <Link to={createPageUrl("CustomBuilds")} className="border border-stone-500 hover:border-[#C09A5B] hover:text-[#C09A5B] text-stone-400 text-xs font-medium tracking-widest uppercase px-10 py-4 transition-colors text-center">
                Commission a Build
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex gap-2.5">
          <button onClick={() => setCarouselIdx(0)} className={`w-1.5 h-1.5 rounded-full transition-colors ${carouselIdx === 0 ? "bg-[#C09A5B]" : "bg-stone-600"}`} />
          <button onClick={() => setCarouselIdx(1)} className={`w-1.5 h-1.5 rounded-full transition-colors ${carouselIdx === 1 ? "bg-[#C09A5B]" : "bg-stone-600"}`} />
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
          {[
            { icon: Hammer, title: "Vetted Master Builders", text: "Every luthier is reviewed for quality and craftsmanship" },
            { icon: Package, title: "Protected Shipping", text: "Instruments packed, insured, and tracked to your door" },
            { icon: Shield, title: "Buyer Confidence", text: "Secure payments and a clear satisfaction framework" },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-4 p-6">
              <Icon className="w-5 h-5 text-[#C09A5B] mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-stone-800 mb-0.5">{title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#C09A5B] mb-2">Selected Works</p>
            <h2 className="text-3xl font-semibold text-stone-900" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>Featured Instruments</h2>
          </div>
          <Link to={createPageUrl("Catalog")} className="flex items-center gap-1.5 text-stone-500 hover:text-[#C09A5B] text-xs font-medium tracking-widest uppercase transition-colors">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white overflow-hidden animate-pulse">
                <div className="h-56 bg-stone-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-stone-100 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
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
              <div className="col-span-4 text-center py-16 text-stone-400 text-sm">
                No featured products yet.
                <Link to={createPageUrl("Catalog")} className="ml-2 text-[#C09A5B] hover:underline">Browse all</Link>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Builders */}
      <section className="bg-[#1C1917] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#C09A5B] mb-2">The Makers</p>
              <h2 className="text-3xl font-semibold" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>Meet Our Builders</h2>
            </div>
            <Link to={createPageUrl("Builders")} className="flex items-center gap-1.5 text-stone-500 hover:text-[#C09A5B] text-xs font-medium tracking-widest uppercase transition-colors">
              All builders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {builders.map(builder => (
              <BuilderCard key={builder.id} builder={builder} />
            ))}
            {builders.length === 0 && (
              <div className="col-span-3 text-center py-10 text-stone-600 text-sm">
                No featured builders yet. <Link to={createPageUrl("JoinBuilders")} className="text-[#C09A5B] hover:underline">Be the first!</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA - Custom Builds */}
      <section className="py-20 bg-[#FAF8F4] border-y border-stone-200">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#C09A5B] mb-4">Bespoke Commissions</p>
          <h2 className="text-4xl font-semibold text-stone-900 mb-4" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>Something Truly Yours</h2>
          <p className="text-stone-500 mb-8 leading-relaxed">Work directly with a master builder to commission an instrument built around your vision, your hands, and your sound.</p>
          <Link to={createPageUrl("CustomBuilds")} className="inline-block bg-[#1C1917] hover:bg-stone-800 text-white text-xs font-medium tracking-widest uppercase px-12 py-4 transition-colors">
            Explore Custom Builds
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#C09A5B] mb-3">Stay Informed</p>
        <h2 className="text-2xl font-semibold text-stone-900 mb-2" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>New Instruments & Builder Spotlights</h2>
        <p className="text-stone-500 text-sm mb-7">Delivered occasionally. No noise.</p>
        {subscribed ? (
          <p className="text-[#C09A5B] font-medium text-sm">You're on the list. Thank you.</p>
        ) : (
          <form onSubmit={handleSubscribe} className="flex gap-0 max-w-sm mx-auto border border-stone-300 overflow-hidden">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-3 text-sm focus:outline-none bg-white"
            />
            <button type="submit" className="bg-[#1C1917] hover:bg-stone-700 text-white text-xs font-medium tracking-widest uppercase px-6 py-3 transition-colors whitespace-nowrap">
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
    <Link to={createPageUrl(`ProductDetail?id=${product.id}`)} className="group bg-white overflow-hidden border border-stone-200 hover:border-stone-300 transition-all hover:shadow-md">
      <div className="h-56 bg-stone-100 overflow-hidden">
        {product.image_urls?.[0] ? (
          <img src={product.image_urls[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Guitar className="w-14 h-14 text-stone-300" />
          </div>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs text-stone-400 tracking-wide mb-1 uppercase">{product.builder_name}</p>
        <h3 className="font-medium text-stone-900 text-sm leading-snug mb-3" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>{product.name}</h3>
        {product.average_rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3 h-3 text-[#C09A5B] fill-[#C09A5B]" />
            <span className="text-xs text-stone-400">{product.average_rating?.toFixed(1)} ({product.review_count})</span>
          </div>
        )}
        <p className="text-stone-900 font-semibold text-sm">${product.price?.toLocaleString()}</p>
      </div>
    </Link>
  );
}

function BuilderCard({ builder }) {
  return (
    <Link to={createPageUrl(`BuilderProfile?id=${builder.id}`)} className="group border border-stone-700 hover:border-[#C09A5B]/50 p-5 transition-all flex gap-4 items-start">
      {builder.avatar_url ? (
        <img src={builder.avatar_url} className="w-12 h-12 rounded-full object-cover flex-shrink-0 grayscale group-hover:grayscale-0 transition-all" />
      ) : (
        <div className="w-12 h-12 rounded-full border border-stone-700 flex items-center justify-center flex-shrink-0">
          <span className="text-[#C09A5B] font-semibold text-lg" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>{builder.business_name?.[0] || builder.display_name?.[0] || "B"}</span>
        </div>
      )}
      <div className="min-w-0">
        <h3 className="font-medium text-white truncate text-sm mb-0.5" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>{builder.business_name || builder.display_name}</h3>
        {builder.location && <p className="text-stone-500 text-xs mb-2">{builder.location}</p>}
        {builder.average_rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3 h-3 text-[#C09A5B] fill-[#C09A5B]" />
            <span className="text-xs text-stone-500">{builder.average_rating?.toFixed(1)}</span>
          </div>
        )}
        {builder.specialties?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {builder.specialties.slice(0, 2).map(s => (
              <span key={s} className="border border-stone-700 text-stone-400 text-xs px-2 py-0.5">{s}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}