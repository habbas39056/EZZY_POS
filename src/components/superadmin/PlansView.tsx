import React, { useState } from 'react';
import { Layers, Plus, Check, Edit3, Users, FileText, HardDrive, X, Save } from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import type { Plan, ModuleFlags } from '../../types';

export const PlansView: React.FC = () => {
  const { plans, updatePlan, addPlan } = useSuperAdmin();
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form for edit / create
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [priceMonthly, setPriceMonthly] = useState(0);
  const [priceYearly, setPriceYearly] = useState(0);
  const [maxUsers, setMaxUsers] = useState(5);
  const [maxInvoices, setMaxInvoices] = useState(100);
  const [storageLimitMB, setStorageLimitMB] = useState(2048);
  const [featuresStr, setFeaturesStr] = useState('');
  const [moduleDefaults, setModuleDefaults] = useState<ModuleFlags>({
    invoicing: true,
    inventory: true,
    banking: true,
    accounting: true,
    vatTax: true,
    payroll: false,
    expenses: true,
    reports: true,
    multiCurrency: false,
    pos: false,
  });

  const startEdit = (p: Plan) => {
    setEditingPlan(p);
    setName(p.name);
    setTagline(p.tagline);
    setPriceMonthly(p.priceMonthly);
    setPriceYearly(p.priceYearly);
    setMaxUsers(p.maxUsers);
    setMaxInvoices(p.maxInvoices);
    setStorageLimitMB(p.storageLimitMB);
    setFeaturesStr(p.features.join('\n'));
    setModuleDefaults(p.moduleDefaults);
    setIsCreating(false);
  };

  const startCreate = () => {
    setEditingPlan(null);
    setName('New Growth Tier');
    setTagline('Tailored for specialized teams and enterprises.');
    setPriceMonthly(79);
    setPriceYearly(790);
    setMaxUsers(20);
    setMaxInvoices(1000);
    setStorageLimitMB(10240);
    setFeaturesStr('Up to 20 Users\n1000 Invoices / mo\nAll Financial Modules\nMulti-Currency Support');
    setIsCreating(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const features = featuresStr.split('\n').map(s => s.trim()).filter(Boolean);

    if (isCreating) {
      addPlan({
        name,
        tagline,
        priceMonthly,
        priceYearly,
        currency: 'USD',
        currencySymbol: '$',
        maxUsers,
        maxInvoices,
        storageLimitMB,
        features,
        moduleDefaults,
      });
      setIsCreating(false);
    } else if (editingPlan) {
      updatePlan(editingPlan.id, {
        name,
        tagline,
        priceMonthly,
        priceYearly,
        maxUsers,
        maxInvoices,
        storageLimitMB,
        features,
        moduleDefaults,
      });
      setEditingPlan(null);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#0070ba]" /> SaaS Subscription Packages
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure pricing tiers, quotas, and default Adwiselabs module capabilities.
          </p>
        </div>
        <button
          onClick={startCreate}
          className="px-3.5 py-2 bg-[#0070ba] hover:bg-sky-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Tier
        </button>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map(plan => {
          return (
            <div 
              key={plan.id}
              className={`bg-white rounded-xl p-5 border flex flex-col justify-between relative transition duration-150 ${
                plan.isPopular 
                  ? 'border-[#0070ba] shadow-md' 
                  : 'border-slate-200 shadow-sm hover:border-slate-300'
              }`}
            >
              {plan.isPopular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#0070ba] text-white text-[9.5px] font-extrabold uppercase tracking-wider shadow-xs">
                  Most Popular
                </span>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900">{plan.name}</h3>
                  <button
                    onClick={() => startEdit(plan)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    title="Edit Plan"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 mt-1 min-h-[30px]">{plan.tagline}</p>

                {/* Price Display */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-slate-900">${plan.priceMonthly}</span>
                  <span className="text-xs text-slate-500 font-medium">/ month</span>
                  <span className="text-[10.5px] text-emerald-600 font-bold ml-auto">
                    ${plan.priceYearly}/yr
                  </span>
                </div>

                {/* Limits stats */}
                <div className="mt-4 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Users className="w-3.5 h-3.5" /> Max Users:
                    </span>
                    <span className="font-bold">{plan.maxUsers} Users</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-1 text-slate-500">
                      <FileText className="w-3.5 h-3.5" /> Invoices Quota:
                    </span>
                    <span className="font-bold">{plan.maxInvoices === -1 ? 'Unlimited' : `${plan.maxInvoices} /mo`}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-1 text-slate-500">
                      <HardDrive className="w-3.5 h-3.5" /> Storage Cap:
                    </span>
                    <span className="font-bold">{plan.storageLimitMB / 1024} GB</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="mt-4 space-y-1.5 text-xs">
                  <p className="font-bold text-slate-700 text-[10.5px] uppercase tracking-wider">Features Included:</p>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-600">
                      <div className="w-4 h-4 rounded-full bg-sky-100 text-[#0070ba] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-[11px]">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => startEdit(plan)}
                  className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" /> Modify Package
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Create Plan Modal */}
      {(editingPlan || isCreating) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh] text-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-extrabold text-sm text-slate-900">
                {isCreating ? 'Create New Package Tier' : `Edit ${editingPlan?.name} Plan`}
              </h3>
              <button 
                onClick={() => { setEditingPlan(null); setIsCreating(false); }}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 text-xs space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Short Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Monthly Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={priceMonthly}
                    onChange={(e) => setPriceMonthly(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Annual Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={priceYearly}
                    onChange={(e) => setPriceYearly(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Max Users Allowed</label>
                  <input
                    type="number"
                    min="1"
                    value={maxUsers}
                    onChange={(e) => setMaxUsers(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Max Invoices / month (-1 = unlimited)</label>
                  <input
                    type="number"
                    value={maxInvoices}
                    onChange={(e) => setMaxInvoices(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Feature Bullet Points (one per line)</label>
                <textarea
                  rows={4}
                  value={featuresStr}
                  onChange={(e) => setFeaturesStr(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => { setEditingPlan(null); setIsCreating(false); }}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-[#0070ba] hover:bg-sky-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" /> Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
