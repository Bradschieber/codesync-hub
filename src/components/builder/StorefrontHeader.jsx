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

      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-4">
          {builder.avatar_url ? (
            <img src={builder.avatar_url} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-amber-100 border-4 border-white shadow-lg flex items-center justify-center">
              <span className="text-amber-700 font-bold text-3xl">{(builder.business_name || "B")[0]}</span>
            </div>
          )}
          {/* Logo */}
          {builder.logo_url && (
            <div className="w-24 h-16 bg-white rounded-xl border border-stone-200 shadow-md flex items-center justify-center p-2 -mt-8">
              <img src={builder.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
          )}
          {layout !== "editorial" && (
            <div className="sm:flex-1 sm:pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-stone-800">{builder.business_name || builder.display_name}</h1>
                {builder.is_verified && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.19 8.62L2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2z"/></svg>
                    Verified Builder
                  </span>
                )}
              </div>
              {builder.location && (
                <p className="text-stone-400 text-sm flex items-center gap-1"><MapPin className="w-3 h-3" /> {builder.location}</p>
              )}
            </div>
          )}
          {layout === "editorial" && <div className="sm:flex-1" />}
          <div className="flex gap-2 sm:pb-2">
            <button onClick={onToggleSave} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${saved ? "bg-red-50 border-red-200 text-red-600" : "border-stone-300 text-stone-600 hover:border-amber-400"}`}>
              {saved ? <HeartOff className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
              {saved ? "Saved" : "Save"}
            </button>
            <button onClick={onContact} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-medium ${scheme.accent}`}>
              <MessageSquare className="w-4 h-4" /> Contact
            </button>
          </div>
        </div>

        {layout === "editorial" && builder.is_verified && (
          <div className="mb-3">
            <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full inline-flex w-fit">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.19 8.62L2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2z"/></svg>
              Verified Builder
            </span>
          </div>
        )}

        <div className="flex flex-wrap gap-6 text-sm text-stone-600 mb-4">
          {builder.years_experience > 0 && <span><strong className="text-stone-800">{builder.years_experience}</strong> years exp.</span>}
          {avgRating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <strong className="text-stone-800">{avgRating.toFixed(1)}</strong> ({reviewCount} reviews)
            </span>
          )}
          {builder.website_url && (
            <a href={builder.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-amber-600 hover:underline">
              <Globe className="w-3 h-3" /> Website
            </a>
          )}
          {builder.facebook_url && (
            <a href={builder.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
              <Facebook className="w-3 h-3" /> Facebook
            </a>
          )}
          {builder.instagram_url && (
            <a href={builder.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-pink-600 hover:underline">
              <Instagram className="w-3 h-3" /> Instagram
            </a>
          )}
          {builder.x_url && (
            <a href={builder.x_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-stone-700 hover:underline">
              <span className="text-xs font-bold">𝕏</span> X
            </a>
          )}
        </div>
      </div>
    </div>
  );
}