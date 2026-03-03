export const STOCK_STATUSES = [
  { key: "order_received", label: "Order Received" },
  { key: "order_confirmed", label: "Order Confirmed" },
  { key: "preparing_to_ship", label: "Preparing to Ship" },
  { key: "shipped", label: "Shipped" },
  { key: "received_by_buyer", label: "Received by Buyer" },
];

export const CUSTOM_STATUSES = [
  { key: "order_received", label: "Order Received" },
  { key: "order_confirmed", label: "Order Confirmed" },
  { key: "deposit_paid", label: "Deposit Paid" },
  { key: "build_scheduled", label: "Build Scheduled" },
  { key: "build_in_progress", label: "Build in Progress" },
  { key: "build_complete", label: "Build Complete" },
  { key: "preparing_to_ship", label: "Preparing to Ship" },
  { key: "shipped", label: "Shipped" },
  { key: "received_by_buyer", label: "Received by Buyer" },
];

export const STATUS_COLORS = {
  order_received: "bg-amber-100 text-amber-700",
  order_confirmed: "bg-blue-100 text-blue-700",
  deposit_paid: "bg-cyan-100 text-cyan-700",
  build_scheduled: "bg-indigo-100 text-indigo-700",
  build_in_progress: "bg-violet-100 text-violet-700",
  build_complete: "bg-teal-100 text-teal-700",
  preparing_to_ship: "bg-orange-100 text-orange-700",
  shipped: "bg-purple-100 text-purple-700",
  received_by_buyer: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function FulfillmentStatusBadge({ status }) {
  const statuses = [...STOCK_STATUSES, ...CUSTOM_STATUSES];
  const found = statuses.find(s => s.key === status);
  const label = found?.label || status || "Unknown";
  return (
    <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[status] || "bg-stone-100 text-stone-600"}`}>
      {label}
    </span>
  );
}