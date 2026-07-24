import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ShoppingCart, Lock, AlertCircle, CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";
import ShippingSelector from "@/components/checkout/ShippingSelector";
import { formatCurrency } from "@/lib/utils";
import { ALLOWED_COUNTRIES, isAllowedCountry } from "@/lib/countries";

const NAVY = "#1B2B4B";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

function CheckoutForm({ order, user, shippingRate, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [cardError, setCardError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setCardError("");

    const piRes = await base44.functions.invoke("createPaymentIntentForOrder", { orderId: order.id });
    const clientSecret = piRes.data?.clientSecret;
    if (!clientSecret) {
      setCardError(piRes.data?.error || "Could not initiate payment.");
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

  const total = order.total_gross_amount || 0;

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
        disabled={paying || !stripe || !shippingRate}
        className="w-full py-3 text-sm font-bold text-white rounded-lg transition-colors disabled:opacity-50"
        style={{ backgroundColor: NAVY }}
      >
        {paying ? "Processing..." : `Pay ${formatCurrency(total)}`}
      </button>
      {!shippingRate && (
        <p className="text-xs text-amber-700 text-center">Please select a shipping option above to continue.</p>
      )}
    </form>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [creating, setCreating] = useState(false);
  const [paid, setPaid] = useState(false);
  const [shippingRate, setShippingRate] = useState(null);
  const [taxAmount, setTaxAmount] = useState(0);
  const [taxCalculationId, setTaxCalculationId] = useState(null);
  const [taxBreakdown, setTaxBreakdown] = useState(null);
  const [taxError, setTaxError] = useState("");
  const [calcingTax, setCalcingTax] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  useEffect(() => {
    init();
  }, []);

  async function init() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const items = await base44.entities.CartItem.filter({ user_id: u.id });
      setCartItems(items);

      const productMap = {};
      await Promise.all(items.map(async (item) => {
        const prods = await base44.entities.Product.filter({ id: item.product_id });
        if (prods.length) productMap[item.product_id] = prods[0];
      }));
      setProducts(productMap);
    } catch {
      // not logged in
    } finally {
      setLoading(false);
    }
  }

  // Recalculate tax whenever shipping rate or address changes
  useEffect(() => {
    if (!shippingRate) {
      setTaxAmount(0);
      setTaxCalculationId(null);
      setTaxBreakdown(null);
      setTaxError("");
      return;
    }
    calcTax();
  }, [shippingRate, shippingAddress.zip, shippingAddress.city, shippingAddress.address, shippingAddress.country]);

  async function calcTax() {
    if (!shippingAddress.zip || !shippingAddress.city || !shippingAddress.address) return;
    setCalcingTax(true);
    setTaxError("");
    try {
      const subtotal = cartItems.reduce((sum, item) => {
        const p = products[item.product_id];
        return sum + (p?.price || 0) * (item.quantity || 1);
      }, 0);

      const res = await base44.functions.invoke("calculateTax", {
        item_amount: subtotal,
        shipping_amount: shippingRate?.amount || 0,
        shipping_address: {
          line1: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.zip,
          country: shippingAddress.country || "US",
        },
      });

      if (res.data?.error) {
        setTaxAmount(0);
        setTaxCalculationId(null);
        setTaxBreakdown(null);
        setTaxError(res.data.message || "Tax calculation failed. Please verify your address.");
        return;
      }

      setTaxAmount(res.data?.tax_amount || 0);
      setTaxCalculationId(res.data?.stripe_tax_calculation_id || null);
      setTaxBreakdown({
        item: res.data?.tax_amount_item || 0,
        shipping: res.data?.tax_amount_shipping || 0,
        state: res.data?.tax_jurisdiction_state || shippingAddress.state,
      });
      setTaxError("");
    } catch (err) {
      setTaxAmount(0);
      setTaxCalculationId(null);
      setTaxBreakdown(null);
      setTaxError(err?.response?.data?.message || "We could not calculate sales tax for your address. Please verify your shipping address.");
    } finally {
      setCalcingTax(false);
    }
  }

  async function createOrder() {
    if (!shippingRate) return;

    // Hard-enforce: all orders must have a valid Stripe Tax calculation before proceeding
    if (!taxCalculationId) {
      setTaxError("Tax must be calculated before checkout. Please verify your shipping address.");
      return;
    }

    setCreating(true);

    const subtotal = cartItems.reduce((sum, item) => {
      const p = products[item.product_id];
      return sum + (p?.price || 0) * (item.quantity || 1);
    }, 0);

    const shippingCost = shippingRate?.amount || 0;
    const total = subtotal + shippingCost + taxAmount;

    // Get builder info from first item
    const firstProduct = products[cartItems[0]?.product_id];

    const newOrder = await base44.entities.Order.create({
      user_id: user.id,
      buyer_email: user.email,
      buyer_name: shippingAddress.name || user.full_name,
      builder_id: firstProduct?.builder_id,
      builder_name: firstProduct?.builder_name,
      order_type: "stock",
      current_status: "pending_payment",
      subtotal_amount: subtotal,
      shipping_amount: shippingCost,
      shipping_carrier: shippingRate.carrier,
      shipping_service: shippingRate.service,
      shipping_estimated_days: shippingRate.estimated_days,
      shippo_rate_object_id: shippingRate.shippo_rate_object_id,
      tax_provider: "stripe_tax",
      tax_amount: taxAmount,
      tax_amount_item: taxBreakdown?.item || 0,
      tax_amount_shipping: taxBreakdown?.shipping || 0,
      tax_jurisdiction_state: shippingAddress.state,
      tax_jurisdiction_country: (shippingAddress.country || "US").toUpperCase(),
      stripe_tax_calculation_id: taxCalculationId,
      total_gross_amount: total,
      total_amount: total,
      shipping_address: {
        name: shippingAddress.name,
        line1: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postal_code: shippingAddress.zip,
        country: shippingAddress.country,
      },
      items: cartItems.map(item => ({
        product_id: item.product_id,
        product_name: products[item.product_id]?.name,
        quantity: item.quantity || 1,
        price: products[item.product_id]?.price,
      })),
    });

    setOrder(newOrder);
    setCreating(false);
  }

  async function handlePaymentSuccess() {
    // Clear cart
    await Promise.all(cartItems.map(item => base44.entities.CartItem.delete(item.id)));
    setPaid(true);
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const p = products[item.product_id];
    return sum + (p?.price || 0) * (item.quantity || 1);
  }, 0);

  const shippingCost = shippingRate?.amount || 0;
  const isSupportedCountry = isAllowedCountry(shippingAddress.country);
  const isInternational = (shippingAddress.country || "US").toUpperCase() !== "US";
  const total = subtotal + shippingCost + taxAmount;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-stone-600">Please sign in to checkout.</p>
        <button onClick={() => base44.auth.redirectToLogin()} className="px-6 py-2 text-white rounded-lg text-sm font-semibold" style={{ backgroundColor: NAVY }}>
          Sign In
        </button>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
        <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Order Confirmed!</h1>
        <p className="text-stone-500 text-center">Thank you for your purchase. You'll receive a confirmation email shortly.</p>
        <Link to={createPageUrl("Orders")} className="px-6 py-2 text-white rounded-lg text-sm font-semibold" style={{ backgroundColor: NAVY }}>
          View My Orders
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <ShoppingCart className="w-12 h-12 text-stone-300" />
        <p className="text-stone-500">Your cart is empty.</p>
        <Link to={createPageUrl("Catalog")} className="px-6 py-2 text-white rounded-lg text-sm font-semibold" style={{ backgroundColor: NAVY }}>
          Browse Instruments
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: "#FDFBF8" }}>
      <div className="max-w-5xl mx-auto">
        <Link to={createPageUrl("Catalog")} className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-8">
          <ChevronLeft className="w-4 h-4" /> Continue Shopping
        </Link>

        <h1 className="text-2xl font-bold mb-8" style={{ color: NAVY }}>Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Shipping & Payment */}
          <div className="space-y-8">
            {/* Shipping Address */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#8A9BB0" }}>Shipping Address</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Full name"
                  value={shippingAddress.name}
                  onChange={e => setShippingAddress(a => ({ ...a, name: e.target.value }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-stone-400"
                />
                <input
                  type="text"
                  placeholder="Street address"
                  value={shippingAddress.address}
                  onChange={e => setShippingAddress(a => ({ ...a, address: e.target.value }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-stone-400"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={shippingAddress.city}
                    onChange={e => setShippingAddress(a => ({ ...a, city: e.target.value }))}
                    className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-stone-400"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={shippingAddress.state}
                    onChange={e => setShippingAddress(a => ({ ...a, state: e.target.value }))}
                    className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="ZIP / Postal code"
                    value={shippingAddress.zip}
                    onChange={e => setShippingAddress(a => ({ ...a, zip: e.target.value }))}
                    className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-stone-400"
                  />
                  <select
                    value={shippingAddress.country}
                    onChange={e => setShippingAddress(a => ({ ...a, country: e.target.value }))}
                    className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-stone-400 bg-white"
                  >
                    {ALLOWED_COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Shipping Options */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#8A9BB0" }}>Shipping</h2>
              <ShippingSelector
                cartItems={cartItems}
                shippingAddress={shippingAddress}
                onShippingSelected={setShippingRate}
              />
            </div>

            {/* Payment */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#8A9BB0" }}>Payment</h2>
              {isInternational && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800 mb-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Customs & duties:</strong> Your order may be subject to customs duties, import VAT, or brokerage fees collected by the carrier upon delivery. These charges are separate from your order total and are determined by your local customs authority.
                  </span>
                </div>
              )}
              {taxError && isSupportedCountry && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 mb-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{taxError}</span>
                </div>
              )}
              {!order ? (
                <button
                  onClick={createOrder}
                  disabled={creating || !shippingRate || calcingTax || !!taxError || !isSupportedCountry}
                  className="w-full py-3 text-sm font-bold text-white rounded-lg transition-colors disabled:opacity-50"
                  style={{ backgroundColor: NAVY }}
                >
                  {creating ? "Preparing order..." : calcingTax ? "Calculating tax..." : "Continue to Payment"}
                </button>
              ) : (
                <Elements stripe={stripePromise}>
                  <CheckoutForm
                    order={order}
                    user={user}
                    shippingRate={shippingRate}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#8A9BB0" }}>Order Summary</h2>
            <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
              {cartItems.map(item => {
                const p = products[item.product_id];
                return (
                  <div key={item.id} className="flex gap-4 p-4 border-b border-stone-100 last:border-0">
                    {p?.image_urls?.[0] && (
                      <img src={p.image_urls[0]} alt={p.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-800 truncate">{p?.name || "Product"}</p>
                      <p className="text-xs text-stone-400">{p?.builder_name}</p>
                    </div>
                    <p className="text-sm font-bold text-stone-800">{formatCurrency(p?.price || 0)}</p>
                  </div>
                );
              })}

              <div className="p-4 space-y-2 bg-stone-50 border-t border-stone-100">
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Shipping</span>
                  <span>
                    {shippingRate
                      ? shippingCost === 0 ? "Free" : formatCurrency(shippingCost)
                      : <span className="text-stone-400">–</span>}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Tax</span>
                  <span>
                    {calcingTax
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" />
                      : taxError
                        ? <span className="text-red-500 text-xs">Unavailable</span>
                        : taxCalculationId ? formatCurrency(taxAmount) : <span className="text-stone-400">–</span>}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-stone-200" style={{ color: NAVY }}>
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}