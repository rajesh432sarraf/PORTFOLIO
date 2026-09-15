import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Award, CheckCircle2, ExternalLink, X, RefreshCw, Upload, Image as ImageIcon, Link } from 'lucide-react';
import { fetchContentFromDatabase, persistContentToDatabase, deleteContentItemFromDatabase } from '../services/storageService.js';

export function CertificateManager() {
  const [certList, setCertList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCert, setCurrentCert] = useState(null);
  const [certToDelete, setCertToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [imageMode, setImageMode] = useState('upload');
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const loadCertificates = async () => {
    setIsLoading(true);
    try {
      const data = await fetchContentFromDatabase('certificates', []);
      setCertList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load certificates from database', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
    const handleUpdate = () => {
      fetchContentFromDatabase('certificates', []).then((data) => {
        if (Array.isArray(data)) setCertList(data);
      });
    };
    window.addEventListener('portfolio_data_updated', handleUpdate);
    return () => window.removeEventListener('portfolio_data_updated', handleUpdate);
  }, []);

  const handleOpenEdit = (cert) => {
    setCurrentCert({ ...cert });
    setImagePreview(cert.image || null);
    setImageMode('upload');
    setIsEditing(true);
  };

  const handleOpenNew = () => {
    setCurrentCert({
      id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: '',
      issuer: '',
      year: new Date().getFullYear().toString(),
      badge: 'VERIFIED CREDENTIAL',
      credentialUrl: '',
      image: '',
    });
    setImagePreview(null);
    setImageMode('upload');
    setIsEditing(true);
  };

  /* ── Image helpers ── */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select a valid image file.'); return; }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      if (file.size > 800 * 1024) {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 1200;
          let { width, height } = img;
          if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setImagePreview(compressed);
          setCurrentCert((prev) => ({ ...prev, image: compressed }));
        };
        img.src = base64;
      } else {
        setImagePreview(base64);
        setCurrentCert((prev) => ({ ...prev, image: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (url) => {
    setCurrentCert((prev) => ({ ...prev, image: url }));
    setImagePreview(url || null);
  };

  const clearImage = () => {
    setImagePreview(null);
    setCurrentCert((prev) => ({ ...prev, image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const certToSave = {
      id: currentCert.id || `cert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: currentCert.title.trim(),
      issuer: currentCert.issuer.trim(),
      year: currentCert.year.trim(),
      badge: currentCert.badge.trim() || 'VERIFIED CREDENTIAL',
      credentialUrl: currentCert.credentialUrl.trim(),
      image: currentCert.image || '',
    };

    const exists = certList.find((c) => c.id === certToSave.id);
    let updated;
    if (exists) {
      updated = certList.map((c) => (c.id === certToSave.id ? certToSave : c));
    } else {
      updated = [certToSave, ...certList];
    }

    setIsSaving(true);
    setCertList(updated);
    await persistContentToDatabase('certificates', updated);
    setIsSaving(false);
    setIsEditing(false);
  };

  const confirmDelete = async () => {
    if (!certToDelete) return;
    const targetId = certToDelete.id || certToDelete.title;
    setDeletingId(targetId);
    try {
      if (certToDelete.id) await deleteContentItemFromDatabase('certificates', certToDelete.id);
      const updated = certList.filter((c) => c.id !== certToDelete.id);
      setCertList(updated);
      await persistContentToDatabase('certificates', updated);
    } catch (err) {
      console.error('Failed to delete certificate:', err);
    } finally {
      setDeletingId(null);
      setCertToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight text-white font-kanit">
            Certifications &amp; Credentials
          </h2>
          <p className="text-xs font-mono text-white/50">
            Add and manage your verified certificates, specialized courses, and licenses via MongoDB Database.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenNew}
          className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-neutral-200 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Certificate</span>
        </button>
      </div>

      {/* Certificates Table */}
      <div className="rounded-2xl bg-[#0C0C0C] border border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-white/40 font-mono text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
            <span>Loading certificates from database...</span>
          </div>
        ) : certList.length === 0 ? (
          <div className="p-12 text-center text-white/40 font-mono text-xs">
            No certificates found in database. Click "+ New Certificate" to add your verified credentials.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-normal">Photo</th>
                  <th className="py-3.5 px-4 font-normal">#</th>
                  <th className="py-3.5 px-4 font-normal">Certificate Title</th>
                  <th className="py-3.5 px-4 font-normal">Issuer / Platform</th>
                  <th className="py-3.5 px-4 font-normal">Year</th>
                  <th className="py-3.5 px-4 font-normal">Badge</th>
                  <th className="py-3.5 px-4 font-normal">Link</th>
                  <th className="py-3.5 px-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {certList.map((cert, idx) => (
                  <tr key={cert.id || idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      {cert.image ? (
                        <img src={cert.image} alt={cert.title} className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/20">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-white/40">{String(idx + 1).padStart(2, '0')}</td>
                    <td className="py-4 px-4 text-white font-bold tracking-tight uppercase font-kanit text-sm">{cert.title}</td>
                    <td className="py-4 px-4 text-white/70">{cert.issuer}</td>
                    <td className="py-4 px-4 text-white/50">{cert.year}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {cert.badge || 'VERIFIED CREDENTIAL'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {cert.credentialUrl ? (
                        <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-white/60 hover:text-white inline-flex items-center gap-1 font-mono text-xs underline">
                          <span>Verify</span><ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-white/30 font-mono text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => handleOpenEdit(cert)} className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors cursor-pointer" title="Edit Certificate">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => setCertToDelete(cert)} className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer" title="Delete Certificate">
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

      {/* Edit / Create Certificate Modal */}
      {isEditing && currentCert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          <div
            data-lenis-prevent="true"
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto overscroll-contain custom-scrollbar rounded-3xl bg-[#0E0E0E] border border-white/15 p-6 sm:p-8 shadow-2xl"
            style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white font-kanit">
                {certList.some((c) => c.id === currentCert.id) ? 'Edit Certificate' : 'Add New Certificate'}
              </h3>
              <button type="button" onClick={() => setIsEditing(false)} className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-mono uppercase text-white/60 block mb-1">Certificate Title *</label>
                <input
                  type="text" required
                  placeholder="e.g. Meta Front-End Developer Professional Certificate"
                  value={currentCert.title}
                  onChange={(e) => setCurrentCert({ ...currentCert, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">Issuing Organization / Platform *</label>
                  <input
                    type="text" required placeholder="e.g. Meta / Coursera"
                    value={currentCert.issuer}
                    onChange={(e) => setCurrentCert({ ...currentCert, issuer: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">Year *</label>
                  <input
                    type="text" required placeholder="e.g. 2025"
                    value={currentCert.year}
                    onChange={(e) => setCurrentCert({ ...currentCert, year: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-white/60 block mb-1">Badge Tag / Label</label>
                <input
                  type="text" placeholder="e.g. VERIFIED CREDENTIAL or HONORS SPECIALIZATION"
                  value={currentCert.badge}
                  onChange={(e) => setCurrentCert({ ...currentCert, badge: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-white/60 block mb-1">Verification URL / Link</label>
                <input
                  type="url" placeholder="https://coursera.org/verify/..."
                  value={currentCert.credentialUrl}
                  onChange={(e) => setCurrentCert({ ...currentCert, credentialUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                />
              </div>

              {/* ── IMAGE / PHOTO UPLOAD ── */}
              <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-4 space-y-3">
                {/* Header + Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase text-white/60 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                    Certificate Photo / Image
                    <span className="text-white/30 normal-case">(optional)</span>
                  </label>
                  <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-0.5 border border-white/10">
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase transition-all cursor-pointer flex items-center gap-1 ${imageMode === 'upload' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'}`}
                    >
                      <Upload className="w-3 h-3" />Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase transition-all cursor-pointer flex items-center gap-1 ${imageMode === 'url' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'}`}
                    >
                      <Link className="w-3 h-3" />URL
                    </button>
                  </div>
                </div>

                {/* Preview */}
                {imagePreview && (
                  <div className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-black/40">
                    <img src={imagePreview} alt="Preview" className="w-full max-h-44 object-cover" onError={() => setImagePreview(null)} />
                    <button
                      type="button" onClick={clearImage}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white/80 hover:text-white hover:bg-rose-600/80 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-[10px] font-mono text-white/60">Preview — stored in MongoDB</p>
                    </div>
                  </div>
                )}

                {/* Upload mode */}
                {imageMode === 'upload' && (
                  <>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="cert-image-upload" />
                    <label
                      htmlFor="cert-image-upload"
                      className="flex flex-col items-center justify-center gap-2 w-full py-5 rounded-xl border border-dashed border-white/20 text-white/40 hover:text-white hover:border-white/40 transition-colors cursor-pointer bg-white/[0.01] hover:bg-white/[0.03]"
                    >
                      <Upload className="w-5 h-5" />
                      <span className="text-[11px] font-mono uppercase tracking-wider">Click to upload certificate image</span>
                      <span className="text-[10px] font-mono text-white/30">JPG, PNG, WEBP — auto-compressed</span>
                    </label>
                  </>
                )}

                {/* URL mode */}
                {imageMode === 'url' && (
                  <>
                    <input
                      type="url"
                      placeholder="https://example.com/certificate.jpg"
                      value={currentCert.image?.startsWith('data:') ? '' : currentCert.image || ''}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                    />
                    <p className="text-[10px] font-mono text-white/30">Paste a direct public image URL.</p>
                  </>
                )}
              </div>
              {/* ── END IMAGE ── */}

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button type="button" disabled={isSaving} onClick={() => setIsEditing(false)} className="px-5 py-2 rounded-full border border-white/20 text-xs font-mono uppercase hover:bg-white/10 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 rounded-full bg-white text-black text-xs font-bold uppercase hover:bg-neutral-200 transition-colors cursor-pointer flex items-center gap-2">
                  {isSaving ? (<><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Saving to Database...</span></>) : (<span>Save Certificate</span>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {certToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden">
          <div data-lenis-prevent="true" className="w-full max-w-md rounded-3xl bg-[#0E0E0E] border border-rose-500/30 p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold uppercase tracking-tight text-white font-kanit">Delete Certificate?</h3>
                <p className="text-xs text-white/50 font-mono">Permanent database removal</p>
              </div>
            </div>
            <p className="text-xs text-white/70 leading-relaxed font-light">
              Are you sure you want to delete <span className="text-white font-bold font-mono">"{certToDelete.title}"</span>? This will permanently remove it from both your live portfolio website and the MongoDB database.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" disabled={Boolean(deletingId)} onClick={() => setCertToDelete(null)} className="px-5 py-2.5 rounded-full border border-white/20 text-xs font-mono uppercase hover:bg-white/10 text-white/80 transition-colors cursor-pointer">Cancel</button>
              <button type="button" disabled={Boolean(deletingId)} onClick={confirmDelete} className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)] cursor-pointer disabled:opacity-50 flex items-center gap-2">
                {deletingId ? (<><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Deleting from Database...</span></>) : (<><Trash2 className="w-3.5 h-3.5" /><span>Yes, Delete Certificate</span></>)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CertificateManager;
