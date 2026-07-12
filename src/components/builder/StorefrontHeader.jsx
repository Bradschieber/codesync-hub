import { MapPin, Globe, Facebook, Instagram, Star, Award, Heart, HeartOff, MessageSquare, Hammer, Clock, DollarSign, Guitar, Package, Check } from "lucide-react";

const NAVY = "#1B2B4B";

const COLOR_SCHEMES = {
  "earthy": { banner: "from-stone-800 to-stone-700", accentText: "text-stone-800", accentBg: "bg-stone-50", accentBorder: "border-stone-200", sectionBg: "bg-stone-50" },
  "dark-wood": { banner: "from-stone-900 to-stone-800", accentText: "text-stone-800", accentBg: "bg-stone-100", accentBorder: "border-stone-300", sectionBg: "bg-stone-100" },
  "slate": { banner: "from-slate-800 to-slate-600", accentText: "text-slate-700", accentBg: "bg-slate-50", accentBorder: "border-slate-200", sectionBg: "bg-slate-50" },
  "warm-cream": { banner: "from-stone-700 to-stone-600", accentText: "text-stone-800", accentBg: "bg-stone-50", accentBorder: "border-stone-200", sectionBg: "bg-stone-50" },
  "midnight": { banner: "from-indigo-950 to-slate-900", accentText: "text-indigo-700", accentBg: "bg-indigo-50", accentBorder: "border-indigo-200", sectionBg: "bg-indigo-50" },
};

export function getScheme(key) {
  return COLOR_SCHEMES[key] || COLOR_SCHEMES["earthy"];
}

// "classic" = text covers most of the banner (good for no/weak banner image)
// "showcase" = taller banner with text at the bottom, banner image can breathe
const LAYOUT_CONFIG = {
  classic: {
    bannerMinHeight: "180px",
    overlayStyle: { background: "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 100%)" },
    contentPadding: { paddingTop: "48px", paddingBottom: "52px" },
    avatarOffset: "-bottom-9",
  },
  showcase: {
    bannerMinHeight: "340px",
    overlayStyle: { background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%)" },
    contentPadding: { paddingTop: "220px", paddingBottom: "32px" },
    avatarOffset: "-bottom-9",
  },
};

