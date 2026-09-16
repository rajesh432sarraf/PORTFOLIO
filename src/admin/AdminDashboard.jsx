import React, { useState, useEffect } from 'react';
import {
  Layers,
  Mail,
  Briefcase,
  Trophy,
  Award,
  LogOut,
  ExternalLink,
  Shield,
  Lock,
  Key,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import ProjectManager from './ProjectManager.jsx';
import MessageManager from './MessageManager.jsx';
import ExperienceManager from './ExperienceManager.jsx';
import AchievementManager from './AchievementManager.jsx';
import CertificateManager from './CertificateManager.jsx';

export function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'messages' | 'experience' | 'achievements' | 'certifications' | 'security'
  const [adminEmail, setAdminEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState({ text: '', type: '' });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    const email =
      localStorage.getItem('rajesh_portfolio_owner_email') ||
      sessionStorage.getItem('rajesh_portfolio_admin_email') ||
      'sarrafrajesh432@gmail.com';
    setAdminEmail(email);
  }, []);

  const handleUpdateEmail = (e) => {
    e.preventDefault();
    setEmailMsg({ text: '', type: '' });
    const clean = newEmail.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clean)) {
      setEmailMsg({ text: 'Please enter a valid Gmail / Email address.', type: 'error' });
      return;
    }
    localStorage.setItem('rajesh_portfolio_owner_email', clean);
    sessionStorage.setItem('rajesh_portfolio_admin_email', clean);
    window.dispatchEvent(new Event('portfolio_data_updated'));
    setAdminEmail(clean);
    setNewEmail('');
    setEmailMsg({
      text: `Authorized Owner Gmail successfully updated to: ${clean}`,
      type: 'success',
    });
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });
    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'Password must be at least 6 characters long.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'Passwords do not match. Please re-enter.', type: 'error' });
      return;
    }
    localStorage.setItem('rajesh_portfolio_master_password', newPassword);
    setPasswordMsg({ text: 'Master password updated successfully!', type: 'success' });
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('rajesh_portfolio_admin_token');
    sessionStorage.removeItem('rajesh_portfolio_admin_email');
    if (onLogout) onLogout();
    else window.location.pathname = '/admin/login';
  };

  return (
    <div className="min-h-screen w-full bg-[#080808] text-[#D7E2EA] flex flex-col">
      {/* Top Admin Header Bar */}
      <header className="w-full bg-[#0C0C0C] border-b border-white/10 px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-emerald-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wider text-white font-kanit">
              RAJESH KUMAR CMS
            </h1>
            <span className="text-[10px] font-mono text-white/40 block">
              Logged in as {adminEmail}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-1.5 text-xs font-mono text-white/60 hover:text-white transition-colors"
          >
            <span>Live Portfolio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-mono text-rose-300 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-5 sm:p-8 flex flex-col md:flex-row gap-8">
        {/* Navigation Tabs (Horizontal swipe on mobile, vertical sidebar on desktop) */}
        <aside className="w-full md:w-64 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
              activeTab === 'projects'
                ? 'bg-white text-black font-bold shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Projects</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
              activeTab === 'messages'
                ? 'bg-white text-black font-bold shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Messages</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('experience')}
            className={`flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
              activeTab === 'experience'
                ? 'bg-white text-black font-bold shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Experience</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('achievements')}
            className={`flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
              activeTab === 'achievements'
                ? 'bg-white text-black font-bold shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Achievements</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('certifications')}
            className={`flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
              activeTab === 'certifications'
                ? 'bg-white text-black font-bold shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Certificates</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
              activeTab === 'security'
                ? 'bg-white text-black font-bold shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Security & Access</span>
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          {activeTab === 'projects' && <ProjectManager />}
          {activeTab === 'messages' && <MessageManager />}

          {activeTab === 'experience' && <ExperienceManager />}
          {activeTab === 'achievements' && <AchievementManager />}
          {activeTab === 'certifications' && <CertificateManager />}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold uppercase tracking-tight text-white font-kanit">
                Security &amp; Access Controls
              </h2>

              <div className="rounded-2xl bg-[#0C0C0C] border border-white/10 p-6 space-y-6">
                {/* Option 1: Update Authorized Gmail */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                      Change Authorized Owner Gmail
                    </h3>
                  </div>

                  <form onSubmit={handleUpdateEmail} className="space-y-4 max-w-lg">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-mono">
                      <span className="text-white/40 block text-[11px] uppercase tracking-wider mb-1">Current Active Gmail</span>
                      <span className="text-white font-semibold text-sm">{adminEmail}</span>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-white/60 mb-1.5">
                        New Owner Gmail Address
                      </label>
                      <input
                        type="email"
                        required
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-emerald-400 font-mono transition-colors"
                      />
                    </div>

                    {emailMsg.text && (
                      <div
                        className={`flex items-center gap-2 p-3 rounded-xl text-xs font-mono border ${
                          emailMsg.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                        }`}
                      >
                        {emailMsg.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span>{emailMsg.text}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-full bg-emerald-400 text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-emerald-300 transition-colors cursor-pointer"
                    >
                      Save New Gmail
                    </button>
                  </form>
                </div>

                {/* Option 2: Change Master Password */}
                <div className="border-t border-white/10 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Key className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                      Change Master Password
                    </h3>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase text-white/60 mb-1.5">
                          New Master Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPass ? 'text' : 'password'}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-emerald-400 font-mono transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-3 text-white/40 hover:text-white transition-colors focus:outline-none cursor-pointer"
                            title={showPass ? 'Hide password' : 'Show password'}
                          >
                            {showPass ? <EyeOff className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-white/60 mb-1.5">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPass ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-emerald-400 font-mono transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-3 text-white/40 hover:text-white transition-colors focus:outline-none cursor-pointer"
                            title={showPass ? 'Hide password' : 'Show password'}
                          >
                            {showPass ? <EyeOff className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {passwordMsg.text && (
                      <div
                        className={`flex items-center gap-2 p-3 rounded-xl text-xs font-mono border ${
                          passwordMsg.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                        }`}
                      >
                        {passwordMsg.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span>{passwordMsg.text}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-full bg-white text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
                    >
                      Save New Password
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
