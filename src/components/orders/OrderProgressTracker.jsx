import { Check } from "lucide-react";
import { STOCK_STATUSES, CUSTOM_STATUSES } from "./FulfillmentStatusBadge";

export default function OrderProgressTracker({ order }) {
  const statuses = order.order_type === "custom" ? CUSTOM_STATUSES : STOCK_STATUSES;
  const currentIndex = statuses.findIndex(s => s.key === order.fulfillment_status);

  return (
    <div className="mt-4">
      <div className="flex items-center gap-0">
        {statuses.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const last = i === statuses.length - 1;
          return (
            <div key={step.key} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    done ? "bg-green-500 border-green-500 text-white" :
                    active ? "bg-indigo-600 border-indigo-600 text-white" :
                    "bg-white border-stone-300 text-stone-400"
                  }`}
                >
                  {done ? <Check className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
                </div>
                <span className={`text-center mt-1 leading-tight hidden sm:block ${active ? "text-indigo-700 font-semibold" : done ? "text-green-600" : "text-stone-400"}`}
                  style={{ fontSize: "0.6rem", maxWidth: 60 }}>
                  {step.label}
                </span>
              </div>
              {!last && (
                <div className={`h-0.5 flex-1 mx-1 ${done || active ? "bg-indigo-400" : "bg-stone-200"}`} />
              )}
            </div>
          );
        })}
      </div>
      <p className="sm:hidden text-xs font-semibold text-indigo-700 mt-2">
        Current: {statuses[currentIndex]?.label || order.fulfillment_status}
      </p>
    </div>
  );
}