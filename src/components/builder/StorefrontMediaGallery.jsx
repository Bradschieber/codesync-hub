export default function StorefrontMediaGallery({ builder, media }) {
  const layout = builder.storefront_layout || "classic";

  if (media.length === 0) return null;

  // Different grid layouts per storefront template
  const renderGrid = () => {
    if (layout === "bold") {
      // Large featured first image, rest in grid
      const [first, ...rest] = media;
      return (
        <div className="space-y-3">
          <div className="rounded-xl overflow-hidden aspect-video bg-stone-100">
            <MediaItem url={first} name={builder.business_name} />
          </div>
          {rest.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {rest.map((url, i) => (
                <div key={i} className="rounded-xl overflow-hidden aspect-square bg-stone-100">
                  <MediaItem url={url} name={builder.business_name} />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (layout === "editorial") {
      // Alternating large/small
      return (
        <div className="grid grid-cols-2 gap-3">
          {media.map((url, i) => (
            <div key={i} className={`rounded-xl overflow-hidden bg-stone-100 ${i === 0 ? "col-span-2 aspect-video" : "aspect-square"}`}>
              <MediaItem url={url} name={builder.business_name} />
            </div>
          ))}
        </div>
      );
    }

    if (layout === "minimal") {
      // Simple single row scroll
      return (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {media.map((url, i) => (
            <div key={i} className="rounded-xl overflow-hidden aspect-square bg-stone-100 flex-shrink-0 w-48 h-48">
              <MediaItem url={url} name={builder.business_name} />
            </div>
          ))}
        </div>
      );
    }

    // classic — standard 3-col grid
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {media.map((url, i) => (
          <div key={i} className="rounded-xl overflow-hidden aspect-video bg-stone-100">
            <MediaItem url={url} name={builder.business_name} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6">
      <h2 className="font-bold text-stone-800 mb-4">The Shop & The Craft</h2>
      {renderGrid()}
    </div>
  );
}

function MediaItem({ url, name }) {
  const isVideo = url.match(/\.(mp4|mov|webm|ogg)(\?|$)/i);
  if (isVideo) {
    return <video src={url} controls className="w-full h-full object-cover" />;
  }
  return (
    <img
      src={url}
      alt={`${name} - photo`}
      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
      onClick={() => window.open(url, "_blank")}
    />
  );
}