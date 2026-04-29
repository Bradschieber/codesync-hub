import { Truck, Package, Info } from "lucide-react";

const NAVY = "#1B2B4B";

export default function ProductShippingForm({ form, setForm }) {
  const isFlat = form.shipping_option_type === "flat_rate" || !form.shipping_option_type;
  const isDynamic = form.shipping_option_type === "dynamic_rates";

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed" style={{ color: "#7A7A7A" }}>
        Choose how shipping costs are determined for this listing.
      </p>

      {/* Method selector */}
      <div className="grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setForm(f => ({ ...f, shipping_option_type: "flat_rate" }))}
          className="flex items-start gap-3 p-4 border-2 text-left transition-all"
          style={{
            borderColor: isFlat ? NAVY : "#DEDBD6",
            backgroundColor: isFlat ? "#EEF1F7" : "#FAFAFA",
          }}
        >
          <Truck className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: isFlat ? NAVY : "#A8A29E" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: NAVY }}>Flat rate</p>
            <p className="text-xs mt-0.5" style={{ color: "#7A7A7A" }}>You set a single shipping cost for this item.</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setForm(f => ({ ...f, shipping_option_type: "dynamic_rates" }))}
          className="flex items-start gap-3 p-4 border-2 text-left transition-all"
          style={{
            borderColor: isDynamic ? NAVY : "#DEDBD6",
            backgroundColor: isDynamic ? "#EEF1F7" : "#FAFAFA",
          }}
        >
          <Package className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: isDynamic ? NAVY : "#A8A29E" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: NAVY }}>Calculated rates <span className="text-xs font-normal text-amber-700">(recommended)</span></p>
            <p className="text-xs mt-0.5" style={{ color: "#7A7A7A" }}>Live carrier rates shown to buyers at checkout via Shippo.</p>
          </div>
        </button>
      </div>

      {/* Flat rate fields */}
      {isFlat && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6B6B6B" }}>Flat shipping amount (USD)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.flat_shipping_amount || ""}
              onChange={e => setForm(f => ({ ...f, flat_shipping_amount: e.target.value }))}
              className="w-full border pl-7 pr-3 py-2.5 text-sm focus:outline-none"
              style={{ borderColor: "#DEDBD6" }}
              placeholder="0.00 (enter 0 for free shipping)"
            />
          </div>
        </div>
      )}

      {/* Dynamic rate fields */}
      {isDynamic && (
        <div className="space-y-4">
          <div className="flex items-start gap-2 p-3 text-xs rounded-lg" style={{ backgroundColor: "#FFFBF0", border: "1px solid #F0D87A" }}>
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
            <p style={{ color: "#7A5A10" }}>
              Make sure your <strong>shipping origin address</strong> is complete in your builder profile. Buyers will see live carrier rates based on their destination.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6B6B6B" }}>Package dimensions (inches)</label>
            <div className="grid grid-cols-3 gap-2">
              {[["Length", "package_length_in"], ["Width", "package_width_in"], ["Height", "package_height_in"]].map(([label, key]) => (
                <div key={key}>
                  <label className="block text-xs text-stone-400 mb-1">{label}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form[key] || ""}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border px-2 py-2 text-sm focus:outline-none"
                    style={{ borderColor: "#DEDBD6" }}
                    placeholder="in"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6B6B6B" }}>Package weight (lbs)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.package_weight_lb || ""}
              onChange={e => setForm(f => ({ ...f, package_weight_lb: e.target.value }))}
              className="w-full border px-3 py-2.5 text-sm focus:outline-none"
              style={{ borderColor: "#DEDBD6" }}
              placeholder="e.g. 15"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6B6B6B" }}>Customs description <span className="font-normal normal-case">(for international shipments)</span></label>
            <input
              type="text"
              value={form.customs_description || ""}
              onChange={e => setForm(f => ({ ...f, customs_description: e.target.value }))}
              className="w-full border px-3 py-2.5 text-sm focus:outline-none"
              style={{ borderColor: "#DEDBD6" }}
              placeholder="e.g. Handcrafted Electric Guitar"
            />
          </div>
        </div>
      )}
    </div>
  );
}