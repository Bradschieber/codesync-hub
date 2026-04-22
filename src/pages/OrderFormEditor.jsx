import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Save, Send, ChevronDown, ChevronUp, Loader2, CheckCircle, ImagePlus } from "lucide-react";
import SpecificationsForm from "../components/dashboard/SpecificationsForm";

const NAVY = "#1B2B4B";
const AMBER = "#C57A1F";

function Zone({ title, children, collapsible = false, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden mb-5">
      <button
        type="button"
        onClick={() => collapsible && setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-6 py-4 border-b border-stone-100 ${collapsible ? "hover:bg-stone-50 cursor-pointer" : "cursor-default"}`}
      >
        <h2 className="text-sm font-bold text-stone-800 uppercase tracking-wider">{title}</h2>
        {collapsible && (open ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />)}
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-600 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-stone-400 mt-1">{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input type={type} value={value || ""} onChange={e => onChange(type === "number" ? (e.target.value ? Number(e.target.value) : "") : e.target.value)}
      placeholder={placeholder}
      className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
  );
}

export default function OrderFormEditor() {
  const params = new URLSearchParams(window.location.search);
  const requestId = params.get("requestId");
  const formId = params.get("formId");
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [profile, setProfile] = useState(null);
  const [specOptions, setSpecOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [savedFormId, setSavedFormId] = useState(formId || null);
  const [result, setResult] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    title: "",
    builder_note: "",
    build_summary: "",
    included_items: "",
    exclusions_assumptions: "",
    specifications: {},
    total_price: "",
    deposit_amount: "",
    final_balance: "",
    estimated_build_timeline: "",
    payment_due_window_days: 7,
    shipping_notes: "",
    policy_deposit_summary: "",
    policy_return_summary: "",
    policy_warranty_summary: "",
    reference_images: [],
  });

  useEffect(() => { loadData(); }, [requestId, formId]);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (!profiles.length) { navigate(createPageUrl("Dashboard")); return; }
      const p = profiles[0];
      setProfile(p);

      // Load builder spec options
      const listings = await base44.entities.CustomBuildListing.filter({ builder_id: p.id }, "-created_date", 1);
      if (listings.length) setSpecOptions(listings[0].available_spec_options || {});

      // Load request
      if (requestId) {
        const reqs = await base44.entities.CustomBuildRequest.filter({ id: requestId });
        if (reqs.length) {
          const req = reqs[0];
          setRequest(req);
          // Pre-fill specs from request if no existing form
          if (!formId) {
            setForm(f => ({
              ...f,
              specifications: req.specifications || {},
              // Pre-fill policy summaries from builder profile
              policy_deposit_summary: buildDepositSummary(p),
              policy_return_summary: buildReturnSummary(p),
              policy_warranty_summary: buildWarrantySummary(p),
            }));
          }
        }
      }

      // Load existing draft form
      if (formId) {
        const forms = await base44.entities.CustomBuildOrderForm.filter({ id: formId });
        if (forms.length) {
          const f = forms[0];
          // Merge request specs into draft specs so any fields added after the draft was saved still populate
          let mergedSpecs = f.specifications || {};
          if (requestId) {
            const reqs2 = await base44.entities.CustomBuildRequest.filter({ id: requestId });
            if (reqs2.length) {
              const reqSpecs = reqs2[0].specifications || {};
              // Only fill in missing fields — don't override what the builder has already set
              mergedSpecs = { ...reqSpecs, ...mergedSpecs };
            }
          }
          setForm({
            title: f.title || "",
            builder_note: f.builder_note || "",
            build_summary: f.build_summary || "",
            included_items: f.included_items || "",
            exclusions_assumptions: f.exclusions_assumptions || "",
            specifications: mergedSpecs,
            total_price: f.total_price || "",
            deposit_amount: f.deposit_amount || "",
            final_balance: f.final_balance || "",
            estimated_build_timeline: f.estimated_build_timeline || "",
            payment_due_window_days: f.payment_due_window_days || 7,
            shipping_notes: f.shipping_notes || "",
            policy_deposit_summary: f.policy_deposit_summary || buildDepositSummary(p),
            policy_return_summary: f.policy_return_summary || buildReturnSummary(p),
            policy_warranty_summary: f.policy_warranty_summary || buildWarrantySummary(p),
            reference_images: f.reference_images || [],
          });
        }
      }
    } catch { navigate(createPageUrl("Dashboard")); }
    setLoading(false);
  }

  function buildDepositSummary(p) {
    if (!p.deposit_required) return "No deposit required.";
    const amount = p.deposit_type === "percent" && p.deposit_percent
      ? `${p.deposit_percent}%`
      : p.deposit_fixed_amount ? `$${p.deposit_fixed_amount.toLocaleString()}` : "Required";
    const refundable = p.deposit_refundable === "yes" ? "Refundable" : p.deposit_refundable === "partial" ? "Partially refundable" : "Non-refundable";
    return `${amount} deposit required. ${refundable}.${p.payment_schedule ? " " + p.payment_schedule : ""}`;
  }

  function buildReturnSummary(p) {
    const parts = [];
    if (p.returns_accepted === "yes") parts.push("Returns accepted.");
    else if (p.returns_accepted === "no") parts.push("No returns accepted on custom builds.");
    else if (p.returns_accepted === "case_by_case") parts.push("Returns considered on a case-by-case basis.");
    if (p.return_window_days) parts.push(`Return window: ${p.return_window_days} days from delivery.`);
    if (p.return_condition) parts.push(`Condition: ${p.return_condition}`);
    if (p.return_restocking_fee_percent) parts.push(`Restocking fee: ${p.return_restocking_fee_percent}%.`);
    if (p.return_shipping_paid_by) parts.push(`Return shipping paid by: ${p.return_shipping_paid_by}.`);
    if (p.return_policy) parts.push(p.return_policy);
    return parts.join(" ") || "";
  }

  function buildWarrantySummary(p) {
    const parts = [];
    if (p.warranty_duration) parts.push(`Warranty duration: ${p.warranty_duration}.`);
    if (p.warranty_coverage?.length > 0) {
      const coverageText = p.warranty_coverage.map(c => `${c.label}${c.duration ? ` (${c.duration})` : ""}`).join(", ");
      parts.push(`Coverage: ${coverageText}.`);
    }
    if (p.warranty_policy) parts.push(p.warranty_policy);
    if (p.warranty_exclusions?.length > 0) parts.push(`Exclusions: ${p.warranty_exclusions.join(", ")}.`);
    if (p.warranty_claim_process) parts.push(`Claims: ${p.warranty_claim_process}`);
    return parts.join(" ") || "";
  }

  function updateImage(idx, key, val) {
    const imgs = [...(form.reference_images || [])];
    imgs[idx] = { ...imgs[idx], [key]: val };
    update("reference_images", imgs);
  }
  function moveImage(idx, dir) {
    const imgs = [...(form.reference_images || [])];
    const newIdx = idx + dir;
    [imgs[idx], imgs[newIdx]] = [imgs[newIdx], imgs[idx]];
    update("reference_images", imgs);
  }
  function removeImage(idx) {
    update("reference_images", (form.reference_images || []).filter((_, i) => i !== idx));
  }
  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update("reference_images", [...(form.reference_images || []), { image_url: file_url, caption: "" }]);
    setUploadingImage(false);
    e.target.value = "";
  }

  function update(key, val) {
    setForm(f => ({ ...f, [key]: val }));
    // Auto-calc final balance
    if (key === "total_price" || key === "deposit_amount") {
      const total = key === "total_price" ? Number(val) : Number(form.total_price);
      const deposit = key === "deposit_amount" ? Number(val) : Number(form.deposit_amount);
      if (total && deposit) {
        setForm(f => ({ ...f, [key]: val, final_balance: total - deposit }));
      }
    }
  }

  async function buildPayload(status) {
    return {
      custom_build_request_id: requestId,
      builder_id: profile.id,
      builder_name: profile.business_name || profile.display_name,
      buyer_id: request?.buyer_user_id || "",
      buyer_name: request?.customer_name || "",
      buyer_email: request?.customer_email || "",
      status,
      ...form,
      total_price: form.total_price ? Number(form.total_price) : null,
      deposit_amount: form.deposit_amount ? Number(form.deposit_amount) : null,
      final_balance: form.final_balance ? Number(form.final_balance) : null,
      payment_due_window_days: Number(form.payment_due_window_days) || 7,
    };
  }

  async function handleSaveDraft() {
    setSaving(true);
    setResult(null);
    const payload = await buildPayload("draft");
    let saved;
    if (savedFormId) {
      saved = await base44.entities.CustomBuildOrderForm.update(savedFormId, payload);
    } else {
      saved = await base44.entities.CustomBuildOrderForm.create(payload);
      setSavedFormId(saved.id);
    }
    setSaving(false);
    setResult({ type: "success", msg: "Draft saved. The buyer cannot see this yet." });
  }

  async function handleSendOrderForm() {
    if (!form.total_price) { setResult({ type: "error", msg: "Please enter a total price before sending." }); return; }
    if (!request?.customer_email && !request?.buyer_user_id) {
      setResult({ type: "error", msg: "Missing buyer information. Cannot send." }); return;
    }
    setSending(true);
    setResult(null);
    // Save first (or update)
    const payload = await buildPayload("draft");
    payload.builder_confirmed_at = new Date().toISOString();
    let fId = savedFormId;
    if (fId) {
      await base44.entities.CustomBuildOrderForm.update(fId, payload);
    } else {
      const saved = await base44.entities.CustomBuildOrderForm.create(payload);
      fId = saved.id;
      setSavedFormId(fId);
    }
    // Send
    let res;
    try {
      res = await base44.functions.invoke("sendCustomBuildOrderForm", { orderFormId: fId });
    } catch (err) {
      setResult({ type: "error", msg: err?.response?.data?.error || err?.message || "Failed to send Order Form." });
      setSending(false);
      return;
    }
    if (res.data?.success) {
      setResult({ type: "sent", msg: "Order Form sent! The buyer will receive an email notification." });
    } else {
      setResult({ type: "error", msg: res.data?.error || "Failed to send Order Form." });
    }
    setSending(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8" style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link to={createPageUrl("DashboardCustomBuilds")} className="text-stone-400 hover:text-stone-700">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Custom Build Order Form</h1>
          <p className="text-sm text-stone-400">
            {request ? `For ${request.customer_name} · ${request.customer_email}` : "Create your structured build offer"}
          </p>
        </div>
      </div>

      {/* Top Actions */}
      <div className="flex flex-wrap gap-3 mb-6 pt-2">
        <button onClick={handleSaveDraft} disabled={saving || sending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 transition-colors disabled:opacity-50">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Draft"}
        </button>
        <button onClick={handleSendOrderForm} disabled={saving || sending || result?.type === "sent" || !confirmed}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: result?.type === "sent" ? "#27AE60" : AMBER }}
          onMouseEnter={e => { if (result?.type !== "sent") e.currentTarget.style.backgroundColor = "#a8661a"; }}
          onMouseLeave={e => { if (result?.type !== "sent") e.currentTarget.style.backgroundColor = AMBER; }}>
          {result?.type === "sent" ? <><CheckCircle className="w-4 h-4" /> Sent!</> : <><Send className="w-4 h-4" />{sending ? "Sending..." : "Send Order Form"}</>}
        </button>
      </div>

      {result && result.type !== "sent" && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${result.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-700"}`}>
          {result.msg}
        </div>
      )}
      {result?.type === "sent" && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm border bg-green-50 border-green-200 text-green-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {result.msg}
        </div>
      )}

      {/* Section 1: Order Form Overview */}
      <Zone title="Order Form Overview">
        <div className="space-y-4">
          <Field label="Order Form Title" hint="e.g. '6-String Electric Guitar Build — Ash Body, Maple Neck'">
            <Input value={form.title} onChange={v => update("title", v)} placeholder="Descriptive title for this order form" />
          </Field>
          <Field label="Builder Note" hint="Personal note to the buyer about this build offer">
            <Textarea value={form.builder_note} onChange={v => update("builder_note", v)} placeholder="Share your excitement, approach, or anything you want the buyer to know upfront..." rows={3} />
          </Field>
          <Field label="Build Summary" hint="Summarize the build in plain language so the buyer can quickly understand what you are offering.">
            <Textarea value={form.build_summary} onChange={v => update("build_summary", v)} placeholder="Describe the instrument you're proposing to build..." rows={4} />
          </Field>
          <Field label="Also Included" hint="Use this section for services, extras, or items included beyond the core build specifications.">
            <Textarea value={form.included_items} onChange={v => update("included_items", v)} placeholder="e.g. Professional setup and fret leveling, hardshell case, certificate of authenticity, insured shipping" rows={3} />
          </Field>
          <Field label="Build Scope Notes & Assumptions" hint="Use this section for build-specific notes, assumptions, or scope clarifications related to this custom build. Standard return and warranty terms are covered in the Policy Terms section.">
            <Textarea value={form.exclusions_assumptions} onChange={v => update("exclusions_assumptions", v)} placeholder="Anything not included, assumptions about materials, or conditions that apply..." rows={3} />
          </Field>
        </div>
      </Zone>

      {/* Section 2: Build Specifications */}
      <Zone title="Build Specifications">
        <p className="text-xs text-stone-400 mb-4">Pre-filled from the buyer's request where available. These are your final confirmed spec values.</p>
        <SpecificationsForm
          specs={form.specifications}
          onChange={specs => update("specifications", specs)}
          builderSpecOptions={specOptions}
        />
      </Zone>

      {/* Section 3: Pricing & Timing */}
      <Zone title="Pricing & Timing">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Total Price *">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
              <input type="number" step="0.01" min="0" value={form.total_price || ""}
                onChange={e => {
                  const total = e.target.value ? Number(e.target.value) : "";
                  const deposit = Number(form.deposit_amount) || 0;
                  setForm(f => ({ ...f, total_price: total, final_balance: total ? total - deposit : "" }));
                }}
                placeholder="0.00"
                className="w-full border border-stone-300 rounded-xl pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </Field>
          <Field label="Deposit Amount">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
              <input type="number" step="0.01" min="0" value={form.deposit_amount || ""}
                onChange={e => {
                  const deposit = e.target.value ? Number(e.target.value) : "";
                  const total = Number(form.total_price) || 0;
                  setForm(f => ({ ...f, deposit_amount: deposit, final_balance: total && deposit ? total - deposit : "" }));
                }}
                placeholder="0.00"
                className="w-full border border-stone-300 rounded-xl pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </Field>
          <Field label="Final Balance (auto-calculated)" hint="Automatically calculated from Total − Deposit">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
              <input type="number" step="0.01" value={form.final_balance || ""} readOnly
                className="w-full border border-stone-200 rounded-xl pl-7 pr-3 py-2 text-sm bg-stone-50 text-stone-500" />
            </div>
          </Field>
          <Field label="Estimated Build Timeline">
            <Input value={form.estimated_build_timeline} onChange={v => update("estimated_build_timeline", v)} placeholder="e.g. 4–6 months from deposit" />
          </Field>
          <Field label="Final Payment Due Window">
            <select value={form.payment_due_window_days} onChange={e => update("payment_due_window_days", Number(e.target.value))}
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
              {[3, 5, 7, 10, 14].map(d => <option key={d} value={d}>{d} days after build completion</option>)}
            </select>
          </Field>
          <Field label="Shipping Notes">
            <Input value={form.shipping_notes} onChange={v => update("shipping_notes", v)} placeholder="e.g. Insured shipping via UPS/FedEx, continental US only" />
          </Field>
        </div>
      </Zone>

      {/* Section 4: Policy Terms */}
      <Zone title="Policy Terms">
        <p className="text-xs text-stone-400 mb-4">Auto-populated from your builder profile policies. You may edit these for this specific order form.</p>
        {(!form.policy_return_summary || !form.policy_warranty_summary) && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm border bg-amber-50 border-amber-200 text-amber-800">
            ⚠ Some policy terms appear blank. Please ensure your <a href="/DashboardProfile" className="underline font-semibold">builder profile policies</a> are filled in to auto-populate these fields.
          </div>
        )}
        <div className="space-y-4">
          <Field label="Deposit & Cancellation Terms">
            <Textarea value={form.policy_deposit_summary} onChange={v => update("policy_deposit_summary", v)} rows={2} placeholder="Describe your deposit and cancellation terms..." />
          </Field>
          <Field label="Return Terms">
            <Textarea value={form.policy_return_summary} onChange={v => update("policy_return_summary", v)} rows={2} placeholder="Describe your return policy for custom builds..." />
          </Field>
          <Field label="Warranty Terms">
            <Textarea value={form.policy_warranty_summary} onChange={v => update("policy_warranty_summary", v)} rows={2} placeholder="Summarize your warranty coverage..." />
          </Field>
        </div>
      </Zone>

      {/* Build Reference Images */}
      <Zone title="Build Reference Images" collapsible={true} defaultOpen={true}>
        <p className="text-xs text-stone-400 mb-4">Upload up to 4 supporting reference images to help the buyer visualize the build. These are illustrative only — use captions to clarify context (e.g. "Body shape reference", "Burst finish example"). The official build definition comes from the specifications, summary, and pricing above.</p>
        <div className="space-y-3">
          {(form.reference_images || []).map((img, idx) => (
            <div key={idx} className="flex gap-3 items-start bg-white border border-stone-200 rounded-xl p-3">
              <img src={img.image_url} alt={img.caption || "Reference"} className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border border-stone-200" />
              <div className="flex-1 min-w-0">
                <input
                  value={img.caption || ""}
                  onChange={e => updateImage(idx, "caption", e.target.value)}
                  placeholder="Optional caption (e.g. 'Body shape reference', 'Burst finish example', 'Illustrative only — wood figure will vary')"
                  className="w-full border border-stone-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 mb-2"
                />
                <div className="flex items-center gap-1.5">
                  {idx > 0 && (
                    <button type="button" onClick={() => moveImage(idx, -1)} className="text-xs px-2.5 py-1 border border-stone-300 rounded-lg text-stone-500 hover:bg-stone-50">↑ Up</button>
                  )}
                  {idx < (form.reference_images.length - 1) && (
                    <button type="button" onClick={() => moveImage(idx, 1)} className="text-xs px-2.5 py-1 border border-stone-300 rounded-lg text-stone-500 hover:bg-stone-50">↓ Down</button>
                  )}
                  <button type="button" onClick={() => removeImage(idx)} className="text-xs px-2.5 py-1 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 ml-auto">Remove</button>
                </div>
              </div>
            </div>
          ))}
          {(form.reference_images || []).length < 4 && (
            <label className="flex items-center justify-center gap-2 cursor-pointer w-full px-4 py-3 border-2 border-dashed border-stone-300 rounded-xl text-sm text-stone-500 hover:border-amber-400 hover:text-amber-700 transition-colors">
              {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
              {uploadingImage ? "Uploading..." : `Add Reference Image (${(form.reference_images || []).length}/4 uploaded)`}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
            </label>
          )}
          {(form.reference_images || []).length === 0 && (
            <p className="text-xs text-stone-400 text-center">No images added. This section will not appear on the buyer-facing Order Form if left empty.</p>
          )}
        </div>
      </Zone>

      {/* Section 5: Original Buyer Request — Reference Only, collapsed */}
      {request && (
        <Zone title="Original Buyer Request" collapsible={true} defaultOpen={false}>
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 mb-4">
            <p className="text-xs text-stone-500">Reference only — this is what the buyer originally submitted. Not editable.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
            <div><span className="text-xs font-semibold text-stone-400 block">Name</span><span className="text-stone-700">{request.customer_name}</span></div>
            <div><span className="text-xs font-semibold text-stone-400 block">Email</span><span className="text-stone-700">{request.customer_email}</span></div>
            {request.customer_phone && <div><span className="text-xs font-semibold text-stone-400 block">Phone</span><span className="text-stone-700">{request.customer_phone}</span></div>}
            {request.budget_range && <div><span className="text-xs font-semibold text-stone-400 block">Budget Range</span><span className="text-stone-700">{request.budget_range}</span></div>}
            {request.created_date && <div><span className="text-xs font-semibold text-stone-400 block">Submitted</span><span className="text-stone-700">{new Date(request.created_date).toLocaleDateString()}</span></div>}
          </div>
          {request.description && (
            <div className="mb-4">
              <span className="text-xs font-semibold text-stone-400 block mb-1">Vision</span>
              <p className="text-sm text-stone-600 leading-relaxed bg-white rounded-xl border border-stone-200 p-3">{request.description}</p>
            </div>
          )}
          {request.specifications && Object.keys(request.specifications).filter(k => request.specifications[k]).length > 0 && (
            <div>
              <span className="text-xs font-semibold text-stone-400 block mb-2">Originally Requested Specs</span>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
                {Object.entries(request.specifications).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="text-xs text-stone-500">
                    <span className="font-medium capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}:</span> {String(v)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Zone>
      )}

      {/* Builder Confirmation */}
      <div className="bg-white rounded-2xl border border-amber-200 p-5 mb-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-amber-600 flex-shrink-0"
          />
          <span className="text-sm text-stone-700 leading-relaxed">
            <strong>I confirm</strong> that this Order Form accurately reflects the build specifications, pricing, timing, and any important notes for this custom build.
          </span>
        </label>
        {!confirmed && (
          <p className="text-xs text-stone-400 mt-2 ml-7">Required before sending — does not affect saving a draft.</p>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-wrap gap-3 py-4">
        <button onClick={handleSaveDraft} disabled={saving || sending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 transition-colors disabled:opacity-50">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Draft"}
        </button>
        <button onClick={handleSendOrderForm} disabled={saving || sending || result?.type === "sent" || !confirmed}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: result?.type === "sent" ? "#27AE60" : AMBER }}
          onMouseEnter={e => { if (result?.type !== "sent") e.currentTarget.style.backgroundColor = "#a8661a"; }}
          onMouseLeave={e => { if (result?.type !== "sent") e.currentTarget.style.backgroundColor = AMBER; }}>
          {result?.type === "sent" ? <><CheckCircle className="w-4 h-4" /> Sent!</> : <><Send className="w-4 h-4" />{sending ? "Sending..." : "Send Order Form"}</>}
        </button>
        <Link to={createPageUrl("DashboardCustomBuilds")}
          className="flex items-center px-5 py-2.5 rounded-xl text-sm font-medium text-stone-500 hover:text-stone-700">
          Cancel
        </Link>
      </div>
    </div>
  );
}