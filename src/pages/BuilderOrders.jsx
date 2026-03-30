import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ShoppingBag, ChevronLeft, Package, ChevronDown, ChevronUp, Calendar, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import PurchaseAgreementButton from "../components/orders/PurchaseAgreementButton";
import { format } from "date-fns";
import FulfillmentStatusBadge, { STOCK_STATUSES, CUSTOM_STATUSES, STATUS_COLORS } from "../components/orders/FulfillmentStatusBadge";
import OrderProgressTracker from "../components/orders/OrderProgressTracker";
import BuildUpdateComposer from "../components/orders/BuildUpdateComposer";
import BuildUpdatesFeed from "../components/orders/BuildUpdatesFeed";
import TrackingSubmitForm from "../components/orders/TrackingSubmitForm";
import PayoutBreakdown from "../components/orders/PayoutBreakdown";

export default function BuilderOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [updating, setUpdating] = useState({});

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    try {
      const u = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) {
        const p = profiles[0];
        setProfile(p);
        const allOrders = await base44.entities.Order.list("-created_date", 200);
        const builderName = p.business_name || p.display_name;
        const builderOrders = allOrders.filter(order =>
          order.builder_id === p.id || order.items?.some(item => item.builder_name === builderName)
        );
        setOrders(builderOrders);
      }
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  function getStatusList(order) {
    return order.order_type === "custom" ? CUSTOM_STATUSES : STOCK_STATUSES;
  }

  async function updateOrderStatus(order, field, value) {
    // Gate: prevent shipping statuses until final payment received on custom builds
    if (
      order.order_type === "custom" &&
      ["preparing_to_ship", "shipped"].includes(value) &&
      !order.final_payment_paid
    ) {
      alert("Final payment has not been received yet. You cannot move this order to shipping until the buyer completes their final payment.");
      return;
    }
    setUpdating(u => ({ ...u, [order.id]: true }));
    await base44.entities.Order.update(order.id, { [field]: value });
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, [field]: value } : o));
    setUpdating(u => ({ ...u, [order.id]: false }));
  }

  async function saveOrderDates(order, dates) {
    setUpdating(u => ({ ...u, [order.id]: true }));
    await base44.entities.Order.update(order.id, dates);
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, ...dates } : o));
    setUpdating(u => ({ ...u, [order.id]: false }));
  }

  function toggleExpand(id) {
    setExpanded(e => ({ ...e, [id]: !e[id] }));
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
      {Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-stone-200 rounded-2xl animate-pulse" />)}
    </div>
  );

  const builderName = profile?.business_name || profile?.display_name;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link to={createPageUrl("Dashboard")} className="text-stone-400 hover:text-indigo-600"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold" style={{ color: "#1B2B4B" }}>Order Fulfillment</h1>
        <span className="ml-auto text-sm text-stone-400">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-600 mb-2">No orders yet</h3>
          <p className="text-stone-400 text-sm">Orders from customers will appear here once they purchase your listings.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const myItems = order.items?.filter(item => item.builder_name === builderName) || order.items || [];
            const myTotal = myItems.reduce((sum, item) => sum + (item.product_price || 0) * (item.quantity || 1), 0);
            const isExpanded = expanded[order.id];
            const statusList = getStatusList(order);

            return (
              <div key={order.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
                {/* Header Row */}
                <div
                  className="flex items-start justify-between p-5 cursor-pointer hover:bg-stone-50 transition-colors"
                  onClick={() => toggleExpand(order.id)}
                >
                  <div>
                    <p className="text-xs text-stone-400 mb-0.5">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-stone-500">{order.created_date ? format(new Date(order.created_date), "MMM d, yyyy") : ""}</p>
                    {order.buyer_email && <p className="text-xs text-stone-400 mt-0.5">{order.buyer_name || order.buyer_email}</p>}
                    {order.order_type === "custom" && (
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">Custom Build</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <FulfillmentStatusBadge status={order.fulfillment_status || "order_received"} />
                      <p className="font-bold mt-1" style={{ color: "#A0692A" }}>${myTotal.toLocaleString()}</p>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-stone-100 px-5 pb-5 pt-4 space-y-5">

                    {/* Progress Tracker */}
                    <OrderProgressTracker order={order} />

                    {/* Items */}
                    <div className="space-y-2">
                      {myItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          {item.product_image && <img src={item.product_image} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                          <span className="text-stone-700 flex-1">{item.product_name}</span>
                          <span className="text-stone-400">${item.product_price?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Final payment pending banner */}
                    {order.order_type === "custom" && order.payment_stage === "awaiting_final_payment" && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-amber-800">Awaiting final payment from buyer</p>
                          <p className="text-xs text-amber-700 mt-0.5">You will be notified when payment is received. Shipping statuses are locked until then.</p>
                        </div>
                      </div>
                    )}
                    {order.order_type === "custom" && order.final_payment_paid && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <p className="text-xs font-semibold text-green-800">Final payment received — you may now prepare for shipment.</p>
                      </div>
                    )}

                    {/* Update Status */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-2">Update Fulfillment Status</label>
                      <div className="flex flex-wrap gap-2">
                        {statusList.map(s => {
                          const isShippingLocked =
                            order.order_type === "custom" &&
                            ["preparing_to_ship", "shipped"].includes(s.key) &&
                            !order.final_payment_paid;
                          return (
                            <button
                              key={s.key}
                              disabled={updating[order.id] || isShippingLocked}
                              onClick={() => updateOrderStatus(order, "fulfillment_status", s.key)}
                              title={isShippingLocked ? "Locked until final payment received" : ""}
                              className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                                isShippingLocked
                                  ? "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
                                  : order.fulfillment_status === s.key
                                  ? `${STATUS_COLORS[s.key]} border-transparent`
                                  : "bg-white border-stone-200 text-stone-500 hover:border-indigo-300"
                              }`}
                            >
                              {s.label}{isShippingLocked ? " 🔒" : ""}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Build Dates */}
                    {order.order_type === "custom" && (
                      <CustomBuildDates order={order} onSave={(dates) => saveOrderDates(order, dates)} saving={updating[order.id]} />
                    )}

                    {/* Tracking */}
                    <TrackingEditor order={order} onSave={(data) => saveOrderDates(order, data)} saving={updating[order.id]} />

                    {/* Builder Notes */}
                    <BuilderNotesEditor order={order} onSave={(notes) => saveOrderDates(order, { builder_notes: notes })} saving={updating[order.id]} />

                    {/* Tracking submission — stock builds */}
                    {order.order_type === "stock" && ["awaiting_shipment", "tracking_submitted", "shipment_verified"].includes(order.current_status) && (
                      <TrackingSubmitForm
                        order={order}
                        onTrackingSubmitted={(updates) => {
                          setOrders(prev => prev.map(o => o.id === order.id ? { ...o, ...updates } : o));
                        }}
                      />
                    )}

                    {/* Payout breakdown — stock builds */}
                    {order.order_type === "stock" && order.current_status !== "pending_payment" && (
                      <PayoutBreakdown order={order} showAdminDetail={false} />
                    )}

                    {/* Build Updates — custom builds only */}
                    {order.order_type === "custom" && (
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-3">Build Updates</label>
                        <div className="space-y-4">
                          <BuildUpdateComposer order={order} profile={profile} onUpdatePosted={() => {}} />
                          <BuildUpdatesFeed orderId={order.id} />
                        </div>
                      </div>
                    )}

                    {/* Purchase Agreement */}
                    <PurchaseAgreementButton orderId={order.id} userRole="builder" />

                    {/* Shipping Address */}
                    {order.shipping_address && (
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-1">Ship To</label>
                        <p className="text-sm text-stone-600">
                          {order.shipping_address.line1}{order.shipping_address.line2 ? `, ${order.shipping_address.line2}` : ""},{" "}
                          {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CustomBuildDates({ order, onSave, saving }) {
  const [buildStart, setBuildStart] = useState(order.build_start_date || "");
  const [estComplete, setEstComplete] = useState(order.estimated_build_completion_date || "");

  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-2">Build Schedule</label>
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs text-stone-500 mb-1 block">Anticipated Start Date</label>
          <input type="date" value={buildStart} onChange={e => setBuildStart(e.target.value)}
            className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-indigo-400" />
        </div>
        <div>
          <label className="text-xs text-stone-500 mb-1 block">Est. Completion Date</label>
          <input type="date" value={estComplete} onChange={e => setEstComplete(e.target.value)}
            className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-indigo-400" />
        </div>
        <button
          disabled={saving}
          onClick={() => onSave({ build_start_date: buildStart, estimated_build_completion_date: estComplete })}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-white transition-colors"
          style={{ backgroundColor: "#1B2B4B" }}
        >
          <Save className="w-3.5 h-3.5" /> Save Dates
        </button>
      </div>
    </div>
  );
}

function TrackingEditor({ order, onSave, saving }) {
  const [tracking, setTracking] = useState(order.tracking_number || "");
  const [carrier, setCarrier] = useState(order.tracking_carrier || "");

  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-2">Tracking</label>
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-stone-500 mb-1 block">Carrier</label>
          <input value={carrier} onChange={e => setCarrier(e.target.value)} placeholder="UPS, FedEx..."
            className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-indigo-400 w-32" />
        </div>
        <div>
          <label className="text-xs text-stone-500 mb-1 block">Tracking Number</label>
          <input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Tracking #"
            className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-indigo-400 w-48" />
        </div>
        <button
          disabled={saving}
          onClick={() => onSave({ tracking_number: tracking, tracking_carrier: carrier })}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-white transition-colors"
          style={{ backgroundColor: "#1B2B4B" }}
        >
          <Save className="w-3.5 h-3.5" /> Save
        </button>
      </div>
    </div>
  );
}

function BuilderNotesEditor({ order, onSave, saving }) {
  const [notes, setNotes] = useState(order.builder_notes || "");

  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-2">Internal Notes</label>
      <div className="flex gap-3 items-end">
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Notes visible only to you..."
          className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-indigo-400 resize-none" />
        <button
          disabled={saving}
          onClick={() => onSave(notes)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-white transition-colors"
          style={{ backgroundColor: "#1B2B4B" }}
        >
          <Save className="w-3.5 h-3.5" /> Save
        </button>
      </div>
    </div>
  );
}