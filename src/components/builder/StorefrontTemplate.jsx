import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Star, MapPin, Globe, Heart, HeartOff, MessageSquare, Award, ChevronLeft, Facebook, Instagram, Guitar, Quote } from "lucide-react";

const COLOR_SCHEMES = {
  earthy:   { primary: "#8B4513", accent: "#D4A847", accentLight: "#FEF3C7", accentText: "#92400E", bg: "#FDF8F3", headerBg: "from-stone-800 to-amber-950" },
  midnight: { primary: "#1E293B", accent: "#6366F1", accentLight: "#EEF2FF", accentText: "#3730A3", bg: "#F8FAFC", headerBg: "from-slate-900 to-indigo-950" },
  natural:  { primary: "#3D5A3E", accent: "#A3B899", accentLight: "#F0FDF4", accentText: "#166534", bg: "#F6FAF6", headerBg: "from-green-900 to-stone-800" },
  forge:    { primary: "#374151", accent: "#F59E0B", accentLight: "#FFFBEB", accentText: "#92400E", bg: "#F9FAFB", headerBg: "from-gray-900 to-stone-800" },
  ocean:    { primary: "#0C4A6E", accent: "#38BDF8", accentLight: "#E0F2FE", accentText: "#075985", bg: "#F0F9FF", headerBg: "from-sky-900 to-blue-950" },
};

