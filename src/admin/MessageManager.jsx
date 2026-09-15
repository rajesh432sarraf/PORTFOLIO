import React, { useState, useEffect } from 'react';
import { Mail, Check, Archive, Trash2, Clock, CheckCheck, RefreshCw, Plus, Edit2, X, Send, Sparkles } from 'lucide-react';

export function MessageManager() {
  const [messages, setMessages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMsg, setCurrentMsg] = useState(null);

  const loadMessages = async () => {
    // 1. Instant load from local storage
    try {
      const saved = JSON.parse(localStorage.getItem('rajesh_portfolio_messages') || '[]');
      if (saved.length > 0) {
        setMessages(saved);
      } else {
        const initial = [
          {
            _id: 'sample_1',
            name: 'Sarah Chen',
            email: 'sarah.chen@techventures.io',
            subject: 'AI Product Collaboration',
            message: 'Hi Rajesh, loved your ClearityNote AI project! We are building an agentic intelligence pipeline and would love to connect about potential engineering opportunities.',
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            status: 'new',
            showOnWebsite: true,
          },
        ];
        setMessages(initial);
        localStorage.setItem('rajesh_portfolio_messages', JSON.stringify(initial));
      }
    } catch (e) {
      setMessages([]);
    }

    // 2. Fetch from cloud serverless endpoint if available
    try {
      const response = await fetch('/api/contact');
      if (response.ok) {
        const data = await response.json();
        if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
          const currentLocal = JSON.parse(localStorage.getItem('rajesh_portfolio_messages') || '[]');
          const messageMap = new Map();
          // Keep local entries
          currentLocal.forEach((m) => messageMap.set(m._id || m.id, m));
          // Overlay server entries
          data.messages.forEach((m) => messageMap.set(m._id || m.id, m));
          const merged = Array.from(messageMap.values()).sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          );
          setMessages(merged);
          localStorage.setItem('rajesh_portfolio_messages', JSON.stringify(merged));
        }
      }
    } catch (apiErr) {
      // Offline or local environment without serverless function active
    }
  };

  useEffect(() => {
    loadMessages();
    const handleUpdate = () => loadMessages();
    window.addEventListener('portfolio_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('portfolio_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const saveToStorage = (updated) => {
    setMessages(updated);
    try {
      localStorage.setItem('rajesh_portfolio_messages', JSON.stringify(updated));
      window.dispatchEvent(new Event('portfolio_data_updated'));
    } catch (e) {
      console.error('Failed to save messages to localStorage', e);
    }
  };

  const toggleFeature = (id) => {
    const updated = messages.map((m) =>
      m._id === id ? { ...m, showOnWebsite: !m.showOnWebsite } : m
    );
    saveToStorage(updated);
  };

  const updateStatus = (id, newStatus) => {
    const updated = messages.map((m) => (m._id === id ? { ...m, status: newStatus } : m));
    saveToStorage(updated);
  };

  const deleteMessage = (id) => {
    if (window.confirm('Delete this message?')) {
      const filtered = messages.filter((m) => m._id !== id);
      saveToStorage(filtered);
    }
  };

  const handleOpenNew = () => {
    setCurrentMsg({
      _id: `msg_${Date.now()}`,
      name: '',
      email: '',
      subject: '',
      message: '',
      status: 'new',
      showOnWebsite: true,
      createdAt: new Date().toISOString(),
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (msg) => {
    setCurrentMsg({ ...msg, showOnWebsite: msg.showOnWebsite ?? false });
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const msgToSave = {
      ...currentMsg,
      name: currentMsg.name.trim(),
      email: currentMsg.email.trim(),
      subject: currentMsg.subject.trim(),
      message: currentMsg.message.trim(),
      showOnWebsite: !!currentMsg.showOnWebsite,
    };

    const exists = messages.find((m) => m._id === msgToSave._id);
    let updated;
    if (exists) {
      updated = messages.map((m) => (m._id === msgToSave._id ? msgToSave : m));
    } else {
      updated = [msgToSave, ...messages];
    }

    saveToStorage(updated);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight text-white font-kanit">
            Contact Submissions &amp; Inquiries
          </h2>
          <p className="text-xs font-mono text-white/50">
            Client messages, recruitment inquiries, and custom recorded notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadMessages}
            className="p-2 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
            title="Refresh messages"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleOpenNew}
            className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Message</span>
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="p-12 text-center text-white/40 font-mono text-xs rounded-2xl bg-[#0C0C0C] border border-white/10">
            <Mail className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>No messages in inbox.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                msg.status === 'new'
                  ? 'bg-white/[0.04] border-white/20 shadow-lg'
                  : 'bg-white/[0.01] border-white/[0.06] opacity-85'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-white">{msg.name}</span>
                  <span className="text-xs font-mono text-white/50">{msg.email}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                      msg.status === 'new'
                        ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                        : msg.status === 'read'
                        ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30'
                        : msg.status === 'replied'
                        ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30'
                        : 'bg-white/[0.04] text-white/40 border border-white/10'
                    }`}
                  >
                    {msg.status}
                  </span>

                  <span className="text-[11px] font-mono text-white/30 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(msg.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="text-xs font-mono uppercase text-[#BBCCD7] mb-2 font-semibold">
                Subject: {msg.subject}
              </p>

              <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed mb-4 bg-black/30 p-3.5 rounded-xl border border-white/[0.04] whitespace-pre-wrap">
                {msg.message}
              </p>

              {/* Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06] text-xs font-mono">
                <a
                  href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                  className="text-[#BBCCD7] hover:underline flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleFeature(msg._id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      msg.showOnWebsite
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                        : 'bg-white/[0.02] text-white/40 border-white/10 hover:text-white/70'
                    }`}
                    title={msg.showOnWebsite ? 'Visible on Website (Click to hide)' : 'Hidden from Website (Click to feature)'}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{msg.showOnWebsite ? '★ On Website' : 'Hidden'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(msg)}
                    className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                    title="Edit Message Details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {msg.status !== 'read' && (
                    <button
                      type="button"
                      onClick={() => updateStatus(msg._id, 'read')}
                      className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                      title="Mark as Read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {msg.status !== 'replied' && (
                    <button
                      type="button"
                      onClick={() => updateStatus(msg._id, 'replied')}
                      className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:text-emerald-400 transition-colors cursor-pointer"
                      title="Mark as Replied"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => updateStatus(msg._id, 'archived')}
                    className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                    title="Archive"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMessage(msg._id)}
                    className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit / Create Message Modal */}
      {isEditing && currentMsg && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          <div
            data-lenis-prevent="true"
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto overscroll-contain custom-scrollbar rounded-3xl bg-[#0E0E0E] border border-white/15 p-6 sm:p-8 shadow-2xl"
            style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white font-kanit">
                {messages.some((m) => m._id === currentMsg._id) ? 'Edit Message' : 'Add New Inquiry / Note'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                    Sender Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Rivera"
                    value={currentMsg.name}
                    onChange={(e) => setCurrentMsg({ ...currentMsg, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                    Sender Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. alex@company.com"
                    value={currentMsg.email}
                    onChange={(e) => setCurrentMsg({ ...currentMsg, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full-Stack Role / Project Inquiry"
                    value={currentMsg.subject}
                    onChange={(e) => setCurrentMsg({ ...currentMsg, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                    Status
                  </label>
                  <select
                    value={currentMsg.status}
                    onChange={(e) => setCurrentMsg({ ...currentMsg, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  >
                    <option value="new">NEW</option>
                    <option value="read">READ</option>
                    <option value="replied">REPLIED</option>
                    <option value="archived">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                  Message Content *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Enter message or note body..."
                  value={currentMsg.message}
                  onChange={(e) => setCurrentMsg({ ...currentMsg, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 leading-relaxed"
                />
              </div>

              {/* Show on Website checkbox */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
                <input
                  type="checkbox"
                  id="msgShowOnWebsite"
                  checked={!!currentMsg.showOnWebsite}
                  onChange={(e) => setCurrentMsg({ ...currentMsg, showOnWebsite: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 accent-emerald-400 cursor-pointer"
                />
                <label htmlFor="msgShowOnWebsite" className="text-xs text-white/80 cursor-pointer select-none">
                  <span className="font-bold text-white block">Feature on Website (Show as Public Testimonial / Feedback)</span>
                  <span className="text-[11px] text-white/40 block font-mono">Portfolio website ke Contact section me collaborator review ki tarah show hoga</span>
                </label>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2 rounded-full border border-white/20 text-xs font-mono uppercase hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-white text-black text-xs font-bold uppercase hover:bg-neutral-200 transition-colors"
                >
                  Save Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageManager;
