import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ChevronLeft } from "lucide-react";
import StorefrontTemplate from "../components/builder/StorefrontTemplate";

export default function BuilderProfile() {
  const [builder, setBuilder] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [customBuilds, setCustomBuilds] = useState([]);
  const [references, setReferences] = useState([]);
  const [user, setUser] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");
  const [showContactForm, setShowContactForm] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const builderId = params.get("id");

  useEffect(() => { loadAll(); }, [builderId]);

  async function loadAll() {
    if (!builderId) return;
    try { const u = await base44.auth.me(); setUser(u); } catch {}
    const [bldrs, prods, revs, customs, refs] = await Promise.all([
      base44.entities.UserProfile.filter({ id: builderId }),
      base44.entities.Product.filter({ builder_id: builderId, status: "available" }),
      base44.entities.BuilderReview.filter({ builder_id: builderId }),
      base44.entities.CustomBuildListing.filter({ builder_id: builderId, is_published: true }),
      base44.entities.BuilderReference.filter({ builder_id: builderId, status: "verified" }),
    ]);
    if (bldrs.length > 0) setBuilder(bldrs[0]);
    setProducts(prods);
    setReviews(revs);
    setCustomBuilds(customs);
    setReferences(refs);
    setLoading(false);
  }

  async function toggleSave() {
    if (!user) { base44.auth.redirectToLogin(); return; }
    if (saved) {
      const items = await base44.entities.SavedBuilder.filter({ user_id: user.id, builder_id: builderId });
      if (items.length > 0) await base44.entities.SavedBuilder.delete(items[0].id);
      setSaved(false);
    } else {
      await base44.entities.SavedBuilder.create({ user_id: user.id, builder_id: builderId, builder_name: builder?.business_name || builder?.display_name });
      setSaved(true);
    }
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-48 bg-stone-200 rounded-2xl mb-6" />
      <div className="h-6 bg-stone-200 rounded w-1/3 mb-3" />
      <div className="h-24 bg-stone-100 rounded" />
    </div>
  );

  if (!builder) return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-center">
      <p className="text-stone-500">Builder not found.</p>
      <Link to={createPageUrl("Builders")} className="text-amber-600 hover:underline mt-2 block">Back to Builders</Link>
    </div>
  );

  return (
    <div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <Link to={createPageUrl("Builders")} className="inline-flex items-center gap-1 text-stone-500 hover:text-amber-600 text-sm">
          <ChevronLeft className="w-4 h-4" /> Back to Builders
        </Link>
      </div>

      <StorefrontTemplate
        builder={builder}
        products={products}
        reviews={reviews}
        customBuilds={customBuilds}
        references={references}
        user={user}
        saved={saved}
        onToggleSave={toggleSave}
        onContact={() => setShowContactForm(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {showContactForm && (
        <ContactModal builder={builder} user={user} onClose={() => setShowContactForm(false)} />
      )}
    </div>
  );
}

function ContactModal({ builder, user, onClose }) {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    if (!user) { base44.auth.redirectToLogin(); return; }
    await base44.entities.Message.create({
      sender_id: user.id,
      sender_name: user.full_name,
      recipient_id: builder.id,
      recipient_name: builder.business_name || builder.display_name,
      subject: `Message from ${user.full_name}`,
      body: msg,
    });
    setSent(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-bold text-stone-800 mb-4">Contact {builder.business_name || builder.display_name}</h3>
        {sent ? (
          <div className="text-center py-6">
            <p className="text-green-600 font-medium">Message sent!</p>
            <button onClick={onClose} className="mt-4 text-stone-500 hover:underline text-sm">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            <textarea
              value={msg}
              onChange={e => setMsg(e.target.value)}
              rows={5}
              required
              placeholder="Write your message..."
              className="w-full border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="flex-1 border border-stone-300 text-stone-600 py-2.5 rounded-xl text-sm">Cancel</button>
              <button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 rounded-xl text-sm">Send Message</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}