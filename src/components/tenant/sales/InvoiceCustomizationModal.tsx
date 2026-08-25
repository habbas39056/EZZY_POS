import React, { useState } from 'react';
import { X, Upload, Save } from 'lucide-react';
import type { OrganizationDetails } from '../../../types/settings';

interface InvoiceCustomizationModalProps {
  onClose: () => void;
  orgDetails: OrganizationDetails;
  onSave: (updatedDetails: OrganizationDetails) => void;
}

export const InvoiceCustomizationModal: React.FC<InvoiceCustomizationModalProps> = ({ onClose, orgDetails, onSave }) => {
  const [formData, setFormData] = useState<OrganizationDetails>(orgDetails);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-sm font-bold text-slate-800">Customize Invoice Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company Logo URL</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                name="logoUrl"
                value={formData.logoUrl || ''} 
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0070ba]/20 focus:border-[#0070ba] outline-none"
              />
              <button className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-200 flex items-center gap-2 font-medium">
                <Upload className="w-4 h-4" /> Upload
              </button>
            </div>
            {formData.logoUrl && (
              <img src={formData.logoUrl} alt="Preview" className="h-10 object-contain mt-2 border border-slate-200 p-1 rounded bg-slate-50" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Name</label>
              <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Organization Email</label>
            <input type="email" name="organizationEmail" value={formData.organizationEmail} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Province/State</label>
              <input type="text" name="province" value={formData.province} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Country</label>
              <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Invoice Terms & Conditions</label>
            <textarea 
              name="termsAndConditions" 
              value={formData.termsAndConditions} 
              onChange={handleChange} 
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none resize-none" 
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-semibold text-xs hover:bg-slate-200 rounded-lg transition">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-[#0070ba] text-white font-bold text-xs rounded-lg hover:bg-sky-700 transition shadow-xs flex items-center gap-2">
            <Save className="w-3.5 h-3.5" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
