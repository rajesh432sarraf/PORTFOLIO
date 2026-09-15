import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Trophy, Award, Calendar, ExternalLink, X } from 'lucide-react';
import { achievements as initialAchievements } from '../data/achievements.js';

export function AchievementManager() {
  const [achievementList, setAchievementList] = useState(() => {
    try {
      const saved = localStorage.getItem('rajesh_portfolio_achievements');
      return saved ? JSON.parse(saved) : initialAchievements;
    } catch (e) {
      return initialAchievements;
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentAch, setCurrentAch] = useState(null);

  const saveToStorage = (updated) => {
    setAchievementList(updated);
    try {
      localStorage.setItem('rajesh_portfolio_achievements', JSON.stringify(updated));
      window.dispatchEvent(new Event('portfolio_data_updated'));
    } catch (e) {
      console.error('Failed to save achievements to localStorage', e);
    }
  };

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this achievement record?')) {
      const updated = achievementList.filter((_, i) => i !== index);
      saveToStorage(updated);
    }
  };

  const handleOpenEdit = (ach, index) => {
    setCurrentAch({ ...ach, _index: index });
    setIsEditing(true);
  };

  const handleOpenNew = () => {
    setCurrentAch({
      _index: -1,
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

  const handleSave = (e) => {
    e.preventDefault();
    const achToSave = {
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

    saveToStorage(updated);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight text-white font-kanit">
            Achievements &amp; Hackathons
          </h2>
          <p className="text-xs font-mono text-white/50">
            Showcase your hackathon wins, national recognitions, and competitive milestones.
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
        {achievementList.length === 0 ? (
          <div className="p-12 text-center text-white/40 font-mono text-xs">
            <Trophy className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>No achievement records added yet.</p>
            <button
              type="button"
              onClick={handleOpenNew}
              className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-colors cursor-pointer"
            >
              + Add First Achievement
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-mono uppercase tracking-widest text-white/40 bg-white/[0.02]">
                  <th className="py-3.5 px-4">Badge</th>
                  <th className="py-3.5 px-4">Title &amp; Award</th>
                  <th className="py-3.5 px-4">Event / Hackathon</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Year</th>
                  <th className="py-3.5 px-4">Highlight</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs">
                {achievementList.map((ach, idx) => (
                  <tr key={`${ach.title}-${idx}`} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-amber-400">
                      <span className="px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 text-[11px]">
                        {ach.number}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-white max-w-[200px]">
                      <div>{ach.title}</div>
                    </td>
                    <td className="py-4 px-4 text-[#BBCCD7] font-mono text-xs">{ach.event}</td>
                    <td className="py-4 px-4">
                      <span className="text-emerald-400 font-mono text-[11px] bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                        {ach.project}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-white/60 font-mono text-xs">{ach.year}</td>
                    <td className="py-4 px-4 text-white/50 font-mono text-xs max-w-[150px] truncate">
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
                          onClick={() => handleDelete(idx)}
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0E0E0E] border border-white/15 p-6 sm:p-8 shadow-2xl">
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
                    placeholder="e.g. 1ST PLACE WINNER or FINALIST"
                    value={currentAch.title}
                    onChange={(e) => setCurrentAch({ ...currentAch, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                    Number / Badge *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 01, 02, SIH"
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
                    placeholder="e.g. SMART INDIA HACKATHON (SIH)"
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
                    placeholder="e.g. CLEARITYNOTE AI or CUTZEN"
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
                    Highlight / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Top 3 Podium Finish / National Winner"
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
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2 rounded-full border border-white/20 text-xs font-mono uppercase hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-white text-black text-xs font-bold uppercase hover:bg-neutral-200 transition-colors"
                >
                  Save Achievement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AchievementManager;
