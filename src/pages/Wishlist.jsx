import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Heart, Trash2, ChevronLeft, Guitar } from "lucide-react";

export default function Wishlist() {
  const [savedBuilders, setSavedBuilders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      const data = await base44.entities.SavedBuilder.filter({ user_id: u.id }, "-created_date", 50);
      setSavedBuilders(data);
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  async function removeSaved(id) {
    await base44.entities.SavedBuilder.delete(id);
    setSavedBuilders(prev => prev.filter(s => s.id !== id));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link to={createPageUrl("Account")} className="text-stone-400 hover:text-amber-600"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-stone-800">Saved Builders</h1>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-stone-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : savedBuilders.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-600 mb-2">No saved builders</h3>
          <Link to={createPageUrl("Builders")} className="text-amber-600 hover:underline">Discover builders →</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {savedBuilders.map(saved => (
            <div key={saved.id} className="bg-white rounded-2xl border border-stone-200 p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-700 font-bold text-lg">{(saved.builder_name || "B")[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-stone-800 truncate">{saved.builder_name}</h3>
                {saved.notes && <p className="text-stone-400 text-xs truncate mt-0.5">{saved.notes}</p>}
              </div>
              <div className="flex gap-1">
                <Link to={createPageUrl(`BuilderProfile?id=${saved.builder_id}`)} className="p-2 text-stone-400 hover:text-amber-600 rounded-lg text-xs font-medium">View</Link>
                <button onClick={() => removeSaved(saved.id)} className="p-2 text-stone-400 hover:text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}