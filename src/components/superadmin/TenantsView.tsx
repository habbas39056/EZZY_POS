import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ShieldAlert, 
  Mail,
  LayoutGrid,
  List
} from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import type { Tenant, TenantStatus } from '../../types';
import { EditTenantModal } from './EditTenantModal';

interface TenantsViewProps {
  globalSearch: string;
  onOpenCreate: () => void;
}

export const TenantsView: React.FC<TenantsViewProps> = ({ globalSearch, onOpenCreate }) => {
  const { tenants, plans, impersonateTenant, changeTenantStatus, deleteTenant } = useSuperAdmin();

  const [search, setSearch] = useState(globalSearch || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  // Filtered tenants
  const filteredTenants = tenants.filter(t => {
    const effectiveSearch = search || globalSearch;
    const matchesSearch = 
      t.companyName.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      t.adminUser.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      t.adminUser.email.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      t.country.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      (t.registrationNumber && t.registrationNumber.toLowerCase().includes(effectiveSearch.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPlan = planFilter === 'all' || t.planId === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getStatusBadge = (status: TenantStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> Active
          </span>
        );
      case 'trial':
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Trial (14d)
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-3 h-3 text-rose-600" /> Suspended
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            <AlertCircle className="w-3 h-3 text-slate-500" /> Expired
          </span>
        );
    }
  };

  const getEnabledModulesCount = (t: Tenant) => {
    return Object.values(t.enabledModules).filter(Boolean).length;
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0070ba]" /> Client Organizations Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Provision and manage tenant business databases, user licenses, and access login portals.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-slate-100 text-[#0070ba] font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-slate-100 text-[#0070ba] font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={onOpenCreate}
            className="px-3.5 py-2 bg-[#0070ba] hover:bg-sky-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Add Client
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 text-xs">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by organization name, admin, email, or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0070ba] focus:bg-white text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#0070ba] text-xs font-medium"
            >
              <option value="all">All Statuses ({tenants.length})</option>
              <option value="active">Active Only</option>
              <option value="trial">Trial Accounts</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#0070ba] text-xs font-medium"
            >
              <option value="all">All Packages</option>
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table View (Crisp Clean Enterprise Light Theme) */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Client Organization</th>
                  <th className="px-4 py-3">Admin Contact</th>
                  <th className="px-4 py-3">Plan & Billing</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Currency</th>
                  <th className="px-4 py-3">Modules</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      No matching client organizations found.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map(tenant => {
                    const plan = plans.find(p => p.id === tenant.planId);
                    const enabledCount = getEnabledModulesCount(tenant);

                    return (
                      <tr key={tenant.id} className="hover:bg-slate-50 transition">
                        {/* Company */}
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#0070ba] border border-sky-200 flex items-center justify-center font-extrabold text-xs shrink-0">
                              {tenant.companyName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{tenant.companyName}</p>
                              <p className="text-[10.5px] text-slate-500">{tenant.industry} &bull; {tenant.city || tenant.country}</p>
                            </div>
                          </div>
                        </td>

                        {/* Admin */}
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800">{tenant.adminUser.name}</p>
                          <p className="text-[10.5px] text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" /> {tenant.adminUser.email}
                          </p>
                        </td>

                        {/* Plan */}
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[10.5px]">
                            {plan?.name || 'Custom'}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-0.5 capitalize">
                            {tenant.billingCycle} &bull; Exp: {tenant.planExpiresAt}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          {getStatusBadge(tenant.status)}
                        </td>

                        {/* Currency */}
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900">{tenant.currency}</span>{' '}
                          <span className="text-slate-500">({tenant.currencySymbol})</span>
                        </td>

                        {/* Modules */}
                        <td className="px-4 py-3">
                          <span className="text-[10.5px] px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-[#0070ba] font-bold">
                            {enabledCount} / 10 Active
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Login as Client */}
                            <button
                              onClick={() => impersonateTenant(tenant.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#0070ba] hover:bg-sky-700 text-white font-bold text-[10.5px] flex items-center gap-1 shadow-xs transition"
                              title="Login directly into Adwiselabs client workspace"
                            >
                              <ExternalLink className="w-3 h-3" /> Login Portal
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => setEditingTenant(tenant)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                              title="Edit Organization"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Status Quick Toggle */}
                            <button
                              onClick={() => {
                                const nextStatus = tenant.status === 'active' ? 'suspended' : 'active';
                                changeTenantStatus(tenant.id, nextStatus);
                              }}
                              className={`p-1.5 rounded-lg transition ${tenant.status === 'active' ? 'text-slate-400 hover:text-amber-600' : 'text-slate-400 hover:text-emerald-600'} hover:bg-slate-100`}
                              title={tenant.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                            >
                              {tenant.status === 'active' ? <ShieldAlert className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${tenant.companyName}?`)) {
                                  deleteTenant(tenant.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
                              title="Delete Client"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTenants.map(tenant => {
            const plan = plans.find(p => p.id === tenant.planId);
            return (
              <div key={tenant.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#0070ba] border border-sky-200 flex items-center justify-center font-extrabold text-sm">
                        {tenant.companyName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs leading-tight">{tenant.companyName}</h3>
                        <p className="text-[10.5px] text-slate-500">{tenant.industry}</p>
                      </div>
                    </div>
                    {getStatusBadge(tenant.status)}
                  </div>

                  <div className="mt-3.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Plan:</span>
                      <span className="text-slate-800 font-bold">{plan?.name} ({tenant.billingCycle})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Admin:</span>
                      <span className="text-slate-700">{tenant.adminUser.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email:</span>
                      <span className="text-slate-700 truncate max-w-[170px]">{tenant.adminUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Currency:</span>
                      <span className="text-emerald-600 font-bold">{tenant.currency} ({tenant.currencySymbol})</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setEditingTenant(tenant)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" /> Edit
                  </button>

                  <button
                    onClick={() => impersonateTenant(tenant.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#0070ba] hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Login Portal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingTenant && (
        <EditTenantModal
          tenant={editingTenant}
          onClose={() => setEditingTenant(null)}
        />
      )}
    </div>
  );
};
