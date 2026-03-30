import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { CreditCard, CheckCircle2, Clock, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";

const NAVY = "#1B2B4B";

const STATUS_CONFIG = {
  not_started: {
    icon: CreditCard,
    iconColor: "#6B7280",
    bg: "#F9FAFB",
    border: "#E5E7EB",
    title: "Connect your Stripe account to enable payments",
    description: "To accept payments and receive payouts from sales on Stringed Collective, you need to connect a Stripe account. This takes about 5 minutes.",
    cta: "Connect Stripe Account",
  },
  in_progress: {
    icon: Clock,
    iconColor: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    title: "Stripe onboarding in progress",
    description: "You started connecting your Stripe account but haven't finished yet. Complete the onboarding to enable payouts.",
    cta: "Continue Stripe Setup",
  },
  pending_verification: {
    icon: AlertCircle,
    iconColor: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    title: "Stripe verification pending",
    description: "Stripe is reviewing your account information. This usually takes 1–2 business days. You'll be notified when it's complete.",
    cta: "Check Verification Status",
  },
  complete: {
    icon: CheckCircle2,
    iconColor: "#059669",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    title: "Stripe account connected",
    description: "Your Stripe account is active and payouts are enabled. You'll receive funds from sales directly to your bank account.",
    cta: null,
  },
};

export default function StripeConnectOnboarding({ profile, onStatusUpdate }) {
  const [loading, setLoading] = useState(false);

  const status = profile?.stripe_onboarding_status || "not_started";
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.not_started;
  const Icon = config.icon;

  async function handleConnect() {
    setLoading(true);
    const response = await base44.functions.invoke("createStripeConnectOnboardingLink", {
      return_url: window.location.origin,
    });
    window.location.href = response.data.url;
  }

  return (
    <div
      className="border p-5 mb-6"
      style={{ borderColor: config.border, backgroundColor: config.bg }}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.7)" }}>
          <Icon className="w-5 h-5" style={{ color: config.iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold mb-1" style={{ color: "#1A1A1A" }}>{config.title}</p>
          <p className="text-xs leading-relaxed mb-3" style={{ color: "#5A5A5A" }}>{config.description}</p>

          {status === "complete" && profile?.stripe_account_id && (
            <p className="text-xs" style={{ color: "#6B7280" }}>
              Account ID: <span className="font-mono">{profile.stripe_account_id}</span>
            </p>
          )}

          {config.cta && (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: NAVY }}
              onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = "#152038")}
              onMouseLeave={e => !loading && (e.currentTarget.style.backgroundColor = NAVY)}
            >
              {loading ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Connecting...</>
              ) : (
                <><ExternalLink className="w-4 h-4" /> {config.cta}</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}