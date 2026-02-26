const WOOD_OPTIONS = ["Alder", "Ash", "Basswood", "Bubinga", "Koa", "Mahogany", "Maple", "Pine", "Poplar", "Rosewood", "Walnut", "Other"];

function SpecSelect({ label, value, onChange, options, placeholder = "Select...", builderOptions, builderNotes }) {
  // If builder has defined available options, filter to only those; otherwise show all
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
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 mt-1">
          💡 {builderNotes}
        </p>
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

export default function SpecificationsForm({ specs = {}, onChange }) {
  function update(key, val) {
    onChange({ ...specs, [key]: val });
  }

  const bc = specs.bodyConstruction;

  return (
    <div className="space-y-4 border border-stone-200 rounded-xl p-4 bg-stone-50">
      <h3 className="text-sm font-semibold text-stone-700">Specifications</h3>

      {/* Instrument Category */}
      <div className="grid sm:grid-cols-2 gap-4">
        <SpecSelect
          label="Instrument Category"
          value={specs.instrumentCategory}
          onChange={v => update("instrumentCategory", v)}
          options={["Electric Guitars", "Electric Bass Guitar", "Acoustic Guitar", "Acoustic Bass Guitar", "Other"]}
        />
        {specs.instrumentCategory === "Other" && (
          <SpecInput label="Specify Category" value={specs.otherInstrumentCategory} onChange={v => update("otherInstrumentCategory", v)} placeholder="Enter instrument category..." />
        )}
      </div>

      {/* Handedness */}
      <div className="grid sm:grid-cols-2 gap-4">
        <SpecSelect
          label="Handedness"
          value={specs.handedness}
          onChange={v => update("handedness", v)}
          options={["Right-Handed", "Left-Handed"]}
        />
      </div>

      {/* Number of Strings */}
      <div className="grid sm:grid-cols-2 gap-4">
        <SpecSelect
          label="Number of Strings"
          value={specs.numberOfStrings}
          onChange={v => update("numberOfStrings", v)}
          options={["4 String", "5 String", "6 String", "8 String", "12 String", "Other"]}
        />
        {specs.numberOfStrings === "Other" && (
          <SpecInput label="Specify Number of Strings" value={specs.otherNumberOfStrings} onChange={v => update("otherNumberOfStrings", v)} placeholder="Enter number of strings..." />
        )}
      </div>

      {/* Body Construction */}
      <div className="grid sm:grid-cols-2 gap-4">
        <SpecSelect
          label="Body Construction"
          value={specs.bodyConstruction}
          onChange={v => {
            // Clear old construction-specific fields when switching
            onChange({
              ...specs,
              bodyConstruction: v,
              otherBodyConstruction: "",
              topWood: "", otherTopWood: "",
              backWood: "", otherBackWood: "",
              middleWood: "", otherMiddleWood: "",
              bodyConstructionDescription: ""
            });
          }}
          options={["One Piece", "Two Piece", "Three Piece", "Other"]}
        />
      </div>

      {/* One Piece → Top Wood only */}
      {bc === "One Piece" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <WoodSelect label="Top Wood" value={specs.topWood} otherValue={specs.otherTopWood} onChange={v => update("topWood", v)} onOtherChange={v => update("otherTopWood", v)} bookMatchedValue={specs.topBookMatched} onBookMatchedChange={v => update("topBookMatched", v)} />
        </div>
      )}

      {/* Two Piece → Top Wood + Back Wood */}
      {bc === "Two Piece" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <WoodSelect label="Top Wood" value={specs.topWood} otherValue={specs.otherTopWood} onChange={v => update("topWood", v)} onOtherChange={v => update("otherTopWood", v)} bookMatchedValue={specs.topBookMatched} onBookMatchedChange={v => update("topBookMatched", v)} />
          <WoodSelect label="Back Wood" value={specs.backWood} otherValue={specs.otherBackWood} onChange={v => update("backWood", v)} onOtherChange={v => update("otherBackWood", v)} bookMatchedValue={specs.backBookMatched} onBookMatchedChange={v => update("backBookMatched", v)} />
        </div>
      )}

      {/* Three Piece → Top Wood + Middle Wood + Back Wood */}
      {bc === "Three Piece" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <WoodSelect label="Top Wood" value={specs.topWood} otherValue={specs.otherTopWood} onChange={v => update("topWood", v)} onOtherChange={v => update("otherTopWood", v)} bookMatchedValue={specs.topBookMatched} onBookMatchedChange={v => update("topBookMatched", v)} />
          <WoodSelect label="Middle Wood" value={specs.middleWood} otherValue={specs.otherMiddleWood} onChange={v => update("middleWood", v)} onOtherChange={v => update("otherMiddleWood", v)} />
          <WoodSelect label="Back Wood" value={specs.backWood} otherValue={specs.otherBackWood} onChange={v => update("backWood", v)} onOtherChange={v => update("otherBackWood", v)} bookMatchedValue={specs.backBookMatched} onBookMatchedChange={v => update("backBookMatched", v)} />
        </div>
      )}

      {/* Top Grain Details */}
      <div className="grid sm:grid-cols-2 gap-4">
        <SpecSelect
          label="Top Grain Details"
          value={specs.topGrainDetails}
          onChange={v => update("topGrainDetails", v)}
          options={["Birdseye", "Burled", "Flamed", "Plain", "Quilted", "Spalted", "Other"]}
        />
        {specs.topGrainDetails === "Other" && (
          <SpecInput label="Specify Top Grain Details" value={specs.otherTopGrainDetails} onChange={v => update("otherTopGrainDetails", v)} placeholder="Enter grain details..." />
        )}
      </div>

      {/* Finish Materials and Description */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">Finish Materials and Description</label>
        <textarea
          value={specs.finishMaterialsDescription || ""}
          onChange={e => update("finishMaterialsDescription", e.target.value)}
          placeholder="Describe finish materials..."
          rows={2}
          className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      </div>

      {/* Finish Pattern */}
      <div className="grid sm:grid-cols-2 gap-4">
        <SpecSelect
          label="Finish Pattern"
          value={specs.finishPattern}
          onChange={v => update("finishPattern", v)}
          options={["Solid", "Sunburst", "Fade", "Other"]}
        />
        {specs.finishPattern === "Other" && (
          <SpecInput label="Specify Finish Pattern" value={specs.otherFinishPattern} onChange={v => update("otherFinishPattern", v)} placeholder="Enter finish pattern..." />
        )}
      </div>

      {/* Color */}
      <div className="grid sm:grid-cols-2 gap-4">
        <SpecSelect
          label="Color"
          value={specs.color}
          onChange={v => update("color", v)}
          options={["Natural", "Blue", "Brown", "Black", "Red", "Purple", "Pink", "Gold/Yellow", "Green", "Silver", "Gray", "Other"]}
        />
        {specs.color === "Other" && (
          <SpecInput label="Specify Color" value={specs.otherColor} onChange={v => update("otherColor", v)} placeholder="Enter color..." />
        )}
      </div>

      {/* Frets */}
      <div className="grid sm:grid-cols-2 gap-4">
        <SpecSelect
          label="Frets"
          value={specs.frets}
          onChange={v => update("frets", v)}
          options={["Fretless", "Medium", "Tall", "Jumbo", "Other"]}
        />
        {specs.frets === "Other" && (
          <SpecInput label="Specify Frets" value={specs.otherFrets} onChange={v => update("otherFrets", v)} placeholder="Enter fret type..." />
        )}
      </div>

      {/* Fret Material */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">Fret Material</label>
        <textarea
          value={specs.fretMaterial || ""}
          onChange={e => update("fretMaterial", e.target.value)}
          placeholder="Describe fret material..."
          rows={2}
          className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      </div>

      {/* Fret Details */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">Fret Details</label>
        <textarea
          value={specs.fretDetails || ""}
          onChange={e => update("fretDetails", e.target.value)}
          placeholder="Describe fret details..."
          rows={2}
          className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      </div>

      {/* Neck Construction */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">Neck Construction</label>
        <textarea
          value={specs.neckConstruction || ""}
          onChange={e => update("neckConstruction", e.target.value)}
          placeholder="Describe neck construction..."
          rows={2}
          className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      </div>

      {/* Neck Materials */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">Neck Materials</label>
        <textarea
          value={specs.neckMaterials || ""}
          onChange={e => update("neckMaterials", e.target.value)}
          placeholder="Describe neck materials..."
          rows={2}
          className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      </div>

      {/* Scale Length + Nut Width */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Scale Length (NN.NNN")</label>
          <input
            type="number"
            step="0.001"
            value={specs.scaleLength || ""}
            onChange={e => update("scaleLength", e.target.value ? Number(e.target.value) : "")}
            placeholder='e.g. 25.500'
            className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Nut Width (N.NNN")</label>
          <input
            type="number"
            step="0.001"
            value={specs.nutWidth || ""}
            onChange={e => update("nutWidth", e.target.value ? Number(e.target.value) : "")}
            placeholder='e.g. 1.687'
            className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Nut Material */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">Nut Material</label>
        <textarea
          value={specs.nutMaterial || ""}
          onChange={e => update("nutMaterial", e.target.value)}
          placeholder="Describe nut material..."
          rows={2}
          className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      </div>

      {/* Fretboard Radius */}
      <div className="grid sm:grid-cols-2 gap-4">
        <SpecSelect
          label="Fretboard Radius"
          value={specs.fretboardRadius}
          onChange={v => update("fretboardRadius", v)}
          options={["N/A", "7.25\"", "9.5\"", "10\"", "12\"", "13.78\"", "14\"", "15\"", "16\"", "17\"", "20\"", "Other"]}
        />
        {specs.fretboardRadius === "Other" && (
          <SpecInput label="Specify Fretboard Radius" value={specs.otherFretboardRadius} onChange={v => update("otherFretboardRadius", v)} placeholder='Enter radius...' />
        )}
      </div>

      {/* Active/Passive Pickups */}
      <div className="grid sm:grid-cols-2 gap-4">
        <SpecSelect
          label="Active/Passive Pickups"
          value={specs.activePassivePickups}
          onChange={v => update("activePassivePickups", v)}
          options={["Active", "Passive"]}
        />
      </div>

      {/* Pickup Configuration */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">Pickup Configuration</label>
        <textarea
          value={specs.pickupConfiguration || ""}
          onChange={e => update("pickupConfiguration", e.target.value)}
          placeholder="Describe pickup configuration..."
          rows={2}
          className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      </div>

      {/* Preamp */}
      <div className="grid sm:grid-cols-2 gap-4">
        <SpecSelect
          label="Preamp"
          value={specs.preamp}
          onChange={v => update("preamp", v)}
          options={["Yes", "No"]}
        />
      </div>

      {/* Case Includes */}
      <div className="grid sm:grid-cols-2 gap-4">
        <SpecSelect
          label="Case Includes"
          value={specs.caseIncludes}
          onChange={v => update("caseIncludes", v)}
          options={["Yes", "No"]}
        />
      </div>

      {/* Case Description */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">Case Description</label>
        <textarea
          value={specs.caseDescription || ""}
          onChange={e => update("caseDescription", e.target.value)}
          placeholder="Describe the case..."
          rows={2}
          className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      </div>

      {/* Other → Description */}
      {bc === "Other" && (
        <div>
          <SpecInput
            label="Body Construction Description"
            value={specs.bodyConstructionDescription}
            onChange={v => update("bodyConstructionDescription", v)}
            placeholder="Describe the body construction..."
          />
        </div>
      )}
    </div>
  );
}