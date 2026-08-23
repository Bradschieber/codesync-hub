import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Send, Loader2 } from "lucide-react";

const NAVY = "#2F3E55";

export default function MessageBuilderModal({ builder, onClose }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  async function handleSend(e) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("adminMessageBuilder", {
        builder_id: builder.id,
        subject: subject.trim(),
        message: message.trim(),
      });
      if (res?.data?.error) {
        setError(res.data.error);
      } else {
        onClose();
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Failed to send message");
    }
    setSending(false);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#E0DDD8" }}>
          <div>
            <h3 className="text-base font-bold" style={{ color: "#1A1A1A" }}>Message Builder</h3>
            <p className="text-xs mt-0.5" style={{ color: "#7A7A7A" }}>
              To: {builder.business_name || builder.display_name} ({builder.email})
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" style={{ color: "#7A7A7A" }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSend} className="px-5 py-4 space-y-4">
          <div className="text-xs p-2.5" style={{ backgroundColor: "#EEF1F7", color: NAVY }}>
            Emails are sent from <strong>brad@stringedcollective.com</strong>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: "#7A7A7A" }}>Subject</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
              className="w-full px-3 py-2 border text-sm focus:outline-none"
              style={{ borderColor: "#DEDBD6" }}
              placeholder="Enter subject..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: "#7A7A7A" }}>Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              rows={6}
              className="w-full px-3 py-2 border text-sm focus:outline-none resize-none"
              style={{ borderColor: "#DEDBD6" }}
              placeholder="Write your message..."
            />
          </div>

          {error && (
            <p className="text-xs p-2.5" style={{ backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
              {error}
            </p>
          )}

          <div className="flex gap-3 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium border transition-colors"
              style={{ borderColor: "#DEDBD6", color: "#4A4A4A" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: NAVY }}
            >
              {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Message</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}