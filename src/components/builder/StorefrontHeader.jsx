import { MapPin, Globe, Facebook, Instagram, Star, Award, Heart, HeartOff, MessageSquare, Hammer, Clock, DollarSign, Guitar } from "lucide-react";

const COLOR_SCHEMES = {
  "earthy": { banner: "from-amber-900 to-stone-800", accentText: "text-amber-700", accentBg: "bg-amber-50", accentBorder: "border-amber-200", sectionBg: "bg-amber-50" },
  "dark-wood": { banner: "from-stone-900 to-amber-950", accentText: "text-stone-800", accentBg: "bg-stone-100", accentBorder: "border-stone-300", sectionBg: "bg-stone-100" },
  "slate": { banner: "from-slate-800 to-slate-600", accentText: "text-slate-700", accentBg: "bg-slate-50", accentBorder: "border-slate-200", sectionBg: "bg-slate-50" },
  "warm-cream": { banner: "from-orange-800 to-amber-700", accentText: "text-orange-700", accentBg: "bg-orange-50", accentBorder: "border-orange-200", sectionBg: "bg-orange-50" },
  "midnight": { banner: "from-indigo-950 to-slate-900", accentText: "text-indigo-700", accentBg: "bg-indigo-50", accentBorder: "border-indigo-200", sectionBg: "bg-indigo-50" },
};

export function getScheme(key) {
  return COLOR_SCHEMES[key] || COLOR_SCHEMES["earthy"];
}

