import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CreditCard, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

const NAVY = "#1B2B4B";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

function DepositForm({ order, user, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [cardError, setCardError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setCardError("");

    // Get payment intent
    const piRes = await base44.functions.invoke("createDepositPaymentIntent", { orderId: order.id });
    const clientSecret = piRes.data?.clientSecret;
    if (!clientSecret) {
      setCardError(piRes.data?.error || "Could not initiate deposit payment.");
      setPaying(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: { name: user?.full_name, email: user?.email },
      },
    });

    if (error) {
      setCardError(error.message);
      setPaying(false);
      return;
    }

    onSuccess?.();
    setPaying(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-stone-200 p-4 bg-stone-50">
        <CardElement options={{
          style: {
            base: { fontSize: "15px", color: "#1A1A1A", "::placeholder": { color: "#9CA3AF" } },
            invalid: { color: "#DC2626" },
          },
        }} />
      </div>

      {cardError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {cardError}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-stone-400">
        <Lock className="w-3.5 h-3.5" /> Secured by Stripe
      </div>

      <button
        type="submit"
        disabled={paying || !stripe}
        className="w-full py-3 text-sm font-bold text-white rounded-lg transition-colors disabled:opacity-50"
        style={{ backgroundColor: NAVY }}
      >
        {paying ? "Processing..." : `Pay Deposit — $${order.deposit_amount?.toLocaleString()}`}
      </button>
    </form>
  );
}

export default function DepositPaymentForm({ order, user, onDepositPaid }) {
  const [paid, setPaid] = useState(false);

  const alreadyPaid = ["deposit_paid", "deposit_paid_pending_admin_release", "build_authorized",
    "build_in_progress", "build_complete", "final_payment_pending", "final_payment_paid",
    "awaiting_shipment", "tracking_submitted", "shipment_verified", "delivered"].includes(order.current_status);

  if (alreadyPaid || paid) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-800">Deposit paid — ${order.deposit_amount?.toLocaleString()}</p>
          <p className="text-xs text-green-700 mt-0.5">
            {order.is_first_custom_build
              ? "Your deposit is being held pending platform approval. The builder will be notified once approved to begin."
              : "The builder has been authorized to begin work."}
          </p>
        </div>
      </div>
    );
  }

  if (!["agreement_accepted", "deposit_pending"].includes(order.current_status)) {
    return null;
  }

  return (
    <div className="border border-amber-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 bg-amber-50 border-b border-amber-200">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="w-4 h-4 text-amber-700" />
          <p className="font-bold text-sm text-amber-900">Pay Deposit to Begin Build</p>
        </div>
        <p className="text-xs text-amber-700">
          A deposit of <strong>${order.deposit_amount?.toLocaleString()}</strong> is required to authorize this custom build.
        </p>
      </div>
      <div className="p-5">
        <Elements stripe={stripePromise}>
          <DepositForm order={order} user={user} onSuccess={() => { setPaid(true); onDepositPaid?.(); }} />
        </Elements>
      </div>
    </div>
  );
}