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
  const [buildStory, setBuildStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [builderModalOpen, setBuilderModalOpen] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    let prods = [], bldrs = [], buildUpdates = [], workshopPosts = [], approvedBuilders = [];
    try {
      [prods, bldrs, buildUpdates, workshopPosts, approvedBuilders] = await Promise.all([
        base44.entities.Product.filter({ status: "available" }, "-created_date", 30),
        base44.entities.UserProfile.filter({ is_seller: true, is_featured: true, is_approved: true }, "-created_date", 4),
        base44.entities.BuildUpdate.filter({ is_public: true }, "-created_date", 50),
        base44.entities.WorkshopPost.filter({ is_public: true }, "-created_date", 50),
        base44.entities.UserProfile.filter({ is_seller: true, is_approved: true }, "-created_date", 200),
      ]);
    } catch {
      setLoading(false);
      return;
    }

    // Only show products from approved builders
    const approvedBuilderIds = new Set(approvedBuilders.map(b => b.id));
    // Enforce limited visibility rule: only show listings eligible for discovery surfaces
    const discoverable = prods.filter(p =>
      approvedBuilderIds.has(p.builder_id) && (
        p.builder_approved_marketplace_hero === true ||
        p.hero_processing_status === "approved_by_builder" ||
        p.listing_visibility_state === "full_visibility"
      )
    );

    // Featured or most recent instruments
    const featuredFirst = discoverable.filter(p => p.is_featured);
    setFeatured(featuredFirst.length >= 4 ? featuredFirst.slice(0, 6) : discoverable.slice(0, 6));
    setBuilders(bldrs);

    // Pick one editorial build story (prefer BuildUpdate with photo)
    const storyCandidate = buildUpdates.find(u => u.photo_urls?.[0]);
    if (storyCandidate) {
      setBuildStory({
        photo_url: storyCandidate.photo_urls[0],
        title: storyCandidate.title,
        builder_name: storyCandidate.builder_name,
        builder_slug: storyCandidate.builder_slug,
        builder_id: storyCandidate.builder_id,
        tag: storyCandidate.tag,
        description: storyCandidate.description,
      });
    }

    // Live craft feed
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

  // Hero instrument image — best available from featured products
  const heroProduct = featured[0] || null;

  return (
    <div style={{ backgroundColor: "#F7F6F3", color: "#1F1F1F" }} className="min-h-screen">

      {/* ── 1. HERO ── */}
      <section style={{ background: "linear-gradient(180deg, #F2F0EA 0%, #F7F6F3 100%)" }} className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: text */}
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight mb-6" style={{ color: "#1A1A1A" }}>
                Play Something<br />Different.
              </h1>
              <p className="text-lg sm:text-xl mb-10 leading-relaxed" style={{ color: "#3D3D3D" }}>
                Discover exceptional handcrafted instruments from independent builders — in a modern marketplace that brings instrument lovers and makers together around a shared passion for craft.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-10">
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
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                {["Independent Builders", "Ready-to-Ship Instruments", "Custom Builds Available", "Secure Checkout"].map(signal => (
                  <div key={signal} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#4A5566" }}>
                    <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#27AE60" }} />
                    {signal}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: featured instrument image */}
            <div className="relative hidden lg:block">
              <div className="overflow-hidden" style={{ aspectRatio: "3/4", backgroundColor: "#EBEBEB" }}>
                {(heroProduct?.processed_hero_image_url || heroProduct?.image_urls?.[0]) ? (
                  <img
                    src={heroProduct.processed_hero_image_url || heroProduct.image_urls[0]}
                    alt={heroProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1559863438-e69c0d3a5a8a?auto=format&fit=crop&q=80&w=800"
                    alt="Handcrafted instrument"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              {/* Micro label */}
              <div
                className="absolute bottom-4 left-4 right-4 flex items-end justify-between"
              >
                <span className="text-xs font-semibold px-3 py-1.5 backdrop-blur-sm"
                  style={{ backgroundColor: "rgba(255,255,255,0.88)", color: NAVY }}>
                  {heroProduct ? `${heroProduct.name} — $${heroProduct.price?.toLocaleString()}` : "Built by independent makers"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. FEATURED BUILDS ── */}
      <section className="py-16 border-t" style={{ borderColor: "#E3E0D8", backgroundColor: "#FFFFFF" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#8A8A8A" }}>Instruments Available Now</p>
              <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: "#1A1A1A" }}>Ready to ship. Ready to play.</h2>
              <p className="text-sm" style={{ color: "#5A5A5A" }}>Completed instruments from independent builders, available for purchase today.</p>
            </div>
            <Link to={createPageUrl("Catalog")} className="text-sm font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity hidden sm:flex flex-shrink-0 ml-8 mt-1" style={{ color: NAVY }}>
              Browse all instruments <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="mb-3" style={{ aspectRatio: "4/3", backgroundColor: "#EBEBEB" }} />
                  <div className="h-3 rounded w-3/4 mb-2" style={{ backgroundColor: "#EBEBEB" }} />
                  <div className="h-3 rounded w-1/2" style={{ backgroundColor: "#EBEBEB" }} />
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="py-16 text-center text-sm" style={{ color: "#9A9A9A" }}>
              No instruments listed yet.{" "}
              <Link to={createPageUrl("Catalog")} className="font-semibold underline" style={{ color: NAVY }}>Browse all</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          <div className="mt-6 sm:hidden">
            <Link to={createPageUrl("Catalog")} className="text-sm font-semibold flex items-center gap-1" style={{ color: NAVY }}>
              Browse all instruments <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. TRUST / BUYER PROTECTION ── */}
      <section className="py-20 border-t" style={{ backgroundColor: "#F2F0EA", borderColor: "#E3E0D8" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-5 tracking-tight" style={{ color: NAVY }}>
              A Better Way to Buy and Build.
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#3D3D3D" }}>
              Stringed Collective gives you the trusted online shopping experience you expect from major retailers, with access to unique instruments from boutique builders around the world — supported by clear order details, organized communication, and platform support behind every purchase.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: Lock, title: "A modern marketplace experience", text: "Browse listings, review details, place orders, manage payments, and follow shipment steps through one organized platform." },
              { icon: CreditCard, title: "Access to independent builders", text: "Discover ready-to-ship and custom instruments from boutique makers whose work is often found through word of mouth, social media, or small communities." },
              { icon: CheckCircle, title: "Support behind every order", text: "Stringed Collective provides the marketplace layer between buyer and builder, helping manage order records, payment milestones, shipping steps, and issue resolution when needed." },
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

      {/* ── 4. BUILD STORY FROM THE BENCH ── */}
      <section className="py-20 border-t" style={{ borderColor: "#E3E0D8", backgroundColor: "#FAF9F7" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#8A8A8A" }}>From The Bench</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12" style={{ color: "#1A1A1A" }}>
            A Build In Progress.
          </h2>

          {buildStory ? (
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="overflow-hidden" style={{ aspectRatio: "4/3", backgroundColor: "#EBEBEB" }}>
                <img src={buildStory.photo_url} alt={buildStory.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1" style={{ color: "#1A1A1A" }}>{buildStory.title}</h3>
                <p className="text-sm font-medium mb-4" style={{ color: "#7A7A7A" }}>by {buildStory.builder_name}</p>
                {buildStory.tag && (
                  <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: AMBER }}>
                    Currently in {buildStory.tag}.
                  </p>
                )}
                {buildStory.description && (
                  <p className="text-base leading-relaxed mb-8" style={{ color: "#4A4A4A" }}>
                    {buildStory.description}
                  </p>
                )}
                <Link
                  to={createPageUrl("BuilderProfile?id=" + buildStory.builder_id)}
                  className="inline-flex items-center gap-2 font-semibold text-sm transition-opacity hover:opacity-70"
                  style={{ color: NAVY }}
                >
                  Follow the Build <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            // Placeholder when no build story exists
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="overflow-hidden" style={{ aspectRatio: "4/3", backgroundColor: "#EBEBEB" }}>
                <img
                  src="https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80"
                  alt="Instrument being built"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1" style={{ color: "#1A1A1A" }}>Walnut Short Scale Bass</h3>
                <p className="text-sm font-medium mb-4" style={{ color: "#7A7A7A" }}>by Rivertown Guitars</p>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: AMBER }}>Currently in Neck Carving.</p>
                <p className="text-base leading-relaxed mb-8" style={{ color: "#4A4A4A" }}>
                  Follow this instrument from wood selection to final setup — every step documented by the builder.
                </p>
                <Link
                  to={createPageUrl("FromTheBench")}
                  className="inline-flex items-center gap-2 font-semibold text-sm transition-opacity hover:opacity-70"
                  style={{ color: NAVY }}
                >
                  Explore From The Bench <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 5. FEATURED BUILDERS ── */}
      <section className="py-20 border-t" style={{ backgroundColor: "#FFFFFF", borderColor: "#E3E0D8" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#8A8A8A" }}>The Builders</p>
              <h2 className="text-3xl font-bold tracking-tight" style={{ color: NAVY }}>Independent makers.<br />Verified craft.</h2>
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

      {/* ── 6. LIVE CRAFT FEED ── */}
      {false && (benchPosts.length > 0 || loading) && (
        <section className="py-20 border-t" style={{ borderColor: "#E3E0D8", backgroundColor: "#F2F0EA" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#8A8A8A" }}>On The Bench Right Now</p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>Live from the shop.</h2>
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
                {benchPosts.map(post => <BenchMiniCard key={post.id} post={post} />)}
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

      {/* ── 7. BUILDER CTA ── */}
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
  const [hovered, setHovered] = useState(false);
  const specs = product.specifications || {};
  const specParts = [
    specs.instrumentCategory === "Other" ? specs.otherInstrumentCategory : specs.instrumentCategory,
    specs.topWood === "Other" ? specs.otherTopWood : specs.topWood,
    specs.scaleLength ? `${specs.scaleLength}"` : null,
  ].filter(Boolean);

  return (
    <Link
      to={createPageUrl("ProductDetail?id=" + product.id)}
      className="group block no-underline transition-all duration-200"
      style={{
        backgroundColor: "#FFFFFF",
        boxShadow: hovered ? "0 6px 24px rgba(27,43,75,0.1)" : "none",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3", backgroundColor: "#EBEBEB" }}>
        {(product.processed_hero_image_url || product.image_urls?.[0]) ? (
          <img
            src={product.processed_hero_image_url || product.image_urls[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Guitar className="w-12 h-12" style={{ color: "#CCCCCC" }} />
          </div>
        )}
        <span className="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 text-white" style={{ backgroundColor: "#27AE60" }}>
          Ready to Ship
        </span>
        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-end justify-center pb-3 transition-opacity duration-200"
          style={{ opacity: hovered ? 1 : 0, background: "linear-gradient(to top, rgba(27,43,75,0.55) 0%, transparent 60%)" }}
        >
          <span className="text-white text-xs font-semibold flex items-center gap-1">
            View Instrument <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
      <div className="pt-3 pb-1 px-0.5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-sm leading-snug" style={{ color: "#1A1A1A" }}>{product.name}</h3>
          <span className="font-bold text-sm flex-shrink-0" style={{ color: AMBER }}>${product.price?.toLocaleString()}</span>
        </div>
        {specParts.length > 0 && (
          <p className="text-xs mb-1" style={{ color: "#8A8A8A" }}>{specParts.join(" • ")}</p>
        )}
        {product.builder_name && (
          <p className="text-xs font-medium" style={{ color: "#5A6A7A" }}>by {product.builder_name}</p>
        )}
      </div>
    </Link>
  );
}

function BuilderCard({ builder }) {
  const [hovered, setHovered] = useState(false);
  const instrumentTypes = (builder.instrument_types_built || []).map(i =>
    i.type === "Other" && i.other_description ? i.other_description : i.type
  );

  return (
    <Link
      to={createPageUrl("BuilderProfile?id=" + builder.id)}
      className="group flex gap-5 items-start p-6 border transition-all no-underline"
      style={{ borderColor: hovered ? NAVY : "#E0DDD8", backgroundColor: "#FFFFFF" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
          <p className="text-xs flex items-center gap-1 mb-1.5" style={{ color: "#7A7A7A" }}>
            <MapPin className="w-3 h-3 flex-shrink-0" />{builder.location}
          </p>
        )}
        {instrumentTypes.length > 0 && (
          <p className="text-xs mb-2" style={{ color: "#4A5566" }}>{instrumentTypes.join(" • ")}</p>
        )}
        <div className="text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: NAVY }}>
          View Builder <ArrowRight className="w-3 h-3" />
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
      className="block overflow-hidden bg-white border border-stone-200 transition-all duration-200 no-underline"
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
            <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EEF1F7", color: NAVY, fontSize: "0.55rem" }}>
              <span className="font-bold">{(post.builder_name || "B")[0].toUpperCase()}</span>
            </div>
          )}
          <span className="text-xs font-medium truncate" style={{ color: NAVY }}>{post.builder_name}</span>
        </div>
        {relativeTime && <p className="text-xs text-stone-400 mt-0.5">{relativeTime}</p>}
      </div>
    </Link>
  );
}