import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, CheckCircle, Clock, XCircle } from "lucide-react";

const NAVY = "#2F3E55";

const STATUS_STYLES = {
  pending: { label: "Pending verification", icon: Clock, bg: "#FFFAF2", border: "#E8D9B8", text: "#7A5A10" },
  verified: { label: "Verified", icon: CheckCircle, bg: "#F4FBF6", border: "#C0DEC8", text: "#1A5A3A" },
  rejected: { label: "Not verified", icon: XCircle, bg: "#FFF8F8", border: "#F0C0C0", text: "#7A2020" },
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
    <div className="border p-6" style={{ borderColor: "#E3E0D8", backgroundColor: "#FFFFFF" }}>
      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="font-bold text-sm" style={{ color: "#1A1A1A" }}>Buyer references</h2>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "#7A7A7A" }}>
            Verified references can strengthen your profile and help you earn a Verified Builder badge once enough approved references are on file.
          </p>
        </div>
        {verifiedCount >= 2 && (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 flex-shrink-0 ml-4" style={{ backgroundColor: "#F4FBF6", border: "1px solid #C0DEC8", color: "#1A5A3A" }}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.19 8.62L2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2z"/></svg>
            Verified Builder
          </span>
        )}
      </div>

      {/* How it works */}
      <div className="mt-4 p-4 space-y-2" style={{ backgroundColor: "#FEFCF7", border: "1px solid #EDE8DE" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#9A8878" }}>How it works</p>
        <ol className="space-y-1.5">
          {[
            "Submit up to 2 references from past buyers, including their name, a short quote, and a way to contact them.",
            "Our team reaches out to verify that each reference is authentic.",
            "Once enough references are verified, your profile can earn the Verified Builder badge.",
            "Verified references can help buyers feel more comfortable starting a conversation.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: "#7A7060" }}>
              <span className="w-4 h-4 rounded-full font-bold flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px]" style={{ backgroundColor: "#F0E8D8", color: "#9A7840" }}>{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Progress bar */}
      <div className="mt-4 mb-2 flex items-center gap-3">
        <div className="flex-1 h-1.5 overflow-hidden" style={{ backgroundColor: "#ECEAE5" }}>
          <div
            className="h-full transition-all"
            style={{ width: `${Math.min((verifiedCount / 2) * 100, 100)}%`, backgroundColor: "#4A9A6A" }}
          />
        </div>
        <span className="text-xs flex-shrink-0" style={{ color: "#9A9A9A" }}>{verifiedCount}/2 verified</span>
      </div>

      {/* Existing references */}
      <div className="space-y-3 mt-4">
        {references.map(ref => {
          const style = STATUS_STYLES[ref.status] || STATUS_STYLES.pending;
          const Icon = style.icon;
          return (
            <div key={ref.id} className="border p-4 relative" style={{ borderColor: style.border, backgroundColor: style.bg }}>
              <button
                type="button"
                onClick={() => handleDelete(ref.id)}
                className="absolute top-3 right-3 transition-colors"
                style={{ color: "#C8C4BC" }}
                onMouseEnter={e => e.currentTarget.style.color = "#DC5050"}
                onMouseLeave={e => e.currentTarget.style.color = "#C8C4BC"}
              >
                <X className="w-4 h-4" />
              </button>
              <p className="font-semibold text-sm mb-1" style={{ color: "#1A1A1A" }}>{ref.buyer_name}</p>
              <p className="text-sm italic mb-2" style={{ color: "#5A5A5A" }}>"{ref.quote}"</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 border" style={{ borderColor: style.border, color: style.text, backgroundColor: "transparent" }}>
                  <Icon className="w-3 h-3" /> {style.label}
                </span>
                {ref.contact_email && <span className="text-xs" style={{ color: "#9A9A9A" }}>{ref.contact_email}</span>}
                {ref.contact_phone && <span className="text-xs" style={{ color: "#9A9A9A" }}>{ref.contact_phone}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add reference CTA */}
      {references.length < 2 && !showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mt-5 flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: "#C8973A" }}
          onMouseEnter={e => e.currentTarget.style.color = "#9A7030"}
          onMouseLeave={e => e.currentTarget.style.color = "#C8973A"}
        >
          <Plus className="w-4 h-4" /> Add a reference
        </button>
      )}

      {/* Add reference form */}
      {showForm && (
        <div className="mt-5 border p-5 space-y-4" style={{ borderColor: "#E8D9B8", backgroundColor: "#FFFAF2" }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#9A8060" }}>Add a reference</p>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#5A5A5A" }}>Buyer name *</label>
            <input
              required
              value={form.buyer_name}
              onChange={e => setForm({...form, buyer_name: e.target.value})}
              className="w-full border px-3 py-2 text-sm focus:outline-none bg-white"
              style={{ borderColor: "#DEDBD6" }}
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#5A5A5A" }}>Buyer quote *</label>
            <textarea
              required
              rows={3}
              value={form.quote}
              onChange={e => setForm({...form, quote: e.target.value})}
              className="w-full border px-3 py-2 text-sm focus:outline-none resize-none bg-white"
              style={{ borderColor: "#DEDBD6" }}
              placeholder="A short note about what it was like to work with you."
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#5A5A5A" }}>Buyer email</label>
              <input
                type="email"
                value={form.contact_email}
                onChange={e => setForm({...form, contact_email: e.target.value})}
                className="w-full border px-3 py-2 text-sm focus:outline-none bg-white"
                style={{ borderColor: "#DEDBD6" }}
                placeholder="For verification"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#5A5A5A" }}>Buyer phone</label>
              <input
                type="tel"
                value={form.contact_phone}
                onChange={e => setForm({...form, contact_phone: e.target.value})}
                className="w-full border px-3 py-2 text-sm focus:outline-none bg-white"
                style={{ borderColor: "#DEDBD6" }}
                placeholder="For verification"
              />
            </div>
          </div>
          <p className="text-xs" style={{ color: "#AAAAAA" }}>At least one contact method is required so our team can verify the reference.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 border py-2 text-sm transition-colors"
              style={{ borderColor: "#DEDBD6", color: "#7A7A7A" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving || (!form.buyer_name || !form.quote) || (!form.contact_email && !form.contact_phone)}
              className="flex-1 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: saving ? "#AAAAAA" : NAVY }}
            >
              {saving ? "Saving..." : "Submit reference"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}