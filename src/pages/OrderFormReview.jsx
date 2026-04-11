import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, CheckCircle, MessageSquare, X, FileText, Loader2, AlertTriangle } from "lucide-react";

const NAVY = "#1B2B4B";
const AMBER = "#C57A1F";

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 pb-1 border-b border-stone-100">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between text-sm py-2 border-b border-stone-50 last:border-0">
      <span className="text-stone-500">{label}</span>
      <span className="font-medium text-stone-800 text-right max-w-xs">{value}</span>
    </div>
  );
}

function SpecRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="text-xs py-1.5 border-b border-stone-50 last:border-0 flex justify-between gap-4">
      <span className="text-stone-500 flex-shrink-0">{label.replace(/([A-Z])/g, ' $1').trim()}</span>
      <span className="font-medium text-stone-800 text-right">{String(value)}</span>
    </div>
  );
}

function RequestChangesModal({ form, user, onClose, onRequested }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    // Update request status to in_discussion
    await base44.entities.CustomBuildRequest.update(form.custom_build_request_id, { status: "in_discussion" });
    // Send a message to the builder
    if (message.trim()) {
      await base44.entities.Message.create({
        sender_id: user.id,
        sender_name: user.full_name,
        recipient_id: form.builder_id,
        recipient_name: form.builder_name,
        subject: `Change Request on Order Form`,
        body: message.trim(),
        thread_type: "custom_build_request",
        linked_request_id: form.custom_build_request_id,
        thread_id: form.custom_build_request_id,
      });
      await base44.integrations.Core.SendEmail({
        from_name: "Stringed Collective",
        to: form.builder_name,
        subject: `${user.full_name} has requested changes to the Order Form`,
        body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #FDFBF8;"><h2>Order Form Change Request</h2><p><strong>${user.full_name}</strong> has reviewed your Custom Build Order Form and is requesting changes.</p><blockquote style="border-left: 4px solid #C57A1F; padding-left: 16px; color: #5A5A5A;">${message}</blockquote><p>Log in to your Builder Dashboard to review the request and create a revised Order Form.</p></div>`
      });
    }
    setSending(false);
    onRequested?.();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-stone-800">Request Changes</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-stone-400" /></button>
        </div>
        <p className="text-sm text-stone-500 mb-4">Describe what you'd like changed. The builder will be notified and can send a revised Order Form.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea rows={4} value={message} onChange={e => setMessage(e.target.value)}
            placeholder="e.g. I'd like to change the body wood to mahogany, and adjust the deposit amount..."
            className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border border-stone-300 py-2.5 rounded-xl text-sm text-stone-600 font-medium">Cancel</button>
            <button type="submit" disabled={sending} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: NAVY }}>{sending ? "Sending..." : "Send Request"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeclineModal({ form, user, onClose, onDeclined }) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleDecline() {
    setSaving(true);
    await base44.entities.CustomBuildOrderForm.update(form.id, {
      status: "declined",
      declined_at: new Date().toISOString(),
      buyer_decline_reason: reason || undefined,
    });
    await base44.entities.CustomBuildRequest.update(form.custom_build_request_id, {
      status: "order_form_declined_by_buyer",
    });
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
            <h3 className="font-bold text-stone-800">Decline Order Form</h3>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-stone-400" /></button>
        </div>
        <p className="text-sm text-stone-500 mb-4">You're declining this Order Form. The builder will be notified.</p>
        <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)}
          placeholder="Optional: let the builder know why you're declining..."
          className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none mb-4" />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-stone-300 py-2.5 rounded-xl text-sm text-stone-600">Cancel</button>
          <button onClick={handleDecline} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50">
            {saving ? "Declining..." : "Decline"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderFormReview() {
  const params = new URLSearchParams(window.location.search);
  const formId = params.get("formId");
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [showChanges, setShowChanges] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [changesRequested, setChangesRequested] = useState(false);

  useEffect(() => { loadData(); }, [formId]);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      if (!formId) { navigate(createPageUrl("Orders")); return; }
      const forms = await base44.entities.CustomBuildOrderForm.filter({ id: formId });
      if (forms.length) setForm(forms[0]);
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  async function handleAccept() {
    setAccepting(true);
    const res = await base44.functions.invoke("acceptCustomBuildOrderForm", { formId });
    if (res.data?.success) {
      setAccepted(true);
      setTimeout(() => navigate(createPageUrl("Orders")), 2500);
    } else {
      alert(res.data?.error || "Failed to accept. Please try again.");
    }
    setAccepting(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
    </div>
  );

  if (!form) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <FileText className="w-16 h-16 text-stone-200 mx-auto mb-4" />
      <p className="text-stone-500">Order Form not found.</p>
      <Link to={createPageUrl("BuyerCustomBuildRequests")} className="text-sm underline mt-3 block" style={{ color: NAVY }}>Back to My Requests</Link>
    </div>
  );

  if (accepted) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-9 h-9 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-stone-800 mb-2">Order Form Accepted!</h2>
      <p className="text-stone-500 mb-2">Your custom order has been created. You'll be redirected to review the Purchase Agreement and pay your deposit.</p>
      <p className="text-xs text-stone-400">Redirecting to your orders…</p>
    </div>
  );

  if (declined) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-xl font-bold text-stone-700 mb-2">Order Form Declined</h2>
      <p className="text-stone-500 mb-4">The builder has been notified.</p>
      <Link to={createPageUrl("BuyerCustomBuildRequests")} className="font-semibold underline text-sm" style={{ color: NAVY }}>Back to My Requests</Link>
    </div>
  );

  if (changesRequested) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <CheckCircle className="w-12 h-12 text-blue-500 mx-auto mb-3" />
      <h2 className="text-xl font-bold text-stone-700 mb-2">Change Request Sent</h2>
      <p className="text-stone-500 mb-4">The builder will review your feedback and may send a revised Order Form.</p>
      <Link to={createPageUrl("BuyerCustomBuildRequests")} className="font-semibold underline text-sm" style={{ color: NAVY }}>Back to My Requests</Link>
    </div>
  );

  const specs = form.specifications || {};
  const specGroups = {
    "General": ["instrumentCategory", "handedness", "numberOfStrings"],
    "Body": ["bodyConstruction", "topWood", "backWood", "middleWood", "topGrainDetails", "bodyDescription"],
    "Finish": ["finishPattern", "color", "finishMaterialsDescription"],
    "Neck & Fretboard": ["scaleLength", "nutWidth", "nutMaterial", "fretboardRadius", "frets", "neckConstruction"],
    "Hardware": ["tuners", "bridge", "tailpiece", "knobs", "otherHardware"],
    "Electronics": ["activePassivePickups", "pickupConfiguration", "preamp"],
    "Case": ["caseIncludes", "caseDescription"],
  };

  const isSent = form.status === "sent";

  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <Link to={createPageUrl("BuyerCustomBuildRequests")} className="inline-flex items-center gap-1 text-sm text-stone-400 hover:text-stone-700 mb-6">
          <ChevronLeft className="w-4 h-4" /> My Custom Build Requests
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${form.status === "sent" ? "bg-amber-100 text-amber-700" : form.status === "accepted" ? "bg-green-100 text-green-700" : form.status === "declined" ? "bg-red-100 text-red-700" : "bg-stone-100 text-stone-600"}`}>
                  {form.status === "sent" ? "Awaiting Your Review" : form.status === "accepted" ? "Accepted" : form.status === "declined" ? "Declined" : form.status}
                </span>
                {form.sent_at && (
                  <span className="text-xs text-stone-400">{new Date(form.sent_at).toLocaleDateString()}</span>
                )}
              </div>
              <h1 className="text-xl font-bold text-stone-900 mb-0.5">{form.title || "Custom Build Order Form"}</h1>
              <p className="text-sm text-stone-500">From <strong>{form.builder_name}</strong></p>
            </div>
            {form.pdf_url && (
              <a href={form.pdf_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 flex-shrink-0">
                <FileText className="w-3.5 h-3.5" /> Download PDF
              </a>
            )}
          </div>

          {form.builder_note && (
            <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-800 mb-1">Note from {form.builder_name}</p>
              <p className="text-sm text-stone-700 leading-relaxed">{form.builder_note}</p>
            </div>
          )}
        </div>

        {/* Action Buttons — top */}
        {isSent && (
          <div className="flex flex-wrap gap-3 mb-5">
            <button onClick={handleAccept} disabled={accepting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: "#27AE60" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#219150"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#27AE60"}>
              <CheckCircle className="w-4 h-4" />
              {accepting ? "Creating Order..." : "Accept Order Form"}
            </button>
            <button onClick={() => setShowChanges(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border border-stone-300 text-stone-700 bg-white hover:bg-stone-50">
              <MessageSquare className="w-4 h-4" /> Request Changes
            </button>
            <button onClick={() => setShowDecline(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border border-red-200 text-red-600 bg-white hover:bg-red-50">
              <X className="w-4 h-4" /> Decline
            </button>
          </div>
        )}

        {isSent && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
            <p className="text-xs text-blue-800">
              <strong>What happens when you accept?</strong> An order will be created. You'll then review a Purchase Agreement and pay your deposit to authorize the build.
            </p>
          </div>
        )}

        {/* Build Summary */}
        {form.build_summary && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-5">
            <Section title="Build Summary">
              <p className="text-sm text-stone-700 leading-relaxed">{form.build_summary}</p>
            </Section>
          </div>
        )}

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-5">
          <Section title="Pricing & Terms">
            <div className="divide-y divide-stone-50">
              <InfoRow label="Total Price" value={form.total_price ? `$${Number(form.total_price).toLocaleString()}` : null} />
              <InfoRow label="Deposit Required" value={form.deposit_amount ? `$${Number(form.deposit_amount).toLocaleString()}` : null} />
              <InfoRow label="Final Balance (at completion)" value={form.final_balance ? `$${Number(form.final_balance).toLocaleString()}` : null} />
              <InfoRow label="Estimated Build Timeline" value={form.estimated_build_timeline} />
              <InfoRow label="Final Payment Due" value={form.payment_due_window_days ? `${form.payment_due_window_days} days after completion` : null} />
              <InfoRow label="Shipping Notes" value={form.shipping_notes} />
            </div>
          </Section>
        </div>

        {/* Specifications */}
        {Object.keys(specs).some(k => specs[k]) && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-5">
            <Section title="Final Build Specifications">
              {Object.entries(specGroups).map(([groupName, keys]) => {
                const groupSpecs = keys.filter(k => specs[k]);
                if (!groupSpecs.length) return null;
                return (
                  <div key={groupName} className="mb-4">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-1">{groupName}</p>
                    {groupSpecs.map(k => <SpecRow key={k} label={k} value={specs[k]} />)}
                  </div>
                );
              })}
            </Section>
          </div>
        )}

        {/* Included / Exclusions */}
        {(form.included_items || form.exclusions_assumptions) && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-5">
            {form.included_items && <Section title="Included Items"><p className="text-sm text-stone-700 leading-relaxed">{form.included_items}</p></Section>}
            {form.exclusions_assumptions && <Section title="Build Scope Notes & Assumptions"><p className="text-sm text-stone-700 leading-relaxed">{form.exclusions_assumptions}</p></Section>}
          </div>
        )}

        {/* Build Reference Images */}
        {form.reference_images?.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-5">
            <Section title="Build Reference Images">
              <p className="text-xs text-stone-400 mb-4">Supporting reference images provided by the builder. These are illustrative only — the official build is defined by the specifications, summary, and pricing above.</p>
              <div className="grid grid-cols-2 gap-3">
                {form.reference_images.map((img, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden border border-stone-200">
                    <img src={img.image_url} alt={img.caption || "Reference image"} className="w-full aspect-square object-cover" />
                    {img.caption && (
                      <p className="text-xs text-stone-500 text-center px-2 py-1.5 bg-stone-50 leading-snug">{img.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* Policies */}
        {(form.policy_deposit_summary || form.policy_return_summary || form.policy_warranty_summary) && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-5">
            <Section title="Builder Policies">
              {form.policy_deposit_summary && <div className="mb-3"><p className="text-xs font-semibold text-stone-500 mb-0.5">Deposit & Cancellation</p><p className="text-sm text-stone-700">{form.policy_deposit_summary}</p></div>}
              {form.policy_return_summary && <div className="mb-3"><p className="text-xs font-semibold text-stone-500 mb-0.5">Returns</p><p className="text-sm text-stone-700">{form.policy_return_summary}</p></div>}
              {form.policy_warranty_summary && <div><p className="text-xs font-semibold text-stone-500 mb-0.5">Warranty</p><p className="text-sm text-stone-700">{form.policy_warranty_summary}</p></div>}
            </Section>
          </div>
        )}

        {/* Legal Notice */}
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-6">
          <p className="text-xs text-stone-500">
            <strong>Important:</strong> This Custom Build Order Form is not yet an active order. A custom order is created only after you accept this form and complete the Purchase Agreement through Stringed Collective.
          </p>
        </div>

        {/* Bottom Actions */}
        {isSent && (
          <div className="flex flex-wrap gap-3">
            <button onClick={handleAccept} disabled={accepting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: "#27AE60" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#219150"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#27AE60"}>
              <CheckCircle className="w-4 h-4" />
              {accepting ? "Creating Order..." : "Accept Order Form"}
            </button>
            <button onClick={() => setShowChanges(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border border-stone-300 text-stone-700 bg-white hover:bg-stone-50">
              <MessageSquare className="w-4 h-4" /> Request Changes
            </button>
            <button onClick={() => setShowDecline(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border border-red-200 text-red-600 bg-white hover:bg-red-50">
              <X className="w-4 h-4" /> Decline
            </button>
          </div>
        )}
      </div>

      {showChanges && (
        <RequestChangesModal form={form} user={user} onClose={() => setShowChanges(false)} onRequested={() => setChangesRequested(true)} />
      )}
      {showDecline && (
        <DeclineModal form={form} user={user} onClose={() => setShowDecline(false)} onDeclined={() => setDeclined(true)} />
      )}
    </div>
  );
}