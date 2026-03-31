import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, ExternalLink, Save } from "lucide-react";

const STATUS_COLORS = {
  "Not Started": "bg-gray-100 text-gray-600",
  "Pass": "bg-green-100 text-green-700",
  "Fail": "bg-red-100 text-red-700",
  "Blocked": "bg-orange-100 text-orange-700",
  "Retest Needed": "bg-yellow-100 text-yellow-700",
};

const RETEST_COLORS = {
  "Not Needed": "bg-gray-100 text-gray-500",
  "Pending": "bg-blue-100 text-blue-700",
  "Pass": "bg-green-100 text-green-700",
  "Fail": "bg-red-100 text-red-700",
};

export default function QAItemDrawer({ item, onClose, onSaved }) {
  const [form, setForm] = useState({
    status: item.status || "Not Started",
    retest_status: item.retest_status || "Not Needed",
    tester_name: item.tester_name || "",
    date_run: item.date_run || "",
    notes: item.notes || "",
    bug_link: item.bug_link || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); setSaved(false); }

  async function handleSave() {
    setSaving(true);
    await base44.entities.QAChecklistItem.update(item.id, form);
    setSaving(false);
    setSaved(true);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ backgroundColor: "rgba(0,0,0,0.35)" }} onClick={onClose}>
      <div
        className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{item.category}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.priority === "Critical" ? "bg-red-100 text-red-700" : item.priority === "High" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
                {item.priority}
              </span>
            </div>
            <h2 className="text-base font-bold text-gray-900 leading-snug">{item.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex-shrink-0 mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 space-y-5">

          {item.description && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
            </div>
          )}

          {item.preconditions && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Preconditions</p>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg px-3 py-2">{item.preconditions}</p>
            </div>
          )}

          {item.expected_result && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Expected Result</p>
              <p className="text-sm text-gray-600 leading-relaxed bg-blue-50 rounded-lg px-3 py-2">{item.expected_result}</p>
            </div>
          )}

          <hr className="border-gray-100" />

          {/* Editable fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-300">
                {["Not Started","Pass","Fail","Blocked","Retest Needed"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Retest Status</label>
              <select value={form.retest_status} onChange={e => set("retest_status", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-300">
                {["Not Needed","Pending","Pass","Fail"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Tester</label>
              <input type="text" value={form.tester_name} onChange={e => set("tester_name", e.target.value)}
                placeholder="Name or initials"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Date Run</label>
              <input type="date" value={form.date_run} onChange={e => set("date_run", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-300" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Bug / Ticket Link</label>
            <div className="flex gap-2">
              <input type="url" value={form.bug_link} onChange={e => set("bug_link", e.target.value)}
                placeholder="https://..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-300" />
              {form.bug_link && (
                <a href={form.bug_link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-indigo-600 hover:bg-indigo-50">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
            <textarea rows={4} value={form.notes} onChange={e => set("notes", e.target.value)}
              placeholder="Test notes, observations, failure details..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-300 resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          {saved && <span className="text-xs text-green-600 font-medium">Saved</span>}
          <div className="flex gap-2 ml-auto">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
              style={{ backgroundColor: "#2F3E55" }}>
              <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}