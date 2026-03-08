export const STOCK_STATUSES = [
  { key: "order_received",    label: "Order Received" },
  { key: "order_confirmed",   label: "Order Confirmed" },
  { key: "preparing_to_ship", label: "Preparing to Ship" },
  { key: "shipped",           label: "Shipped" },
  { key: "received_by_buyer", label: "Delivered" },
];

export const CUSTOM_STATUSES = [
  { key: "order_confirmed",        label: "Order Confirmed" },
  { key: "deposit_paid",           label: "Deposit Paid" },
  { key: "build_in_progress",      label: "Build In Progress" },
  { key: "build_complete",         label: "Build Complete" },
  { key: "awaiting_final_payment", label: "Final Payment" },
  { key: "preparing_to_ship",      label: "Preparing to Ship" },
  { key: "shipped",                label: "Shipped" },
  { key: "received_by_buyer",      label: "Delivered" },
];

export const STATUS_COLORS = {
  order_received:        "bg-stone-100 text-stone-600",
  order_confirmed:       "bg-blue-100 text-blue-700",
  deposit_paid:          "bg-cyan-100 text-cyan-700",
  build_scheduled:       "bg-indigo-100 text-indigo-700",
  build_in_progress:     "bg-amber-100 text-amber-700",
  build_complete:        "bg-teal-100 text-teal-700",
  awaiting_final_payment:"bg-red-100 text-red-700",
  preparing_to_ship:     "bg-orange-100 text-orange-700",
  shipped:               "bg-blue-100 text-blue-700",
  received_by_buyer:     "bg-green-100 text-green-700",
  cancelled:             "bg-red-100 text-red-700",
};

export const STATUS_LABELS = {
  order_received:        "Order Received",
  order_confirmed:       "Order Confirmed",
  deposit_paid:          "Deposit Paid",
  build_in_progress:     "Build In Progress",
  build_complete:        "Build Complete",
  awaiting_final_payment:"Final Payment Required",
  preparing_to_ship:     "Preparing to Ship",
  shipped:               "Shipped",
  received_by_buyer:     "Delivered",
  cancelled:             "Cancelled",
};

export default function FulfillmentStatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status || "Unknown";
  return (
    <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[status] || "bg-stone-100 text-stone-600"}`}>
      {label}
    </span>
  );
}