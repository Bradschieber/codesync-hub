import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const SLATE = "#2F3E55";

function SpecRow({ label, value }) {
  if (!value || value === "N/A") return null;
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b last:border-b-0" style={{ borderColor: "#F0EDE8" }}>
      <span className="text-xs uppercase tracking-wide font-medium" style={{ color: "#8A8A8A" }}>{label}</span>
      <span className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>{String(value)}</span>
    </div>
  );
}

function AccordionSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  const rows = Array.isArray(children) ? children.flat().filter(c => c) : [children].filter(c => c);
  if (rows.length === 0) return null;

  return (
    <div className="border rounded-xl overflow-hidden" style={{ borderColor: "#E3E0D8" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors"
        style={{ backgroundColor: open ? "#F2F0EA" : "#FFFFFF" }}
      >
        <span className="text-sm font-bold uppercase tracking-wider" style={{ color: SLATE }}>{title}</span>
        {open
          ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: SLATE }} />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "#9A9A9A" }} />}
      </button>
      {open && (
        <div className="px-5 pb-2 bg-white grid sm:grid-cols-2 gap-x-8">
          {children}
        </div>
      )}
    </div>
  );
}

export default function SpecificationsDisplay({ specs = {} }) {
  if (!specs || Object.keys(specs).length === 0) return null;
  const s = specs;

  return (
    <div className="space-y-2">

      <AccordionSection title="General" defaultOpen={true}>
        <SpecRow label="Instrument Type" value={s.instrumentCategory === "Other" ? s.otherInstrumentCategory : s.instrumentCategory} />
        <SpecRow label="Handedness" value={s.handedness} />
        <SpecRow label="Number of Strings" value={s.numberOfStrings === "Other" ? s.otherNumberOfStrings : s.numberOfStrings} />
      </AccordionSection>

      <AccordionSection title="Body">
        <SpecRow label="Body Construction" value={s.bodyConstruction === "Other" ? s.bodyConstructionDescription : s.bodyConstruction} />
        <SpecRow label="Top Wood" value={s.topWood === "Other" ? s.otherTopWood : s.topWood} />
        <SpecRow label="Top Book-Matched" value={s.topBookMatched} />
        <SpecRow label="Top Grain" value={s.topGrainDetails === "Other" ? s.otherTopGrainDetails : s.topGrainDetails} />
        <SpecRow label="Middle Wood" value={s.middleWood === "Other" ? s.otherMiddleWood : s.middleWood} />
        <SpecRow label="Back Wood" value={s.backWood === "Other" ? s.otherBackWood : s.backWood} />
        <SpecRow label="Back Book-Matched" value={s.backBookMatched} />
        <SpecRow label="Body Description" value={s.bodyDescription} />
        <SpecRow label="Bracing" value={s.bracingDescription} />
      </AccordionSection>

      <AccordionSection title="Finish">
        <SpecRow label="Finish Pattern" value={s.finishPattern === "Other" ? s.otherFinishPattern : s.finishPattern} />
        <SpecRow label="Color" value={s.color === "Other" ? s.otherColor : s.color} />
        <SpecRow label="Finish Materials" value={s.finishMaterialsDescription} />
      </AccordionSection>

      <AccordionSection title="Neck & Fretboard">
        <SpecRow label="Scale Length" value={s.scaleLength ? `${s.scaleLength}"` : null} />
        <SpecRow label="Nut Width" value={s.nutWidth ? `${s.nutWidth}"` : null} />
        <SpecRow label="Fretboard Radius" value={s.fretboardRadius === "Other" ? s.otherFretboardRadius : s.fretboardRadius} />
        <SpecRow label="Frets" value={s.frets === "Other" ? s.otherFrets : s.frets} />
        <SpecRow label="Nut Material" value={s.nutMaterial} />
        <SpecRow label="Neck Construction" value={s.neckConstruction} />
        <SpecRow label="Neck Materials" value={s.neckMaterials} />
      </AccordionSection>

      <AccordionSection title="Electronics">
        <SpecRow label="Active / Passive" value={s.activePassivePickups} />
        <SpecRow label="Preamp" value={s.preamp} />
        <SpecRow label="Pickup Configuration" value={s.pickupConfiguration} />
      </AccordionSection>

      <AccordionSection title="Case">
        <SpecRow label="Case Included" value={s.caseIncludes} />
        <SpecRow label="Case Description" value={s.caseDescription} />
      </AccordionSection>

    </div>
  );
}