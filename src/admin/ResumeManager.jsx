import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  RefreshCw,
  Trash2,
  Download,
} from 'lucide-react';
import {
  fetchContentFromDatabase,
  persistContentToDatabase,
} from '../services/storageService.js';

const MAX_FILE_SIZE_MB = 3.5;

export function ResumeManager() {
  const [sourceType, setSourceType] = useState('file'); // 'file' | 'url'
  const [currentResume, setCurrentResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileBase64, setFileBase64] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [externalUrl, setExternalUrl] = useState('');

  // Notifications
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Load current resume from database
  useEffect(() => {
    let isMounted = true;
    async function loadResume() {
      setLoading(true);
      try {
        const items = await fetchContentFromDatabase('resume', []);
        if (isMounted && items && items.length > 0) {
          const res = items[0];
          setCurrentResume(res);
          if (res.sourceType === 'url') {
            setSourceType('url');
            setExternalUrl(res.fileUrl || '');
          } else {
            setSourceType('file');
            setFileName(res.fileName || DEFAULT_RESUME_NAME);
          }
        } else if (isMounted) {
          setCurrentResume(null);
        }
      } catch (err) {
        console.error('Failed to load resume:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadResume();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle PDF file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMsg({ text: '', type: '' });

    // Validate type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setMsg({ text: 'Please select a valid PDF file (.pdf only).', type: 'error' });
      return;
    }

    // Validate size (max 3.5MB to fit within Vercel & MongoDB payload limits)
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > MAX_FILE_SIZE_MB) {
      setMsg({
        text: `File is too large (${sizeInMB.toFixed(1)} MB). Max limit is ${MAX_FILE_SIZE_MB} MB. For larger files, please use the External URL option.`,
        type: 'error',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result);
      setSelectedFile(file);
      setFileName(file.name);
      setFileSize(`${(file.size / 1024).toFixed(0)} KB`);
      setMsg({
        text: `File "${file.name}" ready to save. Click "Save & Publish" below.`,
        type: 'success',
      });
    };
    reader.onerror = () => {
      setMsg({ text: 'Failed to read file from your device.', type: 'error' });
    };
    reader.readAsDataURL(file);
  };

  // Save new resume
  const handleSave = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    setSaving(true);

    let resumeRecord = null;

    if (sourceType === 'file') {
      if (!fileBase64 && !currentResume?.fileData) {
        setMsg({ text: 'Please select a PDF file first.', type: 'error' });
        setSaving(false);
        return;
      }

      resumeRecord = {
        id: 'rajesh_active_resume',
        sourceType: 'file',
        fileName: fileName || selectedFile?.name || DEFAULT_RESUME_NAME,
        fileSize: fileSize || currentResume?.fileSize || '',
        fileData: fileBase64 || currentResume?.fileData,
        fileUrl: '',
        updatedAt: new Date().toISOString(),
      };
    } else {
      const cleanUrl = externalUrl.trim();
      if (!cleanUrl || (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://'))) {
        setMsg({ text: 'Please enter a valid URL starting with https://', type: 'error' });
        setSaving(false);
        return;
      }

      resumeRecord = {
        id: 'rajesh_active_resume',
        sourceType: 'url',
        fileName: fileName.trim() || 'Rajesh_Kumar_Resume.pdf',
        fileSize: 'Cloud Document',
        fileData: '',
        fileUrl: cleanUrl,
        updatedAt: new Date().toISOString(),
      };
    }

    try {
      const success = await persistContentToDatabase('resume', [resumeRecord]);
      if (success) {
        setCurrentResume(resumeRecord);
        setSelectedFile(null);
        setMsg({
          text: 'Resume updated successfully! It is now live on your portfolio.',
          type: 'success',
        });
      } else {
        setMsg({
          text: 'Saved locally. Please ensure MongoDB is reachable for cloud sync.',
          type: 'success',
        });
        setCurrentResume(resumeRecord);
      }
    } catch (err) {
      setMsg({ text: `Failed to save resume: ${err.message}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Remove / delete current resume
  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete the active resume from your portfolio?')) {
      return;
    }

    setSaving(true);
    setMsg({ text: '', type: '' });

    try {
      await persistContentToDatabase('resume', []);
      setCurrentResume(null);
      setSelectedFile(null);
      setFileBase64('');
      setExternalUrl('');
      setFileName('');
      setMsg({
        text: 'Resume deleted successfully from your portfolio and database.',
        type: 'success',
      });
    } catch (err) {
      setMsg({ text: `Delete failed: ${err.message}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const activeUrl = currentResume?.fileData || currentResume?.fileUrl || '';
  const hasActiveResume = Boolean(activeUrl && activeUrl.trim().length > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white font-kanit">
            Resume &amp; CV Management
          </h2>
          <p className="text-xs font-mono text-white/50 mt-1">
            Upload new resume PDF or link cloud document directly via MongoDB Database.
          </p>
        </div>

        {/* Live Preview Button */}
        {hasActiveResume && (
          <div className="flex items-center gap-3">
            <a
              href={activeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/15 text-xs font-mono text-white hover:bg-white/10 hover:border-white/30 transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              <span>Preview Active Resume</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        )}
      </div>

      {/* Alert Messages */}
      {msg.text && (
        <div
          className={`p-4 rounded-2xl border text-xs font-mono flex items-start gap-3 ${
            msg.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}
        >
          {msg.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span className="flex-1">{msg.text}</span>
        </div>
      )}

      {/* Active Resume Status Card */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-sm font-bold text-white font-mono">
                  {hasActiveResume ? (currentResume?.fileName || 'Rajesh_Kumar_Resume.pdf') : 'No Active Resume'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                    hasActiveResume
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  }`}
                >
                  {hasActiveResume ? 'Live on Portfolio' : 'Not Uploaded Yet'}
                </span>
              </div>
              <p className="text-xs text-white/50 font-mono">
                {hasActiveResume
                  ? `Last updated: ${new Date(currentResume.updatedAt).toLocaleString()}`
                  : 'Upload your latest resume PDF below to make it live for recruiters.'}
              </p>
              {currentResume?.fileSize && (
                <p className="text-[11px] text-white/40 font-mono mt-0.5">
                  Size: {currentResume.fileSize}
                </p>
              )}
            </div>
          </div>

          {hasActiveResume && (
            <button
              type="button"
              onClick={handleDeleteResume}
              disabled={saving}
              className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-white/60 hover:text-rose-300 hover:border-rose-500/30 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Delete active resume"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Delete Resume</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-[#0C0C0C] border border-white/10 space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white font-kanit">
          Update Resume
        </h3>

        {/* Source Mode Toggle */}
        <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/10 w-full sm:w-fit">
          <button
            type="button"
            onClick={() => {
              setSourceType('file');
              setMsg({ text: '', type: '' });
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              sourceType === 'file'
                ? 'bg-white text-black font-bold shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDF File</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSourceType('url');
              setMsg({ text: '', type: '' });
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              sourceType === 'url'
                ? 'bg-white text-black font-bold shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>External Link / Drive</span>
          </button>
        </div>

        {/* MODE A: Direct File Upload */}
        {sourceType === 'file' && (
          <div className="space-y-4">
            <label className="block text-xs font-mono uppercase tracking-wider text-white/70">
              Select New PDF Resume (Max {MAX_FILE_SIZE_MB} MB)
            </label>

            <div className="relative border-2 border-dashed border-white/15 rounded-2xl p-8 hover:border-purple-400/50 transition-colors text-center bg-white/[0.01]">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center pointer-events-none space-y-3">
                <div className="p-3.5 rounded-full bg-white/[0.04] border border-white/10 text-purple-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">
                    {selectedFile ? selectedFile.name : 'Click to select or drag and drop PDF file here'}
                  </p>
                  <p className="text-xs text-white/40 font-mono mt-1">
                    {selectedFile ? `${fileSize} • Ready to upload` : 'PDF files only, up to 3.5 MB'}
                  </p>
                </div>
              </div>
            </div>

            {/* Custom display name */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-2">
                Display File Name (Optional)
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Rajesh_Kumar_Resume.pdf"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>
        )}

        {/* MODE B: External Cloud URL */}
        {sourceType === 'url' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-2">
                External Resume URL (Google Drive, Cloudinary, Supabase, Dropbox)
              </label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/.../view"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15 text-xs text-purple-200/80 font-mono space-y-1">
              <p className="font-bold text-purple-300">💡 Google Drive Tip:</p>
              <p>1. Upload your resume to Google Drive.</p>
              <p>2. Right-click → Share → Change to "Anyone with the link can view".</p>
              <p>3. Paste the share link here and click Save.</p>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-2">
                Display File Name
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Rajesh_Kumar_Resume.pdf"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            type="submit"
            disabled={saving || (sourceType === 'file' && !fileBase64 && !currentResume?.fileData)}
            className="px-6 py-3 rounded-full bg-white text-black font-bold font-mono text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Publishing to MongoDB...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save &amp; Publish Resume</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ResumeManager;
