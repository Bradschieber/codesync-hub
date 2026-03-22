import { useState } from "react";

const COVERAGE_DURATIONS = [
  "Not covered", "30 days", "90 days", "6 months", "1 year", "2 years", "5 years", "Lifetime"
];
const PRESET_COVERAGE = [
  "Structural defects", "Workmanship", "Electronics", "Hardware", "Finish defects", "Fretwork"
];
const PRESET_EXCLUSIONS = [
  "Normal wear and tear", "Abuse or neglect", "Unauthorized modifications",
  "Accidental damage", "Environmental damage (humidity, heat)", "Strings & consumables"
];
const SHIPPING_CARRIERS = ["UPS", "FedEx", "USPS", "DHL"];

const FIELD_STYLE = "w-full border px-3 py-2 text-sm focus:outline-none bg-white";
const BORDER = { borderColor: "#DEDBD6" };
const LABEL_STYLE = "block text-xs font-medium mb-1";
const LABEL_COLOR = { color: "#5A5A5A" };
const SECTION_HELPER = { color: "#9A9A9A" };

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-bold uppercase tracking-wider mt-5 mb-3 pb-1" style={{ color: "#7A7A7A", borderBottom: "1px solid #ECEAE5" }}>
      {children}
    </p>
  );
}

function SelectField({ label, value, onChange, options, placeholder = "Select..." }) {
  return (
    <div>
      <label className={LABEL_STYLE} style={LABEL_COLOR}>{label}</label>
      <select
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        className={FIELD_STYLE}
        style={BORDER}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </div>
  );
}

