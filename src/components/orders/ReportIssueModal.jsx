import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, CheckCircle, X } from "lucide-react";

const ISSUE_TYPES = [
  { value: "item_not_received", label: "Item not received" },
  { value: "builder_delay", label: "Builder delay or nonperformance" },
  { value: "item_not_as_described", label: "Item not as described" },
  { value: "payment_problem", label: "Payment problem" },
  { value: "return_refund_request", label: "Return or refund request" },
  { value: "other", label: "Other" },
];

const NAVY = "#1B2B4B";

export default function ReportIssueModal({ order, user, onClose, onSubmitted }) {
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!issueType || !description.trim()) return;
    setSubmitting(true);
    setError(null);
    const res = await base44.functions.invoke("reportIssue", {
      orderId: order.id,
      issueType,
      description: description.trim(),
    });
    if (res.data?.success) {
      setSubmitted(true);
      onSubmitted?.();
    } else {
      setError(res.data?.error || "Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm" style={{ color: "#1A1A1A" }}>Report an Issue</h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-semibold text-stone-800 mb-1">Issue reported</p>
              <p className="text-sm text-stone-500 leading-relaxed">
                Our team will review your issue and follow up with you. We aim to respond within 1–2 business days.
              </p>
              <button
                onClick={onClose}
                className="mt-5 text-sm font-medium px-5 py-2.5 rounded-lg text-white"
                style={{ backgroundColor: NAVY }}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-stone-500 leading-relaxed">
                Let us know what's going on with order{" "}
                <span className="font-medium text-stone-700">#{order.id.slice(-8).toUpperCase()}</span>.
                We'll review your issue and reach out.
              </p>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-2">What's the issue?</label>
                <div className="space-y-2">
                  {ISSUE_TYPES.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="issueType"
                        value={opt.value}
                        checked={issueType === opt.value}
                        onChange={() => setIssueType(opt.value)}
                        className="w-4 h-4 accent-slate-700"
                      />
                      <span className={`text-sm transition-colors ${issueType === opt.value ? "font-medium text-stone-800" : "text-stone-600 group-hover:text-stone-800"}`}>
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  Describe the issue <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  required
                  placeholder="Please describe what happened in as much detail as possible..."
                  className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
                  style={{ borderColor: "#E3E0D8" }}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border py-2.5 rounded-xl text-sm text-stone-500"
                  style={{ borderColor: "#E3E0D8" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!issueType || !description.trim() || submitting}
                  className="flex-1 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50 transition-opacity"
                  style={{ backgroundColor: NAVY }}
                >
                  {submitting ? "Submitting..." : "Submit Issue"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}