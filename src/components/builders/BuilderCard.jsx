import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MapPin, ArrowRight } from "lucide-react";
import { getCardFallbackColor } from "../builder/CardPhotoUploader";

const NAVY = "#1B2B4B";

export default function BuilderCard({ builder, listings = [] }) {
  const [hovered, setHovered] = useState(false);

  const name = builder.business_name || builder.display_name || "Builder";
  const initial = name[0]?.toUpperCase() || "B";
  const fallbackColor = getCardFallbackColor(builder.storefront_color_scheme);

  // Prefer tagline, then bio, then a human stat line
  const tagline = builder.tag_line || builder.bio || null;
  const statParts = [];
  if (builder.years_experience > 0) statParts.push(`${builder.years_experience} yrs building`);
  if (builder.total_instruments_built > 0) statParts.push(`${builder.total_instruments_built} builds`);
  const stat = tagline ? null : (statParts.length > 0 ? statParts.join(" • ") : null);

  const topListings = listings.slice(0, 3);

  return (
    <Link
      to={createPageUrl("BuilderProfile?id=" + builder.id)}
      className="group block border overflow-hidden no-underline transition-all duration-300"
      style={{
        borderColor: hovered ? NAVY : "#E5E8EC",
        backgroundColor: "#FFFFFF",
        boxShadow: hovered ? "0 8px 24px rgba(27,43,75,0.12)" : "0 1px 3px rgba(27,43,75,0.06)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Card Photo (primary visual) ── */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        {builder.card_photo_url ? (
          <img
            src={builder.card_photo_url}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          // Fallback: solid storefront accent color with initial — looks intentional, not empty
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: fallbackColor }}>
            <span className="font-bold text-white" style={{ fontSize: "3rem", opacity: 0.85 }}>
              {initial}
            </span>
          </div>
        )}

        {/* Badges — top left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {builder.is_verified && (
            <span className="font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.92)", color: NAVY, fontSize: "10px" }}>
              ✓ Verified
            </span>
          )}
          {builder.founding_builder && (
            <span className="font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: NAVY, color: "#fff", fontSize: "10px" }}>
              Founding Builder
            </span>
          )}
        </div>

        {/* Logo badge — top right (supplementary, decorative) */}
        {builder.logo_url && (
          <div className="absolute top-2 right-2">
            <div className="w-9 h-9 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white flex items-center justify-center">
              <img src={builder.logo_url} alt="" className="w-full h-full object-contain p-1" />
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-end justify-center pb-3 transition-opacity duration-200"
          style={{
            opacity: hovered ? 1 : 0,
            background: "linear-gradient(to top, rgba(27,43,75,0.65) 0%, transparent 60%)",
          }}
        >
          <span className="text-white text-xs font-semibold flex items-center gap-1">
            View Builder <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* ── Text area ── */}
      <div className="p-3">
        <h3 className="font-bold text-sm leading-tight mb-0.5 truncate" style={{ color: "#1A1A1A" }}>
          {name}
        </h3>
        {builder.location && (
          <p className="text-xs flex items-center gap-0.5 mb-1" style={{ color: "#7A7A7A" }}>
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{builder.location}</span>
          </p>
        )}
        {tagline ? (
          <p className="text-xs leading-snug mb-1 line-clamp-2" style={{ color: "#4A5566" }}>{tagline}</p>
        ) : stat ? (
          <p className="text-xs mb-1 truncate" style={{ color: "#9A9A9A" }}>{stat}</p>
        ) : null}
      </div>

      {/* ── Listing thumbnails ── */}
      {topListings.length > 0 && (
        <div className="flex border-t p-2 gap-1.5" style={{ borderColor: "#E5E8EC" }}>
          {topListings.map((listing, i) => (
            <div
              key={i}
              className="relative overflow-hidden flex-shrink-0"
              style={{ width: "4.5rem", height: "4.5rem", backgroundColor: "#F4F4F4" }}
            >
              {listing.image ? (
                <img src={listing.image} alt={listing.name || ""} className="w-full h-full object-cover" />
              ) : null}
              <span
                className="absolute bottom-0 left-0 right-0 text-xs font-semibold text-white px-1 py-0.5"
                style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.75))" }}
              >
                ${listing.price?.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}