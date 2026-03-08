import { Check } from "lucide-react";
import { STOCK_STATUSES, CUSTOM_STATUSES } from "./FulfillmentStatusBadge";

const NAVY = "#1B2B4B";
const AMBER = "#C57A1F";

// For custom orders, determine which step is currently active
// The synthetic "awaiting_final_payment" step sits between build_complete and preparing_to_ship
function getCustomActiveKey(order) {
  if (
    order.fulfillment_status === "build_complete" &&
    order.payment_stage === "awaiting_final_payment"
  ) {
    return "awaiting_final_payment";
  }
  return order.fulfillment_status;
}

// Given an active key, return the "effective" index in the steps array
// For custom: if preparing_to_ship+ we treat awaiting_final_payment as done too
function getActiveIndex(steps, activeKey) {
  return steps.findIndex(s => s.key === activeKey);
}

export default function OrderProgressTracker({ order }) {
  const isCustom = order.order_type === "custom";
  const steps = isCustom ? CUSTOM_STATUSES : STOCK_STATUSES;
  const activeKey = isCustom ? getCustomActiveKey(order) : order.fulfillment_status;
  const currentIndex = getActiveIndex(steps, activeKey);

  // For custom orders where payment is done but fulfillment is still build_complete,
  // treat awaiting_final_payment as completed too
  const paidAndMovingOn =
    isCustom &&
    order.fulfillment_status === "build_complete" &&
    (order.payment_stage === "final_payment_received" || order.payment_stage === "fully_paid");

  function getStepState(i) {
    if (paidAndMovingOn) {
      // build_complete (index 3) and awaiting_final_payment (index 4) both done
      const buildCompleteIdx = steps.findIndex(s => s.key === "build_complete");
      if (i <= buildCompleteIdx + 1) return "done";
      return "pending";
    }
    if (i < currentIndex) return "done";
    if (i === currentIndex) return "active";
    return "pending";
  }

  return (
    <div>
      {/* Scrollable horizontal tracker */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-start min-w-max gap-0">
          {steps.map((step, i) => {
            const state = getStepState(i);
            const isLast = i === steps.length - 1;

            return (
              <div key={step.key} className="flex items-start">
                {/* Step circle + label */}
                <div className="flex flex-col items-center" style={{ width: 64 }}>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all flex-shrink-0"
                    style={
                      state === "done"
                        ? { backgroundColor: NAVY, borderColor: NAVY, color: "#fff" }
                        : state === "active"
                        ? { backgroundColor: AMBER, borderColor: AMBER, color: "#fff", boxShadow: `0 0 0 3px rgba(197,122,31,0.2)` }
                        : { backgroundColor: "#fff", borderColor: "#D1CCC4", color: "#B0A898" }
                    }
                  >
                    {state === "done" ? <Check className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
                  </div>
                  <span
                    className="text-center mt-1.5 leading-tight"
                    style={{
                      fontSize: "0.6rem",
                      maxWidth: 58,
                      color: state === "active" ? AMBER : state === "done" ? NAVY : "#B0A898",
                      fontWeight: state === "active" ? 700 : state === "done" ? 500 : 400,
                    }}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div
                    className="h-0.5 mt-4 flex-shrink-0"
                    style={{
                      width: 20,
                      backgroundColor: state === "done" ? NAVY : "#E3E0D8",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile fallback: current step label */}
      <p className="text-xs mt-1" style={{ color: "#7A7A7A" }}>
        Step {Math.max(currentIndex + 1, 1)} of {steps.length} —{" "}
        <span style={{ color: AMBER, fontWeight: 600 }}>
          {steps[currentIndex]?.label || "Unknown"}
        </span>
      </p>
    </div>
  );
}