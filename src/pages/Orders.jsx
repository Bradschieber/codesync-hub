import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ShoppingBag, ChevronLeft, Package, MessageSquare,
  FileText, Truck, CreditCard, ChevronDown, ChevronUp,
  Calendar, CheckCircle, AlertCircle, Clock, MapPin
} from "lucide-react";
import { format } from "date-fns";
import OrderProgressTracker from "../components/orders/OrderProgressTracker";

// Buyer-friendly labels for fulfillment status
const FULFILLMENT_LABELS = {
  order_received:       { label: "Order Received",          color: "#2F3E55", bg: "#EEF1F7" },
  order_confirmed:      { label: "Order Confirmed",         color: "#2F3E55", bg: "#EEF1F7" },
  deposit_paid:         { label: "Deposit Paid",            color: "#27AE60", bg: "#E8F6ED" },
  build_scheduled:      { label: "Build Scheduled",         color: "#7B5EA7", bg: "#F0EBF8" },
  build_in_progress:    { label: "Being Built",             color: "#C57A1F", bg: "#FDF3E3" },
  build_complete:       { label: "Build Complete",          color: "#27AE60", bg: "#E8F6ED" },
  preparing_to_ship:    { label: "Preparing to Ship",       color: "#C57A1F", bg: "#FDF3E3" },
  shipped:              { label: "Shipped",                 color: "#1A8FD1", bg: "#E8F4FB" },
  received_by_buyer:    { label: "Delivered",              color: "#27AE60", bg: "#E8F6ED" },
  cancelled:            { label: "Cancelled",               color: "#CC3A3A", bg: "#FDEAEA" },
};

const PAYMENT_LABELS = {
  awaiting_deposit:        { label: "Awaiting Deposit",        color: "#C57A1F", bg: "#FDF3E3" },
  deposit_paid:            { label: "Deposit Paid",            color: "#27AE60", bg: "#E8F6ED" },
  awaiting_final_payment:  { label: "Final Payment Due",       color: "#CC3A3A", bg: "#FDEAEA" },
  final_payment_received:  { label: "Final Payment Received",  color: "#27AE60", bg: "#E8F6ED" },
  fully_paid:              { label: "Paid in Full",            color: "#27AE60", bg: "#E8F6ED" },
};

function getNextAction(order) {
  if (order.status === "cancelled") return null;
  if (order.order_type === "custom") {
    if (order.payment_stage === "awaiting_deposit") return { type: "deposit", label: "Deposit payment required to begin your build." };
    if (order.payment_stage === "awaiting_final_payment") return { type: "final_payment", label: "Your instrument is complete! Final balance payment required to authorize shipment." };
    if (order.payment_stage === "final_payment_received" && order.fulfillment_status === "build_complete") return { type: "info", label: "Payment received. Your builder is preparing to ship your instrument." };
  }
  if (order.fulfillment_status === "shipped" && !order.delivery_confirmed) return { type: "tracking", label: "Your instrument is on its way. Track your shipment below." };
  if (order.fulfillment_status === "received_by_buyer") return { type: "complete", label: "Order complete. Enjoy your instrument!" };
  if (order.fulfillment_status === "order_received" || order.fulfillment_status === "order_confirmed") return { type: "info", label: "Your order has been received and is being confirmed with the builder." };
  if (order.fulfillment_status === "build_in_progress") return { type: "info", label: "Your instrument is being handcrafted. You'll be notified when the build is complete." };
  if (order.fulfillment_status === "preparing_to_ship") return { type: "info", label: "Your instrument is packed and ready. Tracking info will be added soon." };
  return null;
}

