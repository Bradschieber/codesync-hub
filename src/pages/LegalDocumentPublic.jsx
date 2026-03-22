import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { FileText } from "lucide-react";

const SLUG_TO_TYPE = {
  "terms-of-use":   "terms_of_use",
  "privacy-policy": "privacy_policy",
  "builder-terms":  "builder_terms",
  "buyer-terms":    "buyer_terms",
};

export default function LegalDocumentPublic() {
  const params = new URLSearchParams(window.location.search);
  // Support ?slug=terms-of-use OR read from path
  const pathSlug = window.location.pathname.replace("/legal/", "").replace(/\/$/, "");
  const slug = params.get("slug") || pathSlug;
  const docType = SLUG_TO_TYPE[slug];

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!docType) { setLoading(false); return; }
      const results = await base44.entities.LegalDocument.filter({ document_type: docType, status: "active" });
      if (results.length > 0) setDoc(results[0]);
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-6 h-6 border-4 border-t-transparent rounded-full border-stone-300" />
    </div>
  );

  if (!doc) return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <FileText className="w-12 h-12 mx-auto mb-4 text-stone-300" />
      <h2 className="text-xl font-bold mb-2 text-stone-700">Document not found</h2>
      <p className="text-sm text-stone-400 mb-4">This document hasn't been published yet.</p>
      <Link to="/" className="text-sm underline text-stone-500">Go Home</Link>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#9A9A9A" }}>Legal</p>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "#1A1A1A" }}>{doc.public_title}</h1>
        <div className="flex items-center gap-4 mb-8 pb-4 border-b" style={{ borderColor: "#E3E0D8" }}>
          <span className="text-xs font-medium" style={{ color: "#7A7A7A" }}>Version {doc.version_number}</span>
          {doc.effective_date && (
            <span className="text-xs" style={{ color: "#9A9A9A" }}>
              Effective {new Date(doc.effective_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          )}
        </div>
        <div className="text-sm leading-8 whitespace-pre-wrap" style={{ color: "#3A3A3A" }}>
          {doc.body_content || <span className="text-stone-400 italic">This document has no content yet.</span>}
        </div>
      </div>
    </div>
  );
}