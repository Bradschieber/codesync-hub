import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, AlertTriangle } from "lucide-react";

export default function DeclineRequestModal({ request, profile, onClose, onDeclined }) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleDecline() {
    setSaving(true);
    await base44.entities.CustomBuildRequest.update(request.id, {
      status: "declined_by_builder",
      builder_response: reason || undefined,
    });

    // Notify buyer by email via a simple message
    if (request.customer_email) {
      await base44.integrations.Core.SendEmail({
        from_name: "Stringed Collective",
        to: request.customer_email,
        subject: `Update on your custom build request — ${profile?.business_name || profile?.display_name}`,
        body: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #FDFBF8; color: #1B2B4B;">
  <div style="margin-bottom: 20px;">
    <span style="font-size: 1.1rem; font-weight: 700;">Stringed</span>
    <span style="font-size: 1.1rem; font-weight: 400; letter-spacing: 0.1em;"> Collective</span>
  </div>
  <h2 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 12px;">Update on Your Custom Build Request</h2>
  <p style="color: #4A5568; margin-bottom: 12px;">Hi ${request.customer_name || "there"},</p>
  <p style="color: #4A5568; margin-bottom: 12px;">Thank you for reaching out to <strong>${profile?.business_name || profile?.display_name}</strong>. Unfortunately, they are unable to take on your custom build request at this time.</p>
  ${reason ? `<div style="background: #F7F6F3; border: 1px solid #E3E0D8; border-radius: 8px; padding: 16px; margin-bottom: 20px;"><p style="margin: 0; font-style: italic; color: #5A5A5A;">"${reason}"</p></div>` : ""}
  <p style="color: #4A5568;">We encourage you to explore other talented builders on Stringed Collective who may be a great fit for your project.</p>
  <p style="color: #9CA3AF; font-size: 0.8rem; margin-top: 32px; border-top: 1px solid #E5E7EB; padding-top: 16px;">— The Stringed Collective Team</p>
</div>`
      });
    }

    setSaving(false);
    onDeclined?.();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-bold text-stone-800">Decline Request</h3>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-stone-600 mb-4">
          You're declining the request from <strong>{request.customer_name}</strong>. They will be notified by email.
        </p>

        <div className="mb-5">
          <label className="block text-xs font-medium text-stone-600 mb-1">
            Reason <span className="text-stone-400 font-normal">(optional — shown to buyer)</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Current schedule is full, not taking requests for this instrument type, etc."
            className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-stone-300 text-stone-600 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDecline}
            disabled={saving}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            {saving ? "Declining..." : "Decline Request"}
          </button>
        </div>
      </div>
    </div>
  );
}