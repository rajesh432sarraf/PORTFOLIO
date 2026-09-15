import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Briefcase, MapPin, Calendar, Building, X } from 'lucide-react';
import { experiences as initialExperiences } from '../data/experience.js';

export function ExperienceManager() {
  const [experienceList, setExperienceList] = useState(() => {
    try {
      const saved = localStorage.getItem('rajesh_portfolio_experience');
      return saved ? JSON.parse(saved) : initialExperiences;
    } catch (e) {
      return initialExperiences;
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentExp, setCurrentExp] = useState(null);
  const [techInput, setTechInput] = useState('');

  const saveToStorage = (updated) => {
    setExperienceList(updated);
    try {
      localStorage.setItem('rajesh_portfolio_experience', JSON.stringify(updated));
      window.dispatchEvent(new Event('portfolio_data_updated'));
    } catch (e) {
      console.error('Failed to save experience to localStorage', e);
    }
  };

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this experience record?')) {
      const updated = experienceList.filter((_, i) => i !== index);
      saveToStorage(updated);
    }
  };

  const handleOpenEdit = (exp, index) => {
    setCurrentExp({ ...exp, _index: index });
    setTechInput(Array.isArray(exp.technologies) ? exp.technologies.join(', ') : '');
    setIsEditing(true);
  };

  const handleOpenNew = () => {
    setCurrentExp({
      _index: -1,
      role: '',
      organization: '',
      period: '2025',
      location: 'Remote, India',
      description: '',
      technologies: ['React', 'JavaScript', 'Tailwind CSS'],
    });
    setTechInput('React, JavaScript, Tailwind CSS');
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const techArray = techInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const expToSave = {
      role: currentExp.role.trim(),
      organization: currentExp.organization.trim(),
      period: currentExp.period.trim(),
      location: currentExp.location.trim() || 'Remote',
      description: currentExp.description.trim(),
      technologies: techArray.length > 0 ? techArray : ['Web Development'],
    };

    let updated;
    if (currentExp._index >= 0) {
      updated = experienceList.map((exp, i) => (i === currentExp._index ? expToSave : exp));
    } else {
      updated = [expToSave, ...experienceList];
    }

    saveToStorage(updated);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight text-white font-kanit">
            Experience Management
          </h2>
          <p className="text-xs font-mono text-white/50">
            Add, update, and manage your internships, work roles, and professional contributions.
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
      <div className="rounded-2xl bg-[#0C0C0C] border border-white/10 overflow-hidden">
        {experienceList.length === 0 ? (
          <div className="p-12 text-center text-white/40 font-mono text-xs">
            <Briefcase className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>No experience records added yet.</p>
            <button
              type="button"
              onClick={handleOpenNew}
              className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-colors cursor-pointer"
            >
              + Add First Experience
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-mono uppercase tracking-widest text-white/40 bg-white/[0.02]">
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Role &amp; Title</th>
                  <th className="py-3.5 px-4">Organization</th>
                  <th className="py-3.5 px-4">Period</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Tech Stack</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs">
                {experienceList.map((exp, idx) => (
                  <tr key={`${exp.role}-${idx}`} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-mono text-white/40">0{idx + 1}</td>
                    <td className="py-4 px-4 font-bold text-white max-w-[200px]">
                      <div>{exp.role}</div>
                    </td>
                    <td className="py-4 px-4 text-[#BBCCD7] font-mono text-xs">{exp.organization}</td>
                    <td className="py-4 px-4 text-white/60 font-mono text-xs">{exp.period}</td>
                    <td className="py-4 px-4 text-white/50 font-mono text-xs">{exp.location}</td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {exp.technologies?.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[10px] font-mono text-white/70"
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
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(exp, idx)}
                          className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
                          title="Edit Experience"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(idx)}
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0E0E0E] border border-white/15 p-6 sm:p-8 shadow-2xl">
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
                    placeholder="e.g. Web Developer Intern"
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
                    placeholder="e.g. InAmigos Foundation"
                    value={currentExp.organization}
                    onChange={(e) => setCurrentExp({ ...currentExp, organization: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                    Period / Duration *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2024 or May 2024 - Aug 2024"
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
                    placeholder="e.g. Remote, India / Hyderabad"
                    value={currentExp.location}
                    onChange={(e) => setCurrentExp({ ...currentExp, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                  Description of Contributions &amp; Achievements *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Engineered responsive web interfaces, optimized performance, collaborated with core team..."
                  value={currentExp.description}
                  onChange={(e) => setCurrentExp({ ...currentExp, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 leading-relaxed"
                />
              </div>

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
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2 rounded-full border border-white/20 text-xs font-mono uppercase hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-white text-black text-xs font-bold uppercase hover:bg-neutral-200 transition-colors"
                >
                  Save Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExperienceManager;
