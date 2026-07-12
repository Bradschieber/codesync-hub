import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Guitar, Star, ChevronLeft, Quote, Hammer, MessageSquare, X, Check, PlayCircle, ArrowRight
} from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import RequestQuoteModal from "../components/builder/RequestQuoteModal";
import StorefrontHeader from "../components/builder/StorefrontHeader";
import StorefrontPolicies from "../components/builder/StorefrontPolicies";
import StorefrontInsideWorkshop from "../components/builder/StorefrontInsideWorkshop";
import StorefrontOnTheBench from "../components/builder/StorefrontOnTheBench";

export default function BuilderProfile() {
  const [builder, setBuilder] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [orderCount, setOrderCount] = useState(0);
  const [references, setReferences] = useState([]);
  const [user, setUser] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const builderId = params.get("id");

  useEffect(() => { loadAll(); }, [builderId]);

  async function loadAll() {
    if (!builderId) return;
    try { const u = await base44.auth.me(); setUser(u); } catch {}
    const [bldrs, prods, revs, refs, orders] = await Promise.all([
      base44.entities.UserProfile.filter({ id: builderId }),
      base44.entities.Product.filter({ builder_id: builderId, status: "available" }),
      base44.entities.BuilderReview.filter({ builder_id: builderId }),
      base44.entities.BuilderReference.filter({ builder_id: builderId, status: "verified" }),
      base44.entities.Order.filter({ builder_id: builderId, status: "delivered" }),
    ]);
    if (bldrs.length > 0 && bldrs[0].is_approved) setBuilder(bldrs[0]);
    setProducts(prods);
    setReviews(revs);
    setReferences(refs);
    setOrderCount(orders.length);
    setLoading(false);
  }

  async function toggleSave() {
    if (!user) { base44.auth.redirectToLogin(); return; }
    if (saved) {
      const items = await base44.entities.SavedBuilder.filter({ user_id: user.id, builder_id: builderId });
      if (items.length > 0) await base44.entities.SavedBuilder.delete(items[0].id);
      setSaved(false);
    } else {
      await base44.entities.SavedBuilder.create({ user_id: user.id, builder_id: builderId, builder_name: builder?.business_name || builder?.display_name });
      setSaved(true);
    }
  }

  if (loading) return (
    <div className="min-h-screen animate-pulse" style={{ backgroundColor: "#F7F6F3" }}>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="h-6 rounded w-32 mb-8 bg-stone-200" />
        <div className="h-56 rounded-2xl mb-6 bg-stone-200" />
        <div className="h-32 rounded-2xl bg-stone-100" />
      </div>
    </div>
  );

  if (!builder) return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-500">Builder not found.</p>
      <Link to={createPageUrl("Builders")} className="font-semibold underline mt-2 block text-sm" style={{ color: "#2F3E55" }}>Back to Builders</Link>
    </div>
  );

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  // Featured instrument: marked featured first, else most recent
  const featuredProduct = products.find(p => p.is_featured) || products[0];
  const displayProducts = products.slice(0, 6);
  const hasMoreProducts = products.length > 6;

  return (
    <div style={{ backgroundColor: "#F7F6F3", minHeight: "100vh" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Back */}
        <Link to={createPageUrl("Builders")} className="inline-flex items-center gap-1 text-sm font-medium mb-6 transition-colors" style={{ color: "#6A6A6A" }}>
          <ChevronLeft className="w-4 h-4" /> Back to Builders
        </Link>

        {/* 1. Hero + Builder Facts */}
        <StorefrontHeader
          builder={builder}
          avgRating={avgRating}
          reviewCount={reviews.length}
          orderCount={orderCount}
          saved={saved}
          onToggleSave={toggleSave}
          onContact={() => setShowContactForm(true)}
          onRequestQuote={() => setShowQuoteModal(true)}
        />

        {/* 2. Inside the Workshop */}
        <StorefrontInsideWorkshop builder={builder} />

        {/* 3. On The Bench */}
        <StorefrontOnTheBench builderId={builder.id} />

        {/* 4. Featured Instrument */}
        {featuredProduct && (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden mb-6">
            <div className="px-6 pt-6 pb-2">
              <h2 className="text-base font-bold text-stone-800">Featured Instrument</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-0">
              <div className="sm:w-1/2 bg-stone-100 overflow-hidden" style={{ aspectRatio: "4/3" }}>
                {(featuredProduct.processed_hero_image_url || featuredProduct.image_urls?.[0]) ? (
                  <img src={featuredProduct.processed_hero_image_url || featuredProduct.image_urls[0]} alt={featuredProduct.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Guitar className="w-12 h-12 text-stone-300" />
                  </div>
                )}
              </div>
              <div className="sm:w-1/2 p-6 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-stone-900 mb-2">{featuredProduct.name}</h3>
                {featuredProduct.description && (
                  <p className="text-sm text-stone-500 leading-relaxed mb-4 line-clamp-3">{featuredProduct.description}</p>
                )}
                <p className="text-2xl font-bold mb-5" style={{ color: "#1B2B4B" }}>${featuredProduct.price?.toLocaleString()}</p>
                <Link
                  to={createPageUrl("ProductDetail?id=" + featuredProduct.id)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors self-start"
                  style={{ backgroundColor: "#2F3E55" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#243349"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "#2F3E55"}
                >
                  View Instrument <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 5. Instruments Currently Available */}
        {products.length > 0 && (
          <div id="instruments-section" className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-stone-800">Instruments Currently Available</h2>
              {hasMoreProducts && (
                <span className="text-xs text-stone-500">{products.length} listings</span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayProducts.map(p => (
                <Link
                  key={p.id}
                  to={createPageUrl("ProductDetail?id=" + p.id)}
                  className="group block bg-white rounded-xl border border-stone-200 overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="relative overflow-hidden bg-stone-100" style={{ aspectRatio: "4/3" }}>
                    {(p.processed_hero_image_url || p.image_urls?.[0]) ? (
                      <img src={p.processed_hero_image_url || p.image_urls[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Guitar className="w-10 h-10 text-stone-300" /></div>
                    )}
                    <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      Ready to Ship
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-1 text-stone-900">{p.name}</h3>
                    <p className="font-bold text-sm" style={{ color: "#1B2B4B" }}>${p.price?.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
            {hasMoreProducts && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => document.getElementById("instruments-section")?.scrollIntoView({ behavior: "smooth" })}
                  className="text-sm font-semibold underline transition-colors"
                  style={{ color: "#2F3E55" }}
                >
                  View All {products.length} Instruments
                </button>
              </div>
            )}
          </div>
        )}

        {/* 6. Custom Builds */}
        {builder.offers_custom_builds && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Hammer className="w-5 h-5" style={{ color: "#2F3E55" }} />
              <h2 className="text-base font-bold text-stone-800">Custom Builds</h2>
            </div>
            {builder.custom_build_description && (
              <p className="text-sm text-stone-600 leading-relaxed mb-4">{builder.custom_build_description}</p>
            )}
            <div className="flex flex-wrap gap-4 mb-5">
              {builder.typical_build_time && (
                <div className="text-sm">
                  <span className="font-semibold text-stone-700">Typical Timeline:</span>
                  <span className="text-stone-500 ml-1">{builder.typical_build_time}</span>
                </div>
              )}
              {builder.deposit_required && (
                <div className="text-sm">
                  <span className="font-semibold text-stone-700">Deposit:</span>
                  <span className="text-stone-500 ml-1">
                    {builder.deposit_type === "percent" && builder.deposit_percent
                      ? `${builder.deposit_percent}%`
                      : builder.deposit_fixed_amount
                      ? `$${builder.deposit_fixed_amount.toLocaleString()}`
                      : "Required"}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowQuoteModal(true)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: "#1B2B4B" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1B2B4B"}
            >
              <Hammer className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Request Custom Build
            </button>
            <p className="text-xs text-stone-400 mt-2">Share your specs and discuss details with the builder through Stringed Collective.</p>
          </div>
        )}

        {/* 7. Reviews */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-stone-800 mb-4">
            Reviews {reviews.length > 0 && <span className="text-stone-400 font-normal text-sm">({reviews.length})</span>}
          </h2>
          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center">
              <p className="text-sm font-medium text-stone-600 mb-1">This builder is new to Stringed Collective.</p>
              <p className="text-sm text-stone-400">All purchases are protected through the Stringed Collective transaction guarantee.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="p-5 border border-stone-200 rounded-xl bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-stone-900">{r.reviewer_name}</span>
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(n => <Star key={n} className="w-4 h-4" style={{ color: n <= r.rating ? "#D4AC0D" : "#DDDDDD", fill: n <= r.rating ? "#D4AC0D" : "none" }} />)}</div>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-600">{r.review_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Supplemental Accordion: Video, References, Policies */}
        <Accordion type="multiple" className="mb-8 space-y-2">
          {builder.introduction_video_url && (
            <AccordionItem value="intro-video" className="bg-white border border-stone-200 rounded-2xl px-6 overflow-hidden">
              <AccordionTrigger className="text-base font-bold text-stone-800 py-5 hover:no-underline">
                <span className="flex items-center gap-2"><PlayCircle className="w-5 h-5" style={{ color: "#2F3E55" }} /> Meet the Builder</span>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                {builder.introduction_video_url.includes("youtube.com") || builder.introduction_video_url.includes("youtu.be") || builder.introduction_video_url.includes("vimeo.com") ? (
                  <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%" }}>
                    <iframe
                      src={
                        builder.introduction_video_url.includes("youtu.be")
                          ? builder.introduction_video_url.replace("youtu.be/", "www.youtube.com/embed/")
                          : builder.introduction_video_url.includes("watch?v=")
                          ? builder.introduction_video_url.replace("watch?v=", "embed/")
                          : builder.introduction_video_url
                      }
                      className="absolute inset-0 w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <video src={builder.introduction_video_url} controls className="w-full rounded-xl max-h-96 bg-black" />
                )}
              </AccordionContent>
            </AccordionItem>
          )}

          {references.length > 0 && (
            <AccordionItem value="references" className="bg-white border border-stone-200 rounded-2xl px-6 overflow-hidden">
              <AccordionTrigger className="text-base font-bold text-stone-800 py-5 hover:no-underline">Verified Buyer References</AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  {references.map(ref => (
                    <div key={ref.id} className="p-4 bg-stone-50 rounded-xl">
                      <Quote className="w-4 h-4 mb-2 text-stone-300" />
                      <p className="text-sm italic leading-relaxed mb-3 text-stone-600">"{ref.quote}"</p>
                      <p className="text-sm font-semibold text-stone-800">— {ref.buyer_name}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {(builder.warranty_duration || builder.returns_accepted || builder.shipping_timeline || builder.ships_domestically || builder.ships_internationally || builder.payment_schedule) && (
            <AccordionItem value="policies" className="bg-white border border-stone-200 rounded-2xl px-6 overflow-hidden">
              <AccordionTrigger className="text-base font-bold text-stone-800 py-5 hover:no-underline">Policies &amp; Commitment</AccordionTrigger>
              <AccordionContent className="pb-6">
                <StorefrontPolicies builder={builder} />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

      </div>

      {showContactForm && <ContactModal builder={builder} user={user} onClose={() => setShowContactForm(false)} />}
      {showQuoteModal && <RequestQuoteModal builder={builder} user={user} onClose={() => setShowQuoteModal(false)} />}
    </div>
  );
}

function ContactModal({ builder, user, onClose }) {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    if (!user) { base44.auth.redirectToLogin(); return; }
    await base44.entities.Message.create({
      sender_id: user.id,
      sender_name: user.full_name,
      recipient_id: builder.id,
      recipient_name: builder.business_name || builder.display_name,
      subject: `Message from ${user.full_name}`,
      body: msg,
    });
    setSent(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md shadow-2xl rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-stone-900">Contact {builder.business_name || builder.display_name}</h3>
          <button onClick={onClose} className="hover:opacity-60 transition-opacity"><X className="w-5 h-5 text-stone-500" /></button>
        </div>
        {sent ? (
          <div className="text-center py-8">
            <Check className="w-10 h-10 mx-auto mb-3 text-green-500" />
            <p className="font-medium text-sm mb-5 text-stone-900">Message sent successfully.</p>
            <button onClick={onClose} className="text-sm font-semibold transition-colors" style={{ color: "#2F3E55" }}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            <textarea
              value={msg}
              onChange={e => setMsg(e.target.value)}
              rows={5}
              required
              placeholder="Write your message..."
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none text-stone-900"
            />
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 border border-stone-200 rounded-lg py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors" style={{ backgroundColor: "#1B2B4B" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1B2B4B"}>Send Message</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}