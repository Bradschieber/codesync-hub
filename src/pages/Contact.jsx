import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, MessageSquare, CheckCircle } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await base44.integrations.Core.SendEmail({
      to: "hello@stringedcollective.com",
      subject: `Contact Form: ${form.subject}`,
      body: `From: ${form.name} (${form.email})\n\n${form.message}`,
    });
    setSent(true);
    setLoading(false);
  }

  if (sent) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-stone-800 mb-2">Message Sent!</h1>
      <p className="text-stone-500">We'll get back to you within 1-2 business days.</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <MessageSquare className="w-12 h-12 mx-auto mb-4" style={{ color: "#1B2B4B" }} />
        <h1 className="text-3xl font-bold text-stone-800 mb-2">Get in Touch</h1>
        <p className="text-stone-500">Questions, feedback, or partnership inquiries — we'd love to hear from you.</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Your Name *</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Email *</label>
              <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Subject *</label>
            <input required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Message *</label>
            <textarea required rows={6} value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none" />
          </div>
          <button type="submit" disabled={loading} className="w-full text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50" style={{ backgroundColor: "#1B2B4B" }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = "#152038"; }}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1B2B4B"}>
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center">
        <p className="text-stone-400 text-sm flex items-center justify-center gap-2">
          <Mail className="w-4 h-4" /> hello@stringedcollective.com
        </p>
      </div>
    </div>
  );
}