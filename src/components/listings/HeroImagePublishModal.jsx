import { X, ImageIcon } from "lucide-react";

const NAVY = "#1B2B4B";

/**
 * Primary modal shown when builder tries to publish without a builder-approved marketplace hero image.
 * Props:
 *   onReviewHero   — navigate to hero review flow
 *   onPublishAnyway — open secondary confirmation modal
 *   onClose         — dismiss
 */
export default function HeroImagePublishModal({ onReviewHero, onPublishAnyway, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white w-full max-w-lg shadow-2xl" style={{ borderTop: `4px solid ${NAVY}` }}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "#FEF3C7" }}>
              <ImageIcon className="w-4 h-4" style={{ color: "#92400E" }} />
            </div>
            <h2 className="text-base font-bold leading-snug pr-4" style={{ color: "#1A1A1A" }}>
              Marketplace hero image not yet approved by you
            </h2>
          </div>
          <button onClick={onClose} className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <div className="text-sm leading-relaxed text-gray-600 space-y-3 mb-6">
            <p>
              Your listing can still be published, but it will not appear in catalog, search, homepage featured sections, or other discovery placements until you review and approve a processed marketplace hero image.
            </p>
            <p>
              Your original photos will still appear on the listing page and can still reflect your brand and shop style.
            </p>
            <p>
              To make this listing eligible for discovery, upload a clearer hero image or create a new marketplace version to review.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onReviewHero}
              className="flex-1 font-semibold py-3 px-5 text-sm text-white transition-colors"
              style={{ backgroundColor: NAVY }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
            >
              Review hero image now
            </button>
            <button
              onClick={onPublishAnyway}
              className="flex-1 font-semibold py-3 px-5 text-sm border transition-colors"
              style={{ borderColor: "#DEDBD6", color: "#4A4A4A" }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#F7F6F3"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              Publish anyway
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}