const WOOD_OPTIONS = ["Alder", "Ash", "Basswood", "Bubinga", "Koa", "Mahogany", "Maple", "Pine", "Poplar", "Rosewood", "Walnut", "Other"];

function SpecSelect({ label, value, onChange, options, placeholder = "Select...", builderOptions, builderNotes }) {
  const filteredOptions = builderOptions && builderOptions.length > 0
    ? options.filter(o => builderOptions.includes(o))
    : options;
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
      <select value={value || ""} onChange={e => onChange(e.target.value)} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
        <option value="">{placeholder}</option>
        {filteredOptions.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {builderNotes && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 mt-1">💡 {builderNotes}</p>
      )}
    </div>
  );
}

function SpecInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
      <input value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
    </div>
  );
}

function SpecTextarea({ label, value, onChange, placeholder, rows = 2, builderNotes }) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
      <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
      {builderNotes && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 mt-1">💡 {builderNotes}</p>
      )}
    </div>
  );
}

function WoodSelect({ label, value, otherValue, onChange, onOtherChange, bookMatchedValue, onBookMatchedChange, builderOptions, builderNotes }) {
  return (
    <>
      <SpecSelect label={label} value={value} onChange={onChange} options={WOOD_OPTIONS} builderOptions={builderOptions} builderNotes={builderNotes} />
      {value === "Other" && (
        <SpecInput label={`Specify ${label}`} value={otherValue} onChange={onOtherChange} placeholder="Enter wood type..." />
      )}
      {bookMatchedValue !== undefined && (
        <SpecSelect label={`${label} Book Matched`} value={bookMatchedValue} onChange={onBookMatchedChange} options={["N/A", "Yes", "No"]} />
      )}
    </>
  );
}

function SectionHeader({ title }) {
  return (
    <div className="col-span-full">
      <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200 pb-1 mt-2">{title}</h4>
    </div>
  );
}

