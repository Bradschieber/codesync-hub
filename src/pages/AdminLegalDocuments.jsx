import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { FileText, Plus, ExternalLink, ShieldCheck, Copy, Check, Clock, History } from "lucide-react";

const NAVY = "#2F3E55";

const DOC_TYPES = [
  {
    type: "terms_of_use",
    label: "Terms of Use",
    slug: "terms-of-use",
    usedIn: "Builder signup, Buyer signup",
  },
  {
    type: "privacy_policy",
    label: "Privacy Policy",
    slug: "privacy-policy",
    usedIn: "Builder signup, Buyer signup",
  },
  {
    type: "builder_terms",
    label: "Builder Terms",
    slug: "builder-terms",
    usedIn: "Builder signup, Builder policy confirmation",
  },
  {
    type: "buyer_terms",
    label: "Buyer Terms",
    slug: "buyer-terms",
    usedIn: "Stock checkout, Custom build agreement acceptance",
  },
];

function StatusBadge({ label, style }) {
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={style}>
      {label}
    </span>
  );
}

// Simple version history modal
function VersionHistoryModal({ label, versions, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="bg-white border max-w-lg w-full p-6" style={{ borderColor: "#E0DDD8" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-base" style={{ color: "#1A1A1A" }}>Version History — {label}</h2>
          <button onClick={onClose} className="text-sm font-medium" style={{ color: "#7A7A7A" }}>Close</button>
        </div>
        {versions.length === 0 ? (
          <p className="text-sm" style={{ color: "#9A9A9A" }}>No version history yet.</p>
        ) : (
          <div className="space-y-2">
            {versions.map(v => (
              <div key={v.id} className="flex items-center justify-between px-4 py-3 border" style={{ borderColor: "#ECEAE5", backgroundColor: "#FAFAF8" }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>v{v.version_number}</p>
                  {v.effective_date && (
                    <p className="text-xs" style={{ color: "#7A7A7A" }}>
                      Effective {new Date(v.effective_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                    style={v.status === "active"
                      ? { backgroundColor: "#E8F5EE", color: "#2E7D52" }
                      : { backgroundColor: "#F0EFED", color: "#7A7A7A" }}>
                    {v.status}
                  </span>
                  <Link to={`/AdminLegalDocumentEdit?id=${v.id}`} className="text-xs underline" style={{ color: NAVY }}>View</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminLegalDocuments() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [historyModal, setHistoryModal] = useState(null); // { type, label }

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      if (u.role !== "admin") { setLoading(false); return; }
      const all = await base44.entities.LegalDocument.list("-created_date", 200);
      setDocs(all);
    } catch {
      base44.auth.redirectToLogin();
    }
    setLoading(false);
  }

  function copyLink(slug) {
    const url = `${window.location.origin}/legal/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  }

  async function createNewVersion(docType) {
    const entry = DOC_TYPES.find(d => d.type === docType);
    const label = entry?.label || docType;
    const active = docs.find(d => d.document_type === docType && d.status === "active");
    const newDoc = await base44.entities.LegalDocument.create({
      document_type: docType,
      public_title: label,
      version_number: active ? bumpVersion(active.version_number) : "1.0",
      status: "draft",
      body_content: active?.body_content || "",
      notes: "",
    });
    navigate(`/AdminLegalDocumentEdit?id=${newDoc.id}`);
  }

  function bumpVersion(v) {
    const parts = (v || "1.0").split(".");
    parts[parts.length - 1] = String(Number(parts[parts.length - 1]) + 1);
    return parts.join(".");
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

  const historyDocs = historyModal
    ? docs.filter(d => d.document_type === historyModal.type).sort((a, b) => b.version_number?.localeCompare(a.version_number))
    : [];

  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-14 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-7 h-7" style={{ color: NAVY }} strokeWidth={1.5} />
            <h1 className="text-4xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>Terms & Policies</h1>
          </div>
          <p className="text-base" style={{ color: "#5A5A5A" }}>Manage the current versions of your legal terms and policies.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {DOC_TYPES.map(({ type, label, slug, usedIn }) => {
            const active = docs.find(d => d.document_type === type && d.status === "active");
            const draft = docs.find(d => d.document_type === type && d.status === "draft");
            const hasAny = active || draft;

            return (
              <div key={type} className="bg-white border p-6" style={{ borderColor: "#E0DDD8" }}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Doc info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="font-bold text-base" style={{ color: "#1A1A1A" }}>{label}</h3>
                      {!hasAny && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F0EFED", color: "#9A9A9A" }}>
                          No document
                        </span>
                      )}
                      {!active && draft && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FEF3E2", color: "#C57A1F" }}>
                          Draft
                        </span>
                      )}
                      {active && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#E8F5EE", color: "#2E7D52" }}>
                          Active v{active.version_number}
                        </span>
                      )}
                    </div>

                    {/* Used in */}
                    <p className="text-xs mb-2" style={{ color: "#9A9A9A" }}>
                      <span className="font-semibold" style={{ color: "#7A7A7A" }}>Used in:</span> {usedIn}
                    </p>

                    {/* Dates */}
                    {active && (
                      <div className="text-xs space-y-0.5">
                        {active.effective_date && (
                          <p style={{ color: "#5A5A5A" }}>
                            Effective {new Date(active.effective_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        )}
                        {active.updated_date && (
                          <p style={{ color: "#9A9A9A" }}>
                            Last updated {new Date(active.updated_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Draft in progress notice */}
                    {draft && (
                      <div className="mt-2 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" style={{ color: "#C57A1F" }} />
                        <span className="text-xs" style={{ color: "#7A7A7A" }}>
                          Draft v{draft.version_number} in progress
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                    {/* View History */}
                    {hasAny && (
                      <button
                        onClick={() => setHistoryModal({ type, label })}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 border transition-colors"
                        style={{ borderColor: "#DEDBD6", color: "#7A7A7A", backgroundColor: "#FAFAF8" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F0EDE8"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#FAFAF8"}
                      >
                        <History className="w-3.5 h-3.5" /> Version History
                      </button>
                    )}

                    {/* View live */}
                    {active && (
                      <>
                        <Link
                          to={`/legal/${slug}`}
                          target="_blank"
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 border transition-colors"
                          style={{ borderColor: "#DEDBD6", color: "#5A5A5A", backgroundColor: "#FAFAF8" }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F0EDE8"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = "#FAFAF8"}
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View
                        </Link>
                        <button
                          onClick={() => copyLink(slug)}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 border transition-colors"
                          style={{ borderColor: "#DEDBD6", color: "#5A5A5A", backgroundColor: "#FAFAF8" }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F0EDE8"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = "#FAFAF8"}
                        >
                          {copiedSlug === slug ? <><Check className="w-3.5 h-3.5 text-green-600" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy Link</>}
                        </button>
                      </>
                    )}

                    {/* Primary action */}
                    {draft ? (
                      <Link
                        to={`/AdminLegalDocumentEdit?id=${draft.id}`}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 text-white transition-colors"
                        style={{ backgroundColor: "#C57A1F" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#A5641A"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#C57A1F"}
                      >
                        Continue Draft
                      </Link>
                    ) : (
                      <button
                        onClick={() => createNewVersion(type)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 text-white transition-colors"
                        style={{ backgroundColor: NAVY }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#1E2E3E"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
                      >
                        <Plus className="w-3.5 h-3.5" /> {active ? "Edit New Version" : "Create Document"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 pt-6 border-t" style={{ borderColor: "#E0DDD8" }}>
          <Link to={createPageUrl("AdminDashboard")} className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: NAVY }}>
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>

      {historyModal && (
        <VersionHistoryModal
          label={historyModal.label}
          versions={historyDocs}
          onClose={() => setHistoryModal(null)}
        />
      )}
    </div>
  );
}