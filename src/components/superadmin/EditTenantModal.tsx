import React, { useState } from 'react';
import { X, Building2, Save } from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import type { Tenant, BusinessIndustry, TenantStatus, ModuleFlags } from '../../types';

interface EditTenantModalProps {
  tenant: Tenant;
  onClose: () => void;
}

const INDUSTRIES: BusinessIndustry[] = [
  'Retail & Wholesale',
  'IT & Software Services',
  'Construction & Real Estate',
  'Manufacturing',
  'Consulting & Professional Services',
  'Healthcare & Medical',
  'Restaurant & Hospitality',
  'Logistics & Transport',
  'E-Commerce',
  'Other'
];

export const EditTenantModal: React.FC<EditTenantModalProps> = ({ tenant, onClose }) => {
  const { plans, updateTenant } = useSuperAdmin();

  const [companyName, setCompanyName] = useState(tenant.companyName);
  const [tradingName, setTradingName] = useState(tenant.tradingName || '');
  const [industry, setIndustry] = useState<BusinessIndustry>(tenant.industry);
  const [status, setStatus] = useState<TenantStatus>(tenant.status);
  const [planId, setPlanId] = useState(tenant.planId);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(tenant.billingCycle);
  const [planExpiresAt, setPlanExpiresAt] = useState(tenant.planExpiresAt);
  const [vatTaxNumber, setVatTaxNumber] = useState(tenant.vatTaxNumber || '');
  const [address] = useState(tenant.address || '');
  const [city] = useState(tenant.city || '');
  const [phone] = useState(tenant.phone || '');
  const [modules, setModules] = useState<ModuleFlags>(tenant.enabledModules);

  // Admin contact
  const [adminName, setAdminName] = useState(tenant.adminUser.name);
  const [adminEmail, setAdminEmail] = useState(tenant.adminUser.email);
  const [adminPhone, setAdminPhone] = useState(tenant.adminUser.phone || '');

  const handleModuleToggle = (mod: keyof ModuleFlags) => {
    setModules(prev => ({ ...prev, [mod]: !prev[mod] }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenant(tenant.id, {
      companyName,
      tradingName,
      industry,
      status,
      planId,
      billingCycle,
      planExpiresAt,
      vatTaxNumber,
      address,
      city,
      phone,
      enabledModules: modules,
      adminUser: {
        ...tenant.adminUser,
        name: adminName,
        email: adminEmail,
        phone: adminPhone
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh] text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#0070ba] border border-sky-200 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-slate-900">Edit Client Organization</h2>
              <p className="text-[11px] text-slate-500">Configure parameters for {tenant.companyName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 text-xs space-y-4">
          {/* General info */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Organization Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Trading Name</label>
                <input
                  type="text"
                  value={tradingName}
                  onChange={(e) => setTradingName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value as BusinessIndustry)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white font-medium"
                >
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">VAT / Tax ID</label>
                <input
                  type="text"
                  value={vatTaxNumber}
                  onChange={(e) => setVatTaxNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Subscription & Status */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Subscription & Access Control</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Account Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TenantStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white font-medium"
                >
                  <option value="active">Active (Paid)</option>
                  <option value="trial">Trial Account</option>
                  <option value="suspended">Suspended (Access Locked)</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Package Plan</label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white font-medium"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (${p.priceMonthly}/mo)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Billing Cycle</label>
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value as 'monthly' | 'yearly')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white font-medium"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Annual</option>
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-slate-700 font-semibold mb-1">Subscription Expiry / Renewal Date</label>
              <input
                type="date"
                value={planExpiresAt}
                onChange={(e) => setPlanExpiresAt(e.target.value)}
                className="w-full sm:w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white font-medium"
              />
            </div>
          </div>

          {/* Module Entitlements */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Enabled Adwiselabs Modules</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { key: 'invoicing', label: 'Sales & Invoicing' },
                { key: 'expenses', label: 'Purchases & Bills' },
                { key: 'inventory', label: 'Inventory & Items' },
                { key: 'banking', label: 'Banking & Feeds' },
                { key: 'accounting', label: 'Chart of Accounts' },
                { key: 'vatTax', label: 'VAT / Tax Returns' },
                { key: 'payroll', label: 'Payroll & HR' },
                { key: 'reports', label: 'Financial Reports' },
                { key: 'multiCurrency', label: 'Multi-Currency' },
                { key: 'pos', label: 'Point of Sale (POS)' },
              ].map(item => {
                const isEnabled = modules[item.key as keyof ModuleFlags];
                return (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => handleModuleToggle(item.key as keyof ModuleFlags)}
                    className={`p-2 rounded-lg border flex items-center justify-between text-left transition ${
                      isEnabled 
                        ? 'bg-sky-50 border-sky-300 text-slate-900 font-bold' 
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span className="text-[11px]">{item.label}</span>
                    <span className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold ${
                      isEnabled ? 'bg-[#0070ba] text-white' : 'bg-slate-200 text-slate-400'
                    }`}>
                      {isEnabled ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin User Info */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Admin Contact Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Admin Name</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Admin Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Admin Phone</label>
                <input
                  type="text"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Footer Save */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#0070ba] hover:bg-sky-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
