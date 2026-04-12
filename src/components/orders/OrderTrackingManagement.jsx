import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Truck, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, ExternalLink, Save } from "lucide-react";

const NAVY = "#1B2B4B";

const CARRIERS = ["UPS", "FedEx", "USPS", "DHL Express", "OnTrac", "LaserShip"];

const SHIPPO_STATUS_LABELS = {
  UNKNOWN:    { label: "Pending",     color: "#7A7A7A", bg: "#F3F4F6" },
  PRE_TRANSIT:{ label: "Pre-Transit", color: "#B45309", bg: "#FEF3C7" },
  TRANSIT:    { label: "In Transit",  color: "#1D4ED8", bg: "#DBEAFE" },
  DELIVERED:  { label: "Delivered",   color: "#16A34A", bg: "#DCFCE7" },
  RETURNED:   { label: "Returned",    color: "#EA580C", bg: "#FFEDD5" },
  FAILURE:    { label: "Exception",   color: "#DC2626", bg: "#FEE2E2" },
};

/**
 * Unified tracking management component.
 * - If no Shippo tracker exists yet: shows full form + submits to Shippo via submitTracking function.
 * - If Shippo tracker already exists: shows status, latest event, tracking link + allows updating notes/optional fields.
 * - If tracking number changes: offers re-submission.
 */
