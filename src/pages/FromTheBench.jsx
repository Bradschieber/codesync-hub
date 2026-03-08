import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Tag, MapPin, Camera, ExternalLink, Copy, Check } from "lucide-react";
import { format } from "date-fns";

const NAVY = "#1B2B4B";

const TAG_COLORS = {
  "Wood Selection":  { bg: "#FDF3E3", color: "#C57A1F" },
  "Neck Carving":    { bg: "#F0EBF8", color: "#7B5EA7" },
  "Body Shaping":    { bg: "#EEF1F7", color: "#2F3E55" },
  "Electronics":     { bg: "#E8F4FB", color: "#1A8FD1" },
  "Finishing":       { bg: "#E8F6ED", color: "#27AE60" },
  "Setup":           { bg: "#FDF0F0", color: "#CC3A3A" },
  "Sound Test":      { bg: "#FEF9E7", color: "#B7950B" },
};

const ALL_TAGS = ["Wood Selection", "Neck Carving", "Body Shaping", "Electronics", "Finishing", "Setup", "Sound Test"];

export default function FromTheBench() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState("All");
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    base44.entities.BuildUpdate.filter({ is_public: true }, "-created_date", 100)
      .then(data => { setUpdates(data); setLoading(false); });
  }, []);

  const filtered = activeTag === "All" ? updates : updates.filter(u => u.tag === activeTag);

  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #F2F0EA 0%, #FAF9F7 100%)" }} className="pt-16 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#8A8A8A" }}>From The Bench</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" style={{ color: "#1A1A1A" }}>
            Watch instruments come to life.
          </h1>
          <p className="text-base leading-relaxed max-w-xl" style={{ color: "#4A4A4A" }}>
            Real updates from independent builders as they craft each instrument — from raw wood to finished build.
          </p>
        </div>
      </div>

      {/* Tag Filter */}
      <div className="sticky top-16 z-10 bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 overflow-x-auto">
          {["All", ...ALL_TAGS].map(t => (
            <button
              key={t}
              onClick={() => setActiveTag(t)}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all font-medium"
              style={activeTag === t
                ? { backgroundColor: NAVY, color: "#fff", borderColor: NAVY }
                : { backgroundColor: "#fff", color: "#555", borderColor: "#D1CCC4" }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl bg-stone-200 animate-pulse h-72" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Camera className="w-14 h-14 text-stone-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-stone-500 mb-1">Nothing here yet</p>
            <p className="text-sm text-stone-400">Builders will share their work-in-progress updates here.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {filtered.map(update => (
              <BenchPost key={update.id} update={update} onLightbox={setLightbox} />
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} className="max-w-full max-h-full rounded-xl shadow-2xl" />
        </div>
      )}
    </div>
  );
}

function BenchPost({ update, onLightbox }) {
  const [copied, setCopied] = useState(false);
  const tagStyle = update.tag ? TAG_COLORS[update.tag] : null;
  const primaryPhoto = update.photo_urls?.[0];

  function copyLink() {
    navigator.clipboard.writeText(window.location.origin + "/from-the-bench#" + update.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div id={update.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col">

      {/* Media */}
      {primaryPhoto ? (
        <button onClick={() => onLightbox(primaryPhoto)} className="block overflow-hidden" style={{ aspectRatio: "16/9" }}>
          <img src={primaryPhoto} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        </button>
      ) : update.video_url ? (
        <div style={{ aspectRatio: "16/9" }}>
          <video src={update.video_url} controls className="w-full h-full object-cover bg-black" />
        </div>
      ) : null}

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Builder info */}
        <div className="flex items-center gap-2 mb-3">
          {update.builder_avatar_url ? (
            <img src={update.builder_avatar_url} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EEF1F7" }}>
              <span className="text-xs font-bold" style={{ color: NAVY }}>
                {(update.builder_name || "B")[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate" style={{ color: NAVY }}>{update.builder_name}</p>
            {update.builder_location && (
              <p className="text-xs flex items-center gap-0.5" style={{ color: "#8A8A8A" }}>
                <MapPin className="w-2.5 h-2.5 flex-shrink-0" />{update.builder_location}
              </p>
            )}
          </div>
          <p className="text-xs text-stone-400 flex-shrink-0">
            {update.created_date ? format(new Date(update.created_date), "MMM d") : ""}
          </p>
        </div>

        {/* Tag */}
        {update.tag && tagStyle && (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium mb-2 self-start"
            style={{ backgroundColor: tagStyle.bg, color: tagStyle.color }}>
            <Tag className="w-2.5 h-2.5" /> {update.tag}
          </span>
        )}

        {/* Title & description */}
        <h3 className="font-bold text-sm mb-1.5 leading-snug" style={{ color: "#1A1A1A" }}>{update.title}</h3>
        {update.description && (
          <p className="text-sm text-stone-600 leading-relaxed line-clamp-3 flex-1">{update.description}</p>
        )}

        {/* Extra photos strip */}
        {update.photo_urls?.length > 1 && (
          <div className="flex gap-1.5 mt-3 overflow-x-auto">
            {update.photo_urls.slice(1).map((url, i) => (
              <button key={i} onClick={() => onLightbox(url)} className="flex-shrink-0">
                <img src={url} className="w-12 h-12 object-cover rounded-lg border border-stone-100 hover:opacity-80 transition-opacity" />
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-100 flex-wrap">
          {update.builder_id && (
            <>
              <Link
                to={createPageUrl("BuilderProfile?id=" + update.builder_id)}
                className="text-xs font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity"
                style={{ color: NAVY }}
              >
                View Profile <ArrowRight className="w-3 h-3" />
              </Link>
              <span className="text-stone-200">|</span>
              <Link
                to={createPageUrl("Catalog") + "?builder=" + encodeURIComponent(update.builder_name || "")}
                className="text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors"
              >
                See Instruments
              </Link>
            </>
          )}
          <span className="text-stone-200 ml-auto">|</span>
          <button onClick={copyLink}
            className="text-xs font-medium flex items-center gap-1 text-stone-400 hover:text-stone-700 transition-colors ml-auto">
            {copied ? <><Check className="w-3 h-3 text-green-500" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy Link</>}
          </button>
        </div>
      </div>
    </div>
  );
}