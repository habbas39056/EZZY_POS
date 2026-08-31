import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MoreVertical, 
  Info, 
  Trash2, 
  Mail, 
  CreditCard, 
  ArrowDownLeft, 
  ArrowUpRight,
  X,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import type { Contact, ContactType, ContactStatus } from '../../../types/contact';
import { INITIAL_CONTACTS } from '../../../types/contact';
import { AddContactView } from './AddContactView';
import { ContactDetailView } from './ContactDetailView';
import { ContactPaymentView } from './ContactPaymentView';
import { api } from '../../../services/api';
import { parseCSV, downloadContactExcelTemplate } from '../../../utils/csvImport';

interface ContactsViewProps {
  currencyCode?: string;
  currencySymbol?: string;
}

export const ContactsView: React.FC<ContactsViewProps> = ({ 
  currencyCode = 'PKR',
  currencySymbol = 'Rs'
}) => {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('adwiselabs_contacts') || localStorage.getItem('adwiselabs_tenant_contacts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const remote = await api.getContacts();
        if (remote && Array.isArray(remote)) {
          setContacts(remote);
          localStorage.setItem('adwiselabs_contacts', JSON.stringify(remote));
        }
      } catch (e) {}
    };
    fetchContacts();
  }, []);

  const [viewMode, setViewMode] = useState<'list' | 'add' | 'detail' | 'payment'>('list');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [paymentType, setPaymentType] = useState<'make' | 'receive'>('make');

  // Search Filter State (matching Screenshot 1)
  const [searchName, setSearchName] = useState('');
  const [searchStatus, setSearchStatus] = useState<string>('Active');
  const [searchType, setSearchType] = useState<string>('All');

  // Active Manage Dropdown
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length > 0) {
        const newContacts: Contact[] = parsed.map(c => {
          const typeRaw = (c.Type || c.type || 'customer').toLowerCase();
          const type: ContactType = typeRaw === 'supplier' ? 'supplier' : typeRaw === 'both' ? 'both' : 'customer';
          const statusRaw = (c.Status || c.status || 'active').toLowerCase();
          const status: ContactStatus = statusRaw === 'inactive' ? 'inactive' : 'active';
          const opBal = Number(c['Opening Balance'] || c.openingBalance) || 0;
          const opType = ((c['Opening Balance Type'] || c.openingBalanceType || 'debit').toLowerCase() === 'credit' ? 'credit' : 'debit') as 'debit' | 'credit';

          const addr = {
            address: c.Address || c.address || '',
            city: c.City || c.city || '',
            province: c.Province || c.province || '',
            postCode: c['Post Code'] || c.postCode || '',
            country: c.Country || c.country || 'Pakistan'
          };

          return {
            id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            name: c.Name || c.name || c['Contact Name'] || 'Unnamed Contact',
            businessName: c['Business Name'] || c.businessName || c.Company || '',
            type,
            email: c.Email || c.email || '',
            phone: c.Phone || c.phone || c['Phone Number'] || '',
            status,
            payables: Number(c.Payables || c.payables) || 0,
            receivables: Number(c.Receivables || c.receivables) || 0,
            hasOpeningBalance: opBal > 0,
            openingBalance: opBal,
            openingBalanceType: opType,
            primaryAddress: addr,
            billingAddress: addr,
            shippingAddress: addr,
            ntn: c.NTN || c.ntn || '',
            strn: c.STRN || c.strn || '',
            contactPersonName: c['Contact Person Name'] || c.contactPersonName || '',
            contactPersonPhone: c['Contact Person Phone'] || c.contactPersonPhone || '',
            notes: c.Notes || c.notes || '',
            createdOn: new Date().toISOString().split('T')[0]
          };
        });
        
        try {
          const res = await fetch('http://localhost:5000/api/contacts/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newContacts)
          });
          if (res.ok) {
            alert(`Imported ${newContacts.length} contacts successfully!`);
            const combined = [...newContacts, ...contacts] as Contact[];
            saveContacts(combined);
          } else {
            alert('Import failed on server, saved locally.');
            const combined = [...newContacts, ...contacts] as Contact[];
            saveContacts(combined);
          }
        } catch {
          const combined = [...newContacts, ...contacts] as Contact[];
          saveContacts(combined);
        }
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // Modals for actions
  const [emailHistoryModal, setEmailHistoryModal] = useState<Contact | null>(null);

  const saveContacts = (newContacts: Contact[]) => {
    setContacts(newContacts);
    localStorage.setItem('adwiselabs_contacts', JSON.stringify(newContacts));
    localStorage.setItem('adwiselabs_tenant_contacts', JSON.stringify(newContacts));
  };

  const handleUpdateContact = (updatedContact: Contact) => {
    const updated = contacts.map(c => c.id === updatedContact.id ? updatedContact : c);
    saveContacts(updated);
    setSelectedContact(updatedContact);
  };

  const handleRecordPayment = (targetContact: Contact, amount: number, type: 'make' | 'receive', _details?: any) => {
    const updated = contacts.map(c => {
      if (c.id === targetContact.id) {
        if (type === 'receive') {
          return { ...c, receivables: Math.max(0, c.receivables - amount) };
        } else {
          return { ...c, payables: Math.max(0, c.payables - amount) };
        }
      }
      return c;
    });

    saveContacts(updated);
    const updatedTarget = updated.find(c => c.id === targetContact.id) || targetContact;
    setSelectedContact(updatedTarget);
  };

  // Filter logic
  const filteredContacts = contacts.filter(c => {
    const matchesName = 
      !searchName ||
      c.name.toLowerCase().includes(searchName.toLowerCase()) ||
      c.businessName.toLowerCase().includes(searchName.toLowerCase()) ||
      c.phone.includes(searchName) ||
      (c.code && c.code.toLowerCase().includes(searchName.toLowerCase()));

    const matchesStatus = 
      searchStatus === 'All' || 
      (searchStatus === 'Active' && c.status === 'active') ||
      (searchStatus === 'Inactive' && c.status === 'inactive');

    const matchesType = 
      searchType === 'All' || 
      c.type === searchType.toLowerCase() ||
      c.type === 'both';

    return matchesName && matchesStatus && matchesType;
  });

  const handleAddContact = (newContactData: Omit<Contact, 'id' | 'createdOn' | 'payables' | 'receivables'>) => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    const formattedDate = `${day} ${month} ${year}`;

    const newContact: Contact = {
      ...newContactData,
      id: `cnt_${Date.now()}`,
      payables: newContactData.openingBalanceType === 'credit' ? (newContactData.openingBalance || 0) : 0,
      receivables: newContactData.openingBalanceType === 'debit' ? (newContactData.openingBalance || 0) : 0,
      createdOn: formattedDate
    };

    saveContacts([newContact, ...contacts]);
    api.createContact(newContact).catch(() => {});
    setViewMode('list');
  };

  const handleDeleteContact = (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      const updated = contacts.filter(c => c.id !== id);
      saveContacts(updated);
      setActiveMenuId(null);
    }
  };

  if (viewMode === 'payment' && selectedContact) {
    return (
      <ContactPaymentView
        contact={selectedContact}
        type={paymentType}
        onBack={() => {
          setViewMode('list');
        }}
        onSave={(amount, details) => {
          handleRecordPayment(selectedContact, amount, paymentType, details);
        }}
        currencyCode={currencyCode}
        currencySymbol={currencySymbol}
      />
    );
  }

  if (viewMode === 'detail' && selectedContact) {
    return (
      <ContactDetailView
        contact={selectedContact}
        onBack={() => {
          setSelectedContact(null);
          setViewMode('list');
        }}
        onUpdate={handleUpdateContact}
        onMakePayment={(c) => {
          setSelectedContact(c);
          setPaymentType('make');
          setViewMode('payment');
        }}
        onReceivePayment={(c) => {
          setSelectedContact(c);
          setPaymentType('receive');
          setViewMode('payment');
        }}
        currencyCode={currencyCode}
        currencySymbol={currencySymbol}
      />
    );
  }

  if (viewMode === 'add') {
    return (
      <AddContactView
        onSave={handleAddContact}
        onCancel={() => setViewMode('list')}
      />
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto my-2 text-xs text-slate-700 font-sans select-none">
      {/* 1. 🔍 SEARCH FILTER CARD (MATCHING SCREENSHOT 1) */}
      <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3">Search</h3>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Name Input */}
          <div className="sm:col-span-5">
            <label className="block text-slate-500 font-medium mb-1">Name</label>
            <input
              type="text"
              placeholder="Name,Serial No,Bussiness name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Status Dropdown */}
          <div className="sm:col-span-3">
            <label className="block text-slate-500 font-medium mb-1">Status</label>
            <select
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="All">All</option>
            </select>
          </div>

          {/* Type Dropdown */}
          <div className="sm:col-span-2">
            <label className="block text-slate-500 font-medium mb-1">Type</label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              <option value="All">All</option>
              <option value="Customer">Customer</option>
              <option value="Supplier">Supplier</option>
            </select>
          </div>

          {/* Search Button (Dark Blue matching screenshot) */}
          <div className="sm:col-span-2">
            <button
              onClick={() => {}}
              className="w-full py-1.5 bg-[#001f4d] hover:bg-[#002f6c] text-white font-bold rounded text-xs transition shadow-xs"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* 2. 📋 CONTACTS TABLE CARD (MATCHING SCREENSHOT 1) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Card Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Contacts</h2>

          <div className="flex items-center space-x-2">
            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImport} className="hidden" />
            <button
              onClick={downloadContactExcelTemplate}
              title="Download Excel / CSV Template for Contacts Import"
              className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded transition flex items-center gap-1 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Excel Template
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 bg-[#0070ba] hover:bg-sky-700 text-white text-xs font-semibold rounded transition flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" /> Import
            </button>
            <button
              onClick={() => setViewMode('add')}
              className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#0070ba]" /> Contact
            </button>
            <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table Data */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 min-w-[180px]">Contact Name</th>
                <th className="px-4 py-3 min-w-[140px]">Business Name</th>
                <th className="px-4 py-3 min-w-[110px]">Type</th>
                <th className="px-4 py-3 min-w-[160px]">Email</th>
                <th className="px-4 py-3 min-w-[130px]">Phone Number</th>
                <th className="px-4 py-3 text-right min-w-[110px]">Payables</th>
                <th className="px-4 py-3 text-right min-w-[110px]">Receivables</th>
                <th className="px-4 py-3 min-w-[110px]">Created On</th>
                <th className="px-4 py-3 min-w-[90px]">Status</th>
                <th className="px-4 py-3 text-center min-w-[80px]">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <p className="font-semibold text-slate-600">No matching contacts found</p>
                      <p className="text-[10.5px] text-slate-400">Try adjusting your search criteria or add a new contact.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredContacts.map(contact => (
                  <tr key={contact.id} className="hover:bg-slate-50/80 transition relative">
                    {/* Name with Avatar */}
                    <td 
                      onClick={() => {
                        setSelectedContact(contact);
                        setViewMode('detail');
                      }}
                      className="px-4 py-3 font-semibold text-slate-900 cursor-pointer hover:text-[#0070ba] transition"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-sky-100 text-[#0070ba] border border-sky-200 flex items-center justify-center font-extrabold text-xs shrink-0">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate underline decoration-transparent hover:decoration-[#0070ba]">{contact.name}</span>
                      </div>
                    </td>

                    {/* Business Name */}
                    <td className="px-4 py-3 text-slate-600">
                      {contact.businessName ? (
                        <span className="font-medium text-slate-800">{contact.businessName}</span>
                      ) : (
                        <span className="text-slate-300 font-mono">—</span>
                      )}
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3 text-slate-600 capitalize">
                      {contact.type ? (
                        <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                          contact.type === 'customer' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          contact.type === 'supplier' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {contact.type}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-mono">—</span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-slate-600 font-mono text-[10.5px]">
                      {contact.email ? (
                        <span>{contact.email}</span>
                      ) : (
                        <span className="text-slate-300 font-mono">—</span>
                      )}
                    </td>

                    {/* Phone Number */}
                    <td className="px-4 py-3 font-mono text-slate-600 text-[10.5px]">
                      {contact.phone ? (
                        <span>{contact.phone}</span>
                      ) : (
                        <span className="text-slate-300 font-mono">—</span>
                      )}
                    </td>

                    {/* Payables */}
                    <td className="px-4 py-3 text-right font-mono text-slate-700 font-medium">
                      {currencySymbol} {contact.payables.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </td>

                    {/* Receivables */}
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                      {currencySymbol} {contact.receivables.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </td>

                    {/* Created On */}
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-[10.5px]">
                      {contact.createdOn}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        contact.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {contact.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Manage Dropdown Button & Menu */}
                    <td className="px-4 py-3 text-center relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === contact.id ? null : contact.id)}
                        className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition inline-flex items-center justify-center"
                        title="Manage Contact"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === contact.id && (
                        <div className="absolute right-6 top-8 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-left text-xs">
                          {/* Details */}
                          <button
                            onClick={() => {
                              setSelectedContact(contact);
                              setViewMode('detail');
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700 transition"
                          >
                            <Info className="w-3.5 h-3.5 text-slate-500" />
                            <span className="font-medium">Details</span>
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="w-full px-3.5 py-2 flex items-center gap-2 hover:bg-rose-50 text-rose-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span className="font-medium">Delete</span>
                          </button>

                          {/* Email History */}
                          <button
                            onClick={() => {
                              setEmailHistoryModal(contact);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700 transition"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span className="font-medium">Email History</span>
                          </button>

                          {/* Make Payment */}
                          <button
                            onClick={() => {
                              setSelectedContact(contact);
                              setPaymentType('make');
                              setViewMode('payment');
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700 transition"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                            <span className="font-medium">Make Payment</span>
                          </button>

                          {/* Receive Payment */}
                          <button
                            onClick={() => {
                              setSelectedContact(contact);
                              setPaymentType('receive');
                              setViewMode('payment');
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700 transition"
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5 text-slate-500" />
                            <span className="font-medium">Receive Payment</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary Strip */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>Showing <strong>{filteredContacts.length}</strong> of <strong>{contacts.length}</strong> total contacts</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Total Receivables: <strong className="text-emerald-700 font-mono">{currencySymbol} {filteredContacts.reduce((sum, c) => sum + c.receivables, 0).toLocaleString()}</strong></span>
            <span>Total Payables: <strong className="text-slate-800 font-mono">{currencySymbol} {filteredContacts.reduce((sum, c) => sum + c.payables, 0).toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* 3. MODAL POPUPS: EMAIL HISTORY                          */}
      {/* ======================================================= */}

      {/* Email History Modal */}
      {emailHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400" /> Email Activity History
              </h3>
              <button onClick={() => setEmailHistoryModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-slate-600">
                Email communications dispatched to <strong>{emailHistoryModal.name}</strong> ({emailHistoryModal.email || 'No email registered'}):
              </p>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg p-3 bg-slate-50 text-[11px]">
                <div className="py-2 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">Invoice #INV-2026-0042 Dispatch</p>
                    <p className="text-slate-400 text-[10px]">Delivered to {emailHistoryModal.email || 'client email'}</p>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">Sent (Delivered)</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">Monthly Statement of Accounts</p>
                    <p className="text-slate-400 text-[10px]">Automated statement sent</p>
                  </div>
                  <span className="text-[10px] text-slate-500">Delivered</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setEmailHistoryModal(null)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
