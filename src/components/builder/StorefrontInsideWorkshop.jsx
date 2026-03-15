export default function StorefrontInsideWorkshop({ builder }) {
  const story = builder.brand_story || builder.bio;
  const media = (builder.media_urls || []).slice(0, 6);
  const hasVideo = !!builder.introduction_video_url;

  if (!story && media.length === 0) return null;

  function getVideoEmbedUrl(url) {
    if (!url) return null;
    if (url.includes("youtu.be/")) return url.replace("youtu.be/", "www.youtube.com/embed/");
    if (url.includes("watch?v=")) return url.replace("watch?v=", "embed/");
    return url;
  }

  const isYouTubeOrVimeo = hasVideo && (
    builder.introduction_video_url.includes("youtube.com") ||
    builder.introduction_video_url.includes("youtu.be") ||
    builder.introduction_video_url.includes("vimeo.com")
  );

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden mb-4">
      <div className="px-6 pt-6 pb-2 border-b border-stone-100">
        <h2 className="text-base font-bold text-stone-800">Inside the Workshop</h2>
      </div>

      <div className="p-6">
        <div className={`grid gap-8 ${story && media.length > 0 ? "lg:grid-cols-2" : "grid-cols-1"}`}>

          {/* Left — Story */}
          {story && (
            <div>
              <p className="text-sm leading-relaxed text-stone-700 whitespace-pre-line">{story}</p>
            </div>
          )}

          {/* Right — Media grid + optional video */}
          {(media.length > 0 || hasVideo) && (
            <div className="space-y-3">
              {media.length > 0 && (
                <div className={`grid gap-2 ${media.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                  {media.map((url, i) => {
                    const isVideo = url.match(/\.(mp4|mov|webm|ogg)(\?|$)/i);
                    const isFirst = i === 0 && media.length >= 3;
                    return (
                      <div
                        key={i}
                        className={`rounded-xl overflow-hidden bg-stone-100 ${isFirst ? "col-span-2 aspect-video" : "aspect-square"}`}
                      >
                        {isVideo ? (
                          <video src={url} muted className="w-full h-full object-cover" />
                        ) : (
                          <img
                            src={url}
                            alt="Workshop"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() => window.open(url, "_blank")}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {hasVideo && (
                <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%" }}>
                  {isYouTubeOrVimeo ? (
                    <iframe
                      src={getVideoEmbedUrl(builder.introduction_video_url)}
                      className="absolute inset-0 w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={builder.introduction_video_url}
                      controls
                      className="absolute inset-0 w-full h-full bg-black"
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}