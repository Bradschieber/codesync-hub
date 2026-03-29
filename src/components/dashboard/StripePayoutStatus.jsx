import { AlertCircle, CheckCircle2, Clock, Zap, ExternalLink, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useState } from "react";

const NAVY = "#1B2B4B";

const STATUS_CONFIG = {
  not_started: {
    icon: AlertCircle,
    color: "#C57A1F",
    bg: "#FEF3E2",
    border: "#F0C97A",
    label: "Stripe Not Connected",
    description: "Connect your Stripe account to publish listings and accept payments.",
    cta: "Connect Stripe",
  },
  in_progress: {
    icon: Clock,
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    label: "Onboarding In Progress",
    description: "You started Stripe onboarding but haven't finished. Complete it to enable payouts.",
    cta: "Resume Onboarding",
  },
  pending_verification: {
    icon: Clock,
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    label: "Verification Required",
    description: "Stripe needs additional verification before payouts can be enabled.",
    cta: "Complete Verification",
  },
  complete: {
    icon: CheckCircle2,
    color: "#16A34A",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    label: "Payouts Enabled",
    description: "Your Stripe account is connected and ready to receive payouts.",
    cta: null,
  },
};

export default function StripePayoutStatus({ profile, onStatusUpdated }) {
  const [loading, setLoading] = useState(false);

  const status = profile?.stripe_onboarding_status || "not_started";
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.not_started;
  const Icon = config.icon;
  const isComplete = status === "complete";
  const isFirstSale = isComplete && !profile?.is_first_sale_completed;

  async function handleConnectStripe() {
    setLoading(true);
    try {
      const result = await base44.functions.invoke("createStripeConnectOnboardingLink", {
        return_url: window.location.href,
      });
      if (result?.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (err) {
      console.error("Failed to start Stripe onboarding:", err);
    }
    setLoading(false);
  }

  return (
    <div
      className="border p-5 mb-6"
      style={{ borderColor: config.border, backgroundColor: config.bg }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Icon
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: config.color }}
            strokeWidth={1.5}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="text-sm font-bold" style={{ color: "#1A1A1A" }}>
                {config.label}
              </p>
              {profile?.stripe_account_id && (
                <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: "#E5E7EB", color: "#6B7280" }}>
                  {profile.stripe_account_id}
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "#5A5A5A" }}>
              {config.description}
            </p>

            {/* First sale protection notice */}
            {isFirstSale && (
              <div className="mt-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" style={{ color: "#C57A1F" }} />
                <p className="text-xs font-semibold" style={{ color: "#C57A1F" }}>
                  First Sale Protection applies — your first payout will be held until delivery is confirmed.
                </p>
              </div>
            )}

            {/* Payout flags */}
            {isComplete && (
              <div className="flex gap-3 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: profile?.stripe_charges_enabled ? "#DCFCE7" : "#FEE2E2", color: profile?.stripe_charges_enabled ? "#15803D" : "#DC2626" }}>
                  Charges {profile?.stripe_charges_enabled ? "Enabled" : "Disabled"}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: profile?.stripe_payouts_enabled ? "#DCFCE7" : "#FEE2E2", color: profile?.stripe_payouts_enabled ? "#15803D" : "#DC2626" }}>
                  Payouts {profile?.stripe_payouts_enabled ? "Enabled" : "Disabled"}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: profile?.is_first_sale_completed ? "#DCFCE7" : "#FEF9C3", color: profile?.is_first_sale_completed ? "#15803D" : "#92400E" }}>
                  {profile?.is_first_sale_completed ? "First Sale Complete" : "First Sale Pending"}
                </span>
              </div>
            )}
          </div>
        </div>

        {config.cta && (
          <button
            onClick={handleConnectStripe}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 flex-shrink-0 transition-colors text-white"
            style={{ backgroundColor: NAVY }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4" />
            )}
            {loading ? "Loading..." : config.cta}
          </button>
        )}
      </div>
    </div>
  );
}