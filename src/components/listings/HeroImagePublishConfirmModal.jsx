import { AlertTriangle } from "lucide-react";

const NAVY = "#1B2B4B";

/**
 * Secondary confirmation modal shown when builder clicks "Publish with limited visibility".
 * Props:
 *   onConfirm — execute the publish action
 *   onGoBack  — return to primary modal
 */
export default function HeroImagePublishConfirmModal({ onConfirm, onGoBack }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="p-6 pb-4 border-b" style={{ borderColor: "#E8E5E0" }}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#92400E" }} />
            <h2 className="text-base font-bold" style={{ color: "#1A1A1A" }}>
              Publish with limited visibility?
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="text-sm leading-relaxed text-gray-600 space-y-3 mb-6">
            <p>
              This listing will be live, but it will not appear in catalog, search, homepage features, or other marketplace browsing areas until you approve a clean marketplace version of your primary listing photo.
            </p>
            <p>
              Buyers can still view it from your storefront or through a direct link.
            </p>
            <p>
              You can review and approve a clean marketplace version at any time from the listing editor.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onConfirm}
              className="flex-1 font-semibold py-3 px-5 text-sm text-white transition-colors"
              style={{ backgroundColor: "#92400E" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#78350F"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#92400E"}
            >
              Publish with limited visibility
            </button>
            <button
              onClick={onGoBack}
              className="flex-1 font-semibold py-3 px-5 text-sm border transition-colors"
              style={{ borderColor: NAVY, color: NAVY }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#EEF1F7"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}