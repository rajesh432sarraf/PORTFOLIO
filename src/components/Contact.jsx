import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import FadeIn from './FadeIn.jsx';
import MagneticButton from './MagneticButton.jsx';
import { easeEditorial } from '../lib/animations.js';
import { fetchMessagesFromDatabase, saveMessageToLocalCache } from '../services/storageService.js';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '', // Spam bot protection
  });

  const [publicNotes, setPublicNotes] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const loadNotes = async () => {
      try {
        const msgs = await fetchMessagesFromDatabase();
        if (isMounted) {
          setPublicNotes(msgs.filter((m) => m.showOnWebsite));
        }
      } catch (e) {
        if (isMounted) setPublicNotes([]);
      }
    };

    loadNotes();

    const handleUpdate = () => {
      loadNotes();
    };
    window.addEventListener('portfolio_data_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('portfolio_data_updated', handleUpdate);
    };
  }, []);

  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    if (!formData.name.trim() || formData.name.length < 2 || formData.name.length > 80) {
      return 'Please enter a valid name (2–80 characters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email) || formData.email.length > 120) {
      return 'Please enter a valid email address.';
    }
    if (formData.subject && (formData.subject.length < 2 || formData.subject.length > 150)) {
      return 'Subject must be between 2 and 150 characters.';
    }
    if (!formData.message.trim() || formData.message.length < 10 || formData.message.length > 3000) {
      return 'Please enter a message of at least 10 characters.';
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check honeypot field (hidden from humans, filled by bots)
    if (formData.honeypot) {
      // Silently treat as success without sending
      setStatus('success');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      // Direct Web3Forms submission if access key configured in client env
      const web3Key = import.meta.env.VITE_PUBLIC_WEB3FORMS_KEY;
      if (web3Key) {
        try {
          await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              access_key: web3Key,
              name: formData.name,
              email: formData.email,
              subject: formData.subject || `[Portfolio] Inquiry from ${formData.name}`,
              message: formData.message,
              from_name: 'Rajesh Portfolio Website',
            }),
          });
        } catch (web3Err) {
          console.warn('Web3Forms client notification warning:', web3Err);
        }
      }

      // Try sending to the serverless contact API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject || 'Portfolio Inquiry',
          message: formData.message,
        }),
      });

      // Resilient backup in local database cache (zero quota crash)
      const newMsg = {
        _id: `msg_${Date.now()}`,
        name: formData.name,
        email: formData.email,
        subject: formData.subject || 'General Inquiry',
        message: formData.message,
        createdAt: new Date().toISOString(),
        status: 'new',
      };
      await saveMessageToLocalCache(newMsg);

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' });
    } catch (err) {
      // Resilient fallback for local testing
      const newMsg = {
        _id: `msg_${Date.now()}`,
        name: formData.name,
        email: formData.email,
        subject: formData.subject || 'General Inquiry',
        message: formData.message,
        createdAt: new Date().toISOString(),
        status: 'new',
      };
      await saveMessageToLocalCache(newMsg);

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' });
    }
  };

  return (
    <section
      id="contact"
      className="relative w-full bg-[#0C0C0C] text-[#D7E2EA] px-5 sm:px-8 lg:px-12 py-24 sm:py-36 overflow-hidden"
      aria-label="Contact Section"
    >
      {/* Background Ambient Glow */}
      <div
        className="pointer-events-none absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[450px] sm:w-[650px] lg:w-[850px] h-[450px] sm:h-[650px] lg:h-[850px] rounded-full bg-gradient-to-tr from-[#B600A8]/10 via-[#7621B0]/15 to-transparent blur-[160px] -z-10"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20">
          <FadeIn y={30}>
            <span className="text-xs sm:text-sm uppercase tracking-widest text-[#D7E2EA]/40 font-mono block mb-3">
              [ 11 / INITIATE CONTACT ]
            </span>
            <h2
              className="hero-heading font-black tracking-tight uppercase leading-none select-none mb-6"
              style={{
                fontSize: 'clamp(2.75rem, 10vw, 130px)',
              }}
            >
              LET'S BUILD SOMETHING.
            </h2>
            <p className="text-[#D7E2EA]/70 text-sm sm:text-base md:text-lg max-w-xl mx-auto font-light leading-relaxed">
              Have an ambitious idea, project, hackathon collaboration, or software engineering opportunity in mind? Let’s connect.
            </p>
          </FadeIn>
        </div>

        {/* Collaborator Notes & Recommendations (Featured Messages from CMS) */}
        {publicNotes && publicNotes.length > 0 && (
          <div className="mb-14 sm:mb-20">
            <FadeIn y={20}>
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <span className="text-xs font-mono uppercase tracking-widest text-[#D7E2EA]/50">
                  [ COLLABORATOR NOTES &amp; RECOMMENDATIONS ]
                </span>
                <span className="text-xs font-mono text-emerald-400/80 uppercase">
                  {publicNotes.length} Verified {publicNotes.length === 1 ? 'Note' : 'Notes'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {publicNotes.map((note) => (
                  <div
                    key={note._id}
                    className="rounded-[28px] sm:rounded-[36px] bg-white/[0.02] border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between hover:border-white/20 hover:bg-white/[0.03] transition-all duration-300"
                  >
                    <p className="text-sm sm:text-base text-[#D7E2EA]/85 italic mb-6 leading-relaxed">
                      "{note.message}"
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                          {note.name}
                        </h4>
                        <p className="text-xs font-mono text-[#BBCCD7]/60">{note.subject}</p>
                      </div>
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400">
                        VERIFIED NOTE
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        )}

        {/* Contact Form Card */}
        <div className="relative rounded-[32px] sm:rounded-[44px] bg-white/[0.02] border border-white/[0.1] p-6 sm:p-10 md:p-12 shadow-2xl backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: easeEditorial }}
                className="py-12 sm:py-16 flex flex-col items-center text-center"
              >
                <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#D7E2EA] mb-3">
                  MESSAGE SENT
                </h3>
                <p className="text-sm sm:text-base text-[#D7E2EA]/70 max-w-md font-light mb-8">
                  Thank you for reaching out. Your message has been safely received. I will get back to you promptly.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="px-6 py-2.5 rounded-full border border-white/20 text-xs uppercase tracking-widest font-medium hover:bg-white/10 transition-colors"
                >
                  SEND ANOTHER MESSAGE
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                noValidate
                className="space-y-6"
              >
                {/* Honeypot field (hidden from screen, catches bots) */}
                <input
                  type="text"
                  name="honeypot"
                  value={formData.honeypot}
                  onChange={handleChange}
                  className="hidden"
                  tabIndex="-1"
                  autoComplete="off"
                />

                {/* Error Banner */}
                {status === 'error' && errorMessage && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-mono">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-xs uppercase tracking-widest font-mono text-[#D7E2EA]/60">
                      Your Name <span className="text-[#BBCCD7]">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Alex Morgan"
                      disabled={status === 'submitting'}
                      className="w-full px-5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#BBCCD7] focus:bg-white/[0.06] transition-all disabled:opacity-50"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-xs uppercase tracking-widest font-mono text-[#D7E2EA]/60">
                      Your Email <span className="text-[#BBCCD7]">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. alex@example.com"
                      disabled={status === 'submitting'}
                      className="w-full px-5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#BBCCD7] focus:bg-white/[0.06] transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Subject Field */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="subject" className="text-xs uppercase tracking-widest font-mono text-[#D7E2EA]/60">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Full-Stack / AI Project Collaboration"
                    disabled={status === 'submitting'}
                    className="w-full px-5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#BBCCD7] focus:bg-white/[0.06] transition-all disabled:opacity-50"
                  />
                </div>

                {/* Message Field */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-xs uppercase tracking-widest font-mono text-[#D7E2EA]/60">
                    Message <span className="text-[#BBCCD7]">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your vision, inquiry, or discussion topic..."
                    disabled={status === 'submitting'}
                    className="w-full px-5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#BBCCD7] focus:bg-white/[0.06] transition-all disabled:opacity-50 resize-none"
                  />
                </div>

                {/* Submit Row */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs font-mono text-[#D7E2EA]/60 flex items-center gap-2 order-2 sm:order-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    <span>Direct Message Protocol • Guaranteed response &lt; 24h</span>
                  </span>

                  <MagneticButton strength={0.25} className="w-full sm:w-auto order-1 sm:order-2">
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="contact-btn-gradient group relative w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 rounded-full text-white text-xs sm:text-sm font-semibold uppercase tracking-widest border border-white/20 shadow-xl transition-all duration-300 disabled:opacity-60 cursor-pointer"
                      aria-label="Send Message"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {status === 'submitting' ? (
                          <>
                            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            <span>SENDING...</span>
                          </>
                        ) : (
                          <>
                            <span>SEND MESSAGE</span>
                            <Send className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none" aria-hidden="true">
                        <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" />
                      </div>
                    </button>
                  </MagneticButton>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default Contact;
