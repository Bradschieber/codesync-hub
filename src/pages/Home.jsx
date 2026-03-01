import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ArrowRight, Guitar, Lock, CreditCard, CheckCircle, MapPin, User } from "lucide-react";

const NAVY = "#1B2B4B";
const BRONZE = "#A0692A";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [builders, setBuilders] = useState([]);
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

  return (
    <div style={{ backgroundColor: "#FAF9F7", color: "#1A1A1A" }} className="min-h-screen">

      {/* ── 1. HERO ── */}
      <section style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Headline */}
          <div className="max-w-3xl mb-14">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight mb-6" style={{ color: "#1A1A1A", fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
              Play Something<br />Different.
            </h1>
            <p className="text-lg sm:text-xl mb-10 leading-relaxed" style={{ color: "#3D3D3D" }}>
              A protected way to buy directly from independent builders.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                to={createPageUrl("Catalog")}
                className="inline-block font-semibold px-8 py-4 text-sm tracking-wide transition-colors text-white"
                style={{ backgroundColor: NAVY }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
              >
                Browse Instruments
              </Link>
              <Link
                to={createPageUrl("About")}
                className="inline-flex items-center gap-1.5 font-semibold text-sm pt-4 sm:pt-3.5 transition-opacity hover:opacity-70"
                style={{ color: NAVY }}
              >
                How It Works <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Featured Instrument Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: "#6B6B6B" }}>
                Available Now
              </h2>
              <Link to={createPageUrl("Catalog")} className="text-sm font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity" style={{ color: NAVY }}>
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="rounded-sm mb-3" style={{ height: 220, backgroundColor: "#EBEBEB" }} />
                    <div className="h-3 rounded w-3/4 mb-2" style={{ backgroundColor: "#EBEBEB" }} />
                    <div className="h-3 rounded w-1/2" style={{ backgroundColor: "#EBEBEB" }} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {featured.map(p => <ProductCard key={p.id} product={p} />)}
                {featured.length === 0 && (
                  <div className="col-span-4 py-16 text-center text-sm" style={{ color: "#9A9A9A" }}>
                    No featured instruments yet.{" "}
                    <Link to={createPageUrl("Catalog")} className="font-semibold underline" style={{ color: NAVY }}>Browse all</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 2. PROTECTION & TRUST ── */}
      <section className="py-20 mt-10" style={{ backgroundColor: "#EEF1F7" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-5 tracking-tight" style={{ color: "#1A1A1A" }}>
              Buy and build with confidence.
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#3D3D3D" }}>
              Every transaction on Stringed Collective is protected.<br />
              Funds are secured. Builders are paid.<br />
              No one carries the risk alone.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: "Buyer funds protected",
                text: "Your payment is held securely and only released when your instrument is confirmed received."
              },
              {
                icon: CreditCard,
                title: "Builder payments guaranteed",
                text: "Builders receive payment reliably — no chargebacks, no surprises, no platform delays."
              },
              {
                icon: CheckCircle,
                title: "Secure, transparent checkout",
                text: "Every step of the transaction is visible to both parties from purchase to delivery."
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex flex-col gap-4">
                <div className="w-8 h-8 flex items-center justify-center" style={{ color: BRONZE }}>
                  <Icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-base mb-2" style={{ color: "#1A1A1A" }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#4A4A4A" }}>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. SHOP BY CATEGORY ── */}
      <section className="py-20" style={{ backgroundColor: "#FAF9F7" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-8" style={{ color: "#6B6B6B" }}>
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Electric", page: "Catalog", desc: "Solid body, semi-hollow & more" },
              { label: "Acoustic", page: "Catalog", desc: "Steel string, fingerstyle & classical" },
              { label: "Bass", page: "Catalog", desc: "4, 5, and 6 string instruments" },
              { label: "Custom Builds", page: "Builders", desc: "Commission a one-of-a-kind build" },
            ].map(cat => (
              <Link
                key={cat.label}
                to={createPageUrl(cat.page)}
                className="group block p-7 border transition-all"
                style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF" }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = BRONZE;
                  e.currentTarget.style.backgroundColor = "#FDF8F3";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "#DEDBD6";
                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                }}
              >
                <h3 className="text-xl font-bold mb-2 tracking-tight" style={{ color: "#1A1A1A" }}>{cat.label}</h3>
                <p className="text-sm" style={{ color: "#6B6B6B" }}>{cat.desc}</p>
                <div className="mt-5 flex items-center gap-1 text-xs font-semibold transition-opacity opacity-0 group-hover:opacity-100" style={{ color: BRONZE }}>
                  Browse <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. FEATURED BUILDERS ── */}
      <section className="py-20 border-t" style={{ backgroundColor: "#FAF9F7", borderColor: "#E0DDD8" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: "#6B6B6B" }}>The Builders</h2>
              <h3 className="text-3xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>Independent makers.<br />Verified craft.</h3>
            </div>
            <Link to={createPageUrl("Builders")} className="text-sm font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity hidden sm:flex" style={{ color: NAVY }}>
              All builders <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {builders.map(b => <BuilderCard key={b.id} builder={b} />)}
            {builders.length === 0 && (
              <div className="col-span-3 py-10 text-center text-sm" style={{ color: "#9A9A9A" }}>
                No featured builders yet.{" "}
                <Link to={createPageUrl("JoinBuilders")} className="font-semibold underline" style={{ color: NAVY }}>Be the first</Link>
              </div>
            )}
          </div>

          <div className="mt-8 sm:hidden">
            <Link to={createPageUrl("Builders")} className="text-sm font-semibold flex items-center gap-1" style={{ color: NAVY }}>
              All builders <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. BUILDER CTA BAND ── */}
      <section className="py-16" style={{ backgroundColor: NAVY }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">Are you a builder?</h2>
              <p className="text-base leading-relaxed" style={{ color: "#A8B8D0" }}>
                List your instruments. Reach buyers who care about how things are made.
              </p>
            </div>
            <div className="sm:text-right">
              <Link
                to={createPageUrl("JoinBuilders")}
                className="inline-block font-semibold px-8 py-4 text-sm tracking-wide transition-colors border"
                style={{ color: NAVY, backgroundColor: "#FFFFFF", borderColor: "#FFFFFF" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#EEF1F7"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#FFFFFF"; }}
              >
                Apply to Sell
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

function ProductCard({ product }) {
  const specs = product.specifications || {};
  const specLine = [
    specs.topWood,
    specs.scaleLength ? `${specs.scaleLength}"` : null,
    specs.instrumentCategory,
  ].filter(Boolean).join(" · ");

  return (
    <Link
      to={createPageUrl("ProductDetail?id=" + product.id)}
      className="group block"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      {/* Image */}
      <div className="overflow-hidden mb-4" style={{ aspectRatio: "4/3", backgroundColor: "#EBEBEB" }}>
        {product.image_urls && product.image_urls[0] ? (
          <img
            src={product.image_urls[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            style={{ transition: "transform 0.4s ease" }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Guitar className="w-12 h-12" style={{ color: "#CCCCCC" }} />
          </div>
        )}
      </div>
      {/* Info */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#8A8A8A" }}>{product.builder_name}</p>
        <h3 className="font-bold text-sm mb-1 leading-snug" style={{ color: "#1A1A1A" }}>{product.name}</h3>
        {specLine && <p className="text-xs mb-2" style={{ color: "#7A7A7A" }}>{specLine}</p>}
        <p className="font-bold text-sm" style={{ color: BRONZE }}>${product.price && product.price.toLocaleString()}</p>
      </div>
    </Link>
  );
}

function BuilderCard({ builder }) {
  return (
    <Link
      to={createPageUrl("BuilderProfile?id=" + builder.id)}
      className="group flex gap-5 items-start p-6 border transition-all"
      style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = NAVY}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#E0DDD8"}
    >
      {builder.avatar_url ? (
        <img
          src={builder.avatar_url}
          alt={builder.business_name || builder.display_name}
          className="w-16 h-16 object-cover flex-shrink-0"
          style={{ borderRadius: 2 }}
        />
      ) : (
        <div className="w-16 h-16 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EEF1F7", borderRadius: 2 }}>
          <User className="w-7 h-7" style={{ color: NAVY }} strokeWidth={1.5} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-sm mb-1 truncate" style={{ color: "#1A1A1A" }}>{builder.business_name || builder.display_name}</h3>
        {builder.location && (
          <p className="text-xs flex items-center gap-1 mb-2" style={{ color: "#7A7A7A" }}>
            <MapPin className="w-3 h-3 flex-shrink-0" />{builder.location}
          </p>
        )}
        {builder.bio && (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#5A5A5A" }}>{builder.bio}</p>
        )}
        <div className="mt-3 text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: NAVY }}>
          View instruments <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </Link>
  );
}