import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Code,
  X,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  SlidersHorizontal,
  Sparkles,
  Tag,
} from 'lucide-react';
import { skillGroups as initialSkillGroups } from '../data/skills.js';
import {
  fetchContentFromDatabase,
  persistContentToDatabase,
  deleteContentItemFromDatabase,
} from '../services/storageService.js';

export function SkillManager() {
  const [skillList, setSkillList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(null);
  const [skillsInput, setSkillsInput] = useState('');
  const [skillToDelete, setSkillToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [placement, setPlacement] = useState('bottom'); // 'top' | 'bottom' | 'after'
  const [insertAfterId, setInsertAfterId] = useState('');

  // Common quick-suggest tech tags
  const SUGGESTIONS = [
    'TypeScript',
    'Next.js',
    'Redux',
    'GraphQL',
    'Docker',
    'AWS',
    'PostgreSQL',
    'Redis',
    'Flutter',
    'React Native',
    'Linux',
    'CI/CD',
    'Git',
    'Jest',
    'Kubernetes',
  ];

  const loadSkills = async () => {
    setIsLoading(true);
    try {
      const data = await fetchContentFromDatabase('skills', initialSkillGroups);
      if (Array.isArray(data) && data.length > 0) {
        setSkillList(data);
      } else {
        setSkillList(initialSkillGroups);
      }
    } catch (e) {
      console.error('Failed to load skills from database', e);
      setSkillList(initialSkillGroups);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();

    const handleUpdate = () => {
      fetchContentFromDatabase('skills', initialSkillGroups).then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSkillList(data);
        }
      });
    };

    window.addEventListener('portfolio_data_updated', handleUpdate);
    return () => window.removeEventListener('portfolio_data_updated', handleUpdate);
  }, []);

  const handleOpenEdit = (group, index) => {
    setCurrentSkill({ ...group, _index: index });
    const skillsArray = Array.isArray(group.skills)
      ? group.skills
      : typeof group.skills === 'string'
      ? group.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    setSkillsInput(skillsArray.join(', '));
    setIsEditing(true);
  };

  const handleOpenNew = () => {
    const nextNum = String(skillList.length + 1).padStart(2, '0');
    setCurrentSkill({
      _index: -1,
      id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      number: nextNum,
      title: '',
      description: '',
      skills: ['React', 'JavaScript'],
    });
    setSkillsInput('React, JavaScript');
    setPlacement('bottom');
    setInsertAfterId(skillList.length > 0 ? (skillList[skillList.length - 1].id || skillList[skillList.length - 1].title) : '');
    setIsEditing(true);
  };

  const handleMove = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= skillList.length) return;
    const updated = [...skillList];
    const [moved] = updated.splice(index, 1);
    updated.splice(target, 0, moved);

    // Auto-renumber 01, 02, 03... to maintain clean portfolio order
    const renumbered = updated.map((item, idx) => ({
      ...item,
      number: String(idx + 1).padStart(2, '0'),
    }));

    setSkillList(renumbered);
    await persistContentToDatabase('skills', renumbered);
  };

  const handleAddSuggestion = (tag) => {
    const currentTags = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!currentTags.includes(tag)) {
      const nextTags = [...currentTags, tag];
      setSkillsInput(nextTags.join(', '));
    }
  };

  const handleRemovePill = (tagToRemove) => {
    const currentTags = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const filtered = currentTags.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase());
    setSkillsInput(filtered.join(', '));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const skillsArray = skillsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const groupToSave = {
      id: currentSkill.id || `skill_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      number: (currentSkill.number || '01').trim(),
      title: currentSkill.title.trim().toUpperCase(),
      description: currentSkill.description.trim(),
      skills: skillsArray.length > 0 ? skillsArray : ['Web Development'],
    };

    let updated;
    if (currentSkill._index >= 0) {
      updated = skillList.map((g, i) => (i === currentSkill._index ? groupToSave : g));
    } else {
      if (placement === 'top') {
        updated = [groupToSave, ...skillList];
      } else if (placement === 'after' && insertAfterId) {
        const idx = skillList.findIndex((g) => (g.id || g.title) === insertAfterId);
        if (idx !== -1) {
          updated = [...skillList];
          updated.splice(idx + 1, 0, groupToSave);
        } else {
          updated = [...skillList, groupToSave];
        }
      } else {
        // bottom
        updated = [...skillList, groupToSave];
      }
    }

    // Ensure clean sequential numbering
    const renumbered = updated.map((item, idx) => ({
      ...item,
      number: String(idx + 1).padStart(2, '0'),
    }));

    setIsSaving(true);
    setSkillList(renumbered);
    await persistContentToDatabase('skills', renumbered);
    setIsSaving(false);
    setIsEditing(false);
  };

  const confirmDelete = async () => {
    if (!skillToDelete) return;
    const targetId = skillToDelete.id || skillToDelete.title;
    setDeletingId(targetId);

    try {
      if (skillToDelete.id) {
        await deleteContentItemFromDatabase('skills', skillToDelete.id);
      }
      const updated = skillList.filter((_, i) => i !== skillToDelete._index);
      const renumbered = updated.map((item, idx) => ({
        ...item,
        number: String(idx + 1).padStart(2, '0'),
      }));
      setSkillList(renumbered);
      await persistContentToDatabase('skills', renumbered);
    } catch (err) {
      console.error('Failed to delete skill category:', err);
    } finally {
      setDeletingId(null);
      setSkillToDelete(null);
    }
  };

  // Preview pills list
  const previewPills = skillsInput
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black uppercase tracking-wider text-white font-kanit">
            SKILLS
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-xs font-kanit font-semibold text-purple-300">
            {skillList.length}
          </span>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D900B8] via-[#B600A8] to-[#7621B0] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition-all shadow-[0_0_15px_rgba(182,0,168,0.4)] cursor-pointer font-kanit"
        >
          <Plus className="w-4 h-4" />
          <span>New Skill Group</span>
        </button>
      </div>

      {/* Skills Table / List */}
      <div className="rounded-2xl border border-white/10 bg-[#0C0C0C] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-white/40 font-kanit text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
            <span>Loading skills records...</span>
          </div>
        ) : skillList.length === 0 ? (
          <div className="p-12 text-center text-white/40 font-kanit text-xs">
            No skill categories found. Click "+ New Skill Group" to add your skills.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-kanit">
              <thead>
                <tr className="border-b border-white/10 text-white/50 uppercase tracking-wider text-xs bg-white/[0.02]">
                  <th className="py-3.5 px-4 font-semibold">#</th>
                  <th className="py-3.5 px-4 font-semibold">Category Title</th>
                  <th className="py-3.5 px-4 font-semibold">Description</th>
                  <th className="py-3.5 px-4 font-semibold">Technologies / Skills</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs">
                {skillList.map((group, idx) => {
                  const pills = Array.isArray(group.skills)
                    ? group.skills
                    : typeof group.skills === 'string'
                    ? group.skills.split(',').map((s) => s.trim()).filter(Boolean)
                    : [];

                  return (
                    <tr key={group.id || idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 text-purple-400 font-bold text-sm font-kanit">
                        {group.number || String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-4 px-4 font-medium text-white">
                        <span className="font-bold tracking-tight uppercase font-kanit text-sm block">
                          {group.title}
                        </span>
                        <span className="text-[11px] text-white/40 font-kanit">
                          {pills.length} technologies
                        </span>
                      </td>
                      <td className="py-4 px-4 text-white/60 max-w-xs truncate text-xs leading-relaxed font-kanit">
                        {group.description}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {pills.slice(0, 5).map((t, pIdx) => (
                            <span
                              key={`${t}-${pIdx}`}
                              className="px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-xs text-white/90 font-kanit font-medium"
                            >
                              {t}
                            </span>
                          ))}
                          {pills.length > 5 && (
                            <span className="text-xs font-kanit font-medium text-purple-300 self-center">
                              +{pills.length - 5} more
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
                            disabled={idx === skillList.length - 1}
                            onClick={() => handleMove(idx, 1)}
                            className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/30 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(group, idx)}
                            className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors cursor-pointer ml-1"
                            title="Edit Skill Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSkillToDelete({ ...group, _index: idx })}
                            className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete Skill Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Create Skill Modal */}
      {isEditing && currentSkill && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            data-lenis-prevent="true"
            className="w-full max-w-2xl max-h-[88vh] sm:max-h-[90vh] overflow-y-auto overscroll-contain custom-scrollbar rounded-3xl bg-[#0E0E0E] border border-white/15 p-5 sm:p-8 shadow-2xl my-auto"
            style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Code className="w-4 h-4" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white font-kanit">
                  {currentSkill._index >= 0 ? 'Edit Skill Category' : 'Add New Skill Group'}
                </h3>
              </div>
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
                    Category Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LANGUAGES, FRONTEND, CLOUD & DEVOPS"
                    value={currentSkill.title}
                    onChange={(e) => setCurrentSkill({ ...currentSkill, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                    Number Prefix
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 01, 02"
                    value={currentSkill.number || ''}
                    onChange={(e) => setCurrentSkill({ ...currentSkill, number: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                  Description / Subtitle *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Core programming languages for algorithmic problem solving and software development."
                  value={currentSkill.description}
                  onChange={(e) => setCurrentSkill({ ...currentSkill, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono leading-relaxed"
                />
              </div>

              {/* Placement / Custom Ordering Selector (Only when adding new skill category) */}
              {currentSkill._index < 0 && skillList.length > 0 && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 font-mono">
                  <label className="text-xs uppercase text-white/70 block font-semibold flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Display Placement</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPlacement('top')}
                      className={`px-3 py-2 rounded-xl text-xs border transition-all text-left cursor-pointer ${
                        placement === 'top'
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-white font-semibold shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                          : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      <span className="block font-bold">At the Top</span>
                      <span className="text-[10px] text-white/40 block mt-0.5">First category</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlacement('bottom')}
                      className={`px-3 py-2 rounded-xl text-xs border transition-all text-left cursor-pointer ${
                        placement === 'bottom'
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-white font-semibold shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                          : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      <span className="block font-bold">At the End (Default)</span>
                      <span className="text-[10px] text-white/40 block mt-0.5">Bottom of list</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlacement('after')}
                      className={`px-3 py-2 rounded-xl text-xs border transition-all text-left cursor-pointer ${
                        placement === 'after'
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-white font-semibold shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                          : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      <span className="block font-bold">Custom: Insert After...</span>
                      <span className="text-[10px] text-white/40 block mt-0.5">Pick specific group</span>
                    </button>
                  </div>

                  {placement === 'after' && (
                    <div className="pt-2 border-t border-white/10">
                      <label className="text-[11px] uppercase text-white/60 block mb-1">
                        Insert directly after this category:
                      </label>
                      <select
                        value={insertAfterId}
                        onChange={(e) => setInsertAfterId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/20 text-white text-xs font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        {skillList.map((g, idx) => (
                          <option key={g.id || idx} value={g.id || g.title} className="bg-neutral-900 text-white">
                            #{g.number || idx + 1} — {g.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Technologies / Skills Input + Live Preview */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono uppercase text-white/60 block">
                      Technologies / Skills (comma-separated) *
                    </label>
                    <span className="text-[10px] font-mono text-cyan-400">
                      {previewPills.length} items entered
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. React, JavaScript, HTML5, CSS3, Tailwind CSS"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                {/* Live Pill Preview */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-white/50">
                    <Tag className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Live Portfolio Pill Preview (click &times; to remove):</span>
                  </div>
                  {previewPills.length === 0 ? (
                    <span className="text-[11px] font-mono text-white/30 italic block">
                      Type technologies above separated by commas to see live pills...
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {previewPills.map((pill, idx) => (
                        <span
                          key={`${pill}-${idx}`}
                          className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs text-white/90 font-mono transition-all hover:border-cyan-400/50 hover:bg-white/[0.08]"
                        >
                          <span>{pill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePill(pill)}
                            className="text-white/40 hover:text-rose-400 transition-colors cursor-pointer"
                            title={`Remove ${pill}`}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Add Suggestions */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/50">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Quick-Add Suggestions (click to add):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map((tag) => {
                      const alreadyAdded = previewPills.some((p) => p.toLowerCase() === tag.toLowerCase());
                      return (
                        <button
                          key={tag}
                          type="button"
                          disabled={alreadyAdded}
                          onClick={() => handleAddSuggestion(tag)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                            alreadyAdded
                              ? 'bg-white/[0.02] text-white/30 border border-white/5 cursor-not-allowed'
                              : 'bg-white/[0.04] text-white/70 hover:text-white hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400/40'
                          }`}
                        >
                          + {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
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
                    <span>Save Skill Group</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {skillToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div
            data-lenis-prevent="true"
            className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-3xl bg-[#0E0E0E] border border-rose-500/30 p-6 sm:p-7 shadow-2xl space-y-5 my-auto"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold uppercase tracking-tight text-white font-kanit">
                  Delete Skill Category?
                </h3>
                <p className="text-xs text-white/50 font-mono">
                  Permanent database removal
                </p>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed font-light">
              Are you sure you want to delete the category{' '}
              <span className="text-white font-bold font-mono">
                "#{skillToDelete.number || ''} {skillToDelete.title}"
              </span>
              ? This will remove all associated technology pills from both your live portfolio website and the MongoDB database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => setSkillToDelete(null)}
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
                    <span>Yes, Delete Category</span>
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

export default SkillManager;
