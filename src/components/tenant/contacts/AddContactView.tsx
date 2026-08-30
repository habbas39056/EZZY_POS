import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Contact, AddressInfo } from '../../../types/contact';

interface AddContactViewProps {
  onSave: (contact: Omit<Contact, 'id' | 'createdOn' | 'payables' | 'receivables'>) => void;
  onCancel: () => void;
}

const PROVINCES = [
  'Select Province',
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Gilgit-Baltistan',
  'Azad Jammu and Kashmir',
  'Other'
];

const EMPLOYEES = [
  'Select Employee',
  'Muhammad Usman (Sales)',
  'Ahmed Khan (Recovery)',
  'Zainab Bibi (Accounts)',
  'Hamza Tariq (Manager)',
  'Self (Owner)'
];

export const AddContactView: React.FC<AddContactViewProps> = ({ onSave, onCancel }) => {
  // Personal Information
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [contactType, setContactType] = useState<'customer' | 'supplier' | 'both'>('customer');

  // Primary Address
  const [primaryAddress, setPrimaryAddress] = useState<AddressInfo>({
    address: '',
    postCode: '',
    city: '',
    province: '',
    country: ''
  });

  // Billing Address
  const [sameAsAboveBilling, setSameAsAboveBilling] = useState(false);
  const [billingAddress, setBillingAddress] = useState<AddressInfo>({
    address: '',
    address2: '',
    postCode: '',
    city: '',
    province: '',
    country: ''
  });

  // Shipping Address
  const [shippingAddress, setShippingAddress] = useState<AddressInfo>({
    address: '',
    address2: '',
    postCode: '',
    city: '',
    province: '',
    country: ''
  });

  // Opening Balance
  const [hasOpeningBalance, setHasOpeningBalance] = useState(false);
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [openingBalanceType, setOpeningBalanceType] = useState<'debit' | 'credit'>('debit');

  // General Information
  const [assignedRecoveryPerson, setAssignedRecoveryPerson] = useState('');
  const [assignedSalePerson, setAssignedSalePerson] = useState('');
  const [website, setWebsite] = useState('');
  const [ntn, setNtn] = useState('');
  const [strn, setStrn] = useState('');
  const [fbrRegistrationNo, setFbrRegistrationNo] = useState('');
  const [code, setCode] = useState('');
  const [contactPersonName, setContactPersonName] = useState('');
  const [contactPersonPhone, setContactPersonPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [notes, setNotes] = useState('');

  // Handle "Same as Above" checkbox for Billing Address
  const handleSameAsAboveBilling = (checked: boolean) => {
    setSameAsAboveBilling(checked);
    if (checked) {
      setBillingAddress({
        address: primaryAddress.address,
        address2: '',
        postCode: primaryAddress.postCode,
        city: primaryAddress.city,
        province: primaryAddress.province,
        country: primaryAddress.country
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter Contact Name.');
      return;
    }

    onSave({
      name,
      businessName,
      email,
      phone,
      status: isActive ? 'active' : 'inactive',
      type: contactType,
      primaryAddress,
      billingAddress,
      shippingAddress,
      hasOpeningBalance,
      openingBalance: hasOpeningBalance ? Number(openingBalance) : 0,
      openingBalanceType,
      assignedRecoveryPerson,
      assignedSalePerson,
      website,
      ntn,
      strn,
      fbrRegistrationNo,
      code,
      contactPersonName,
      contactPersonPhone,
      nationalId,
      notes,
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 max-w-6xl mx-auto my-3 text-xs text-slate-700">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <h2 className="text-base font-bold text-slate-800">Add Contact</h2>
        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Contacts
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ========================================= */}
        {/* 1. PERSONAL INFORMATION                   */}
        {/* ========================================= */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 mb-3">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5 items-center">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs"
              />
            </div>
            <div className="pt-5 flex items-center">
              <label className="flex items-center space-x-2 cursor-pointer select-none font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#0070ba] focus:ring-0"
                />
                <span>Active</span>
              </label>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Contact Type *</label>
              <select
                value={contactType}
                onChange={(e) => setContactType(e.target.value as 'customer' | 'supplier' | 'both')}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
              >
                <option value="customer">Customer</option>
                <option value="supplier">Supplier</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* 2. ADDRESS                                */}
        {/* ========================================= */}
        <div className="pt-2 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 mb-3">Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Address</label>
              <input
                type="text"
                value={primaryAddress.address}
                onChange={(e) => setPrimaryAddress({ ...primaryAddress, address: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Post Code</label>
              <input
                type="text"
                value={primaryAddress.postCode}
                onChange={(e) => setPrimaryAddress({ ...primaryAddress, postCode: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">City</label>
              <input
                type="text"
                value={primaryAddress.city}
                onChange={(e) => setPrimaryAddress({ ...primaryAddress, city: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Province</label>
              <select
                value={primaryAddress.province}
                onChange={(e) => setPrimaryAddress({ ...primaryAddress, province: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white"
              >
                {PROVINCES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Country</label>
              <input
                type="text"
                value={primaryAddress.country}
                onChange={(e) => setPrimaryAddress({ ...primaryAddress, country: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs"
              />
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* 3. DUAL COLUMN: BILLING & SHIPPING        */}
        {/* ========================================= */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Billing Address */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800">Billing Address</h3>
              <label className="flex items-center space-x-1.5 text-xs text-slate-600 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={sameAsAboveBilling}
                  onChange={(e) => handleSameAsAboveBilling(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-[#0070ba]"
                />
                <span>Same as Above</span>
              </label>
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Address</label>
              <input
                type="text"
                value={billingAddress.address}
                onChange={(e) => setBillingAddress({ ...billingAddress, address: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Address2</label>
              <input
                type="text"
                value={billingAddress.address2 || ''}
                onChange={(e) => setBillingAddress({ ...billingAddress, address2: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Post Code</label>
                <input
                  type="text"
                  value={billingAddress.postCode}
                  onChange={(e) => setBillingAddress({ ...billingAddress, postCode: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">City</label>
                <input
                  type="text"
                  value={billingAddress.city}
                  onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Province</label>
                <select
                  value={billingAddress.province}
                  onChange={(e) => setBillingAddress({ ...billingAddress, province: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] bg-white"
                >
                  {PROVINCES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Country</label>
                <input
                  type="text"
                  value={billingAddress.country}
                  onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
                />
              </div>
            </div>
          </div>

          {/* Right: Shipping Address */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800">Shipping Address</h3>
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Address</label>
              <input
                type="text"
                value={shippingAddress.address}
                onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Address2</label>
              <input
                type="text"
                value={shippingAddress.address2 || ''}
                onChange={(e) => setShippingAddress({ ...shippingAddress, address2: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Post Code</label>
                <input
                  type="text"
                  value={shippingAddress.postCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, postCode: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">City</label>
                <input
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Province</label>
                <select
                  value={shippingAddress.province}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, province: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] bg-white"
                >
                  {PROVINCES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Country</label>
                <input
                  type="text"
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* 4. OPENING BALANCE TOGGLE                 */}
        {/* ========================================= */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setHasOpeningBalance(!hasOpeningBalance)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition ${
                hasOpeningBalance ? 'bg-[#0070ba]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                  hasOpeningBalance ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="font-semibold text-slate-800 text-xs">Opening Balance</span>
          </div>

          {hasOpeningBalance && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Opening Balance Amount</label>
                <input
                  type="number"
                  min="0"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-[#0070ba]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Balance Type</label>
                <select
                  value={openingBalanceType}
                  onChange={(e) => setOpeningBalanceType(e.target.value as 'debit' | 'credit')}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-[#0070ba]"
                >
                  <option value="debit">Debit (Receivable from customer)</option>
                  <option value="credit">Credit (Payable to supplier)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ========================================= */}
        {/* 5. GENERAL INFORMATION                    */}
        {/* ========================================= */}
        <div className="pt-3 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 mb-3">General Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 mb-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Assigned Recovery Person</label>
              <select
                value={assignedRecoveryPerson}
                onChange={(e) => setAssignedRecoveryPerson(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] bg-white text-xs"
              >
                {EMPLOYEES.map(emp => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Assigned Sale Person</label>
              <select
                value={assignedSalePerson}
                onChange={(e) => setAssignedSalePerson(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] bg-white text-xs"
              >
                {EMPLOYEES.map(emp => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Website</label>
              <input
                type="text"
                placeholder="https://..."
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">NTN</label>
              <input
                type="text"
                value={ntn}
                onChange={(e) => setNtn(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 mb-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">STN</label>
              <input
                type="text"
                value={strn}
                onChange={(e) => setStrn(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">FBR Registration No</label>
              <input
                type="text"
                value={fbrRegistrationNo}
                onChange={(e) => setFbrRegistrationNo(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Contact Name</label>
              <input
                type="text"
                value={contactPersonName}
                onChange={(e) => setContactPersonName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 mb-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Contact Phone</label>
              <input
                type="text"
                value={contactPersonPhone}
                onChange={(e) => setContactPersonPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">ID (CNIC / Passport)</label>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
            />
          </div>
        </div>

        {/* Bottom Actions matching Screenshot 2 */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="submit"
            className="px-6 py-2 bg-[#0070ba] hover:bg-sky-700 text-white font-bold rounded shadow-sm text-xs transition"
          >
            Add
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs transition"
          >
            Close
          </button>
        </div>
      </form>
    </div>
  );
};
