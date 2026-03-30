import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CreditCard, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

const NAVY = "#1B2B4B";
const AMBER = "#C57A1F";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

function FinalForm({ order, user, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [cardError, setCardError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setCardError("");

    const piRes = await base44.functions.invoke("createFinalPaymentIntent", { orderId: order.id });
    const clientSecret = piRes.data?.clientSecret;
    if (!clientSecret) {
      setCardError(piRes.data?.error || "Could not initiate final payment.");
      setPaying(false);
      return;
    }

    const { error } = await stripe.confirmCardPayment(clientSecret, {
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
        style={{ backgroundColor: AMBER }}
      >
        {paying ? "Processing..." : `Pay Final Balance — $${order.final_balance_amount?.toLocaleString()}`}
      </button>
    </form>
  );
}

export default function FinalPaymentForm({ order, user, onFinalPaid }) {
  const [paid, setPaid] = useState(false);

  if (order.final_payment_paid || paid) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-800">Final payment complete — ${order.final_balance_amount?.toLocaleString()}</p>
          <p className="text-xs text-green-700 mt-0.5">The builder will now ship your instrument.</p>
        </div>
      </div>
    );
  }

  if (order.current_status !== "final_payment_pending") return null;

  const dueDate = order.final_payment_due_date || order.next_payment_due_date;

  return (
    <div className="border-2 rounded-xl overflow-hidden" style={{ borderColor: AMBER }}>
      <div className="px-5 py-4 border-b" style={{ backgroundColor: "#FDF8F0", borderColor: "#F5E6CC" }}>
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="w-4 h-4" style={{ color: AMBER }} />
          <p className="font-bold text-sm" style={{ color: "#7A4A10" }}>Final Balance Due</p>
        </div>
        <p className="text-xs" style={{ color: "#8C5E20" }}>
          Your instrument is complete. Pay the final balance to authorize shipment.
          {dueDate && ` Due by ${format(new Date(dueDate), "MMMM d, yyyy")}.`}
        </p>
      </div>
      <div className="p-5">
        <div className="flex justify-between text-sm mb-4">
          <span className="text-stone-500">Deposit paid</span>
          <span className="font-medium text-stone-600">${order.deposit_amount_paid?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm font-bold mb-5" style={{ color: "#7A4A10" }}>
          <span>Final balance remaining</span>
          <span>${order.final_balance_amount?.toLocaleString()}</span>
        </div>
        <Elements stripe={stripePromise}>
          <FinalForm order={order} user={user} onSuccess={() => { setPaid(true); onFinalPaid?.(); }} />
        </Elements>
      </div>
    </div>
  );
}