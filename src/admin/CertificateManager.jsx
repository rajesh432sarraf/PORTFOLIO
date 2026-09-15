import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Award, CheckCircle2, ExternalLink, X } from 'lucide-react';
import { certifications as initialCertifications } from '../data/certifications.js';

export function CertificateManager() {
  const [certList, setCertList] = useState(() => {
    try {
      const saved = localStorage.getItem('rajesh_portfolio_certifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return initialCertifications;
    } catch (e) {
      return initialCertifications;
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentCert, setCurrentCert] = useState(null);

  const saveToStorage = (updated) => {
    setCertList(updated);
    try {
      localStorage.setItem('rajesh_portfolio_certifications', JSON.stringify(updated));
      window.dispatchEvent(new Event('portfolio_data_updated'));
    } catch (e) {
      console.error('Failed to save certifications to localStorage', e);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      const updated = certList.filter((c) => c.id !== id);
      saveToStorage(updated);
    }
  };

  const handleOpenEdit = (cert) => {
    setCurrentCert({ ...cert });
    setIsEditing(true);
  };

  const handleOpenNew = () => {
    setCurrentCert({
      id: `cert_${Date.now()}`,
      title: '',
      issuer: '',
      year: new Date().getFullYear().toString(),
      badge: 'VERIFIED CREDENTIAL',
      credentialUrl: '',
    });
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const certToSave = {
      id: currentCert.id || `cert_${Date.now()}`,
      title: currentCert.title.trim(),
      issuer: currentCert.issuer.trim(),
      year: currentCert.year.trim(),
      badge: currentCert.badge.trim() || 'VERIFIED CREDENTIAL',
      credentialUrl: currentCert.credentialUrl.trim(),
    };

    const exists = certList.find((c) => c.id === certToSave.id);
    let updated;
    if (exists) {
      updated = certList.map((c) => (c.id === certToSave.id ? certToSave : c));
    } else {
      updated = [certToSave, ...certList];
    }

    saveToStorage(updated);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight text-white font-kanit">
            Certifications &amp; Credentials
          </h2>
          <p className="text-xs font-mono text-white/50">
            Add and manage your verified certificates, specialized courses, and licenses.
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

      {/* Certifications Table / Grid */}
      <div className="rounded-2xl bg-[#0C0C0C] border border-white/10 overflow-hidden">
        {certList.length === 0 ? (
          <div className="p-12 text-center text-white/40 font-mono text-xs">
            <Award className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>No certificates added yet.</p>
            <p className="text-[11px] text-white/30 mt-1">
              Add your tech certifications, badges, and verified course links.
            </p>
            <button
              type="button"
              onClick={handleOpenNew}
              className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-colors cursor-pointer"
            >
              + Add First Certificate
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-mono uppercase tracking-widest text-white/40 bg-white/[0.02]">
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Certificate Title</th>
                  <th className="py-3.5 px-4">Issuer / Platform</th>
                  <th className="py-3.5 px-4">Year</th>
                  <th className="py-3.5 px-4">Badge</th>
                  <th className="py-3.5 px-4">Link</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs">
                {certList.map((cert, idx) => (
                  <tr key={cert.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-mono text-white/40">0{idx + 1}</td>
                    <td className="py-4 px-4 font-bold text-white max-w-[220px]">
                      <div>{cert.title}</div>
                    </td>
                    <td className="py-4 px-4 text-[#BBCCD7] font-mono text-xs">{cert.issuer}</td>
                    <td className="py-4 px-4 text-white/60 font-mono text-xs">{cert.year}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        {cert.badge}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {cert.credentialUrl ? (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-white/60 hover:text-white inline-flex items-center gap-1 font-mono text-xs underline"
                        >
                          <span>Verify</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-white/30 font-mono text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cert)}
                          className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
                          title="Edit Certificate"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cert.id)}
                          className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Certificate"
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
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                  Certificate Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Certified Cloud Practitioner / Meta Frontend"
                  value={currentCert.title}
                  onChange={(e) => setCurrentCert({ ...currentCert, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                    Issuer / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amazon Web Services / Coursera"
                    value={currentCert.issuer}
                    onChange={(e) => setCurrentCert({ ...currentCert, issuer: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                    Year / Date *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2025"
                    value={currentCert.year}
                    onChange={(e) => setCurrentCert({ ...currentCert, year: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VERIFIED CREDENTIAL"
                    value={currentCert.badge}
                    onChange={(e) => setCurrentCert({ ...currentCert, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-white/60 block mb-1">
                    Credential / Verification URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={currentCert.credentialUrl}
                    onChange={(e) => setCurrentCert({ ...currentCert, credentialUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>
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
                  Save Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CertificateManager;
