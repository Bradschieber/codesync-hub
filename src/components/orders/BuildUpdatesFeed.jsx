import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Camera, Video, Tag } from "lucide-react";
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

export default function BuildUpdatesFeed({ orderId }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    base44.entities.BuildUpdate.filter({ order_id: orderId }, "created_date", 100)
      .then(data => { setUpdates(data); setLoading(false); });
  }, [orderId]);

  if (loading) return (
    <div className="space-y-3 mt-2">
      {[0, 1].map(i => <div key={i} className="h-20 bg-stone-100 rounded-xl animate-pulse" />)}
    </div>
  );

  if (updates.length === 0) return (
    <div className="text-center py-6 rounded-xl bg-stone-50 border border-stone-100">
      <Camera className="w-8 h-8 text-stone-300 mx-auto mb-2" />
      <p className="text-sm text-stone-400">No build updates yet.</p>
      <p className="text-xs text-stone-300 mt-1">Your builder will share progress updates here.</p>
    </div>
  );

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-stone-200" />

      <div className="space-y-5 pl-10">
        {updates.map((u, i) => {
          const tagStyle = u.tag ? TAG_COLORS[u.tag] : null;
          return (
            <div key={u.id} className="relative">
              {/* Dot */}
              <div
                className="absolute -left-10 top-2 w-4 h-4 rounded-full border-2 border-white"
                style={{ backgroundColor: i === 0 ? NAVY : "#D1CCC4" }}
              />

              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-4 pt-3 pb-2">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm" style={{ color: "#1A1A1A" }}>{u.title}</p>
                      {u.tag && tagStyle && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: tagStyle.bg, color: tagStyle.color }}>
                          <Tag className="w-2.5 h-2.5" /> {u.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 flex-shrink-0">
                      {u.created_date ? format(new Date(u.created_date), "MMM d, yyyy") : ""}
                    </p>
                  </div>
                  {u.description && (
                    <p className="text-sm text-stone-600 leading-relaxed">{u.description}</p>
                  )}
                </div>

                {/* Photos */}
                {u.photo_urls?.length > 0 && (
                  <div className="px-4 pb-3">
                    <div className="flex gap-2 flex-wrap">
                      {u.photo_urls.map((url, pi) => (
                        <button key={pi} onClick={() => setLightbox(url)}
                          className="overflow-hidden rounded-lg border border-stone-100 hover:opacity-90 transition-opacity">
                          <img src={url} className="w-20 h-20 object-cover" alt={`Build photo ${pi + 1}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video */}
                {u.video_url && (
                  <div className="px-4 pb-3">
                    <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1.5">
                      <Video className="w-3.5 h-3.5" /> Video update
                    </div>
                    <video
                      src={u.video_url}
                      controls
                      className="w-full rounded-lg max-h-64 bg-black"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Photo lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} className="max-w-full max-h-full rounded-xl shadow-2xl" />
        </div>
      )}
    </div>
  );
}