function CheckboxGroup({ label, values = [], options, onChange }) {
  function toggle(opt) {
    const next = values.includes(opt) ? values.filter(v => v !== opt) : [...values, opt];
    onChange(next);
  }
  return (
    <div>
      {label && <label className={LABEL_STYLE} style={LABEL_COLOR}>{label}</label>}
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => toggle(opt)}
            className="text-xs px-3 py-1.5 border transition-colors"
            style={{
              borderColor: values.includes(opt) ? "#2F3E55" : "#DEDBD6",
              backgroundColor: values.includes(opt) ? "#2F3E55" : "#FAFAF8",
              color: values.includes(opt) ? "#FFFFFF" : "#5A5A5A",
            }}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PoliciesEditor({ form, setForm }) {
  const [newCoverageItem, setNewCoverageItem] = useState("");
  const [newExclusionItem, setNewExclusionItem] = useState("");

  function set(key, val) { setForm({ ...form, [key]: val }); }

  const coverageItems = (() => {
    const raw = form.warranty_coverage || [];
    if (raw.length === 0) return PRESET_COVERAGE.map(label => ({ label, duration: "" }));
    if (typeof raw[0] === "string") return raw.map(label => ({ label, duration: "" }));
    return raw;
  })();

  function setCoverageDuration(label, duration) {
    const updated = coverageItems.map(item => item.label === label ? { ...item, duration } : item);
    set("warranty_coverage", updated);
  }

  function addCoverageItem() {
    const trimmed = newCoverageItem.trim();
    if (!trimmed || coverageItems.find(i => i.label === trimmed)) return;
    set("warranty_coverage", [...coverageItems, { label: trimmed, duration: "" }]);
    setNewCoverageItem("");
  }

  function removeCoverageItem(label) {
    set("warranty_coverage", coverageItems.filter(i => i.label !== label));
  }

  // exclusions = items actively excluded (default = all presets)
  const exclusions = (() => {
    const raw = form.warranty_exclusions;
    if (!raw) return [...PRESET_EXCLUSIONS];
    return raw;
  })();

  function toggleExclusion(item) {
    const next = exclusions.includes(item) ? exclusions.filter(e => e !== item) : [...exclusions, item];
    set("warranty_exclusions", next);
  }

  function addExclusionItem() {
    const trimmed = newExclusionItem.trim();
    if (!trimmed || exclusions.includes(trimmed)) return;
    set("warranty_exclusions", [...exclusions, trimmed]);
    setNewExclusionItem("");
  }

  function removeExclusionItem(item) {
    set("warranty_exclusions", exclusions.filter(e => e !== item));
  }

  const allExclusions = [...new Set([...PRESET_EXCLUSIONS, ...exclusions])];

  return (
    <div className="space-y-6 mt-4">

      {/* ── Pricing & Deposit ── */}
      <div className="border p-5" style={{ borderColor: "#E3E0D8", backgroundColor: "#FFFFFF" }}>
        <h3 className="text-sm font-bold mb-1" style={{ color: "#1A1A1A" }}>Payment</h3>
        <p className="text-xs mb-4" style={SECTION_HELPER}>These terms help buyers understand how payment works before they commit.</p>

        {form.offers_custom_builds && (
          <>
            <div className="flex items-start gap-3 mb-5">
              <input
                type="checkbox"
                id="deposit_required"
                checked={form.deposit_required || false}
                onChange={e => set("deposit_required", e.target.checked)}
                className="h-4 w-4 mt-0.5 flex-shrink-0"
                style={{ accentColor: "#2F3E55" }}
              />
              <div>
                <label htmlFor="deposit_required" className="text-sm font-semibold cursor-pointer" style={{ color: "#1A1A1A" }}>Deposit required</label>
                <p className="text-xs mt-0.5" style={SECTION_HELPER}>Require a deposit to secure a build slot before work begins.</p>
              </div>
            </div>

            {form.deposit_required && (
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={LABEL_STYLE} style={LABEL_COLOR}>Deposit type</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => set("deposit_type", "percent")}
                      className="flex-1 text-xs py-2 border transition-colors"
                      style={{
                        borderColor: (!form.deposit_type || form.deposit_type === "percent") ? "#2F3E55" : "#DEDBD6",
                        backgroundColor: (!form.deposit_type || form.deposit_type === "percent") ? "#2F3E55" : "#FAFAF8",
                        color: (!form.deposit_type || form.deposit_type === "percent") ? "#FFFFFF" : "#5A5A5A",
                      }}>
                      % of price
                    </button>
                    <button type="button" onClick={() => set("deposit_type", "fixed")}
                      className="flex-1 text-xs py-2 border transition-colors"
                      style={{
                        borderColor: form.deposit_type === "fixed" ? "#2F3E55" : "#DEDBD6",
                        backgroundColor: form.deposit_type === "fixed" ? "#2F3E55" : "#FAFAF8",
                        color: form.deposit_type === "fixed" ? "#FFFFFF" : "#5A5A5A",
                      }}>
                      Fixed $ amount
                    </button>
                  </div>
                </div>
                <div>
                  {(!form.deposit_type || form.deposit_type === "percent") ? (
                    <>
                      <label className={LABEL_STYLE} style={LABEL_COLOR}>Deposit percentage (%)</label>
                      <input
                        type="number" min="1" max="100"
                        value={form.deposit_percent || ""}
                        onChange={e => set("deposit_percent", e.target.value ? Number(e.target.value) : "")}
                        placeholder="e.g. 50"
                        className={FIELD_STYLE}
                        style={BORDER}
                      />
                    </>
                  ) : (
                    <>
                      <label className={LABEL_STYLE} style={LABEL_COLOR}>Deposit amount ($)</label>
                      <input
                        type="number" min="0"
                        value={form.deposit_fixed_amount || ""}
                        onChange={e => set("deposit_fixed_amount", e.target.value ? Number(e.target.value) : "")}
                        placeholder="e.g. 500"
                        className={FIELD_STYLE}
                        style={BORDER}
                      />
                    </>
                  )}
                </div>
                <SelectField
                  label="Is the deposit refundable?"
                  value={form.deposit_refundable}
                  onChange={v => set("deposit_refundable", v)}
                  options={[
                    { value: "yes", label: "Yes — fully refundable" },
                    { value: "partial", label: "Partial refund" },
                    { value: "no", label: "Non-refundable" },
                  ]}
                />
              </div>
            )}
          </>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <SelectField
            label="Payment schedule"
            value={form.payment_schedule}
            onChange={v => set("payment_schedule", v)}
            options={[
              { value: "full_upfront", label: "Full payment upfront" },
              { value: "deposit_then_completion", label: "Deposit & balance on completion" },
            ]}
          />
        </div>

        <div className="mt-4">
          <label className={LABEL_STYLE} style={LABEL_COLOR}>Additional pricing notes</label>
          <textarea
            rows={2}
            value={form.pricing_notes || ""}
            onChange={e => set("pricing_notes", e.target.value)}
            placeholder="Share anything buyers should know upfront, such as what is included in the price, upgrade options, or how final pricing is confirmed."
            className="w-full border px-3 py-2 text-sm focus:outline-none resize-none"
            style={{ ...BORDER, backgroundColor: "#FFFFFF" }}
          />
        </div>
      </div>

      {/* ── Warranty ── */}
      <div className="border p-5" style={{ borderColor: "#E3E0D8", backgroundColor: "#FFFFFF" }}>
        <h3 className="text-sm font-bold mb-1" style={{ color: "#1A1A1A" }}>Warranty</h3>
        <p className="text-xs mb-4" style={SECTION_HELPER}>Let buyers know what your warranty covers, and for how long. Different categories can have different coverage periods.</p>

        <SectionLabel>What's covered — and for how long</SectionLabel>
        <div className="space-y-2 mb-3">
          {coverageItems.map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="flex-1 text-xs" style={{ color: "#3A3A3A" }}>{item.label}</span>
              <select
                value={item.duration || ""}
                onChange={e => setCoverageDuration(item.label, e.target.value)}
                className="border px-2 py-1.5 text-xs focus:outline-none bg-white w-36"
                style={BORDER}
              >
                <option value="">Select...</option>
                {COVERAGE_DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {!PRESET_COVERAGE.includes(item.label) && (
                <button type="button" onClick={() => removeCoverageItem(item.label)} className="text-gray-300 hover:text-red-400 transition-colors text-xs font-bold leading-none">✕</button>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCoverageItem}
            onChange={e => setNewCoverageItem(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCoverageItem())}
            placeholder="Add another covered item"
            className="flex-1 border border-dashed px-3 py-1.5 text-xs focus:outline-none bg-white"
            style={{ borderColor: "#C8C4BC" }}
          />
          <button type="button" onClick={addCoverageItem} className="text-xs font-semibold px-3 py-1.5 border transition-colors bg-white" style={{ borderColor: "#DEDBD6", color: "#5A5A5A" }}>Add</button>
        </div>

        <SectionLabel>Exclusions</SectionLabel>
        <p className="text-xs mb-3" style={SECTION_HELPER}>Standard exclusions are active by default. Remove any that don't apply, or add your own.</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {allExclusions.map(item => {
            const active = exclusions.includes(item);
            return (
              <div key={item} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggleExclusion(item)}
                  className="text-xs px-3 py-1.5 border transition-colors"
                  style={{
                    borderColor: active ? "#5A5A5A" : "#DEDBD6",
                    backgroundColor: active ? "#ECEAE5" : "#FFFFFF",
                    color: active ? "#2A2A2A" : "#5A5A5A",
                    fontWeight: active ? 500 : 400,
                    textDecoration: active ? "none" : "none",
                    opacity: active ? 1 : 0.5,
                  }}
                >
                  {item}
                </button>
                {!PRESET_EXCLUSIONS.includes(item) && (
                  <button type="button" onClick={() => removeExclusionItem(item)} className="text-gray-300 hover:text-red-400 transition-colors text-xs leading-none -ml-1">✕</button>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newExclusionItem}
            onChange={e => setNewExclusionItem(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addExclusionItem())}
            placeholder="Add another exclusion"
            className="flex-1 border border-dashed px-3 py-1.5 text-xs focus:outline-none bg-white"
            style={{ borderColor: "#C8C4BC" }}
          />
          <button type="button" onClick={addExclusionItem} className="text-xs font-semibold px-3 py-1.5 border transition-colors bg-white" style={{ borderColor: "#DEDBD6", color: "#5A5A5A" }}>Add</button>
        </div>

        <SectionLabel>Claim process</SectionLabel>
        <div>
          <label className={LABEL_STYLE} style={LABEL_COLOR}>How should a buyer start a warranty claim?</label>
          <textarea
            rows={2}
            value={form.warranty_claim_process || ""}
            onChange={e => set("warranty_claim_process", e.target.value)}
            placeholder="Example: Contact us by email with photos, order details, and a description of the issue."
            className="w-full border px-3 py-2 text-sm focus:outline-none resize-none"
            style={{ ...BORDER, backgroundColor: "#FFFFFF" }}
          />
        </div>
      </div>

      {/* ── Returns ── */}
      <div className="border p-5" style={{ borderColor: "#E3E0D8", backgroundColor: "#FFFFFF" }}>
        <h3 className="text-sm font-bold mb-1" style={{ color: "#1A1A1A" }}>Returns</h3>
        <p className="text-xs mb-4" style={SECTION_HELPER}>If you accept returns, set the terms clearly so buyers know what qualifies and what to expect.</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <SelectField
            label="Do you accept returns?"
            value={form.returns_accepted}
            onChange={v => set("returns_accepted", v)}
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
              { value: "case_by_case", label: "Case-by-case" },
            ]}
          />
          {form.returns_accepted === "yes" && (
            <SelectField
              label="Return window"
              value={form.return_window_days}
              onChange={v => set("return_window_days", Number(v))}
              options={[
                { value: 3, label: "3 days" },
                { value: 7, label: "7 days" },
                { value: 14, label: "14 days" },
                { value: 30, label: "30 days" },
                { value: 60, label: "60 days" },
              ]}
            />
          )}
          {form.returns_accepted !== "no" && (
            <>
              <SelectField
                label="Return shipping paid by"
                value={form.return_shipping_paid_by}
                onChange={v => set("return_shipping_paid_by", v)}
                options={[
                  { value: "buyer", label: "Buyer" },
                  { value: "seller", label: "Seller (me)" },
                  { value: "negotiable", label: "Negotiable" },
                ]}
              />
              <div>
                <label className={LABEL_STYLE} style={LABEL_COLOR}>Restocking fee (%)</label>
                <input
                  type="number" min="0" max="100"
                  value={form.return_restocking_fee_percent || ""}
                  onChange={e => set("return_restocking_fee_percent", e.target.value ? Number(e.target.value) : "")}
                  placeholder="0 = no fee"
                  className={FIELD_STYLE}
                  style={BORDER}
                />
              </div>
            </>
          )}
        </div>

        {form.returns_accepted !== "no" && (
          <div className="mt-4">
            <label className={LABEL_STYLE} style={LABEL_COLOR}>Required return condition</label>
            <textarea
              rows={2}
              value={form.return_condition || ""}
              onChange={e => set("return_condition", e.target.value)}
              placeholder="Example: Instrument must be returned in original condition with case, paperwork, and included accessories."
              className="w-full border px-3 py-2 text-sm focus:outline-none resize-none"
              style={{ ...BORDER, backgroundColor: "#FFFFFF" }}
            />
          </div>
        )}
      </div>

      {/* ── Shipping ── */}
      <div className="border p-5" style={{ borderColor: "#E3E0D8", backgroundColor: "#FFFFFF" }}>
        <h3 className="text-sm font-bold mb-1" style={{ color: "#1A1A1A" }}>Shipping</h3>
        <p className="text-xs mb-4" style={SECTION_HELPER}>Shipping details help buyers understand how instruments are packed, shipped, and insured.</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="ships_dom" checked={form.ships_domestically ?? true} onChange={e => set("ships_domestically", e.target.checked)} className="h-4 w-4 flex-shrink-0" style={{ accentColor: "#2F3E55" }} />
            <label htmlFor="ships_dom" className="text-sm cursor-pointer" style={{ color: "#1A1A1A" }}>Ships domestically</label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="ships_intl" checked={form.ships_internationally || false} onChange={e => set("ships_internationally", e.target.checked)} className="h-4 w-4 flex-shrink-0" style={{ accentColor: "#2F3E55" }} />
            <label htmlFor="ships_intl" className="text-sm cursor-pointer" style={{ color: "#1A1A1A" }}>Ships internationally</label>
          </div>
          <SelectField
            label="Shipping insurance"
            value={form.shipping_insurance_included}
            onChange={v => set("shipping_insurance_included", v)}
            options={[
              { value: "yes", label: "Always included" },
              { value: "optional", label: "Optional (buyer pays)" },
              { value: "no", label: "Not offered" },
            ]}
          />
          <div>
            <label className={LABEL_STYLE} style={LABEL_COLOR}>Handling / ship-out timeline</label>
            <input
              value={form.shipping_timeline || ""}
              onChange={e => set("shipping_timeline", e.target.value)}
              placeholder="Example: Ships within 3 business days of cleared payment."
              className={FIELD_STYLE}
              style={BORDER}
            />
          </div>
        </div>

        <SectionLabel>Carriers used</SectionLabel>
        <CheckboxGroup
          values={form.shipping_carriers || []}
          options={SHIPPING_CARRIERS}
          onChange={v => set("shipping_carriers", v)}
        />

        <div className="mt-4">
          <label className={LABEL_STYLE} style={LABEL_COLOR}>Packaging description</label>
          <textarea
            rows={2}
            value={form.shipping_packaging || ""}
            onChange={e => set("shipping_packaging", e.target.value)}
            placeholder="Example: Double-boxed with protective padding and shipped in a fitted hard case."
            className="w-full border px-3 py-2 text-sm focus:outline-none resize-none"
            style={{ ...BORDER, backgroundColor: "#FFFFFF" }}
          />
        </div>
      </div>
    </div>
  );
}