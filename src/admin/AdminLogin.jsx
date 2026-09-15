import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

export function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Single authorized master owner definition
  const getAuthorizedEmail = () => {
    return (
      localStorage.getItem('rajesh_portfolio_owner_email') ||
      import.meta.env.VITE_ADMIN_EMAIL ||
      'sarrafrajesh432@gmail.com'
    ).toLowerCase().trim();
  };

  const getExpectedPassword = () => {
    return (
      localStorage.getItem('rajesh_portfolio_master_password') ||
      import.meta.env.VITE_ADMIN_PASSWORD ||
      'QWER4321'
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const cleanInputEmail = email.toLowerCase().trim();
      const expectedEmail = getAuthorizedEmail();
      const expectedPassword = getExpectedPassword();

      // Check 1: Must match the single authorized owner email
      if (cleanInputEmail !== expectedEmail) {
        setError(
          'Access Denied: Only the portfolio owner (Rajesh Kumar) is authorized to access this CMS. Public visitors have explore-only permissions.'
        );
        setLoading(false);
        return;
      }

      // Check 2: Must match the master password (QWER4321 or custom saved password)
      if (password !== expectedPassword && password !== 'QWER4321') {
        setError('Incorrect password. Access denied.');
        setLoading(false);
        return;
      }

      // Authenticate session for the single owner
      sessionStorage.setItem('rajesh_portfolio_admin_token', 'auth_session_active');
      sessionStorage.setItem('rajesh_portfolio_admin_email', expectedEmail);
      if (onLoginSuccess) onLoginSuccess();
      else window.location.pathname = '/admin';
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen w-full bg-[#080808] text-[#D7E2EA] flex flex-col justify-center items-center px-5 py-12">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute w-[400px] h-[400px] rounded-full bg-[#7621B0]/10 blur-[120px] -z-10"
        aria-hidden="true"
      />

      <div className="w-full max-w-md">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-[#BBCCD7] mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-white font-kanit">
            ADMIN CMS PORTAL
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-[#D7E2EA]/50 mt-1">
            Rajesh Kumar Portfolio Management
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-[28px] bg-[#0C0C0C] border border-white/10 p-7 sm:p-9 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-mono mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono uppercase tracking-wider text-[#D7E2EA]/70">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#D7E2EA]/40 absolute left-4 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#BBCCD7] transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono uppercase tracking-wider text-[#D7E2EA]/70">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#D7E2EA]/40 absolute left-4 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#BBCCD7] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-[#D7E2EA]/40 hover:text-white transition-colors focus:outline-none cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-white text-black font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-neutral-200 active:scale-98 transition-all disabled:opacity-50 mt-4 cursor-pointer"
            >
              {loading ? (
                <span>AUTHENTICATING...</span>
              ) : (
                <>
                  <span>SIGN IN TO DASHBOARD</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#D7E2EA]/40">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Protected Session</span>
            </span>
            <a href="/" className="hover:text-white transition-colors">
              ← Return to Site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
