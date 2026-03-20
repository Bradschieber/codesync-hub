import { useState } from "react";
import { Clock, DollarSign, X } from "lucide-react";

const FALLBACK_DESC = "This builder accepts custom build inquiries through Stringed Collective.";
const MAX_CHARS = 280;

export default function CustomBuildsContent({ builder, onRequestQuote }) {
  const [expanded, setExpanded] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);

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

      {/* Custom Build Examples — portfolio grid */}
      {(builder.custom_build_examples || []).length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-stone-400">Past Custom Work</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {builder.custom_build_examples.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightboxIdx(i)}
                className="relative group aspect-square overflow-hidden focus:outline-none"
                style={{ border: "1px solid #E3E0D8" }}
              >
                <img src={ex.image_url} alt={ex.title || ""} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                {(ex.title || ex.description) && (
                  <div className="absolute inset-0 flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)" }}>
                    {ex.title && <p className="text-white text-xs font-semibold leading-tight">{ex.title}</p>}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          onClick={() => setLightboxIdx(null)}
        >
          <div
            className="relative max-w-lg w-full bg-white"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={builder.custom_build_examples[lightboxIdx]?.image_url}
              alt=""
              className="w-full object-contain max-h-[70vh]"
            />
            {(builder.custom_build_examples[lightboxIdx]?.title || builder.custom_build_examples[lightboxIdx]?.description) && (
              <div className="px-4 py-3">
                {builder.custom_build_examples[lightboxIdx]?.title && (
                  <p className="text-sm font-semibold text-stone-800 mb-1">{builder.custom_build_examples[lightboxIdx].title}</p>
                )}
                {builder.custom_build_examples[lightboxIdx]?.description && (
                  <p className="text-xs text-stone-500 leading-relaxed">{builder.custom_build_examples[lightboxIdx].description}</p>
                )}
              </div>
            )}
            <button
              onClick={() => setLightboxIdx(null)}
              className="absolute top-2 right-2 bg-black/40 text-white p-1.5 rounded-full hover:bg-black/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
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