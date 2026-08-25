import React, { useState } from 'react';
import { Lock, Mail, Sparkles, ArrowRight } from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';

interface ClientLoginPageProps {
  onClose?: () => void;
}

export const ClientLoginPage: React.FC<ClientLoginPageProps> = ({ onClose }) => {
  const { tenants, impersonateTenant } = useSuperAdmin();

  const [email, setEmail] = useState('fatima@apexretail.ae');
  const [password, setPassword] = useState('Welcome@2026');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const foundTenant = tenants.find(
      t => t.adminUser.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!foundTenant) {
      setError('No client organization registered with this email address.');
      return;
    }

    if (foundTenant.status === 'suspended') {
      setError('This client account has been suspended by the SaaS administrator. Please contact billing support.');
      return;
    }

    // Success - login into that tenant's workspace
    impersonateTenant(foundTenant.id);
  };

  const handleQuickSelect = (tenantEmail: string) => {
    setEmail(tenantEmail);
    setPassword('Welcome@2026');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-800 text-xs">
        {/* Top Brand Banner */}
        <div className="p-6 bg-gradient-to-r from-[#001737] via-[#003b73] to-[#001737] text-white text-center relative">
          {onClose && (
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 text-slate-300 hover:text-white text-sm"
            >
              ✕
            </button>
          )}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-[#0070ba] flex items-center justify-center mx-auto shadow-lg mb-2.5">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-extrabold tracking-tight">Adwiselabs Client Portal</h2>
          <p className="text-[11px] text-sky-200 mt-0.5">Sign in to your organization accounting workspace</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[11px] font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Client Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourcompany.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white text-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 font-semibold">Password</label>
              <span className="text-[10px] text-[#0070ba] hover:underline cursor-pointer">Default: Welcome@2026</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#0070ba] hover:bg-sky-700 text-white font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 text-xs mt-2"
          >
            <span>Sign In to Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Quick Demo Logins Selector */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              ⚡ 1-Click Demo Client Credentials:
            </p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {tenants.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleQuickSelect(t.adminUser.email)}
                  className={`w-full p-2 rounded-lg border text-left transition flex items-center justify-between ${
                    email === t.adminUser.email
                      ? 'bg-sky-50 border-sky-300 text-[#0070ba] font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-[11px] truncate text-slate-900">{t.companyName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{t.adminUser.email}</p>
                  </div>
                  <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-white border text-slate-700 font-bold shrink-0">
                    {t.currency} ({t.currencySymbol})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
