import React, { useState } from 'react';
import { 
  Building, 
  Plus, 
  CheckCircle, 
  ExternalLink, 
  Globe, 
  MapPin, 
  Briefcase,
  HelpCircle,
  X
} from 'lucide-react';

interface BusinessOrg {
  id: string;
  name: string;
  industry: string;
  country: string;
  city: string;
  currency: string;
  taxNumber: string;
  isActive: boolean;
  userRole: string;
}

const SAMPLE_BUSINESSES: BusinessOrg[] = [
  {
    id: 'biz_1',
    name: 'ARKIT Services',
    industry: 'Manufacturing & Distribution',
    country: 'Pakistan',
    city: 'Islamabad',
    currency: 'PKR',
    taxNumber: '7829103-4',
    isActive: true,
    userRole: 'Owner / Administrator'
  },
  {
    id: 'biz_2',
    name: 'Adwiselabs Software HQ',
    industry: 'Information Technology',
    country: 'Pakistan',
    city: 'Lahore',
    currency: 'PKR',
    taxNumber: '4410291-8',
    isActive: false,
    userRole: 'Owner'
  },
  {
    id: 'biz_3',
    name: 'Prime Retail Logistics',
    industry: 'Retail & Wholesale',
    country: 'United Arab Emirates',
    city: 'Dubai',
    currency: 'AED',
    taxNumber: '10029481900003',
    isActive: false,
    userRole: 'Financial Manager'
  }
];

export const MyBusinessesView: React.FC = () => {
  const [businesses, setBusinesses] = useState<BusinessOrg[]>(() => {
    const saved = localStorage.getItem('adwiselabs_my_businesses');
    return saved ? JSON.parse(saved) : SAMPLE_BUSINESSES;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBizName, setNewBizName] = useState('');
  const [newBizIndustry, setNewBizIndustry] = useState('Retail & Wholesale');
  const [newBizCity, setNewBizCity] = useState('Islamabad');
  const [newBizCurrency, setNewBizCurrency] = useState('PKR');

  const saveBusinesses = (list: BusinessOrg[]) => {
    setBusinesses(list);
    localStorage.setItem('adwiselabs_my_businesses', JSON.stringify(list));
  };

  const handleSwitchBusiness = (id: string) => {
    const updated = businesses.map(b => ({
      ...b,
      isActive: b.id === id
    }));
    saveBusinesses(updated);
    const chosen = updated.find(b => b.id === id);
    alert(`Switched active business organization to "${chosen?.name}"!`);
  };

  const handleAddBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim()) return;

    const newOrg: BusinessOrg = {
      id: `biz_${Date.now()}`,
      name: newBizName.trim(),
      industry: newBizIndustry,
      country: 'Pakistan',
      city: newBizCity,
      currency: newBizCurrency,
      taxNumber: `${Math.floor(1000000 + Math.random() * 9000000)}-1`,
      isActive: false,
      userRole: 'Owner'
    };

    saveBusinesses([...businesses, newOrg]);
    setIsAddModalOpen(false);
    setNewBizName('');
    alert(`Business "${newOrg.name}" created successfully!`);
  };

  return (
    <div className="space-y-4 font-sans text-xs text-slate-700 select-none pb-12">
      {/* Top Horizontal Sub-tab */}
      <div className="bg-[#e9edf2] border-b border-slate-300 -mx-4 -mt-4 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-0.5 overflow-x-auto text-xs font-semibold py-1">
          <button
            className="px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs"
          >
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <span>My Businesses</span>
          </button>
        </div>

        <HelpCircle className="w-4 h-4 text-slate-500 hover:text-slate-700 cursor-pointer" />
      </div>

      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800">Business Organizations</h2>
          <p className="text-xs text-slate-500">Manage multiple companies and switch between organizations seamlessly.</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-[#0070ba] hover:bg-sky-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Business</span>
        </button>
      </div>

      {/* Businesses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map(b => (
          <div
            key={b.id}
            className={`bg-white rounded-xl border p-5 space-y-4 shadow-sm transition relative overflow-hidden ${
              b.isActive ? 'border-[#0070ba] ring-2 ring-sky-100' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {b.isActive && (
              <div className="absolute top-0 right-0 bg-[#0070ba] text-white text-[10px] font-extrabold px-3 py-0.5 rounded-bl-lg flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> ACTIVE
              </div>
            )}

            <div className="flex items-center space-x-3 pt-1">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-base shadow-xs ${
                b.isActive ? 'bg-[#001e3d] text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {b.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{b.name}</h3>
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-slate-400" /> {b.industry}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-400"><MapPin className="w-3 h-3" /> Location:</span>
                <span className="font-semibold text-slate-800">{b.city}, {b.country}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-400"><Globe className="w-3 h-3" /> Currency:</span>
                <span className="font-mono font-bold text-slate-900">{b.currency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">NTN / Tax ID:</span>
                <span className="font-mono text-slate-700">{b.taxNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Your Role:</span>
                <span className="font-semibold text-emerald-700">{b.userRole}</span>
              </div>
            </div>

            <div className="pt-2">
              {b.isActive ? (
                <button
                  disabled
                  className="w-full py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-lg text-xs cursor-default flex items-center justify-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Currently Active
                </button>
              ) : (
                <button
                  onClick={() => handleSwitchBusiness(b.id)}
                  className="w-full py-1.5 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Switch to Business
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add New Business Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleAddBusiness}
            className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building className="w-4 h-4 text-[#0070ba]" /> Add New Business Organization
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  placeholder="e.g. Apex Global Logistics"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Industry</label>
                <select
                  value={newBizIndustry}
                  onChange={(e) => setNewBizIndustry(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#0070ba]"
                >
                  <option value="Retail & Wholesale">Retail & Wholesale</option>
                  <option value="Manufacturing & Distribution">Manufacturing & Distribution</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Services & Consultancy">Services & Consultancy</option>
                  <option value="Healthcare & Pharma">Healthcare & Pharma</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={newBizCity}
                    onChange={(e) => setNewBizCity(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Currency</label>
                  <select
                    value={newBizCurrency}
                    onChange={(e) => setNewBizCurrency(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                  >
                    <option value="PKR">PKR (₨)</option>
                    <option value="USD">USD ($)</option>
                    <option value="AED">AED (د.إ)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-[#0070ba] hover:bg-sky-700 text-white font-bold rounded text-xs shadow-xs"
              >
                Create Business
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