export default function SpecificationsForm({ specs = {}, onChange, builderSpecOptions = {} }) {
  function update(key, val) {
    onChange({ ...specs, [key]: val });
  }

  function bo(key) { return builderSpecOptions[key]?.options || []; }
  function bn(key) { return builderSpecOptions[key]?.notes || ""; }

  const bc = specs.bodyConstruction;
  const cat = specs.instrumentCategory;
  const isElectric = cat === "Electric Guitars" || cat === "Electric Bass Guitar";
  const isAcoustic = cat === "Acoustic Guitar" || cat === "Acoustic Bass Guitar";

  return (
    <div className="space-y-4 border border-stone-200 rounded-xl p-4 bg-stone-50">
      <h3 className="text-sm font-semibold text-stone-700">Specifications</h3>

      {/* ── General ── */}
      <div className="grid sm:grid-cols-2 gap-4">
        <SectionHeader title="General" />
        <SpecSelect
          label="Instrument Category"
          value={specs.instrumentCategory}
          onChange={v => update("instrumentCategory", v)}
          options={["Electric Guitars", "Electric Bass Guitar", "Acoustic Guitar", "Acoustic Bass Guitar", "Other"]}
          builderOptions={bo("instrumentCategory")} builderNotes={bn("instrumentCategory")}
        />
        {specs.instrumentCategory === "Other"
          ? <SpecInput label="Specify Category" value={specs.otherInstrumentCategory} onChange={v => update("otherInstrumentCategory", v)} placeholder="Enter instrument category..." />
          : <div />
        }
        <SpecSelect
          label="Handedness"
          value={specs.handedness}
          onChange={v => update("handedness", v)}
          options={["Right-Handed", "Left-Handed"]}
          builderOptions={bo("handedness")} builderNotes={bn("handedness")}
        />
        <SpecSelect
          label="Number of Strings"
          value={specs.numberOfStrings}
          onChange={v => update("numberOfStrings", v)}
          options={["4 String", "5 String", "6 String", "8 String", "12 String", "Other"]}
          builderOptions={bo("numberOfStrings")} builderNotes={bn("numberOfStrings")}
        />
        {specs.numberOfStrings === "Other" && (
          <SpecInput label="Specify Number of Strings" value={specs.otherNumberOfStrings} onChange={v => update("otherNumberOfStrings", v)} placeholder="Enter number of strings..." />
        )}
      </div>

      {/* ── Body ── */}
      <div className="grid sm:grid-cols-2 gap-4">
        <SectionHeader title="Body" />

        {/* Body Type — Electric only */}
        {isElectric && (
          <>
            <SpecSelect
              label="Body Type"
              value={specs.bodyType}
              onChange={v => update("bodyType", v)}
              options={["Solid", "Semi-Hollow", "Hollow", "Archtop", "Other"]}
            />
            {specs.bodyType === "Other" && (
              <SpecInput label="Specify Body Type" value={specs.otherBodyType} onChange={v => update("otherBodyType", v)} placeholder="Enter body type..." />
            )}
          </>
        )}

        {/* Body Shape — Acoustic only */}
        {isAcoustic && (
          <>
            <SpecSelect
              label="Body Shape"
              value={specs.bodyShape}
              onChange={v => update("bodyShape", v)}
              options={["Dreadnought", "Parlor", "Concert", "Auditorium", "Jumbo", "Classical", "Other"]}
            />
            {specs.bodyShape === "Other" && (
              <SpecInput label="Specify Body Shape" value={specs.otherBodyShape} onChange={v => update("otherBodyShape", v)} placeholder="Enter body shape..." />
            )}
          </>
        )}

        <SpecSelect
          label="Body Construction"
          value={specs.bodyConstruction}
          onChange={v => onChange({ ...specs, bodyConstruction: v, otherBodyConstruction: "", topWood: "", otherTopWood: "", backWood: "", otherBackWood: "", middleWood: "", otherMiddleWood: "", bodyConstructionDescription: "" })}
          options={["One Piece", "Two Piece", "Three Piece", "Other"]}
          builderOptions={bo("bodyConstruction")} builderNotes={bn("bodyConstruction")}
        />
        {bc === "Other" && (
          <SpecInput label="Body Construction Description" value={specs.bodyConstructionDescription} onChange={v => update("bodyConstructionDescription", v)} placeholder="Describe the body construction..." />
        )}

        {bc === "One Piece" && (
          <WoodSelect label="Top Wood" value={specs.topWood} otherValue={specs.otherTopWood} onChange={v => update("topWood", v)} onOtherChange={v => update("otherTopWood", v)} bookMatchedValue={specs.topBookMatched} onBookMatchedChange={v => update("topBookMatched", v)} builderOptions={bo("topWood")} builderNotes={bn("topWood")} />
        )}
        {bc === "Two Piece" && (<>
          <WoodSelect label="Top Wood" value={specs.topWood} otherValue={specs.otherTopWood} onChange={v => update("topWood", v)} onOtherChange={v => update("otherTopWood", v)} bookMatchedValue={specs.topBookMatched} onBookMatchedChange={v => update("topBookMatched", v)} builderOptions={bo("topWood")} builderNotes={bn("topWood")} />
          <WoodSelect label="Back Wood" value={specs.backWood} otherValue={specs.otherBackWood} onChange={v => update("backWood", v)} onOtherChange={v => update("otherBackWood", v)} bookMatchedValue={specs.backBookMatched} onBookMatchedChange={v => update("backBookMatched", v)} builderOptions={bo("backWood")} builderNotes={bn("backWood")} />
        </>)}
        {bc === "Three Piece" && (<>
          <WoodSelect label="Top Wood" value={specs.topWood} otherValue={specs.otherTopWood} onChange={v => update("topWood", v)} onOtherChange={v => update("otherTopWood", v)} bookMatchedValue={specs.topBookMatched} onBookMatchedChange={v => update("topBookMatched", v)} builderOptions={bo("topWood")} builderNotes={bn("topWood")} />
          <WoodSelect label="Middle Wood" value={specs.middleWood} otherValue={specs.otherMiddleWood} onChange={v => update("middleWood", v)} onOtherChange={v => update("otherMiddleWood", v)} builderOptions={bo("middleWood")} builderNotes={bn("middleWood")} />
          <WoodSelect label="Back Wood" value={specs.backWood} otherValue={specs.otherBackWood} onChange={v => update("backWood", v)} onOtherChange={v => update("otherBackWood", v)} bookMatchedValue={specs.backBookMatched} onBookMatchedChange={v => update("backBookMatched", v)} builderOptions={bo("backWood")} builderNotes={bn("backWood")} />
        </>)}

        {/* Side Wood & Bracing — Acoustic only */}
        {isAcoustic && (
          <>
            <WoodSelect label="Side Wood" value={specs.sideWood} otherValue={specs.otherSideWood} onChange={v => update("sideWood", v)} onOtherChange={v => update("otherSideWood", v)} />
            <div className="col-span-full">
              <SpecTextarea label="Bracing Description" value={specs.bracingDescription} onChange={v => update("bracingDescription", v)} placeholder="Describe the bracing pattern and materials..." />
            </div>
          </>
        )}

        <SpecSelect
          label="Top Grain Details"
          value={specs.topGrainDetails}
          onChange={v => update("topGrainDetails", v)}
          options={["Birdseye", "Burled", "Flamed", "Plain", "Quilted", "Spalted", "Other"]}
          builderOptions={bo("topGrainDetails")} builderNotes={bn("topGrainDetails")}
        />
        {specs.topGrainDetails === "Other" && (
          <SpecInput label="Specify Top Grain Details" value={specs.otherTopGrainDetails} onChange={v => update("otherTopGrainDetails", v)} placeholder="Enter grain details..." />
        )}

        {/* Body Description — always shown */}
        <div className="col-span-full">
          <SpecTextarea label="Body Description" value={specs.bodyDescription} onChange={v => update("bodyDescription", v)} placeholder="Any unique or noteworthy details about the body..." />
        </div>
      </div>

      {/* ── Finish ── */}
      <div className="grid sm:grid-cols-2 gap-4">
        <SectionHeader title="Finish" />
        <SpecSelect
          label="Finish Pattern"
          value={specs.finishPattern}
          onChange={v => update("finishPattern", v)}
          options={["Solid", "Sunburst", "Fade", "Other"]}
          builderOptions={bo("finishPattern")} builderNotes={bn("finishPattern")}
        />
        <SpecSelect
          label="Color"
          value={specs.color}
          onChange={v => update("color", v)}
          options={["Natural", "Blue", "Brown", "Black", "Red", "Purple", "Pink", "Gold/Yellow", "Green", "Silver", "Gray", "Other"]}
          builderOptions={bo("color")} builderNotes={bn("color")}
        />
        {specs.finishPattern === "Other" && (
          <SpecInput label="Specify Finish Pattern" value={specs.otherFinishPattern} onChange={v => update("otherFinishPattern", v)} placeholder="Enter finish pattern..." />
        )}
        {specs.color === "Other" && (
          <SpecInput label="Specify Color" value={specs.otherColor} onChange={v => update("otherColor", v)} placeholder="Enter color..." />
        )}
        <div className="col-span-full">
          <SpecTextarea label="Finish Materials & Description" value={specs.finishMaterialsDescription} onChange={v => update("finishMaterialsDescription", v)} placeholder={bn("finishMaterialsDescription") || "Describe finish materials..."} builderNotes={bn("finishMaterialsDescription")} />
        </div>
      </div>

      {/* ── Neck & Fretboard ── */}
      <div className="grid sm:grid-cols-2 gap-4">
        <SectionHeader title="Neck & Fretboard" />
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Scale Length (NN.NNN")</label>
          <input type="number" step="0.001" value={specs.scaleLength || ""} onChange={e => update("scaleLength", e.target.value ? Number(e.target.value) : "")} placeholder="e.g. 25.500" className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Nut Width (N.NNN")</label>
          <input type="number" step="0.001" value={specs.nutWidth || ""} onChange={e => update("nutWidth", e.target.value ? Number(e.target.value) : "")} placeholder="e.g. 1.687" className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <SpecSelect
          label="Fretboard Radius"
          value={specs.fretboardRadius}
          onChange={v => update("fretboardRadius", v)}
          options={["N/A", "7.25\"", "9.5\"", "10\"", "12\"", "13.78\"", "14\"", "15\"", "16\"", "17\"", "20\"", "Other"]}
          builderOptions={bo("fretboardRadius")} builderNotes={bn("fretboardRadius")}
        />
        {specs.fretboardRadius === "Other" && (
          <SpecInput label="Specify Fretboard Radius" value={specs.otherFretboardRadius} onChange={v => update("otherFretboardRadius", v)} placeholder="Enter radius..." />
        )}
        <SpecSelect
          label="Frets"
          value={specs.frets}
          onChange={v => update("frets", v)}
          options={["Fretless", "Medium", "Tall", "Jumbo", "Other"]}
          builderOptions={bo("frets")} builderNotes={bn("frets")}
        />
        {specs.frets === "Other" && (
          <SpecInput label="Specify Frets" value={specs.otherFrets} onChange={v => update("otherFrets", v)} placeholder="Enter fret type..." />
        )}
        <SpecTextarea label="Nut Material" value={specs.nutMaterial} onChange={v => update("nutMaterial", v)} placeholder={bn("nutMaterial") || "Describe nut material..."} builderNotes={bn("nutMaterial")} />
        <SpecTextarea label="Neck Construction" value={specs.neckConstruction} onChange={v => update("neckConstruction", v)} placeholder={bn("neckConstruction") || "Describe neck construction and materials (e.g. 3-piece maple neck, quartersawn, scarf joint headstock)..."} builderNotes={bn("neckConstruction")} />
      </div>

      {/* ── Hardware ── */}
      <div className="grid sm:grid-cols-2 gap-4">
        <SectionHeader title="Hardware" />
        <SpecInput label="Tuners" value={specs.tuners} onChange={v => update("tuners", v)} placeholder="e.g. Gotoh 510, Sperzel locking..." />
        <SpecInput label="Bridge" value={specs.bridge} onChange={v => update("bridge", v)} placeholder="e.g. Hipshot A-Style, TOM..." />
        <SpecInput label="Tailpiece" value={specs.tailpiece} onChange={v => update("tailpiece", v)} placeholder="e.g. Hipshot, Stop bar..." />
        <SpecInput label="Knobs" value={specs.knobs} onChange={v => update("knobs", v)} placeholder="e.g. Dome, Speed, Barrel..." />
        <div className="col-span-full">
          <SpecInput label="Other Hardware" value={specs.otherHardware} onChange={v => update("otherHardware", v)} placeholder="Describe any other hardware..." />
        </div>
      </div>

      {/* ── Electronics ── */}
      <div className="grid sm:grid-cols-2 gap-4">
        <SectionHeader title="Electronics" />
        <SpecSelect
          label="Active/Passive Pickups"
          value={specs.activePassivePickups}
          onChange={v => update("activePassivePickups", v)}
          options={["Active", "Passive"]}
          builderOptions={bo("activePassivePickups")} builderNotes={bn("activePassivePickups")}
        />
        <SpecSelect
          label="Preamp"
          value={specs.preamp}
          onChange={v => update("preamp", v)}
          options={["Yes", "No"]}
          builderOptions={bo("preamp")} builderNotes={bn("preamp")}
        />
        <div className="col-span-full">
          <SpecTextarea label="Pickup Configuration" value={specs.pickupConfiguration} onChange={v => update("pickupConfiguration", v)} placeholder={bn("pickupConfiguration") || "Describe pickup configuration..."} builderNotes={bn("pickupConfiguration")} />
        </div>
      </div>

      {/* ── Case ── */}
      <div className="grid sm:grid-cols-2 gap-4">
        <SectionHeader title="Case" />
        <SpecSelect
          label="Case Included"
          value={specs.caseIncludes}
          onChange={v => update("caseIncludes", v)}
          options={["Yes", "No"]}
          builderOptions={bo("caseIncludes")} builderNotes={bn("caseIncludes")}
        />
        {specs.caseIncludes === "Yes" && (
          <SpecTextarea label="Case Description" value={specs.caseDescription} onChange={v => update("caseDescription", v)} placeholder="Describe the case..." />
        )}
      </div>
    </div>
  );
}