function StatusPill({ label, color, bg }) {
  return (
    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ color, backgroundColor: bg }}>
      {label}
    </span>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [contactOrder, setContactOrder] = useState(null);

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const data = await base44.entities.Order.filter({ user_id: u.id }, "-created_date", 50);
      setOrders(data);
      // Auto-expand first active order
      const active = data.find(o => o.status !== "cancelled" && o.fulfillment_status !== "received_by_buyer");
      if (active) setExpanded({ [active.id]: true });
    } catch {
      base44.auth.redirectToLogin();
    }
    setLoading(false);
  }

  function toggleExpand(id) {
    setExpanded(e => ({ ...e, [id]: !e[id] }));
  }

  const activeOrders = orders.filter(o => o.fulfillment_status !== "received_by_buyer" && o.status !== "cancelled");
  const pastOrders = orders.filter(o => o.fulfillment_status === "received_by_buyer" || o.status === "cancelled");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10" style={{ minHeight: "100vh", backgroundColor: "#FAF9F7" }}>
      <div className="flex items-center gap-3 mb-8">
        <Link to={createPageUrl("Account")} className="text-stone-400 hover:text-stone-700">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B2B4B" }}>My Orders</h1>
          <p className="text-sm text-stone-500">Track your instruments and manage payments</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array(2).fill(0).map((_, i) => <div key={i} className="h-32 bg-stone-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24">
          <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-600 mb-2">No orders yet</h3>
          <p className="text-sm text-stone-400 mb-6">When you purchase an instrument, it will appear here.</p>
          <Link to={createPageUrl("Catalog")} className="inline-block font-semibold px-5 py-2.5 text-sm text-white rounded-lg" style={{ backgroundColor: "#2F3E55" }}>
            Browse Guitars
          </Link>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Active Orders */}
          {activeOrders.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Active Orders</h2>
              <div className="space-y-4">
                {activeOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    user={user}
                    expanded={!!expanded[order.id]}
                    onToggle={() => toggleExpand(order.id)}
                    onContact={() => setContactOrder(order)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Past Orders */}
          {pastOrders.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Past Orders</h2>
              <div className="space-y-4">
                {pastOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    user={user}
                    expanded={!!expanded[order.id]}
                    onToggle={() => toggleExpand(order.id)}
                    onContact={() => setContactOrder(order)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {contactOrder && (
        <MessageBuilderModal
          order={contactOrder}
          user={user}
          onClose={() => setContactOrder(null)}
        />
      )}
    </div>
  );
}

function OrderCard({ order, user, expanded, onToggle, onContact }) {
  const fulfillment = FULFILLMENT_LABELS[order.fulfillment_status] || { label: order.fulfillment_status, color: "#555", bg: "#eee" };
  const payment = order.payment_stage ? PAYMENT_LABELS[order.payment_stage] : null;
  const nextAction = getNextAction(order);
  const instruments = order.items || [];
  const primaryItem = instruments[0];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">

      {/* Header Row */}
      <button className="w-full text-left p-5 hover:bg-stone-50 transition-colors" onClick={onToggle}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {primaryItem?.product_image ? (
              <img src={primaryItem.product_image} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-stone-100" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-6 h-6 text-stone-300" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight truncate" style={{ color: "#1A1A1A" }}>
                {primaryItem?.product_name || "Order"}
                {instruments.length > 1 && <span className="text-stone-400 font-normal ml-1">+{instruments.length - 1} more</span>}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                by <span className="font-medium">{order.builder_name}</span>
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className="inline-block text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: order.order_type === "custom" ? "#F0EBF8" : "#EEF1F7", color: order.order_type === "custom" ? "#7B5EA7" : "#2F3E55" }}>
                  {order.order_type === "custom" ? "Custom Build" : "Stock"}
                </span>
                <StatusPill {...fulfillment} />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <p className="font-bold text-sm" style={{ color: "#A0692A" }}>${order.total_amount?.toLocaleString()}</p>
            <p className="text-xs text-stone-400">{order.created_date ? format(new Date(order.created_date), "MMM d, yyyy") : ""}</p>
            {expanded ? <ChevronUp className="w-4 h-4 text-stone-400 mt-1" /> : <ChevronDown className="w-4 h-4 text-stone-400 mt-1" />}
          </div>
        </div>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-stone-100 px-5 pb-6 pt-4 space-y-5">

          {/* Next Action Banner */}
          {nextAction && (
            <div className={`flex items-start gap-3 rounded-xl p-4 ${nextAction.type === "final_payment" ? "bg-amber-50 border-2 border-amber-300" : nextAction.type === "complete" ? "bg-green-50 border border-green-200" : "bg-blue-50 border border-blue-100"}`}>
              {nextAction.type === "final_payment" && <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />}
              {nextAction.type === "complete" && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
              {(nextAction.type === "info" || nextAction.type === "tracking") && <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />}
              <p className={`text-sm font-medium leading-snug ${nextAction.type === "final_payment" ? "text-amber-900" : nextAction.type === "complete" ? "text-green-800" : "text-blue-800"}`}>
                {nextAction.label}
              </p>
            </div>
          )}

          {/* Progress Tracker */}
          <OrderProgressTracker order={order} />

          {/* Status Details Row */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-stone-50 p-3">
              <p className="text-xs text-stone-400 font-medium mb-1">Order Status</p>
              <StatusPill {...fulfillment} />
            </div>
            {payment && (
              <div className="rounded-xl bg-stone-50 p-3">
                <p className="text-xs text-stone-400 font-medium mb-1">Payment Status</p>
                <StatusPill {...payment} />
              </div>
            )}
          </div>

          {/* Items List */}
          {instruments.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Items</p>
              {instruments.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.product_image && <img src={item.product_image} className="w-10 h-10 rounded-lg object-cover border border-stone-100 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{item.product_name}</p>
                    <p className="text-xs text-stone-400">by {item.builder_name}</p>
                  </div>
                  <p className="text-sm font-semibold text-stone-600">${item.product_price?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}

          {/* Custom Build Dates */}
          {order.order_type === "custom" && (order.build_start_date || order.estimated_build_completion_date) && (
            <div className="flex flex-wrap gap-4 text-xs text-stone-600">
              {order.build_start_date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>Build starts: <strong>{format(new Date(order.build_start_date), "MMM d, yyyy")}</strong></span>
                </div>
              )}
              {order.estimated_build_completion_date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-green-500" />
                  <span>Est. completion: <strong>{format(new Date(order.estimated_build_completion_date), "MMM d, yyyy")}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Builder Notes */}
          {order.builder_notes && (
            <div className="rounded-xl bg-stone-50 p-4 border border-stone-100">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-1">Note from Builder</p>
              <p className="text-sm text-stone-600 leading-relaxed">{order.builder_notes}</p>
            </div>
          )}

          {/* Shipping Address */}
          {order.shipping_address && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-1.5">Shipping To</p>
              <p className="text-xs text-stone-500 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  {[order.shipping_address.line1, order.shipping_address.city, order.shipping_address.state, order.shipping_address.postal_code].filter(Boolean).join(", ")}
                </span>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {/* Pay Final Balance */}
            {order.payment_stage === "awaiting_final_payment" && (
              <button
                onClick={() => alert("Please contact Stringed Collective to complete your final balance payment.")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors"
                style={{ backgroundColor: "#C57A1F" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#a8661a"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#C57A1F"}
              >
                <CreditCard className="w-4 h-4" /> Pay Final Balance
              </button>
            )}

            {/* Message Builder */}
            <button
              onClick={onContact}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
              style={{ borderColor: "#2F3E55", color: "#2F3E55", backgroundColor: "#fff" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F2F0EA"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff"}
            >
              <MessageSquare className="w-4 h-4" /> Message Builder
            </button>

            {/* Track Shipment */}
            {order.tracking_number && (
              <a
                href={getTrackingUrl(order.tracking_carrier, order.tracking_number)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                style={{ borderColor: "#1A8FD1", color: "#1A8FD1", backgroundColor: "#fff" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#E8F4FB"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff"}
              >
                <Truck className="w-4 h-4" /> Track Shipment
                {order.tracking_number && <span className="text-xs opacity-60 ml-1">{order.tracking_number}</span>}
              </a>
            )}

            {/* View Purchase Agreement */}
            {order.purchase_agreement_signed && (
              <button
                onClick={() => alert("Purchase agreement details are on file. Contact Stringed Collective for a copy.")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                style={{ borderColor: "#888", color: "#555", backgroundColor: "#fff" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F5F3F0"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff"}
              >
                <FileText className="w-4 h-4" /> View Purchase Agreement
              </button>
            )}
          </div>

          <p className="text-xs text-stone-300">Order #{order.id.slice(-8).toUpperCase()}</p>
        </div>
      )}
    </div>
  );
}

function getTrackingUrl(carrier, trackingNumber) {
  if (!carrier || !trackingNumber) return "#";
  const c = carrier.toLowerCase();
  if (c.includes("ups")) return `https://www.ups.com/track?tracknum=${trackingNumber}`;
  if (c.includes("fedex")) return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
  if (c.includes("usps")) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  return `https://www.google.com/search?q=${carrier}+tracking+${trackingNumber}`;
}

function MessageBuilderModal({ order, user, onClose }) {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const builderName = order.builder_name || "Builder";

  async function handleSend(e) {
    e.preventDefault();
    await base44.entities.Message.create({
      sender_id: user.id,
      sender_name: user.full_name,
      recipient_id: order.builder_id,
      recipient_name: builderName,
      subject: `Re: Order #${order.id.slice(-8).toUpperCase()} — ${order.items?.[0]?.product_name || "Your Order"}`,
      body: msg,
    });
    setSent(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-bold mb-1" style={{ color: "#1A1A1A" }}>Message {builderName}</h3>
        <p className="text-xs text-stone-400 mb-4">Re: Order #{order.id.slice(-8).toUpperCase()}</p>
        {sent ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="font-semibold text-green-700 mb-1">Message sent!</p>
            <p className="text-sm mb-4 text-stone-500">The builder will get back to you soon.</p>
            <button onClick={onClose} className="text-sm hover:underline text-stone-400">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-3">
            <textarea
              value={msg}
              onChange={e => setMsg(e.target.value)}
              rows={5}
              required
              placeholder="Write your message to the builder..."
              className="w-full border rounded-xl p-3 text-sm focus:outline-none resize-none"
              style={{ borderColor: "#E3E0D8" }}
            />
            <div className="flex gap-2">
              <button type="button" onClick={onClose}
                className="flex-1 border py-2.5 rounded-xl text-sm text-stone-500" style={{ borderColor: "#E3E0D8" }}>
                Cancel
              </button>
              <button type="submit"
                className="flex-1 text-white font-medium py-2.5 rounded-xl text-sm"
                style={{ backgroundColor: "#2F3E55" }}>
                Send Message
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}