import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ArrowRight, Guitar, Lock, CreditCard, CheckCircle, MapPin, User, Hammer, Check } from "lucide-react";
import BuilderAccountFormModal from "../components/builder/BuilderAccountFormModal";
import { formatDistanceToNow } from "date-fns";

const NAVY = "#2F3E55";
const AMBER = "#C57A1F";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [builders, setBuilders] = useState([]);
  const [benchPosts, setBenchPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [builderModalOpen, setBuilderModalOpen] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [prods, bldrs, buildUpdates, workshopPosts] = await Promise.all([
      base44.entities.Product.filter({ is_featured: true, status: "available" }, "-created_date", 8),
      base44.entities.UserProfile.filter({ is_seller: true, is_featured: true }, "-created_date", 6),
      base44.entities.BuildUpdate.filter({ is_public: true }, "-created_date", 50),
      base44.entities.WorkshopPost.filter({ is_public: true }, "-created_date", 50),
    ]);
    setFeatured(prods);
    setBuilders(bldrs);

    const combined = [
      ...buildUpdates.map(u => ({
        id: "bu_" + u.id,
        builder_id: u.builder_id,
        builder_name: u.builder_name,
        builder_avatar_url: u.builder_avatar_url,
        photo_url: u.photo_urls?.[0] || null,
        caption: u.description || u.title || null,
        tag: u.tag || null,
        created_date: u.created_date,
      })),
      ...workshopPosts.map(p => ({
        id: "wp_" + p.id,
        builder_id: p.builder_id,
        builder_name: p.builder_name,
        builder_avatar_url: null,
        photo_url: p.photo_url || null,
        caption: p.caption || null,
        tag: p.tags?.[0] || null,
        created_date: p.created_date,
      })),
    ]
      .filter(p => p.photo_url)
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 6);

    setBenchPosts(combined);
    setLoading(false);
  }

  return (
    <div style={{ backgroundColor: "#F7F6F3", color: "#1F1F1F" }} className="min-h-screen">

      {/* ── 1. HERO ── */}
      <section style={{ background: "linear-gradient(180deg, #F2F0EA 0%, #F7F6F3 100%)" }} className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="max-w-3xl mb-14">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight mb-6" style={{ color: "#1A1A1A" }}>
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

          {/* Trust Signal Strip */}
          <div className="flex flex-wrap gap-x-8 gap-y-2 pb-4 border-b border-stone-200 mb-12">
            {["Verified Builders", "Secure Payments", "Buyer Protection", "Custom Builds Available"].map(signal => (
              <div key={signal} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#4A5566" }}>
                <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#27AE60" }} />
                {signal}
              </div>
            ))}
          </div>

          {/* Instruments Available Now */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.13em", textTransform: "uppercase", color: "#5A5A5A" }}>
                Instruments Available Now
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

      {/* ── 2. BUILD SOMETHING PERSONAL ── */}
      <section className="py-20 border-t" style={{ borderColor: "#E3E0D8", backgroundColor: "#FAF9F7" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#8A8A8A" }}>Custom Builds</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5" style={{ color: "#1A1A1A" }}>
                Build Something Personal.
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{ color: "#4A4A4A" }}>
                Work directly with independent builders to create an instrument tailored to your specs, style, and sound.
              </p>
              <Link
                to={createPageUrl("Builders") + "?custom=1"}
                className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 text-sm text-white transition-colors"
                style={{ backgroundColor: AMBER }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#a8661a"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = AMBER}
              >
                <Hammer className="w-4 h-4" /> Find a Custom Builder
              </Link>
            </div>

            {/* Process image grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl overflow-hidden col-span-2" style={{ aspectRatio: "16/7", backgroundColor: "#EBEBEB" }}>
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
                  alt="Tonewood selection"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-xl overflow-hidden" style={{ aspectRatio: "4/3", backgroundColor: "#EBEBEB" }}>
                <img
                  src="https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&q=80"
                  alt="Neck carving"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-xl overflow-hidden" style={{ aspectRatio: "4/3", backgroundColor: "#EBEBEB" }}>
                <img
                  src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80"
                  alt="Workshop finishing"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. ON THE BENCH RIGHT NOW ── */}
      {(benchPosts.length > 0 || loading) && (
        <section className="py-20 border-t" style={{ borderColor: "#E3E0D8", backgroundColor: "#F2F0EA" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#8A8A8A" }}>From The Bench</p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
                  On The Bench Right Now.
                </h2>
              </div>
              <Link to={createPageUrl("FromTheBench")} className="hidden sm:flex items-center gap-1 text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: NAVY }}>
                Explore From The Bench <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-base mb-10" style={{ color: "#4A4A4A" }}>
              See what independent builders are working on in their shops right now.
            </p>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl bg-stone-300" style={{ aspectRatio: "3/4" }} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {benchPosts.map(post => (
                  <BenchMiniCard key={post.id} post={post} />
                ))}
              </div>
            )}

            <div className="mt-8 sm:hidden">
              <Link to={createPageUrl("FromTheBench")} className="text-sm font-semibold flex items-center gap-1" style={{ color: NAVY }}>
                Explore From The Bench <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── 4. BUY & BUILD WITH CONFIDENCE ── */}
      <section className="py-20 border-t" style={{ backgroundColor: "#F2F0EA", borderColor: "#E3E0D8" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-5 tracking-tight" style={{ color: NAVY }}>
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
              { icon: Lock, title: "Buyer funds protected", text: "Your payment is held securely and only released when your instrument is confirmed received." },
              { icon: CreditCard, title: "Builder payments guaranteed", text: "Builders receive payment reliably — no chargebacks, no surprises, no platform delays." },
              { icon: CheckCircle, title: "Secure, transparent checkout", text: "Every step of the transaction is visible to both parties from purchase to delivery." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex flex-col gap-4">
                <div className="w-8 h-8 flex items-center justify-center" style={{ color: NAVY }}>
                  <Icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-base mb-2 font-semibold" style={{ color: NAVY }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#4A4A4A" }}>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. INDEPENDENT MAKERS ── */}
      <section className="py-20 border-t" style={{ backgroundColor: "#FFFFFF", borderColor: "#E3E0D8" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: "#6B6B6B" }}>The Builders</h2>
              <h3 className="text-3xl font-bold tracking-tight" style={{ color: NAVY }}>Independent makers.<br />Verified craft.</h3>
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
                <button onClick={() => setBuilderModalOpen(true)} className="font-semibold underline" style={{ color: NAVY }}>Be the first</button>
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

      {/* ── 6. SELL WITH CONFIDENCE ── */}
      <section className="py-16" style={{ backgroundColor: "#2F3E55" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">Sell with confidence.</h2>
              <p className="text-base leading-relaxed" style={{ color: "#C8D4E4" }}>
                We protect every transaction so you can focus on building. Get paid reliably. Reach serious players.
              </p>
            </div>
            <div className="sm:text-right">
              <button
                onClick={() => setBuilderModalOpen(true)}
                className="inline-block font-semibold px-8 py-4 text-sm tracking-wide transition-colors"
                style={{ color: NAVY, backgroundColor: "#FFFFFF" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#EEF1F7"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#FFFFFF"; }}
              >
                Apply as a Founding Builder
              </button>
            </div>
          </div>
        </div>
      </section>

      {builderModalOpen && <BuilderAccountFormModal onClose={() => setBuilderModalOpen(false)} />}
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
    <Link to={createPageUrl("ProductDetail?id=" + product.id)} className="group block" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="relative overflow-hidden mb-4" style={{ aspectRatio: "4/3", backgroundColor: "#EBEBEB" }}>
        {product.image_urls?.[0] ? (
          <img
            src={product.image_urls[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500"
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Guitar className="w-12 h-12" style={{ color: "#CCCCCC" }} />
          </div>
        )}
        {/* Ready to Ship badge */}
        {product.status === "available" && (
          <span className="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#27AE60" }}>
            Ready to Ship
          </span>
        )}
      </div>
      <div className="pt-1">
        <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1B2B4B", lineHeight: 1.3, marginBottom: "2px" }}>{product.name}</h3>
        <p style={{ fontSize: "0.88rem", fontWeight: 600, color: AMBER, marginBottom: "5px" }}>${product.price?.toLocaleString()}</p>
        {specLine && <p style={{ fontSize: "0.73rem", color: "#6A7A8A", lineHeight: 1.4, marginBottom: "3px" }}>{specLine}</p>}
        {product.builder_name && (
          <p style={{ fontSize: "0.78rem", fontWeight: 500, color: "#7A8A9A" }}>By {product.builder_name}</p>
        )}
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
        <img src={builder.avatar_url} alt={builder.business_name || builder.display_name} className="w-16 h-16 object-cover flex-shrink-0" style={{ borderRadius: 2 }} />
      ) : (
        <div className="w-16 h-16 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#F2F0EA", borderRadius: 2 }}>
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

function BenchMiniCard({ post }) {
  const [hovered, setHovered] = useState(false);
  const relativeTime = post.created_date
    ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true })
    : null;

  return (
    <Link
      to={createPageUrl("BuilderProfile?id=" + post.builder_id)}
      className="block rounded-xl overflow-hidden bg-white border border-stone-200 transition-all duration-200 no-underline"
      style={{ boxShadow: hovered ? "0 6px 20px rgba(0,0,0,0.10)" : "0 1px 3px rgba(0,0,0,0.06)", transform: hovered ? "translateY(-2px)" : "translateY(0)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden bg-stone-100" style={{ aspectRatio: "3/4" }}>
        <img src={post.photo_url} alt={post.caption || ""} className="w-full h-full object-cover" />
        <div className="absolute inset-0 transition-opacity duration-200" style={{ opacity: hovered ? 1 : 0, background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)" }}>
          <span className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold text-center">View Builder</span>
        </div>
      </div>
      <div className="px-3 py-2.5">
        {post.tag && <p className="text-xs font-semibold truncate mb-0.5" style={{ color: "#7B5EA7" }}>{post.tag}</p>}
        {post.caption && <p className="text-xs text-stone-600 line-clamp-2 leading-snug mb-1.5">{post.caption}</p>}
        <div className="flex items-center gap-1.5">
          {post.builder_avatar_url ? (
            <img src={post.builder_avatar_url} className="w-4 h-4 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ backgroundColor: "#EEF1F7", color: NAVY, fontSize: "0.55rem" }}>
              {(post.builder_name || "B")[0].toUpperCase()}
            </div>
          )}
          <span className="text-xs font-medium truncate" style={{ color: NAVY }}>{post.builder_name}</span>
        </div>
        {relativeTime && <p className="text-xs text-stone-400 mt-0.5">{relativeTime}</p>}
      </div>
    </Link>
  );
}