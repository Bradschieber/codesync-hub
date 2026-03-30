import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ShoppingBag, ChevronLeft, Package, MessageSquare, FileText,
  Truck, CreditCard, ChevronDown, ChevronUp, Calendar,
  CheckCircle, AlertCircle, Clock, MapPin, ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import OrderProgressTracker from "../components/orders/OrderProgressTracker";
import FulfillmentStatusBadge from "../components/orders/FulfillmentStatusBadge";
import BuildUpdatesFeed from "../components/orders/BuildUpdatesFeed";
import PurchaseAgreementButton from "../components/orders/PurchaseAgreementButton";
import LegalAcceptanceBlock from "../components/legal/LegalAcceptanceBlock";
import LegalLink from "../components/legal/LegalLink";
import { LEGAL_URLS, LEGAL_VERSIONS, logLegalAcceptance } from "../lib/legalConfig";

const NAVY = "#1B2B4B";
const AMBER = "#C57A1F";

const STATUS_MESSAGES = {
  // Stock build statuses
  pending_payment:       { text: "Your order is awaiting payment.", type: "info" },
  payment_succeeded:     { text: "Payment received! The builder is preparing your instrument for shipment.", type: "info" },
  awaiting_shipment:     { text: "Payment confirmed. The builder is preparing to ship your instrument.", type: "info" },
  tracking_submitted:    { text: "The builder has submitted tracking information. Our team is verifying shipment.", type: "info" },
  shipment_verified:     { text: "Shipment has been verified. Your instrument is on its way!", type: "shipped" },
  // Fulfillment statuses
  order_received:        { text: "Your order has been received. The builder will confirm it shortly.", type: "info" },
  order_confirmed:       { text: "Your builder has confirmed the order and will begin preparing the instrument.", type: "info" },
  deposit_paid:          { text: "Deposit received. Your builder will schedule your build and begin work soon.", type: "info" },
  build_scheduled:       { text: "Your build has been scheduled. The builder will begin work soon.", type: "info" },
  build_in_progress:     { text: "Your instrument is currently being built by hand.", type: "info" },
  build_complete:        { text: "Your instrument is complete and awaiting final payment before shipment.", type: "payment" },
  awaiting_final_payment:{ text: "Your instrument is complete and awaiting final payment before shipment.", type: "payment" },
  preparing_to_ship:     { text: "The builder is preparing your instrument for shipment.", type: "info" },
  shipped:               { text: "Your instrument has shipped and is on the way.", type: "shipped" },
  received_by_buyer:     { text: "Your instrument has been delivered. Enjoy!", type: "complete" },
  delivered:             { text: "Your instrument has been delivered. Enjoy!", type: "complete" },
  cancelled:             { text: "This order has been cancelled.", type: "cancelled" },
};

function getEffectiveStatus(order) {
  // For stock builds, prefer current_status for up-to-date state
  if (order.order_type === "stock" && order.current_status) {
    const stockStatusMap = {
      pending_payment: "pending_payment",
      payment_succeeded: "payment_succeeded",
      awaiting_shipment: "awaiting_shipment",
      tracking_submitted: "tracking_submitted",
      shipment_verified: "shipment_verified",
      delivered: "delivered",
    };
    if (stockStatusMap[order.current_status]) return stockStatusMap[order.current_status];
  }
  if (
    order.order_type === "custom" &&
    order.fulfillment_status === "build_complete" &&
    order.payment_stage === "awaiting_final_payment"
  ) {
    return "awaiting_final_payment";
  }
  return order.fulfillment_status;
}

function getTrackingUrl(carrier, trackingNumber) {
  if (!carrier || !trackingNumber) return "#";
  const c = carrier.toLowerCase();
  if (c.includes("ups"))   return `https://www.ups.com/track?tracknum=${trackingNumber}`;
  if (c.includes("fedex")) return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
  if (c.includes("usps"))  return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  return `https://www.google.com/search?q=${encodeURIComponent((carrier || "") + " tracking " + trackingNumber)}`;
}

