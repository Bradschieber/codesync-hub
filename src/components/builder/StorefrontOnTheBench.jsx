import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { formatDistanceToNow } from "date-fns";

export default function StorefrontOnTheBench({ builderId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!builderId) return;
    loadPosts();
  }, [builderId]);

  async function loadPosts() {
    const [workshopPosts, buildUpdates] = await Promise.all([
      base44.entities.WorkshopPost.filter({ builder_id: builderId }, "-created_date", 20),
      base44.entities.BuildUpdate.filter({ builder_id: builderId }, "-created_date", 20),
    ]);

    const merged = [
      ...workshopPosts.map(p => ({
        id: "wp_" + p.id,
        photo: p.photo_url,
        caption: p.caption,
        date: p.created_date,
        source: "workshop",
        tags: p.tags,
      })),
      ...buildUpdates.map(u => ({
        id: "bu_" + u.id,
        photo: u.photo_urls?.[0] || null,
        caption: u.description || u.title,
        title: u.title,
        date: u.created_date,
        source: "build_update",
        tag: u.tag,
      })),
    ];

    merged.sort((a, b) => new Date(b.date) - new Date(a.date));
    setPosts(merged.slice(0, 12));
    setLoading(false);
  }

  if (loading || posts.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden mb-4">
      <div className="px-6 pt-6 pb-2 border-b border-stone-100">
        <h2 className="text-base font-bold text-stone-800">On The Bench</h2>
        <p className="text-xs text-stone-400 mt-0.5">Live workshop activity</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {posts.map(post => (
            <div key={post.id} className="group">
              {post.photo ? (
                <div className="rounded-xl overflow-hidden aspect-square bg-stone-100 mb-2">
                  <img
                    src={post.photo}
                    alt={post.caption || "Workshop"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="rounded-xl aspect-square bg-stone-100 mb-2 flex items-center justify-center">
                  <span className="text-3xl">🔨</span>
                </div>
              )}
              {(post.caption || post.title) && (
                <p className="text-xs text-stone-700 leading-snug line-clamp-2 mb-1">
                  {post.source === "build_update" && post.title && post.caption !== post.title ? (
                    <><span className="font-medium">{post.title}</span><br />{post.caption}</>
                  ) : (
                    post.caption
                  )}
                </p>
              )}
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs text-stone-400">
                  {post.date ? formatDistanceToNow(new Date(post.date), { addSuffix: true }) : ""}
                </p>
                {post.source === "build_update" && post.tag && (
                  <span className="text-xs text-stone-400">· {post.tag}</span>
                )}
                {post.tags?.slice(0, 1).map(tag => (
                  <span key={tag} className="text-xs px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-500">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}