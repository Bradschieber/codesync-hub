import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, CheckCircle2, Shield, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

const NAVY = "#1B2B4B";

export default function CustomBuildAgreementReview({ order, builder, onAgreementAccepted }) {
  const [accepting, setAccepting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [error, setError] = useState("");

  const gross = order.total_gross_amount || order.total_amount || 0;
  const depositPercent = builder?.deposit_percent || 0;
  const depositFixed = builder?.deposit_fixed_amount || 0;
  const depositType = builder?.deposit_type || "percent";
  const estimatedDeposit = depositType === "percent"
    ? Math.round(gross * (depositPercent / 100) * 100) / 100
    : depositFixed;
  const estimatedFinal = gross - estimatedDeposit;

  async function handleAccept() {
    if (!agreed) return;
    setAccepting(true);
    setError("");

    const res = await base44.functions.invoke("createCustomBuildAgreement", { orderId: order.id });
    if (res.data?.success) {
      onAgreementAccepted?.(res.data);
    } else {
      setError(res.data?.error || "Failed to accept agreement.");
    }
    setAccepting(false);
  }

  if (order.current_status === "agreement_accepted" || order.purchase_agreement_signed) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-800">Purchase agreement accepted</p>
          <p className="text-xs text-green-700 mt-0.5">Policies and terms have been frozen for this order. You may now pay your deposit.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden">
      <div className="p-5 bg-stone-50 border-b border-stone-200">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-4 h-4" style={{ color: NAVY }} />
          <p className="font-bold text-sm" style={{ color: "#1A1A1A" }}>Review Purchase Agreement</p>
        </div>
        <p className="text-xs text-stone-500">Please review the terms for this custom build before proceeding to deposit payment.</p>
      </div>

      <div className="p-5 space-y-4">
        {/* Payment summary */}
        <div className="rounded-lg border border-stone-200 divide-y divide-stone-100 text-sm">
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-stone-500">Total Build Price</span>
            <span className="font-semibold">${gross.toLocaleString()}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-stone-500">
              Deposit Required ({depositType === "percent" ? `${depositPercent}%` : "Fixed"})
            </span>
            <span className="font-semibold text-amber-700">${estimatedDeposit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-stone-500">Final Balance (due at completion)</span>
            <span className="font-semibold">${estimatedFinal.toLocaleString()}</span>
          </div>
        </div>

        {/* Builder policy summary */}
        <div>
          <button
            onClick={() => setPolicyOpen(o => !o)}
            className="flex items-center justify-between w-full text-sm font-medium text-stone-600 py-2"
          >
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> View Builder Policies</span>
            {policyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {policyOpen && builder && (
            <div className="mt-2 space-y-2 text-xs text-stone-600 bg-stone-50 rounded-lg p-4 border border-stone-200">
              {builder.payment_schedule && <p><span className="font-medium">Payment Schedule:</span> {builder.payment_schedule}</p>}
              {builder.typical_build_time && <p><span className="font-medium">Typical Build Time:</span> {builder.typical_build_time}</p>}
              {builder.warranty_policy && <p><span className="font-medium">Warranty:</span> {builder.warranty_policy}</p>}
              {builder.return_policy && <p><span className="font-medium">Return Policy:</span> {builder.return_policy}</p>}
              {builder.shipping_policy && <p><span className="font-medium">Shipping:</span> {builder.shipping_policy}</p>}
              {builder.deposit_refundable && <p><span className="font-medium">Deposit Refundable:</span> {builder.deposit_refundable}</p>}
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="mt-0.5 rounded border-stone-300"
          />
          <span className="text-sm text-stone-700">
            I have reviewed and agree to the purchase agreement, payment terms, builder policies, and all applicable terms for this custom build order.
          </span>
        </label>

        <button
          onClick={handleAccept}
          disabled={!agreed || accepting}
          className="w-full py-3 text-sm font-bold text-white transition-colors disabled:opacity-50 rounded-lg"
          style={{ backgroundColor: NAVY }}
          onMouseEnter={e => !accepting && (e.currentTarget.style.backgroundColor = "#152038")}
          onMouseLeave={e => !accepting && (e.currentTarget.style.backgroundColor = NAVY)}
        >
          {accepting ? "Accepting Agreement..." : "Accept Agreement & Continue to Deposit"}
        </button>
      </div>
    </div>
  );
}