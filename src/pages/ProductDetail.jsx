import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Guitar, Star, ChevronLeft, ShoppingCart, Heart, Share2, MapPin, Check, ArrowRight } from "lucide-react";

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [builder, setBuilder] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

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
      <Link to={createPageUrl("Catalog")} className="inline-flex items-center gap-1 text-stone-500 hover:text-amber-600 text-sm mb-6">
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
            <Link to={createPageUrl(`BuilderProfile?id=${builder.id}`)} className="text-amber-600 hover:underline text-sm font-medium mb-2 block">
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

          <p className="text-4xl font-bold text-amber-700 mb-6">${product.price?.toLocaleString()}</p>

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
              className={`w-full flex items-center justify-center gap-2 font-semibold py-4 rounded-xl transition-colors text-lg ${addedToCart ? "bg-green-600 text-white" : "bg-amber-600 hover:bg-amber-500 text-white"}`}
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
        </div>
      </div>

      {/* Specifications */}
      {product.specifications && Object.keys(product.specifications).filter(k => {
        const v = product.specifications[k];
        return v !== null && v !== undefined && v !== "" && !(typeof v === "string" && v.startsWith("other"));
      }).length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 mb-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
            <h2 className="text-lg font-bold text-stone-800">Specifications</h2>
          </div>
          <div className="divide-y divide-stone-100">
            {(() => {
              const SPEC_LABELS = {
                instrumentCategory: "Instrument Type",
                otherInstrumentCategory: "Instrument Type (Other)",
                handedness: "Handedness",
                numberOfStrings: "Number of Strings",
                otherNumberOfStrings: "Number of Strings (Other)",
                bodyConstruction: "Body Construction",
                otherBodyConstruction: "Body Construction (Other)",
                bodyConstructionDescription: "Body Construction Notes",
                topWood: "Top Wood",
                otherTopWood: "Top Wood (Other)",
                topBookMatched: "Top Book-Matched",
                topGrainDetails: "Top Grain",
                otherTopGrainDetails: "Top Grain (Other)",
                backWood: "Back Wood",
                otherBackWood: "Back Wood (Other)",
                backBookMatched: "Back Book-Matched",
                middleWood: "Middle Wood",
                otherMiddleWood: "Middle Wood (Other)",
                finishPattern: "Finish Pattern",
                otherFinishPattern: "Finish Pattern (Other)",
                finishMaterialsDescription: "Finish Materials",
                color: "Color",
                otherColor: "Color (Other)",
                frets: "Fret Size",
                otherFrets: "Fret Size (Other)",
                fretMaterial: "Fret Material",
                fretDetails: "Fret Details",
                neckConstruction: "Neck Construction",
                neckMaterials: "Neck Materials",
                scaleLength: "Scale Length",
                nutWidth: "Nut Width",
                nutMaterial: "Nut Material",
                fretboardRadius: "Fretboard Radius",
                otherFretboardRadius: "Fretboard Radius (Other)",
                activePassivePickups: "Pickups",
                pickupConfiguration: "Pickup Configuration",
                preamp: "Preamp",
                caseIncludes: "Case Included",
                caseDescription: "Case Details",
              };

              const entries = Object.entries(product.specifications).filter(([k, v]) =>
                v !== null && v !== undefined && v !== "" && v !== "N/A"
              );

              // Group into pairs for two-column rows
              const pairs = [];
              for (let i = 0; i < entries.length; i += 2) {
                pairs.push(entries.slice(i, i + 2));
              }

              return pairs.map((pair, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-2 divide-x divide-stone-100">
                  {pair.map(([k, v]) => (
                    <div key={k} className="px-5 py-3 flex items-baseline gap-3">
                      <span className="text-xs text-stone-400 font-medium w-36 flex-shrink-0">{SPEC_LABELS[k] || k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}</span>
                      <span className="text-sm text-stone-700 font-medium">{String(v)}</span>
                    </div>
                  ))}
                  {pair.length === 1 && <div />}
                </div>
              ));
            })()}
          </div>
        </div>
      )}

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

      {/* Builder section */}
      {builder && (
        <div className="bg-stone-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row gap-5 items-start">
          {builder.avatar_url ? (
            <img src={builder.avatar_url} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-amber-900/40 flex items-center justify-center flex-shrink-0">
              <span className="text-amber-400 font-bold text-2xl">{(builder.business_name || "B")[0]}</span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">{builder.business_name || builder.display_name}</h3>
            {builder.location && <p className="text-stone-400 text-sm mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> {builder.location}</p>}
            {builder.bio && <p className="text-stone-300 text-sm line-clamp-3">{builder.bio}</p>}
          </div>
          <Link to={createPageUrl(`BuilderProfile?id=${builder.id}`)} className="flex items-center gap-1 bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex-shrink-0">
            View Profile <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}