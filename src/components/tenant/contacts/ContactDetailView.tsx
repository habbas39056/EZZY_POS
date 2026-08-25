import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  HelpCircle, 
  Search, 
  ChevronRight, 
  FileText,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Info
} from 'lucide-react';
import type { Contact, AddressInfo } from '../../../types/contact';
import { DatePicker } from '../../common/DatePicker';

interface ContactDetailViewProps {
  contact: Contact;
  onBack: () => void;
  onUpdate: (updatedContact: Contact) => void;
  onMakePayment?: (contact: Contact) => void;
  onReceivePayment?: (contact: Contact) => void;
  currencyCode?: string;
  currencySymbol?: string;
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

export const ContactDetailView: React.FC<ContactDetailViewProps> = ({
  contact,
  onBack,
  onUpdate,
  onMakePayment,
  onReceivePayment,
  currencyCode = 'PKR',
  currencySymbol = 'Rs'
}) => {
  const [activeTab, setActiveTab] = useState<
    'details' | 'payment_received' | 'payment_made' | 'purchase_orders' | 'bills' | 'invoices' | 'statement' | 'price_list'
  >('details');

  // ----------------------------------------------------
  // TAB 1: DETAILS FORM STATE
  // ----------------------------------------------------
  const [name, setName] = useState(contact.name || '');
  const [businessName, setBusinessName] = useState(contact.businessName || '');
  const [phone, setPhone] = useState(contact.phone || '');
  const [email, setEmail] = useState(contact.email || '');
  const [isActive, setIsActive] = useState(contact.status === 'active');

  // Address
  const [locationSearch, setLocationSearch] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [lat, setLat] = useState(contact.lat || '');
  const [lon, setLon] = useState(contact.lon || '');
  const [primaryAddress, setPrimaryAddress] = useState<AddressInfo>({
    address: contact.primaryAddress?.address || '',
    postCode: contact.primaryAddress?.postCode || '',
    city: contact.primaryAddress?.city || '',
    province: contact.primaryAddress?.province || 'Select Province',
    country: contact.primaryAddress?.country || ''
  });

  // Shipping Address
  const [sameAsAddressShipping, setSameAsAddressShipping] = useState(contact.sameAsAddressShipping ?? true);
  const [shippingLocationSearch, setShippingLocationSearch] = useState('');
  const [shippingAddress, setShippingAddress] = useState<AddressInfo>({
    address: contact.shippingAddress?.address || '',
    address2: contact.shippingAddress?.address2 || '',
    postCode: contact.shippingAddress?.postCode || '',
    city: contact.shippingAddress?.city || '',
    province: contact.shippingAddress?.province || 'Select Province',
    country: contact.shippingAddress?.country || ''
  });

  // Billing Address
  const [billingLocationSearch, setBillingLocationSearch] = useState('');
  const [billingAddress, setBillingAddress] = useState<AddressInfo>({
    address: contact.billingAddress?.address || '',
    address2: contact.billingAddress?.address2 || '',
    postCode: contact.billingAddress?.postCode || '',
    city: contact.billingAddress?.city || '',
    province: contact.billingAddress?.province || 'Select Province',
    country: contact.billingAddress?.country || ''
  });

  // General Information
  const [assignedRecoveryPerson, setAssignedRecoveryPerson] = useState(contact.assignedRecoveryPerson || 'Select Employee');
  const [assignedSalePerson, setAssignedSalePerson] = useState(contact.assignedSalePerson || 'Select Employee');
  const [amount, setAmount] = useState<string>(contact.amount ? String(contact.amount) : '');
  const [ntn, setNtn] = useState(contact.ntn || '');
  const [strn, setStrn] = useState(contact.strn || '');
  const [fbrRegistrationNo, setFbrRegistrationNo] = useState(contact.fbrRegistrationNo || '');
  const [fbrRegistrationStatus, setFbrRegistrationStatus] = useState(contact.fbrRegistrationStatus || 'unregistered');
  const [code, setCode] = useState(contact.code || '');
  const [contactPersonName, setContactPersonName] = useState(contact.contactPersonName || '');
  const [contactPersonPhone, setContactPersonPhone] = useState(contact.contactPersonPhone || '');
  const [nationalId, setNationalId] = useState(contact.nationalId || '');
  const [notes, setNotes] = useState(contact.notes || '');

  const [savedSuccess, setSavedSuccess] = useState(false);

  // ----------------------------------------------------
  // TAB SEARCH & FILTER STATES
  // ----------------------------------------------------
  const [payRecStartDate, setPayRecStartDate] = useState('');
  const [payRecEndDate, setPayRecEndDate] = useState('');
  const [payRecStatus, setPayRecStatus] = useState('Select');

  const [payMadeStartDate, setPayMadeStartDate] = useState('');
  const [payMadeEndDate, setPayMadeEndDate] = useState('');
  const [payMadeStatus, setPayMadeStatus] = useState('Select');

  const [poStartDate, setPoStartDate] = useState('');
  const [poEndDate, setPoEndDate] = useState('');
  const [poStatus, setPoStatus] = useState('Select');

  const [billSearchQuery, setBillSearchQuery] = useState('');
  const [billStartDate, setBillStartDate] = useState('');
  const [billEndDate, setBillEndDate] = useState('');
  const [billStatus, setBillStatus] = useState('Select');

  const [invSearchQuery, setInvSearchQuery] = useState('');
  const [invStartDate, setInvStartDate] = useState('');
  const [invEndDate, setInvEndDate] = useState('');
  const [invStatus, setInvStatus] = useState('Select');

  // Handle Save / Update
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Contact Name is required');
      return;
    }

