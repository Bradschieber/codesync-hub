import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Guitar, Star, ChevronLeft, Quote, Hammer, MessageSquare, X, Check, PlayCircle } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import RequestQuoteModal from "../components/builder/RequestQuoteModal";
import BuilderBadges from "../components/builder/BuilderBadges";
import StorefrontHeader from "../components/builder/StorefrontHeader";
import StorefrontBrandStory from "../components/builder/StorefrontBrandStory";
import StorefrontMediaGallery from "../components/builder/StorefrontMediaGallery";
import StorefrontPolicies from "../components/builder/StorefrontPolicies";

export default function BuilderProfile() {
  const [builder, setBuilder] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [customBuilds, setCustomBuilds] = useState([]);
  const [references, setReferences] = useState([]);
  const [user, setUser] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");
  const [showContactForm, setShowContactForm] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const builderId = params.get("id");

  useEffect(() => { loadAll(); }, [builderId]);

  async function loadAll() {
    if (!builderId) return;
    try { const u = await base44.auth.me(); setUser(u); } catch {}
    const [bldrs, prods, revs, customs, refs] = await Promise.all([
      base44.entities.UserProfile.filter({ id: builderId }),
      base44.entities.Product.filter({ builder_id: builderId, status: "available" }),
      base44.entities.BuilderReview.filter({ builder_id: builderId }),
      base44.entities.CustomBuildListing.filter({ builder_id: builderId, is_published: true }),
      base44.entities.BuilderReference.filter({ builder_id: builderId, status: "verified" }),
    ]);
    if (bldrs.length > 0) setBuilder(bldrs[0]);
    setProducts(prods);
    setReviews(revs);
    setCustomBuilds(customs);
    setReferences(refs);
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
  const media = builder.media_urls || [];

  const tabs = [
    { id: "products", label: `Available Instruments (${products.length})` },
    ...(builder?.offers_custom_builds ? [{ id: "custom", label: "Custom Work" }] : []),
    { id: "reviews", label: `Reviews (${reviews.length})` },
  ];

  return (
    <div style={{ backgroundColor: "#F7F6F3", minHeight: "100vh" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Back */}
        <Link to={createPageUrl("Builders")} className="inline-flex items-center gap-1 text-sm font-medium mb-6 transition-colors" style={{ color: "#6A6A6A" }}>
          <ChevronLeft className="w-4 h-4" /> Back to Builders
        </Link>

        {/* ── STOREFRONT HEADER (banner, avatar, logo, save, contact) ── */}
        <StorefrontHeader
          builder={builder}
          avgRating={avgRating}
          reviewCount={reviews.length}
          saved={saved}
          onToggleSave={toggleSave}
          onContact={() => setShowContactForm(true)}
          onRequestQuote={() => setShowQuoteModal(true)}
        />

        {/* ── ACCORDION SECTIONS ── */}
        <Accordion type="multiple" defaultValue={["brand-story"]} className="mb-8 space-y-2">

          {/* Meet the Builder (video) */}
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

          {/* Our Story */}
          {(builder.brand_story || builder.bio) && (
            <AccordionItem value="brand-story" className="bg-white border border-stone-200 rounded-2xl px-6 overflow-hidden">
              <AccordionTrigger className="text-base font-bold text-stone-800 py-5 hover:no-underline">Our Story</AccordionTrigger>
              <AccordionContent className="pb-6">
                <StorefrontBrandStory builder={builder} />
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Shop & Craft media */}
          {media.length > 0 && (
            <AccordionItem value="media" className="bg-white border border-stone-200 rounded-2xl px-6 overflow-hidden">
              <AccordionTrigger className="text-base font-bold text-stone-800 py-5 hover:no-underline">The Shop &amp; The Craft</AccordionTrigger>
              <AccordionContent className="pb-6">
                <StorefrontMediaGallery builder={builder} media={media} />
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Custom Builds */}
          {builder.offers_custom_builds && (
            <AccordionItem id="custom-builds-section" value="custom-builds" className="bg-white border border-stone-200 rounded-2xl px-6 overflow-hidden">
              <AccordionTrigger className="text-base font-bold text-stone-800 py-5 hover:no-underline">
                <span className="flex items-center gap-2"><Hammer className="w-4 h-4" style={{ color: "#2F3E55" }} /> Custom Builds</span>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <CustomBuildsContent builder={builder} onRequestQuote={() => setShowQuoteModal(true)} />
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Verified Buyer References */}
          {builder.is_verified && references.length > 0 && (
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

          {/* Policies */}
          {(builder.warranty_duration || builder.returns_accepted || builder.shipping_timeline || builder.ships_domestically || builder.ships_internationally || builder.payment_schedule) && (
            <AccordionItem value="policies" className="bg-white border border-stone-200 rounded-2xl px-6 overflow-hidden">
              <AccordionTrigger className="text-base font-bold text-stone-800 py-5 hover:no-underline">Policies &amp; Commitment</AccordionTrigger>
              <AccordionContent className="pb-6">
                <StorefrontPolicies builder={builder} />
              </AccordionContent>
            </AccordionItem>
          )}

        </Accordion>

        {/* ── LISTINGS / CUSTOM WORK / REVIEWS TABS ── */}
        <div id="instruments-section" className="flex border-b border-stone-200 mb-6">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="px-5 py-3 text-sm font-medium border-b-2 transition-colors"
              style={{ borderBottomColor: activeTab === t.id ? "#2F3E55" : "transparent", color: activeTab === t.id ? "#2F3E55" : "#6A6A6A" }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Products */}
        {activeTab === "products" && (
          products.length === 0 ? (
            <div className="text-center py-16">
              <Guitar className="w-10 h-10 mx-auto mb-3 text-stone-300" />
              <p className="text-sm text-stone-400">No instruments listed yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map(p => (
                <Link key={p.id} to={createPageUrl("ProductDetail?id=" + p.id)} className="group block bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="overflow-hidden bg-stone-100" style={{ aspectRatio: "4/3" }}>
                    {p.image_urls?.[0] ? (
                      <img src={p.image_urls[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Guitar className="w-10 h-10 text-stone-300" /></div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-1 text-stone-900">{p.name}</h3>
                    <p className="font-bold text-sm" style={{ color: "#C57A1F" }}>${p.price?.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {/* Custom Work */}
        {activeTab === "custom" && (
          <div>
            {builder.custom_build_description && (
              <div className="p-5 rounded-xl mb-6 text-sm leading-relaxed border" style={{ backgroundColor: "#F2F0EA", borderColor: "#E3E0D8", color: "#1F1F1F" }}>
                {builder.custom_build_description}
              </div>
            )}
            {(builder.custom_build_examples || []).length === 0 ? (
              <div className="text-center py-16 text-sm text-stone-400">No examples posted yet.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(builder.custom_build_examples || []).map((ex, i) => (
                  <div key={i} className="group">
                    <div className="overflow-hidden rounded-xl border border-stone-200 aspect-square">
                      <img src={ex.image_url} alt={ex.caption || "Custom build"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    {ex.caption && <p className="text-xs text-stone-500 mt-1.5 px-0.5">{ex.caption}</p>}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowContactForm(true)}
                className="font-semibold px-6 py-3 text-sm text-white rounded-lg transition-colors"
                style={{ backgroundColor: "#C57A1F" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#a8661a"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#C57A1F"}
              >
                Inquire About a Custom Build
              </button>
            </div>
          </div>
        )}

        {/* Reviews */}
        {activeTab === "reviews" && (
          reviews.length === 0 ? (
            <div className="text-center py-16 text-sm text-stone-400">No reviews yet.</div>
          ) : (
            <div className="space-y-4">
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
          )
        )}
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
              <button type="submit" className="flex-1 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors" style={{ backgroundColor: "#C57A1F" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#a8661a"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#C57A1F"}>Send Message</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}