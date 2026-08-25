import React from 'react';
import { 
  Building2, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  Zap, 
  DollarSign, 
  Activity, 
  Layers, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';

interface DashboardViewProps {
  onOpenCreateTenant: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenCreateTenant }) => {
  const { tenants, plans, auditLogs, impersonateTenant, setCurrentView } = useSuperAdmin();

  // Metrics
  const activeTenants = tenants.filter(t => t.status === 'active');
  const trialTenants = tenants.filter(t => t.status === 'trial');

  // MRR estimation
  const mrr = tenants.reduce((acc, t) => {
    if (t.status !== 'active') return acc;
    const plan = plans.find(p => p.id === t.planId);
    if (!plan) return acc;
    if (t.billingCycle === 'yearly') {
      return acc + Math.round(plan.priceYearly / 12);
    }
    return acc + plan.priceMonthly;
  }, 0);

  const arr = mrr * 12;

  // Real transactions count from live workspace data
  const totalInvoicesIssued = React.useMemo(() => {
    try {
      const savedInv = localStorage.getItem('adwiselabs_invoices');
      const savedBills = localStorage.getItem('adwiselabs_bills');
      const invCount = savedInv ? JSON.parse(savedInv).length : 0;
      const billCount = savedBills ? JSON.parse(savedBills).length : 0;
      return invCount + billCount;
    } catch {
      return 0;
    }
  }, []);

  const totalUsersAcrossTenants = tenants.reduce((acc, t) => acc + (t.adminUser ? 1 : 0), 0);

  // Plan distribution counts
  const planDistribution = plans.map(plan => {
    const count = tenants.filter(t => t.planId === plan.id).length;
    const percentage = tenants.length > 0 ? Math.round((count / tenants.length) * 100) : 0;
    return { plan, count, percentage };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-xl bg-white border border-slate-200 p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-[#0070ba] text-[11px] font-bold border border-sky-200 mb-2">
            <Zap className="w-3.5 h-3.5" /> Multi-Tenant SaaS Control Plane
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Adwiselabs SaaS Operations & Tenant Manager
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Provision client organizations, set currency standards, configure subscription packages, and launch directly into client accounting workspaces.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setCurrentView('tenants')}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" /> View All Clients ({tenants.length})
          </button>
          <button
            onClick={onOpenCreateTenant}
            className="px-4 py-2 rounded-lg bg-[#0070ba] hover:bg-sky-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-sky-600/20"
          >
            <Zap className="w-3.5 h-3.5" /> Onboard Client
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total MRR */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Monthly Recurring (MRR)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">${mrr.toLocaleString()}</h3>
            <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-bold mt-1">
              <TrendingUp className="w-3 h-3" /> ARR: ${arr.toLocaleString()} / year
            </p>
          </div>
        </div>

        {/* Active Clients */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Tenant Orgs</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0070ba] border border-sky-200 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{activeTenants.length} <span className="text-xs font-normal text-slate-500">/ {tenants.length} total</span></h3>
            <p className="text-[11px] text-amber-600 flex items-center gap-1 font-semibold mt-1">
              <Clock className="w-3 h-3" /> {trialTenants.length} in free trial period
            </p>
          </div>
        </div>

        {/* Provisioned Users */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Client Users</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalUsersAcrossTenants} Users</h3>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
              Active across client teams
            </p>
          </div>
        </div>

        {/* Financial Transactions */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Transactions</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalInvoicesIssued.toLocaleString()}</h3>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
              Invoices & bills processed
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Client Roster + Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Client Fast Launch Table */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0070ba]" /> Client Workspaces & 1-Click Launch
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Click 'Access Portal' to instantly open any client's Adwiselabs dashboard</p>
              </div>
              {tenants.length > 0 && (
                <button 
                  onClick={() => setCurrentView('tenants')}
                  className="text-xs text-[#0070ba] hover:underline font-bold flex items-center gap-1"
                >
                  View all ({tenants.length}) <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {tenants.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {tenants.slice(0, 5).map(tenant => {
                  const plan = plans.find(p => p.id === tenant.planId);
                  return (
                    <div key={tenant.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 -mx-2 rounded-lg transition">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#0070ba] border border-sky-200 flex items-center justify-center font-extrabold text-sm shrink-0">
                          {tenant.companyName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-slate-900 truncate">{tenant.companyName}</h4>
                            <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              tenant.status === 'active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                              tenant.status === 'trial' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                              'bg-rose-100 text-rose-700 border border-rose-200'
                            }`}>
                              {tenant.status}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-500 mt-0.5 truncate">
                            {tenant.adminUser?.name || 'Administrator'} &bull; {tenant.adminUser?.email || 'N/A'} &bull; <strong className="text-slate-700">{tenant.currency} ({tenant.currencySymbol})</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-[10.5px] px-2 py-1 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                          {plan?.name || 'Custom'}
                        </span>
                        
                        <button
                          onClick={() => impersonateTenant(tenant.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#0070ba] hover:bg-sky-700 text-white text-[11px] font-bold flex items-center gap-1.5 transition shadow-sm"
                          title="Login and open client Adwiselabs workspace"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Access Portal
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No client workspaces provisioned yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
                  Click 'Onboard Client' to register your first business client and configure their currency & modules.
                </p>
                <button
                  onClick={onOpenCreateTenant}
                  className="mt-3 px-3.5 py-1.5 bg-[#0070ba] hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-sm inline-flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" /> Onboard First Client
                </button>
              </div>
            )}
          </div>

          {/* Module Capabilities Matrix */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0070ba]" /> Adwiselabs Business Modules
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              All client workspaces support granular configuration for these enterprise accounting modules:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {[
                { name: 'Sales & Invoicing', code: 'invoicing', status: 'Enabled' },
                { name: 'Bills & Expenses', code: 'expenses', status: 'Enabled' },
                { name: 'Inventory & Items', code: 'inventory', status: 'Enabled' },
                { name: 'Banking & Feeds', code: 'banking', status: 'Enabled' },
                { name: 'Chart of Accounts', code: 'accounting', status: 'Enabled' },
                { name: 'VAT & Tax Returns', code: 'vatTax', status: 'Enabled' },
                { name: 'Payroll & HR', code: 'payroll', status: 'Enabled' },
                { name: 'Financial Reports', code: 'reports', status: 'Enabled' },
                { name: 'Multi-Currency', code: 'multiCurrency', status: 'Enabled' },
              ].map(mod => (
                <div key={mod.code} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 text-[11px]">{mod.name}</p>
                    <p className="text-[9.5px] text-emerald-600 font-semibold">{mod.status}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Subscription Plan Breakdown & Live Activity */}
        <div className="space-y-5">
          {/* Subscription Tier Distribution */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0070ba]" /> Subscription Tier Breakdown
            </h3>

            <div className="space-y-3">
              {planDistribution.map(({ plan, count, percentage }) => (
                <div key={plan.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{plan.name}</span>
                    <span className="text-slate-500 font-medium">{count} tenants ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className={`h-full rounded-full ${
                        plan.id === 'plan_enterprise' ? 'bg-indigo-600' :
                        plan.id === 'plan_pro' ? 'bg-[#0070ba]' :
                        'bg-sky-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button 
                onClick={() => setCurrentView('tenants')}
                className="text-xs text-[#0070ba] hover:underline font-bold"
              >
                Manage client organizations &rarr;
              </button>
            </div>
          </div>

          {/* Cloud System Status */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0070ba]" /> Cloud Infrastructure Status
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Multi-Tenant Isolation</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[10.5px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Operational
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Accounting & Tax Engine</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[10.5px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Multi-Currency Conversion</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[10.5px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
