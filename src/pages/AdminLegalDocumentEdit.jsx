import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { FileText, ShieldCheck, Save, Globe, ArrowLeft, AlertTriangle } from "lucide-react";

const NAVY = "#2F3E55";

const DOC_TYPE_LABELS = {
  terms_of_use:   "Terms of Use",
  privacy_policy: "Privacy Policy",
  builder_terms:  "Builder Terms",
  buyer_terms:    "Buyer Terms",
};

const DOC_SLUGS = {
  terms_of_use:   "terms-of-use",
  privacy_policy: "privacy-policy",
  builder_terms:  "builder-terms",
  buyer_terms:    "buyer-terms",
};

function StatusBadge({ status }) {
  const styles = {
    active:   { backgroundColor: "#E8F5EE", color: "#2E7D52" },
    draft:    { backgroundColor: "#FEF3E2", color: "#C57A1F" },
    archived: { backgroundColor: "#F0EFED", color: "#7A7A7A" },
  };
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={styles[status] || styles.archived}>
      {status}
    </span>
  );
}

export default function AdminLegalDocumentEdit() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const docId = params.get("id");

  const [user, setUser] = useState(null);
  const [doc, setDoc] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadData(); }, [docId]);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      if (u.role !== "admin") { setLoading(false); return; }
      if (docId) {
        const results = await base44.entities.LegalDocument.filter({ id: docId });
        if (results.length > 0) {
          setDoc(results[0]);
          setForm(results[0]);
        }
      }
    } catch {
      base44.auth.redirectToLogin();
    }
    setLoading(false);
  }

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function saveDraft() {
    setSaving(true);
    await base44.entities.LegalDocument.update(docId, { ...form, status: "draft" });
    setDoc(prev => ({ ...prev, ...form, status: "draft" }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  }

  async function publishVersion() {
    if (!window.confirm("Publishing will archive the current active version and make this the new active version. Continue?")) return;
    setPublishing(true);

    // Archive existing active version of same type
    const existing = await base44.entities.LegalDocument.filter({ document_type: form.document_type, status: "active" });
    for (const old of existing) {
      await base44.entities.LegalDocument.update(old.id, { status: "archived" });
    }

    // Publish this draft
    const slug = DOC_SLUGS[form.document_type];
    await base44.entities.LegalDocument.update(docId, {
      ...form,
      status: "active",
      published_at: new Date().toISOString(),
      published_by: user.email,
      public_url: `/legal/${slug}`,
    });

    setPublishing(false);
    navigate("/AdminLegalDocuments");
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
    </div>
  );

  if (user?.role !== "admin") return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <ShieldCheck className="w-12 h-12 mx-auto mb-4" style={{ color: "#CCCCCC" }} />
      <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
    </div>
  );

  if (!doc) return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: "#CCCCCC" }} />
      <h2 className="text-xl font-bold mb-2">Document not found</h2>
      <Link to="/AdminLegalDocuments" className="text-sm underline" style={{ color: NAVY }}>Back to Legal Documents</Link>
    </div>
  );

  const isActive = doc.status === "active";
  const slug = DOC_SLUGS[form.document_type];

  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-12 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/AdminLegalDocuments" className="inline-flex items-center gap-1.5 text-sm mb-5 transition-colors" style={{ color: "#6A6A6A" }}
            onMouseEnter={e => e.currentTarget.style.color = NAVY}
            onMouseLeave={e => e.currentTarget.style.color = "#6A6A6A"}>
            <ArrowLeft className="w-4 h-4" /> Back to Legal Documents
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
              {DOC_TYPE_LABELS[form.document_type] || "Legal Document"}
            </h1>
            <StatusBadge status={doc.status} />
            {form.version_number && (
              <span className="text-sm font-medium px-2.5 py-1" style={{ backgroundColor: "#EEF1F7", color: NAVY }}>
                v{form.version_number}
              </span>
            )}
          </div>
          {form.effective_date && (
            <p className="text-sm mt-1" style={{ color: "#7A7A7A" }}>
              Effective {new Date(form.effective_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Active version warning */}
        {isActive && (
          <div className="flex items-start gap-3 p-4 border" style={{ borderColor: "#E8D9B8", backgroundColor: "#FFFAF2" }}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#C57A1F" }} />
            <p className="text-sm" style={{ color: "#7A4A10" }}>
              This is the currently active version. It is read-only. To make changes, go back and click <strong>New Version</strong> to create an editable draft.
            </p>
          </div>
        )}

        {/* Publish workflow note */}
        {!isActive && (
          <div className="flex items-start gap-3 p-4 border" style={{ borderColor: "#C8DEC8", backgroundColor: "#F4FBF4" }}>
            <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#2E7D52" }} />
            <p className="text-sm" style={{ color: "#2E5030" }}>
              Publishing creates a new active version and preserves the prior version for acceptance records.
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="bg-white border p-6 space-y-5" style={{ borderColor: "#E0DDD8" }}>
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#7A7A7A" }}>Document Details</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#5A5A5A" }}>Public Title</label>
              <input
                value={form.public_title || ""}
                onChange={e => set("public_title", e.target.value)}
                disabled={isActive}
                className="w-full border px-3 py-2 text-sm focus:outline-none disabled:bg-stone-50 disabled:text-stone-400"
                style={{ borderColor: "#DEDBD6" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#5A5A5A" }}>Version Number</label>
              <input
                value={form.version_number || ""}
                onChange={e => set("version_number", e.target.value)}
                disabled={isActive}
                className="w-full border px-3 py-2 text-sm focus:outline-none disabled:bg-stone-50 disabled:text-stone-400"
                style={{ borderColor: "#DEDBD6" }}
                placeholder="e.g. 1.0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#5A5A5A" }}>Effective Date</label>
              <input
                type="date"
                value={form.effective_date || ""}
                onChange={e => set("effective_date", e.target.value)}
                disabled={isActive}
                className="w-full border px-3 py-2 text-sm focus:outline-none disabled:bg-stone-50 disabled:text-stone-400"
                style={{ borderColor: "#DEDBD6" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#5A5A5A" }}>Public URL</label>
              <div className="flex items-center gap-2 border px-3 py-2 text-sm" style={{ borderColor: "#DEDBD6", backgroundColor: "#FAFAF8" }}>
                <Globe className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#9A9A9A" }} />
                <span style={{ color: "#7A7A7A" }}>/legal/{slug}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="bg-white border p-6" style={{ borderColor: "#E0DDD8" }}>
          <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#7A7A7A" }}>Document Body</label>
          {isActive ? (
            <div className="border p-4 text-sm leading-relaxed whitespace-pre-wrap" style={{ borderColor: "#ECEAE5", backgroundColor: "#FAFAF8", color: "#3A3A3A", minHeight: "300px" }}>
              {form.body_content || <span style={{ color: "#BBBBBB" }}>No content.</span>}
            </div>
          ) : (
            <textarea
              rows={20}
              value={form.body_content || ""}
              onChange={e => set("body_content", e.target.value)}
              placeholder="Paste or write the full document content here..."
              className="w-full border px-3 py-2.5 text-sm focus:outline-none resize-y leading-relaxed"
              style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF", fontFamily: "inherit" }}
            />
          )}
        </div>

        {/* Internal notes */}
        <div className="bg-white border p-6" style={{ borderColor: "#E0DDD8" }}>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#7A7A7A" }}>Internal Notes <span className="normal-case font-normal">(optional)</span></label>
          <textarea
            rows={3}
            value={form.notes || ""}
            onChange={e => set("notes", e.target.value)}
            disabled={isActive}
            placeholder="Notes for internal reference only — not shown publicly."
            className="w-full border px-3 py-2.5 text-sm focus:outline-none resize-none disabled:bg-stone-50 disabled:text-stone-400"
            style={{ borderColor: "#DEDBD6", backgroundColor: "#FFFFFF" }}
          />
        </div>

        {/* Action bar */}
        {!isActive && (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={saveDraft}
              disabled={saving}
              className="flex items-center gap-2 text-sm font-semibold px-6 py-3 border transition-colors"
              style={{ borderColor: NAVY, color: NAVY, backgroundColor: "#FFFFFF" }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#EEF1F7"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#FFFFFF"; }}
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : saved ? "Saved ✓" : "Save Draft"}
            </button>
            <button
              onClick={publishVersion}
              disabled={publishing}
              className="flex items-center gap-2 text-sm font-semibold px-6 py-3 text-white transition-colors"
              style={{ backgroundColor: publishing ? "#AAAAAA" : "#2E7D52" }}
              onMouseEnter={e => { if (!publishing) e.currentTarget.style.backgroundColor = "#245F40"; }}
              onMouseLeave={e => { if (!publishing) e.currentTarget.style.backgroundColor = "#2E7D52"; }}
            >
              <Globe className="w-4 h-4" />
              {publishing ? "Publishing..." : "Publish New Version"}
            </button>
          </div>
        )}

        {isActive && (
          <div className="flex items-center gap-3 pt-2">
            <a
              href={`/legal/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm font-semibold px-6 py-3 text-white transition-colors"
              style={{ backgroundColor: NAVY }}
            >
              <Globe className="w-4 h-4" /> View Public Document
            </a>
          </div>
        )}
      </div>
    </div>
  );
}