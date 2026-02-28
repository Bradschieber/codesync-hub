const SECTION_STYLES = {
  "General":         { accent: "bg-amber-500",   light: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700"  },
  "Body":            { accent: "bg-stone-600",    light: "bg-stone-50",   border: "border-stone-200",   text: "text-stone-600"  },
  "Finish":          { accent: "bg-rose-500",     light: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700"   },
  "Neck & Fretboard":{ accent: "bg-teal-600",     light: "bg-teal-50",    border: "border-teal-200",    text: "text-teal-700"   },
  "Hardware":        { accent: "bg-slate-500",    light: "bg-slate-50",   border: "border-slate-200",   text: "text-slate-700"  },
  "Electronics":     { accent: "bg-indigo-500",   light: "bg-indigo-50",  border: "border-indigo-200",  text: "text-indigo-700" },
  "Case":            { accent: "bg-emerald-600",  light: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700"},
};

function Section({ title, children }) {
  const hasContent = Array.isArray(children) ? children.some(c => c) : !!children;
  if (!hasContent) return null;

  const style = SECTION_STYLES[title] || SECTION_STYLES["General"];

  return (
    <div className={`rounded-xl border ${style.border} overflow-hidden`}>
      <div className={`flex items-center gap-2 px-4 py-2.5 ${style.light}`}>
        <div className={`w-1.5 h-4 rounded-full ${style.accent}`} />
        <h3 className={`text-xs font-bold uppercase tracking-wider ${style.text}`}>{title}</h3>
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
      <span className="text-xs text-stone-400 font-medium uppercase tracking-wide">{label}</span>
      <span className="text-sm text-stone-800 font-semibold">{String(value)}</span>
    </div>
  );
}

function FullRow({ label, value }) {
  if (!value || value === "N/A") return null;
  return (
    <div className="sm:col-span-2 flex flex-col gap-0.5">
      <span className="text-xs text-stone-400 font-medium uppercase tracking-wide">{label}</span>
      <span className="text-sm text-stone-800 font-semibold">{String(value)}</span>
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
      <div className="px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-stone-800 to-stone-700">
        <h2 className="text-lg font-bold text-white tracking-wide">Specifications</h2>
      </div>
      <div className="p-5 space-y-3 bg-stone-50">

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