import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Star } from "lucide-react";

export default function DashboardRatings() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) {
        const revs = await base44.entities.BuilderReview.filter({ builder_id: profiles[0].id }, "-created_date", 100);
        setReviews(revs);
      }
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const dist = [5, 4, 3, 2, 1].map(n => ({ stars: n, count: reviews.filter(r => r.rating === n).length }));

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Link to={createPageUrl("Dashboard")} className="text-stone-400 hover:text-amber-600"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-stone-800">Ratings & Reviews</h1>
      </div>
      <p className="text-stone-500 mb-6 ml-8">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>

      {reviews.length === 0 ? (
        <div className="text-center py-16">
          <Star className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500">No reviews yet.</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6 flex items-center gap-8">
            <div className="text-center">
              <p className="text-5xl font-bold text-stone-800">{avgRating.toFixed(1)}</p>
              <div className="flex justify-center mt-1">
                {[1,2,3,4,5].map(n => <Star key={n} className={`w-4 h-4 ${n <= Math.round(avgRating) ? "text-amber-400 fill-amber-400" : "text-stone-300"}`} />)}
              </div>
              <p className="text-xs text-stone-400 mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {dist.map(({ stars, count }) => (
                <div key={stars} className="flex items-center gap-2 text-xs text-stone-500">
                  <span className="w-4 text-right">{stars}</span>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <div className="flex-1 bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }} />
                  </div>
                  <span className="w-4">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews list */}
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-stone-200 p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-stone-700 text-sm">{r.reviewer_name}</p>
                    <p className="text-xs text-stone-400">{new Date(r.created_date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex">
                    {[1,2,3,4,5].map(n => <Star key={n} className={`w-4 h-4 ${n <= r.rating ? "text-amber-400 fill-amber-400" : "text-stone-300"}`} />)}
                  </div>
                </div>
                {r.review_text && <p className="text-stone-600 text-sm leading-relaxed">{r.review_text}</p>}
                {r.image_urls?.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {r.image_urls.map((url, i) => (
                      <img key={i} src={url} className="w-16 h-16 rounded-lg object-cover" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}