import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MapPin, ArrowRight, User } from "lucide-react";
import { useState } from "react";

const NAVY = "#2F3E55";

function isFeaturedActive(builder) {
  if (!builder.is_featured) return false;
  if (!builder.featured_until_date) return true;
  return new Date(builder.featured_until_date) >= new Date();
}

export default function FeaturedBuilders({ builders, productImageMap = {} }) {
  const featured = builders
    .filter(isFeaturedActive)
    .slice(0, 4);

  if (featured.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#8A8A8A" }}>Featured Builders</p>
        <h2 className="text-xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
          Meet some of the makers shaping Stringed Collective.
        </h2>
        <p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>
          Independent builders creating distinctive instruments for players around the world.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {featured.map(builder => (
          <FeaturedBuilderCard key={builder.id} builder={builder} />
        ))}
      </div>
    </section>
  );
}

function FeaturedBuilderCard({ builder }) {
  const [hovered, setHovered] = useState(false);

  const instrumentTypes = (builder.instrument_types_built || []).map(i =>
    i.type === "Other" && i.other_description ? i.other_description : i.type
  );

  // Image priority: banner > first media > avatar
  const heroImage = builder.banner_image_url || builder.media_urls?.[0] || builder.avatar_url || null;

  return (
    <Link
      to={createPageUrl("BuilderProfile?id=" + builder.id)}
      className="group block overflow-hidden transition-all duration-300 no-underline"
      style={{
        backgroundColor: "#FFFFFF",
        border: `1px solid ${hovered ? NAVY : "#E0DDD8"}`,
        boxShadow: hovered ? "0 10px 36px rgba(27,43,75,0.13)" : "0 1px 4px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hero image */}
      <div className="relative overflow-hidden bg-stone-100" style={{ aspectRatio: "4/3" }}>
        {heroImage ? (
          <img
            src={heroImage}
            alt={builder.business_name || builder.display_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#EEF1F7" }}>
            <User className="w-10 h-10" style={{ color: "#CCCCCC" }} strokeWidth={1} />
          </div>
        )}

        {/* Verified badge overlay */}
        {builder.is_verified && (
          <span className="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
            style={{ backgroundColor: "rgba(255,255,255,0.92)", color: NAVY }}>
            ✓ Verified
          </span>
        )}

        {/* Founding builder ribbon */}
        {builder.founding_builder && (
          <span className="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#C57A1F", color: "#fff" }}>
            Founding Builder
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Avatar + name */}
        <div className="flex items-center gap-2.5 mb-2">
          {builder.avatar_url ? (
            <img src={builder.avatar_url} className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm" />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EEF1F7" }}>
              <span className="text-xs font-bold" style={{ color: NAVY }}>
                {(builder.business_name || builder.display_name || "B")[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-bold text-sm leading-tight truncate" style={{ color: "#1A1A1A" }}>
              {builder.business_name || builder.display_name}
            </h3>
            {builder.location && (
              <p className="text-xs flex items-center gap-0.5 mt-0.5" style={{ color: "#7A7A7A" }}>
                <MapPin className="w-3 h-3 flex-shrink-0" />{builder.location}
              </p>
            )}
          </div>
        </div>

        {/* Instrument types */}
        {instrumentTypes.length > 0 && (
          <p className="text-xs font-medium mb-1" style={{ color: "#4A5566" }}>
            {instrumentTypes.join(" • ")}
          </p>
        )}

        {/* Experience */}
        {builder.years_experience > 0 && (
          <p className="text-xs mb-3" style={{ color: "#9A9A9A" }}>{builder.years_experience} yrs experience</p>
        )}

        {/* CTA */}
        <div
          className="text-xs font-semibold flex items-center gap-1 pt-3 border-t transition-colors duration-200"
          style={{ borderColor: "#F0EDE8", color: hovered ? NAVY : "#9A9A9A" }}
        >
          View Builder <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </Link>
  );
}