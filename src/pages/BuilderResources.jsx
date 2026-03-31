import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, BookOpen, FileText } from "lucide-react";
import { successGuides } from "@/lib/builderGuides";

const NAVY = "#1B2B4B";

const faqResources = [
  {
    title: "Builder FAQ",
    description: "Answers to common questions about Stringed Collective — payments, shipping, custom builds, and more.",
    page: "BuilderFAQ",
  },
];

function ResourceCard({ title, description, to }) {
  return (
    <Link
      to={to}
      className="flex items-start gap-4 p-5 border bg-white transition-all hover:shadow-md"
      style={{ borderColor: "#E8E5E0" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = NAVY}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#E8E5E0"}
    >
      <div className="w-9 h-9 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EEF1F7" }}>
        <BookOpen className="w-4 h-4" style={{ color: NAVY }} />
      </div>
      <div>
        <h3 className="font-semibold text-sm mb-1" style={{ color: NAVY }}>{title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: "#6B6B6B" }}>{description}</p>
      </div>
    </Link>
  );
}

function GuideCard({ guide }) {
  return (
    <Link
      to={`/BuilderGuideArticle?guide=${guide.slug}`}
      className="flex items-start gap-4 p-5 border bg-white transition-all hover:shadow-md"
      style={{ borderColor: "#E8E5E0" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = NAVY}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#E8E5E0"}
    >
      <div className="w-9 h-9 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EEF1F7" }}>
        <FileText className="w-4 h-4" style={{ color: NAVY }} />
      </div>
      <div>
        <h3 className="font-semibold text-sm mb-1" style={{ color: NAVY }}>{guide.title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: "#6B6B6B" }}>{guide.description}</p>
      </div>
    </Link>
  );
}

export default function BuilderResources() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF9F7" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-14 pb-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to={createPageUrl("Dashboard")}
            className="inline-flex items-center gap-1 text-sm mb-6 transition-opacity opacity-60 hover:opacity-100"
            style={{ color: NAVY }}
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold tracking-tight mb-2" style={{ color: "#1A1A1A" }}>Builder Resources</h1>
          <p className="text-base" style={{ color: "#5A5A5A" }}>
            Guides, tips, and tools to help you succeed on Stringed Collective.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">

        {/* FAQ */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#6B6B6B" }}>Getting Started</h2>
          <div className="space-y-3">
            {faqResources.map(r => (
              <ResourceCard key={r.page} title={r.title} description={r.description} to={createPageUrl(r.page)} />
            ))}
          </div>
        </div>

        {/* Builder Success Guides */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#6B6B6B" }}>Builder Success Guides</h2>
          <p className="text-sm mb-5 leading-relaxed" style={{ color: "#5A5A5A" }}>
            Practical guidance to help builders present their work clearly, build buyer confidence, and deliver a strong experience on Stringed Collective.
          </p>
          <div className="space-y-3">
            {successGuides.map(g => (
              <GuideCard key={g.slug} guide={g} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}