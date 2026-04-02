import { useState } from "react";
import { AlertTriangle, X, Info } from "lucide-react";

/**
 * Persistent banner shown on a listing editor when the listing is live but has no
 * builder-approved marketplace hero image.
 *
 * Props:
 *   onReviewHero — navigate to hero image review flow
 */
export default function LimitedVisibilityBanner({ onReviewHero }) {
  const [showLearnMore, setShowLearnMore] = useState(false);

  return (
    <>
      <div
        className="flex items-start gap-3 p-4 mb-5"
        style={{ backgroundColor: "#FEF3C7", borderLeft: "4px solid #D97706" }}
      >
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#92400E" }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold mb-1" style={{ color: "#78350F" }}>
            This listing is live with limited visibility
          </p>
          <p className="text-xs leading-relaxed mb-3" style={{ color: "#92400E" }}>
            It is not currently eligible for catalog, search, or featured marketplace placements because you have not yet approved a processed marketplace hero image.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onReviewHero}
              className="text-xs font-semibold px-3 py-1.5 text-white transition-colors"
              style={{ backgroundColor: "#92400E" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#78350F"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#92400E"}
            >
              Review hero image
            </button>
            <button
              onClick={() => setShowLearnMore(true)}
              className="text-xs font-medium underline transition-opacity hover:opacity-70"
              style={{ color: "#92400E" }}
            >
              Learn more
            </button>
          </div>
        </div>
      </div>

      {/* Learn More Panel */}
      {showLearnMore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white w-full max-w-md shadow-2xl">
            <div className="flex items-start justify-between p-6 pb-4 border-b" style={{ borderColor: "#E8E5E0" }}>
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#1B2B4B" }} />
                <h3 className="text-base font-bold" style={{ color: "#1A1A1A" }}>Why this matters</h3>
              </div>
              <button onClick={() => setShowLearnMore(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 text-sm leading-relaxed text-gray-600 space-y-3">
              <p>
                Stringed Collective uses a standardized marketplace hero image format for catalog, search, homepage, and other multi-listing placements. This helps the marketplace look polished, consistent, and easy for buyers to browse.
              </p>
              <p>
                Your original photos are still used on your listing page and can continue to reflect your brand, shop, and process. Only the marketplace hero image must follow the standardized format.
              </p>
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => setShowLearnMore(false)}
                className="w-full font-semibold py-2.5 text-sm border transition-colors"
                style={{ borderColor: "#DEDBD6", color: "#4A4A4A" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F7F6F3"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}