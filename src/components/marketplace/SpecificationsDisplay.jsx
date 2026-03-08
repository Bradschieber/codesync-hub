const SLATE = "#2F3E55";

function Section({ title, children }) {
  const hasContent = Array.isArray(children) ? children.some(c => c) : !!children;
  if (!hasContent) return null;

  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#E3E0D8" }}>
      <div className="flex items-center gap-2 px-4 py-2.5" style={{ backgroundColor: "#F2F0EA" }}>
        <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: SLATE }} />
        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: SLATE }}>{title}</h3>
      </div>
      <div className="px-4 py-3 grid sm:grid-cols-2 gap-x-6 gap-y-3 bg-white">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  if (!value || value === "N/A") return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "#6A6A6A" }}>{label}</span>
      <span className="text-sm font-semibold" style={{ color: "#1F1F1F" }}>{String(value)}</span>
    </div>
  );
}

function FullRow({ label, value }) {
  if (!value || value === "N/A") return null;
  return (
    <div className="sm:col-span-2 flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "#6A6A6A" }}>{label}</span>
      <span className="text-sm font-semibold" style={{ color: "#1F1F1F" }}>{String(value)}</span>
    </div>
  );
}

export default function SpecificationsDisplay({ specs = {} }) {
  if (!specs || Object.keys(specs).length === 0) return null;

  const s = specs;

  const hasBody = s.bodyConstruction || s.topWood || s.backWood || s.middleWood || s.topGrainDetails || s.bodyConstructionDescription;
  const hasFinish = s.finishPattern || s.color || s.finishMaterialsDescription;
  const hasNeck = s.scaleLength || s.nutWidth || s.fretboardRadius || s.frets || s.nutMaterial || s.neckConstruction || s.neckMaterials;
  const hasHardware = s.tuners || s.bridge || s.tailpiece || s.knobs || s.otherHardware;
  const hasElectronics = s.activePassivePickups || s.preamp || s.pickupConfiguration;
  const hasCase = s.caseIncludes;

  const anyContent = s.instrumentCategory || s.handedness || s.numberOfStrings || hasBody || hasFinish || hasNeck || hasHardware || hasElectronics || hasCase;
  if (!anyContent) return null;

  return (
    <div className="rounded-2xl overflow-hidden border mb-8" style={{ borderColor: "#E3E0D8", backgroundColor: "#FFFFFF" }}>
      <div className="px-6 py-4 border-b" style={{ borderColor: "#E3E0D8", backgroundColor: "#2F3E55" }}>
        <h2 className="text-lg font-bold text-white tracking-wide">Specifications</h2>
      </div>
      <div className="p-5 space-y-3" style={{ backgroundColor: "#F7F6F3" }}>

        <Section title="General">
          <Row label="Instrument Type" value={s.instrumentCategory === "Other" ? s.otherInstrumentCategory : s.instrumentCategory} />
          <Row label="Handedness" value={s.handedness} />
          <Row label="Number of Strings" value={s.numberOfStrings === "Other" ? s.otherNumberOfStrings : s.numberOfStrings} />
        </Section>

        {hasBody && (
          <Section title="Body">
            <Row label="Body Construction" value={s.bodyConstruction === "Other" ? s.bodyConstructionDescription : s.bodyConstruction} />
            <Row label="Top Wood" value={s.topWood === "Other" ? s.otherTopWood : s.topWood} />
            <Row label="Top Book-Matched" value={s.topBookMatched} />
            <Row label="Top Grain" value={s.topGrainDetails === "Other" ? s.otherTopGrainDetails : s.topGrainDetails} />
            <Row label="Middle Wood" value={s.middleWood === "Other" ? s.otherMiddleWood : s.middleWood} />
            <Row label="Back Wood" value={s.backWood === "Other" ? s.otherBackWood : s.backWood} />
            <Row label="Back Book-Matched" value={s.backBookMatched} />
          </Section>
        )}

        {hasFinish && (
          <Section title="Finish">
            <Row label="Finish Pattern" value={s.finishPattern === "Other" ? s.otherFinishPattern : s.finishPattern} />
            <Row label="Color" value={s.color === "Other" ? s.otherColor : s.color} />
            <FullRow label="Finish Materials & Description" value={s.finishMaterialsDescription} />
          </Section>
        )}

        {hasNeck && (
          <Section title="Neck & Fretboard">
            <Row label='Scale Length' value={s.scaleLength ? `${s.scaleLength}"` : null} />
            <Row label='Nut Width' value={s.nutWidth ? `${s.nutWidth}"` : null} />
            <Row label="Fretboard Radius" value={s.fretboardRadius === "Other" ? s.otherFretboardRadius : s.fretboardRadius} />
            <Row label="Frets" value={s.frets === "Other" ? s.otherFrets : s.frets} />
            <Row label="Nut Material" value={s.nutMaterial} />
            <Row label="Neck Construction" value={s.neckConstruction} />
            {s.neckMaterials && <Row label="Neck Materials" value={s.neckMaterials} />}
          </Section>
        )}

        {hasHardware && (
          <Section title="Hardware">
            <Row label="Tuners" value={s.tuners} />
            <Row label="Bridge" value={s.bridge} />
            <Row label="Tailpiece" value={s.tailpiece} />
            <Row label="Knobs" value={s.knobs} />
            <FullRow label="Other Hardware" value={s.otherHardware} />
          </Section>
        )}

        {hasElectronics && (
          <Section title="Electronics">
            <Row label="Active/Passive Pickups" value={s.activePassivePickups} />
            <Row label="Preamp" value={s.preamp} />
            <FullRow label="Pickup Configuration" value={s.pickupConfiguration} />
          </Section>
        )}

        {hasCase && (
          <Section title="Case">
            <Row label="Case Included" value={s.caseIncludes} />
            <FullRow label="Case Description" value={s.caseDescription} />
          </Section>
        )}

      </div>
    </div>
  );
}