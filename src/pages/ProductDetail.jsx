import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Guitar, Star, ChevronLeft, ShoppingCart, MapPin, Check, ArrowRight, MessageSquare } from "lucide-react";
import SpecificationsDisplay from "../components/marketplace/SpecificationsDisplay";

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [builder, setBuilder] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showContact, setShowContact] = useState(false);

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
      <div className="grid md:grid-cols-2 gap-10">
        <div className="h-96 bg-stone-200 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-6 bg-stone-200 rounded w-3/4" />
          <div className="h-10 bg-stone-200 rounded w-1/2" />
          <div className="h-24 bg-stone-100 rounded" />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="max-w-6xl mx-auto px-4 py-20 text-center">
      <Guitar className="w-16 h-16 text-stone-300 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-stone-600">Product not found</h2>
      <Link to={createPageUrl("Catalog")} className="mt-4 inline-block text-amber-600 hover:underline">Back to Catalog</Link>
    </div>
  );

  const images = product.image_urls || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <Link to={createPageUrl("Catalog")} className="inline-flex items-center gap-1 text-sm mb-6" style={{ color: "#6A6A6A" }}
        onMouseEnter={e => e.currentTarget.style.color = "#2F3E55"}
        onMouseLeave={e => e.currentTarget.style.color = "#6A6A6A"}>
        <ChevronLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      <div className="grid md:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div>
          <div className="aspect-square bg-stone-100 rounded-2xl overflow-hidden mb-3">
            {images[activeImg] ? (
              <img src={images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Guitar className="w-24 h-24 text-stone-300" /></div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${activeImg === i ? "border-amber-500" : "border-transparent"}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {builder && (
            <Link to={createPageUrl(`BuilderProfile?id=${builder.id}`)} className="text-sm font-medium mb-2 block hover:underline" style={{ color: "#2F3E55" }}>
              {builder.business_name || builder.display_name}
            </Link>
          )}
          <h1 className="text-3xl font-bold text-stone-800 mb-3">{product.name}</h1>

          {product.average_rating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              {[1,2,3,4,5].map(n => (
                <Star key={n} className={`w-4 h-4 ${n <= Math.round(product.average_rating) ? "text-amber-400 fill-amber-400" : "text-stone-300"}`} />
              ))}
              <span className="text-sm text-stone-500">{product.average_rating?.toFixed(1)} ({product.review_count} reviews)</span>
            </div>
          )}

          <p className="text-4xl font-bold mb-6" style={{ color: "#C57A1F" }}>${product.price?.toLocaleString()}</p>

          {product.description && (
            <p className="text-stone-600 leading-relaxed mb-6">{product.description}</p>
          )}

          {product.categories?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {product.categories.map(c => (
                <span key={c} className="bg-stone-100 text-stone-600 text-sm px-3 py-1 rounded-full">{c}</span>
              ))}
            </div>
          )}

          {product.status === "available" ? (
            <button
              onClick={addToCart}
              className={`w-full flex items-center justify-center gap-2 font-semibold py-4 rounded-xl transition-colors text-lg ${addedToCart ? "text-white" : "text-white"}`}
            style={{ backgroundColor: addedToCart ? "#3B7A57" : "#C57A1F" }}
            onMouseEnter={e => { if (!addedToCart) e.currentTarget.style.backgroundColor = "#a8661a"; }}
            onMouseLeave={e => { if (!addedToCart) e.currentTarget.style.backgroundColor = "#C57A1F"; }}
            >
              {addedToCart ? <><Check className="w-5 h-5" /> Added to Cart!</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
            </button>
          ) : (
            <div className="w-full text-center py-4 bg-stone-200 text-stone-500 rounded-xl font-medium">Sold</div>
          )}

          {product.offers_local_pickup && (
            <p className="text-sm text-stone-500 mt-3 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-green-600" /> Local pickup available
            </p>
          )}

          {builder && (
            <button
              onClick={() => { if (!user) { base44.auth.redirectToLogin(); return; } setShowContact(true); }}
              className="w-full flex items-center justify-center gap-2 mt-3 border font-medium py-3 rounded-xl transition-colors text-sm"
              style={{ borderColor: "#2F3E55", color: "#2F3E55", backgroundColor: "#FFFFFF" }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#F2F0EA"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#FFFFFF"; }}
            >
              <MessageSquare className="w-4 h-4" /> Contact Builder
            </button>
          )}
        </div>
      </div>

      {/* Specifications */}
      <SpecificationsDisplay specs={product.specifications} />

      {/* Reviews */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-stone-800 mb-5">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="text-stone-400 italic">No reviews yet.</p>
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
        )}
      </div>

      {showContact && builder && (
        <ContactModal builder={builder} user={user} onClose={() => setShowContact(false)} />
      )}

      {/* Builder section */}
      {builder && (
        <div className="rounded-2xl p-6 flex flex-col sm:flex-row gap-5 items-start" style={{ backgroundColor: "#3B2F2A", color: "#FFFFFF" }}>
          {builder.avatar_url ? (
            <img src={builder.avatar_url} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
              <span className="font-bold text-2xl text-white">{(builder.business_name || "B")[0]}</span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">{builder.business_name || builder.display_name}</h3>
            {builder.location && <p className="text-stone-400 text-sm mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> {builder.location}</p>}
            {builder.bio && <p className="text-stone-300 text-sm line-clamp-3">{builder.bio}</p>}
          </div>
          <Link to={createPageUrl(`BuilderProfile?id=${builder.id}`)} className="flex items-center gap-1 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex-shrink-0" style={{ backgroundColor: "#C57A1F" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#a8661a"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#C57A1F"}>
            View Profile <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
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
        <h3 className="text-lg font-bold text-stone-800 mb-1">Contact {builder.business_name || builder.display_name}</h3>
        {sent ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-green-600 font-semibold mb-1">Message sent!</p>
            <p className="text-stone-400 text-sm mb-4">The builder will get back to you soon.</p>
            <button onClick={onClose} className="text-stone-500 hover:underline text-sm">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-3 mt-4">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder={`Message from ${user?.full_name}`} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Message *</label>
              <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={5} required placeholder="Write your message..." className="w-full border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose} className="flex-1 border border-stone-300 text-stone-600 py-2.5 rounded-xl text-sm">Cancel</button>
              <button type="submit" className="flex-1 text-white font-medium py-2.5 rounded-xl text-sm" style={{ backgroundColor: "#C57A1F" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#a8661a"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#C57A1F"}>Send Message</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}