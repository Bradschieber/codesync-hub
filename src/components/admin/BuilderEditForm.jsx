import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Save } from "lucide-react";

const NAVY = "#2F3E55";
const LABEL = "#7A7A7A";

const inputClass = "w-full px-3 py-2 text-sm border rounded-md outline-none focus:ring-2 transition-all";
const inputStyle = { borderColor: "#D6D3CE", color: "#1A1A1A" };

function EditField({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wide mb-1" style={{ color: LABEL }}>{label}</label>
      {type === "textarea" ? (
        <textarea
          value={value ?? ""}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={inputClass}
          style={inputStyle}
        />
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={e => onChange(type === "number" ? (e.target.value ? Number(e.target.value) : null) : e.target.value)}
          placeholder={placeholder}
          className={inputClass}
          style={inputStyle}
        />
      )}
    </div>
  );
}

function EditGroup({ title, children }) {
  return (
    <div className="border-b px-6 py-5" style={{ borderColor: "#F0EDE8" }}>
      <h3 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: NAVY }}>{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">{children}</div>
    </div>
  );
}

function ToggleField({ label, checked, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-green-500" : "bg-gray-300"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
      <span className="text-sm" style={{ color: "#1A1A1A" }}>{label}</span>
    </div>
  );
}

export default function BuilderEditForm({ builder, onSaved, onCancel }) {
  const [form, setForm] = useState({ ...builder });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function setField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const updates = {
        email: form.email,
        phone: form.phone,
        display_name: form.display_name,
        first_name: form.first_name,
        last_name: form.last_name,
        bio: form.bio,
        tag_line: form.tag_line,
        business_name: form.business_name,
        slug: form.slug,
        years_experience: form.years_experience,
        typical_build_time: form.typical_build_time,
        website_url: form.website_url,
        instagram_url: form.instagram_url,
        facebook_url: form.facebook_url,
        x_url: form.x_url,
        location: form.location,
        business_address_1: form.business_address_1,
        business_city: form.business_city,
        business_state: form.business_state,
        business_postal_code: form.business_postal_code,
        business_country: form.business_country,
        is_approved: form.is_approved,
        is_verified: form.is_verified,
        is_featured: form.is_featured,
        founding_builder: form.founding_builder,
      };
      const updated = await base44.entities.UserProfile.update(builder.id, updates);
      onSaved(updated);
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || "Failed to save. Please try again.");
    }
    setSaving(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Editable Sections */}
      <div className="flex-1">
        <EditGroup title="Contact Information">
          <EditField label="Email" value={form.email} onChange={v => setField("email", v)} />
          <EditField label="Phone" value={form.phone} onChange={v => setField("phone", v)} />
          <EditField label="Display Name" value={form.display_name} onChange={v => setField("display_name", v)} />
          <EditField label="First Name" value={form.first_name} onChange={v => setField("first_name", v)} />
          <EditField label="Last Name" value={form.last_name} onChange={v => setField("last_name", v)} />
          <div className="sm:col-span-2">
            <EditField label="Bio" value={form.bio} onChange={v => setField("bio", v)} type="textarea" />
          </div>
          <EditField label="Tag Line" value={form.tag_line} onChange={v => setField("tag_line", v)} />
        </EditGroup>

        <EditGroup title="Business Details">
          <EditField label="Business Name" value={form.business_name} onChange={v => setField("business_name", v)} />
          <EditField label="Slug" value={form.slug} onChange={v => setField("slug", v)} />
          <EditField label="Years of Experience" value={form.years_experience} onChange={v => setField("years_experience", v)} type="number" />
          <EditField label="Typical Build Time" value={form.typical_build_time} onChange={v => setField("typical_build_time", v)} />
        </EditGroup>

        <EditGroup title="Website & Social">
          <EditField label="Website URL" value={form.website_url} onChange={v => setField("website_url", v)} placeholder="https://..." />
          <EditField label="Instagram URL" value={form.instagram_url} onChange={v => setField("instagram_url", v)} placeholder="https://www.instagram.com/..." />
          <EditField label="Facebook URL" value={form.facebook_url} onChange={v => setField("facebook_url", v)} placeholder="https://www.facebook.com/..." />
          <EditField label="X (Twitter) URL" value={form.x_url} onChange={v => setField("x_url", v)} placeholder="https://twitter.com/..." />
        </EditGroup>

        <EditGroup title="Location">
          <EditField label="Location (Display)" value={form.location} onChange={v => setField("location", v)} />
          <EditField label="Business Address" value={form.business_address_1} onChange={v => setField("business_address_1", v)} />
          <EditField label="City" value={form.business_city} onChange={v => setField("business_city", v)} />
          <EditField label="State / Province" value={form.business_state} onChange={v => setField("business_state", v)} />
          <EditField label="Postal Code" value={form.business_postal_code} onChange={v => setField("business_postal_code", v)} />
          <EditField label="Country" value={form.business_country} onChange={v => setField("business_country", v)} />
        </EditGroup>

        <EditGroup title="Status & Flags">
          <ToggleField label="Approved" checked={!!form.is_approved} onChange={v => setField("is_approved", v)} />
          <ToggleField label="Verified" checked={!!form.is_verified} onChange={v => setField("is_verified", v)} />
          <ToggleField label="Featured Builder" checked={!!form.is_featured} onChange={v => setField("is_featured", v)} />
          <ToggleField label="Founding Builder" checked={!!form.founding_builder} onChange={v => setField("founding_builder", v)} />
        </EditGroup>
      </div>

      {error && (
        <div className="px-6 py-3 text-sm text-red-600 bg-red-50 border-t border-red-100">{error}</div>
      )}

      {/* Sticky Save Bar */}
      <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-end gap-3" style={{ borderColor: "#E0DDD8" }}>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium border rounded-md transition-colors hover:bg-gray-50"
          style={{ color: NAVY, borderColor: "#D6D3CE" }}
          disabled={saving}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-md transition-colors disabled:opacity-60"
          style={{ backgroundColor: NAVY }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}