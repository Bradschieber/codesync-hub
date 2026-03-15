import { MapPin, Globe, Facebook, Instagram, Star, Award, Heart, HeartOff, MessageSquare, Hammer, Clock, DollarSign, Guitar } from "lucide-react";

const COLOR_SCHEMES = {
  "earthy": {
    banner: "from-amber-900 to-stone-800",
    accent: "bg-amber-600 hover:bg-amber-500",
    accentText: "text-amber-700",
    accentBg: "bg-amber-50",
    accentBorder: "border-amber-200",
    tabActive: "border-amber-500 text-amber-700",
    sectionBg: "bg-amber-50",
  },
  "dark-wood": {
    banner: "from-stone-900 to-amber-950",
    accent: "bg-stone-800 hover:bg-stone-700",
    accentText: "text-stone-800",
    accentBg: "bg-stone-100",
    accentBorder: "border-stone-300",
    tabActive: "border-stone-700 text-stone-800",
    sectionBg: "bg-stone-100",
  },
  "slate": {
    banner: "from-slate-800 to-slate-600",
    accent: "bg-slate-700 hover:bg-slate-600",
    accentText: "text-slate-700",
    accentBg: "bg-slate-50",
    accentBorder: "border-slate-200",
    tabActive: "border-slate-600 text-slate-700",
    sectionBg: "bg-slate-50",
  },
  "warm-cream": {
    banner: "from-orange-800 to-amber-700",
    accent: "bg-orange-700 hover:bg-orange-600",
    accentText: "text-orange-700",
    accentBg: "bg-orange-50",
    accentBorder: "border-orange-200",
    tabActive: "border-orange-600 text-orange-700",
    sectionBg: "bg-orange-50",
  },
  "midnight": {
    banner: "from-indigo-950 to-slate-900",
    accent: "bg-indigo-700 hover:bg-indigo-600",
    accentText: "text-indigo-700",
    accentBg: "bg-indigo-50",
    accentBorder: "border-indigo-200",
    tabActive: "border-indigo-600 text-indigo-700",
    sectionBg: "bg-indigo-50",
  },
};

export function getScheme(key) {
  return COLOR_SCHEMES[key] || COLOR_SCHEMES["earthy"];
}

export default function StorefrontHeader({ builder, avgRating, reviewCount, saved, onToggleSave, onContact }) {
  const scheme = getScheme(builder.storefront_color_scheme);
  const layout = builder.storefront_layout || "classic";

  const bannerHeight = layout === "bold" ? "h-64" : layout === "editorial" ? "h-80" : "h-40";

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden mb-6">
      {/* Banner */}
      <div className={`${bannerHeight} bg-gradient-to-r ${scheme.banner} relative`}>
        {builder.banner_image_url ? (
          <img
            src={builder.banner_image_url}
            alt="Banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800')] bg-cover bg-center" />
        )}
        {builder.is_featured && (
          <span className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
            <Award className="w-3 h-3" /> Featured Builder
          </span>
        )}
        {layout === "editorial" && (
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-3xl font-bold drop-shadow-lg">{builder.business_name || builder.display_name}</h1>
            {builder.location && (
              <p className="text-white/80 text-sm flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{builder.location}</p>
            )}
          </div>
        )}
      </div>

      {/* Avatar + identity — below banner, no overlap */}
      <div className="px-6 pt-5 pb-6">
        {/* Top row: avatar/logo + CTAs */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            {builder.avatar_url ? (
              <img src={builder.avatar_url} className="w-16 h-16 rounded-full object-cover border-2 border-stone-200 shadow-sm flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-stone-100 border-2 border-stone-200 flex items-center justify-center flex-shrink-0">
                <span className="text-stone-500 font-bold text-2xl">{(builder.business_name || "B")[0]}</span>
              </div>
            )}
            {builder.logo_url && (
              <div className="h-12 bg-white rounded-lg border border-stone-200 shadow-sm flex items-center justify-center p-2">
                <img src={builder.logo_url} alt="Logo" className="max-h-full max-w-24 object-contain" />
              </div>
            )}
          </div>
          {/* Save + Contact — top right */}
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={onToggleSave} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${saved ? "bg-red-50 border-red-200 text-red-600" : "border-stone-300 text-stone-500 hover:border-stone-400"}`}>
              {saved ? <HeartOff className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
              <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
            </button>
            <button onClick={onContact} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors" style={{ backgroundColor: "#2F3E55" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#1e2e42"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#2F3E55"}>
              <MessageSquare className="w-4 h-4" /> Message
            </button>
          </div>
        </div>

        {/* Name + badges */}
        {layout !== "editorial" && (
          <div className="mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-stone-900">{builder.business_name || builder.display_name}</h1>
              {builder.is_verified && (
                <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.19 8.62L2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2z"/></svg>
                  Verified Builder
                </span>
              )}
              {builder.founding_builder && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full border" style={{ backgroundColor: "#FDF3E3", color: "#C57A1F", borderColor: "#F0D4A0" }}>
                  Founding Builder
                </span>
              )}
            </div>
            {builder.location && (
              <p className="text-stone-400 text-sm flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {builder.location}</p>
            )}
          </div>
        )}

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
                Offers:{" "}
                <strong className="text-stone-800">
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
          {(builder.deposit_required) && (
            <div className="flex items-start gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
              <span className="text-stone-600">
                Deposit required:{" "}
                <strong className="text-stone-800">
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