export default function StorefrontHeader({ builder, avgRating, reviewCount, saved, onToggleSave, onContact, onScrollToProducts, onScrollToCustom }) {
  const scheme = getScheme(builder.storefront_color_scheme);
  const name = builder.business_name || builder.display_name || "Builder";

  const locationTagline = [builder.location, builder.tag_line].filter(Boolean).join(" • ");

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden mb-6">

      {/* ── BANNER HERO ── */}
      <div className={`relative bg-gradient-to-r ${scheme.banner}`} style={{ minHeight: "240px" }}>

        {/* Background image */}
        {builder.banner_image_url ? (
          <img src={builder.banner_image_url} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800')] bg-cover bg-center" />
        )}

        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0.15))" }} />

        {/* Featured badge */}
        {builder.is_featured && (
          <span className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 z-10">
            <Award className="w-3 h-3" /> Featured Builder
          </span>
        )}

        {/* Right-side actions (Save + Message) */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={onToggleSave}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors backdrop-blur-sm ${saved ? "bg-red-600/80 border-red-400 text-white" : "bg-black/30 border-white/30 text-white hover:bg-black/50"}`}
          >
            {saved ? <HeartOff className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
            <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
          </button>
          <button
            onClick={onContact}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors backdrop-blur-sm bg-black/30 border border-white/30 hover:bg-black/50"
          >
            <MessageSquare className="w-4 h-4" /> Message
          </button>
        </div>

        {/* Hero text content — overlaid on banner, padded top/bottom */}
        <div className="relative z-10 px-6 sm:px-8" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
          <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-md mb-1">{name}</h1>

          {/* Badges inline */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {builder.is_verified && (
              <span className="flex items-center gap-1 text-xs font-semibold text-white bg-white/20 border border-white/30 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.19 8.62L2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2z"/></svg>
                Verified
              </span>
            )}
            {builder.founding_builder && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-300/60 bg-amber-500/30 text-amber-100 backdrop-blur-sm">
                Founding Builder
              </span>
            )}
          </div>

          {locationTagline && (
            <p className="text-white/80 text-sm flex items-center gap-1.5 mb-6">
              {builder.location && <MapPin className="w-3.5 h-3.5 flex-shrink-0" />}
              {locationTagline}
            </p>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            {builder.offers_custom_builds ? (
              <>
                <button
                  onClick={() => scrollToSection("custom-builds-section")}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                  style={{ backgroundColor: "#C57A1F" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#a8661a"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "#C57A1F"}
                >
                  <Hammer className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  Request Custom Build
                </button>
                {builder.offers_stock_builds && (
                  <button
                    onClick={() => scrollToSection("instruments-section")}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors backdrop-blur-sm bg-white/20 border border-white/30 hover:bg-white/30"
                  >
                    <Guitar className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                    View Available Instruments
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => scrollToSection("instruments-section")}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                  style={{ backgroundColor: "#C57A1F" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#a8661a"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "#C57A1F"}
                >
                  <Guitar className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  View Available Instruments
                </button>
                <button
                  onClick={onContact}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors backdrop-blur-sm bg-white/20 border border-white/30 hover:bg-white/30"
                >
                  <MessageSquare className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  Message Builder
                </button>
              </>
            )}
          </div>
        </div>

        {/* Avatar overlapping bottom of banner */}
        <div className="absolute -bottom-9 left-6 z-20">
          {builder.avatar_url ? (
            <img src={builder.avatar_url} className="w-18 h-18 rounded-full object-cover border-4 border-white shadow-md" style={{ width: 72, height: 72 }} />
          ) : (
            <div className="rounded-full border-4 border-white shadow-md flex items-center justify-center bg-stone-200" style={{ width: 72, height: 72 }}>
              <span className="text-stone-600 font-bold text-2xl">{name[0]}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── BELOW BANNER: rating, social, quick-intro ── */}
      <div className="px-6 pb-6" style={{ paddingTop: "52px" }}>

        {/* Rating + social links */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500 mb-5">
          {avgRating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <strong className="text-stone-700">{avgRating.toFixed(1)}</strong> ({reviewCount} reviews)
            </span>
          )}
          {builder.website_url && (
            <a href={builder.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-stone-800 transition-colors">
              <Globe className="w-3.5 h-3.5" /> Website
            </a>
          )}
          {builder.instagram_url && (
            <a href={builder.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-pink-500 hover:text-pink-700 transition-colors">
              <Instagram className="w-3.5 h-3.5" /> Instagram
            </a>
          )}
          {builder.facebook_url && (
            <a href={builder.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors">
              <Facebook className="w-3.5 h-3.5" /> Facebook
            </a>
          )}
          {builder.x_url && (
            <a href={builder.x_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-stone-800 transition-colors">
              <span className="text-xs font-bold">𝕏</span> X
            </a>
          )}
        </div>

        {/* Quick-intro details */}
        <div className="border-t border-stone-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {builder.years_experience > 0 && (
            <div className="flex items-start gap-2 text-sm">
              <Star className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
              <span className="text-stone-600"><strong className="text-stone-800">{builder.years_experience} years</strong> of experience</span>
            </div>
          )}
          {(builder.offers_stock_builds || builder.offers_custom_builds) && (
            <div className="flex items-start gap-2 text-sm">
              <Guitar className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
              <span className="text-stone-600">
                Offers: <strong className="text-stone-800">
                  {[builder.offers_stock_builds && "Stock Instruments", builder.offers_custom_builds && "Custom Builds"].filter(Boolean).join(" & ")}
                </strong>
              </span>
            </div>
          )}
          {builder.offers_custom_builds && (
            <div className="flex items-start gap-2 text-sm">
              <Hammer className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
              <span className="text-stone-600">
                Custom builds available
                {builder.typical_build_time && <> · typical delivery <strong className="text-stone-800">{builder.typical_build_time}</strong></>}
              </span>
            </div>
          )}
          {!builder.offers_custom_builds && builder.typical_build_time && (
            <div className="flex items-start gap-2 text-sm">
              <Clock className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
              <span className="text-stone-600">Typical build time: <strong className="text-stone-800">{builder.typical_build_time}</strong></span>
            </div>
          )}
          {builder.deposit_required && (
            <div className="flex items-start gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
              <span className="text-stone-600">
                Deposit required: <strong className="text-stone-800">
                  {builder.deposit_type === "percent" && builder.deposit_percent
                    ? `${builder.deposit_percent}%`
                    : builder.deposit_fixed_amount
                    ? `$${builder.deposit_fixed_amount.toLocaleString()}`
                    : "Yes"}
                </strong>
              </span>
            </div>
          )}
          {builder.pricing_notes && (
            <div className="flex items-start gap-2 text-sm sm:col-span-2">
              <DollarSign className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
              <span className="text-stone-600">{builder.pricing_notes}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}