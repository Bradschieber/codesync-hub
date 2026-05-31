const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", "France",
  "Italy", "Spain", "Netherlands", "Sweden", "Norway", "Denmark", "Finland",
  "Switzerland", "Austria", "Belgium", "Portugal", "Japan", "New Zealand",
  "Ireland", "Mexico", "Brazil", "Argentina", "South Korea", "Other"
];

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming","District of Columbia"
];

const CA_PROVINCES = [
  "Alberta","British Columbia","Manitoba","New Brunswick","Newfoundland and Labrador",
  "Northwest Territories","Nova Scotia","Nunavut","Ontario","Prince Edward Island",
  "Quebec","Saskatchewan","Yukon"
];

const INPUT_STYLE = {
  borderColor: "#DEDBD6",
  backgroundColor: "#FFFFFF",
};

function Label({ children }) {
  return <label className="block text-xs font-semibold mb-1" style={{ color: "#5A5A5A" }}>{children}</label>;
}

export default function LocationFields({ form, setForm }) {
  const country = form.business_country || "";
  const showStateDropdown = country === "United States" || country === "Canada";
  const stateOptions = country === "Canada" ? CA_PROVINCES : US_STATES;
  const stateLabel = country === "Canada" ? "Province / Territory" : "State / Region";

  function updateLocation(updates) {
    const next = { ...form, ...updates };
    next.location = [next.business_city, next.business_state, next.business_country]
      .filter(Boolean).join(", ");
    setForm(next);
  }

  function handleCountryChange(val) {
    updateLocation({ business_country: val, business_state: "" });
  }

  return (
    <div className="space-y-4">
      {/* Row 1: Country */}
      <div>
        <Label>Country</Label>
        <select
          value={form.business_country || ""}
          onChange={e => handleCountryChange(e.target.value)}
          className="w-full border px-3 py-2.5 text-sm focus:outline-none"
          style={INPUT_STYLE}
        >
          <option value="">Select country…</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Row 2: Street Address 1 */}
      <div>
        <Label>Street Address</Label>
        <input
          value={form.business_address_1 || ""}
          onChange={e => setForm(f => ({ ...f, business_address_1: e.target.value }))}
          placeholder="e.g. 123 Maple Street"
          className="w-full border px-3 py-2.5 text-sm focus:outline-none"
          style={INPUT_STYLE}
        />
      </div>

      {/* Row 3: Street Address 2 */}
      <div>
        <Label>Suite / Unit / Apt <span className="font-normal" style={{ color: "#AAAAAA" }}>(optional)</span></Label>
        <input
          value={form.business_address_2 || ""}
          onChange={e => setForm(f => ({ ...f, business_address_2: e.target.value }))}
          placeholder="e.g. Suite 4B"
          className="w-full border px-3 py-2.5 text-sm focus:outline-none"
          style={INPUT_STYLE}
        />
      </div>

      {/* Row 4: City / State / Postal */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <Label>City</Label>
          <input
            value={form.business_city || ""}
            onChange={e => updateLocation({ business_city: e.target.value })}
            placeholder="e.g. Asheville"
            className="w-full border px-3 py-2.5 text-sm focus:outline-none"
            style={INPUT_STYLE}
          />
        </div>

        <div>
          <Label>{stateLabel}</Label>
          {showStateDropdown ? (
            <select
              value={form.business_state || ""}
              onChange={e => updateLocation({ business_state: e.target.value })}
              className="w-full border px-3 py-2.5 text-sm focus:outline-none"
              style={INPUT_STYLE}
            >
              <option value="">Select…</option>
              {stateOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <input
              value={form.business_state || ""}
              onChange={e => updateLocation({ business_state: e.target.value })}
              placeholder="e.g. Bavaria"
              className="w-full border px-3 py-2.5 text-sm focus:outline-none"
              style={INPUT_STYLE}
            />
          )}
        </div>

        <div>
          <Label>Zip / Postal Code</Label>
          <input
            value={form.business_postal_code || ""}
            onChange={e => setForm(f => ({ ...f, business_postal_code: e.target.value }))}
            placeholder="e.g. 28801"
            className="w-full border px-3 py-2.5 text-sm focus:outline-none"
            style={INPUT_STYLE}
          />
        </div>
      </div>
    </div>
  );
}