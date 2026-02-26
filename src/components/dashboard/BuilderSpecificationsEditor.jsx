/**
 * BuilderSpecificationsEditor
 * Lets a builder define what options they offer for each specification field.
 * For enum-based specs: multi-select checkboxes from predefined options.
 * For free-text specs: a notes textarea describing what they offer.
 */

const WOOD_OPTIONS = ["Alder", "Ash", "Basswood", "Bubinga", "Koa", "Mahogany", "Maple", "Pine", "Poplar", "Rosewood", "Walnut", "Other"];

const SPEC_DEFINITIONS = [
  {
    key: "instrumentCategory",
    label: "Instrument Categories",
    type: "multiselect",
    options: ["Electric Guitars", "Electric Bass Guitar", "Acoustic Guitar", "Acoustic Bass Guitar", "Other"],
  },
  {
    key: "handedness",
    label: "Handedness",
    type: "multiselect",
    options: ["Right-Handed", "Left-Handed"],
  },
  {
    key: "numberOfStrings",
    label: "Number of Strings",
    type: "multiselect",
    options: ["4 String", "5 String", "6 String", "8 String", "12 String", "Other"],
  },
  {
    key: "bodyConstruction",
    label: "Body Construction",
    type: "multiselect",
    options: ["One Piece", "Two Piece", "Three Piece", "Other"],
  },
  {
    key: "topWood",
    label: "Top / Body Wood",
    type: "multiselect",
    options: WOOD_OPTIONS,
  },
  {
    key: "backWood",
    label: "Back Wood",
    type: "multiselect",
    options: WOOD_OPTIONS,
  },
  {
    key: "middleWood",
    label: "Middle Wood",
    type: "multiselect",
    options: WOOD_OPTIONS,
  },
  {
    key: "topGrainDetails",
    label: "Top Grain Details",
    type: "multiselect",
    options: ["Birdseye", "Burled", "Flamed", "Plain", "Quilted", "Spalted", "Other"],
  },
  {
    key: "finishPattern",
    label: "Finish Patterns",
    type: "multiselect",
    options: ["Solid", "Sunburst", "Fade", "Other"],
  },
  {
    key: "color",
    label: "Available Colors",
    type: "multiselect",
    options: ["Natural", "Blue", "Brown", "Black", "Red", "Purple", "Pink", "Gold/Yellow", "Green", "Silver", "Gray", "Other"],
  },
  {
    key: "frets",
    label: "Fret Types",
    type: "multiselect",
    options: ["Fretless", "Medium", "Tall", "Jumbo", "Other"],
  },
  {
    key: "fretboardRadius",
    label: "Fretboard Radius",
    type: "multiselect",
    options: ['N/A', '7.25"', '9.5"', '10"', '12"', '13.78"', '14"', '15"', '16"', '17"', '20"', "Other"],
  },
  {
    key: "activePassivePickups",
    label: "Pickup Type",
    type: "multiselect",
    options: ["Active", "Passive"],
  },
  {
    key: "preamp",
    label: "Preamp Available",
    type: "multiselect",
    options: ["Yes", "No"],
  },
  {
    key: "caseIncludes",
    label: "Case Included",
    type: "multiselect",
    options: ["Yes", "No"],
  },
  {
    key: "finishMaterialsDescription",
    label: "Finish Materials",
    type: "notes",
    placeholder: "Describe the finish materials you offer (e.g. nitrocellulose lacquer, polyester, oil finish...)",
  },
  {
    key: "neckConstruction",
    label: "Neck Construction",
    type: "notes",
    placeholder: "Describe neck construction options (e.g. bolt-on, set neck, neck-through...)",
  },
  {
    key: "neckMaterials",
    label: "Neck Materials",
    type: "notes",
    placeholder: "Describe neck wood options (e.g. maple, mahogany, multi-laminate...)",
  },
  {
    key: "fretMaterial",
    label: "Fret Material",
    type: "notes",
    placeholder: "Describe fret material options (e.g. nickel silver, stainless steel, EVO gold...)",
  },
  {
    key: "pickupConfiguration",
    label: "Pickup Configurations",
    type: "notes",
    placeholder: "Describe pickup configurations you offer (e.g. HSS, HH, SSS, P/J, split-coil...)",
  },
  {
    key: "nutMaterial",
    label: "Nut Material",
    type: "notes",
    placeholder: "Describe nut material options (e.g. bone, TUSQ, brass, graphite...)",
  },
];

function MultiSelectSpec({ definition, value, onChange }) {
  const selected = value?.options || [];
  const notes = value?.notes || "";

  function toggleOption(opt) {
    const next = selected.includes(opt)
      ? selected.filter(o => o !== opt)
      : [...selected, opt];
    onChange({ options: next, notes });
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <p className="text-xs font-semibold text-stone-700 mb-2">{definition.label}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {definition.options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => toggleOption(opt)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              selected.includes(opt)
                ? "bg-amber-500 border-amber-500 text-white"
                : "bg-white border-stone-300 text-stone-600 hover:border-amber-400"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={notes}
        onChange={e => onChange({ options: selected, notes: e.target.value })}
        placeholder="Optional note to buyers (e.g. 'Other species available on request')..."
        className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-stone-50"
      />
    </div>
  );
}

function NotesSpec({ definition, value, onChange }) {
  const notes = value?.notes || "";
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <p className="text-xs font-semibold text-stone-700 mb-2">{definition.label}</p>
      <textarea
        value={notes}
        onChange={e => onChange({ notes: e.target.value })}
        placeholder={definition.placeholder}
        rows={2}
        className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-stone-50 resize-none"
      />
    </div>
  );
}

export default function BuilderSpecificationsEditor({ specOptions = {}, onChange }) {
  function updateSpec(key, val) {
    onChange({ ...specOptions, [key]: val });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-stone-500 leading-relaxed">
        For each specification, select the options you offer. Buyers will only see your available options when filling out the request form. Add notes to give buyers extra guidance.
      </p>
      {SPEC_DEFINITIONS.map(def => (
        def.type === "multiselect" ? (
          <MultiSelectSpec
            key={def.key}
            definition={def}
            value={specOptions[def.key]}
            onChange={val => updateSpec(def.key, val)}
          />
        ) : (
          <NotesSpec
            key={def.key}
            definition={def}
            value={specOptions[def.key]}
            onChange={val => updateSpec(def.key, val)}
          />
        )
      ))}
    </div>
  );
}