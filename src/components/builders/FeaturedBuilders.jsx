import BuilderCard from "./BuilderCard";

function isFeaturedActive(builder) {
  if (!builder.is_featured) return false;
  if (!builder.featured_until_date) return true;
  return new Date(builder.featured_until_date) >= new Date();
}

export default function FeaturedBuilders({ builders, builderListings = {} }) {
  const featured = builders
    .filter(isFeaturedActive)
    .slice(0, 4);

  if (featured.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#5A5A5A" }}>Featured Builders</p>
        <h2 className="text-xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
          Meet some of the makers shaping Stringed Collective.
        </h2>
        <p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>
          Independent builders creating distinctive instruments for players around the world.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {featured.map(builder => (
          <BuilderCard
            key={builder.id}
            builder={builder}
            listings={builderListings[builder.id] || []}
          />
        ))}
      </div>
    </section>
  );
}