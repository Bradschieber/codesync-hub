import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Send, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const NAVY = "#1B2B4B";

export default function RequestMessageModal({ request, profile, user, onClose, onStatusUpdated }) {
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => { loadMessages(); }, [request.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages() {
    setLoading(true);
    const msgs = await base44.entities.Message.filter({ linked_request_id: request.id }, "created_date", 100);
    setMessages(msgs);
    setLoading(false);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);

    // If this is the builder's first message and request is pending, move to in_discussion
    const isFirstBuilderMessage = !messages.some(m => m.sender_id === profile.id);
    if (isFirstBuilderMessage && ["pending"].includes(request.status)) {
      await base44.entities.CustomBuildRequest.update(request.id, { status: "in_discussion" });
      onStatusUpdated?.("in_discussion");
    }

    const msg = await base44.entities.Message.create({
      sender_id: profile.id,
      sender_name: profile.business_name || profile.display_name,
      recipient_id: request.buyer_user_id || request.customer_email,
      recipient_name: request.customer_name,
      subject: `Custom Build: ${request.build_type || "Your Request"}`,
      body: body.trim(),
      thread_type: "custom_build_request",
      linked_request_id: request.id,
      thread_id: request.id,
    });

    // Also email the buyer
    await base44.integrations.Core.SendEmail({
      from_name: "Stringed Collective",
      to: request.customer_email,
      subject: `Message from ${profile.business_name || profile.display_name} — Custom Build Discussion`,
      body: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #FDFBF8; color: #1B2B4B;">
  <div style="margin-bottom: 20px;"><span style="font-weight: 700;">Stringed</span><span style="letter-spacing: 0.1em;"> Collective</span></div>
  <h2 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 12px;">Message from ${profile.business_name || profile.display_name}</h2>
  <p style="color: #4A5568; margin-bottom: 12px;">Hi ${request.customer_name || "there"},</p>
  <div style="background: #F7F6F3; border-left: 4px solid #C57A1F; padding: 16px; border-radius: 4px; margin-bottom: 20px;">
    <p style="margin: 0; color: #1A1A1A;">${body.trim()}</p>
  </div>
  <p style="color: #4A5568; font-size: 0.9rem;">Log in to your Stringed Collective account to view your custom build request and reply through the platform.</p>
  <p style="color: #9CA3AF; font-size: 0.8rem; margin-top: 32px; border-top: 1px solid #E5E7EB; padding-top: 16px;">— The Stringed Collective Team</p>
</div>`
    });

    setMessages(prev => [...prev, msg]);
    setBody("");
    setSending(false);
  }

  const builderName = profile.business_name || profile.display_name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col" style={{ maxHeight: "80vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" style={{ color: NAVY }} />
              <h3 className="text-base font-bold text-stone-800">Message {request.customer_name}</h3>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">Re: {request.build_type || "Custom Build Request"}</p>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-10 h-10 text-stone-200 mx-auto mb-2" />
              <p className="text-sm text-stone-400">No messages yet. Start the conversation.</p>
            </div>
          ) : (
            messages.map(msg => {
              const isBuilder = msg.sender_id === profile.id;
              return (
                <div key={msg.id} className={`flex ${isBuilder ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm ${isBuilder ? "text-white" : "bg-stone-100 text-stone-800"}`}
                    style={isBuilder ? { backgroundColor: NAVY } : {}}>
                    {!isBuilder && (
                      <p className="text-xs font-semibold mb-1" style={{ color: "#C57A1F" }}>{msg.sender_name}</p>
                    )}
                    <p className="leading-relaxed">{msg.body}</p>
                    <p className={`text-xs mt-1 ${isBuilder ? "text-blue-200" : "text-stone-400"}`}>
                      {msg.created_date ? formatDistanceToNow(new Date(msg.created_date), { addSuffix: true }) : ""}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-stone-200 flex-shrink-0">
          <div className="flex gap-2">
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
              rows={2}
              placeholder="Type your message… (Enter to send)"
              className="flex-1 border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
            <button
              type="submit"
              disabled={sending || !body.trim()}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-white transition-colors disabled:opacity-50 self-end"
              style={{ backgroundColor: NAVY }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-stone-400 mt-1.5">The buyer will receive an email notification. Sending a first message moves this request to "In Discussion".</p>
        </form>
      </div>
    </div>
  );
}