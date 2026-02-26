import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Guitar, Star, ChevronLeft, Quote, Hammer } from "lucide-react";
import StorefrontHeader from "../components/builder/StorefrontHeader";
import StorefrontBrandStory from "../components/builder/StorefrontBrandStory";
import StorefrontMediaGallery from "../components/builder/StorefrontMediaGallery";
import { getScheme } from "../components/builder/StorefrontHeader";
import RequestQuoteModal from "../components/builder/RequestQuoteModal";

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
    <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-48 bg-stone-200 rounded-2xl mb-6" />
      <div className="h-6 bg-stone-200 rounded w-1/3 mb-3" />
      <div className="h-24 bg-stone-100 rounded" />
    </div>
  );

  if (!builder) return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-center">
      <p className="text-stone-500">Builder not found.</p>
      <Link to={createPageUrl("Builders")} className="text-amber-600 hover:underline mt-2 block">Back to Builders</Link>
    </div>
  );

  const scheme = getScheme(builder.storefront_color_scheme);
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const media = builder.media_urls || [];

  const tabs = [
    { id: "products", label: `Inventory (${products.length})` },
    { id: "custom", label: `Custom Builds (${customBuilds.length})` },
    { id: "reviews", label: `Reviews (${reviews.length})` },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link to={createPageUrl("Builders")} className="inline-flex items-center gap-1 text-stone-500 hover:text-amber-600 text-sm mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to Builders
      </Link>

      <StorefrontHeader
        builder={builder}
        avgRating={avgRating}
        reviewCount={reviews.length}
        saved={saved}
        onToggleSave={toggleSave}
        onContact={() => setShowContactForm(true)}
      />

      <StorefrontBrandStory builder={builder} />

      {/* Custom Builds CTA */}
      {builder.offers_custom_builds && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Hammer className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-stone-800 mb-1">Custom Builds Available</h3>
              {builder.custom_build_description ? (
                <p className="text-stone-600 text-sm leading-relaxed mb-4">{builder.custom_build_description}</p>
              ) : (
                <p className="text-stone-500 text-sm mb-4">This builder accepts custom build requests. Reach out to discuss your dream instrument.</p>
              )}
              <button
                onClick={() => setShowQuoteModal(true)}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
              >
                Request a Quote
              </button>
            </div>
          </div>
        </div>
      )}

      <StorefrontMediaGallery builder={builder} media={media} />

      {/* Verified References */}
      {builder.is_verified && references.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.19 8.62L2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2z"/></svg>
            <h2 className="font-bold text-blue-800">Verified Buyer References</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {references.map(ref => (
              <div key={ref.id} className="bg-white rounded-xl p-4 border border-blue-100">
                <Quote className="w-4 h-4 text-blue-300 mb-2" />
                <p className="text-stone-600 text-sm italic leading-relaxed mb-3">"{ref.quote}"</p>
                <p className="text-sm font-semibold text-stone-700">— {ref.buyer_name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-stone-200 mb-6 flex gap-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === t.id ? scheme.tabActive : "border-transparent text-stone-500 hover:text-stone-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        products.length === 0 ? (
          <div className="text-center py-12 text-stone-400"><Guitar className="w-12 h-12 mx-auto mb-3 text-stone-300" />No products listed yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map(p => (
              <Link key={p.id} to={createPageUrl(`ProductDetail?id=${p.id}`)} className="group bg-white rounded-xl overflow-hidden border border-stone-200 hover:shadow-md transition-shadow">
                <div className="h-44 bg-stone-100 overflow-hidden">
                  {p.image_urls?.[0] ? (
                    <img src={p.image_urls[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Guitar className="w-12 h-12 text-stone-300" /></div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-stone-800 text-sm mb-1 line-clamp-1">{p.name}</h3>
                  <p className={`font-bold ${scheme.accentText}`}>${p.price?.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {/* Custom Builds Tab */}
      {activeTab === "custom" && (
        customBuilds.length === 0 ? (
          <div className="text-center py-12 text-stone-400">No custom build listings yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {customBuilds.map(cb => (
              <div key={cb.id} className="bg-white rounded-xl border border-stone-200 p-5">
                <h3 className="font-bold text-stone-800 mb-1">{cb.listing_title}</h3>
                <p className="text-stone-500 text-sm mb-3">{cb.short_description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-stone-500">
                  {cb.instrument_type && <span>Type: <strong>{cb.instrument_type}</strong></span>}
                  {cb.starting_price && <span>From: <strong className={scheme.accentText}>${cb.starting_price?.toLocaleString()}</strong></span>}
                  {cb.estimated_build_time && <span>Build time: <strong>{cb.estimated_build_time}</strong></span>}
                </div>
                <Link to={createPageUrl(`CustomBuilds`)} className={`mt-4 block text-center text-white text-sm font-medium py-2 rounded-lg ${scheme.accent}`}>
                  Request This Build
                </Link>
              </div>
            ))}
          </div>
        )
      )}

      {/* Reviews Tab */}
      {activeTab === "reviews" && (
        reviews.length === 0 ? (
          <div className="text-center py-12 text-stone-400">No reviews yet.</div>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="bg-white border border-stone-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-stone-800">{r.reviewer_name}</span>
                  <div className="flex">{[1,2,3,4,5].map(n => <Star key={n} className={`w-4 h-4 ${n <= r.rating ? "text-amber-400 fill-amber-400" : "text-stone-300"}`} />)}</div>
                </div>
                <p className="text-stone-600 text-sm">{r.review_text}</p>
              </div>
            ))}
          </div>
        )
      )}

      {showContactForm && (
        <ContactModal builder={builder} user={user} onClose={() => setShowContactForm(false)} />
      )}
      {showQuoteModal && (
        <RequestQuoteModal builder={builder} user={user} onClose={() => setShowQuoteModal(false)} />
      )}
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
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-bold text-stone-800 mb-4">Contact {builder.business_name || builder.display_name}</h3>
        {sent ? (
          <div className="text-center py-6">
            <p className="text-green-600 font-medium">Message sent!</p>
            <button onClick={onClose} className="mt-4 text-stone-500 hover:underline text-sm">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={5} required placeholder="Write your message..." className="w-full border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="flex-1 border border-stone-300 text-stone-600 py-2.5 rounded-xl text-sm">Cancel</button>
              <button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 rounded-xl text-sm">Send Message</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}