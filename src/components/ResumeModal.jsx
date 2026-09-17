import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ExternalLink, FileText } from 'lucide-react';

export function ResumeModal({ isOpen, onClose }) {
  const resumeUrl = '/resume/Rajesh_Kumar_Resume.pdf';

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-5xl h-[85vh] sm:h-[90vh] bg-[#0E0E0E] border border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10"
            role="dialog"
            aria-modal="true"
            aria-label="Resume Preview Modal"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-white/10 bg-[#0C0C0C]/90 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-base font-bold text-white tracking-wide uppercase font-mono truncate max-w-[110px] sm:max-w-xs">
                    Rajesh_Kumar_Resume.pdf
                  </h3>
                  <p className="text-xs text-[#D7E2EA]/50 hidden sm:block">
                    Curriculum Vitae • Live Preview
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {/* Download PDF Button */}
                <a
                  href={resumeUrl}
                  download="Rajesh_Kumar_Resume.pdf"
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-full bg-white text-black font-semibold text-xs sm:text-sm tracking-wider uppercase hover:bg-neutral-200 transition-all shadow-lg active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">Download</span>
                </a>

                {/* Open in New Tab Button */}
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/20 text-[#D7E2EA] text-xs uppercase tracking-wider hover:bg-white/10 transition-all"
                  title="Open PDF in new browser tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Tab</span>
                </a>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full border border-white/10 text-[#D7E2EA]/70 hover:text-white hover:bg-white/10 transition-colors ml-1"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Content */}
            <div className="relative flex-1 w-full bg-[#080808] p-2 sm:p-4 overflow-hidden">
              <object
                data={`${resumeUrl}#toolbar=1&view=FitH`}
                type="application/pdf"
                className="w-full h-full rounded-xl border border-white/5 bg-neutral-900"
                title="Rajesh Kumar Resume PDF"
              >
                <iframe
                  src={`${resumeUrl}#toolbar=1&view=FitH`}
                  className="w-full h-full rounded-xl border border-white/5 bg-neutral-900"
                  title="Rajesh Kumar Resume PDF"
                >
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center text-[#D7E2EA]">
                    <p className="mb-4 text-sm text-[#D7E2EA]/70">PDF preview is not supported directly in this browser.</p>
                    <a
                      href={resumeUrl}
                      download="Rajesh_Kumar_Resume.pdf"
                      className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-sm tracking-wide uppercase hover:bg-neutral-200 transition-all"
                    >
                      Download Resume PDF
                    </a>
                  </div>
                </iframe>
              </object>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ResumeModal;
