import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { FileText, ShieldCheck, Save, Globe, ArrowLeft, AlertTriangle, X } from "lucide-react";

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

const DOC_USED_IN = {
  terms_of_use:   "Builder signup, Buyer signup",
  privacy_policy: "Builder signup, Buyer signup",
  builder_terms:  "Builder signup, Builder policy confirmation",
  buyer_terms:    "Stock checkout, Custom build agreement acceptance",
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

function PublishConfirmModal({ doc, form, onConfirm, onCancel, publishing }) {
  const slug = DOC_SLUGS[form.document_type];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white border max-w-md w-full p-6" style={{ borderColor: "#E0DDD8" }}>
        <div className="flex items-start justify-between mb-5">
          <h2 className="font-bold text-base" style={{ color: "#1A1A1A" }}>Publish Version</h2>
          <button onClick={onCancel}><X className="w-4 h-4" style={{ color: "#9A9A9A" }} /></button>
        </div>

        <div className="space-y-3 mb-6">
          <div className="px-4 py-3 border" style={{ borderColor: "#ECEAE5", backgroundColor: "#FAFAF8" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "#7A7A7A" }}>Document</p>
            <p className="text-sm font-medium" style={{ color: "#1A1A1A" }}>{DOC_TYPE_LABELS[form.document_type]}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="px-4 py-3 border" style={{ borderColor: "#ECEAE5", backgroundColor: "#FAFAF8" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "#7A7A7A" }}>Version</p>
              <p className="text-sm font-medium" style={{ color: "#1A1A1A" }}>v{form.version_number || "—"}</p>
            </div>
            <div className="px-4 py-3 border" style={{ borderColor: "#ECEAE5", backgroundColor: "#FAFAF8" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "#7A7A7A" }}>Effective Date</p>
              <p className="text-sm font-medium" style={{ color: "#1A1A1A" }}>
                {form.effective_date
                  ? new Date(form.effective_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm leading-relaxed mb-6" style={{ color: "#5A5A5A" }}>
          This version will become the active version used in linked acceptance flows. Prior versions will remain archived for audit records.
        </p>

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onCancel}
            className="text-sm font-medium px-5 py-2.5 border transition-colors"
            style={{ borderColor: "#DEDBD6", color: "#5A5A5A", backgroundColor: "#FFFFFF" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F5F3F0"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#FFFFFF"}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={publishing}
            className="text-sm font-semibold px-5 py-2.5 text-white transition-colors"
            style={{ backgroundColor: publishing ? "#AAAAAA" : "#2E7D52" }}
            onMouseEnter={e => { if (!publishing) e.currentTarget.style.backgroundColor = "#245F40"; }}
            onMouseLeave={e => { if (!publishing) e.currentTarget.style.backgroundColor = "#2E7D52"; }}
          >
            {publishing ? "Publishing..." : "Publish Version"}
          </button>
        </div>
      </div>
    </div>
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
  const [showPublishModal, setShowPublishModal] = useState(false);

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

  async function confirmPublish() {
    setPublishing(true);
    const existing = await base44.entities.LegalDocument.filter({ document_type: form.document_type, status: "active" });
    for (const old of existing) {
      await base44.entities.LegalDocument.update(old.id, { status: "archived" });
    }
    const slug = DOC_SLUGS[form.document_type];
    await base44.entities.LegalDocument.update(docId, {
      ...form,
      status: "active",
      published_at: new Date().toISOString(),
      published_by: user.email,
      public_url: `/legal/${slug}`,
    });
    setPublishing(false);
    setShowPublishModal(false);
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
      <Link to="/AdminLegalDocuments" className="text-sm underline" style={{ color: NAVY }}>Back to Terms & Policies</Link>
    </div>
  );

  const isActive = doc.status === "active";
  const slug = DOC_SLUGS[form.document_type];
  const usedIn = DOC_USED_IN[form.document_type];

  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-12 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/AdminLegalDocuments" className="inline-flex items-center gap-1.5 text-sm mb-5 transition-colors" style={{ color: "#6A6A6A" }}
            onMouseEnter={e => e.currentTarget.style.color = NAVY}
            onMouseLeave={e => e.currentTarget.style.color = "#6A6A6A"}>
            <ArrowLeft className="w-4 h-4" /> Back to Terms & Policies
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

        {/* Used in */}
        {usedIn && (
          <div className="flex items-center gap-2 px-4 py-3 border" style={{ borderColor: "#E3E0D8", backgroundColor: "#FAFAF8" }}>
            <p className="text-xs" style={{ color: "#5A5A5A" }}>
              <span className="font-semibold">Used in:</span> {usedIn}
            </p>
          </div>
        )}

        {/* Active version warning */}
        {isActive && (
          <div className="flex items-start gap-3 p-4 border" style={{ borderColor: "#E8D9B8", backgroundColor: "#FFFAF2" }}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#C57A1F" }} />
            <p className="text-sm" style={{ color: "#7A4A10" }}>
              This is the currently active version. It is read-only. To make changes, go back and click <strong>Edit New Version</strong> to create an editable draft.
            </p>
          </div>
        )}

        {/* Publish workflow note */}
        {!isActive && (
          <div className="flex items-start gap-3 p-4 border" style={{ borderColor: "#C8DEC8", backgroundColor: "#F4FBF4" }}>
            <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#2E7D52" }} />
            <p className="text-sm" style={{ color: "#2E5030" }}>
              Publishing this draft creates a new active version. Prior versions remain archived for audit and acceptance records.
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

        {/* Legal Text */}
        <div className="bg-white border p-6" style={{ borderColor: "#E0DDD8" }}>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#7A7A7A" }}>Legal Text</label>
          {!isActive && (
            <p className="text-xs mb-3" style={{ color: "#9A9A9A" }}>Paste the full public-facing text exactly as it should appear to users.</p>
          )}
          {isActive ? (
            <div className="border p-4 text-sm leading-relaxed whitespace-pre-wrap" style={{ borderColor: "#ECEAE5", backgroundColor: "#FAFAF8", color: "#3A3A3A", minHeight: "300px" }}>
              {form.body_content || <span style={{ color: "#BBBBBB" }}>No content.</span>}
            </div>
          ) : (
            <textarea
              rows={20}
              value={form.body_content || ""}
              onChange={e => set("body_content", e.target.value)}
              placeholder="Paste the full public-facing legal text here..."
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
              onClick={() => setShowPublishModal(true)}
              disabled={publishing}
              className="flex items-center gap-2 text-sm font-semibold px-6 py-3 text-white transition-colors"
              style={{ backgroundColor: publishing ? "#AAAAAA" : "#2E7D52" }}
              onMouseEnter={e => { if (!publishing) e.currentTarget.style.backgroundColor = "#245F40"; }}
              onMouseLeave={e => { if (!publishing) e.currentTarget.style.backgroundColor = "#2E7D52"; }}
            >
              <Globe className="w-4 h-4" />
              Publish New Version
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

      {showPublishModal && (
        <PublishConfirmModal
          doc={doc}
          form={form}
          publishing={publishing}
          onConfirm={confirmPublish}
          onCancel={() => setShowPublishModal(false)}
        />
      )}
    </div>
  );
}