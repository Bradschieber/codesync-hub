import { ShieldCheck, Hammer } from "lucide-react";

// Badge definitions — easy to extend in future phases
const BADGE_DEFS = [
  {
    key: "verified",
    check: (b) => b.is_verified,
    label: "Verified Builder",
    icon: ShieldCheck,
    style: {
      color: "#2F3E55",
      background: "#EDF1F6",
      border: "#C2CEDB",
    },
  },
  {
    key: "founding",
    check: (b) => b.founding_builder,
    label: "Founding Builder",
    icon: null,
    style: {
      color: "#6B4C2A",
      background: "#F5EFE6",
      border: "#D9C4A8",
    },
  },
  {
    key: "custom_shop",
    check: (b) => b.offers_custom_builds,
    label: "Custom Shop",
    icon: Hammer,
    style: {
      color: "#4A4A4A",
      background: "#F2F0EA",
      border: "#D8D4CC",
    },
  },
];

/**
 * size: "sm" (default) | "md"
 * Renders only the badges that apply to the given builder profile.
 */
export default function BuilderBadges({ builder, size = "sm" }) {
  if (!builder) return null;

  const active = BADGE_DEFS.filter(d => d.check(builder));
  if (active.length === 0) return null;

  const isSmall = size === "sm";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {active.map(badge => {
        const Icon = badge.icon;
        return (
          <span
            key={badge.key}
            className="inline-flex items-center gap-1 rounded font-medium border"
            style={{
              color: badge.style.color,
              backgroundColor: badge.style.background,
              borderColor: badge.style.border,
              fontSize: isSmall ? "0.68rem" : "0.75rem",
              padding: isSmall ? "2px 7px" : "3px 9px",
              letterSpacing: "0.02em",
            }}
          >
            {Icon && <Icon style={{ width: isSmall ? 10 : 12, height: isSmall ? 10 : 12 }} strokeWidth={2} />}
            {badge.label}
          </span>
        );
      })}
    </div>
  );
}