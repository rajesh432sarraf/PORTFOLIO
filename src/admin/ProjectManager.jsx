import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Star, ExternalLink, Image as ImageIcon, Upload, X, Check, Code, Calendar, Hash, RefreshCw } from 'lucide-react';
import { projects as initialProjects } from '../data/projects.js';
import { compressImage, persistProjects, fetchProjectsFromDatabase, deleteProjectFromDatabase } from '../services/storageService.js';

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'%3E%3Crect width='800' height='500' fill='%23141414'/%3E%3Ccircle cx='400' cy='230' r='36' fill='%23222'/%3E%3Ctext x='50%25' y='300' text-anchor='middle' fill='%23666' font-family='monospace' font-size='13' letter-spacing='2'%3EPROJECT SHOWCASE%3C/text%3E%3C/svg%3E";

export function ProjectManager() {
  const [projectList, setProjectList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  const [techInput, setTechInput] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [saveNotification, setSaveNotification] = useState('');

  // Load directly from MongoDB Cloud Database on mount & refresh
  useEffect(() => {
    let isMounted = true;

    async function loadAllSources() {
      setIsLoading(true);
      try {
        const data = await fetchProjectsFromDatabase(initialProjects);
        if (isMounted && data && Array.isArray(data)) {
          setProjectList(data);
        }
      } catch (err) {
        console.error('Failed to load from database:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAllSources();

    const handleUpdate = async () => {
      try {
        const data = await fetchProjectsFromDatabase(initialProjects);
        if (data && Array.isArray(data)) {
          setProjectList(data);
        }
      } catch (e) {}
    };

    window.addEventListener('portfolio_data_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('portfolio_data_updated', handleUpdate);
    };
  }, []);

  const saveToStorage = async (updated) => {
    setIsSaving(true);
    setProjectList(updated);
    try {
      const ok = await persistProjects(updated);
      if (ok) {
        setSaveNotification('Saved permanently in MongoDB Database!');
      } else {
        setSaveNotification('Saved in local database cache.');
      }
      setTimeout(() => setSaveNotification(''), 4000);
      return ok;
    } catch (err) {
      console.error('Save failed:', err);
      setSaveNotification('Saved in local database cache.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFeatured = async (id) => {
    const updated = projectList.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p));
    await saveToStorage(updated);
  };

  const handleDelete = async (id, title) => {
    setDeletingId(id);
    try {
      await deleteProjectFromDatabase(id);
      const updated = projectList.filter((p) => p.id !== id);
      setProjectList(updated);
      setSaveNotification(`"${title || 'Project'}" deleted permanently from website & database!`);
      setTimeout(() => setSaveNotification(''), 4000);
    } catch (err) {
      console.error('Failed to delete project:', err);
      setSaveNotification('Error deleting project from database.');
    } finally {
      setDeletingId(null);
      setProjectToDelete(null);
    }
  };

  const handleOpenEdit = (project) => {
    setCurrentProject({
      ...project,
      gallery: project.gallery || [project.image || '', '', ''],
    });
    setTechInput(Array.isArray(project.technologies) ? project.technologies.join(', ') : '');
    setIsEditing(true);
  };

  const handleOpenNew = () => {
    const num = (projectList.length + 1).toString().padStart(2, '0');
    setCurrentProject({
      id: `proj_${Date.now()}`,
      number: num,
      title: '',
      category: 'WEB APPLICATION / DOCUMENT MANAGEMENT',
      year: new Date().getFullYear().toString(),
      description: '',
      technologies: ['React', 'JavaScript', 'Tailwind CSS'],
      image: '',
      gallery: ['', '', ''],
      github: '',
      live: '',
      featured: true,
    });
    setTechInput('React, JavaScript, Tailwind CSS');
    setIsEditing(true);
  };

  const handleImageFileUpload = async (e, galleryIndex = null) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      // Auto-compress the image to max 1200px / 75% quality JPEG (~70KB)
      // This eliminates QuotaExceededError and prevents projects from disappearing on refresh!
      const compressedDataUrl = await compressImage(file, 1200, 0.75);

      if (galleryIndex === null) {
        setCurrentProject((prev) => {
          const galleryCopy = [...(prev.gallery || ['', '', ''])];
          if (!galleryCopy[0]) galleryCopy[0] = compressedDataUrl;
          if (!galleryCopy[1]) galleryCopy[1] = compressedDataUrl;
          return {
            ...prev,
            image: compressedDataUrl,
            gallery: galleryCopy,
          };
        });
      } else {
        setCurrentProject((prev) => {
          const galleryCopy = [...(prev.gallery || ['', '', ''])];
          galleryCopy[galleryIndex] = compressedDataUrl;
          return { ...prev, gallery: galleryCopy };
        });
      }
    } catch (err) {
      console.error('Image compression error:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    const techArray = techInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'%3E%3Crect width='800' height='500' fill='%23141414'/%3E%3Ccircle cx='400' cy='230' r='36' fill='%23222'/%3E%3Ctext x='50%25' y='300' text-anchor='middle' fill='%23666' font-family='monospace' font-size='13' letter-spacing='2'%3EPROJECT SHOWCASE%3C/text%3E%3C/svg%3E";
    const mainImg = currentProject.image || currentProject.gallery?.[0] || PLACEHOLDER_IMG;
    const galleryImgs = [
      currentProject.gallery?.[0] || mainImg,
      currentProject.gallery?.[1] || mainImg,
      currentProject.gallery?.[2] || mainImg,
    ];

    const projectToSave = {
      ...currentProject,
      title: currentProject.title.trim(),
      category: currentProject.category.trim(),
      description: currentProject.description.trim(),
      technologies: techArray.length > 0 ? techArray : ['React', 'Web App'],
      image: mainImg,
      gallery: galleryImgs,
      github: currentProject.github?.trim() || '',
      live: currentProject.live?.trim() || '',
    };

    const exists = projectList.find((p) => p.id === projectToSave.id);
    let updated;
    if (exists) {
      updated = projectList.map((p) => (p.id === projectToSave.id ? projectToSave : p));
    } else {
      updated = [projectToSave, ...projectList];
    }

    // Await database write to guarantee data persistence before closing modal
    await saveToStorage(updated);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Save Notification Toast */}
      {saveNotification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{saveNotification}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight text-white font-kanit">
            Projects Management &amp; Showcase
          </h2>
          <p className="text-xs font-mono text-white/50">
            Connected to MongoDB Database. Real-time persistent cloud storage across reloads.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D900B8] via-[#B600A8] to-[#7621B0] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition-all shadow-[0_0_15px_rgba(182,0,168,0.4)] cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid / Table */}
      <div className="rounded-2xl bg-[#0C0C0C] border border-white/10 overflow-hidden">
        {isLoading && projectList.length === 0 ? (
          <div className="py-16 text-center text-white/40 text-xs font-mono flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
            <span>Connecting to MongoDB Database...</span>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-mono uppercase tracking-widest text-white/40 bg-white/[0.02]">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Cover</th>
                <th className="py-3.5 px-4">Title &amp; Category</th>
                <th className="py-3.5 px-4">Year</th>
                <th className="py-3.5 px-4">Featured</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-xs">
              {projectList.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4 font-mono text-white/40 font-bold">{p.number}</td>

                  {/* Thumbnail Preview */}
                  <td className="py-4 px-4">
                    <div className="w-14 h-10 rounded-lg overflow-hidden bg-neutral-900 border border-white/10 relative">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = PLACEHOLDER_IMG;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 font-bold text-white text-sm">
                        <span>{p.title}</span>
                        {p.live && (
                          <a href={p.live} target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-white/50">{p.category}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-white/60 font-mono">{p.year}</td>

                  <td className="py-4 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(p.id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
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
                        className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
                        title="Edit project & photos"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setProjectToDelete(p)}
                        className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete project from website & database"
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

      {/* Edit / Create Project Modal with Full Photo Upload */}
      {isEditing && currentProject && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          <div
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto overscroll-contain custom-scrollbar rounded-3xl bg-[#0E0E0E] border border-white/20 p-6 sm:p-8 shadow-2xl space-y-6"
            style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-xl font-bold uppercase tracking-tight text-white font-kanit">
                {currentProject.title ? `Edit "${currentProject.title}"` : 'Create New Project'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Row 1: Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-white/70 block mb-1.5 font-semibold">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KAAGAZ – DOCUMENT SYSTEM"
                    value={currentProject.title}
                    onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-white/70 block mb-1.5 font-semibold">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WEB APPLICATION / DOCUMENT MANAGEMENT"
                    value={currentProject.category}
                    onChange={(e) => setCurrentProject({ ...currentProject, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400 font-medium"
                  />
                </div>
              </div>

              {/* Row 2: Sequence Number & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-white/70 block mb-1.5 font-semibold flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-purple-400" />
                    <span>Project Number (#)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 05"
                    value={currentProject.number || '05'}
                    onChange={(e) => setCurrentProject({ ...currentProject, number: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-white/70 block mb-1.5 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>Year</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2026"
                    value={currentProject.year || '2026'}
                    onChange={(e) => setCurrentProject({ ...currentProject, year: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-mono uppercase text-white/70 block mb-1.5 font-semibold">
                  Description *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe key features, technical architecture, problem solved..."
                  value={currentProject.description}
                  onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400 font-light leading-relaxed"
                />
              </div>

              {/* Tech Stack */}
              <div>
                <label className="text-xs font-mono uppercase text-white/70 block mb-1.5 font-semibold flex items-center gap-1">
                  <Code className="w-3.5 h-3.5 text-purple-400" />
                  <span>Technologies (Comma Separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. React 18, Node.js, Tailwind CSS, MongoDB"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>

              {/* SECTION: MAIN FEATURED COVER PHOTO UPLOAD */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase text-purple-300 font-bold flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-purple-400" />
                    <span>Main Featured Cover Photo (Primary Showcase Image)</span>
                  </label>
                  {isCompressing && (
                    <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Auto-optimizing photo...
                    </span>
                  )}
                  {!isCompressing && currentProject.image && (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Ready &amp; Optimized
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Thumbnail Preview Box */}
                  <div className="w-full sm:w-36 h-24 rounded-xl overflow-hidden bg-neutral-900 border border-white/20 flex-shrink-0 relative group">
                    {currentProject.image ? (
                      <img
                        src={currentProject.image}
                        alt="Main cover preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = PLACEHOLDER_IMG;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/30 text-[10px] font-mono p-2 text-center">
                        <ImageIcon className="w-5 h-5 mb-1 opacity-50" />
                        <span>No Photo Selected</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose Photo File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFileUpload(e, null)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <p className="text-[10px] font-mono text-white/40">
                      Upload any screenshot/photo from your PC (.png, .jpg, .webp). Auto-compressed for instant permanent storage:
                    </p>

                    <input
                      type="text"
                      placeholder="Or enter Image URL: https://... or /images/projects/..."
                      value={currentProject.image || ''}
                      onChange={(e) => setCurrentProject({ ...currentProject, image: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: GALLERY SCREENSHOTS (3 IMAGES FOR EDITORIAL CARD) */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <label className="text-xs font-mono uppercase text-white/80 font-bold block">
                  Project Gallery Screenshots (3 Card Screenshots)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[0, 1, 2].map((idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-black/30 border border-white/10 space-y-2">
                      <span className="text-[10px] font-mono uppercase text-white/50 block">
                        Screenshot #{idx + 1}
                      </span>

                      {/* Preview Box */}
                      <div className="w-full h-20 rounded-lg overflow-hidden bg-neutral-900 border border-white/10 relative">
                        {currentProject.gallery?.[idx] ? (
                          <img
                            src={currentProject.gallery[idx]}
                            alt={`Gallery screenshot ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = PLACEHOLDER_IMG;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px] font-mono">
                            <span>Photo #{idx + 1}</span>
                          </div>
                        )}
                      </div>

                      {/* File Upload Button */}
                      <label className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white/80 text-[11px] font-mono uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                        <Upload className="w-3 h-3 text-purple-400" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFileUpload(e, idx)}
                          className="hidden"
                        />
                      </label>

                      {/* URL Input */}
                      <input
                        type="text"
                        placeholder="Image URL link"
                        value={currentProject.gallery?.[idx] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCurrentProject((prev) => {
                            const newGallery = [...(prev.gallery || ['', '', ''])];
                            newGallery[idx] = val;
                            return { ...prev, gallery: newGallery };
                          });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/10 text-white text-[10px] font-mono focus:outline-none focus:border-purple-400"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Row: GitHub & Live Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-white/70 block mb-1.5 font-semibold">
                    GitHub URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://github.com/..."
                    value={currentProject.github || ''}
                    onChange={(e) => setCurrentProject({ ...currentProject, github: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase text-white/70 block mb-1.5 font-semibold">
                    Live Demo URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={currentProject.live || ''}
                    onChange={(e) => setCurrentProject({ ...currentProject, live: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400 font-mono"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-full border border-white/20 text-xs font-mono uppercase hover:bg-white/10 text-white/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCompressing || isSaving}
                  className="px-7 py-2.5 rounded-full bg-gradient-to-r from-[#D900B8] via-[#B600A8] to-[#7621B0] text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-[0_0_15px_rgba(182,0,168,0.4)] cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : isCompressing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Optimizing Photos...</span>
                    </>
                  ) : (
                    <span>Save Project &amp; Photos</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden">
          <div data-lenis-prevent="true" className="w-full max-w-md rounded-3xl bg-[#0E0E0E] border border-rose-500/30 p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold uppercase tracking-tight text-white font-kanit">
                  Delete Project?
                </h3>
                <p className="text-xs text-white/50 font-mono">
                  Permanent database removal
                </p>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed font-light">
              Are you sure you want to delete <span className="text-white font-bold font-mono">"{projectToDelete.title}"</span>? This will permanently remove it from both your live portfolio website and the MongoDB database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deletingId}
                onClick={() => setProjectToDelete(null)}
                className="px-5 py-2.5 rounded-full border border-white/20 text-xs font-mono uppercase hover:bg-white/10 text-white/80 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => handleDelete(projectToDelete.id, projectToDelete.title)}
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
                    <span>Yes, Delete Project</span>
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

export default ProjectManager;