export default function Orders() {
  const [orders, setOrders]   = useState([]);
  const [user, setUser]       = useState(null);
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

  const activeOrders = orders.filter(o =>
    !["received_by_buyer", "delivered"].includes(o.fulfillment_status) &&
    !["delivered", "cancelled", "refunded"].includes(o.current_status) &&
    o.status !== "cancelled"
  );
  const pastOrders = orders.filter(o =>
    ["received_by_buyer", "delivered"].includes(o.fulfillment_status) ||
    ["delivered", "cancelled", "refunded"].includes(o.current_status) ||
    o.status === "cancelled"
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10" style={{ minHeight: "100vh", backgroundColor: "#FAF9F7" }}>
      <div className="flex items-center gap-3 mb-8">
        <Link to={createPageUrl("Account")} className="text-stone-400 hover:text-stone-700">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>My Orders</h1>
          <p className="text-sm text-stone-500">Track your instruments and manage payments</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[0,1].map(i => <div key={i} className="h-32 bg-stone-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24">
          <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-600 mb-2">No orders yet</h3>
          <p className="text-sm text-stone-400 mb-6">When you purchase an instrument, it will appear here.</p>
          <Link to={createPageUrl("Catalog")} className="inline-block font-semibold px-5 py-2.5 text-sm text-white rounded-lg" style={{ backgroundColor: NAVY }}>
            Browse Guitars
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {activeOrders.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Active Orders</h2>
              <div className="space-y-4">
                {activeOrders.map(order => (
                  <OrderCard key={order.id} order={order} user={user}
                    expanded={!!expanded[order.id]}
                    onToggle={() => toggleExpand(order.id)}
                    onContact={() => setContactOrder(order)} />
                ))}
              </div>
            </section>
          )}
          {pastOrders.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Past Orders</h2>
              <div className="space-y-4">
                {pastOrders.map(order => (
                  <OrderCard key={order.id} order={order} user={user}
                    expanded={!!expanded[order.id]}
                    onToggle={() => toggleExpand(order.id)}
                    onContact={() => setContactOrder(order)} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {contactOrder && (
        <MessageBuilderModal order={contactOrder} user={user} onClose={() => setContactOrder(null)} />
      )}
    </div>
  );
}

function OrderCard({ order, user, expanded, onToggle, onContact }) {
  const instruments  = order.items || [];
  const primaryItem  = instruments[0];
  const effectiveStatus = getEffectiveStatus(order);
  const statusMsg    = STATUS_MESSAGES[effectiveStatus];
  const isFinalPaymentDue = effectiveStatus === "awaiting_final_payment";
  const isShipped    = order.fulfillment_status === "shipped";
  const remainingBalance = (order.total_amount || 0) - (order.deposit_amount || 0);

  // Final payment legal acceptance state (per card instance)
  const [finalPaymentChecked, setFinalPaymentChecked] = useState({ authorize: false, shipment: false });
  const [payingFinal, setPayingFinal] = useState(false);

  async function handleFinalPayment() {
    if (!finalPaymentChecked.authorize) return;
    setPayingFinal(true);
    await logLegalAcceptance(base44, {
      user,
      agreementType: "final_payment_authorization",
      checkboxLabels: [
        "I authorize payment of the final balance for this custom build.",
        ...(finalPaymentChecked.shipment ? ["I understand that shipment will not occur until final payment is received through Stringed Collective."] : []),
      ],
      documentUrls: [LEGAL_URLS.buyer_terms],
      versions: { buyer_terms: LEGAL_VERSIONS.buyer_terms },
      sourceScreen: "Orders",
      orderId: order.id,
    });
    alert("Please contact Stringed Collective to complete your final balance payment. Your authorization has been recorded.");
    setPayingFinal(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">

      {/* ── Card Header ── */}
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
                <span className="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: order.order_type === "custom" ? "#F0EBF8" : "#EEF1F7", color: order.order_type === "custom" ? "#7B5EA7" : NAVY }}>
                  {order.order_type === "custom" ? "Custom Build" : "Stock"}
                </span>
                <FulfillmentStatusBadge status={effectiveStatus} />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <p className="font-bold text-sm" style={{ color: AMBER }}>${order.total_amount?.toLocaleString()}</p>
            <p className="text-xs text-stone-400">{order.created_date ? format(new Date(order.created_date), "MMM d, yyyy") : ""}</p>
            {expanded ? <ChevronUp className="w-4 h-4 text-stone-400 mt-1" /> : <ChevronDown className="w-4 h-4 text-stone-400 mt-1" />}
          </div>
        </div>
      </button>

      {/* ── Expanded Detail ── */}
      {expanded && (
        <div className="border-t border-stone-100 px-5 pb-6 pt-4 space-y-5">

          {/* Final Payment Banner with Legal Acceptance */}
          {isFinalPaymentDue && (
            <div className="rounded-xl border-2 p-5 space-y-4" style={{ borderColor: AMBER, backgroundColor: "#FDF8F0" }}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: AMBER }} />
                <div className="flex-1">
                  <p className="font-bold text-sm mb-1" style={{ color: "#7A4A10" }}>Your instrument is complete</p>
                  <p className="text-sm mb-2 leading-relaxed" style={{ color: "#8C5E20" }}>
                    Your builder has marked this custom build complete. Final payment is required before shipment can proceed.
                  </p>
                  {order.deposit_amount > 0 && (
                    <p className="text-sm font-semibold" style={{ color: "#7A4A10" }}>
                      Final balance: <span style={{ color: AMBER }}>${remainingBalance.toLocaleString()}</span>
                    </p>
                  )}
                </div>
              </div>

              <LegalAcceptanceBlock
                checkboxes={[
                  {
                    id: "authorize",
                    label: "I authorize payment of the final balance for this custom build.",
                  },
                  {
                    id: "shipment",
                    required: false,
                    label: <>I understand that shipment will not occur until final payment is received through Stringed Collective. <span className="text-stone-400 font-normal">(View <LegalLink href={LEGAL_URLS.buyer_terms}>Buyer Terms</LegalLink>)</span></>,
                  },
                ]}
                checked={finalPaymentChecked}
                onChange={(id, val) => setFinalPaymentChecked(prev => ({ ...prev, [id]: val }))}
              />

              <button
                onClick={handleFinalPayment}
                disabled={!finalPaymentChecked.authorize || payingFinal}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: AMBER }}
                onMouseEnter={e => { if (finalPaymentChecked.authorize) e.currentTarget.style.backgroundColor = "#a8661a"; }}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = AMBER}
              >
                <CreditCard className="w-4 h-4" /> {payingFinal ? "Processing..." : "Pay Final Balance"}
              </button>
            </div>
          )}

          {/* Dynamic Status Message (non-payment stages) */}
          {statusMsg && !isFinalPaymentDue && (
            <div className={`flex items-start gap-3 rounded-xl p-4 ${
              statusMsg.type === "complete"  ? "bg-green-50 border border-green-200" :
              statusMsg.type === "shipped"   ? "bg-blue-50 border border-blue-100" :
              statusMsg.type === "cancelled" ? "bg-red-50 border border-red-200" :
              "bg-stone-50 border border-stone-200"
            }`}>
              {statusMsg.type === "complete"  && <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />}
              {statusMsg.type === "shipped"   && <Truck className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />}
              {statusMsg.type === "cancelled" && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />}
              {(statusMsg.type === "info" || statusMsg.type === "payment") && <Clock className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />}
              <p className={`text-sm leading-snug ${
                statusMsg.type === "complete"  ? "text-green-800" :
                statusMsg.type === "shipped"   ? "text-blue-800" :
                statusMsg.type === "cancelled" ? "text-red-700" :
                "text-stone-600"
              }`}>{statusMsg.text}</p>
            </div>
          )}

          {/* Progress Tracker */}
          <OrderProgressTracker order={order} />

          {/* Payment Summary */}
          {order.order_type === "custom" && order.total_amount > 0 && (
            <div className="rounded-xl border border-stone-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-100 bg-stone-50">
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Payment Summary</p>
              </div>
              <div className="divide-y divide-stone-100">
                <div className="flex justify-between px-4 py-3 text-sm">
                  <span className="text-stone-500">Total Price</span>
                  <span className="font-semibold text-stone-800">${order.total_amount.toLocaleString()}</span>
                </div>
                {order.deposit_amount > 0 && (
                  <div className="flex justify-between px-4 py-3 text-sm">
                    <span className="text-stone-500">Deposit Paid</span>
                    <span className="font-semibold text-green-600">−${order.deposit_amount.toLocaleString()}</span>
                  </div>
                )}
                {order.deposit_amount > 0 && (
                  <div className="flex justify-between px-4 py-3 text-sm bg-stone-50">
                    <span className="font-semibold text-stone-700">Remaining Balance</span>
                    <span className="font-bold" style={{ color: order.final_payment_paid ? "#27AE60" : AMBER }}>
                      {order.final_payment_paid ? "Paid ✓" : `$${remainingBalance.toLocaleString()}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Items */}
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

          {/* Build Dates */}
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

          {/* Shipping Tracking */}
          {isShipped && order.tracking_number && (
            <div className="rounded-xl border border-stone-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-100 bg-stone-50 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-500" />
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Shipment Tracking</p>
              </div>
              <div className="px-4 py-3 space-y-2">
                {order.tracking_carrier && (
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Carrier</span>
                    <span className="font-medium text-stone-800">{order.tracking_carrier}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Tracking #</span>
                  <span className="font-mono text-stone-700">{order.tracking_number}</span>
                </div>
                <a
                  href={getTrackingUrl(order.tracking_carrier, order.tracking_number)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full mt-2 py-2 rounded-lg text-sm font-semibold border transition-colors"
                  style={{ borderColor: "#1A8FD1", color: "#1A8FD1", backgroundColor: "#fff" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#E8F4FB"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff"}
                >
                  <ExternalLink className="w-4 h-4" /> Track Shipment
                </a>
              </div>
            </div>
          )}

          {/* Build Updates */}
          {order.order_type === "custom" && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">Build Updates</p>
              <BuildUpdatesFeed orderId={order.id} />
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
            <p className="text-xs text-stone-400 flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{[order.shipping_address.line1, order.shipping_address.city, order.shipping_address.state, order.shipping_address.postal_code].filter(Boolean).join(", ")}</span>
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={onContact}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
              style={{ borderColor: NAVY, color: NAVY, backgroundColor: "#fff" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F2F0EA"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff"}
            >
              <MessageSquare className="w-4 h-4" /> Message The Builder
            </button>

            <PurchaseAgreementButton orderId={order.id} userRole="buyer" />
          </div>

          <p className="text-xs text-stone-300">Order #{order.id.slice(-8).toUpperCase()}</p>
        </div>
      )}
    </div>
  );
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
                style={{ backgroundColor: NAVY }}>
                Send Message
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}