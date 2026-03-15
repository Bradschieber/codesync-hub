import { useState } from "react";
import { Clock, DollarSign } from "lucide-react";

const FALLBACK_DESC = "This builder accepts custom build inquiries through Stringed Collective.";
const MAX_CHARS = 280;

export default function CustomBuildsContent({ builder, onRequestQuote }) {
  const [expanded, setExpanded] = useState(false);

  const desc = builder.custom_build_description || FALLBACK_DESC;
  const isTruncated = desc.length > MAX_CHARS;
  const displayDesc = isTruncated && !expanded ? desc.slice(0, MAX_CHARS) + "…" : desc;

  const depositLabel = builder.deposit_type === "percent" && builder.deposit_percent
    ? `${builder.deposit_percent}%`
    : builder.deposit_fixed_amount
    ? `$${builder.deposit_fixed_amount.toLocaleString()}`
    : null;

  const specialties = (builder.specialties || []).slice(0, 5);

  return (
    <div>
      {/* Description */}
      <p className="text-sm leading-relaxed text-stone-600 mb-4">
        {displayDesc}
        {isTruncated && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-1 text-sm font-medium underline text-stone-500 hover:text-stone-800"
          >
            {expanded ? "Read less" : "Read more"}
          </button>
        )}
      </p>

      {/* Specialty tags */}
      {specialties.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {specialties.map(s => (
            <span key={s} className="text-xs font-medium px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Summary facts */}
      {(builder.typical_build_time || (builder.deposit_required && depositLabel)) && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-5">
          {builder.typical_build_time && (
            <div className="flex items-center gap-1.5 text-sm text-stone-700">
              <Clock className="w-4 h-4 text-stone-400 flex-shrink-0" />
              <span><strong>Typical Timeline:</strong> {builder.typical_build_time}</span>
            </div>
          )}
          {builder.deposit_required && depositLabel && (
            <div className="flex items-center gap-1.5 text-sm text-stone-700">
              <DollarSign className="w-4 h-4 text-stone-400 flex-shrink-0" />
              <span><strong>Deposit:</strong> {depositLabel}</span>
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={onRequestQuote}
        className="font-semibold px-5 py-2.5 text-sm text-white rounded-lg transition-colors mb-2"
        style={{ backgroundColor: "#C57A1F" }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#a8661a"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#C57A1F"}
      >
        Request Custom Build
      </button>
      <p className="text-xs text-stone-500 mt-2">
        Share your specs and discuss details with the builder through Stringed Collective.
      </p>
    </div>
  );
}