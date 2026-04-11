import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";
import SpecificationsForm from "../dashboard/SpecificationsForm";

export default function RequestQuoteModal({ builder, user, onClose }) {
  const [builderSpecOptions, setBuilderSpecOptions] = useState(null);

  useEffect(() => {
    async function loadSpecOptions() {
      const listings = await base44.entities.CustomBuildListing.filter({ builder_id: builder.id }, "-created_date", 1);
      if (listings.length > 0) setBuilderSpecOptions(listings[0].available_spec_options || {});
      else setBuilderSpecOptions({});
    }
    loadSpecOptions();
  }, [builder.id]);

  const [form, setForm] = useState({
    customer_name: user?.full_name || "",
    customer_email: user?.email || "",
    customer_phone: "",
    description: "",
    budget_range: "",
    specifications: {},
  });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await base44.entities.CustomBuildRequest.create({
      ...form,
      builder_id: builder.id,
      buyer_user_id: user?.id || "",
    });
    setSaving(false);
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <div>
            <h3 className="text-lg font-bold text-stone-800">Request a Custom Build</h3>
            <p className="text-sm text-stone-500 mt-0.5">from {builder.business_name || builder.display_name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h4 className="text-lg font-bold text-stone-800 mb-2">Request Sent!</h4>
            <p className="text-stone-500 text-sm mb-2">
              {builder.business_name || builder.display_name} will review your request.
            </p>
            <p className="text-stone-400 text-xs mb-6">
              You'll be notified when the builder responds. They may message you to discuss details, or send a Custom Build Order Form for your review.
            </p>
            <button onClick={onClose} className="bg-amber-600 hover:bg-amber-500 text-white font-medium px-8 py-2.5 rounded-xl text-sm">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Contact Info */}
            <div>
              <h4 className="text-sm font-semibold text-stone-700 mb-3">Your Contact Information</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input
                    required
                    value={form.customer_name}
                    onChange={e => setForm({ ...form, customer_name: e.target.value })}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Email <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="email"
                    value={form.customer_email}
                    onChange={e => setForm({ ...form, customer_email: e.target.value })}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Phone (optional)</label>
                  <input
                    value={form.customer_phone}
                    onChange={e => setForm({ ...form, customer_phone: e.target.value })}
                    placeholder="(555) 555-5555"
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Build Details */}
            <div>
              <h4 className="text-sm font-semibold text-stone-700 mb-3">Build Details</h4>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Budget Range</label>
                  <select
                    value={form.budget_range}
                    onChange={e => setForm({ ...form, budget_range: e.target.value })}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  >
                    <option value="">Select a range...</option>
                    <option>Under $1,000</option>
                    <option>$1,000 – $2,500</option>
                    <option>$2,500 – $5,000</option>
                    <option>$5,000 – $10,000</option>
                    <option>$10,000+</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Describe Your Vision</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Tell the builder about your dream instrument — playing style, tone goals, inspiration, reference instruments, anything you have in mind..."
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                />
              </div>
            </div>

            {/* Specifications */}
            <div>
              <h4 className="text-sm font-semibold text-stone-700 mb-1">Specifications <span className="text-stone-400 font-normal">(optional)</span></h4>
              <p className="text-xs text-stone-400 mb-3">Fill in as much or as little as you know. The builder can help you decide on anything you're unsure about.</p>
              <div className="mb-3">
                <label className="block text-xs font-medium text-stone-600 mb-1">Instrument Category <span className="text-red-500">*</span></label>
                <select
                  required
                  value={form.specifications.instrumentCategory || ""}
                  onChange={e => setForm({ ...form, specifications: { ...form.specifications, instrumentCategory: e.target.value } })}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                >
                  <option value="">Select a category...</option>
                  {(builderSpecOptions?.["instrumentCategory"]?.options?.length > 0
                    ? builderSpecOptions["instrumentCategory"].options
                    : ["Electric Guitars", "Electric Bass Guitar", "Acoustic Guitar", "Acoustic Bass Guitar", "Other"]
                  ).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <p className="text-xs text-stone-400 mt-1">Required — unlocks relevant spec fields below (body type, wood options, etc.)</p>
              </div>
              {builderSpecOptions === null ? (
                <div className="text-xs text-stone-400 py-4 text-center">Loading builder's available options...</div>
              ) : form.specifications.instrumentCategory ? (
                <SpecificationsForm
                  specs={form.specifications}
                  onChange={specs => setForm({ ...form, specifications: specs })}
                  builderSpecOptions={builderSpecOptions}
                  hideInstrumentCategory={true}
                />
              ) : (
                <div className="text-xs text-stone-400 py-4 text-center bg-stone-50 rounded-xl border border-stone-200">Select an instrument category above to see relevant specification options.</div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 border border-stone-300 text-stone-600 py-2.5 rounded-xl text-sm font-medium">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50">
                {saving ? "Sending..." : "Submit Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}