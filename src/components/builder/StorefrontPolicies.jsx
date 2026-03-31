export default function StorefrontPolicies({ builder }) {
  const returnsLabel = { yes: "Yes, returns accepted", no: "No returns", case_by_case: "Case by case" };
  const shippingInsuranceLabel = { yes: "Included", no: "Not included", optional: "Optional" };
  const returnShippingLabel = { buyer: "Buyer pays return shipping", seller: "Seller pays return shipping", negotiable: "Negotiable" };

  const hasWarranty = builder.warranty_duration || (builder.warranty_coverage && builder.warranty_coverage.length > 0) || builder.warranty_claim_process;
  const hasReturns = builder.returns_accepted;
  const hasShipping = builder.ships_domestically || builder.ships_internationally || (builder.shipping_carriers && builder.shipping_carriers.length > 0) || builder.shipping_timeline;
  const hasPayment = builder.payment_schedule || builder.payment_methods;

  return (
    <div className="space-y-5">
      {hasWarranty && (
        <div>
          <h3 className="text-sm font-semibold text-stone-700 mb-1.5">Warranty</h3>
          <div className="space-y-1 text-sm text-stone-500">
            {builder.warranty_duration && <p><span className="font-medium text-stone-600">Duration:</span> {builder.warranty_duration}</p>}
            {builder.warranty_coverage && builder.warranty_coverage.length > 0 && (
              <p>
                <span className="font-medium text-stone-600">Covers:</span>{" "}
                {builder.warranty_coverage.map(c => typeof c === "object" ? `${c.label}${c.duration ? ` (${c.duration})` : ""}` : c).join(", ")}
              </p>
            )}
            {builder.warranty_exclusions && builder.warranty_exclusions.length > 0 && <p><span className="font-medium text-stone-600">Excludes:</span> {builder.warranty_exclusions.join(", ")}</p>}
            {builder.warranty_claim_process && <p><span className="font-medium text-stone-600">Claim process:</span> {builder.warranty_claim_process}</p>}
          </div>
        </div>
      )}

      {hasReturns && (
        <div>
          <h3 className="text-sm font-semibold text-stone-700 mb-1.5">Returns</h3>
          <div className="space-y-1 text-sm text-stone-500">
            <p><span className="font-medium text-stone-600">Policy:</span> {returnsLabel[builder.returns_accepted] || builder.returns_accepted}</p>
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
  );
}