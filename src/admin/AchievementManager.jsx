import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Trophy, Award, Calendar, ExternalLink, X, RefreshCw } from 'lucide-react';
import { fetchContentFromDatabase, persistContentToDatabase, deleteContentItemFromDatabase } from '../services/storageService.js';

export function AchievementManager() {
  const [achievementList, setAchievementList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAch, setCurrentAch] = useState(null);
  const [achievementToDelete, setAchievementToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadAchievements = async () => {
    setIsLoading(true);
    try {
      const data = await fetchContentFromDatabase('achievements', []);
      setAchievementList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load achievements from database', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();

    const handleUpdate = () => {
      fetchContentFromDatabase('achievements', []).then((data) => {
        if (Array.isArray(data)) setAchievementList(data);
      });
    };

    window.addEventListener('portfolio_data_updated', handleUpdate);
    return () => window.removeEventListener('portfolio_data_updated', handleUpdate);
  }, []);

  const handleOpenEdit = (ach, index) => {
    setCurrentAch({ ...ach, _index: index });
    setIsEditing(true);
  };

  const handleOpenNew = () => {
    setCurrentAch({
      _index: -1,
      id: `ach_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      number: `0${achievementList.length + 1}`,
      title: '',
      event: '',
      project: '',
      year: new Date().getFullYear().toString(),
      highlight: 'Competitive Milestone',
      description: '',
    });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const achToSave = {
      id: currentAch.id || `ach_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      number: currentAch.number.trim() || '01',
      title: currentAch.title.trim(),
      event: currentAch.event.trim(),
      project: currentAch.project.trim() || 'Portfolio',
      year: currentAch.year.trim(),
      highlight: currentAch.highlight.trim() || 'Achievement',
      description: currentAch.description.trim(),
    };

    let updated;
    if (currentAch._index >= 0) {
      updated = achievementList.map((ach, i) => (i === currentAch._index ? achToSave : ach));
    } else {
      updated = [achToSave, ...achievementList];
    }

    setIsSaving(true);
    setAchievementList(updated);
    await persistContentToDatabase('achievements', updated);
    setIsSaving(false);
    setIsEditing(false);
  };

  const confirmDelete = async () => {
    if (!achievementToDelete) return;
    const targetId = achievementToDelete.id || achievementToDelete.title;
    setDeletingId(targetId);

    try {
      if (achievementToDelete.id) {
        await deleteContentItemFromDatabase('achievements', achievementToDelete.id);
      }
      const updated = achievementList.filter((_, i) => i !== achievementToDelete._index);
      setAchievementList(updated);
      await persistContentToDatabase('achievements', updated);
    } catch (err) {
      console.error('Failed to delete achievement record:', err);
    } finally {
      setDeletingId(null);
      setAchievementToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight text-white font-kanit">
            Achievements &amp; Hackathons
          </h2>
          <p className="text-xs font-mono text-white/50">
            Showcase your hackathon wins, national recognitions, and competitive milestones via MongoDB Database.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-neutral-200 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Achievement</span>
        </button>
      </div>

      {/* Achievements Table */}
      <div className="rounded-2xl bg-[#0C0C0C] border border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-white/40 font-mono text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
            <span>Loading achievements from database...</span>
          </div>
        ) : achievementList.length === 0 ? (
          <div className="p-12 text-center text-white/40 font-mono text-xs">
            No achievements found in database. Click "+ New Achievement" to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-normal">Badge</th>
                  <th className="py-3.5 px-4 font-normal">Title &amp; Award</th>
                  <th className="py-3.5 px-4 font-normal">Event / Hackathon</th>
                  <th className="py-3.5 px-4 font-normal">Project</th>
                  <th className="py-3.5 px-4 font-normal">Year</th>
                  <th className="py-3.5 px-4 font-normal">Highlight</th>
                  <th className="py-3.5 px-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {achievementList.map((ach, idx) => (
                  <tr key={ach.id || idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {ach.number}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-white font-bold tracking-tight uppercase font-kanit text-sm">
                      {ach.title}
                    </td>
                    <td className="py-4 px-4 text-white/70">
                      {ach.event}
                    </td>
                    <td className="py-4 px-4 text-emerald-400">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px]">
                        {ach.project}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-white/50">
                      {ach.year}
                    </td>
                    <td className="py-4 px-4 text-white/60">
                      {ach.highlight}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(ach, idx)}
                          className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
                          title="Edit Achievement"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setAchievementToDelete({ ...ach, _index: idx })}
                          className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Achievement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Create Achievement Modal */}
      {isEditing && currentAch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          <div
            data-lenis-prevent="true"
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto overscroll-contain custom-scrollbar rounded-3xl bg-[#0E0E0E] border border-white/15 p-6 sm:p-8 shadow-2xl"
            style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white font-kanit">
                {currentAch._index >= 0 ? 'Edit Achievement' : 'Add New Achievement'}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                    Achievement / Award Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1ST PLACE WINNER"
                    value={currentAch.title}
                    onChange={(e) => setCurrentAch({ ...currentAch, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                    Badge Number / Short (#)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 01 or WIN"
                    value={currentAch.number}
                    onChange={(e) => setCurrentAch({ ...currentAch, number: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                    Event / Hackathon Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SMART INDIA HACKATHON"
                    value={currentAch.event}
                    onChange={(e) => setCurrentAch({ ...currentAch, event: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                    Project Associated *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CLEARITYNOTE AI"
                    value={currentAch.project}
                    onChange={(e) => setCurrentAch({ ...currentAch, project: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                    Year *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2025"
                    value={currentAch.year}
                    onChange={(e) => setCurrentAch({ ...currentAch, year: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                    Highlight Badge / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Top 3 Podium Finish"
                    value={currentAch.highlight}
                    onChange={(e) => setCurrentAch({ ...currentAch, highlight: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                  Description of Recognition &amp; Technical Scope *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Describe your achievement, the competition level, solutions developed, jury evaluation, etc."
                  value={currentAch.description}
                  onChange={(e) => setCurrentAch({ ...currentAch, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2 rounded-full border border-white/20 text-xs font-mono uppercase hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-full bg-white text-black text-xs font-bold uppercase hover:bg-neutral-200 transition-colors cursor-pointer flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <span>Save Achievement</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Trace Option) */}
      {achievementToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden">
          <div data-lenis-prevent="true" className="w-full max-w-md rounded-3xl bg-[#0E0E0E] border border-rose-500/30 p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold uppercase tracking-tight text-white font-kanit">
                  Delete Achievement?
                </h3>
                <p className="text-xs text-white/50 font-mono">
                  Permanent database removal
                </p>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed font-light">
              Are you sure you want to delete <span className="text-white font-bold font-mono">"{achievementToDelete.title} - {achievementToDelete.event}"</span>? This will permanently remove it from both your live portfolio website and the MongoDB database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => setAchievementToDelete(null)}
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
                    <span>Yes, Delete Achievement</span>
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

export default AchievementManager;
