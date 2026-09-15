import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Star, ExternalLink, Image as ImageIcon, Check } from 'lucide-react';
import { projects as initialProjects } from '../data/projects.js';

export function ProjectManager() {
  const [projectList, setProjectList] = useState(() => {
    try {
      const saved = localStorage.getItem('rajesh_portfolio_projects');
      return saved ? JSON.parse(saved) : initialProjects;
    } catch (e) {
      return initialProjects;
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

  const saveToStorage = (updated) => {
    setProjectList(updated);
    try {
      localStorage.setItem('rajesh_portfolio_projects', JSON.stringify(updated));
      window.dispatchEvent(new Event('portfolio_data_updated'));
    } catch (e) {
      console.error('Failed to save projects to localStorage', e);
    }
  };

  const handleToggleFeatured = (id) => {
    const updated = projectList.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p));
    saveToStorage(updated);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const updated = projectList.filter((p) => p.id !== id);
      saveToStorage(updated);
    }
  };

  const handleOpenEdit = (project) => {
    setCurrentProject(project);
    setIsEditing(true);
  };

  const handleOpenNew = () => {
    setCurrentProject({
      id: `proj_${Date.now()}`,
      number: `0${projectList.length + 1}`,
      title: '',
      category: 'AI / WEB PRODUCT',
      year: new Date().getFullYear().toString(),
      description: '',
      technologies: ['React', 'JavaScript'],
      image: '/images/projects/cutzen-main.jpg',
      gallery: ['/images/projects/cutzen-main.jpg'],
      github: '',
      live: '',
      featured: true,
    });
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const exists = projectList.find((p) => p.id === currentProject.id);
    let updated;
    if (exists) {
      updated = projectList.map((p) => (p.id === currentProject.id ? currentProject : p));
    } else {
      updated = [...projectList, currentProject];
    }
    saveToStorage(updated);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight text-white">
            Projects Management
          </h2>
          <p className="text-xs font-mono text-white/50">
            Create, edit, feature, and manage portfolio project showcases.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-neutral-200 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Table */}
      <div className="rounded-2xl bg-[#0C0C0C] border border-white/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[11px] font-mono uppercase tracking-widest text-white/40 bg-white/[0.02]">
              <th className="py-3.5 px-4">#</th>
              <th className="py-3.5 px-4">Title</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Year</th>
              <th className="py-3.5 px-4">Featured</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-xs">
            {projectList.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-4 font-mono text-white/40">{p.number}</td>
                <td className="py-4 px-4 font-semibold text-white">
                  <div className="flex items-center gap-2">
                    <span>{p.title}</span>
                    {p.live && (
                      <a href={p.live} target="_blank" rel="noreferrer" className="text-white/40 hover:text-white">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4 text-white/60 font-mono text-[11px]">{p.category}</td>
                <td className="py-4 px-4 text-white/60 font-mono">{p.year}</td>
                <td className="py-4 px-4">
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(p.id)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      p.featured
                        ? 'bg-amber-400/10 border-amber-400/30 text-amber-400'
                        : 'bg-white/[0.02] border-white/10 text-white/30'
                    }`}
                    title="Toggle featured showcase"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors"
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

      {/* Edit/Create Modal */}
      {isEditing && currentProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0E0E0E] border border-white/15 p-6 sm:p-8 shadow-2xl">
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-6">
              {currentProject.title ? `Edit ${currentProject.title}` : 'Create New Project'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={currentProject.title}
                    onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={currentProject.category}
                    onChange={(e) => setCurrentProject({ ...currentProject, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-white/60 block mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  value={currentProject.description}
                  onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">GitHub URL</label>
                  <input
                    type="text"
                    value={currentProject.github || ''}
                    onChange={(e) => setCurrentProject({ ...currentProject, github: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">Live URL</label>
                  <input
                    type="text"
                    value={currentProject.live || ''}
                    onChange={(e) => setCurrentProject({ ...currentProject, live: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2 rounded-full border border-white/20 text-xs font-mono uppercase hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-white text-black text-xs font-bold uppercase hover:bg-neutral-200"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectManager;
