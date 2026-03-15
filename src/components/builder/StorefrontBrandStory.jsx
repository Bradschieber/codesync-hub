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

  const hasWarranty = builder.warranty_duration || (builder.warranty_coverage && builder.warranty_coverage.length > 0) || builder.warranty_claim_process;
  const hasReturns = builder.returns_accepted;
  const hasShipping = builder.ships_domestically || builder.ships_internationally || (builder.shipping_carriers && builder.shipping_carriers.length > 0) || builder.shipping_timeline;
  const hasPayment = builder.payment_schedule || builder.payment_methods;
  const hasPolicies = hasWarranty || hasReturns || hasShipping || hasPayment;

  const returnsLabel = { yes: "Yes, returns accepted", no: "No returns", case_by_case: "Case by case" };
  const shippingInsuranceLabel = { yes: "Included", no: "Not included", optional: "Optional" };
  const returnShippingLabel = { buyer: "Buyer pays return shipping", seller: "Seller pays return shipping", negotiable: "Negotiable" };

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
        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-4">
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
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-bold text-stone-800 mb-4">Policies & Commitment</h2>
          <div className="space-y-5">

            {hasWarranty && (
              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-1.5">Warranty</h3>
                <div className="space-y-1 text-sm text-stone-500">
                  {builder.warranty_duration && <p><span className="font-medium text-stone-600">Duration:</span> {builder.warranty_duration}</p>}
                  {builder.warranty_coverage && builder.warranty_coverage.length > 0 && <p><span className="font-medium text-stone-600">Covers:</span> {builder.warranty_coverage.join(", ")}</p>}
                  {builder.warranty_exclusions && builder.warranty_exclusions.length > 0 && <p><span className="font-medium text-stone-600">Excludes:</span> {builder.warranty_exclusions.join(", ")}</p>}
                  {builder.warranty_claim_process && <p><span className="font-medium text-stone-600">Claim process:</span> {builder.warranty_claim_process}</p>}
                </div>
              </div>
            )}

            {hasReturns && (
              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-1.5">Returns</h3>
                <div className="space-y-1 text-sm text-stone-500">
                  {builder.returns_accepted && <p><span className="font-medium text-stone-600">Policy:</span> {returnsLabel[builder.returns_accepted] || builder.returns_accepted}</p>}
                  {builder.return_window_days && <p><span className="font-medium text-stone-600">Window:</span> {builder.return_window_days} days</p>}
                  {builder.return_condition && <p><span className="font-medium text-stone-600">Condition:</span> {builder.return_condition}</p>}
                  {builder.return_restocking_fee_percent > 0 && <p><span className="font-medium text-stone-600">Restocking fee:</span> {builder.return_restocking_fee_percent}%</p>}
                  {builder.return_shipping_paid_by && <p><span className="font-medium text-stone-600">Return shipping:</span> {returnShippingLabel[builder.return_shipping_paid_by] || builder.return_shipping_paid_by}</p>}
                </div>
              </div>
            )}

            {hasShipping && (
              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-1.5">Shipping</h3>
                <div className="space-y-1 text-sm text-stone-500">
                  <p>
                    <span className="font-medium text-stone-600">Ships:</span>{" "}
                    {[builder.ships_domestically && "Domestically", builder.ships_internationally && "Internationally"].filter(Boolean).join(" & ") || "—"}
                  </p>
                  {builder.shipping_carriers && builder.shipping_carriers.length > 0 && <p><span className="font-medium text-stone-600">Carriers:</span> {builder.shipping_carriers.join(", ")}</p>}
                  {builder.shipping_insurance_included && <p><span className="font-medium text-stone-600">Insurance:</span> {shippingInsuranceLabel[builder.shipping_insurance_included] || builder.shipping_insurance_included}</p>}
                  {builder.shipping_timeline && <p><span className="font-medium text-stone-600">Timeline:</span> {builder.shipping_timeline}</p>}
                  {builder.shipping_packaging && <p><span className="font-medium text-stone-600">Packaging:</span> {builder.shipping_packaging}</p>}
                </div>
              </div>
            )}

            {hasPayment && (
              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-1.5">Payment</h3>
                <div className="space-y-1 text-sm text-stone-500">
                  {builder.payment_schedule && <p><span className="font-medium text-stone-600">Schedule:</span> {builder.payment_schedule}</p>}
                  {builder.payment_methods && <p><span className="font-medium text-stone-600">Methods:</span> {builder.payment_methods}</p>}
                  {builder.pricing_notes && <p><span className="font-medium text-stone-600">Notes:</span> {builder.pricing_notes}</p>}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}