export default function OrderTrackingManagement({ order, onTrackingUpdated, saving: externalSaving }) {
  const hasShippoTracker = !!order.shippo_tracker_id;
  const isTerminal = ['cancelled', 'refunded', 'partially_refunded', 'disputed', 'pending_payment'].includes(order.current_status);

  const [carrier, setCarrier] = useState(order.tracking_carrier || "");
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || "");
  const [shipDate, setShipDate] = useState(order.ship_date || new Date().toISOString().slice(0, 10));
  const [shippingService, setShippingService] = useState(order.shipping_service || "");
  const [signatureRequired, setSignatureRequired] = useState(order.signature_required || false);
  const [insuranceIncluded, setInsuranceIncluded] = useState(order.insurance_included || false);
  const [builderShippingNotes, setBuilderShippingNotes] = useState(order.builder_shipping_notes || "");
  const [showOptional, setShowOptional] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [error, setError] = useState("");
  const [savedNotes, setSavedNotes] = useState(false);

  const statusInfo = order.shippo_tracking_status ? SHIPPO_STATUS_LABELS[order.shippo_tracking_status] : null;

  if (isTerminal && !hasShippoTracker) return null;

  // Has the user changed the core tracking fields vs what's registered in Shippo?
  const trackingChanged = hasShippoTracker && (
    trackingNumber !== (order.tracking_number || "") ||
    carrier !== (order.tracking_carrier || "")
  );

  async function handleSubmitTracking(e) {
    e.preventDefault();
    if (!carrier || !trackingNumber.trim() || !shipDate) return;
    setSubmitting(true);
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
      onTrackingUpdated?.({
        tracking_number: trackingNumber.trim(),
        tracking_carrier: carrier,
        ship_date: shipDate,
        shipping_service: shippingService || null,
        signature_required: signatureRequired,
        insurance_included: insuranceIncluded,
        builder_shipping_notes: builderShippingNotes || null,
        current_status: "tracking_submitted",
        shippo_tracker_id: res.data.tracker_id,
        shippo_tracking_status: res.data.shippo_status,
        shippo_tracking_url_provider: res.data.tracking_url,
      });
    } else {
      setError(res.data?.error || "Failed to submit tracking. Please check the tracking number and try again.");
    }
    setSubmitting(false);
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    await base44.functions.invoke("updateOrderByBuilder", {
      order_id: order.id,
      updates: {
        shipping_service: shippingService || null,
        signature_required: signatureRequired,
        insurance_included: insuranceIncluded,
        builder_shipping_notes: builderShippingNotes || null,
      },
    });
    onTrackingUpdated?.({
      shipping_service: shippingService,
      signature_required: signatureRequired,
      insurance_included: insuranceIncluded,
      builder_shipping_notes: builderShippingNotes,
    });
    setSavedNotes(true);
    setTimeout(() => setSavedNotes(false), 2500);
    setSavingNotes(false);
  }

  return (
    <div className="border border-stone-200 rounded-xl p-4 space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
        <Truck className="w-3.5 h-3.5" /> Shipment & Tracking
      </p>

      {/* Shippo Status — shown when tracker exists */}
      {hasShippoTracker && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            {statusInfo && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>
                {statusInfo.label}
              </span>
            )}
            <span className="text-xs text-stone-500 font-mono">
              {order.tracking_carrier} · {order.tracking_number}
            </span>
            {order.ship_date && (
              <span className="text-xs text-stone-400">
                Shipped {new Date(order.ship_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
          </div>
          {order.shippo_latest_event && (
            <p className="text-xs text-stone-500 italic">{order.shippo_latest_event}</p>
          )}
          {order.shippo_tracking_url_provider && (
            <a href={order.shippo_tracking_url_provider} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50">
              <ExternalLink className="w-3.5 h-3.5" /> Track on carrier website
            </a>
          )}
        </div>
      )}

      {/* Main form — always shown for initial submission, or shown again if tracking changed */}
      {(!hasShippoTracker || trackingChanged) && (
        <form onSubmit={handleSubmitTracking} className="space-y-3">
          {trackingChanged && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              Tracking number changed — submit below to register the updated tracking with Shippo.
            </div>
          )}
          <div className="grid sm:grid-cols-3 gap-3">
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

          {/* Optional fields */}
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
                  <input type="checkbox" checked={signatureRequired} onChange={e => setSignatureRequired(e.target.checked)} className="w-4 h-4 accent-amber-600" />
                  Signature required
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-600">
                  <input type="checkbox" checked={insuranceIncluded} onChange={e => setInsuranceIncluded(e.target.checked)} className="w-4 h-4 accent-amber-600" />
                  Insurance included
                </label>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Shipping Notes</label>
                <textarea value={builderShippingNotes} onChange={e => setBuilderShippingNotes(e.target.value)}
                  placeholder="Any notes about the shipment..."
                  rows={2} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 resize-none" />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <button type="submit" disabled={submitting || !carrier || !trackingNumber.trim() || !shipDate}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: NAVY }}>
            <Truck className="w-4 h-4" />
            {submitting ? "Submitting to Shippo..." : trackingChanged ? "Re-submit Updated Tracking" : "Submit Shipment & Register Tracking"}
          </button>
        </form>
      )}

      {/* Optional fields editor — shown when tracker already exists and tracking hasn't changed */}
      {hasShippoTracker && !trackingChanged && (
        <div className="space-y-3 border-t border-stone-100 pt-3">
          <button type="button" onClick={() => setShowOptional(o => !o)}
            className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors">
            {showOptional ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showOptional ? "Hide shipping details" : "Edit shipping details"}
          </button>
          {showOptional && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Shipping Service / Method</label>
                <input value={shippingService} onChange={e => setShippingService(e.target.value)}
                  placeholder="e.g. UPS Ground"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
              </div>
              <div className="flex gap-5">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-600">
                  <input type="checkbox" checked={signatureRequired} onChange={e => setSignatureRequired(e.target.checked)} className="w-4 h-4 accent-amber-600" />
                  Signature required
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-600">
                  <input type="checkbox" checked={insuranceIncluded} onChange={e => setInsuranceIncluded(e.target.checked)} className="w-4 h-4 accent-amber-600" />
                  Insurance included
                </label>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Shipping Notes</label>
                <textarea value={builderShippingNotes} onChange={e => setBuilderShippingNotes(e.target.value)}
                  rows={2} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 resize-none" />
              </div>
              <button type="button" onClick={handleSaveNotes} disabled={savingNotes}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: savedNotes ? "#16a34a" : NAVY }}>
                {savedNotes ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                {savedNotes ? "Saved!" : "Save Details"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Allow updating tracking number if already submitted */}
      {hasShippoTracker && !trackingChanged && (
        <div className="border-t border-stone-100 pt-3 space-y-2">
          <p className="text-xs text-stone-400">Need to correct the tracking number?</p>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Carrier</label>
              <select value={carrier} onChange={e => setCarrier(e.target.value)}
                className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 bg-white">
                {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Tracking Number</label>
              <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
                className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 font-mono w-52" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}