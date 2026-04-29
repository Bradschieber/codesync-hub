import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Truck, Loader2, AlertCircle, CheckCircle2, Package } from "lucide-react";

const NAVY = "#1B2B4B";

export default function ShippingSelector({ cartItems, shippingAddress, onShippingSelected }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ratesData, setRatesData] = useState(null); // { type, rates }
  const [selectedRate, setSelectedRate] = useState(null);
  const prevAddressRef = useRef("");

  const addressComplete =
    shippingAddress.address && shippingAddress.city &&
    shippingAddress.state && shippingAddress.zip && shippingAddress.country;

  useEffect(() => {
    if (!addressComplete) {
      setRatesData(null);
      setSelectedRate(null);
      onShippingSelected(null);
      return;
    }
    const addrKey = JSON.stringify(shippingAddress);
    if (addrKey === prevAddressRef.current) return;
    prevAddressRef.current = addrKey;
    fetchRates();
  }, [shippingAddress]);

  async function fetchRates() {
    if (!cartItems.length) return;
    setLoading(true);
    setError("");
    setRatesData(null);
    setSelectedRate(null);
    onShippingSelected(null);

    try {
      // For V1: single product per cart (single builder checkout enforced at order level)
      const firstItem = cartItems[0];
      const res = await base44.functions.invoke("calculateShippingCost", {
        product_id: firstItem.product_id,
        destination_address: {
          line1: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.zip,
          country: shippingAddress.country || "US",
        },
      });

      const data = res.data;
      if (data.error) {
        setError(data.error);
        return;
      }

      setRatesData(data);

      // Auto-select if only one option (flat rate or single dynamic rate)
      if (data.rates?.length === 1) {
        setSelectedRate(data.rates[0]);
        onShippingSelected(data.rates[0]);
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Could not calculate shipping.");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectRate(rate) {
    setSelectedRate(rate);
    onShippingSelected(rate);
  }

  if (!addressComplete) {
    return (
      <div className="flex items-center gap-2 text-sm text-stone-400 py-2">
        <Truck className="w-4 h-4" />
        <span>Enter your shipping address above to see shipping options.</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-stone-500 py-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Calculating shipping options...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-amber-800">{error}</p>
          <button onClick={fetchRates} className="text-xs text-amber-700 underline mt-1">Try again</button>
        </div>
      </div>
    );
  }

  if (!ratesData) return null;

  const { type, rates } = ratesData;

  return (
    <div className="space-y-2">
      {type === "flat_rate" && rates.length === 1 ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-stone-200 bg-stone-50">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: NAVY }} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-stone-800">{rates[0].service}</p>
            <p className="text-xs text-stone-400">{rates[0].carrier}</p>
          </div>
          <p className="text-sm font-bold" style={{ color: NAVY }}>
            {rates[0].amount === 0 ? "Free" : `$${rates[0].amount.toFixed(2)}`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">Select a shipping option</p>
          {rates.map((rate) => {
            const isSelected = selectedRate?.shippo_rate_object_id === rate.shippo_rate_object_id;
            return (
              <button
                key={rate.shippo_rate_object_id || rate.service}
                onClick={() => handleSelectRate(rate)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all"
                style={{
                  borderColor: isSelected ? NAVY : "#E7E5E4",
                  backgroundColor: isSelected ? "#EEF1F7" : "#FAFAF9",
                }}
              >
                <Package className="w-4 h-4 flex-shrink-0" style={{ color: isSelected ? NAVY : "#A8A29E" }} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-stone-800">{rate.service}</p>
                  <p className="text-xs text-stone-400">
                    {rate.carrier}
                    {rate.estimated_days ? ` · ${rate.estimated_days} day${rate.estimated_days !== 1 ? "s" : ""}` : ""}
                  </p>
                </div>
                <p className="text-sm font-bold" style={{ color: isSelected ? NAVY : "#57534E" }}>
                  ${rate.amount.toFixed(2)}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}