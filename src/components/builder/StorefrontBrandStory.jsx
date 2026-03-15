import { getScheme } from "./StorefrontHeader";

export default function StorefrontBrandStory({ builder }) {
  const scheme = getScheme(builder.storefront_color_scheme);

  if (!builder.brand_story && !builder.bio) return null;

  // Business info stats
  const stats = [
    builder.years_experience && { label: "Years Building", value: builder.years_experience },
    builder.total_instruments_built && { label: "Instruments Built", value: builder.total_instruments_built },
    builder.instruments_per_year && { label: "Builds / Year", value: builder.instruments_per_year },
    builder.typical_build_time && { label: "Typical Build Time", value: builder.typical_build_time },
    builder.deposit_percent && { label: "Deposit Required", value: `${builder.deposit_percent}%` },
  ].filter(Boolean);

  const hasPolicies = builder.warranty_policy || builder.return_policy || builder.shipping_policy;

  return (
    <>
      {/* Brand Story */}
      <div className={`rounded-2xl border ${scheme.accentBorder} ${scheme.accentBg} p-6 mb-4`}>
        <h2 className={`font-bold text-lg ${scheme.accentText} mb-4`}>Our Story</h2>
        <p className="text-stone-700 leading-relaxed whitespace-pre-line text-sm">
          {builder.brand_story || builder.bio}
        </p>
      </div>

      {/* Business Stats */}
      {stats.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
          <h2 className="font-bold text-stone-800 mb-4">By the Numbers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {stats.map(({ label, value }) => (
              <div key={label} className={`${scheme.sectionBg} rounded-xl p-4 text-center`}>
                <p className={`text-2xl font-bold ${scheme.accentText}`}>{value}</p>
                <p className="text-xs text-stone-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policies */}
      {hasPolicies && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
          <h2 className="font-bold text-stone-800 mb-4">Policies & Commitment</h2>
          <div className="space-y-4">
            {builder.warranty_policy && (
              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-1">Warranty</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{builder.warranty_policy}</p>
              </div>
            )}
            {builder.return_policy && (
              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-1">Returns</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{builder.return_policy}</p>
              </div>
            )}
            {builder.shipping_policy && (
              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-1">Shipping</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{builder.shipping_policy}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}