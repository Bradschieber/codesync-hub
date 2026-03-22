import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ShieldCheck, Star, Award, Users, Clock, CheckCircle, ChevronRight, AlertCircle, DollarSign, UserCircle, FileText
} from "lucide-react";

const NAVY = "#2F3E55";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      if (u.role !== "admin") { setLoading(false); return; }

      const [builders, refs] = await Promise.all([
        base44.entities.UserProfile.filter({ is_seller: true }, "-created_date", 200),
        base44.entities.BuilderReference.list("-created_date", 200),
      ]);

      setStats({
        totalBuilders: builders.length,
        verifiedBuilders: builders.filter(b => b.is_verified).length,
        foundingBuilders: builders.filter(b => b.founding_builder).length,
        pendingBuilders: builders.filter(b => !b.is_approved).length,
        pendingRefs: refs.filter(r => r.status === "pending").length,
        verifiedRefs: refs.filter(r => r.status === "verified").length,
      });
    } catch {
      base44.auth.redirectToLogin();
    }
    setLoading(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
    </div>
  );

  if (user?.role !== "admin") return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <ShieldCheck className="w-12 h-12 mx-auto mb-4" style={{ color: "#CCCCCC" }} />
      <h2 className="text-xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Admin Access Required</h2>
      <p style={{ color: "#7A7A7A" }}>You don't have permission to view this page.</p>
    </div>
  );

  const statCards = [
    { label: "Total Builders", value: stats?.totalBuilders ?? "—", icon: Users, color: NAVY, page: "AdminAllBuilders" },
    { label: "Verified Builders", value: stats?.verifiedBuilders ?? "—", icon: ShieldCheck, color: "#27AE60", page: "AdminVerifiedBuilders" },
    { label: "Founding Builders", value: stats?.foundingBuilders ?? "—", icon: Award, color: "#6B4C2A", page: "AdminFoundingBuilders" },
    { label: "Pending References", value: stats?.pendingRefs ?? "—", icon: Clock, color: "#C57A1F", urgent: stats?.pendingRefs > 0, page: "AdminReferences" },
  ];

  const adminTools = [
    {
      title: "Buyer Accounts",
      description: "View, deactivate, or delete non-builder buyer accounts registered on the platform.",
      icon: UserCircle,
      page: "AdminUserAccounts",
      badge: null,
      urgent: false,
    },
    {
      title: "Payout Management",
      description: "Review deposit and final payout readiness for all orders. Release payouts when all requirements are met.",
      icon: DollarSign,
      page: "AdminPayouts",
      badge: null,
      urgent: false,
    },
    {
      title: "Pending Builder Approvals",
      description: "Review new builder storefronts and approve them before they go live on the site.",
      icon: AlertCircle,
      page: "AdminPendingBuilders",
      badge: stats?.pendingBuilders > 0 ? `${stats.pendingBuilders} pending` : null,
      urgent: stats?.pendingBuilders > 0,
    },
    {
      title: "Builder Badges",
      description: "Grant or revoke Verified Builder and Founding Builder badges for any seller on the platform.",
      icon: Award,
      page: "AdminBuilderBadges",
      badge: null,
    },
    {
      title: "Builder References",
      description: "Review and verify buyer references submitted by builders. 2 verified refs = Verified Builder status.",
      icon: CheckCircle,
      page: "AdminReferences",
      badge: stats?.pendingRefs > 0 ? `${stats.pendingRefs} pending` : null,
    },
    {
      title: "Terms & Policies",
      description: "Manage the current versions of your legal terms and policies. Publish new versions and preserve prior versions for acceptance records.",
      icon: FileText,
      page: "AdminLegalDocuments",
      badge: null,
    },
  ];

  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-14 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-7 h-7" style={{ color: NAVY }} strokeWidth={1.5} />
            <h1 className="text-4xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>Admin Dashboard</h1>
          </div>
          <p className="text-base" style={{ color: "#5A5A5A" }}>Manage platform-wide settings, badges, and builder approvals.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats — now all clickable */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map(({ label, value, icon: Icon, color, urgent, page }) => (
            <Link
              key={label}
              to={createPageUrl(page)}
              className="block p-5 border bg-white transition-all hover:shadow-md group"
              style={{ borderColor: urgent ? "#C57A1F" : "#E0DDD8", borderWidth: urgent ? 2 : 1 }}
              onMouseEnter={e => e.currentTarget.style.borderColor = urgent ? "#C57A1F" : NAVY}
              onMouseLeave={e => e.currentTarget.style.borderColor = urgent ? "#C57A1F" : "#E0DDD8"}
            >
              <div className="mb-3">
                <Icon className="w-5 h-5" strokeWidth={1.5} style={{ color }} />
              </div>
              <p className="text-3xl font-bold mb-1" style={{ color: "#1A1A1A" }}>{value}</p>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#7A7A7A" }}>{label}</p>
              {urgent && <p className="text-xs font-semibold mt-1" style={{ color: "#C57A1F" }}>Needs attention</p>}
            </Link>
          ))}
        </div>

        {/* Admin Tools */}
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#6B6B6B" }}>Admin Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminTools.map(({ title, description, icon: Icon, page, badge, urgent }) => (
            <Link
              key={page}
              to={createPageUrl(page)}
              className="group block bg-white border p-6 transition-all hover:shadow-md"
              style={{ borderColor: urgent ? "#C57A1F" : "#E0DDD8", borderWidth: urgent ? 2 : 1 }}
              onMouseEnter={e => e.currentTarget.style.borderColor = urgent ? "#C57A1F" : NAVY}
              onMouseLeave={e => e.currentTarget.style.borderColor = urgent ? "#C57A1F" : "#E0DDD8"}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: urgent ? "#FEF3E2" : "#EEF1F7" }}>
                  <Icon className="w-5 h-5" strokeWidth={1.5} style={{ color: urgent ? "#C57A1F" : NAVY }} />
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex-shrink-0" style={{ color: NAVY }} />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-sm" style={{ color: "#1A1A1A" }}>{title}</h3>
                {badge && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FEF3E2", color: "#C57A1F" }}>
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#7A7A7A" }}>{description}</p>
            </Link>
          ))}
        </div>

        {/* Back to builder dashboard */}
        <div className="mt-10 pt-6 border-t" style={{ borderColor: "#E0DDD8" }}>
          <Link to={createPageUrl("Dashboard")} className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: NAVY }}>
            ← Back to Builder Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}