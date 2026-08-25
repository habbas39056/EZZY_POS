import React, { useState } from 'react';
import { CreditCard, Search, Plus, CheckCircle, Clock, AlertTriangle, Download, X, Check, Trash2 } from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';

export const InvoicesView: React.FC = () => {
  const { invoices, tenants, markInvoicePaid, addSaaSInvoice, deleteSaaSInvoice } = useSuperAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form for manual SaaS invoice creation
  const [selectedTenantId, setSelectedTenantId] = useState(tenants[0]?.id || '');
  const [planName, setPlanName] = useState('Custom Enterprise Subscription');
  const [amount, setAmount] = useState(199);
  const [dueDate, setDueDate] = useState(new Date().toISOString().substring(0, 10));

  const totalCollected = invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0);
  const totalOutstanding = invoices.filter(i => i.status === 'unpaid').reduce((acc, i) => acc + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((acc, i) => acc + i.amount, 0);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.tenantName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = tenants.find(t => t.id === selectedTenantId);
    if (!tenant) return;

    addSaaSInvoice({
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId: tenant.id,
      tenantName: tenant.companyName,
      planName,
      amount,
      currency: 'USD',
      status: 'unpaid',
      issueDate: new Date().toISOString().substring(0, 10),
      dueDate,
      paymentMethod: 'Bank Transfer'
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#0070ba]" /> SaaS Invoicing & Billing
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Subscription charges, revenue collection logs, and payment receipts.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-[#0070ba] hover:bg-sky-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Issue SaaS Invoice
        </button>
      </div>

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Collected Revenue</span>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">${totalCollected.toLocaleString()}</h3>
          <p className="text-[10.5px] text-slate-500 mt-0.5">Paid subscription licenses</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Invoices</span>
          <h3 className="text-2xl font-extrabold text-amber-600 mt-1">${totalOutstanding.toLocaleString()}</h3>
          <p className="text-[10.5px] text-slate-500 mt-0.5">Awaiting payment collection</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Overdue Balances</span>
          <h3 className="text-2xl font-extrabold text-rose-600 mt-1">${totalOverdue.toLocaleString()}</h3>
          <p className="text-[10.5px] text-slate-500 mt-0.5">Requires suspension / follow-up</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice number or client company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0070ba] focus:bg-white"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#0070ba] w-full sm:w-auto font-medium"
          >
            <option value="all">All Invoices ({invoices.length})</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Client Organization</th>
                <th className="px-4 py-3">Plan / Description</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {inv.tenantName}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {inv.planName}
                  </td>
                  <td className="px-4 py-3 font-extrabold text-slate-900 text-xs">
                    ${inv.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {inv.status === 'paid' && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Paid ({inv.paidAt || 'Cleared'})
                      </span>
                    )}
                    {inv.status === 'unpaid' && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" /> Unpaid
                      </span>
                    )}
                    {inv.status === 'overdue' && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle className="w-3 h-3 text-rose-600" /> Overdue
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {inv.dueDate}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => markInvoicePaid(inv.id)}
                          className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] border border-emerald-200 flex items-center gap-1 transition"
                        >
                          <Check className="w-3 h-3" /> Mark Paid
                        </button>
                      )}
                      <button
                        onClick={() => alert(`Invoice ${inv.invoiceNumber} receipt downloaded.`)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                        title="Download Receipt"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete invoice ${inv.invoiceNumber}?`)) {
                            deleteSaaSInvoice(inv.id);
                          }
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Invoice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col my-8 text-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-extrabold text-sm text-slate-900">Generate Manual SaaS Invoice</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 text-xs space-y-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Client Organization</label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.companyName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Billing Item / Plan Description</label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0070ba] hover:bg-sky-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <CreditCard className="w-3.5 h-3.5" /> Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