// ─── Classic Layout ───────────────────────────────────────────────────────────
function ClassicLayout({ builder, products, reviews, customBuilds, references, user, saved, onToggleSave, onContact, activeTab, setActiveTab }) {
  const scheme = COLOR_SCHEMES[builder.storefront_color_scheme || "earthy"];
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const media = builder.media_urls || [];

  return (
    <div style={{ backgroundColor: scheme.bg }} className="min-h-screen">
      {/* Banner / Header */}
      <div className={`relative bg-gradient-to-r ${scheme.headerBg} overflow-hidden`} style={{ minHeight: "220px" }}>
        {builder.banner_image_url && (
          <img src={builder.banner_image_url} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Banner" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-10 flex flex-col justify-end h-full" style={{ minHeight: "220px" }}>
          {builder.is_featured && (
            <span className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
              <Award className="w-3 h-3" /> Featured Builder
            </span>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Avatar + Name row */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-6">
          <div className="flex-shrink-0">
            {builder.avatar_url ? (
              <img src={builder.avatar_url} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-amber-100 border-4 border-white shadow-lg flex items-center justify-center">
                <span className="font-bold text-3xl" style={{ color: scheme.primary }}>{(builder.business_name || "B")[0]}</span>
              </div>
            )}
          </div>
          <div className="flex-1 pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-stone-800">{builder.business_name || builder.display_name}</h1>
              {builder.is_verified && <VerifiedBadge />}
            </div>
            {builder.location && <p className="text-stone-400 text-sm flex items-center gap-1"><MapPin className="w-3 h-3" /> {builder.location}</p>}
          </div>
          <ActionButtons saved={saved} onToggleSave={onToggleSave} onContact={onContact} scheme={scheme} />
        </div>

        {/* Stats + socials */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-6">
          <BuilderStats builder={builder} reviews={reviews} avgRating={avgRating} scheme={scheme} />
        </div>

        {/* Brand Story */}
        {(builder.brand_story || builder.bio) && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
            <h2 className="font-bold text-stone-800 mb-3 text-lg">The Story</h2>
            <div className="text-stone-600 leading-relaxed whitespace-pre-line text-sm">{builder.brand_story || builder.bio}</div>
          </div>
        )}

        {/* Media gallery */}
        {media.length > 0 && <MediaGallery media={media} builder={builder} layout="grid" />}

        {/* References */}
        <ReferencesBlock references={references} builder={builder} scheme={scheme} />

        {/* Business Details */}
        <BusinessDetails builder={builder} scheme={scheme} />

        {/* Products / Custom / Reviews tabs */}
        <TabSection builder={builder} products={products} customBuilds={customBuilds} reviews={reviews} activeTab={activeTab} setActiveTab={setActiveTab} scheme={scheme} />
      </div>
    </div>
  );
}

// ─── Bold Layout ──────────────────────────────────────────────────────────────
function BoldLayout({ builder, products, reviews, customBuilds, references, user, saved, onToggleSave, onContact, activeTab, setActiveTab }) {
  const scheme = COLOR_SCHEMES[builder.storefront_color_scheme || "earthy"];
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const media = builder.media_urls || [];

  return (
    <div style={{ backgroundColor: scheme.bg }} className="min-h-screen">
      {/* Full-width Hero */}
      <div className={`relative bg-gradient-to-r ${scheme.headerBg}`} style={{ minHeight: "360px" }}>
        {builder.banner_image_url && (
          <img src={builder.banner_image_url} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Banner" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/70" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 flex flex-col justify-end pb-10" style={{ minHeight: "360px" }}>
          {builder.is_featured && (
            <span className="absolute top-6 right-6 bg-amber-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
              <Award className="w-3 h-3" /> Featured Builder
            </span>
          )}
          <div className="flex items-end gap-5">
            {builder.avatar_url ? (
              <img src={builder.avatar_url} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl flex-shrink-0" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white shadow-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-4xl">{(builder.business_name || "B")[0]}</span>
              </div>
            )}
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-3xl font-bold text-white drop-shadow">{builder.business_name || builder.display_name}</h1>
                {builder.is_verified && <VerifiedBadge light />}
              </div>
              {builder.location && <p className="text-white/80 text-sm flex items-center gap-1"><MapPin className="w-3 h-3" /> {builder.location}</p>}
            </div>
            <div className="pb-1 flex-shrink-0">
              <ActionButtons saved={saved} onToggleSave={onToggleSave} onContact={onContact} scheme={scheme} light />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <BuilderStats builder={builder} reviews={reviews} avgRating={avgRating} scheme={scheme} />
        </div>

        {/* Two-column: story + quick stats */}
        {(builder.brand_story || builder.bio) && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="font-bold text-stone-800 mb-3 text-lg">The Story</h2>
            <div className="text-stone-600 leading-relaxed whitespace-pre-line text-sm">{builder.brand_story || builder.bio}</div>
          </div>
        )}

        {media.length > 0 && <MediaGallery media={media} builder={builder} layout="wide" />}

        <ReferencesBlock references={references} builder={builder} scheme={scheme} />
        <BusinessDetails builder={builder} scheme={scheme} />
        <TabSection builder={builder} products={products} customBuilds={customBuilds} reviews={reviews} activeTab={activeTab} setActiveTab={setActiveTab} scheme={scheme} />
      </div>
    </div>
  );
}

// ─── Gallery Layout ────────────────────────────────────────────────────────────
function GalleryLayout({ builder, products, reviews, customBuilds, references, user, saved, onToggleSave, onContact, activeTab, setActiveTab }) {
  const scheme = COLOR_SCHEMES[builder.storefront_color_scheme || "earthy"];
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const media = builder.media_urls || [];

  return (
    <div style={{ backgroundColor: scheme.bg }} className="min-h-screen">
      {/* Compact header */}
      <div className={`relative bg-gradient-to-r ${scheme.headerBg} h-28`}>
        {builder.banner_image_url && (
          <img src={builder.banner_image_url} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Banner" />
        )}
        {builder.is_featured && (
          <span className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
            <Award className="w-3 h-3" /> Featured
          </span>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Identity row */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-8 mb-6">
          <div className="flex-shrink-0">
            {builder.avatar_url ? (
              <img src={builder.avatar_url} className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-amber-100 border-4 border-white shadow-lg flex items-center justify-center">
                <span className="font-bold text-2xl" style={{ color: scheme.primary }}>{(builder.business_name || "B")[0]}</span>
              </div>
            )}
          </div>
          <div className="flex-1 pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-stone-800">{builder.business_name || builder.display_name}</h1>
              {builder.is_verified && <VerifiedBadge />}
            </div>
            {builder.location && <p className="text-stone-400 text-sm flex items-center gap-1"><MapPin className="w-3 h-3" /> {builder.location}</p>}
          </div>
          <ActionButtons saved={saved} onToggleSave={onToggleSave} onContact={onContact} scheme={scheme} />
        </div>

        {/* Masonry photo grid FIRST */}
        {media.length > 0 && <MediaGallery media={media} builder={builder} layout="masonry" />}

        {/* Story below photos */}
        <div className="mt-6 grid sm:grid-cols-3 gap-6">
          <div className="sm:col-span-2 space-y-6">
            {(builder.brand_story || builder.bio) && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6">
                <h2 className="font-bold text-stone-800 mb-3">The Story</h2>
                <div className="text-stone-600 leading-relaxed whitespace-pre-line text-sm">{builder.brand_story || builder.bio}</div>
              </div>
            )}
            <ReferencesBlock references={references} builder={builder} scheme={scheme} />
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-4">
              <BuilderStats builder={builder} reviews={reviews} avgRating={avgRating} scheme={scheme} compact />
            </div>
            <BusinessDetails builder={builder} scheme={scheme} compact />
          </div>
        </div>

        <div className="mt-6">
          <TabSection builder={builder} products={products} customBuilds={customBuilds} reviews={reviews} activeTab={activeTab} setActiveTab={setActiveTab} scheme={scheme} />
        </div>
      </div>
    </div>
  );
}

// ─── Shared Sub-components ───────────────────────────────────────────────────

function VerifiedBadge({ light }) {
  return (
    <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${light ? "bg-white/20 text-white border border-white/30" : "text-blue-600 bg-blue-50 border border-blue-200"}`}>
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.19 8.62L2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2z"/></svg>
      Verified Builder
    </span>
  );
}

function ActionButtons({ saved, onToggleSave, onContact, scheme, light }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onToggleSave}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
          saved
            ? "bg-red-50 border-red-200 text-red-600"
            : light
            ? "border-white/40 text-white hover:bg-white/10"
            : "border-stone-300 text-stone-600 hover:border-amber-400"
        }`}
      >
        {saved ? <HeartOff className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
        {saved ? "Saved" : "Save"}
      </button>
      <button
        onClick={onContact}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-medium"
        style={{ backgroundColor: scheme.primary }}
      >
        <MessageSquare className="w-4 h-4" /> Contact
      </button>
    </div>
  );
}

function BuilderStats({ builder, reviews, avgRating, scheme, compact }) {
  return (
    <div className={`flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-600 ${compact ? "" : "mb-2"}`}>
      {builder.years_experience > 0 && <span><strong className="text-stone-800">{builder.years_experience}</strong> yrs exp.</span>}
      {builder.total_instruments_built > 0 && <span><strong className="text-stone-800">{builder.total_instruments_built}</strong> instruments built</span>}
      {avgRating > 0 && (
        <span className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <strong className="text-stone-800">{avgRating.toFixed(1)}</strong> ({reviews.length})
        </span>
      )}
      {builder.website_url && <a href={builder.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline" style={{ color: scheme.accent }}><Globe className="w-3 h-3" /> Website</a>}
      {builder.facebook_url && <a href={builder.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline"><Facebook className="w-3 h-3" /> Facebook</a>}
      {builder.instagram_url && <a href={builder.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-pink-600 hover:underline"><Instagram className="w-3 h-3" /> Instagram</a>}
      {builder.x_url && <a href={builder.x_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-stone-700 hover:underline"><span className="text-xs font-bold">𝕏</span> X</a>}
    </div>
  );
}

function MediaGallery({ media, builder, layout }) {
  const videos = url => url.match(/\.(mp4|mov|webm|ogg)(\?|$)/i);

  if (layout === "masonry") {
    return (
      <div className="mb-6">
        <h2 className="font-bold text-stone-800 mb-3">The Shop & The Craft</h2>
        <div className="columns-2 sm:columns-3 gap-3 space-y-3">
          {media.map((url, i) => (
            <div key={i} className="break-inside-avoid rounded-xl overflow-hidden bg-stone-100">
              {videos(url) ? (
                <video src={url} controls className="w-full" />
              ) : (
                <img src={url} alt={`${builder.business_name} photo ${i + 1}`} className="w-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={() => window.open(url, '_blank')} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layout === "wide") {
    // first image wide, rest in grid
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-2">
        <h2 className="font-bold text-stone-800 mb-3">The Shop & The Craft</h2>
        {media[0] && (
          <div className="rounded-xl overflow-hidden mb-3 aspect-video bg-stone-100">
            {videos(media[0]) ? <video src={media[0]} controls className="w-full h-full object-cover" /> : <img src={media[0]} className="w-full h-full object-cover cursor-pointer" onClick={() => window.open(media[0], '_blank')} alt="banner" />}
          </div>
        )}
        {media.length > 1 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {media.slice(1).map((url, i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden bg-stone-100">
                {videos(url) ? <video src={url} controls className="w-full h-full object-cover" /> : <img src={url} className="w-full h-full object-cover cursor-pointer hover:opacity-90" onClick={() => window.open(url, '_blank')} alt={`photo ${i + 2}`} />}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // default grid
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-6">
      <h2 className="font-bold text-stone-800 mb-3">The Shop & The Craft</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {media.map((url, i) => (
          <div key={i} className="rounded-xl overflow-hidden aspect-video bg-stone-100">
            {videos(url) ? <video src={url} controls className="w-full h-full object-cover" /> : <img src={url} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={() => window.open(url, '_blank')} alt={`photo ${i + 1}`} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReferencesBlock({ references, builder, scheme }) {
  if (!builder.is_verified || references.length === 0) return null;
  return (
    <div className="rounded-2xl border p-6 mb-6" style={{ backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }}>
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
  );
}

function BusinessDetails({ builder, scheme, compact }) {
  const details = [
    builder.typical_build_time && { label: "Build Time", value: builder.typical_build_time },
    builder.instruments_per_year && { label: "Per Year", value: `${builder.instruments_per_year} instruments` },
    builder.deposit_percent && { label: "Deposit", value: `${builder.deposit_percent}%` },
  ].filter(Boolean);

  const policies = [
    builder.warranty_policy && { label: "Warranty", value: builder.warranty_policy },
    builder.return_policy && { label: "Returns", value: builder.return_policy },
    builder.shipping_policy && { label: "Shipping", value: builder.shipping_policy },
  ].filter(Boolean);

  if (details.length === 0 && policies.length === 0) return null;

  if (compact) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-2">
        <h3 className="font-semibold text-stone-700 text-sm mb-2">At a Glance</h3>
        {details.map(d => (
          <div key={d.label}>
            <p className="text-xs text-stone-400">{d.label}</p>
            <p className="text-sm font-medium text-stone-700">{d.value}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
      <h2 className="font-bold text-stone-800 mb-4">Working With {builder.business_name || builder.display_name}</h2>
      {details.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-5 pb-5 border-b border-stone-100">
          {details.map(d => (
            <div key={d.label}>
              <p className="text-xs text-stone-400 mb-0.5">{d.label}</p>
              <p className="text-sm font-semibold text-stone-700">{d.value}</p>
            </div>
          ))}
        </div>
      )}
      {policies.length > 0 && (
        <div className="space-y-4">
          {policies.map(p => (
            <div key={p.label}>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">{p.label}</p>
              <p className="text-stone-600 text-sm leading-relaxed">{p.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabSection({ builder, products, customBuilds, reviews, activeTab, setActiveTab, scheme }) {
  const tabs = [
    { id: "products", label: `Inventory (${products.length})` },
    { id: "custom", label: `Custom Builds (${customBuilds.length})` },
    { id: "reviews", label: `Reviews (${reviews.length})` },
  ];

  return (
    <div className="mb-10">
      <div className="border-b border-stone-200 mb-6 flex gap-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === t.id ? "border-current" : "border-transparent text-stone-500 hover:text-stone-700"}`}
            style={activeTab === t.id ? { borderColor: scheme.accent, color: scheme.primary } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "products" && (
        products.length === 0 ? (
          <div className="text-center py-12 text-stone-400"><Guitar className="w-12 h-12 mx-auto mb-3 text-stone-300" />No products listed yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map(p => (
              <Link key={p.id} to={createPageUrl(`ProductDetail?id=${p.id}`)} className="group bg-white rounded-xl overflow-hidden border border-stone-200 hover:shadow-md transition-shadow">
                <div className="h-44 bg-stone-100 overflow-hidden">
                  {p.image_urls?.[0] ? <img src={p.image_urls[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center"><Guitar className="w-12 h-12 text-stone-300" /></div>}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-stone-800 text-sm mb-1 line-clamp-1">{p.name}</h3>
                  <p className="font-bold" style={{ color: scheme.primary }}>${p.price?.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )
      )}

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
                  {cb.starting_price && <span>From: <strong style={{ color: scheme.primary }}>${cb.starting_price?.toLocaleString()}</strong></span>}
                  {cb.estimated_build_time && <span>Build time: <strong>{cb.estimated_build_time}</strong></span>}
                </div>
                <Link to={createPageUrl("CustomBuilds")} className="mt-4 block text-center text-white text-sm font-medium py-2 rounded-lg" style={{ backgroundColor: scheme.primary }}>
                  Request This Build
                </Link>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === "reviews" && (
        reviews.length === 0 ? (
          <div className="text-center py-12 text-stone-400">No reviews yet.</div>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="bg-white border border-stone-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-stone-800">{r.reviewer_name}</span>
                  <div className="flex">{[1,2,3,4,5].map(n => <Star key={n} className={`w-4 h-4 ${n <= r.rating ? "fill-amber-400 text-amber-400" : "text-stone-300"}`} />)}</div>
                </div>
                <p className="text-stone-600 text-sm">{r.review_text}</p>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function StorefrontTemplate(props) {
  const layout = props.builder?.storefront_layout || "classic";
  if (layout === "bold") return <BoldLayout {...props} />;
  if (layout === "gallery") return <GalleryLayout {...props} />;
  return <ClassicLayout {...props} />;
}