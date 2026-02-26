import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, Mail, Trash } from "lucide-react";
import moment from "moment";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadMessages(); }, []);

  async function loadMessages() {
    try {
      const u = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) {
        const msgs = await base44.entities.Message.filter({ recipient_id: profiles[0].id }, "-created_date");
        setMessages(msgs);
      }
    } catch {
      base44.auth.redirectToLogin();
    }
    setLoading(false);
  }

  async function handleMessageClick(message) {
    setSelectedMessage(message);
    if (!message.is_read) {
      await base44.entities.Message.update(message.id, { is_read: true });
      setMessages(prev => prev.map(m => m.id === message.id ? { ...m, is_read: true } : m));
    }
  }

  async function handleDelete(id) {
    if (window.confirm("Delete this message?")) {
      await base44.entities.Message.delete(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      setSelectedMessage(null);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-stone-800 mb-8 flex items-center gap-3">
        <MessageSquare className="w-8 h-8 text-amber-600" /> My Messages
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="md:col-span-1 bg-white rounded-2xl border border-stone-200 p-4">
          <h2 className="font-bold text-stone-800 mb-4">Inbox ({messages.filter(m => !m.is_read).length} unread)</h2>
          {messages.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-6">No messages yet.</p>
          ) : (
            <div className="space-y-2">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  onClick={() => handleMessageClick(msg)}
                  className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                    selectedMessage?.id === msg.id ? "bg-amber-100 border border-amber-200" : "bg-stone-50 hover:bg-stone-100"
                  }`}
                >
                  <Mail className={`w-5 h-5 flex-shrink-0 mt-0.5 ${msg.is_read ? "text-stone-400" : "text-amber-600"}`} />
                  <div className="flex-grow min-w-0">
                    <p className={`font-medium text-sm truncate ${msg.is_read ? "text-stone-600" : "text-stone-800"}`}>
                      {msg.subject || "No Subject"}
                    </p>
                    <p className="text-xs text-stone-500 truncate">{msg.sender_name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{moment(msg.created_date).fromNow()}</p>
                  </div>
                  {!msg.is_read && <span className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0 mt-1.5" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-stone-200 p-6">
          {selectedMessage ? (
            <div>
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-stone-200">
                <div>
                  <h2 className="text-xl font-bold text-stone-800">{selectedMessage.subject || "No Subject"}</h2>
                  <p className="text-stone-500 text-sm mt-1">From: <span className="font-medium">{selectedMessage.sender_name}</span></p>
                  <p className="text-stone-400 text-xs mt-0.5">{moment(selectedMessage.created_date).format("MMM D, YYYY h:mm A")}</p>
                </div>
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="p-2 rounded-full hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
              <p className="text-stone-700 leading-relaxed">{selectedMessage.body}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-stone-400">
              <Mail className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}