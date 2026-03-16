import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Search, Star, MapPin, Guitar, ArrowRight, User, Play } from "lucide-react";
import BuildersMap from "../components/builders/BuildersMap";
import FeaturedBuilders from "../components/builders/FeaturedBuilders";

const NAVY = "#2F3E55";
const AMBER = "#C57A1F";

export default function Builders() {
  const [builders, setBuilders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { loadBuilders(); }, []);

  async function loadBuilders() {
    const data = await base44.entities.UserProfile.filter({ is_seller: true, is_approved: true }, "-created_date", 100);
    setBuilders(data);
    setLoading(false);
  }

  const filtered = builders.filter(b => {
    if (!search) return true;
    const q = search.toLowerCase();
    const instrumentTypes = (b.instrument_types_built || []).map(i =>
      i.type === "Other" && i.other_description ? i.other_description : i.type
    );
    return (
      b.business_name?.toLowerCase().includes(q) ||
      b.display_name?.toLowerCase().includes(q) ||
      b.location?.toLowerCase().includes(q) ||
      b.specialties?.some(s => s.toLowerCase().includes(q)) ||
      instrumentTypes.some(t => t.toLowerCase().includes(q))
    );
  });

  const videoBuilders = builders.filter(b => b.introduction_video_url).slice(0, 3);

  return (
    <div style={{ backgroundColor: "#F7F6F3", minHeight: "100vh" }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ background: "linear-gradient(180deg, #F2F0EA 0%, #F7F6F3 100%)" }} className="pt-14 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight" style={{ color: "#1A1A1A" }}>Meet our Builders</h1>
          <p className="text-base" style={{ color: "#5A5A5A" }}>Independent makers. Verified craft. Real stories.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── FEATURED BUILDERS ── */}
        <FeaturedBuilders builders={builders} />

        {/* ── MEET THE BUILDER VIDEOS ── */}
        {videoBuilders.length > 0 && (
          <section className="mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: "#6B6B6B" }}>
              Meet the Builder
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoBuilders.map(b => <VideoCard key={b.id} builder={b} />)}
            </div>
          </section>
        )}

        {/* ── MAP ── */}
        <BuildersMap builders={builders} />

        {/* ── SEARCH ── */}
        <div className="max-w-md mb-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9A9A9A" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search builders by name, location, or instrument type"
              className="w-full pl-9 pr-4 py-3 border text-sm focus:outline-none"
              style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF", color: "#1A1A1A" }}
            />
          </div>
        </div>

        {/* ── BUILDER GRID ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse p-6 border" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
                <div className="flex gap-4 mb-4">
                  <div className="w-16 h-16 rounded" style={{ backgroundColor: "#EBEBEB" }} />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 rounded w-3/4" style={{ backgroundColor: "#EBEBEB" }} />
                    <div className="h-3 rounded w-1/2" style={{ backgroundColor: "#EBEBEB" }} />
                  </div>
                </div>
                <div className="h-12 rounded" style={{ backgroundColor: "#F5F5F5" }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Guitar className="w-12 h-12 mx-auto mb-4" style={{ color: "#CCCCCC" }} />
            <h3 className="text-base font-bold mb-1" style={{ color: "#3D3D3D" }}>No builders found</h3>
            <p className="text-sm" style={{ color: "#9A9A9A" }}>Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(builder => <BuilderCard key={builder.id} builder={builder} />)}
          </div>
        )}

        {/* ── BUYER CTA ── */}
        <section className="mt-20 py-14 px-8 sm:px-14 text-center" style={{ backgroundColor: "#F2F0EA" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#7A7A7A" }}>Looking for something specific?</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight" style={{ color: NAVY }}>
            Commission your dream instrument.
          </h2>
          <p className="text-sm leading-relaxed max-w-xl mx-auto mb-8" style={{ color: "#4A4A4A" }}>
            Many of our builders take custom orders. Browse their profiles, explore past work, and reach out directly to start a conversation about your build.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={createPageUrl("CustomBuilds")}
              className="inline-block font-semibold px-8 py-4 text-sm tracking-wide text-white transition-colors"
              style={{ backgroundColor: AMBER }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#a8661a"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = AMBER}
            >
              Explore Custom Builds
            </Link>
            <Link
              to={createPageUrl("Catalog")}
              className="inline-flex items-center gap-1.5 font-semibold text-sm transition-opacity hover:opacity-70"
              style={{ color: NAVY }}
            >
              Browse in-stock instruments <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}

function VideoCard({ builder }) {
  const [playing, setPlaying] = useState(false);

  function getEmbedUrl(url) {
    if (!url) return null;
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    return url;
  }

  const embedUrl = getEmbedUrl(builder.introduction_video_url);

  return (
    <div className="bg-white border overflow-hidden group" style={{ borderColor: "#E0DDD8" }}>
      {/* Video area */}
      <div className="relative" style={{ aspectRatio: "16/9", backgroundColor: "#1A1A1A" }}>
        {playing && embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
            title={builder.business_name || builder.display_name}
          />
        ) : (
          <>
            {builder.avatar_url ? (
              <img src={builder.avatar_url} alt={builder.business_name} className="w-full h-full object-cover opacity-70" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#2C3E55" }}>
                <User className="w-12 h-12 text-white opacity-30" />
              </div>
            )}
            <button
              onClick={() => setPlaying(true)}
              className="absolute inset-0 flex items-center justify-center group/btn"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover/btn:scale-110"
                style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
              >
                <Play className="w-6 h-6 ml-0.5" style={{ color: NAVY }} fill={NAVY} />
              </div>
            </button>
          </>
        )}
      </div>
      {/* Builder info */}
      <div className="p-4">
        <Link to={createPageUrl("BuilderProfile?id=" + builder.id)} className="group/link">
          <h3 className="font-bold text-sm mb-0.5 group-hover/link:underline" style={{ color: "#1A1A1A" }}>
            {builder.business_name || builder.display_name}
          </h3>
        </Link>
        {builder.location && (
          <p className="text-xs flex items-center gap-1 mb-1.5" style={{ color: "#7A7A7A" }}>
            <MapPin className="w-3 h-3 flex-shrink-0" />{builder.location}
          </p>
        )}
        {builder.introduction_video_title && (
          <p className="text-xs italic" style={{ color: "#9A9A9A" }}>"{builder.introduction_video_title}"</p>
        )}
      </div>
    </div>
  );
}

function BuilderCard({ builder }) {
  const [hovered, setHovered] = useState(false);

  const instrumentTypes = (builder.instrument_types_built || []).map(i =>
    i.type === "Other" && i.other_description ? i.other_description : i.type
  );

  // Best preview image: banner > first media > avatar
  const previewImage = builder.banner_image_url || builder.media_urls?.[0] || null;

  return (
    <Link
      to={createPageUrl("BuilderProfile?id=" + builder.id)}
      className="group block border overflow-hidden transition-all duration-300"
      style={{
        borderColor: hovered ? NAVY : "#E0DDD8",
        backgroundColor: "#FFFFFF",
        boxShadow: hovered ? "0 8px 30px rgba(27,43,75,0.1)" : "none",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top image */}
      {previewImage ? (
        <div className="overflow-hidden" style={{ aspectRatio: "16/7", backgroundColor: "#EBEBEB" }}>
          <img src={previewImage} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      ) : builder.avatar_url ? (
        <div className="overflow-hidden" style={{ aspectRatio: "16/7", backgroundColor: "#F2F0EA" }}>
          <img src={builder.avatar_url} alt="" className="w-full h-full object-cover opacity-50" />
        </div>
      ) : (
        <div className="flex items-center justify-center" style={{ aspectRatio: "16/7", backgroundColor: "#F2F0EA" }}>
          <User className="w-10 h-10" style={{ color: "#CCCCCC" }} strokeWidth={1} />
        </div>
      )}

      <div className="p-5">
        {/* Avatar + Name row */}
        <div className="flex gap-3 items-center mb-3">
          {builder.avatar_url ? (
            <img src={builder.avatar_url} alt={builder.business_name || builder.display_name} className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm" />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EEF1F7" }}>
              <User className="w-5 h-5" style={{ color: NAVY }} strokeWidth={1.5} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-sm truncate" style={{ color: "#1A1A1A" }}>{builder.business_name || builder.display_name}</h3>
              {builder.is_verified && (
                <span className="flex-shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5" style={{ backgroundColor: "#EEF1F7", color: NAVY }}>
                  ✓ Verified
                </span>
              )}
            </div>
            {builder.location && (
              <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "#7A7A7A" }}>
                <MapPin className="w-3 h-3 flex-shrink-0" />{builder.location}
              </p>
            )}
          </div>
        </div>

        {/* Instrument types */}
        {instrumentTypes.length > 0 && (
          <p className="text-xs font-medium mb-2" style={{ color: "#4A5566" }}>
            {instrumentTypes.join(" • ")}
          </p>
        )}

        {/* Years experience */}
        {builder.years_experience > 0 && (
          <p className="text-xs mb-3" style={{ color: "#9A9A9A" }}>{builder.years_experience} yrs experience</p>
        )}

        <div
          className="pt-3 border-t text-xs font-semibold flex items-center gap-1 transition-all duration-200"
          style={{ borderColor: "#F0EDE8", color: hovered ? NAVY : "#9A9A9A" }}
        >
          View Profile <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </Link>
  );
}