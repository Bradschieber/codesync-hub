import { ArrowRight } from "lucide-react";

const AMBER = "#C57A1F";
const NAVY = "#2F3E55";

// Sample product data using a real processed marketplace image
const SAMPLE_PRODUCT = {
  id: "experiment",
  name: "Custom Electric Bass",
  builder_name: "Test Builder 3",
  price: 2546,
  processed_hero_image_url:
    "https://base44.app/api/apps/699b4908ac9a3afade5feb65/files/mp/public/699b4908ac9a3afade5feb65/2ab7e0571_processed_hero_69d3bc9bcb14d22a7a3d1b13.png",
};

const VARIANTS = [
  {
    label: "1 : 1",
    sublabel: "Square (Current)",
    ratio: "1 / 1",
    note: "Clean but guitar feels small — side whitespace visible",
  },
  {
    label: "4 : 5",
    sublabel: "Portrait (Recommended)",
    ratio: "4 / 5",
    note: "Instrument fills the frame better — balanced and polished",
    highlight: true,
  },
  {
    label: "3 : 4",
    sublabel: "Tall Portrait",
    ratio: "3 / 4",
    note: "Maximum instrument height — card becomes quite tall",
  },
];

function ExperimentCard({ product, ratio, label, sublabel, note, highlight }) {
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Ratio Label */}
      <div className={`flex flex-col items-center gap-1`}>
        <span
          className="text-lg font-bold tracking-tight"
          style={{ color: highlight ? "#A0692A" : NAVY }}
        >
          {label}
        </span>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: highlight ? "#FEF3C7" : "#F0EFED",
            color: highlight ? "#92400E" : "#5A6A7A",
          }}
        >
          {sublabel}
        </span>
      </div>

      {/* Card */}
      <div
        className="group block w-full transition-all duration-200"
        style={{
          backgroundColor: "#FFFFFF",
          boxShadow: highlight
            ? "0 4px 20px rgba(160,105,42,0.18)"
            : "0 1px 4px rgba(27,43,75,0.07)",
          border: highlight ? "2px solid #C57A1F" : "1px solid #E8E5E0",
        }}
      >
        {/* Image Container — only the ratio changes */}
        <div
          className="w-full overflow-hidden"
          style={{ aspectRatio: ratio, backgroundColor: "#F0EFED" }}
        >
          <img
            src={product.processed_hero_image_url}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Card Content — identical across all 3 */}
        <div className="pt-3 pb-4 px-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-sm leading-snug" style={{ color: "#1A1A1A" }}>
              {product.name}
            </h3>
            <span className="font-bold text-sm flex-shrink-0" style={{ color: AMBER }}>
              ${product.price.toLocaleString()}
            </span>
          </div>
          <p className="text-xs font-medium" style={{ color: "#5A6A7A" }}>
            by <span className="underline">{product.builder_name}</span>
          </p>
        </div>
      </div>

      {/* Note */}
      <p
        className="text-xs text-center leading-relaxed max-w-[180px]"
        style={{ color: highlight ? "#92400E" : "#888" }}
      >
        {note}
      </p>
    </div>
  );
}

export default function ImageRatioExperiment() {
  return (
    <div style={{ backgroundColor: "#F7F6F3", minHeight: "100vh" }}>
      {/* Header */}
      <div className="border-b" style={{ backgroundColor: "#F2F0EA", borderColor: "#E3E0D8" }}>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="inline-block text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded mb-3"
            style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>
            Design Experiment
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: NAVY }}>
            Product Card — Image Ratio Comparison
          </h1>
          <p className="text-sm" style={{ color: "#7A7A7A" }}>
            Same image · Same card design · Same product — only the image aspect ratio changes.
          </p>
        </div>
      </div>

      {/* Cards Side by Side */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 items-start">
          {VARIANTS.map((v) => (
            <ExperimentCard
              key={v.ratio}
              product={SAMPLE_PRODUCT}
              ratio={v.ratio}
              label={v.label}
              sublabel={v.sublabel}
              note={v.note}
              highlight={v.highlight}
            />
          ))}
        </div>

        {/* Recommendation box */}
        <div
          className="mt-14 rounded-xl p-6 border"
          style={{ backgroundColor: "#FFFDF9", borderColor: "#E8D5B5" }}
        >
          <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "#92400E" }}>
            Recommendation
          </h2>
          <p className="text-sm leading-relaxed mb-3" style={{ color: "#3A3A3A" }}>
            <strong>4:5 portrait</strong> is the strongest choice for Stringed Collective's marketplace. It reduces
            side whitespace significantly compared to 1:1, gives the instrument a more commanding presence,
            and remains flexible enough across guitar, bass, and other vertical instruments.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#5A5A5A" }}>
            <strong>Implementation note:</strong> Keep the 2000×2000px square master image and simply apply{" "}
            <code
              className="text-xs px-1.5 py-0.5 rounded font-mono"
              style={{ backgroundColor: "#F0EFED", color: "#333" }}
            >
              aspect-ratio: 4 / 5; object-fit: contain
            </code>{" "}
            to the image container in the catalog card. No reprocessing required.
          </p>
        </div>
      </div>
    </div>
  );
}