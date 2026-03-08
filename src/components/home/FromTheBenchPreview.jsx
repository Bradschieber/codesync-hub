import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Tag, MapPin, Camera } from "lucide-react";
import { format } from "date-fns";

const NAVY = "#2F3E55";

const TAG_COLORS = {
  "Wood Selection":  { bg: "#FDF3E3", color: "#C57A1F" },
  "Neck Carving":    { bg: "#F0EBF8", color: "#7B5EA7" },
  "Body Shaping":    { bg: "#EEF1F7", color: "#2F3E55" },
  "Electronics":     { bg: "#E8F4FB", color: "#1A8FD1" },
  "Finishing":       { bg: "#E8F6ED", color: "#27AE60" },
  "Setup":           { bg: "#FDF0F0", color: "#CC3A3A" },
  "Sound Test":      { bg: "#FEF9E7", color: "#B7950B" },
};

export default function FromTheBenchPreview() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.BuildUpdate.filter({ is_public: true }, "-created_date", 6)
      .then(data => { setUpdates(data); setLoading(false); });
  }, []);

  if (!loading && updates.length === 0) return null;

  return (
    <section className="py-20 border-t" style={{ backgroundColor: "#FAF9F7", borderColor: "#E3E0D8" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#8A8A8A" }}>From The Bench</p>
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              Watch instruments<br />come to life.
            </h2>
          </div>
          <Link
            to={createPageUrl("FromTheBench")}
            className="hidden sm:flex items-center gap-1 text-sm font-semibold hover:opacity-70 transition-opacity"
            style={{ color: NAVY }}
          >
            Explore From The Bench <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl bg-stone-200 animate-pulse h-64" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {updates.map(u => <PreviewCard key={u.id} update={u} />)}
          </div>
        )}

        <div className="mt-8 sm:hidden">
          <Link to={createPageUrl("FromTheBench")} className="text-sm font-semibold flex items-center gap-1" style={{ color: NAVY }}>
            Explore From The Bench <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function PreviewCard({ update }) {
  const tagStyle = update.tag ? TAG_COLORS[update.tag] : null;
  const photo = update.photo_urls?.[0];

  return (
    <Link to={createPageUrl("FromTheBench")} className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow block">
      {photo ? (
        <div className="overflow-hidden" style={{ aspectRatio: "16/9" }}>
          <img src={photo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      ) : update.video_url ? (
        <div className="flex items-center justify-center" style={{ aspectRatio: "16/9", backgroundColor: "#1A1A1A" }}>
          <Camera className="w-8 h-8 text-stone-500" />
        </div>
      ) : (
        <div className="flex items-center justify-center" style={{ aspectRatio: "16/9", backgroundColor: "#F2F0EA" }}>
          <Camera className="w-8 h-8 text-stone-300" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
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

        {update.tag && tagStyle && (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium mb-2"
            style={{ backgroundColor: tagStyle.bg, color: tagStyle.color }}>
            <Tag className="w-2.5 h-2.5" /> {update.tag}
          </span>
        )}

        <p className="font-semibold text-sm leading-snug line-clamp-2" style={{ color: "#1A1A1A" }}>{update.title}</p>
      </div>
    </Link>
  );
}