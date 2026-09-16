import React, { useState, useEffect } from 'react';
import { Mail, Check, Archive, Trash2, Clock, CheckCheck, RefreshCw, Sparkles, Inbox } from 'lucide-react';
import { fetchMessagesFromDatabase, deleteMessageFromDatabase, persistMessagesToCache } from '../services/storageService.js';

export function MessageManager() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMessagesFromDatabase();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Could not fetch messages:', err);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const handleUpdate = () => loadMessages();
    window.addEventListener('portfolio_data_updated', handleUpdate);
    return () => {
      window.removeEventListener('portfolio_data_updated', handleUpdate);
    };
  }, []);

  const saveToStorage = async (updated) => {
    setMessages(updated);
    try {
      await persistMessagesToCache(updated);
    } catch (e) {
      console.error('Failed to save messages to cache', e);
    }
  };

  const toggleFeature = (id) => {
    const updated = messages.map((m) =>
      (m._id || m.id) === id ? { ...m, showOnWebsite: !m.showOnWebsite } : m
    );
    saveToStorage(updated);
  };

  const updateStatus = (id, newStatus) => {
    const updated = messages.map((m) =>
      (m._id || m.id) === id ? { ...m, status: newStatus } : m
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight text-white font-kanit">
            Contact Submissions &amp; Inquiries
          </h2>
          <p className="text-xs font-mono text-white/50">
            Client messages and contact inquiries submitted by users through your live portfolio website.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadMessages}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors cursor-pointer flex items-center gap-2 text-xs font-mono"
            title="Refresh Inquiries"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Messages Inbox */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-16 text-center text-white/40 font-mono text-xs flex flex-col items-center justify-center gap-3 rounded-2xl bg-[#0E0E0E] border border-white/10">
            <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
            <span>Checking MongoDB database for incoming messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-16 text-center text-white/40 font-mono text-xs flex flex-col items-center justify-center gap-2.5 rounded-2xl bg-[#0E0E0E] border border-white/10">
            <Inbox className="w-8 h-8 text-white/20 mb-1" />
            <p className="text-sm text-white/70 font-kanit uppercase font-bold">Inbox is Clean</p>
            <p className="text-xs text-white/40 max-w-sm">
              No new inquiries found in MongoDB. When a visitor fills out the contact form on your portfolio website, their message will appear here.
            </p>
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
                        : msg.status === 'read'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
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
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/85 font-light leading-relaxed whitespace-pre-wrap">
                  {msg.message}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <a
                  href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Portfolio Inquiry')}`}
                  className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors"
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
                    title="Archive Message"
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

      {/* Delete Confirmation Modal (Trace Option) */}
      {messageToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div data-lenis-prevent="true" className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-3xl bg-[#0E0E0E] border border-rose-500/30 p-6 sm:p-7 shadow-2xl space-y-5 my-auto">
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
