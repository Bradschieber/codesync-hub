import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Settings, Save, RefreshCw, CheckCircle } from "lucide-react";

const NAVY = "#2F3E55";

const DEFAULTS = {
  config_key: "default",
  processing_enabled: true,
  background_color: "#F7F5F0",
  shadow_mode: "soft",
  padding_preset: "balanced",
  output_size: 2000,
  output_format: "png",
  min_input_px: 1200,
  notes: "",
};

export default function AdminMarketplaceImageSettings() {
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState(null);
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      if (u.role !== "admin") { setLoading(false); return; }

      const configs = await base44.entities.MarketplaceImageConfig.filter({ config_key: "default" });
      if (configs.length > 0) {
        setConfig(configs[0]);
        setForm({ ...DEFAULTS, ...configs[0] });
      } else {
        setConfig(null);
        setForm(DEFAULTS);
      }
    } catch {
      base44.auth.redirectToLogin();
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (config?.id) {
        await base44.entities.MarketplaceImageConfig.update(config.id, form);
      } else {
        const created = await base44.entities.MarketplaceImageConfig.create(form);
        setConfig(created);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert("Save failed: " + err.message);
    }
    setSaving(false);
  }

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
    </div>
  );

  if (user?.role !== "admin") return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
      <p className="text-gray-500">You don't have permission to view this page.</p>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-12 pb-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Link to={createPageUrl("AdminDashboard")} className="inline-flex items-center gap-1 text-sm mb-5 opacity-60 hover:opacity-100 transition-opacity" style={{ color: NAVY }}>
            <ChevronLeft className="w-4 h-4" /> Admin Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6" style={{ color: NAVY }} strokeWidth={1.5} />
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>Marketplace Image Settings</h1>
          </div>
          <p className="text-sm mt-2" style={{ color: "#5A5A5A" }}>
            Global configuration for the standardized marketplace hero image processing pipeline (Photoroom).
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">

        {/* Master Switch */}
        <div className="bg-white border p-6 mb-4" style={{ borderColor: "#E0DDD8" }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm" style={{ color: "#1A1A1A" }}>Processing Enabled</h3>
              <p className="text-xs mt-1" style={{ color: "#7A7A7A" }}>Master switch. If off, no new processing jobs will be submitted to Photoroom.</p>
            </div>
            <button
              onClick={() => set("processing_enabled", !form.processing_enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              style={{ backgroundColor: form.processing_enabled ? NAVY : "#D1D5DB" }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                style={{ transform: form.processing_enabled ? "translateX(22px)" : "translateX(2px)" }}
              />
            </button>
          </div>
        </div>

        {/* Background Color */}
        <div className="bg-white border p-6 mb-4" style={{ borderColor: "#E0DDD8" }}>
          <h3 className="font-bold text-sm mb-1" style={{ color: "#1A1A1A" }}>Background Color</h3>
          <p className="text-xs mb-4" style={{ color: "#7A7A7A" }}>Hex color for the standard marketplace background. Solid neutrals only.</p>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.background_color}
              onChange={e => set("background_color", e.target.value)}
              className="w-10 h-10 border cursor-pointer"
              style={{ borderColor: "#E0DDD8" }}
            />
            <input
              type="text"
              value={form.background_color}
              onChange={e => set("background_color", e.target.value)}
              className="border px-3 py-2 text-sm font-mono w-32"
              style={{ borderColor: "#E0DDD8" }}
            />
            <div className="w-10 h-10 border" style={{ backgroundColor: form.background_color, borderColor: "#E0DDD8" }} />
          </div>
        </div>

        {/* Shadow Mode */}
        <div className="bg-white border p-6 mb-4" style={{ borderColor: "#E0DDD8" }}>
          <h3 className="font-bold text-sm mb-1" style={{ color: "#1A1A1A" }}>Shadow Mode</h3>
          <p className="text-xs mb-4" style={{ color: "#7A7A7A" }}>Shadow intensity applied to the instrument subject. 'soft' is the standard.</p>
          <div className="flex gap-3">
            {["none", "soft", "medium"].map(v => (
              <button
                key={v}
                onClick={() => set("shadow_mode", v)}
                className="px-4 py-2 text-sm font-medium border transition-colors capitalize"
                style={{
                  borderColor: form.shadow_mode === v ? NAVY : "#E0DDD8",
                  backgroundColor: form.shadow_mode === v ? "#EEF1F7" : "transparent",
                  color: form.shadow_mode === v ? NAVY : "#5A5A5A",
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Padding Preset */}
        <div className="bg-white border p-6 mb-4" style={{ borderColor: "#E0DDD8" }}>
          <h3 className="font-bold text-sm mb-1" style={{ color: "#1A1A1A" }}>Padding Preset</h3>
          <p className="text-xs mb-4" style={{ color: "#7A7A7A" }}>Subject padding within the frame. 'balanced' targets ~15% breathing room on each side.</p>
          <div className="flex gap-3">
            {["tight", "balanced", "generous"].map(v => (
              <button
                key={v}
                onClick={() => set("padding_preset", v)}
                className="px-4 py-2 text-sm font-medium border transition-colors capitalize"
                style={{
                  borderColor: form.padding_preset === v ? NAVY : "#E0DDD8",
                  backgroundColor: form.padding_preset === v ? "#EEF1F7" : "transparent",
                  color: form.padding_preset === v ? NAVY : "#5A5A5A",
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Output Size */}
        <div className="bg-white border p-6 mb-4" style={{ borderColor: "#E0DDD8" }}>
          <h3 className="font-bold text-sm mb-1" style={{ color: "#1A1A1A" }}>Output Size (px)</h3>
          <p className="text-xs mb-4" style={{ color: "#7A7A7A" }}>Square output dimension. Master asset. Default: 2000.</p>
          <div className="flex gap-3">
            {[1000, 1500, 2000, 2500].map(v => (
              <button
                key={v}
                onClick={() => set("output_size", v)}
                className="px-4 py-2 text-sm font-medium border transition-colors"
                style={{
                  borderColor: form.output_size === v ? NAVY : "#E0DDD8",
                  backgroundColor: form.output_size === v ? "#EEF1F7" : "transparent",
                  color: form.output_size === v ? NAVY : "#5A5A5A",
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Output Format */}
        <div className="bg-white border p-6 mb-4" style={{ borderColor: "#E0DDD8" }}>
          <h3 className="font-bold text-sm mb-1" style={{ color: "#1A1A1A" }}>Output Format</h3>
          <p className="text-xs mb-4" style={{ color: "#7A7A7A" }}>PNG preferred for quality. JPG for smaller file sizes.</p>
          <div className="flex gap-3">
            {["png", "jpg"].map(v => (
              <button
                key={v}
                onClick={() => set("output_format", v)}
                className="px-4 py-2 text-sm font-medium border transition-colors uppercase"
                style={{
                  borderColor: form.output_format === v ? NAVY : "#E0DDD8",
                  backgroundColor: form.output_format === v ? "#EEF1F7" : "transparent",
                  color: form.output_format === v ? NAVY : "#5A5A5A",
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Min Input PX */}
        <div className="bg-white border p-6 mb-4" style={{ borderColor: "#E0DDD8" }}>
          <h3 className="font-bold text-sm mb-1" style={{ color: "#1A1A1A" }}>Minimum Input Resolution (px)</h3>
          <p className="text-xs mb-4" style={{ color: "#7A7A7A" }}>Minimum pixel dimension (longest side) to accept without a quality warning.</p>
          <input
            type="number"
            value={form.min_input_px}
            onChange={e => set("min_input_px", Number(e.target.value))}
            className="border px-3 py-2 text-sm w-32"
            style={{ borderColor: "#E0DDD8" }}
            min={400}
            max={4000}
            step={100}
          />
        </div>

        {/* Notes */}
        <div className="bg-white border p-6 mb-6" style={{ borderColor: "#E0DDD8" }}>
          <h3 className="font-bold text-sm mb-1" style={{ color: "#1A1A1A" }}>Internal Notes</h3>
          <p className="text-xs mb-4" style={{ color: "#7A7A7A" }}>Admin-only notes about this configuration.</p>
          <textarea
            value={form.notes || ""}
            onChange={e => set("notes", e.target.value)}
            rows={3}
            className="w-full border px-3 py-2 text-sm resize-none"
            style={{ borderColor: "#E0DDD8" }}
            placeholder="e.g. Updated shadow mode for summer catalog…"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: saved ? "#16A34A" : NAVY }}
        >
          {saving ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</>
          ) : saved ? (
            <><CheckCircle className="w-4 h-4" /> Saved</>
          ) : (
            <><Save className="w-4 h-4" /> Save Configuration</>
          )}
        </button>
      </div>
    </div>
  );
}