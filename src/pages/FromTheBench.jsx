import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Camera } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const NAVY = "#1B2B4B";
const PAGE_SIZE = 20;

const TAG_COLORS = {
  "Wood Selection":  { bg: "#FDF3E3", color: "#C57A1F" },
  "Neck Carving":    { bg: "#F0EBF8", color: "#7B5EA7" },
  "Body Shaping":    { bg: "#EEF1F7", color: "#2F3E55" },
  "Electronics":     { bg: "#E8F4FB", color: "#1A8FD1" },
  "Finishing":       { bg: "#E8F6ED", color: "#27AE60" },
  "Setup":           { bg: "#FDF0F0", color: "#CC3A3A" },
  "Sound Test":      { bg: "#FEF9E7", color: "#B7950B" },
  // WorkshopPost tags
  "Stock Build":     { bg: "#EEF1F7", color: "#2F3E55" },
  "Custom Build":    { bg: "#FDF3E3", color: "#C57A1F" },
  "Shop Work":       { bg: "#E8F6ED", color: "#27AE60" },
  "Materials":       { bg: "#F0EBF8", color: "#7B5EA7" },
};

const STAGE_FILTERS = ["Wood Selection", "Neck Carving", "Body Shaping", "Electronics", "Finishing", "Setup", "Sound Test"];

// Normalize both content sources into a unified shape
function normalizeBuildUpdate(u) {
  return {
    id: "bu_" + u.id,
    source: "build_update",
    builder_id: u.builder_id,
    builder_name: u.builder_name,
    builder_avatar_url: u.builder_avatar_url,
    builder_slug: u.builder_slug,
    photo_url: u.photo_urls?.[0] || null,
    caption: u.description || u.title || null,
    tag: u.tag || null,
    created_date: u.created_date,
  };
}

function normalizeWorkshopPost(p) {
  return {
    id: "wp_" + p.id,
    source: "workshop_post",
    builder_id: p.builder_id,
    builder_name: p.builder_name,
    builder_avatar_url: null,
    builder_slug: null,
    photo_url: p.photo_url || null,
    caption: p.caption || null,
    tag: p.tags?.[0] || null,
    created_date: p.created_date,
  };
}

export default function FromTheBench() {
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  useEffect(() => {
    async function load() {
      const [buildUpdates, workshopPosts] = await Promise.all([
        base44.entities.BuildUpdate.filter({ is_public: true }, "-created_date", 200),
        base44.entities.WorkshopPost.filter({ is_public: true }, "-created_date", 200),
      ]);
      const combined = [
        ...buildUpdates.map(normalizeBuildUpdate),
        ...workshopPosts.map(normalizeWorkshopPost),
      ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      setAllPosts(combined);
      setLoading(false);
    }
    load();
  }, []);

  // Reset visible count when filter changes
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [activeTag]);

  const filtered = activeTag === "All" ? allPosts : allPosts.filter(p => p.tag === activeTag);
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setVisibleCount(c => c + PAGE_SIZE);
    }, { rootMargin: "300px" });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, visible.length]);

  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #F2F0EA 0%, #FAF9F7 100%)" }} className="pt-16 pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#8A8A8A" }}>From The Bench</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" style={{ color: "#1A1A1A" }}>
            Watch instruments come to life.
          </h1>
          <p className="text-base leading-relaxed max-w-xl" style={{ color: "#4A4A4A" }}>
            Real updates from independent builders as they craft each instrument — from raw wood to finished build.
          </p>
        </div>
      </div>

      {/* Stage Filters */}
      <div className="sticky top-16 z-10 bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {["All", ...STAGE_FILTERS].map(t => (
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="mb-5 break-inside-avoid rounded-2xl bg-stone-200 animate-pulse" style={{ height: `${200 + (i % 3) * 80}px` }} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-24">
            <Camera className="w-14 h-14 text-stone-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-stone-600 mb-2">Nothing on the bench yet.</p>
            <p className="text-sm text-stone-400 max-w-sm mx-auto leading-relaxed">
              Builders will soon be sharing workshop updates and build progress here.
              Check back soon to watch instruments come to life.
            </p>
          </div>
        ) : (
          <>
            {/* Masonry grid via CSS columns */}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
              {visible.map(post => (
                <BenchCard key={post.id} post={post} />
              ))}
            </div>
            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-1" />
            {!hasMore && visible.length > 0 && (
              <p className="text-center text-xs text-stone-400 mt-10">You've seen it all. Check back soon for new updates.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function BenchCard({ post }) {
  const [hovered, setHovered] = useState(false);
  const tagStyle = post.tag ? TAG_COLORS[post.tag] : null;

  const relativeTime = post.created_date
    ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true })
    : null;

  return (
    <Link
      to={createPageUrl("BuilderProfile?id=" + post.builder_id)}
      className="block mb-5 break-inside-avoid rounded-2xl overflow-hidden bg-white border border-stone-200 transition-all duration-200 cursor-pointer no-underline"
      style={{
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.12)" : "0 1px 4px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Photo — natural aspect ratio */}
      {post.photo_url && (
        <div className="relative overflow-hidden">
          <img
            src={post.photo_url}
            alt={post.caption || "Workshop update"}
            className="w-full h-auto block"
            style={{ display: "block" }}
          />
          {/* Hover overlay */}
          <div
            className="absolute inset-0 flex items-end justify-end p-3 transition-opacity duration-200"
            style={{ opacity: hovered ? 1 : 0, background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)" }}
          >
            <span className="text-white text-xs font-semibold bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
              View Builder
            </span>
          </div>
        </div>
      )}

      {/* Card Text */}
      <div className="px-4 pt-3 pb-4">
        {/* Tag */}
        {tagStyle && post.tag && (
          <span
            className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2"
            style={{ backgroundColor: tagStyle.bg, color: tagStyle.color }}
          >
            {post.tag}
          </span>
        )}

        {/* Caption */}
        {post.caption && (
          <p className="text-sm text-stone-700 leading-snug mb-3 line-clamp-3">{post.caption}</p>
        )}

        {/* Builder + timestamp */}
        <div className="flex items-center gap-2 mt-auto">
          {post.builder_avatar_url ? (
            <img src={post.builder_avatar_url} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
              style={{ backgroundColor: "#EEF1F7", color: NAVY }}>
              {(post.builder_name || "B")[0].toUpperCase()}
            </div>
          )}
          <span className="text-xs font-semibold truncate" style={{ color: NAVY }}>{post.builder_name}</span>
          {relativeTime && (
            <span className="text-xs text-stone-400 flex-shrink-0 ml-auto">{relativeTime}</span>
          )}
        </div>
      </div>
    </Link>
  );
}