    const updated: Contact = {
      ...contact,
      name,
      businessName,
      phone,
      email,
      status: isActive ? 'active' : 'inactive',
      lat,
      lon,
      primaryAddress,
      shippingAddress: sameAsAddressShipping ? { ...primaryAddress, address2: '' } : shippingAddress,
      billingAddress,
      sameAsAddressShipping,
      assignedRecoveryPerson,
      assignedSalePerson,
      amount: amount ? Number(amount) : undefined,
      ntn,
      strn,
      fbrRegistrationNo,
      fbrRegistrationStatus,
      code,
      contactPersonName,
      contactPersonPhone,
      nationalId,
      notes
    };

    onUpdate(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Sample Purchase Orders matching screenshot 4
  const purchaseOrders = [
    {
      id: 'po_0001',
      poNo: '0001',
      poDate: '21 Apr 2025',
      dueDate: '-',
      lastReceiving: '21 Apr 2025',
      total: '-',
      balance: 100000.0,
      status: 'Draft'
    },
    {
      id: 'po_0002',
      poNo: '0002',
      poDate: '05 Feb 2025',
      dueDate: '-',
      lastReceiving: '05 Feb 2025',
      total: '-',
      balance: 20000.0,
      status: 'Closed'
    },
    {
      id: 'po_0003',
      poNo: '0003',
      poDate: '23 Jul 2025',
      dueDate: '-',
      lastReceiving: '23 Jul 2025',
      total: '-',
      balance: 30000.0,
      status: 'Closed'
    },
    {
      id: 'po_0004',
      poNo: '0004',
      poDate: '15 Jul 2025',
      dueDate: '20 Jul 2025',
      lastReceiving: '15 Jul 2025',
      total: '-',
      balance: 1000000.0,
      status: 'Closed'
    }
  ];

  // Sample Bills matching screenshot 5
  const bills = [
    {
      id: 'bill_0004',
      billNo: '0004',
      refInvNo: '0004',
      billDate: '15 Aug 2025',
      dueDate: '-',
      total: 2000000.0,
      balance: 0.0,
      remaining: 2000000.0,
      status: 'Unpaid'
    }
  ];

  // Sample Invoices
  const invoices = [
    {
      id: 'inv_001',
      invNo: 'INV-2025-001',
      refNo: 'REF-8841',
      invDate: '10 Aug 2025',
      dueDate: '25 Aug 2025',
      total: 500000.0,
      paid: 500000.0,
      balance: 0.0,
      status: 'Paid'
    }
  ];

  // Sample Payments
  const paymentsReceived: any[] = [];
  const paymentsMade: any[] = [];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f4f6f9] text-slate-800 font-sans text-xs pb-12">
      {/* 1. TOP BREADCRUMB STRIP (matching Screenshot 1) */}
      <div className="bg-[#e9ecef] border-b border-slate-300 px-4 py-1.5 flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3 py-0.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded shadow-2xs transition flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Contacts</span>
        </button>

        <button className="text-slate-500 hover:text-slate-800 transition" title="Help & Information">
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-[1550px] mx-auto px-4 pt-3 space-y-3">
        {/* 2. TITLE BAR WITH NAME & TOTALS (matching Screenshot 1) */}
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
          <h1 className="text-base font-bold text-[#002f5c] tracking-tight">
            {contact.name || 'Contact Details'}
          </h1>

