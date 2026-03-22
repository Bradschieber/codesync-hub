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

const SELECT_STYLE = {
  borderColor: "#DEDBD6",
  backgroundColor: "#FFFFFF",
};

export default function LocationFields({ form, setForm }) {
  const country = form.business_country || "";
  const showStateDropdown = country === "United States" || country === "Canada";
  const stateOptions = country === "Canada" ? CA_PROVINCES : US_STATES;

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
    <div className="grid sm:grid-cols-3 gap-4">
      {/* City — free text is fine */}
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: "#5A5A5A" }}>City</label>
        <input
          value={form.business_city || ""}
          onChange={e => updateLocation({ business_city: e.target.value })}
          placeholder="e.g. Asheville"
          className="w-full border px-3 py-2.5 text-sm focus:outline-none"
          style={SELECT_STYLE}
        />
      </div>

      {/* State / Province */}
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: "#5A5A5A" }}>
          {country === "Canada" ? "Province / Territory" : "State / Region"}
        </label>
        {showStateDropdown ? (
          <select
            value={form.business_state || ""}
            onChange={e => updateLocation({ business_state: e.target.value })}
            className="w-full border px-3 py-2.5 text-sm focus:outline-none"
            style={SELECT_STYLE}
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
            style={SELECT_STYLE}
          />
        )}
      </div>

      {/* Country */}
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: "#5A5A5A" }}>Country</label>
        <select
          value={form.business_country || ""}
          onChange={e => handleCountryChange(e.target.value)}
          className="w-full border px-3 py-2.5 text-sm focus:outline-none"
          style={SELECT_STYLE}
        >
          <option value="">Select…</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
}