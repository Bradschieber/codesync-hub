function Section({ title, children }) {
  const hasContent = Array.isArray(children)
    ? children.some(c => c)
    : !!children;
  if (!hasContent) return null;
  return (
    <div>
      <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200 pb-1 mb-3">{title}</h3>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  if (!value || value === "N/A") return null;
  return (
    <div className="flex flex-col">
      <span className="text-xs text-stone-400 font-medium">{label}</span>
      <span className="text-sm text-stone-700 font-medium">{String(value)}</span>
    </div>
  );
}

function FullRow({ label, value }) {
  if (!value || value === "N/A") return null;
  return (
    <div className="sm:col-span-2 flex flex-col">
      <span className="text-xs text-stone-400 font-medium">{label}</span>
      <span className="text-sm text-stone-700 font-medium">{String(value)}</span>
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
    <div className="bg-white rounded-2xl border border-stone-200 mb-8 overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
        <h2 className="text-lg font-bold text-stone-800">Specifications</h2>
      </div>
      <div className="px-6 py-5 space-y-6">

        {/* General */}
        <Section title="General">
          <Row label="Instrument Type" value={s.instrumentCategory === "Other" ? s.otherInstrumentCategory : s.instrumentCategory} />
          <Row label="Handedness" value={s.handedness} />
          <Row label="Number of Strings" value={s.numberOfStrings === "Other" ? s.otherNumberOfStrings : s.numberOfStrings} />
        </Section>

        {/* Body */}
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

        {/* Finish */}
        {hasFinish && (
          <Section title="Finish">
            <Row label="Finish Pattern" value={s.finishPattern === "Other" ? s.otherFinishPattern : s.finishPattern} />
            <Row label="Color" value={s.color === "Other" ? s.otherColor : s.color} />
            <FullRow label="Finish Materials & Description" value={s.finishMaterialsDescription} />
          </Section>
        )}

        {/* Neck & Fretboard */}
        {hasNeck && (
          <Section title="Neck & Fretboard">
            <Row label='Scale Length' value={s.scaleLength ? `${s.scaleLength}"` : null} />
            <Row label='Nut Width' value={s.nutWidth ? `${s.nutWidth}"` : null} />
            <Row label="Fretboard Radius" value={s.fretboardRadius === "Other" ? s.otherFretboardRadius : s.fretboardRadius} />
            <Row label="Frets" value={s.frets === "Other" ? s.otherFrets : s.frets} />
            <Row label="Nut Material" value={s.nutMaterial} />
            <Row label="Neck Construction" value={s.neckConstruction} />
            <FullRow label="Neck Materials" value={s.neckMaterials} />
          </Section>
        )}

        {/* Hardware */}
        {hasHardware && (
          <Section title="Hardware">
            <Row label="Tuners" value={s.tuners} />
            <Row label="Bridge" value={s.bridge} />
            <Row label="Tailpiece" value={s.tailpiece} />
            <Row label="Knobs" value={s.knobs} />
            <FullRow label="Other Hardware" value={s.otherHardware} />
          </Section>
        )}

        {/* Electronics */}
        {hasElectronics && (
          <Section title="Electronics">
            <Row label="Active/Passive Pickups" value={s.activePassivePickups} />
            <Row label="Preamp" value={s.preamp} />
            <FullRow label="Pickup Configuration" value={s.pickupConfiguration} />
          </Section>
        )}

        {/* Case */}
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