export default function StorefrontHeader({ builder, avgRating, reviewCount, orderCount = 0, saved, onToggleSave, onContact, onRequestQuote }) {
  const scheme = getScheme(builder.storefront_color_scheme);
  const layout = LAYOUT_CONFIG[builder.storefront_layout] || LAYOUT_CONFIG["classic"];
  const name = builder.business_name || builder.display_name || "Builder";

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const facts = [];
  const instrumentTypes = builder.instrument_types_built || [];
  if (instrumentTypes.length > 0) {
    const labels = instrumentTypes.map(i => i.type === "Other" && i.other_description ? i.other_description : i.type);
    facts.push({ icon: Guitar, label: labels.join(", ") });
  }
  if (builder.years_experience > 0) facts.push({ icon: Star, label: `${builder.years_experience}+ Years Building` });
  if (builder.offers_custom_builds) {
    facts.push({ icon: Hammer, label: "Custom Builds Available" });
    if (builder.typical_build_time) facts.push({ icon: Clock, label: `Typical Custom Build Time: ${builder.typical_build_time}` });
    if (builder.deposit_required) {
      const depositVal = builder.deposit_type === "percent" && builder.deposit_percent
        ? `${builder.deposit_percent}%`
        : builder.deposit_fixed_amount
        ? `$${builder.deposit_fixed_amount.toLocaleString()}`
        : "Required";
      facts.push({ icon: DollarSign, label: `Custom Build Deposit: ${depositVal}` });
    }
  }
  const shipsLabel =
    builder.ships_domestically && builder.ships_internationally ? "Ships Domestic & International"
    : builder.ships_internationally ? "Ships Internationally"
    : builder.ships_domestically ? "Ships Domestically"
    : null;
  if (shipsLabel) facts.push({ icon: Package, label: shipsLabel });

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden mb-6">

      {/* ── BANNER ── */}
      <div
        className={`relative bg-gradient-to-r ${scheme.banner}`}
        style={{ minHeight: layout.bannerMinHeight }}
      >
        {builder.banner_image_url ? (
          <img src={builder.banner_image_url} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800')] bg-cover bg-center" />
        )}

        {/* Overlay — heavier on left for "classic", gradient-from-bottom for "showcase" */}
        <div className="absolute inset-0" style={layout.overlayStyle} />

        {builder.is_featured && (
          <span className="absolute top-4 left-4 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 z-10" style={{ backgroundColor: NAVY }}>
            <Award className="w-3 h-3" /> Featured Builder
          </span>
        )}

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
            <MessageSquare className="w-4 h-4" /> <span className="hidden sm:inline">Message {name}</span><span className="sm:hidden">Message</span>
          </button>
        </div>

        {/* Hero text */}
        <div className="relative z-10 px-6 sm:px-8" style={layout.contentPadding}>
          <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-md mb-1">{name}</h1>
          {builder.tag_line && (
            <p className="text-white/80 text-base mb-2 max-w-xl">{builder.tag_line}</p>
          )}
          {builder.location && (
            <p className="text-white/70 text-sm flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              {builder.location}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap mb-6">
            {builder.is_verified && (
              <span className="flex items-center gap-1 text-xs font-semibold text-white bg-white/20 border border-white/30 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.19 8.62L2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2z"/></svg>
                Verified
              </span>
            )}
            {builder.founding_builder && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-white/30 bg-white/15 text-white/90 backdrop-blur-sm">
                Founding Builder
              </span>
            )}
            {reviewCount === 0 && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-white/30 bg-white/15 text-white/90 backdrop-blur-sm">
                New Builder
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {builder.offers_custom_builds && (
              <button
                onClick={onRequestQuote}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: NAVY }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
              >
                <Hammer className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                Request Custom Build
              </button>
            )}
            {!builder.offers_custom_builds && (
              <button
                onClick={() => scrollToSection("instruments-section")}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: NAVY }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
              >
                <Guitar className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                View Available Instruments
              </button>
            )}
            {builder.offers_custom_builds && builder.offers_stock_builds && (
              <button
                onClick={() => scrollToSection("instruments-section")}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors backdrop-blur-sm bg-white/20 border border-white/30 hover:bg-white/30"
              >
                <Guitar className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                View Available Instruments
              </button>
            )}
            <button
              onClick={onContact}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors backdrop-blur-sm bg-white/20 border border-white/30 hover:bg-white/30"
            >
              <MessageSquare className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Message {name}
            </button>
          </div>
        </div>

        {/* Avatar */}
        <div className={`absolute ${layout.avatarOffset} left-6 z-20`}>
          {builder.avatar_url ? (
            <img src={builder.avatar_url} className="rounded-full object-cover border-4 border-white shadow-md" style={{ width: 72, height: 72 }} />
          ) : (
            <div className="rounded-full border-4 border-white shadow-md flex items-center justify-center bg-stone-200" style={{ width: 72, height: 72 }}>
              <span className="text-stone-600 font-bold text-2xl">{name[0]}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── BELOW BANNER ── */}
      <div className="px-6 pb-6" style={{ paddingTop: "52px" }}>
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

        {facts.length > 0 && (
          <div className="border-t border-stone-100 pt-4 flex flex-wrap" style={{ gap: "12px 24px" }}>
            {facts.slice(0, 5).map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-sm text-stone-700">
                <Icon className="w-4 h-4 text-stone-400 flex-shrink-0" />
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        )}

        {(reviewCount === 0 || orderCount < 3) && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500">
            <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
            <span>Purchases protected by Stringed Collective</span>
          </div>
        )}
      </div>
    </div>
  );
}