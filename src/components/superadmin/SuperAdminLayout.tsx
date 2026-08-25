import React, { useState } from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  Layers, 
  CreditCard, 
  FileText, 
  Settings, 
  Plus, 
  Search, 
  Download, 
  RotateCcw,
  Sparkles,
  Server,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { DashboardView } from './DashboardView.tsx';
import { TenantsView } from './TenantsView.tsx';
import { InvoicesView } from './InvoicesView.tsx';
import { SettingsView } from './SettingsView.tsx';
import { CreateTenantModal } from './CreateTenantModal.tsx';
import { ClientLoginPage } from '../auth/ClientLoginPage.tsx';
import logoImg from '../../assets/logo.webp';

export const SuperAdminLayout: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    tenants, 
    exportDatabaseJSON,
    resetToDemoData,
    logout
  } = useSuperAdmin();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isClientLoginOpen, setIsClientLoginOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const activeTenantsCount = tenants.filter(t => t.status === 'active').length;
  const trialTenantsCount = tenants.filter(t => t.status === 'trial').length;

  const navItems = [
    { id: 'dashboard', label: 'Overview & Metrics', icon: LayoutDashboard, badge: null },
    { id: 'tenants', label: 'Clients & Organizations', icon: Building2, badge: tenants.length },
    { id: 'invoices', label: 'SaaS Invoices & Billing', icon: CreditCard, badge: null },
    { id: 'settings', label: 'Platform Settings', icon: Settings, badge: null },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 overflow-hidden font-sans select-none text-xs">
      {/* 🧭 SIDEBAR (REALISTIC LIGHT THEME) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 shadow-sm z-20">
        <div>
          {/* Brand Header */}
          <div className="h-14 px-4 border-b border-slate-200 flex items-center bg-white">
            <img 
              src={logoImg} 
              alt="Adwiselabs" 
              className="h-8 w-auto max-h-8 max-w-[190px] object-contain object-left block"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.webp';
              }}
            />
          </div>

          {/* Quick Platform Status Strip */}
          <div className="mx-3 my-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-600 font-semibold">Cloud Active</span>
            </div>
            <div className="text-slate-500 font-medium text-[10.5px]">
              <strong className="text-emerald-600">{activeTenantsCount}</strong> active &bull; <strong className="text-amber-600">{trialTenantsCount}</strong> trial
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-2.5 space-y-1 mt-1">
            <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Platform Modules
            </p>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive 
                      ? 'bg-[#0070ba] text-white shadow-sm shadow-[#0070ba]/20 font-bold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-slate-200/80 space-y-2.5 bg-slate-50/50">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full flex items-center justify-center space-x-2 bg-[#0070ba] hover:bg-sky-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Client</span>
          </button>

          <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
            <button 
              onClick={exportDatabaseJSON}
              className="flex items-center gap-1 hover:text-[#0070ba] font-medium transition"
              title="Download full JSON database snapshot"
            >
              <Download className="w-3.5 h-3.5" /> Backup DB
            </button>
            <button 
              onClick={() => {
                if (confirm('Reset to initial demo clients & database?')) {
                  resetToDemoData();
                }
              }}
              className="flex items-center gap-1 hover:text-rose-600 font-medium transition"
              title="Reset to demo dataset"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Demo
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f4f7fa]">
        {/* Top Navbar (Crisp White Light Theme) */}
        <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center space-x-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search clients, companies, emails, registration IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0070ba] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Right Controls & Profile */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsClientLoginOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0070ba] font-bold border border-sky-200 transition flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" /> Client Login Portal
            </button>

            <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-[11px]">
              <Server className="w-3.5 h-3.5 text-[#0070ba]" />
              <span className="text-slate-500 font-medium">SaaS Cloud:</span>
              <span className="text-slate-800 font-bold">Multi-Tenant</span>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0070ba] to-sky-500 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                  SA
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[11px] font-bold text-slate-800 leading-tight">Super Administrator</p>
                  <p className="text-[10px] text-slate-500">admin@adwiselabs.com</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showAdminMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="font-bold text-slate-800">Master Super Admin</p>
                    <p className="text-[10.5px] text-slate-500">Full Cloud Authority</p>
                  </div>
                  <button 
                    onClick={() => { setCurrentView('settings'); setShowAdminMenu(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-500" /> Platform Configuration
                  </button>
                  <div className="border-t border-slate-100 mt-1 pt-1 space-y-0.5">
                    <button 
                      onClick={() => { exportDatabaseJSON(); setShowAdminMenu(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-sky-50 text-[#0070ba] flex items-center gap-2 font-bold"
                    >
                      <Download className="w-3.5 h-3.5" /> Download DB Backup
                    </button>
                    <button 
                      onClick={() => { logout(); setShowAdminMenu(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-bold transition"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6">
          {currentView === 'dashboard' && <DashboardView onOpenCreateTenant={() => setIsCreateModalOpen(true)} />}
          {currentView === 'tenants' && <TenantsView globalSearch={searchQuery} onOpenCreate={() => setIsCreateModalOpen(true)} />}
          {currentView === 'invoices' && <InvoicesView />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Onboard Client Wizard Modal */}
      {isCreateModalOpen && (
        <CreateTenantModal onClose={() => setIsCreateModalOpen(false)} />
      )}

      {/* Client Direct Login Modal */}
      {isClientLoginOpen && (
        <ClientLoginPage onClose={() => setIsClientLoginOpen(false)} />
      )}
    </div>
  );
};
