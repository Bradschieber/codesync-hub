import { CheckCircle2, Circle, ExternalLink, Guitar, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const STEPS = [
  { id: "basics",      label: "Builder Basics",       anchor: "#basics",      check: f => !!(f.business_name && f.location) },
  { id: "story",       label: "Tell Your Story",      anchor: "#story",       check: f => !!(f.brand_story && f.brand_story.length > 80) },
  { id: "photos",      label: "Photos & Video",       anchor: "#photos",      check: f => !!(f.media_urls && f.media_urls.length > 0) },
  { id: "policies",    label: "Shop Policies",        anchor: "#policies",    check: f => !!(f.warranty_policy || f.return_policy || f.shipping_policy) },
  { id: "instrument",  label: "Add First Instrument", anchor: null,           check: (_f, productCount) => productCount > 0 },
  { id: "references",  label: "References",           anchor: "#references",  check: f => !!(f._hasReferences) },
];

const PROMPTS = [
  { check: f => !(f.brand_story && f.brand_story.length > 80), text: "Builders with a story receive more inquiries. Add your story.", anchor: "#story" },
  { check: f => !(f.media_urls && f.media_urls.length > 0), text: "Show buyers where your instruments come to life. Add workshop photos.", anchor: "#photos" },
  { check: f => !(f.warranty_policy || f.return_policy || f.shipping_policy), text: "Clear policies build buyer confidence. Complete your shop policies.", anchor: "#policies" },
];

export default function StorefrontProgressTracker({ form, profile, productCount }) {
  const completedCount = STEPS.filter(s => s.check(form, productCount)).length;
  const pct = Math.round((completedCount / STEPS.length) * 100);
  const profileId = profile?.slug || profile?.id || form?.id;

  const activePrompts = PROMPTS.filter(p => p.check(form));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-bold text-gray-800">Your Storefront Setup</h2>
        <span className="text-xs font-semibold text-indigo-600">{pct}% complete</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5">
        <div
          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Steps checklist */}
      <div className="grid sm:grid-cols-2 gap-2 mb-5">
        {STEPS.map(step => {
          const done = step.check(form, productCount);
          const content = (
            <span className={`flex items-center gap-2 text-xs font-medium transition-colors ${done ? "text-gray-400 line-through" : "text-gray-700 hover:text-indigo-600"}`}>
              {done
                ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                : <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
              }
              {step.label}
            </span>
          );
          if (step.anchor) {
            return <a key={step.id} href={step.anchor}>{content}</a>;
          }
          return (
            <Link key={step.id} to={createPageUrl("DashboardProducts")}>
              {content}
            </Link>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {profileId && (
          <a
            href={createPageUrl(`BuilderProfile`) + `?id=${profileId}&preview=true`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: "#1B2B4B" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1B2B4B"}
          >
            <ExternalLink className="w-3.5 h-3.5" /> Preview My Storefront
          </a>
        )}
        <Link
          to={createPageUrl("DashboardProducts")}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Guitar className="w-3.5 h-3.5" /> View My Listings
        </Link>
      </div>

      {/* First instrument card */}
      <div className={`rounded-xl border p-4 flex items-center justify-between gap-4 ${productCount > 0 ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
        <div>
          <p className={`text-sm font-semibold ${productCount > 0 ? "text-green-800" : "text-amber-800"}`}>
            {productCount > 0 ? `You have ${productCount} instrument${productCount > 1 ? "s" : ""} listed.` : "Add Your First Instrument"}
          </p>
          {productCount === 0 && (
            <p className="text-xs text-amber-700 mt-0.5">Your storefront comes to life when you add your first instrument listing.</p>
          )}
        </div>
        <Link
          to={createPageUrl("DashboardProducts")}
          className={`flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${productCount > 0 ? "bg-green-700 text-white hover:bg-green-800" : "bg-amber-600 text-white hover:bg-amber-700"}`}
        >
          {productCount > 0 ? "Manage Listings" : "Add Instrument"}
        </Link>
      </div>

      {/* Completeness prompts */}
      {activePrompts.length > 0 && (
        <div className="mt-4 space-y-2">
          {activePrompts.map((p, i) => (
            <a key={i} href={p.anchor} className="flex items-start gap-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 hover:bg-indigo-100 transition-colors">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              {p.text}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}