import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { FileText, Plus, ChevronRight, ExternalLink, ShieldCheck, Copy, Check } from "lucide-react";

const NAVY = "#2F3E55";

const DOC_TYPES = [
  { type: "terms_of_use",    label: "Terms of Use",     slug: "terms-of-use" },
  { type: "privacy_policy",  label: "Privacy Policy",   slug: "privacy-policy" },
  { type: "builder_terms",   label: "Builder Terms",    slug: "builder-terms" },
  { type: "buyer_terms",     label: "Buyer Terms",      slug: "buyer-terms" },
];

function StatusBadge({ status }) {
  const styles = {
    active:   { backgroundColor: "#E8F5EE", color: "#2E7D52" },
    draft:    { backgroundColor: "#FEF3E2", color: "#C57A1F" },
    archived: { backgroundColor: "#F0EFED", color: "#7A7A7A" },
  };
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize" style={styles[status] || styles.archived}>
      {status}
    </span>
  );
}

export default function AdminLegalDocuments() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState(null);

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
    const label = DOC_TYPES.find(d => d.type === docType)?.label || docType;
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

  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-14 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-7 h-7" style={{ color: NAVY }} strokeWidth={1.5} />
            <h1 className="text-4xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>Legal Documents</h1>
          </div>
          <p className="text-base" style={{ color: "#5A5A5A" }}>Manage the current versions of your terms and policies.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {DOC_TYPES.map(({ type, label, slug }) => {
            const active = docs.find(d => d.document_type === type && d.status === "active");
            const draft = docs.find(d => d.document_type === type && d.status === "draft");

            return (
              <div key={type} className="bg-white border p-6" style={{ borderColor: "#E0DDD8" }}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Doc info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-base" style={{ color: "#1A1A1A" }}>{label}</h3>
                      {active && <StatusBadge status="active" />}
                      {!active && !draft && (
                        <span className="text-xs text-stone-400 italic">No document yet</span>
                      )}
                    </div>

                    {/* Active version row */}
                    {active ? (
                      <div className="text-sm space-y-0.5">
                        <p style={{ color: "#3A3A3A" }}>
                          <span className="font-medium">Active version:</span> {active.version_number}
                          {active.effective_date && (
                            <span className="ml-3" style={{ color: "#7A7A7A" }}>
                              Effective {new Date(active.effective_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          )}
                        </p>
                        {active.updated_date && (
                          <p className="text-xs" style={{ color: "#9A9A9A" }}>
                            Last updated {new Date(active.updated_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm" style={{ color: "#9A9A9A" }}>No active version published.</p>
                    )}

                    {/* Draft notice */}
                    {draft && (
                      <div className="mt-2 flex items-center gap-2">
                        <StatusBadge status="draft" />
                        <span className="text-xs" style={{ color: "#7A7A7A" }}>
                          Draft v{draft.version_number} in progress
                        </span>
                        <Link
                          to={`/AdminLegalDocumentEdit?id=${draft.id}`}
                          className="text-xs font-semibold underline"
                          style={{ color: NAVY }}
                        >
                          Edit Draft →
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
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
                        <Link
                          to={`/AdminLegalDocumentEdit?id=${active.id}`}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 border transition-colors"
                          style={{ borderColor: "#DEDBD6", color: "#5A5A5A", backgroundColor: "#FAFAF8" }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F0EDE8"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = "#FAFAF8"}
                        >
                          View Active
                        </Link>
                      </>
                    )}
                    {!draft && (
                      <button
                        onClick={() => createNewVersion(type)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 text-white transition-colors"
                        style={{ backgroundColor: NAVY }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#1E2E3E"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
                      >
                        <Plus className="w-3.5 h-3.5" /> {active ? "New Version" : "Create Document"}
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
    </div>
  );
}