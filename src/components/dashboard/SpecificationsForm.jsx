const WOOD_OPTIONS = ["Alder", "Ash", "Basswood", "Bubinga", "Koa", "Mahogany", "Maple", "Pine", "Poplar", "Rosewood", "Walnut", "Other"];

function SpecSelect({ label, value, onChange, options, placeholder = "Select..." }) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
      <select value={value || ""} onChange={e => onChange(e.target.value)} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
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

function WoodSelect({ label, value, otherValue, onChange, onOtherChange }) {
  return (
    <>
      <SpecSelect label={label} value={value} onChange={onChange} options={WOOD_OPTIONS} />
      {value === "Other" && (
        <SpecInput label={`Specify ${label}`} value={otherValue} onChange={onOtherChange} placeholder="Enter wood type..." />
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

      {/* One Piece → Top Wood */}
      {bc === "One Piece" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <WoodSelect
            label="Top Wood"
            value={specs.topWood}
            otherValue={specs.otherTopWood}
            onChange={v => update("topWood", v)}
            onOtherChange={v => update("otherTopWood", v)}
          />
        </div>
      )}

      {/* Two Piece → Back Wood */}
      {bc === "Two Piece" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <WoodSelect
            label="Back Wood"
            value={specs.backWood}
            otherValue={specs.otherBackWood}
            onChange={v => update("backWood", v)}
            onOtherChange={v => update("otherBackWood", v)}
          />
        </div>
      )}

      {/* Three Piece → Middle Wood */}
      {bc === "Three Piece" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <WoodSelect
            label="Middle Wood"
            value={specs.middleWood}
            otherValue={specs.otherMiddleWood}
            onChange={v => update("middleWood", v)}
            onOtherChange={v => update("otherMiddleWood", v)}
          />
        </div>
      )}

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