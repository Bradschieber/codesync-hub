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

  return (
    <>
      {/* Brand Story */}
      <div className={`rounded-2xl border ${scheme.accentBorder} ${scheme.accentBg} p-6 mb-4`}>
        <h2 className={`font-bold text-lg ${scheme.accentText} mb-4`}>Our Story</h2>
        <p className="text-stone-700 leading-relaxed whitespace-pre-line text-sm">
          {builder.brand_story || builder.bio}
        </p>
      </div>


    </>
  );
}