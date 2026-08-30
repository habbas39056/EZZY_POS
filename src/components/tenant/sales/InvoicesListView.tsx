import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  Trash2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  CreditCard,
  FileText,
  RotateCcw,
  CheckCircle2,
  Copy,
  Clock,
  Tag,
  AlarmClock,
  Info,
  MoreVertical
} from 'lucide-react';
import type { Invoice } from '../../../types/sales';
import { INITIAL_INVOICES } from '../../../types/sales';
import { Upload } from 'lucide-react';
import { parseCSV } from '../../../utils/csvImport';
import { DatePicker } from '../../common/DatePicker';
import { isDateInRange } from '../../../utils/dateUtils';
import { InvoiceAdjustmentView } from './InvoiceAdjustmentView';
import { InvoiceRemindersView } from './InvoiceRemindersView';
import { NewCreditNoteView } from './NewCreditNoteView';
import { NewRecurringInvoiceView } from './NewRecurringInvoiceView';
import { NewCustomerPaymentView } from './NewCustomerPaymentView';

import { api } from '../../../services/api';

interface InvoicesListViewProps {
  onOpenNewInvoice: () => void;
  onReceivePayment?: (inv: Invoice) => void;
  currencyCode?: string;
  currencySymbol?: string;
}

export const InvoicesListView: React.FC<InvoicesListViewProps> = ({
  onOpenNewInvoice,
  onReceivePayment,
  currencyCode = 'PKR',
  currencySymbol = 'Rs'
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await api.getInvoices();
      if (data) {
        setInvoices(data);
      } else {
        const saved = localStorage.getItem('adwiselabs_invoices');
        if (saved) setInvoices(JSON.parse(saved));
        else setInvoices(INITIAL_INVOICES);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Sub-view states matching Manage dropdown
  const [selectedRecurringInvoice, setSelectedRecurringInvoice] = useState<Invoice | null>(null);
  const [selectedPaymentInvoice, setSelectedPaymentInvoice] = useState<Invoice | null>(null);
  const [selectedCreditNoteInvoice, setSelectedCreditNoteInvoice] = useState<Invoice | null>(null);
  const [selectedAdjustmentInvoice, setSelectedAdjustmentInvoice] = useState<Invoice | null>(null);
  const [selectedReminderInvoice, setSelectedReminderInvoice] = useState<Invoice | null>(null);

  const sanitizeInvoices = (list: Invoice[]): Invoice[] => {
    const seen = new Set<string>();
    const deduplicated: Invoice[] = [];

    for (let idx = 0; idx < list.length; idx++) {
      const inv = list[idx];
      const key = (inv.id && String(inv.id).trim() !== '')
        ? String(inv.id).trim()
        : (inv.invoiceNumber && String(inv.invoiceNumber).trim() !== '')
          ? String(inv.invoiceNumber).trim()
          : `inv_idx_${idx}`;

      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      const safeId = (inv.id && String(inv.id).trim() !== '') ? String(inv.id) : key;
      const bal = typeof inv.balance === 'number' ? inv.balance : (Number(inv.grossTotal) || 0);
      deduplicated.push({
        ...inv,
        id: safeId,
        balance: bal,
        status: (bal === 0 ? 'Completed' : ((inv.status === 'Unapproved' || inv.status === 'Draft') ? 'Unapproved' : 'Receive Payment')) as any
      });
    }

    return deduplicated;
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length > 0) {
        const newInvoices = parsed.map(p => ({
          id: `inv_${Date.now()}_${Math.random()}`,
          invoiceNumber: p['Invoice Number'] || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
          customerName: p.Customer || p['Customer Name'] || 'Unknown Customer',
          invoiceDate: p.Date || p['Invoice Date'] || new Date().toISOString().split('T')[0],
          dueDate: p['Due Date'] || new Date().toISOString().split('T')[0],
          grossTotal: Number(p['Total Amount']) || Number(p.Total) || 0,
          status: p.Status || 'Draft',
          items: []
        }));
        
        try {
          const res = await fetch('http://localhost:5000/api/sales/invoices/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newInvoices)
          });
          if (res.ok) {
            alert(`Imported ${newInvoices.length} invoices successfully!`);
            loadInvoices();
          } else {
            alert('Import failed on server.');
          }
        } catch {
          alert('Import failed.');
        }
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleBatchPayments = async () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one invoice to mark as paid.');
      return;
    }
    if (!confirm(`Are you sure you want to mark ${selectedIds.length} invoices as Paid?`)) return;
    
    try {
      const res = await api.updateInvoiceBatchStatus(selectedIds, 'Completed');
      if (res && res.success) {
        alert(`Successfully paid ${selectedIds.length} invoices!`);
        setSelectedIds([]);
        loadInvoices();
      } else {
        alert('Batch payment failed on server.');
      }
    } catch {
      alert('Batch payment failed.');
    }
  };

  const loadInvoices = async () => {
    try {
      const data = await api.getInvoices();
      if (data) {
        setInvoices(data);
      } else {
        const saved = localStorage.getItem('adwiselabs_invoices');
        if (saved) {
          const parsed = JSON.parse(saved);
          const sanitized = sanitizeInvoices(Array.isArray(parsed) ? parsed : []);
          setInvoices(sanitized);
        } else {
          setInvoices(sanitizeInvoices(INITIAL_INVOICES));
        }
      }
    } catch (e) {
      console.error('Error fetching invoices:', e);
    }
  };

  useEffect(() => {
    loadInvoices();
    const handleGlobalClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleGlobalClick);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  const saveInvoices = async (data: Invoice[]) => {
    // Legacy fallback, but mostly individual items are saved via their own API calls.
    // If we need to bulk save, we iterate or rely on the caller to update via API.
    const sanitized = sanitizeInvoices(data);
    setInvoices(sanitized);
  };

  // Render Sub-Views when triggered from Manage Menu
  if (selectedAdjustmentInvoice) {
    return (
      <InvoiceAdjustmentView
        invoice={selectedAdjustmentInvoice}
        currencyCode={currencyCode}
        currencySymbol={currencySymbol}
        onCancel={() => setSelectedAdjustmentInvoice(null)}
        onSuccess={async (updated) => {
          await api.saveInvoice(updated);
          setInvoices(invoices.map(inv => inv.id === updated.id ? updated : inv));
          setSelectedAdjustmentInvoice(null);
        }}
      />
    );
  }

  if (selectedReminderInvoice) {
    return (
      <InvoiceRemindersView
        invoice={selectedReminderInvoice}
        currencySymbol={currencySymbol}
        onBack={() => setSelectedReminderInvoice(null)}
      />
    );
  }

  if (selectedCreditNoteInvoice) {
    return (
      <NewCreditNoteView
        initialInvoice={selectedCreditNoteInvoice}
        currencyCode={currencyCode}
        currencySymbol={currencySymbol}
        onSaveCreditNote={async (cn) => {
          await api.saveCreditNote(cn);
          setSelectedCreditNoteInvoice(null);
          alert(`Credit Note ${cn.creditNoteNumber} saved successfully!`);
        }}
        onCancel={() => setSelectedCreditNoteInvoice(null)}
      />
    );
  }

  if (selectedRecurringInvoice) {
    return (
      <NewRecurringInvoiceView
        initialInvoice={selectedRecurringInvoice}
        currencyCode={currencyCode}
        currencySymbol={currencySymbol}
        onSaveRecurring={(rec) => {
          const saved = localStorage.getItem('adwiselabs_recurring_invoices');
          const list = saved ? JSON.parse(saved) : [];
          localStorage.setItem('adwiselabs_recurring_invoices', JSON.stringify([rec, ...list]));
          setSelectedRecurringInvoice(null);
          alert(`Recurring Invoice for ${rec.customerName} created successfully!`);
        }}
        onCancel={() => setSelectedRecurringInvoice(null)}
      />
    );
  }

  if (selectedPaymentInvoice) {
    return (
      <NewCustomerPaymentView
        initialInvoice={selectedPaymentInvoice}
        currencyCode={currencyCode}
        currencySymbol={currencySymbol}
        onSavePayment={async (pay) => {
          await api.savePayment(pay);
          await loadInvoices(); // Reload to show updated balance and status
          setSelectedPaymentInvoice(null);
        }}
        onCancel={() => setSelectedPaymentInvoice(null)}
      />
    );
  }

  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredInvoices.map(i => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      await api.deleteInvoice(id);
      setInvoices(invoices.filter(i => i.id !== id));
      setActiveMenuId(null);
    }
  };

  const handleApproveOrder = (inv: Invoice) => {
    const updated = invoices.map(i => i.id === inv.id ? { ...i, status: 'Receive Payment' as const } : i);
    saveInvoices(updated);
    alert(`Invoice ${inv.invoiceNumber} approved! Ready for payment.`);
    setActiveMenuId(null);
  };

  const handleCopyInvoice = (inv: Invoice) => {
    const copy: Invoice = {
      ...inv,
      id: `inv_${Date.now()}`,
      invoiceNumber: `${inv.invoiceNumber}-COPY`,
      status: 'Unapproved',
      createdAt: new Date().toISOString()
    };
    saveInvoices([copy, ...invoices]);
    alert(`Copied Invoice ${inv.invoiceNumber} as ${copy.invoiceNumber}!`);
    setActiveMenuId(null);
  };

  const filteredInvoices = invoices.filter(inv => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(q)) ||
      (inv.customerName && inv.customerName.toLowerCase().includes(q)) ||
      (inv.grossTotal !== undefined && inv.grossTotal.toString().includes(q));

    const matchesStatus = !statusFilter || 
      inv.status === statusFilter ||
      (statusFilter === 'Unapproved' && (inv.status === 'Draft' || inv.status === 'Unapproved')) ||
      (statusFilter === 'Receive Payment' && (inv.status === 'Approved' || inv.status === 'Receive Payment')) ||
      (statusFilter === 'Completed' && (inv.status === 'Completed' || inv.status === 'Paid'));

    const matchesDate = isDateInRange(inv.invoiceDate || inv.createdAt, startDate, endDate);
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-4 font-sans text-xs text-slate-700 select-none">
      {/* ======================================================== */}
      {/* 1. TOP SEARCH CARD (MATCHING SCREENSHOT)                 */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <h3 className="text-xs font-bold text-slate-800 mb-3">Search</h3>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Invoice No, Customer, Invoice Total */}
          <div className="sm:col-span-5">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Invoice No, Customer, Invoice Total
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            />
          </div>

          {/* Start Date */}
          <div className="sm:col-span-2">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Start Date
            </label>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
            />
          </div>

          {/* End Date */}
          <div className="sm:col-span-2">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              End Date
            </label>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
            />
          </div>

          {/* Status */}
          <div className="sm:col-span-2">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              <option value="">Select</option>
              <option value="Unapproved">Unapproved</option>
              <option value="Receive Payment">Receive Payment</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Search Button (Dark Navy) */}
          <div className="sm:col-span-1 flex items-end">
            <button
              type="button"
              onClick={() => {}}
              className="w-full py-1.5 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded text-xs transition shadow-xs"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. INVOICES TABLE CONTAINER (MATCHING SCREENSHOT)        */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Bar with Batch Actions matching Screenshot */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Invoices</h2>

          <div className="flex items-center space-x-2">
            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImport} className="hidden" />
            <button
              type="button"
              onClick={handleBatchPayments}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded transition flex items-center gap-1 shadow-2xs"
            >
              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
              <span>Batch Payments</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded transition flex items-center gap-1 shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Batch Invoices</span>
            </button>

            <button
              onClick={onOpenNewInvoice}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded transition flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#0070ba]" /> Invoice
            </button>

            <button
              type="button"
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metrics Summary Strip */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-end items-center gap-6 text-[11px] font-semibold text-slate-700">
          <div>
            <span className="text-slate-500 font-medium">Invoice Total: </span>
            <span className="font-mono font-bold text-slate-900">
              {filteredInvoices.reduce((sum, inv) => sum + (Number(inv.grossTotal) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">TAX: </span>
            <span className="font-mono font-bold text-slate-900">
              {filteredInvoices.reduce((sum, inv) => sum + (Number(inv.totalTax) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Balance: </span>
            <span className="font-mono font-bold text-[#0070ba]">
              {filteredInvoices.reduce((sum, inv) => sum + (Number(inv.balance) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Full 9-Column Invoices Table */}
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredInvoices.length}
                    onChange={handleToggleSelectAll}
                    className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
                  />
                </th>
                <th className="px-4 py-3 min-w-[120px]">Invoice No.</th>
                <th className="px-4 py-3 min-w-[160px]">Customer</th>
                <th className="px-4 py-3 min-w-[110px]">Invoice Date</th>
                <th className="px-4 py-3 text-right min-w-[120px]">Invoice Total</th>
                <th className="px-4 py-3 text-right min-w-[90px]">TAX</th>
                <th className="px-4 py-3 text-right min-w-[110px]">Balance</th>
                <th className="px-4 py-3 text-center min-w-[100px]">Status</th>
                <th className="px-4 py-3 text-center min-w-[80px]">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    No invoice records found. Click <strong>+ Invoice</strong> to create a new invoice.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition relative">
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(inv.id)}
                        onChange={() => handleToggleSelectOne(inv.id)}
                        className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
                      />
                    </td>

                    {/* Invoice No. (Clickable Blue Text) */}
                    <td className="px-4 py-3 font-semibold text-[#0070ba] font-mono cursor-pointer hover:underline">
                      {inv.invoiceNumber}
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3 font-medium text-slate-900 capitalize">
                      {inv.customerName}
                    </td>

                    {/* Invoice Date */}
                    <td className="px-4 py-3 text-slate-500 font-mono text-[10.5px]">
                      {inv.invoiceDate}
                    </td>

                    {/* Invoice Total */}
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                      {inv.grossTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* TAX */}
                    <td className="px-4 py-3 text-right font-mono text-slate-600">
                      {inv.totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Balance */}
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">
                      {inv.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status Badges matching Screenshot */}
                    <td className="px-4 py-3 text-center">
                      {inv.balance === 0 || inv.status === 'Completed' || inv.status === 'Paid' ? (
                        <span className="inline-block px-3 py-0.5 rounded-full bg-[#2e7d32] text-white font-bold text-[10px] shadow-2xs">
                          Completed
                        </span>
                      ) : inv.status === 'Unapproved' ? (
                        <span className="inline-block px-3 py-0.5 rounded-full bg-[#0288d1] text-white font-bold text-[10px] shadow-2xs">
                          Unapproved
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            if (onReceivePayment) onReceivePayment(inv);
                            else alert(`Receive payment for Invoice ${inv.invoiceNumber}`);
                          }}
                          className="inline-block px-3 py-0.5 rounded-full bg-[#e65100] hover:bg-orange-700 text-white font-bold text-[10px] transition shadow-2xs cursor-pointer"
                        >
                          Receive Payment
                        </button>
                      )}
                    </td>

                    {/* Manage (•••) Dropdown Button matching Screenshot 1 */}
                    <td className="px-4 py-3 text-center relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(prev => (prev === inv.id ? null : inv.id));
                        }}
                        className="font-bold text-sky-700 hover:text-slate-900 px-2 py-0.5 rounded hover:bg-slate-100 transition text-sm tracking-widest cursor-pointer"
                        title="Manage Invoice"
                      >
                        •••
                      </button>

                      {/* Dropdown Popup matching Screenshot 1 */}
                      {activeMenuId && activeMenuId === inv.id && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-4 top-8 w-44 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-left text-xs"
                        >
                          {/* 1. Recurring */}
                          <button
                            onClick={() => {
                              setSelectedRecurringInvoice(inv);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-1.5 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-medium transition cursor-pointer"
                          >
                            <Clock className="w-4 h-4 text-slate-700" />
                            <span>Recurring</span>
                          </button>

                          {/* 2. Add Payment */}
                          <button
                            onClick={() => {
                              if (onReceivePayment) onReceivePayment(inv);
                              else setSelectedPaymentInvoice(inv);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-1.5 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-medium transition cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4 text-slate-700" />
                            <span>Add Payment</span>
                          </button>

                          {/* 3. Copy Invoice */}
                          <button
                            onClick={() => {
                              handleCopyInvoice(inv);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-1.5 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-medium transition cursor-pointer"
                          >
                            <Copy className="w-4 h-4 text-slate-700" />
                            <span>Copy Invoice</span>
                          </button>

                          {/* 4. Add Credit Note */}
                          <button
                            onClick={() => {
                              setSelectedCreditNoteInvoice(inv);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-1.5 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-medium transition cursor-pointer"
                          >
                            <FileText className="w-4 h-4 text-slate-700" />
                            <span>Add Credit Note</span>
                          </button>

                          {/* 5. Invoice Adjustment */}
                          <button
                            onClick={() => {
                              setSelectedAdjustmentInvoice(inv);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-1.5 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-medium transition cursor-pointer"
                          >
                            <Tag className="w-4 h-4 text-slate-700" />
                            <span>Invoice Adjustment</span>
                          </button>

                          {/* 6. Set Reminder */}
                          <button
                            onClick={() => {
                              setSelectedReminderInvoice(inv);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-1.5 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-medium transition cursor-pointer"
                          >
                            <AlarmClock className="w-4 h-4 text-slate-700" />
                            <span>Set Reminder</span>
                          </button>

                          {/* 7. Void Invoice */}
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to VOID Invoice "${inv.invoiceNumber}"?`)) {
                                const updated = invoices.map(item => item.id === inv.id ? { ...item, status: 'Overdue' as any, balance: 0 } : item);
                                saveInvoices(updated);
                                alert(`Invoice ${inv.invoiceNumber} has been marked as VOID.`);
                              }
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-1.5 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-medium transition cursor-pointer"
                          >
                            <Info className="w-4 h-4 text-slate-700" />
                            <span>Void Invoice</span>
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

        {/* 3. Pagination Footer matching Screenshot */}
        <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-end space-x-4 text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5">
            <span>Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-slate-200 rounded px-1.5 py-0.5 bg-white text-slate-700 font-semibold"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div>
            1 - {filteredInvoices.length} of {filteredInvoices.length}
          </div>

          <div className="flex items-center space-x-1 text-slate-400">
            <button className="p-1 hover:text-slate-700 disabled:opacity-30" disabled>
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:text-slate-700 disabled:opacity-30" disabled>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:text-slate-700 disabled:opacity-30" disabled>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:text-slate-700 disabled:opacity-30" disabled>
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
