import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ShoppingCart, CreditCard, CheckCircle, ArrowLeft, Truck } from "lucide-react";

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [shippingForm, setShippingForm] = useState({ full_name: "", address: "", city: "", state: "", zip: "", country: "US" });

  const params = new URLSearchParams(window.location.search);
  const success = params.get("success");

  useEffect(() => { loadCart(); }, []);

  async function loadCart() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const items = await base44.entities.CartItem.filter({ user_id: u.id });
      setCartItems(items);
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  const total = cartItems.reduce((sum, i) => sum + i.product_price * i.quantity, 0);

  async function handlePlaceOrder(e) {
    e.preventDefault();
    if (!user) return;
    setPlacing(true);
    await base44.entities.Order.create({
      user_id: user.id,
      buyer_email: user.email,
      items: cartItems.map(i => ({ product_id: i.product_id, product_name: i.product_name, product_image: i.product_image, product_price: i.product_price, builder_name: i.builder_name })),
      total_amount: total,
      status: "paid",
      shipping_address: shippingForm,
    });
    // Clear cart
    for (const item of cartItems) {
      await base44.entities.CartItem.delete(item.id);
    }
    setOrderPlaced(true);
    setPlacing(false);
  }

  if (success || orderPlaced) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-stone-800 mb-3">Order Confirmed!</h1>
      <p className="text-stone-500 text-lg mb-6">Thank you for your purchase. The builder will be in touch about shipping.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to={createPageUrl("Orders")} className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-8 py-3 rounded-xl">View Orders</Link>
        <Link to={createPageUrl("Catalog")} className="border border-stone-300 text-stone-600 font-semibold px-8 py-3 rounded-xl hover:bg-stone-50">Keep Shopping</Link>
      </div>
    </div>
  );

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" /></div>;

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
      <h1 className="text-2xl font-bold text-stone-800 mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h2 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><Truck className="w-5 h-5 text-amber-600" /> Shipping Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-600 mb-1">Full Name *</label>
                  <input required value={shippingForm.full_name} onChange={e => setShippingForm({...shippingForm, full_name: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-600 mb-1">Street Address *</label>
                  <input required value={shippingForm.address} onChange={e => setShippingForm({...shippingForm, address: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">City *</label>
                  <input required value={shippingForm.city} onChange={e => setShippingForm({...shippingForm, city: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">State *</label>
                  <input required value={shippingForm.state} onChange={e => setShippingForm({...shippingForm, state: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">ZIP Code *</label>
                  <input required value={shippingForm.zip} onChange={e => setShippingForm({...shippingForm, zip: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h2 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-amber-600" /> Payment</h2>
              <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-800 border border-amber-200">
                <p className="font-medium mb-1">Demo Mode</p>
                <p>In production, Stripe payment processing would be integrated here. For this demo, clicking "Place Order" will record the order directly.</p>
              </div>
            </div>

            <button type="submit" disabled={placing} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl text-lg transition-colors disabled:opacity-50">
              {placing ? "Placing Order..." : `Place Order — $${total.toLocaleString()}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 h-fit">
          <h2 className="font-bold text-stone-800 mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex gap-3 items-center">
                {item.product_image && <img src={item.product_image} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700 truncate">{item.product_name}</p>
                  <p className="text-xs text-stone-400">{item.builder_name}</p>
                </div>
                <p className="text-sm font-bold text-amber-700">${item.product_price?.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-stone-600">
              <span>Subtotal</span><span>${total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-600">
              <span>Shipping</span><span className="text-green-600">TBD</span>
            </div>
            <div className="flex justify-between font-bold text-stone-800 text-base pt-1 border-t border-stone-200">
              <span>Total</span><span>${total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}