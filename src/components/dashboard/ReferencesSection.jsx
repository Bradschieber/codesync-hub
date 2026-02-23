import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, CheckCircle, Clock, XCircle } from "lucide-react";

const STATUS_STYLES = {
  pending: { label: "Pending Verification", icon: Clock, className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  verified: { label: "Verified", icon: CheckCircle, className: "bg-green-50 text-green-700 border-green-200" },
  rejected: { label: "Not Verified", icon: XCircle, className: "bg-red-50 text-red-700 border-red-200" },
};

export default function ReferencesSection({ profile }) {
  const [references, setReferences] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ buyer_name: "", quote: "", contact_email: "", contact_phone: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (profile?.id) loadRefs(); }, [profile]);

  async function loadRefs() {
    const refs = await base44.entities.BuilderReference.filter({ builder_id: profile.id });
    setReferences(refs);
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    await base44.entities.BuilderReference.create({
      ...form,
      builder_id: profile.id,
      builder_name: profile.business_name || profile.display_name,
      status: "pending",
    });
    setForm({ buyer_name: "", quote: "", contact_email: "", contact_phone: "" });
    setShowForm(false);
    await loadRefs();
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm("Remove this reference?")) return;
    await base44.entities.BuilderReference.delete(id);
    setReferences(prev => prev.filter(r => r.id !== id));
  }

  const verifiedCount = references.filter(r => r.status === "verified").length;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="font-bold text-stone-800">Buyer References</h2>
          <p className="text-stone-400 text-xs mt-1 leading-relaxed">
            Earn a <strong className="text-blue-600">Verified Builder</strong> badge on your profile and listings by submitting 2 references from past customers.
          </p>
        </div>
        {verifiedCount >= 2 && (
          <span className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.19 8.62L2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2z"/></svg>
            Verified Builder
          </span>
        )}
      </div>

      {/* How it works */}
      <div className="mt-4 bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide">How it works</p>
        <ol className="space-y-1.5">
          {[
            "Submit up to 2 references from past buyers — include their name, a short quote, and a way to contact them.",
            "Our team reaches out to verify each reference is authentic.",
            "Once 2 references are verified, your profile earns the Verified Builder badge, which appears on your public profile and in search listings.",
            "The verified badge builds buyer trust and can lead to more inquiries and sales.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-stone-500 leading-relaxed">
              <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px]">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-4 mb-2 flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${Math.min((verifiedCount / 2) * 100, 100)}%` }}
          />
        </div>
        <span className="text-xs text-stone-500">{verifiedCount}/2 verified</span>
      </div>

      <div className="space-y-3 mt-4">
        {references.map(ref => {
          const { label, icon: Icon, className } = STATUS_STYLES[ref.status] || STATUS_STYLES.pending;
          return (
            <div key={ref.id} className="border border-stone-200 rounded-xl p-4 relative">
              <button
                type="button"
                onClick={() => handleDelete(ref.id)}
                className="absolute top-3 right-3 text-stone-300 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="font-semibold text-stone-700 text-sm mb-1">{ref.buyer_name}</p>
              <p className="text-stone-500 text-sm italic mb-2">"{ref.quote}"</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${className}`}>
                  <Icon className="w-3 h-3" /> {label}
                </span>
                {ref.contact_email && <span className="text-xs text-stone-400">{ref.contact_email}</span>}
                {ref.contact_phone && <span className="text-xs text-stone-400">{ref.contact_phone}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {references.length < 2 && !showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mt-4 flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
        >
          <Plus className="w-4 h-4" /> Add Reference
        </button>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="mt-4 border border-amber-200 rounded-xl p-4 space-y-3 bg-amber-50">
          <p className="text-xs font-semibold text-stone-700">New Reference</p>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Buyer Name *</label>
            <input required value={form.buyer_name} onChange={e => setForm({...form, buyer_name: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" placeholder="Full name" />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Their Quote / Review *</label>
            <textarea required rows={3} value={form.quote} onChange={e => setForm({...form, quote: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none bg-white" placeholder="A brief quote from the buyer about their experience..." />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Buyer Email</label>
              <input type="email" value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" placeholder="For verification" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Buyer Phone</label>
              <input type="tel" value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" placeholder="For verification" />
            </div>
          </div>
          <p className="text-xs text-stone-400">At least one contact method is required for verification.</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-stone-300 text-stone-600 py-2 rounded-xl text-sm">Cancel</button>
            <button type="submit" disabled={saving || (!form.contact_email && !form.contact_phone)} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-medium py-2 rounded-xl text-sm disabled:opacity-50">
              {saving ? "Saving..." : "Submit Reference"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}