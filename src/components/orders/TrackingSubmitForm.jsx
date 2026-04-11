import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Truck, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

const NAVY = "#1B2B4B";

// Controlled carrier list — maps display label to Shippo carrier token
const CARRIERS = [
  "UPS",
  "FedEx",
  "USPS",
  "DHL Express",
  "OnTrac",
  "LaserShip",
];

const TRACKING_STATUS_LABELS = {
  UNKNOWN: { label: "Pending", color: "text-stone-500" },
  PRE_TRANSIT: { label: "Pre-Transit", color: "text-amber-600" },
  TRANSIT: { label: "In Transit", color: "text-blue-600" },
  DELIVERED: { label: "Delivered", color: "text-green-600" },
  RETURNED: { label: "Returned", color: "text-orange-600" },
  FAILURE: { label: "Exception", color: "text-red-600" },
};

export default function TrackingSubmitForm({ order, onTrackingSubmitted }) {
  const [carrier, setCarrier] = useState(order.tracking_carrier || "");
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || "");
  const [shipDate, setShipDate] = useState(order.ship_date || new Date().toISOString().slice(0, 10));
  const [shippingService, setShippingService] = useState(order.shipping_service || "");
  const [signatureRequired, setSignatureRequired] = useState(order.signature_required || false);
  const [insuranceIncluded, setInsuranceIncluded] = useState(order.insurance_included || false);
  const [builderShippingNotes, setBuilderShippingNotes] = useState(order.builder_shipping_notes || "");
  const [showOptional, setShowOptional] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [trackingUrl, setTrackingUrl] = useState(null);

  const alreadySubmitted = ["tracking_submitted", "shipment_verified", "in_transit", "shipped", "delivered"].includes(order.current_status);
  const shippoStatus = order.shippo_tracking_status;
  const statusInfo = TRACKING_STATUS_LABELS[shippoStatus] || TRACKING_STATUS_LABELS.UNKNOWN;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!carrier || !trackingNumber.trim() || !shipDate) return;
    setSaving(true);
    setError("");

    const res = await base44.functions.invoke("submitTracking", {
      orderId: order.id,
      trackingNumber: trackingNumber.trim(),
      trackingCarrier: carrier,
      shipDate,
      shippingService: shippingService || null,
      signatureRequired,
      insuranceIncluded,
      builderShippingNotes: builderShippingNotes || null,
    });

    if (res.data?.success) {
      setSuccess(true);
      setTrackingUrl(res.data.tracking_url);
      onTrackingSubmitted?.({
        tracking_number: trackingNumber.trim(),
        tracking_carrier: carrier,
        ship_date: shipDate,
        current_status: "tracking_submitted",
        shippo_tracking_status: res.data.shippo_status,
      });
    } else {
      setError(res.data?.error || "Failed to submit tracking.");
    }
    setSaving(false);
  }

  if (success || alreadySubmitted) {
    const displayUrl = trackingUrl || order.shippo_tracking_url_provider;
    return (
      <div className="rounded-xl border border-stone-200 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-green-800">Tracking submitted</p>
            <p className="text-xs text-stone-500 mt-0.5 font-mono">
              {order.tracking_carrier || carrier} · {order.tracking_number || trackingNumber}
            </p>
            {order.ship_date && (
              <p className="text-xs text-stone-400 mt-0.5">Shipped: {new Date(order.ship_date).toLocaleDateString()}</p>
            )}
          </div>
          {shippoStatus && (
            <span className={`text-xs font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
          )}
        </div>
        {order.shippo_latest_event && (
          <p className="text-xs text-stone-500 italic border-t border-stone-100 pt-2">{order.shippo_latest_event}</p>
        )}
        {displayUrl && (
          <a href={displayUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50">
            <Truck className="w-3.5 h-3.5" /> Track on carrier website
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="border border-stone-200 rounded-xl p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
        <Truck className="w-3.5 h-3.5" /> Submit Shipment Information
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Required fields */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Carrier <span className="text-red-500">*</span></label>
            <select required value={carrier} onChange={e => setCarrier(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 bg-white">
              <option value="">Select carrier...</option>
              {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Tracking Number <span className="text-red-500">*</span></label>
            <input required value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
              placeholder="e.g. 1Z999AA1012345678"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 font-mono" />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Ship Date <span className="text-red-500">*</span></label>
            <input required type="date" value={shipDate} onChange={e => setShipDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
          </div>
        </div>

        {/* Optional fields toggle */}
        <button type="button" onClick={() => setShowOptional(o => !o)}
          className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors">
          {showOptional ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {showOptional ? "Hide optional fields" : "Add optional details"}
        </button>

        {showOptional && (
          <div className="space-y-3 pt-1 border-t border-stone-100">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Shipping Service / Method</label>
              <input value={shippingService} onChange={e => setShippingService(e.target.value)}
                placeholder="e.g. UPS Ground, FedEx Priority Overnight"
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
            </div>
            <div className="flex gap-5">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-600">
                <input type="checkbox" checked={signatureRequired} onChange={e => setSignatureRequired(e.target.checked)}
                  className="w-4 h-4 accent-amber-600" />
                Signature required
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-600">
                <input type="checkbox" checked={insuranceIncluded} onChange={e => setInsuranceIncluded(e.target.checked)}
                  className="w-4 h-4 accent-amber-600" />
                Insurance included
              </label>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Shipping Notes</label>
              <textarea value={builderShippingNotes} onChange={e => setBuilderShippingNotes(e.target.value)}
                placeholder="Any notes about the shipment for the buyer or Stringed Collective..."
                rows={2} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 resize-none" />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <button type="submit" disabled={saving || !carrier || !trackingNumber.trim() || !shipDate}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: NAVY }}
          onMouseEnter={e => !saving && (e.currentTarget.style.backgroundColor = "#152038")}
          onMouseLeave={e => !saving && (e.currentTarget.style.backgroundColor = NAVY)}>
          <Truck className="w-4 h-4" />
          {saving ? "Submitting & registering with Shippo..." : "Submit Shipment"}
        </button>
      </form>
    </div>
  );
}