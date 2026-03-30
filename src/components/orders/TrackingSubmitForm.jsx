import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Truck, CheckCircle2, AlertCircle } from "lucide-react";

const NAVY = "#1B2B4B";

const CARRIERS = ["UPS", "FedEx", "USPS", "DHL", "ShipStation", "Other"];

export default function TrackingSubmitForm({ order, onTrackingSubmitted }) {
  const [carrier, setCarrier] = useState(order.tracking_carrier || "");
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const alreadySubmitted = ["tracking_submitted", "shipment_verified", "shipped", "delivered"].includes(order.current_status);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!carrier || !trackingNumber.trim()) return;
    setSaving(true);
    setError("");

    const res = await base44.functions.invoke("submitTracking", {
      orderId: order.id,
      trackingNumber: trackingNumber.trim(),
      trackingCarrier: carrier,
    });

    if (res.data?.success) {
      setSuccess(true);
      onTrackingSubmitted?.({ tracking_number: trackingNumber.trim(), tracking_carrier: carrier, current_status: "tracking_submitted" });
    } else {
      setError(res.data?.error || "Failed to submit tracking.");
    }
    setSaving(false);
  }

  if (success || alreadySubmitted) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-800">Tracking submitted — awaiting admin verification</p>
          {(order.tracking_carrier || carrier) && (
            <p className="text-xs text-green-700 mt-0.5">
              {order.tracking_carrier || carrier}: <span className="font-mono">{order.tracking_number || trackingNumber}</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-stone-200 rounded-xl p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
        <Truck className="w-3.5 h-3.5" /> Submit Tracking Information
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Carrier *</label>
            <select
              required
              value={carrier}
              onChange={e => setCarrier(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
            >
              <option value="">Select carrier...</option>
              {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Tracking Number *</label>
            <input
              required
              value={trackingNumber}
              onChange={e => setTrackingNumber(e.target.value)}
              placeholder="e.g. 1Z999AA1012345678"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={saving || !carrier || !trackingNumber.trim()}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: NAVY }}
          onMouseEnter={e => !saving && (e.currentTarget.style.backgroundColor = "#152038")}
          onMouseLeave={e => !saving && (e.currentTarget.style.backgroundColor = NAVY)}
        >
          <Truck className="w-4 h-4" />
          {saving ? "Submitting..." : "Submit Tracking"}
        </button>
      </form>
    </div>
  );
}