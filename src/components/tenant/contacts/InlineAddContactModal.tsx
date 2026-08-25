import React, { useState } from 'react';
import { X, UserPlus, Building, Phone, Mail, MapPin } from 'lucide-react';
import type { Contact, ContactType, AddressInfo } from '../../../types/contact';
import { api } from '../../../services/api';

interface InlineAddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactCreated: (newContact: Contact) => void;
  defaultType?: ContactType;
}

export const InlineAddContactModal: React.FC<InlineAddContactModalProps> = ({
  isOpen,
  onClose,
  onContactCreated,
  defaultType = 'supplier'
}) => {
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState<ContactType>(defaultType);
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter Contact Name.');
      return;
    }

    const addr: AddressInfo = {
      address: address.trim(),
      postCode: '',
      city: city.trim(),
      province: 'Punjab',
      country: 'Pakistan'
    };

    const newContact: Contact = {
      id: `cnt_${Date.now()}`,
      name: name.trim(),
      businessName: businessName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      status: 'active',
      type,
      primaryAddress: addr,
      billingAddress: addr,
      shippingAddress: addr,
      hasOpeningBalance: false,
      payables: 0,
      receivables: 0,
      createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    // Save to localStorage & MySQL
    try {
      const saved = localStorage.getItem('adwiselabs_contacts') || localStorage.getItem('adwiselabs_tenant_contacts');
      const list: Contact[] = saved ? JSON.parse(saved) : [];
      const updated = [newContact, ...list];
      localStorage.setItem('adwiselabs_contacts', JSON.stringify(updated));
      localStorage.setItem('adwiselabs_tenant_contacts', JSON.stringify(updated));
      api.createContact(newContact).catch(() => {});
    } catch (e) {}

    onContactCreated(newContact);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 text-xs text-slate-700">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#001e3d] to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm">Add New Contact / Supplier</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white transition p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Contact Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Tariq Mehmood / Ahmed"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-[#0070ba] text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Business / Company Name
            </label>
            <input
              type="text"
              placeholder="e.g. Al-Madina Traders"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-[#0070ba] text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Phone
              </label>
              <input
                type="text"
                placeholder="+92 300 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-[#0070ba] text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Contact Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ContactType)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-[#0070ba] text-xs bg-white"
              >
                <option value="supplier">Supplier</option>
                <option value="both">Both (Supplier & Customer)</option>
                <option value="customer">Customer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="supplier@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-[#0070ba] text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                City
              </label>
              <input
                type="text"
                placeholder="e.g. Lahore / Karachi"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-[#0070ba] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Address
            </label>
            <input
              type="text"
              placeholder="Shop # / Street / Commercial area"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-[#0070ba] text-xs"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded font-medium text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#001e3d] hover:bg-slate-900 text-white rounded font-bold text-xs transition shadow-xs cursor-pointer"
            >
              Save Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
