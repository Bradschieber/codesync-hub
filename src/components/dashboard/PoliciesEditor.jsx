const WARRANTY_DURATIONS = ["6 months", "1 year", "2 years", "5 years", "Lifetime", "Other"];
const WARRANTY_COVERAGE_OPTIONS = ["Structural defects", "Workmanship", "Electronic components", "Hardware", "Finish defects", "Fretwork"];
const WARRANTY_EXCLUSION_OPTIONS = ["Normal wear and tear", "Abuse or neglect", "Unauthorized modifications", "Accidental damage", "Environmental damage (humidity, heat)", "Strings & consumables"];
const SHIPPING_CARRIERS = ["UPS", "FedEx", "USPS", "DHL"];

function SectionLabel({ children }) {
  return <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-5 mb-3 border-b border-gray-100 pb-1">{children}</p>;
}

function SelectField({ label, value, onChange, options, placeholder = "Select..." }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select value={value || ""} onChange={e => onChange(e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
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
      <label className="block text-xs font-medium text-gray-600 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => toggle(opt)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${values.includes(opt) ? "bg-indigo-100 border-indigo-400 text-indigo-800 font-medium" : "bg-white border-gray-300 text-gray-600 hover:border-indigo-400"}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PoliciesEditor({ form, setForm }) {
  function set(key, val) { setForm({ ...form, [key]: val }); }

  return (
    <div className="space-y-6 mt-4">

      {/* ── Pricing & Deposit ── */}
      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
        <h3 className="text-sm font-bold text-gray-700 mb-1">Pricing & Deposit Policy</h3>
        <p className="text-xs text-gray-400 mb-4">These terms are included in purchase contracts to set clear financial expectations for buyers.</p>

        <div className="flex items-start gap-3 mb-4">
          <input type="checkbox" id="deposit_required" checked={form.deposit_required || false} onChange={e => set("deposit_required", e.target.checked)} className="h-4 w-4 accent-indigo-700 rounded mt-0.5" />
          <div>
            <label htmlFor="deposit_required" className="text-sm font-semibold text-gray-700 cursor-pointer">Deposit Required</label>
            <p className="text-xs text-gray-400 mt-0.5">A deposit is required to secure the build or hold an instrument.</p>
          </div>
        </div>

        {form.deposit_required && (
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Deposit Type</label>
              <div className="flex gap-3">
                <button type="button" onClick={() => set("deposit_type", "percent")}
                  className={`flex-1 text-xs py-2 rounded-xl border transition-colors ${(!form.deposit_type || form.deposit_type === "percent") ? "bg-indigo-100 border-indigo-400 text-indigo-800 font-medium" : "bg-white border-gray-300 text-gray-600 hover:border-indigo-400"}`}>
                  % of Price
                </button>
                <button type="button" onClick={() => set("deposit_type", "fixed")}
                  className={`flex-1 text-xs py-2 rounded-xl border transition-colors ${form.deposit_type === "fixed" ? "bg-indigo-100 border-indigo-400 text-indigo-800 font-medium" : "bg-white border-gray-300 text-gray-600 hover:border-indigo-400"}`}>
                  Fixed $ Amount
                </button>
              </div>
            </div>
            <div>
              {(!form.deposit_type || form.deposit_type === "percent") ? (
                <>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Deposit Percentage (%)</label>
                  <input
                    type="number" min="1" max="100"
                    value={form.deposit_percent || ""}
                    onChange={e => set("deposit_percent", e.target.value ? Number(e.target.value) : "")}
                    placeholder="e.g. 50"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </>
              ) : (
                <>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Deposit Amount ($)</label>
                  <input
                    type="number" min="0"
                    value={form.deposit_fixed_amount || ""}
                    onChange={e => set("deposit_fixed_amount", e.target.value ? Number(e.target.value) : "")}
                    placeholder="e.g. 500"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </>
              )}
            </div>
            <SelectField
              label="Deposit Refundable?"
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

        <div className="grid sm:grid-cols-2 gap-4">
          <SelectField
            label="Payment Schedule"
            value={form.payment_schedule}
            onChange={v => set("payment_schedule", v)}
            options={[
              { value: "full_upfront", label: "Full payment upfront" },
              { value: "deposit_then_completion", label: "Deposit + balance at completion" },
              { value: "deposit_milestones_completion", label: "Deposit + milestones + balance" },
              { value: "negotiable", label: "Negotiable" },
            ]}
          />
          <SelectField
            label="Accepted Payment Methods"
            value={form.payment_methods}
            onChange={v => set("payment_methods", v)}
            options={[
              { value: "platform_only", label: "Platform only" },
              { value: "platform_and_check", label: "Platform + check/money order" },
              { value: "platform_and_wire", label: "Platform + bank wire" },
              { value: "all", label: "All methods accepted" },
            ]}
          />
        </div>

        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">Additional Pricing Notes</label>
          <textarea
            rows={2}
            value={form.pricing_notes || ""}
            onChange={e => set("pricing_notes", e.target.value)}
            placeholder="e.g. Price includes setup and basic case. Upgrades available at additional cost. All prices in USD."
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>
      </div>

      {/* ── Warranty ── */}
      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
        <h3 className="text-sm font-bold text-gray-700 mb-1">Warranty Policy</h3>
        <p className="text-xs text-gray-400 mb-3">Clearly defined warranty terms build buyer confidence and are used in purchase contracts.</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <SelectField
            label="Warranty Duration"
            value={form.warranty_duration}
            onChange={v => set("warranty_duration", v)}
            options={WARRANTY_DURATIONS}
          />
        </div>

        <SectionLabel>What's Covered</SectionLabel>
        <CheckboxGroup
          label=""
          values={form.warranty_coverage || []}
          options={WARRANTY_COVERAGE_OPTIONS}
          onChange={v => set("warranty_coverage", v)}
        />

        <SectionLabel>Exclusions</SectionLabel>
        <CheckboxGroup
          label=""
          values={form.warranty_exclusions || []}
          options={WARRANTY_EXCLUSION_OPTIONS}
          onChange={v => set("warranty_exclusions", v)}
        />

        <SectionLabel>Claim Process</SectionLabel>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">How does a buyer make a warranty claim?</label>
          <textarea
            rows={2}
            value={form.warranty_claim_process || ""}
            onChange={e => set("warranty_claim_process", e.target.value)}
            placeholder="e.g. Contact me by email with photos. I'll assess and arrange repair or replacement within 30 days."
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>
      </div>

      {/* ── Returns ── */}
      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
        <h3 className="text-sm font-bold text-gray-700 mb-1">Return Policy</h3>
        <p className="text-xs text-gray-400 mb-3">Used in purchase contracts — clear return terms reduce disputes.</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <SelectField
            label="Returns Accepted?"
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
              label="Return Window"
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
                label="Return Shipping Paid By"
                value={form.return_shipping_paid_by}
                onChange={v => set("return_shipping_paid_by", v)}
                options={[
                  { value: "buyer", label: "Buyer" },
                  { value: "seller", label: "Seller (me)" },
                  { value: "negotiable", label: "Negotiable" },
                ]}
              />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Restocking Fee (%)</label>
                <input
                  type="number" min="0" max="100"
                  value={form.return_restocking_fee_percent || ""}
                  onChange={e => set("return_restocking_fee_percent", e.target.value ? Number(e.target.value) : "")}
                  placeholder="0 = no fee"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </>
          )}
        </div>

        {form.returns_accepted !== "no" && (
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Required Return Condition</label>
            <textarea
              rows={2}
              value={form.return_condition || ""}
              onChange={e => set("return_condition", e.target.value)}
              placeholder="e.g. Must be in original, unplayed condition with original case and all included accessories."
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>
        )}
      </div>

      {/* ── Shipping ── */}
      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
        <h3 className="text-sm font-bold text-gray-700 mb-1">Shipping Policy</h3>
        <p className="text-xs text-gray-400 mb-3">Shipping terms are included in purchase contracts and set buyer expectations.</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="ships_dom" checked={form.ships_domestically ?? true} onChange={e => set("ships_domestically", e.target.checked)} className="h-4 w-4 accent-indigo-700 rounded" />
            <label htmlFor="ships_dom" className="text-sm text-gray-700 cursor-pointer">Ships Domestically</label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="ships_intl" checked={form.ships_internationally || false} onChange={e => set("ships_internationally", e.target.checked)} className="h-4 w-4 accent-indigo-700 rounded" />
            <label htmlFor="ships_intl" className="text-sm text-gray-700 cursor-pointer">Ships Internationally</label>
          </div>
          <SelectField
            label="Shipping Insurance"
            value={form.shipping_insurance_included}
            onChange={v => set("shipping_insurance_included", v)}
            options={[
              { value: "yes", label: "Always included" },
              { value: "optional", label: "Optional (buyer pays)" },
              { value: "no", label: "Not offered" },
            ]}
          />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Handling / Ship-Out Timeline</label>
            <input
              value={form.shipping_timeline || ""}
              onChange={e => set("shipping_timeline", e.target.value)}
              placeholder="e.g. Ships within 3 business days of payment"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        <SectionLabel>Carriers Used</SectionLabel>
        <CheckboxGroup
          label=""
          values={form.shipping_carriers || []}
          options={SHIPPING_CARRIERS}
          onChange={v => set("shipping_carriers", v)}
        />

        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">Packaging Description</label>
          <textarea
            rows={2}
            value={form.shipping_packaging || ""}
            onChange={e => set("shipping_packaging", e.target.value)}
            placeholder="e.g. Instruments are double-boxed with foam padding and suspended in a hard shell case."
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>
      </div>
    </div>
  );
}