          <div className="text-xs font-bold font-mono text-[#002f5c] flex items-center gap-4">
            <span>
              Payables : <span className="text-slate-900">{contact.payables?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
            </span>
            <span>
              Receivables : <span className="text-slate-900">{contact.receivables?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
            </span>
          </div>
        </div>

        {/* 3. TABS NAVIGATION BAR (matching Screenshot 1-5) */}
        <div className="bg-white border-b border-slate-200 px-2 flex items-center space-x-1 overflow-x-auto shadow-2xs">
          {[
            { id: 'details', label: 'Details' },
            { id: 'payment_received', label: 'Payment Received' },
            { id: 'payment_made', label: 'Payment Made' },
            { id: 'purchase_orders', label: 'Purchase Orders' },
            { id: 'bills', label: 'Bills' },
            { id: 'invoices', label: 'Invoices' },
            { id: 'statement', label: 'Statement' },
            { id: 'price_list', label: 'Price List' }
          ].map((tab) => {
            const isActiveTab = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition border-b-2 cursor-pointer ${
                  isActiveTab
                    ? 'border-[#0070ba] text-[#0070ba] font-bold bg-sky-50/30'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ======================================================= */}
        {/* TAB 1: DETAILS (UPDATE CONTACT)                         */}
        {/* ======================================================= */}
        {activeTab === 'details' && (
          <form onSubmit={handleUpdate} className="bg-white border border-slate-200 rounded p-6 space-y-6 shadow-2xs">
            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">Contact information updated successfully!</span>
              </div>
            )}

            <h2 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">
              Update Contact
            </h2>

            {/* A. Personal Information */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#0070ba] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#0070ba] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#0070ba] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#0070ba] bg-white"
                  />
                </div>

                <div className="flex items-center pb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-[#0070ba] border-slate-300 rounded focus:ring-0"
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>
            </div>

            {/* B. Address */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-slate-800">Address</h3>
              
              {/* Location search bar */}
              <div className="space-y-2">
                <span className="text-slate-600 text-[11px] block">Location</span>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 max-w-sm flex items-center">
                    <input
                      type="text"
                      placeholder="Search location..."
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded-l text-xs focus:outline-none focus:border-[#0070ba]"
                    />
                    <button
                      type="button"
                      className="px-3 py-1 bg-[#1a365d] hover:bg-slate-800 text-white rounded-r text-xs font-semibold"
                    >
                      Go
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs text-slate-700 font-medium"
                  >
                    show map
                  </button>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="lat"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="w-20 px-2 py-1 border border-slate-300 rounded text-xs"
                    />
                    <input
                      type="text"
                      placeholder="lon"
                      value={lon}
                      onChange={(e) => setLon(e.target.value)}
                      className="w-20 px-2 py-1 border border-slate-300 rounded text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Address Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1">
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Address</label>
                  <input
                    type="text"
                    value={primaryAddress.address}
                    onChange={(e) => setPrimaryAddress({ ...primaryAddress, address: e.target.value })}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#0070ba]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Post Code</label>
                  <input
                    type="text"
                    value={primaryAddress.postCode}
                    onChange={(e) => setPrimaryAddress({ ...primaryAddress, postCode: e.target.value })}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#0070ba]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">City</label>
                  <input
                    type="text"
                    value={primaryAddress.city}
                    onChange={(e) => setPrimaryAddress({ ...primaryAddress, city: e.target.value })}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#0070ba]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Province</label>
                  <select
                    value={primaryAddress.province}
                    onChange={(e) => setPrimaryAddress({ ...primaryAddress, province: e.target.value })}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#0070ba] bg-white"
                  >
                    {PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Country</label>
                  <input
                    type="text"
                    value={primaryAddress.country}
                    onChange={(e) => setPrimaryAddress({ ...primaryAddress, country: e.target.value })}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
              </div>
            </div>

            {/* C. Shipping Address & Billing Address 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              {/* Shipping Address */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800">Shipping Address</h3>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 text-[11px]">
                    <input
                      type="checkbox"
                      checked={sameAsAddressShipping}
                      onChange={(e) => setSameAsAddressShipping(e.target.checked)}
                      className="w-3.5 h-3.5 text-[#0070ba] border-slate-300 rounded"
                    />
                    <span>Same as address</span>
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search location..."
                    value={shippingLocationSearch}
                    onChange={(e) => setShippingLocationSearch(e.target.value)}
                    disabled={sameAsAddressShipping}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded-l text-xs disabled:bg-slate-50"
                  />
                  <button
                    type="button"
                    disabled={sameAsAddressShipping}
                    className="px-3 py-1 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded-r text-xs font-semibold disabled:opacity-50"
                  >
                    Go
                  </button>
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Address</label>
                  <input
                    type="text"
                    value={sameAsAddressShipping ? primaryAddress.address : shippingAddress.address}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                    disabled={sameAsAddressShipping}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Address 2</label>
                  <input
                    type="text"
                    value={sameAsAddressShipping ? '' : shippingAddress.address2}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address2: e.target.value })}
                    disabled={sameAsAddressShipping}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs disabled:bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">Post Code</label>
                    <input
                      type="text"
                      value={sameAsAddressShipping ? primaryAddress.postCode : shippingAddress.postCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postCode: e.target.value })}
                      disabled={sameAsAddressShipping}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs disabled:bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">City</label>
                    <input
                      type="text"
                      value={sameAsAddressShipping ? primaryAddress.city : shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      disabled={sameAsAddressShipping}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs disabled:bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">Province</label>
                    <select
                      value={sameAsAddressShipping ? primaryAddress.province : shippingAddress.province}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, province: e.target.value })}
                      disabled={sameAsAddressShipping}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs bg-white disabled:bg-slate-50"
                    >
                      {PROVINCES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">Country</label>
                    <input
                      type="text"
                      value={sameAsAddressShipping ? primaryAddress.country : shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      disabled={sameAsAddressShipping}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs disabled:bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800">Billing Address</h3>

                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search location..."
                    value={billingLocationSearch}
                    onChange={(e) => setBillingLocationSearch(e.target.value)}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded-l text-xs"
                  />
                  <button
                    type="button"
                    className="px-3 py-1 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded-r text-xs font-semibold"
                  >
                    Go
                  </button>
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Address</label>
                  <input
                    type="text"
                    value={billingAddress.address}
                    onChange={(e) => setBillingAddress({ ...billingAddress, address: e.target.value })}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Address 2</label>
                  <input
                    type="text"
                    value={billingAddress.address2}
                    onChange={(e) => setBillingAddress({ ...billingAddress, address2: e.target.value })}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">Post Code</label>
                    <input
                      type="text"
                      value={billingAddress.postCode}
                      onChange={(e) => setBillingAddress({ ...billingAddress, postCode: e.target.value })}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">City</label>
                    <input
                      type="text"
                      value={billingAddress.city}
                      onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">Province</label>
                    <select
                      value={billingAddress.province}
                      onChange={(e) => setBillingAddress({ ...billingAddress, province: e.target.value })}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs bg-white"
                    >
                      {PROVINCES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">Country</label>
                    <input
                      type="text"
                      value={billingAddress.country}
                      onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* D. General Information (matching Screenshot 1) */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-slate-800">General Information</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-11 gap-2.5">
                {/* Assigned Recovery Person */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-600 text-[10.5px] mb-1">Assigned Recovery Person</label>
                  <select
                    value={assignedRecoveryPerson}
                    onChange={(e) => setAssignedRecoveryPerson(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-[11px] bg-white"
                  >
                    {EMPLOYEES.map(emp => (
                      <option key={emp} value={emp}>{emp}</option>
                    ))}
                  </select>
                </div>

                {/* Assigned Sale Person */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-600 text-[10.5px] mb-1">Assigned Sale Person</label>
                  <select
                    value={assignedSalePerson}
                    onChange={(e) => setAssignedSalePerson(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-[11px] bg-white"
                  >
                    {EMPLOYEES.map(emp => (
                      <option key={emp} value={emp}>{emp}</option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-slate-600 text-[10.5px] mb-1">Amount</label>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-[11px]"
                  />
                </div>

                {/* NTN */}
                <div>
                  <label className="block text-slate-600 text-[10.5px] mb-1">NTN</label>
                  <input
                    type="text"
                    value={ntn}
                    onChange={(e) => setNtn(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-[11px]"
                  />
                </div>

                {/* STRN */}
                <div>
                  <label className="block text-slate-600 text-[10.5px] mb-1">STRN</label>
                  <input
                    type="text"
                    value={strn}
                    onChange={(e) => setStrn(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-[11px]"
                  />
                </div>

                {/* FBR Registration No */}
                <div>
                  <label className="block text-slate-600 text-[10.5px] mb-1">FBR Registration No</label>
                  <input
                    type="text"
                    value={fbrRegistrationNo}
                    onChange={(e) => setFbrRegistrationNo(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-[11px]"
                  />
                </div>

                {/* FBR Registration Status */}
                <div>
                  <label className="block text-slate-600 text-[10.5px] mb-1">FBR Registration Status</label>
                  <input
                    type="text"
                    value={fbrRegistrationStatus}
                    onChange={(e) => setFbrRegistrationStatus(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-[11px] bg-slate-50"
                  />
                </div>

                {/* Code */}
                <div>
                  <label className="block text-slate-600 text-[10.5px] mb-1">Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-[11px]"
                  />
                </div>

                {/* Contact Name */}
                <div>
                  <label className="block text-slate-600 text-[10.5px] mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={contactPersonName}
                    onChange={(e) => setContactPersonName(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-[11px]"
                  />
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-slate-600 text-[10.5px] mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={contactPersonPhone}
                    onChange={(e) => setContactPersonPhone(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-[11px]"
                  />
                </div>

                {/* ID */}
                <div>
                  <label className="block text-slate-600 text-[10.5px] mb-1">ID</label>
                  <input
                    type="text"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* E. Notes */}
            <div className="space-y-1 pt-1">
              <label className="block text-slate-600 text-[11px]">Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal contact notes..."
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#0070ba]"
              />
            </div>

            {/* F. Update Button (Navy Blue at Bottom Right) */}
            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-[#002f5c] hover:bg-[#001f3f] text-white font-bold text-xs rounded shadow-xs transition cursor-pointer"
              >
                Update
              </button>
            </div>
          </form>
        )}

        {/* ======================================================= */}
        {/* TAB 2: PAYMENT RECEIVED                                 */}
        {/* ======================================================= */}
        {activeTab === 'payment_received' && (
          <div className="space-y-3">
            {/* Search Filter Card */}
            <div className="bg-white border border-slate-200 rounded p-4 space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-800">Search</h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Start Date</label>
                  <DatePicker value={payRecStartDate} onChange={setPayRecStartDate} />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">End Date</label>
                  <DatePicker value={payRecEndDate} onChange={setPayRecEndDate} />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Status</label>
                  <select
                    value={payRecStatus}
                    onChange={(e) => setPayRecStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option value="Select">Select</option>
                    <option value="Cleared">Cleared</option>
                    <option value="Pending">Pending</option>
                    <option value="Bounced">Bounced</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-1.5 bg-[#002f5c] hover:bg-[#001f3f] text-white font-bold rounded text-xs">
                    Search
                  </button>
                  <button className="px-3.5 py-1.5 bg-[#2e7d32] hover:bg-emerald-800 text-white font-bold rounded text-xs flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Export
                  </button>
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-2xs">
              <div className="p-3 border-b border-slate-200 font-bold text-xs text-slate-800">
                Payments
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                    <tr>
                      <th className="px-4 py-2.5">Reference No</th>
                      <th className="px-4 py-2.5">Payment Date</th>
                      <th className="px-4 py-2.5">Payment Account</th>
                      <th className="px-4 py-2.5 text-right">Payment Amount</th>
                      <th className="px-4 py-2.5 text-right">WHT</th>
                      <th className="px-4 py-2.5 text-right">Balance</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-center">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {paymentsReceived.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                          No payment records found for this period.
                        </td>
                      </tr>
                    ) : (
                      paymentsReceived.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-2 font-mono font-bold text-[#0070ba]">{p.refNo}</td>
                          <td className="px-4 py-2">{p.date}</td>
                          <td className="px-4 py-2">{p.account}</td>
                          <td className="px-4 py-2 text-right font-mono font-bold">{currencySymbol} {p.amount.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right font-mono">{p.wht}</td>
                          <td className="px-4 py-2 text-right font-mono">{currencySymbol} {p.balance.toLocaleString()}</td>
                          <td className="px-4 py-2">{p.status}</td>
                          <td className="px-4 py-2 text-center text-[#0070ba]">View</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer */}
              <div className="px-4 py-2 border-t border-slate-200 flex items-center justify-end gap-3 text-slate-500 text-[11px]">
                <span>Items per page:</span>
                <select className="border border-slate-300 rounded px-1.5 py-0.5 text-[11px] bg-white">
                  <option>50</option>
                  <option>100</option>
                </select>
                <span>1 - 0 of 0</span>
                <div className="flex items-center gap-1 text-slate-400">
                  <button className="px-1.5 py-0.5 border border-slate-200 rounded disabled:opacity-40" disabled>&lt;&lt;</button>
                  <button className="px-1.5 py-0.5 border border-slate-200 rounded disabled:opacity-40" disabled>&lt;</button>
                  <button className="px-1.5 py-0.5 border border-slate-200 rounded disabled:opacity-40" disabled>&gt;</button>
                  <button className="px-1.5 py-0.5 border border-slate-200 rounded disabled:opacity-40" disabled>&gt;&gt;</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 3: PAYMENT MADE                                     */}
        {/* ======================================================= */}
        {activeTab === 'payment_made' && (
          <div className="space-y-3">
            {/* Search Filter Card */}
            <div className="bg-white border border-slate-200 rounded p-4 space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-800">Search</h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Start Date</label>
                  <DatePicker value={payMadeStartDate} onChange={setPayMadeStartDate} />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">End Date</label>
                  <DatePicker value={payMadeEndDate} onChange={setPayMadeEndDate} />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Status</label>
                  <select
                    value={payMadeStatus}
                    onChange={(e) => setPayMadeStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option value="Select">Select</option>
                    <option value="Cleared">Cleared</option>
                    <option value="Pending">Pending</option>
                    <option value="Bounced">Bounced</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-1.5 bg-[#002f5c] hover:bg-[#001f3f] text-white font-bold rounded text-xs">
                    Search
                  </button>
                  <button className="px-3.5 py-1.5 bg-[#2e7d32] hover:bg-emerald-800 text-white font-bold rounded text-xs flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Export
                  </button>
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-2xs">
              <div className="p-3 border-b border-slate-200 font-bold text-xs text-slate-800">
                Payments
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                    <tr>
                      <th className="px-4 py-2.5">Reference No</th>
                      <th className="px-4 py-2.5">Payment Date</th>
                      <th className="px-4 py-2.5 text-right">Payment Amount</th>
                      <th className="px-4 py-2.5">Payment Account</th>
                      <th className="px-4 py-2.5 text-right">WHT</th>
                      <th className="px-4 py-2.5 text-right">Balance</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-center">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {paymentsMade.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                          No payment records found for this supplier.
                        </td>
                      </tr>
                    ) : (
                      paymentsMade.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-2 font-mono font-bold text-[#0070ba]">{p.refNo}</td>
                          <td className="px-4 py-2">{p.date}</td>
                          <td className="px-4 py-2 text-right font-mono font-bold">{currencySymbol} {p.amount.toLocaleString()}</td>
                          <td className="px-4 py-2">{p.account}</td>
                          <td className="px-4 py-2 text-right font-mono">{p.wht}</td>
                          <td className="px-4 py-2 text-right font-mono">{currencySymbol} {p.balance.toLocaleString()}</td>
                          <td className="px-4 py-2">{p.status}</td>
                          <td className="px-4 py-2 text-center text-[#0070ba]">View</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer */}
              <div className="px-4 py-2 border-t border-slate-200 flex items-center justify-end gap-3 text-slate-500 text-[11px]">
                <span>Items per page:</span>
                <select className="border border-slate-300 rounded px-1.5 py-0.5 text-[11px] bg-white">
                  <option>50</option>
                  <option>100</option>
                </select>
                <span>1 - 0 of 0</span>
                <div className="flex items-center gap-1 text-slate-400">
                  <button className="px-1.5 py-0.5 border border-slate-200 rounded disabled:opacity-40" disabled>&lt;&lt;</button>
                  <button className="px-1.5 py-0.5 border border-slate-200 rounded disabled:opacity-40" disabled>&lt;</button>
                  <button className="px-1.5 py-0.5 border border-slate-200 rounded disabled:opacity-40" disabled>&gt;</button>
                  <button className="px-1.5 py-0.5 border border-slate-200 rounded disabled:opacity-40" disabled>&gt;&gt;</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 4: PURCHASE ORDERS (matching Screenshot 4)          */}
        {/* ======================================================= */}
        {activeTab === 'purchase_orders' && (
          <div className="space-y-3">
            {/* Search Filter Card */}
            <div className="bg-white border border-slate-200 rounded p-4 space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-800">Search</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Start Date</label>
                  <DatePicker value={poStartDate} onChange={setPoStartDate} />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">End Date</label>
                  <DatePicker value={poEndDate} onChange={setPoEndDate} />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Status</label>
                  <select
                    value={poStatus}
                    onChange={(e) => setPoStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option value="Select">Select</option>
                    <option value="Draft">Draft</option>
                    <option value="Approved">Approved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <button className="px-4 py-1.5 bg-[#002f5c] hover:bg-[#001f3f] text-white font-bold rounded text-xs">
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-2xs">
              <div className="p-3 border-b border-slate-200 font-bold text-xs text-slate-800">
                Purchase Orders
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                    <tr>
                      <th className="px-4 py-2.5">PO No</th>
                      <th className="px-4 py-2.5">PO Date</th>
                      <th className="px-4 py-2.5">Due Date</th>
                      <th className="px-4 py-2.5">Last Receiving</th>
                      <th className="px-4 py-2.5 text-right">Total</th>
                      <th className="px-4 py-2.5 text-right">Balance</th>
                      <th className="px-4 py-2.5 text-center">Status</th>
                      <th className="px-4 py-2.5 text-center">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {purchaseOrders.map((po) => (
                      <tr key={po.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-mono font-bold text-[#0070ba] hover:underline cursor-pointer">
                          {po.poNo}
                        </td>
                        <td className="px-4 py-2">{po.poDate}</td>
                        <td className="px-4 py-2">{po.dueDate}</td>
                        <td className="px-4 py-2">{po.lastReceiving}</td>
                        <td className="px-4 py-2 text-right font-mono">{po.total}</td>
                        <td className="px-4 py-2 text-right font-mono font-medium text-slate-800">
                          {po.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span
                            className={`inline-block px-3 py-0.5 rounded-full text-[10.5px] font-bold text-white ${
                              po.status === 'Draft' ? 'bg-[#f59e0b]' : 'bg-[#16a34a]'
                            }`}
                          >
                            {po.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button className="text-[#0070ba] hover:text-[#002f5c] transition">
                            <ChevronRight className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer */}
              <div className="px-4 py-2 border-t border-slate-200 flex items-center justify-end gap-3 text-slate-500 text-[11px]">
                <span>Items per page:</span>
                <select className="border border-slate-300 rounded px-1.5 py-0.5 text-[11px] bg-white">
                  <option>50</option>
                  <option>100</option>
                </select>
                <span>1 - 4 of 4</span>
                <div className="flex items-center gap-1 text-slate-400">
                  <button className="px-1.5 py-0.5 border border-slate-200 rounded disabled:opacity-40" disabled>&lt;&lt;</button>
                  <button className="px-1.5 py-0.5 border border-slate-200 rounded disabled:opacity-40" disabled>&lt;</button>
                  <button className="px-1.5 py-0.5 border border-slate-200 rounded disabled:opacity-40" disabled>&gt;</button>
                  <button className="px-1.5 py-0.5 border border-slate-200 rounded disabled:opacity-40" disabled>&gt;&gt;</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 5: BILLS (matching Screenshot 5)                    */}
        {/* ======================================================= */}
        {activeTab === 'bills' && (
          <div className="space-y-3">
            {/* Search Filter Card */}
            <div className="bg-white border border-slate-200 rounded p-4 space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-800">Search</h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Bill No, Ref / Inv</label>
                  <input
                    type="text"
                    value={billSearchQuery}
                    onChange={(e) => setBillSearchQuery(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Start Date</label>
                  <DatePicker value={billStartDate} onChange={setBillStartDate} />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">End Date</label>
                  <DatePicker value={billEndDate} onChange={setBillEndDate} />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Status</label>
                  <select
                    value={billStatus}
                    onChange={(e) => setBillStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option value="Select">Select</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partially Paid">Partially Paid</option>
                  </select>
                </div>
                <div>
                  <button className="px-4 py-1.5 bg-[#002f5c] hover:bg-[#001f3f] text-white font-bold rounded text-xs">
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-2xs">
              <div className="p-3 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <span>Bills</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                    <tr>
                      <th className="px-4 py-2.5">Bill No</th>
                      <th className="px-4 py-2.5">Ref / Inv No</th>
                      <th className="px-4 py-2.5">Bill Date</th>
                      <th className="px-4 py-2.5">Due Date</th>
                      <th className="px-4 py-2.5 text-right">Total</th>
                      <th className="px-4 py-2.5 text-right">Balance</th>
                      <th className="px-4 py-2.5 text-right">Remaining</th>
                      <th className="px-4 py-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {bills.map((bill) => (
                      <React.Fragment key={bill.id}>
                        <tr className="hover:bg-slate-50">
                          <td className="px-4 py-2 text-[#0070ba]">
                            <FileText className="w-4 h-4 inline" />
                          </td>
                          <td className="px-4 py-2 font-mono font-bold text-[#0070ba] hover:underline cursor-pointer">
                            {bill.refInvNo}
                          </td>
                          <td className="px-4 py-2">{bill.billDate}</td>
                          <td className="px-4 py-2">{bill.dueDate}</td>
                          <td className="px-4 py-2 text-right font-mono">
                            {bill.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-2 text-right font-mono">
                            {bill.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-2 text-right font-mono font-bold text-slate-900">
                            {bill.remaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              onClick={() => onMakePayment ? onMakePayment(contact) : alert('Opening Supplier Payment...')}
                              className="px-3 py-1 bg-[#f59e0b] hover:bg-amber-600 text-white font-bold text-[10.5px] rounded-full shadow-2xs transition cursor-pointer"
                            >
                              Make Payment
                            </button>
                          </td>
                        </tr>

                        {/* Highlighted Subtotal Row matching Screenshot 5 */}
                        <tr className="bg-sky-50/60 font-bold border-t border-b border-sky-100">
                          <td colSpan={4} className="px-4 py-1.5 text-right text-slate-700">Subtotal / Summary:</td>
                          <td className="px-4 py-1.5 text-right font-mono text-slate-900">
                            1,000,000.00
                          </td>
                          <td className="px-4 py-1.5 text-right font-mono text-slate-900">
                            0.00
                          </td>
                          <td className="px-4 py-1.5 text-right font-mono text-slate-900">
                            1,000,000.00
                          </td>
                          <td></td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer */}
              <div className="px-4 py-2 border-t border-slate-200 flex items-center justify-end gap-3 text-slate-500 text-[11px]">
                <span>Items per page:</span>
                <select className="border border-slate-300 rounded px-1.5 py-0.5 text-[11px] bg-white">
                  <option>50</option>
                  <option>100</option>
                </select>
                <span>1 - 1 of 1</span>
                <div className="flex items-center gap-1 text-slate-400">
                  <button className="px-1.5 py-0.5 border border-slate-200 rounded disabled:opacity-40" disabled>&lt;&lt;</button>
                  <button className="px-1.5 py-0.5 border border-slate-200 rounded disabled:opacity-40" disabled>&lt;</button>
                  <button className="px-1.5 py-0.5 border border-slate-200 rounded disabled:opacity-40" disabled>&gt;</button>
                  <button className="px-1.5 py-0.5 border border-slate-200 rounded disabled:opacity-40" disabled>&gt;&gt;</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 6: INVOICES                                         */}
        {/* ======================================================= */}
        {activeTab === 'invoices' && (
          <div className="space-y-3">
            {/* Search Filter Card */}
            <div className="bg-white border border-slate-200 rounded p-4 space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-800">Search</h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Invoice No / Ref</label>
                  <input
                    type="text"
                    value={invSearchQuery}
                    onChange={(e) => setInvSearchQuery(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Start Date</label>
                  <DatePicker value={invStartDate} onChange={setInvStartDate} />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">End Date</label>
                  <DatePicker value={invEndDate} onChange={setInvEndDate} />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Status</label>
                  <select
                    value={invStatus}
                    onChange={(e) => setInvStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option value="Select">Select</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <button className="px-4 py-1.5 bg-[#002f5c] hover:bg-[#001f3f] text-white font-bold rounded text-xs">
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-2xs">
              <div className="p-3 border-b border-slate-200 font-bold text-xs text-slate-800">
                Invoices
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                    <tr>
                      <th className="px-4 py-2.5">Invoice #</th>
                      <th className="px-4 py-2.5">Ref #</th>
                      <th className="px-4 py-2.5">Invoice Date</th>
                      <th className="px-4 py-2.5">Due Date</th>
                      <th className="px-4 py-2.5 text-right">Total</th>
                      <th className="px-4 py-2.5 text-right">Paid</th>
                      <th className="px-4 py-2.5 text-right">Balance</th>
                      <th className="px-4 py-2.5 text-center">Status</th>
                      <th className="px-4 py-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-mono font-bold text-[#0070ba] hover:underline cursor-pointer">
                          {inv.invNo}
                        </td>
                        <td className="px-4 py-2 font-mono">{inv.refNo}</td>
                        <td className="px-4 py-2">{inv.invDate}</td>
                        <td className="px-4 py-2">{inv.dueDate}</td>
                        <td className="px-4 py-2 text-right font-mono">
                          {currencySymbol} {inv.total.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right font-mono text-emerald-700">
                          {currencySymbol} {inv.paid.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-bold text-slate-800">
                          {currencySymbol} {inv.balance.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => onReceivePayment ? onReceivePayment(contact) : alert('Opening Customer Payment...')}
                            className="px-3 py-1 bg-[#0070ba] hover:bg-sky-700 text-white font-bold text-[10.5px] rounded transition cursor-pointer"
                          >
                            Receive Payment
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 7: STATEMENT (matching Screenshot 6)                */}
        {/* ======================================================= */}
        {activeTab === 'statement' && (
          <div className="bg-white border border-slate-200 rounded p-4 space-y-4 shadow-2xs">
            {/* Filter controls matching Screenshot */}
            <div className="flex flex-wrap items-end gap-3 pb-2">
              <div className="w-48">
                <label className="block text-slate-600 text-[11px] mb-1">From *</label>
                <DatePicker value={invStartDate} onChange={setInvStartDate} />
              </div>
              <div className="w-48">
                <label className="block text-slate-600 text-[11px] mb-1">To *</label>
                <DatePicker value={invEndDate} onChange={setInvEndDate} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-4 py-1.5 bg-[#002f5c] hover:bg-[#001f3f] text-white font-bold rounded text-xs transition cursor-pointer"
                >
                  Get Report
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded text-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                  <span className="text-[10px]">▼</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="text-center pt-2">
              <h3 className="text-sm font-bold text-[#002f5c]">Contact Statement</h3>
            </div>

            {/* Empty State Box matching Screenshot */}
            <div className="w-full min-h-[380px] bg-[#f8fafc] border border-slate-300 rounded flex items-center justify-center">
              <span className="text-xs font-semibold text-slate-500">No Data Found</span>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 8: PRICE LIST (matching Screenshot 7)               */}
        {/* ======================================================= */}
        {activeTab === 'price_list' && (
          <div className="bg-white border border-slate-200 rounded p-4 space-y-4 shadow-2xs">
            {/* Search Filter Box */}
            <div className="space-y-3 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800">Search</h3>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-5">
                  <label className="block text-slate-600 text-[11px] mb-1">Product *</label>
                  <input
                    type="text"
                    placeholder=""
                    className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-slate-600 text-[11px] mb-1">Start Date *</label>
                  <DatePicker value={payRecStartDate} onChange={setPayRecStartDate} />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-slate-600 text-[11px] mb-1">End Date *</label>
                  <DatePicker value={payRecEndDate} onChange={setPayRecEndDate} />
                </div>
                <div className="sm:col-span-1">
                  <button
                    type="button"
                    className="w-full px-3 py-1.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded text-xs transition cursor-pointer"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Section Heading */}
            <div>
              <h3 className="text-xs font-bold text-slate-800">Price List</h3>
            </div>

            {/* Empty State Box matching Screenshot */}
            <div className="w-full min-h-[380px] bg-[#f8fafc] border border-slate-300 rounded flex items-center justify-center">
              <span className="text-xs font-semibold text-slate-500">No Data Found</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
