import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Hammer } from "lucide-react";

const NAVY = "#1B2B4B";

export default function BuilderAccountFormModal({ onClose }) {
  const [user, setUser] = useState(undefined);
  const [existingProfile, setExistingProfile] = useState(null);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) {
        setExistingProfile(profiles[0]);
      }
    }).catch(() => setUser(null));
  }, []);

  function goToOnboarding() {
    window.location.href = "/BuilderOnboarding";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#E0DDD8" }}>
          <div className="flex items-center gap-2">
            <Hammer className="w-5 h-5" style={{ color: NAVY }} strokeWidth={1.5} />
            <h2 className="font-bold text-base" style={{ color: "#1A1A1A" }}>
              Create Your Builder Profile
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-6">
          {/* Loading auth */}
          {user === undefined && (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
            </div>
          )}

          {/* Not logged in - verified signup flow */}
          {user === null && (
            <div className="py-6">
              <p className="text-sm font-semibold mb-2" style={{ color: "#1A1A1A" }}>Create your builder account and start building your storefront.</p>
              <p className="text-xs mb-6 leading-relaxed" style={{ color: "#7A7A7A" }}>It takes just a minute to create your account. Then we'll guide you through your complete storefront setup - step by step.</p>
              <div className="space-y-3 mb-6">
                {[
                  { step: "1", label: "Create a free account", detail: "Sign up with your email and verify - takes under a minute." },
                  { step: "2", label: "Build your storefront", detail: "We'll walk you through your shop, story, policies, and first listing." },
                  { step: "3", label: "Go live after review", detail: "Our team approves your storefront within 1-2 business days." },
                ].map(({ step, label, detail }) => (
                  <div key={step} className="flex items-start gap-4">
                    <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white rounded-full" style={{ backgroundColor: NAVY }}>{step}</div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>{label}</p>
                      <p className="text-xs" style={{ color: "#7A7A7A" }}>{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mb-6 p-3 border-l-2" style={{ borderColor: "#9B1B30", backgroundColor: "#F9E5E8" }}>
                <p className="text-xs font-bold mb-0.5" style={{ color: "#333333" }}>After you verify your email</p>
                <p className="text-xs leading-relaxed" style={{ color: "#333333" }}>You'll be taken directly into your storefront setup. No need to come back here.</p>
              </div>
              <button
                onClick={() => base44.auth.redirectToLogin("/BuilderOnboarding")}
                className="w-full font-semibold px-6 py-3 text-sm text-white transition-colors"
                style={{ backgroundColor: NAVY }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
              >
                Create a Free Account & Get Started →
              </button>
              <p className="text-xs text-center mt-3" style={{ color: "#9A9A9A" }}>Already have an account? Sign in to go straight to your builder setup.</p>
            </div>
          )}

          {/* Logged in - go straight to Builder Onboarding */}
          {user && (
            <div className="py-6">
              <p className="text-sm font-semibold mb-2" style={{ color: "#1A1A1A" }}>
                {existingProfile ? "Welcome back - let's continue your storefront setup." : "You're signed in - let's build your storefront."}
              </p>
              <p className="text-xs mb-6 leading-relaxed" style={{ color: "#7A7A7A" }}>
                We'll walk you through your shop, story, policies, and first listing step by step. Once complete, our team will review and get you live within 1-2 business days.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  { step: "1", label: "Build your storefront", detail: "We'll walk you through your shop, story, policies, and first listing." },
                  { step: "2", label: "Go live after review", detail: "Our team approves your storefront within 1-2 business days." },
                ].map(({ step, label, detail }) => (
                  <div key={step} className="flex items-start gap-4">
                    <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white rounded-full" style={{ backgroundColor: NAVY }}>{step}</div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>{label}</p>
                      <p className="text-xs" style={{ color: "#7A7A7A" }}>{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={goToOnboarding}
                className="w-full font-semibold px-6 py-3 text-sm text-white transition-colors"
                style={{ backgroundColor: NAVY }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
              >
                Continue to Builder Setup →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}