import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Briefcase, MapPin, Calendar, Building, X, RefreshCw, ChevronUp, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { fetchContentFromDatabase, persistContentToDatabase, deleteContentItemFromDatabase } from '../services/storageService.js';

export function ExperienceManager() {
  const [experienceList, setExperienceList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExp, setCurrentExp] = useState(null);
  const [techInput, setTechInput] = useState('');
  const [experienceToDelete, setExperienceToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [placement, setPlacement] = useState('default'); // 'default' (top) | 'bottom' | 'after'
  const [insertAfterId, setInsertAfterId] = useState('');

  const loadExperiences = async () => {
    setIsLoading(true);
    try {
      const data = await fetchContentFromDatabase('experience', []);
      setExperienceList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load experience from database', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExperiences();

    const handleUpdate = () => {
      fetchContentFromDatabase('experience', []).then((data) => {
        if (Array.isArray(data)) setExperienceList(data);
      });
    };

    window.addEventListener('portfolio_data_updated', handleUpdate);
    return () => window.removeEventListener('portfolio_data_updated', handleUpdate);
  }, []);

  const handleOpenEdit = (exp, index) => {
    const inferredType = exp.type || (
      exp.role?.toLowerCase().includes('hackathon') || exp.role?.toLowerCase().includes('hackthon') || exp.organization?.toLowerCase().includes('hackathon') || exp.organization?.toLowerCase().includes('hackthon')
        ? 'Hackathon'
        : exp.role?.toLowerCase().includes('intern')
          ? 'Internship'
          : 'Experience'
    );
    setCurrentExp({ ...exp, type: inferredType, _index: index });
    setTechInput(Array.isArray(exp.technologies) ? exp.technologies.join(', ') : '');
    setIsEditing(true);
  };

  const handleOpenNew = () => {
    setCurrentExp({
      _index: -1,
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      role: '',
      organization: '',
      type: 'Internship',
      period: '2026',
      location: 'Remote, India',
      description: '',
      technologies: ['React', 'JavaScript', 'Tailwind CSS'],
    });
    setTechInput('React, JavaScript, Tailwind CSS');
    setPlacement('default');
    setInsertAfterId(experienceList.length > 0 ? (experienceList[0].id || experienceList[0].role) : '');
    setIsEditing(true);
  };

  const handleMove = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= experienceList.length) return;
    const updated = [...experienceList];
    const [moved] = updated.splice(index, 1);
    updated.splice(target, 0, moved);
    setExperienceList(updated);
    await persistContentToDatabase('experience', updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const techArray = techInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const expToSave = {
      id: currentExp.id || `exp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      role: currentExp.role.trim(),
      organization: currentExp.organization.trim(),
      type: (currentExp.type || '').trim() || 'Experience',
      period: currentExp.period.trim(),
      location: currentExp.location.trim() || 'Remote',
      description: currentExp.description.trim(),
      technologies: techArray.length > 0 ? techArray : ['Web Development'],
    };

    let updated;
    if (currentExp._index >= 0) {
      updated = experienceList.map((exp, i) => (i === currentExp._index ? expToSave : exp));
    } else {
      if (placement === 'bottom') {
        updated = [...experienceList, expToSave];
      } else if (placement === 'after' && insertAfterId) {
        const idx = experienceList.findIndex((exp) => (exp.id || exp.role) === insertAfterId);
        if (idx !== -1) {
          updated = [...experienceList];
          updated.splice(idx + 1, 0, expToSave);
        } else {
          updated = [expToSave, ...experienceList];
        }
      } else {
        // default: at the top
        updated = [expToSave, ...experienceList];
      }
    }

    setIsSaving(true);
    setExperienceList(updated);
    await persistContentToDatabase('experience', updated);
    setIsSaving(false);
    setIsEditing(false);
  };

  const confirmDelete = async () => {
    if (!experienceToDelete) return;
    const targetId = experienceToDelete.id || experienceToDelete.role;
    setDeletingId(targetId);

    try {
      if (experienceToDelete.id) {
        await deleteContentItemFromDatabase('experience', experienceToDelete.id);
      }
      const updated = experienceList.filter((_, i) => i !== experienceToDelete._index);
      setExperienceList(updated);
      await persistContentToDatabase('experience', updated);
    } catch (err) {
      console.error('Failed to delete experience record:', err);
    } finally {
      setDeletingId(null);
      setExperienceToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight text-white font-kanit">
            Experience Management
          </h2>
          <p className="text-xs font-mono text-white/50">
            Add, update, and manage your internships, work roles, and professional contributions via MongoDB Database.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-neutral-200 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Experience</span>
        </button>
      </div>

      {/* Experience Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0E0E0E] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-white/40 font-mono text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
            <span>Loading experience records from database...</span>
          </div>
        ) : experienceList.length === 0 ? (
          <div className="p-12 text-center text-white/40 font-mono text-xs">
            No experience records found in database. Click "+ New Experience" to add your work roles.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase font-mono tracking-wider">
                  <th className="py-3.5 px-4 font-normal">#</th>
                  <th className="py-3.5 px-4 font-normal">Role & Title</th>
                  <th className="py-3.5 px-4 font-normal">Type</th>
                  <th className="py-3.5 px-4 font-normal">Organization</th>
                  <th className="py-3.5 px-4 font-normal">Period</th>
                  <th className="py-3.5 px-4 font-normal">Location</th>
                  <th className="py-3.5 px-4 font-normal">Tech Stack</th>
                  <th className="py-3.5 px-4 font-normal text-right">Order &amp; Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {experienceList.map((exp, idx) => (
                  <tr key={exp.id || idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 text-white/40">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-4 px-4 font-medium text-white">
                      <span className="font-bold tracking-tight uppercase font-kanit text-sm">
                        {exp.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold">
                        {exp.type || (
                          exp.role?.toLowerCase().includes('hackathon') || exp.role?.toLowerCase().includes('hackthon') || exp.organization?.toLowerCase().includes('hackathon') || exp.organization?.toLowerCase().includes('hackthon')
                            ? 'Hackathon'
                            : exp.role?.toLowerCase().includes('intern')
                              ? 'Internship'
                              : 'Experience'
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-purple-400 uppercase font-semibold">
                      {exp.organization}
                    </td>
                    <td className="py-4 px-4 text-white/60">
                      {exp.period}
                    </td>
                    <td className="py-4 px-4 text-white/60">
                      {exp.location}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {exp.technologies?.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[10px] text-white/70"
                          >
                            {t}
                          </span>
                        ))}
                        {exp.technologies?.length > 3 && (
                          <span className="text-[10px] font-mono text-white/40 self-center">
                            +{exp.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Reorder Buttons */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, -1)}
                          className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/30 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === experienceList.length - 1}
                          onClick={() => handleMove(idx, 1)}
                          className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/30 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(exp, idx)}
                          className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors cursor-pointer ml-1"
                          title="Edit Experience"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setExperienceToDelete({ ...exp, _index: idx })}
                          className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Experience"
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

      {/* Edit / Create Experience Modal */}
      {isEditing && currentExp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            data-lenis-prevent="true"
            className="w-full max-w-2xl max-h-[88vh] sm:max-h-[90vh] overflow-y-auto overscroll-contain custom-scrollbar rounded-3xl bg-[#0E0E0E] border border-white/15 p-5 sm:p-8 shadow-2xl my-auto"
            style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white font-kanit">
                {currentExp._index >= 0 ? 'Edit Experience' : 'Add New Experience'}
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
                    Role / Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FULL-STACK DEVELOPER INTERN"
                    value={currentExp.role}
                    onChange={(e) => setCurrentExp({ ...currentExp, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                    Organization / Company *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INAMIGOS FOUNDATION"
                    value={currentExp.organization}
                    onChange={(e) => setCurrentExp({ ...currentExp, organization: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>
              </div>

              {/* Experience Type / Category Selection */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase text-white/80 font-bold block">
                    Experience Type / Category *
                  </label>
                  <span className="text-[11px] font-mono text-purple-400">
                    Displayed on Portfolio badge
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Internship', 'Hackathon', 'Full-Time', 'Part-Time', 'Freelance', 'Research', 'Open Source', 'Apprenticeship', 'Competition'].map((preset) => {
                    const isSelected = currentExp.type?.toLowerCase() === preset.toLowerCase();
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setCurrentExp({ ...currentExp, type: preset })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.4)] border border-purple-400'
                            : 'bg-white/[0.04] text-white/70 hover:text-white border border-white/10 hover:border-white/20'
                        }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  required
                  placeholder="Or enter custom category (e.g. Hackathon, Fellowship, Mentorship...)"
                  value={currentExp.type || ''}
                  onChange={(e) => setCurrentExp({ ...currentExp, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                    Period / Year *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2024 - 2025"
                    value={currentExp.period}
                    onChange={(e) => setCurrentExp({ ...currentExp, period: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Remote, India"
                    value={currentExp.location}
                    onChange={(e) => setCurrentExp({ ...currentExp, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                  Description / Responsibilities *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Engineered high-performance interfaces, integrated backend services, streamlined user workflows..."
                  value={currentExp.description}
                  onChange={(e) => setCurrentExp({ ...currentExp, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono leading-relaxed"
                />
              </div>

              {/* Placement / Custom Ordering Selector (Only when adding new experience) */}
              {currentExp._index < 0 && experienceList.length > 0 && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 font-mono">
                  <label className="text-xs uppercase text-white/70 block font-semibold flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                    <span>Timeline Placement / Position</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPlacement('default')}
                      className={`px-3 py-2 rounded-xl text-xs border transition-all text-left cursor-pointer ${
                        placement === 'default'
                          ? 'bg-purple-500/20 border-purple-500/50 text-white font-semibold shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                          : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      <span className="block font-bold">At the Top (Default)</span>
                      <span className="text-[10px] text-white/40 block mt-0.5">Latest Role first</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlacement('bottom')}
                      className={`px-3 py-2 rounded-xl text-xs border transition-all text-left cursor-pointer ${
                        placement === 'bottom'
                          ? 'bg-purple-500/20 border-purple-500/50 text-white font-semibold shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                          : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      <span className="block font-bold">At the End</span>
                      <span className="text-[10px] text-white/40 block mt-0.5">Bottom of timeline</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlacement('after')}
                      className={`px-3 py-2 rounded-xl text-xs border transition-all text-left cursor-pointer ${
                        placement === 'after'
                          ? 'bg-purple-500/20 border-purple-500/50 text-white font-semibold shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                          : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      <span className="block font-bold">Custom: Insert After...</span>
                      <span className="text-[10px] text-white/40 block mt-0.5">Pick specific role</span>
                    </button>
                  </div>

                  {placement === 'after' && (
                    <div className="pt-2 border-t border-white/10">
                      <label className="text-[11px] uppercase text-white/60 block mb-1">
                        Insert directly after this role:
                      </label>
                      <select
                        value={insertAfterId}
                        onChange={(e) => setInsertAfterId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/20 text-white text-xs font-mono focus:outline-none focus:border-purple-400 cursor-pointer"
                      >
                        {experienceList.map((exp, idx) => (
                          <option key={exp.id || idx} value={exp.id || exp.role} className="bg-neutral-900 text-white">
                            #{idx + 1} — {exp.role} ({exp.organization})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                  Technologies / Skills (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, JavaScript, HTML5, CSS3, Git"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                />
                <span className="text-[10px] font-mono text-white/40 mt-1 block">
                  Enter technologies separated by commas (e.g., HTML5, CSS3, React).
                </span>
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
                    <span>Save Experience</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Trace Option) */}
      {experienceToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div data-lenis-prevent="true" className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-3xl bg-[#0E0E0E] border border-rose-500/30 p-6 sm:p-7 shadow-2xl space-y-5 my-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold uppercase tracking-tight text-white font-kanit">
                  Delete Experience?
                </h3>
                <p className="text-xs text-white/50 font-mono">
                  Permanent database removal
                </p>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed font-light">
              Are you sure you want to delete <span className="text-white font-bold font-mono">"{experienceToDelete.role} at {experienceToDelete.organization}"</span>? This will permanently remove it from both your live portfolio website and the MongoDB database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => setExperienceToDelete(null)}
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
                    <span>Yes, Delete Experience</span>
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

export default ExperienceManager;
