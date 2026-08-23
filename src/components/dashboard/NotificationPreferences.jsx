import { Bell, Mail, MessageCircle } from "lucide-react";

export default function NotificationPreferences({ form, setForm }) {
  const notifyEmail = form?.notify_email !== false;
  const notifySms = form?.notify_sms || false;
  const phone = form?.notification_phone || "";

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-gray-400" />
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Notification Preferences</p>
      </div>
      <p className="text-xs text-gray-400 mb-5">
        Choose how you'd like to be notified when buyers send you messages, build requests, or place orders.
      </p>
      <div className="space-y-3">
        <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-400" />
            <div>
              <p className="font-medium text-sm text-gray-700">Email Notifications</p>
              <p className="text-xs text-gray-400">Sent to your account email address</p>
            </div>
          </div>
          <input type="checkbox" checked={notifyEmail} onChange={e => setForm(f => ({ ...f, notify_email: e.target.checked }))} className="h-4 w-4" style={{ accentColor: "#1B2B4B" }} />
        </label>
        <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-4 h-4 text-gray-400" />
            <div>
              <p className="font-medium text-sm text-gray-700">SMS Text Notifications</p>
              <p className="text-xs text-gray-400">Receive a text on your phone</p>
            </div>
          </div>
          <input type="checkbox" checked={notifySms} onChange={e => setForm(f => ({ ...f, notify_sms: e.target.checked }))} className="h-4 w-4" style={{ accentColor: "#1B2B4B" }} />
        </label>
        {notifySms && (
          <p className="text-xs text-gray-400 leading-relaxed px-1">
            By checking this box, I agree to receive text messages from Stringed Collective about my builder application and account, including onboarding reminders. Message frequency varies, message and data rates may apply. Reply STOP to opt out at any time. Consent is not required to use Stringed Collective.
          </p>
        )}
        {notifySms && (
          <div className="px-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number for SMS</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setForm(f => ({ ...f, notification_phone: e.target.value }))}
              placeholder="+15551234567"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <p className="text-xs text-gray-400 mt-1">Enter in E.164 format, e.g. +15551234567</p>
          </div>
        )}
      </div>
    </div>
  );
}