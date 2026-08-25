import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  User, 
  Check, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Mail,
  Phone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import type { BusinessIndustry, ModuleFlags, TenantStatus } from '../../types';

interface CreateTenantModalProps {
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

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)' },
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee (PKR)' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal (SAR)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CAD)' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar (AUD)' },
];

export const CreateTenantModal: React.FC<CreateTenantModalProps> = ({ onClose }) => {
  const { plans, addTenant, impersonateTenant } = useSuperAdmin();
  const [step, setStep] = useState<number>(1);
  const [createdTenantId, setCreatedTenantId] = useState<string | null>(null);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [tradingName, setTradingName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [vatTaxNumber, setVatTaxNumber] = useState('');
  const [industry, setIndustry] = useState<BusinessIndustry>('IT & Software Services');
  const [country, setCountry] = useState('United States');
  const [currency, setCurrency] = useState('USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [fiscalYearStart, setFiscalYearStart] = useState('01-01');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  // Admin User
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('Welcome@2026');

  // Plan & Modules
  const [selectedPlanId, setSelectedPlanId] = useState('plan_pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [status, setStatus] = useState<TenantStatus>('active');

  const [modules, setModules] = useState<ModuleFlags>({
    invoicing: true,
    inventory: true,
    banking: true,
    accounting: true,
    vatTax: true,
    payroll: true,
    expenses: true,
    reports: true,
    multiCurrency: true,
    pos: false,
  });

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setModules({ ...plan.moduleDefaults });
    }
  };

  const handleCurrencyChange = (code: string) => {
    setCurrency(code);
    const found = CURRENCIES.find(c => c.code === code);
    if (found) setCurrencySymbol(found.symbol);
  };

  const handleModuleToggle = (mod: keyof ModuleFlags) => {
    setModules(prev => ({ ...prev, [mod]: !prev[mod] }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim() || !adminEmail.trim() || !adminName.trim()) {
      alert('Please fill in Company Name, Admin Name, and Admin Email.');
      return;
    }

    const selectedPlan = plans.find(p => p.id === selectedPlanId);
    const now = new Date();
    const expiryDate = new Date();
    
    if (status === 'trial') {
      expiryDate.setDate(now.getDate() + 14);
    } else {
      if (billingCycle === 'yearly') {
        expiryDate.setFullYear(now.getFullYear() + 1);
      } else {
        expiryDate.setMonth(now.getMonth() + 1);
      }
    }

    const newTenant = addTenant({
      slug: companyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      companyName,
      tradingName: tradingName || companyName,
      registrationNumber,
      vatTaxNumber,
      industry,
      country,
      currency,
      currencySymbol,
      fiscalYearStart,
      address,
      city,
      phone,
      website,
      status,
      planId: selectedPlanId,
      billingCycle,
      planStartDate: now.toISOString().substring(0, 10),
      planExpiresAt: expiryDate.toISOString().substring(0, 10),
      enabledModules: modules,
      adminUser: {
        id: `usr_${Date.now().toString().slice(-4)}`,
        name: adminName,
        email: adminEmail,
        phone: adminPhone || phone,
        role: 'owner',
        lastLogin: 'Never'
      },
      usage: {
        invoicesCount: 0,
        maxInvoices: selectedPlan?.maxInvoices ?? 500,
        usersCount: 1,
        maxUsers: selectedPlan?.maxUsers ?? 10,
        storageUsedMB: 10,
        maxStorageMB: selectedPlan?.storageLimitMB ?? 5120
      }
    });

    setCreatedTenantId(newTenant.id);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setStep(4);
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
              <h2 className="font-extrabold text-sm text-slate-900">Client Provisioning Wizard</h2>
              <p className="text-[11px] text-slate-500">Onboard a new organization to the Adwiselabs SaaS cloud</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Bar */}
        {step < 4 && (
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center space-x-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                step >= 1 ? 'bg-[#0070ba] text-white' : 'bg-slate-200 text-slate-500'
              }`}>1</span>
              <span className={step === 1 ? 'text-slate-900 font-bold' : 'text-slate-500'}>Company Profile</span>
            </div>
            <div className="w-10 h-[1px] bg-slate-200" />
            <div className="flex items-center space-x-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                step >= 2 ? 'bg-[#0070ba] text-white' : 'bg-slate-200 text-slate-500'
              }`}>2</span>
              <span className={step === 2 ? 'text-slate-900 font-bold' : 'text-slate-500'}>Admin Account</span>
            </div>
            <div className="w-10 h-[1px] bg-slate-200" />
            <div className="flex items-center space-x-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                step >= 3 ? 'bg-[#0070ba] text-white' : 'bg-slate-200 text-slate-500'
              }`}>3</span>
              <span className={step === 3 ? 'text-slate-900 font-bold' : 'text-slate-500'}>Plan & Modules</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {/* STEP 1: Company Profile */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Organization & Fiscal Setup</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Global Traders Ltd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Trading Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Shop"
                    value={tradingName}
                    onChange={(e) => setTradingName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Industry Sector</label>
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
                  <label className="block text-slate-700 font-semibold mb-1">Base Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white font-medium"
                  >
                    {CURRENCIES.map(curr => (
                      <option key={curr.code} value={curr.code}>{curr.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Company Registration No.</label>
                  <input
                    type="text"
                    placeholder="e.g. 1092841"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">VAT / Tax ID / NTN</label>
                  <input
                    type="text"
                    placeholder="e.g. GB982341102 / EIN-849201"
                    value={vatTaxNumber}
                    onChange={(e) => setVatTaxNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Business Phone / Tel</label>
                  <input
                    type="text"
                    placeholder="e.g. +44 20 7946 0912"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Website URL</label>
                  <input
                    type="text"
                    placeholder="e.g. https://mycompany.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fiscal Year Start</label>
                  <select
                    value={fiscalYearStart}
                    onChange={(e) => setFiscalYearStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white font-medium"
                  >
                    <option value="01-01">January 1st (Calendar Year)</option>
                    <option value="04-01">April 1st (UK / Standard)</option>
                    <option value="07-01">July 1st (AUS / PK / Standard)</option>
                    <option value="10-01">October 1st (US Fiscal)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Country</label>
                  <input
                    type="text"
                    placeholder="e.g. United Kingdom, USA, UAE"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">City / Region</label>
                  <input
                    type="text"
                    placeholder="e.g. London / Dubai / New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Business Address</label>
                <textarea
                  rows={2}
                  placeholder="Street address, building, suite..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Client Admin Credentials */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Primary Tenant Administrator Credentials</h3>
              <p className="text-slate-500">
                These credentials will be assigned as the master workspace owner.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Admin Full Name *</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jonathan Davies"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Admin Login Email *</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. admin@apexglobal.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone / WhatsApp</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. +44 7700 900123"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Initial Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-slate-700 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#0070ba] shrink-0 mt-0.5" />
                <span className="text-[11px]">
                  Super Admin can reset this password anytime or impersonate this client with 1-click bypass from the Client Directory.
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: Plan & Modules */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Assign Subscription Tier</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {plans.map(plan => {
                    const isSelected = selectedPlanId === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => handlePlanChange(plan.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition relative ${
                          isSelected 
                            ? 'bg-sky-50/80 border-[#0070ba] shadow-sm' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#0070ba] text-white flex items-center justify-center absolute top-2 right-2">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                        <h4 className="font-extrabold text-xs text-slate-900">{plan.name}</h4>
                        <p className="text-[#0070ba] font-extrabold text-sm mt-0.5">
                          ${plan.priceMonthly}<span className="text-[10px] text-slate-500 font-normal"> /mo</span>
                        </p>
                        <p className="text-[10.5px] text-slate-500 mt-1 line-clamp-2">{plan.tagline}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Account Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TenantStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white font-medium"
                  >
                    <option value="active">Active (Paid Subscription)</option>
                    <option value="trial">14-Day Free Trial</option>
                    <option value="suspended">Suspended (Locked)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Billing Frequency</label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as 'monthly' | 'yearly')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white font-medium"
                  >
                    <option value="monthly">Monthly Recurring</option>
                    <option value="yearly">Annual (Discounted)</option>
                  </select>
                </div>
              </div>

              {/* Module Entitlements Toggle */}
              <div>
                <label className="block text-slate-700 font-bold mb-2">Enable / Disable Adwiselabs Business Modules</label>
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
            </div>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <div className="text-center py-6 space-y-3.5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Client Provisioned Successfully!</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  <strong className="text-slate-900">{companyName}</strong> is now live with dedicated database storage and assigned <strong className="text-[#0070ba]">{plans.find(p => p.id === selectedPlanId)?.name}</strong>.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl max-w-md mx-auto text-left space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Admin Email:</span>
                  <span className="text-[#0070ba] font-bold">{adminEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Password:</span>
                  <span className="text-slate-800">{adminPassword}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Base Currency:</span>
                  <span className="text-emerald-700 font-bold">{currency} ({currencySymbol})</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  onClick={() => {
                    onClose();
                    if (createdTenantId) impersonateTenant(createdTenantId);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0070ba] hover:bg-sky-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <Building2 className="w-4 h-4" /> Launch Client Workspace Now
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                >
                  Return to Admin Directory
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {step < 4 && (
          <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !companyName.trim()) {
                    alert('Please enter a Company Name to continue.');
                    return;
                  }
                  if (step === 2 && (!adminName.trim() || !adminEmail.trim())) {
                    alert('Please enter Admin Name and Email.');
                    return;
                  }
                  setStep(step + 1);
                }}
                className="px-4 py-1.5 rounded-lg bg-[#0070ba] hover:bg-sky-700 text-white font-bold flex items-center gap-1 shadow-sm"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreate}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" /> Provision & Create Client
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
