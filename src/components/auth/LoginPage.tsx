import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  Building2, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import logoImg from '../../assets/logo.webp';

export const LoginPage: React.FC = () => {
  const { tenants, loginAsSuperAdmin, loginAsTenant } = useSuperAdmin();

  // Login Mode: 'superadmin' | 'client'
  const [loginMode, setLoginMode] = useState<'superadmin' | 'client'>('superadmin');

  const [email, setEmail] = useState('admin@adwiselabs.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const switchMode = (mode: 'superadmin' | 'client') => {
    setLoginMode(mode);
    setError(null);
    if (mode === 'superadmin') {
      setEmail('admin@adwiselabs.com');
      setPassword('admin123');
    } else {
      if (tenants.length > 0) {
        setEmail(tenants[0].adminUser.email);
        setPassword('Welcome@2026');
      } else {
        setEmail('');
        setPassword('');
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      if (loginMode === 'superadmin') {
        const success = loginAsSuperAdmin(email, password);
        if (!success) {
          setError('Invalid Super Admin credentials. Use admin@adwiselabs.com.');
        }
      } else {
        const result = loginAsTenant(email, password);
        if (!result.success) {
          setError(result.error || 'Failed to sign in. Please verify your client email.');
        }
      }
      setIsLoading(false);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#0070ba] selection:text-white">
      {/* Background Decor Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-200/30 blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Main Logo Container */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200/80 mb-3 flex items-center justify-center transition hover:shadow-md">
            <img 
              src={logoImg} 
              alt="Logo" 
              className="h-12 w-auto object-contain max-w-[200px]"
              onError={(e) => {
                // Fallback to public root path
                (e.target as HTMLImageElement).src = '/logo.webp';
              }}
            />
          </div>
          <h2 className="text-center text-xl font-extrabold text-slate-900 tracking-tight">
            Sign In to Enterprise Workspace
          </h2>
          <p className="mt-1 text-center text-xs text-slate-500">
            Secure cloud accounting, multi-tenant billing & financial control plane
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl sm:px-10 border border-slate-200/80">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6 border border-slate-200/60">
            <button
              type="button"
              onClick={() => switchMode('superadmin')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                loginMode === 'superadmin'
                  ? 'bg-white text-[#0070ba] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Super Admin</span>
            </button>
            <button
              type="button"
              onClick={() => switchMode('client')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                loginMode === 'client'
                  ? 'bg-white text-[#0070ba] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Client Portal</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {loginMode === 'superadmin' ? 'Super Admin Email' : 'Client Organization Email'}
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={loginMode === 'superadmin' ? 'admin@adwiselabs.com' : 'admin@clientorg.com'}
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070ba]/20 focus:border-[#0070ba] bg-slate-50 focus:bg-white text-slate-900 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                {loginMode === 'superadmin' ? (
                  <button
                    type="button"
                    onClick={() => { setEmail('admin@adwiselabs.com'); setPassword('admin123'); }}
                    className="text-[10.5px] font-semibold text-[#0070ba] hover:underline"
                  >
                    Use default
                  </button>
                ) : (
                  <span className="text-[10.5px] text-slate-400">Default: Welcome@2026</span>
                )}
              </div>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-9 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070ba]/20 focus:border-[#0070ba] bg-slate-50 focus:bg-white text-slate-900 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300 focus:ring-[#0070ba]"
                />
                <span className="text-slate-600 text-[11px] font-medium">Keep me signed in</span>
              </label>

              <span className="text-[11px] font-bold text-[#0070ba] hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#0070ba] hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-md shadow-sky-600/20 transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>
                    {loginMode === 'superadmin' ? 'Access Super Admin Hub' : 'Enter Client Workspace'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Fill Helpers */}
          {loginMode === 'client' && tenants.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#0070ba]" /> Quick Client Accounts:
              </p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {tenants.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setEmail(t.adminUser.email);
                      setPassword('Welcome@2026');
                      setError(null);
                    }}
                    className={`w-full p-2 rounded-lg border text-left transition flex items-center justify-between text-xs ${
                      email === t.adminUser.email
                        ? 'bg-sky-50 border-sky-300 text-[#0070ba] font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{t.companyName}</span>
                    <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-white text-slate-700 font-bold border shrink-0">
                      {t.currency} ({t.currencySymbol})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {loginMode === 'superadmin' && (
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" /> Demo Admin Access
              </span>
              <span className="font-mono text-[10.5px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                admin@adwiselabs.com
              </span>
            </div>
          )}
        </div>

        {/* Security & Compliance Footer */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[10.5px] text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> 256-Bit SSL Encrypted
          </span>
          <span>&bull;</span>
          <span>SOC-2 Type II Certified</span>
          <span>&bull;</span>
          <span>Adwiselabs SaaS 2.0</span>
        </div>
      </div>
    </div>
  );
};
