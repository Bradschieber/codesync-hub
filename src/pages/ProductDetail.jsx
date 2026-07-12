import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Guitar, Star, ChevronLeft, ShoppingCart, MapPin, Check,
  ArrowRight, MessageSquare, Shield, Lock, Truck, ChevronDown, ChevronUp, User
} from "lucide-react";
import SpecificationsDisplay from "../components/marketplace/SpecificationsDisplay";
import BuilderBadges from "../components/builder/BuilderBadges";
import ImageLightbox from "../components/marketplace/ImageLightbox";

const AMBER = "#C57A1F";
const NAVY = "#1B2B4B";
const SLATE = "#1B2B4B";
const WALNUT = "#3B2F2A";

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [builder, setBuilder] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  useEffect(() => { loadAll(); }, [productId]);

  async function loadAll() {
    if (!productId) return;
    try { const u = await base44.auth.me(); setUser(u); } catch {}
    const prod = await base44.entities.Product.filter({ id: productId });
    if (prod.length > 0) {
      const p = prod[0];
      setProduct(p);
      const [bldrs, revs] = await Promise.all([
        base44.entities.UserProfile.filter({ id: p.builder_id }),
        base44.entities.BuilderReview.filter({ product_id: productId }),
      ]);
      if (bldrs.length > 0) setBuilder(bldrs[0]);
      setReviews(revs);
    }
    setLoading(false);
  }

  async function addToCart() {
    if (!user) { base44.auth.redirectToLogin(); return; }
    await base44.entities.CartItem.create({
      user_id: user.id,
      product_id: product.id,
      product_name: product.name,
      product_image: product.image_urls?.[0] || "",
      product_price: product.price,
      builder_name: product.builder_name,
      quantity: 1,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  }

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-square bg-stone-200 rounded-2xl" />
        <div className="space-y-4 pt-4">
          <div className="h-4 bg-stone-200 rounded w-1/3" />
          <div className="h-8 bg-stone-200 rounded w-3/4" />
          <div className="h-10 bg-stone-200 rounded w-1/3" />
          <div className="h-24 bg-stone-100 rounded" />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="max-w-6xl mx-auto px-4 py-20 text-center">
      <Guitar className="w-16 h-16 text-stone-300 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-stone-600">Product not found</h2>
      <Link to={createPageUrl("Catalog")} className="mt-4 inline-block hover:underline" style={{ color: "#333333" }}>Back to Catalog</Link>
    </div>
  );

  // Build gallery: processed hero first (if available), then all original photos/videos
  const originalImages = product.image_urls || [];
  const processedHero = product.processed_hero_image_url || null;
  const galleryImages = processedHero
    ? [processedHero, ...originalImages]
    : originalImages;
  const storyContent = product.about_this_build || product.description;
  const specs = product.specifications || {};
  const hasSpecs = Object.keys(specs).length > 0;

  return (
    <div style={{ backgroundColor: "#FFFFFF", minHeight: "100vh" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Back link */}
        <Link to={createPageUrl("Catalog")} className="inline-flex items-center gap-1 text-sm mb-8 transition-colors" style={{ color: "#6A6A6A" }}
          onMouseEnter={e => e.currentTarget.style.color = SLATE}
          onMouseLeave={e => e.currentTarget.style.color = "#6A6A6A"}>
          <ChevronLeft className="w-4 h-4" /> Back to Catalog
        </Link>

        {/* HERO — Two column */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">

          {/* Left — Image gallery */}
          <div>
            <div
              className="rounded-2xl overflow-hidden bg-stone-100 mb-3 cursor-zoom-in"
              style={{ aspectRatio: "1/1" }}
              onClick={() => galleryImages[activeImg] && setLightboxIndex(activeImg)}
            >
              {galleryImages[activeImg] ? (
                <img src={galleryImages[activeImg]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Guitar className="w-24 h-24 text-stone-300" />
                </div>
              )}
            </div>
            {galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {galleryImages.map((img, i) => (
                  <button key={i} onClick={() => { setActiveImg(i); setLightboxIndex(i); }}
                    className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all"
                    style={{ borderColor: activeImg === i ? NAVY : "transparent" }}>
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — Info */}
          <div className="flex flex-col">

            {/* Builder identity */}
            {builder && (
              <div className="mb-4">
                <Link to={createPageUrl(`BuilderProfile?id=${builder.id}`)}
                  className="text-sm font-semibold tracking-wide uppercase hover:underline"
                  style={{ color: SLATE }}>
                  {builder.business_name || builder.display_name}
                </Link>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  <BuilderBadges builder={builder} size="sm" />
                  {builder.location && (
                    <p className="flex items-center gap-1 text-xs" style={{ color: "#7A7A7A" }}>
                      <MapPin className="w-3 h-3" /> {builder.location}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold mb-3 leading-tight" style={{ color: "#1A1A1A" }}>{product.name}</h1>

            {/* Rating */}
            {product.average_rating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} className={`w-4 h-4 ${n <= Math.round(product.average_rating) ? "fill-current" : ""}`}
                    style={{ color: n <= Math.round(product.average_rating) ? "#D4AC0D" : "#D8D3CC" }} />
                ))}
                <span className="text-sm" style={{ color: "#7A7A7A" }}>{product.average_rating?.toFixed(1)} ({product.review_count} reviews)</span>
              </div>
            )}

            {/* Price */}
            <p className="text-4xl font-bold mb-5" style={{ color: NAVY }}>${product.price?.toLocaleString()}</p>

            {/* Trust signals */}
            <div className="rounded-xl border p-4 mb-5 space-y-2.5" style={{ borderColor: "#E3E0D8", backgroundColor: "#FAFAF8" }}>
              {[
                { icon: Shield, text: "Protected transaction through Stringed Collective" },
                { icon: MessageSquare, text: "Direct communication with the builder" },
                { icon: Truck, text: "Shipment verified before funds are released" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#E8F0E8" }}>
                    <Check className="w-3 h-3" style={{ color: "#3B7A57" }} />
                  </div>
                  <span className="text-xs leading-snug" style={{ color: "#4A4A4A" }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Short description */}
            {product.description && (
              <p className="text-sm leading-relaxed mb-6" style={{ color: "#5A5A5A" }}>{product.description}</p>
            )}

            {/* Local pickup */}
            {product.offers_local_pickup && (
              <p className="text-xs flex items-center gap-1 mb-4" style={{ color: "#3B7A57" }}>
                <MapPin className="w-3.5 h-3.5" /> Local pickup available
              </p>
            )}

            {/* CTAs */}
            <div className="space-y-3 mt-auto">
              {product.status === "available" ? (
                <button onClick={addToCart}
                  className="w-full flex items-center justify-center gap-2 font-semibold py-4 rounded-xl text-white text-base transition-colors"
                  style={{ backgroundColor: addedToCart ? "#3B7A57" : AMBER }}
                  onMouseEnter={e => { if (!addedToCart) e.currentTarget.style.backgroundColor = "#a8661a"; }}
                  onMouseLeave={e => { if (!addedToCart) e.currentTarget.style.backgroundColor = AMBER; }}>
                  {addedToCart ? <><Check className="w-5 h-5" /> Added to Cart!</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
                </button>
              ) : (
                <div className="w-full text-center py-4 rounded-xl font-medium" style={{ backgroundColor: "#E8E4DE", color: "#888" }}>Sold</div>
              )}

              {builder && (
                <button onClick={() => { if (!user) { base44.auth.redirectToLogin(); return; } setShowContact(true); }}
                  className="w-full flex items-center justify-center gap-2 border font-medium py-3.5 rounded-xl text-sm transition-colors"
                  style={{ borderColor: SLATE, color: SLATE, backgroundColor: "#FFFFFF" }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#F2F0EA"; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#FFFFFF"; }}>
                  <MessageSquare className="w-4 h-4" /> Message the Builder
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CUSTOM BUILD SECTION */}
        {builder && builder.offers_custom_builds && (
          <section className="rounded-xl border px-7 py-6 mb-6 bg-white flex flex-col sm:flex-row sm:items-center gap-5" style={{ borderColor: "#E3E0D8" }}>
            <div className="flex-1">
              <h3 className="text-base font-bold mb-1" style={{ color: "#2F3E55" }}>Talk to the Builder About A Custom Build</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#5A5A5A" }}>
                Interested in a version built specifically for you? This builder offers custom instruments — reach out to start a conversation or request a formal quote.
              </p>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={() => { if (!user) { base44.auth.redirectToLogin(); return; } setShowContact(true); }}
                className="flex items-center justify-center gap-2 border font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap"
                style={{ borderColor: "#2F3E55", color: "#2F3E55", backgroundColor: "#FFFFFF" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F2F0EA"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#FFFFFF"}>
                <MessageSquare className="w-4 h-4" /> Start a Custom Build Conversation
              </button>
              <Link
                to={createPageUrl(`BuilderProfile?id=${builder.id}`) + "#custom-builds"}
                className="flex items-center justify-center gap-2 border font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap"
                style={{ borderColor: "#2F3E55", color: "#2F3E55", backgroundColor: "#FFFFFF" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F2F0EA"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#FFFFFF"}>
                <ArrowRight className="w-4 h-4" /> Request a Quote
              </Link>
            </div>
          </section>
        )}

        {/* ABOUT THIS BUILD */}
        {storyContent && (
          <section className="rounded-2xl p-8 mb-10" style={{ backgroundColor: "#F2F0EA" }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: SLATE }}>About This Build</h2>
            <p className="text-base leading-8 max-w-2xl" style={{ color: "#3A3A3A" }}>{storyContent}</p>
          </section>
        )}

        {/* SPECIFICATIONS — Accordion */}
        {hasSpecs && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4" style={{ color: SLATE }}>Specifications</h2>
            <SpecificationsDisplay specs={specs} />
          </div>
        )}

        {/* PROTECTED PURCHASE */}
        <section className="rounded-2xl p-8 mb-10 border" style={{ backgroundColor: "#F2F0EA", borderColor: "#E3E0D8" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: SLATE }}>
              <Lock className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold" style={{ color: SLATE }}>Protected Purchase</h2>
          </div>
          <p className="text-sm leading-relaxed mb-5 max-w-2xl" style={{ color: "#4A4A4A" }}>
            Every instrument purchased on Stringed Collective is backed by a structured transaction process designed to protect both buyer and builder.
          </p>
          <ul className="space-y-3">
            {[
              "Secure payment processing through Stringed Collective",
              "Builders ship instruments directly to buyers",
              "Shipment is verified before builder payout is released",
              "Stringed Collective provides support if any issues arise",
            ].map(item => (
              <li key={item} className="flex items-center gap-3 text-sm" style={{ color: "#3A3A3A" }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#E8F0E8" }}>
                  <Check className="w-3 h-3" style={{ color: "#3B7A57" }} />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* REVIEWS */}
        {reviews.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-5" style={{ color: SLATE }}>Reviews ({reviews.length})</h2>
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="bg-white border rounded-xl p-5" style={{ borderColor: "#E3E0D8" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium" style={{ color: "#1A1A1A" }}>{r.reviewer_name}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} className={`w-4 h-4 ${n <= r.rating ? "fill-current" : ""}`}
                          style={{ color: n <= r.rating ? "#D4AC0D" : "#D8D3CC" }} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#5A5A5A" }}>{r.review_text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BUILDER CARD */}
        {builder && (
          <div className="rounded-2xl p-7 flex flex-col sm:flex-row gap-6 items-start" style={{ backgroundColor: WALNUT, color: "#FFFFFF" }}>
            {builder.avatar_url ? (
              <img src={builder.avatar_url} className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-white/20" />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white/20" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                <span className="font-bold text-3xl text-white">{(builder.business_name || "B")[0]}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>The Builder</p>
              <h3 className="text-xl font-bold mb-1 text-white">{builder.business_name || builder.display_name}</h3>
              {builder.location && (
                <p className="flex items-center gap-1 text-sm mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
                  <MapPin className="w-3.5 h-3.5" /> {builder.location}
                </p>
              )}
              {builder.bio && <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "rgba(255,255,255,0.75)" }}>{builder.bio}</p>}
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Link to={createPageUrl(`BuilderProfile?id=${builder.id}`)}
                className="flex items-center gap-1.5 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
                style={{ backgroundColor: NAVY }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}>
                View Profile <ArrowRight className="w-4 h-4" />
              </Link>
              <button onClick={() => { if (!user) { base44.auth.redirectToLogin(); return; } setShowContact(true); }}
                className="flex items-center justify-center gap-1.5 font-medium px-5 py-2.5 rounded-xl text-sm border border-white/30 text-white transition-colors hover:bg-white/10">
                <MessageSquare className="w-4 h-4" /> Contact
              </button>
            </div>
          </div>
        )}
      </div>

      {showContact && builder && (
        <ContactModal builder={builder} user={user} onClose={() => setShowContact(false)} />
      )}
      {lightboxIndex !== null && (
        <ImageLightbox
          images={galleryImages}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}

function ContactModal({ builder, user, onClose }) {
  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    await base44.entities.Message.create({
      sender_id: user.id,
      sender_name: user.full_name,
      recipient_id: builder.id,
      recipient_name: builder.business_name || builder.display_name,
      subject: subject || `Message from ${user.full_name}`,
      body: msg,
    });
    setSent(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-bold mb-1" style={{ color: "#1A1A1A" }}>Contact {builder.business_name || builder.display_name}</h3>
        {sent ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <p className="font-semibold text-green-700 mb-1">Message sent!</p>
            <p className="text-sm mb-4" style={{ color: "#7A7A7A" }}>The builder will get back to you soon.</p>
            <button onClick={onClose} className="text-sm hover:underline" style={{ color: "#6A6A6A" }}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-3 mt-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#7A7A7A" }}>Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)}
                placeholder={`Message from ${user?.full_name}`}
                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "#E3E0D8", outlineColor: NAVY }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#7A7A7A" }}>Message *</label>
              <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={5} required
                placeholder="Write your message..."
                className="w-full border rounded-xl p-3 text-sm focus:outline-none resize-none"
                style={{ borderColor: "#E3E0D8" }} />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 border py-2.5 rounded-xl text-sm" style={{ borderColor: "#E3E0D8", color: "#5A5A5A" }}>
                Cancel
              </button>
              <button type="submit"
                className="flex-1 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
                style={{ backgroundColor: NAVY }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}>
                Send Message
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}