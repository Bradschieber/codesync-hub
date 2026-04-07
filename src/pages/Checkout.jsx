import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ShoppingCart, ArrowLeft, Truck, Lock, AlertCircle } from "lucide-react";
import LegalAcceptanceBlock from "@/components/legal/LegalAcceptanceBlock";
import LegalLink from "@/components/legal/LegalLink";
import { LEGAL_URLS, LEGAL_VERSIONS, logLegalAcceptance } from "@/lib/legalConfig";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const NAVY = "#1B2B4B";

// Only init stripe if key is present
const stripePromise = typeof window !== "undefined"
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder")
  : null;

function OrderSummary({ cartItems }) {
  const total = cartItems.reduce((sum, i) => sum + i.product_price * i.quantity, 0);
  const platformFee = 0; // Paid by builder, not visible to buyer
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 h-fit sticky top-24">
      <h2 className="font-bold text-stone-800 mb-4">Order Summary</h2>
      <div className="space-y-3 mb-4">
        {cartItems.map(item => (
          <div key={item.id} className="flex gap-3 items-center">
            {item.product_image && <img src={item.product_image} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-700 truncate">{item.product_name}</p>
              <p className="text-xs text-stone-400">{item.builder_name}</p>
            </div>
            <p className="text-sm font-bold" style={{ color: "#A0692A" }}>${item.product_price?.toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-stone-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm text-stone-600">
          <span>Subtotal</span><span>${total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-stone-600">
          <span>Shipping</span><span className="text-green-600">Calculated by builder</span>
        </div>
        <div className="flex justify-between font-bold text-stone-800 text-base pt-1 border-t border-stone-200">
          <span>Total</span><span>${total.toLocaleString()}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-stone-400">
        <Lock className="w-3.5 h-3.5" />
        <span>Secured by Stripe</span>
      </div>
    </div>
  );
}

function CheckoutForm({ cartItems, user, shippingForm, legalChecked, onLegalChange, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [placing, setPlacing] = useState(false);
  const [cardError, setCardError] = useState("");
  const [setupError, setSetupError] = useState("");

  const total = cartItems.reduce((sum, i) => sum + i.product_price * i.quantity, 0);

  // Validate all shipping fields
  const shippingComplete = shippingForm.full_name && shippingForm.address &&
    shippingForm.city && shippingForm.state && shippingForm.zip;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements || !legalChecked.order_terms || !shippingComplete) return;

    setPlacing(true);
    setCardError("");
    setSetupError("");

    // Group items by builder (stock build assumes single builder per checkout for V1)
    const builderGroups = {};
    for (const item of cartItems) {
      // Fetch product to get builder_id
      const products = await base44.entities.Product.filter({ id: item.product_id });
      if (products.length) {
        const prod = products[0];
        if (!builderGroups[prod.builder_id]) builderGroups[prod.builder_id] = [];
        builderGroups[prod.builder_id].push({ item, product: prod });
      }
    }

    const builderIds = Object.keys(builderGroups);

    // For V1, handle single builder per checkout
    if (builderIds.length !== 1) {
      setSetupError("Please checkout items from one builder at a time.");
      setPlacing(false);
      return;
    }

    const builderId = builderIds[0];
    const builderItems = builderGroups[builderId];
    const firstProduct = builderItems[0].product;

    // Create the Order first
    const order = await base44.entities.Order.create({
      user_id: user.id,
      buyer_email: user.email,
      buyer_name: user.full_name || shippingForm.full_name,
      builder_id: builderId,
      builder_name: firstProduct.builder_name,
      order_type: "stock",
      items: cartItems.map(i => ({
        product_id: i.product_id,
        product_name: i.product_name,
        product_image: i.product_image,
        product_price: i.product_price,
        builder_name: i.builder_name,
        quantity: i.quantity,
      })),
      total_gross_amount: total,
      total_amount: total,
      current_status: "pending_payment",
      status: "pending",
      shipping_address: {
        line1: shippingForm.address,
        city: shippingForm.city,
        state: shippingForm.state,
        postal_code: shippingForm.zip,
        country: shippingForm.country || "US",
        name: shippingForm.full_name,
      },
    });

    // Create PaymentIntent via backend
    let clientSecret;
    try {
      const piResponse = await base44.functions.invoke("createPaymentIntentForOrder", { orderId: order.id });
      clientSecret = piResponse.data?.clientSecret;
      if (!clientSecret) throw new Error(piResponse.data?.error || "Failed to create payment intent");
    } catch (err) {
      setSetupError(err.message || "Could not initiate payment. Please try again.");
      // Clean up the created order
      await base44.entities.Order.update(order.id, { current_status: "cancelled" });
      setPlacing(false);
      return;
    }

    // Confirm card payment
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: shippingForm.full_name,
          email: user.email,
        },
      },
    });

    if (stripeError) {
      setCardError(stripeError.message);
      setPlacing(false);
      return;
    }

    // Payment successful — log legal acceptance
    await logLegalAcceptance(base44, {
      user,
      agreementType: "stock_build_checkout",
      checkboxLabels: ["I agree to the Buyer Terms and the builder's applicable policies for this order."],
      documentUrls: [LEGAL_URLS.buyer_terms],
      versions: { buyer_terms: LEGAL_VERSIONS.buyer_terms },
      sourceScreen: "Checkout",
      orderId: order.id,
    });

    // Clear cart
    for (const item of cartItems) {
      await base44.entities.CartItem.delete(item.id);
    }

    onSuccess(order.id);
    setPlacing(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-amber-600" /> Payment
        </h2>
        <div className="border border-stone-200 rounded-xl p-4 bg-stone-50">
          <CardElement options={{
            style: {
              base: { fontSize: "15px", color: "#1A1A1A", "::placeholder": { color: "#9CA3AF" } },
              invalid: { color: "#DC2626" },
            },
          }} />
        </div>
        {cardError && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{cardError}</p>
          </div>
        )}
        {setupError && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">{setupError}</p>
          </div>
        )}
      </div>

      {/* Legal */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="font-bold text-stone-800 mb-2">Review and accept order terms</h2>
        <p className="text-sm text-stone-500 mb-4">This purchase is subject to the Buyer Terms and the builder's applicable shipping, return, and warranty policies.</p>
        <LegalAcceptanceBlock
          checkboxes={[{
            id: "order_terms",
            label: <>I agree to the <LegalLink href={LEGAL_URLS.buyer_terms}>Buyer Terms</LegalLink> and the builder's applicable policies for this order.</>,
          }]}
          checked={legalChecked}
          onChange={(id, val) => onLegalChange(id, val)}
          smallPrint='By placing your order, you authorize payment and agree to the Buyer Terms and the order-specific builder policies.'
        />
      </div>

      <button
        type="submit"
        disabled={placing || !legalChecked.order_terms || !shippingComplete || !stripe}
        className="w-full text-white font-bold py-4 rounded-xl text-lg transition-colors disabled:opacity-50"
        style={{ backgroundColor: NAVY }}
        onMouseEnter={e => !placing && (e.currentTarget.style.backgroundColor = "#152038")}
        onMouseLeave={e => !placing && (e.currentTarget.style.backgroundColor = NAVY)}
      >
        {placing ? "Processing Payment..." : `Pay $${total.toLocaleString()}`}
      </button>
    </form>
  );
}

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedOrderId, setCompletedOrderId] = useState(null);
  const [shippingForm, setShippingForm] = useState({
    full_name: "", address: "", city: "", state: "", zip: "", country: "US"
  });
  const [legalChecked, setLegalChecked] = useState({ order_terms: false });
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const successParam = params.get("success");

  useEffect(() => { loadCart(); }, []);

  async function loadCart() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      setShippingForm(f => ({ ...f, full_name: u.full_name || "" }));
      const items = await base44.entities.CartItem.filter({ user_id: u.id });
      setCartItems(items);
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  function handleSuccess(orderId) {
    setCompletedOrderId(orderId);
  }

  if (successParam || completedOrderId) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "#D1FAE5" }}>
        <span className="text-4xl">✓</span>
      </div>
      <h1 className="text-3xl font-bold text-stone-800 mb-3">Order Confirmed!</h1>
      <p className="text-stone-500 text-base mb-2">Payment received. Your order has been placed successfully.</p>
      <p className="text-stone-400 text-sm mb-8">The builder will prepare your instrument for shipment and provide tracking information.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to={createPageUrl("Orders")} className="font-semibold px-8 py-3 rounded-xl text-white" style={{ backgroundColor: NAVY }}>
          View My Orders
        </Link>
        <Link to={createPageUrl("Catalog")} className="border border-stone-300 text-stone-600 font-semibold px-8 py-3 rounded-xl hover:bg-stone-50">
          Keep Shopping
        </Link>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
    </div>
  );

  if (cartItems.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <ShoppingCart className="w-16 h-16 text-stone-300 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-stone-600 mb-2">Your cart is empty</h2>
      <Link to={createPageUrl("Catalog")} className="text-amber-600 hover:underline flex items-center justify-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Browse Guitars
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link to={createPageUrl("Catalog")} className="text-stone-400 hover:text-stone-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-stone-800">Checkout</h1>
      </div>

      {/* Shipping form — editable above the Stripe form */}
      <div className="mb-6 bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-amber-600" /> Shipping Address
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-stone-600 mb-1">Full Name *</label>
            <input required value={shippingForm.full_name} onChange={e => setShippingForm(f => ({ ...f, full_name: e.target.value }))}
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-stone-600 mb-1">Street Address *</label>
            <input required value={shippingForm.address} onChange={e => setShippingForm(f => ({ ...f, address: e.target.value }))}
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">City *</label>
            <input required value={shippingForm.city} onChange={e => setShippingForm(f => ({ ...f, city: e.target.value }))}
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">State *</label>
            <input required value={shippingForm.state} onChange={e => setShippingForm(f => ({ ...f, state: e.target.value }))}
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">ZIP Code *</label>
            <input required value={shippingForm.zip} onChange={e => setShippingForm(f => ({ ...f, zip: e.target.value }))}
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {stripePromise ? (
            <Elements stripe={stripePromise}>
              <CheckoutForm
                cartItems={cartItems}
                user={user}
                shippingForm={shippingForm}
                legalChecked={legalChecked}
                onLegalChange={(id, val) => setLegalChecked(prev => ({ ...prev, [id]: val }))}
                onSuccess={handleSuccess}
              />
            </Elements>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              Payment processing is not configured. Please contact the platform administrator.
            </div>
          )}
        </div>
        <OrderSummary cartItems={cartItems} />
      </div>
    </div>
  );
}