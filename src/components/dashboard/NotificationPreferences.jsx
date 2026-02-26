import { useState } from "react";
import { Bell, Mail, MessageCircle } from "lucide-react";

export default function NotificationPreferences({ profile, onSave }) {
  const [notifyEmail, setNotifyEmail] = useState(profile?.notify_email !== false);
  const [notifySms, setNotifySms] = useState(profile?.notify_sms || false);
  const [phone, setPhone] = useState(profile?.notification_phone || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({
      notify_email: notifyEmail,
      notify_sms: notifySms,
      notification_phone: phone,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6">
      <div className="flex items-center gap-2 mb-5">
        <Bell className="w-5 h-5 text-amber-600" />
        <h2 className="font-bold text-stone-800 text-lg">Message Notifications</h2>
      </div>
      <p className="text-stone-500 text-sm mb-5">
        Get notified when a buyer sends you a new message or build request.
      </p>

      <div className="space-y-4">
        {/* Email */}
        <label className="flex items-center justify-between p-4 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50 transition-colors">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-stone-400" />
            <div>
              <p className="font-medium text-stone-700 text-sm">Email Notifications</p>
              <p className="text-xs text-stone-400">Sent to your account email address</p>
            </div>
          </div>
          <div
            onClick={() => setNotifyEmail(!notifyEmail)}
            className={`w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${notifyEmail ? 'bg-amber-500' : 'bg-stone-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${notifyEmail ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </label>

        {/* SMS */}
        <label className="flex items-center justify-between p-4 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50 transition-colors">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-stone-400" />
            <div>
              <p className="font-medium text-stone-700 text-sm">SMS Text Notifications</p>
              <p className="text-xs text-stone-400">Receive a text on your phone</p>
            </div>
          </div>
          <div
            onClick={() => setNotifySms(!notifySms)}
            className={`w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${notifySms ? 'bg-amber-500' : 'bg-stone-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${notifySms ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </label>

        {/* Phone number (shown when SMS enabled) */}
        {notifySms && (
          <div className="px-1">
            <label className="block text-xs font-medium text-stone-600 mb-1">Phone Number for SMS *</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+15551234567"
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <p className="text-xs text-stone-400 mt-1">Enter in E.164 format, e.g. +15551234567</p>
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-5 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : saved ? "Saved!" : "Save Preferences"}
      </button>
    </div>
  );
}