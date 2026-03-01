import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Guitar, Star, ChevronLeft, Quote, Hammer, Heart, MapPin, MessageSquare, ArrowRight, User, X, Check } from "lucide-react";
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
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }} className="animate-pulse">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="h-6 rounded w-32 mb-8" style={{ backgroundColor: "#EBEBEB" }} />
        <div className="h-40 rounded mb-6" style={{ backgroundColor: "#EBEBEB" }} />
        <div className="h-24 rounded" style={{ backgroundColor: "#F5F5F5" }} />
      </div>
    </div>
  );

  if (!builder) return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-center">
      <p style={{ color: "#7A7A7A" }}>Builder not found.</p>
      <Link to={createPageUrl("Builders")} className="font-semibold underline mt-2 block text-sm" style={{ color: NAVY }}>Back to Builders</Link>
    </div>
  );

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const tabs = [
    { id: "products", label: `Inventory (${products.length})` },
    { id: "custom", label: `Custom Builds (${customBuilds.length})` },
    { id: "reviews", label: `Reviews (${reviews.length})` },
  ];

  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>
      {/* Header Band */}
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-10 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link to={createPageUrl("Builders")} className="inline-flex items-center gap-1 text-sm font-medium mb-8 hover:opacity-70 transition-opacity" style={{ color: NAVY }}>
            <ChevronLeft className="w-4 h-4" /> Back to Builders
          </Link>

          {/* Builder Identity */}
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {builder.avatar_url ? (
              <img src={builder.avatar_url} alt={builder.business_name || builder.display_name} className="w-20 h-20 object-cover flex-shrink-0" style={{ borderRadius: 2 }} />
            ) : (
              <div className="w-20 h-20 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#D6DCE8", borderRadius: 2 }}>
                <User className="w-9 h-9" style={{ color: NAVY }} strokeWidth={1.5} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: "#1A1A1A" }}>{builder.business_name || builder.display_name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm mb-4" style={{ color: "#6B6B6B" }}>
                {builder.location && (
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{builder.location}</span>
                )}
                {builder.years_experience > 0 && <span>{builder.years_experience} years experience</span>}
                {avgRating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" style={{ color: "#D4AC0D" }} />
                    {avgRating.toFixed(1)} ({reviews.length} reviews)
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowContactForm(true)}
                  className="flex items-center gap-2 font-semibold text-sm px-5 py-2.5 text-white transition-colors"
                  style={{ backgroundColor: NAVY }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
                >
                  <MessageSquare className="w-4 h-4" /> Contact Builder
                </button>
                <button
                  onClick={toggleSave}
                  className="flex items-center gap-2 font-semibold text-sm px-5 py-2.5 border transition-colors"
                  style={{ borderColor: saved ? NAVY : "#DEDBD6", color: saved ? NAVY : "#5A5A5A", backgroundColor: "#FFFFFF" }}
                >
                  <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
                  {saved ? "Saved" : "Save Builder"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Bio */}
        {builder.bio && (
          <div className="p-6 border mb-6" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#6B6B6B" }}>About</h2>
            <p className="text-sm leading-relaxed" style={{ color: "#3D3D3D" }}>{builder.bio}</p>
          </div>
        )}

        {/* Specialties */}
        {builder.specialties?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {builder.specialties.map(s => (
              <span key={s} className="text-xs font-medium px-3 py-1.5 border" style={{ borderColor: "#DEDBD6", color: "#3D3D3D", backgroundColor: "#FFFFFF" }}>{s}</span>
            ))}
          </div>
        )}

        {/* Custom Builds CTA */}
        {builder.offers_custom_builds && (
          <div className="p-6 border mb-6 flex items-start gap-4" style={{ borderColor: "#E0DDD8", backgroundColor: "#EEF1F7" }}>
            <Hammer className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: NAVY }} strokeWidth={1.5} />
            <div className="flex-1">
              <h3 className="font-bold text-sm mb-2" style={{ color: "#1A1A1A" }}>Custom Builds Available</h3>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: "#4A4A4A" }}>
                {builder.custom_build_description || "This builder accepts custom build requests. Reach out to discuss your dream instrument."}
              </p>
              <button
                onClick={() => setShowQuoteModal(true)}
                className="font-semibold px-5 py-2.5 text-sm text-white transition-colors"
                style={{ backgroundColor: NAVY }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
              >
                Request a Quote
              </button>
            </div>
          </div>
        )}

        {/* Verified References */}
        {builder.is_verified && references.length > 0 && (
          <div className="p-6 border mb-6" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#6B6B6B" }}>Verified Buyer References</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {references.map(ref => (
                <div key={ref.id} className="p-4" style={{ backgroundColor: "#F5F3F0" }}>
                  <Quote className="w-4 h-4 mb-2" style={{ color: "#CCCCCC" }} />
                  <p className="text-sm italic leading-relaxed mb-3" style={{ color: "#4A4A4A" }}>"{ref.quote}"</p>
                  <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>— {ref.buyer_name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b mb-6" style={{ borderColor: "#E0DDD8" }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="px-5 py-3 text-sm font-medium border-b-2 transition-colors"
              style={{
                borderBottomColor: activeTab === t.id ? NAVY : "transparent",
                color: activeTab === t.id ? NAVY : "#7A7A7A"
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          products.length === 0 ? (
            <div className="text-center py-16">
              <Guitar className="w-10 h-10 mx-auto mb-3" style={{ color: "#CCCCCC" }} />
              <p className="text-sm" style={{ color: "#9A9A9A" }}>No products listed yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map(p => (
                <Link key={p.id} to={createPageUrl("ProductDetail?id=" + p.id)} className="group block" style={{ backgroundColor: "#FFFFFF" }}>
                  <div className="overflow-hidden mb-3" style={{ aspectRatio: "4/3", backgroundColor: "#EBEBEB" }}>
                    {p.image_urls?.[0] ? (
                      <img src={p.image_urls[0]} className="w-full h-full object-cover" style={{ transition: "transform 0.4s ease" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Guitar className="w-10 h-10" style={{ color: "#CCCCCC" }} /></div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm mb-1" style={{ color: "#1A1A1A" }}>{p.name}</h3>
                    <p className="font-bold text-sm" style={{ color: NAVY }}>${p.price?.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {/* Custom Builds Tab */}
        {activeTab === "custom" && (
          customBuilds.length === 0 ? (
            <div className="text-center py-16 text-sm" style={{ color: "#9A9A9A" }}>No custom build listings yet.</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {customBuilds.map(cb => (
                <div key={cb.id} className="p-6 border" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
                  <h3 className="font-bold text-sm mb-2" style={{ color: "#1A1A1A" }}>{cb.listing_title}</h3>
                  <p className="text-sm mb-4 leading-relaxed" style={{ color: "#5A5A5A" }}>{cb.short_description}</p>
                  <div className="flex flex-wrap gap-4 text-xs mb-4" style={{ color: "#7A7A7A" }}>
                    {cb.instrument_type && <span>Type: <strong>{cb.instrument_type}</strong></span>}
                    {cb.starting_price && <span>From: <strong style={{ color: NAVY }}>${cb.starting_price?.toLocaleString()}</strong></span>}
                    {cb.estimated_build_time && <span>Build time: <strong>{cb.estimated_build_time}</strong></span>}
                  </div>
                  <Link to={createPageUrl("CustomBuilds")} className="text-sm font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity" style={{ color: NAVY }}>
                    Request This Build <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          reviews.length === 0 ? (
            <div className="text-center py-16 text-sm" style={{ color: "#9A9A9A" }}>No reviews yet.</div>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="p-5 border" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm" style={{ color: "#1A1A1A" }}>{r.reviewer_name}</span>
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(n => <Star key={n} className="w-4 h-4" style={{ color: n <= r.rating ? "#D4AC0D" : "#DDDDDD", fill: n <= r.rating ? "#D4AC0D" : "none" }} />)}</div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#4A4A4A" }}>{r.review_text}</p>
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
      <div className="relative bg-white w-full max-w-md shadow-2xl p-6" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold" style={{ color: "#1A1A1A" }}>Contact {builder.business_name || builder.display_name}</h3>
          <button onClick={onClose} className="hover:opacity-60 transition-opacity"><X className="w-5 h-5" style={{ color: "#6B6B6B" }} /></button>
        </div>
        {sent ? (
          <div className="text-center py-8">
            <Check className="w-10 h-10 mx-auto mb-3" style={{ color: "#27AE60" }} />
            <p className="font-medium text-sm mb-5" style={{ color: "#1A1A1A" }}>Message sent successfully.</p>
            <button onClick={onClose} className="text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: NAVY }}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            <textarea
              value={msg}
              onChange={e => setMsg(e.target.value)}
              rows={5}
              required
              placeholder="Write your message..."
              className="w-full border px-3 py-2.5 text-sm focus:outline-none resize-none"
              style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF", color: "#1A1A1A" }}
            />
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 border py-2.5 text-sm font-medium transition-colors" style={{ borderColor: "#DEDBD6", color: "#5A5A5A" }}>Cancel</button>
              <button type="submit" className="flex-1 py-2.5 text-sm font-semibold text-white transition-colors" style={{ backgroundColor: NAVY }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
              >Send Message</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}