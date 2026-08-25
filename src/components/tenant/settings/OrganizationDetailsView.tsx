import React, { useState, useEffect } from 'react';
import { Plus, Info } from 'lucide-react';
import type { OrganizationDetails } from '../../../types/settings';
import { INITIAL_ORG_DETAILS } from '../../../types/settings';
import { api } from '../../../services/api';

export const OrganizationDetailsView: React.FC = () => {
  const [formData, setFormData] = useState<OrganizationDetails>(INITIAL_ORG_DETAILS);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await api.getOrganization();
      if (data) {
        setFormData({ ...INITIAL_ORG_DETAILS, ...data });
      } else {
        const saved = localStorage.getItem('adwiselabs_org_details');
        if (saved) setFormData({ ...INITIAL_ORG_DETAILS, ...JSON.parse(saved) });
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleChange = (field: keyof OrganizationDetails, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.updateOrganization(formData);
    localStorage.setItem('adwiselabs_org_details', JSON.stringify(formData));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6 font-sans text-xs text-slate-700 select-none">
      {/* Title Header matching Screenshot */}
      <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-[#0070ba]">
          Organization Details
        </h2>
        {savedSuccess && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 animate-in fade-in">
            ✓ Organization settings updated successfully!
          </span>
        )}
      </div>

      {/* Main 3-Column Grid matching Screenshot */}
      <div className="space-y-4">
        {/* ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* First Name * */}
          <div>
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              First Name*
            </label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            />
          </div>

          {/* Business Name * */}
          <div>
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Business Name *
            </label>
            <input
              type="text"
              required
              value={formData.businessName}
              onChange={(e) => handleChange('businessName', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800 font-bold"
            />
          </div>

          {/* Tax */}
          <div>
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Tax
            </label>
            <input
              type="text"
              value={formData.tax}
              onChange={(e) => handleChange('tax', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            />
          </div>
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Account Email * */}
          <div>
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Account Email *
            </label>
            <input
              type="email"
              required
              value={formData.accountEmail}
              onChange={(e) => handleChange('accountEmail', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800 font-mono"
            />
          </div>

          {/* Organization Email * ⓘ */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <label className="block text-slate-500 font-medium text-[11px]">
                Organization Email *
              </label>
              <Info className="w-3 h-3 text-slate-400" />
            </div>
            <input
              type="email"
              required
              value={formData.organizationEmail}
              onChange={(e) => handleChange('organizationEmail', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800 font-mono"
            />
          </div>

          {/* Tax Number */}
          <div>
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Tax Number
            </label>
            <input
              type="text"
              value={formData.taxNumber}
              onChange={(e) => handleChange('taxNumber', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800 font-mono"
            />
          </div>
        </div>

        {/* ROW 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Phone */}
          <div>
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Phone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800 font-mono"
            />
          </div>

          {/* Industry* */}
          <div>
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Industry*
            </label>
            <select
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800 font-medium"
            >
              <option value="Manufacturing">Manufacturing</option>
              <option value="Retail & Wholesale">Retail & Wholesale</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Services & Consultancy">Services & Consultancy</option>
              <option value="Construction & Real Estate">Construction & Real Estate</option>
              <option value="Healthcare & Pharma">Healthcare & Pharma</option>
            </select>
          </div>

          {/* Spacer */}
          <div className="hidden md:block"></div>
        </div>

        {/* ROW 4 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Starting Date */}
          <div>
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Starting Date
            </label>
            <div className="font-bold text-slate-900 font-mono py-1">
              {formData.startingDate}
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Country
            </label>
            <div className="font-bold text-slate-900 py-1">
              {formData.country}
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800 font-medium"
            >
              <option value="Pakistani Rupee">Pakistani Rupee</option>
              <option value="US Dollar">US Dollar (USD)</option>
              <option value="British Pound">British Pound (GBP)</option>
              <option value="Euro">Euro (EUR)</option>
              <option value="UAE Dirham">UAE Dirham (AED)</option>
              <option value="Saudi Riyal">Saudi Riyal (SAR)</option>
            </select>
          </div>
        </div>

        {/* ROW 5 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Address */}
          <div>
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            />
          </div>

          {/* Province */}
          <div>
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Province
            </label>
            <select
              value={formData.province}
              onChange={(e) => handleChange('province', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800 font-medium"
            >
              <option value="Capital Territory">Capital Territory</option>
              <option value="Punjab">Punjab</option>
              <option value="Sindh">Sindh</option>
              <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
              <option value="Balochistan">Balochistan</option>
              <option value="Gilgit Baltistan">Gilgit Baltistan</option>
              <option value="Azad Jammu & Kashmir">Azad Jammu & Kashmir</option>
            </select>
          </div>
        </div>

        {/* ROW 6 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          {/* Post Code */}
          <div>
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Post Code
            </label>
            <input
              type="text"
              value={formData.postCode}
              onChange={(e) => handleChange('postCode', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800 font-mono"
            />
          </div>

          {/* STRN */}
          <div>
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              STRN
            </label>
            <input
              type="text"
              value={formData.strn}
              onChange={(e) => handleChange('strn', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800 font-mono"
            />
          </div>
        </div>

        {/* ROW 7: Bank Details */}
        <h3 className="text-sm font-bold text-[#0070ba] mt-6 border-b border-slate-100 pb-2">Bank Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">Bank Name</label>
            <input type="text" value={formData.bankName || ''} onChange={(e) => handleChange('bankName', e.target.value)} className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800" />
          </div>
          <div>
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">IBAN</label>
            <input type="text" value={formData.iban || ''} onChange={(e) => handleChange('iban', e.target.value)} className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800 font-mono" />
          </div>
          <div>
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">Account Title</label>
            <input type="text" value={formData.accountTitle || ''} onChange={(e) => handleChange('accountTitle', e.target.value)} className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800" />
          </div>
          <div>
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">Account No</label>
            <input type="text" value={formData.accountNo || ''} onChange={(e) => handleChange('accountNo', e.target.value)} className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800 font-mono" />
          </div>
        </div>

        {/* ROW 8: Terms & Conditions */}
        <div>
          <label className="block text-slate-500 font-medium mb-1 text-[11px]">
            Terms & Conditions of Invoice
          </label>
          <textarea
            rows={2}
            value={formData.termsAndConditions}
            onChange={(e) => handleChange('termsAndConditions', e.target.value)}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800 resize-y"
          />
        </div>

        {/* ROW 8: Upload Logo matching Screenshot */}
        <div className="space-y-2 pt-2">
          <label className="block text-slate-500 font-medium text-[11px]">
            Upload Logo
          </label>
          
          <div className="flex items-center space-x-3">
            <label className="px-3.5 py-1.5 bg-[#0070ba] hover:bg-sky-700 text-white font-bold rounded text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs">
              <Plus className="w-3.5 h-3.5" />
              <span>Choose File</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
            <span className="text-[10px] text-slate-400">
              (Supported format:png, jpg, jpeg)
            </span>
          </div>

          {/* Logo Preview Badge */}
          <div className="pt-2">
            {formData.logoUrl ? (
              <img
                src={formData.logoUrl}
                alt="Organization Logo"
                className="w-16 h-16 rounded-full object-cover border-2 border-sky-400 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#001e3d] text-white flex items-center justify-center font-extrabold text-sm border-2 border-sky-400 shadow-sm">
                AL
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Update Button matching Screenshot */}
      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          type="submit"
          className="px-8 py-2 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded text-xs transition shadow-xs"
        >
          Update
        </button>
      </div>
    </form>
  );
};
