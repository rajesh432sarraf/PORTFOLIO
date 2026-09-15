import React, { useState, useEffect } from 'react';
import { Mail, Check, Archive, Trash2, Clock, CheckCheck, RefreshCw, Plus, Edit2, X, Send, Sparkles } from 'lucide-react';
import { deleteMessageFromDatabase } from '../services/storageService.js';

export function MessageManager() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMsg, setCurrentMsg] = useState(null);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/contact');
      if (response.ok) {
        const data = await response.json();
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
          try {
            localStorage.setItem('rajesh_portfolio_messages', JSON.stringify(data.messages));
          } catch (e) {}
          return;
        }
      }
    } catch (apiErr) {
      console.warn('Could not fetch messages from serverless endpoint, using local cache:', apiErr);
    }

    try {
      const saved = JSON.parse(localStorage.getItem('rajesh_portfolio_messages') || '[]');
      setMessages(saved);
    } catch (e) {
      setMessages([]);
    } finally {
      setIsLoading(false);
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
      m._id === id || m.id === id ? { ...m, showOnWebsite: !m.showOnWebsite } : m
    );
    saveToStorage(updated);
  };

  const updateStatus = (id, newStatus) => {
    const updated = messages.map((m) =>
      m._id === id || m.id === id ? { ...m, status: newStatus } : m
    );
    saveToStorage(updated);
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;
    const targetId = messageToDelete._id || messageToDelete.id;
    setDeletingId(targetId);

    try {
      await deleteMessageFromDatabase(targetId);
      const filtered = messages.filter((m) => (m._id || m.id) !== targetId);
      saveToStorage(filtered);
    } catch (err) {
      console.error('Failed to delete message:', err);
    } finally {
      setDeletingId(null);
      setMessageToDelete(null);
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

    const exists = messages.find((m) => (m._id || m.id) === (msgToSave._id || msgToSave.id));
    let updated;
    if (exists) {
      updated = messages.map((m) => ((m._id || m.id) === (msgToSave._id || msgToSave.id) ? msgToSave : m));
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
            Client messages, recruitment inquiries, and custom recorded notes stored in MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadMessages}
            className="p-2 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
            title="Refresh Messages"
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
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-white/40 font-mono text-xs flex items-center justify-center gap-2 rounded-2xl bg-[#0E0E0E] border border-white/10">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
            <span>Loading messages from database...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-white/40 font-mono text-xs rounded-2xl bg-[#0E0E0E] border border-white/10">
            No contact submissions found in database yet. Form submissions via the live website contact form will appear here.
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id || msg.id}
              className="p-5 rounded-2xl bg-[#0E0E0E] border border-white/10 space-y-3 hover:border-white/20 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white text-sm font-kanit uppercase">
                    {msg.name}
                  </span>
                  <span className="text-xs font-mono text-white/50">{msg.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                      msg.status === 'new'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : msg.status === 'replied'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/5 text-white/50 border border-white/10'
                    }`}
                  >
                    {msg.status || 'new'}
                  </span>
                  <span className="text-[11px] font-mono text-white/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-mono font-bold text-white/80 uppercase tracking-wide mb-1">
                  Subject: {msg.subject}
                </p>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/80 font-light leading-relaxed whitespace-pre-wrap">
                  {msg.message}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <a
                  href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                  className="text-xs font-mono text-white/60 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>

                <div className="flex items-center gap-2">
                  {/* Feature on Website Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleFeature(msg._id || msg.id)}
                    className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer ${
                      msg.showOnWebsite
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'border-white/10 text-white/40 hover:text-white'
                    }`}
                    title="Toggle public visibility on portfolio website"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{msg.showOnWebsite ? 'FEATURED ON SITE' : 'HIDDEN'}</span>
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
                      onClick={() => updateStatus(msg._id || msg.id, 'read')}
                      className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                      title="Mark as Read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {msg.status !== 'replied' && (
                    <button
                      type="button"
                      onClick={() => updateStatus(msg._id || msg.id, 'replied')}
                      className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:text-emerald-400 transition-colors cursor-pointer"
                      title="Mark as Replied"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => updateStatus(msg._id || msg.id, 'archived')}
                    className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                    title="Archive"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageToDelete(msg)}
                    className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete Message"
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
                {messages.some((m) => (m._id || m.id) === (currentMsg._id || currentMsg.id)) ? 'Edit Message' : 'Add New Inquiry / Note'}
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
                    placeholder="e.g. Asad Raza"
                    value={currentMsg.name}
                    onChange={(e) => setCurrentMsg({ ...currentMsg, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. asad@example.com"
                    value={currentMsg.email}
                    onChange={(e) => setCurrentMsg({ ...currentMsg, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Project Inquiry"
                  value={currentMsg.subject}
                  onChange={(e) => setCurrentMsg({ ...currentMsg, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                />
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
                  className="px-5 py-2 rounded-full border border-white/20 text-xs font-mono uppercase hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-white text-black text-xs font-bold uppercase hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Save Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Trace Option) */}
      {messageToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden">
          <div data-lenis-prevent="true" className="w-full max-w-md rounded-3xl bg-[#0E0E0E] border border-rose-500/30 p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold uppercase tracking-tight text-white font-kanit">
                  Delete Message?
                </h3>
                <p className="text-xs text-white/50 font-mono">
                  Permanent database removal
                </p>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed font-light">
              Are you sure you want to delete message from <span className="text-white font-bold font-mono">"{messageToDelete.name}"</span>? This will permanently remove it from MongoDB database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => setMessageToDelete(null)}
                className="px-5 py-2.5 rounded-full border border-white/20 text-xs font-mono uppercase hover:bg-white/10 text-white/80 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={confirmDelete}
                className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)] cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {deletingId ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting from Database...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Message</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageManager;
