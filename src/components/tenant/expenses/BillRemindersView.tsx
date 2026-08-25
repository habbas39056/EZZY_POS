import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Bell, CheckCircle2, X } from 'lucide-react';
import type { Bill } from '../../../types/billing';

interface BillRemindersViewProps {
  bill: Bill;
  onBack: () => void;
  currencySymbol?: string;
}

interface ReminderRecord {
  id: string;
  createdOn: string;
  reminderType: string;
  days: number;
  reminderDate: string;
  invoiceAttached: boolean;
  status: 'Active' | 'Sent' | 'Cancelled';
}

export const BillRemindersView: React.FC<BillRemindersViewProps> = ({
  bill,
  onBack,
  currencySymbol = 'Rs'
}) => {
  const [reminders, setReminders] = useState<ReminderRecord[]>(() => {
    const saved = localStorage.getItem(`adwiselabs_bill_reminders_${bill.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [reminderType, setReminderType] = useState('Before Due Date');
  const [days, setDays] = useState<number>(3);
  const [attachBill, setAttachBill] = useState(true);

  const currentBalance = bill.balance ?? bill.grossTotal ?? 0;

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    const createdDateStr = `${day}-${month}-${year}`;

    // Target reminder date computation
    const remDate = new Date();
    if (reminderType === 'Before Due Date') {
      remDate.setDate(remDate.getDate() - days);
    } else if (reminderType === 'After Due Date') {
      remDate.setDate(remDate.getDate() + days);
    }
    const remDay = String(remDate.getDate()).padStart(2, '0');
    const remMonth = remDate.toLocaleString('en-US', { month: 'short' });
    const remYear = remDate.getFullYear();
    const targetDateStr = `${remDay}-${remMonth}-${remYear}`;

    const newReminder: ReminderRecord = {
      id: `rem_bill_${Date.now()}`,
      createdOn: createdDateStr,
      reminderType,
      days,
      reminderDate: targetDateStr,
      invoiceAttached: attachBill,
      status: 'Active'
    };

    const updated = [newReminder, ...reminders];
    setReminders(updated);
    localStorage.setItem(`adwiselabs_bill_reminders_${bill.id}`, JSON.stringify(updated));
    setIsAddingReminder(false);
    alert(`Payment reminder scheduled for bill ${bill.billNumber}!`);
  };

  const handleDeleteReminder = (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    localStorage.setItem(`adwiselabs_bill_reminders_${bill.id}`, JSON.stringify(updated));
  };

  return (
    <div className="space-y-4 font-sans text-xs text-slate-700 select-none max-w-7xl mx-auto my-2">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-lg border border-slate-200 shadow-xs">
        <button
          onClick={onBack}
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Bills
        </button>
        <span className="text-xs text-slate-500 font-mono">
          Bill No: <strong className="text-slate-800 font-bold">{bill.billNumber}</strong>
        </span>
      </div>

      {/* 1. Bill Details Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-[#0070ba]">Bill Details</h2>
          <button
            onClick={() => setIsAddingReminder(true)}
            className="px-4 py-1.5 bg-[#5dade2] hover:bg-[#3498db] text-white font-bold rounded text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Reminder
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs pt-1">
          {/* Left: Bill No & Date */}
          <div className="space-y-3">
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Bill No</span>
              <span className="font-semibold text-slate-800 font-mono mt-0.5 block">{bill.billNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Bill Date</span>
              <span className="font-mono text-slate-700 mt-0.5 block">{bill.issueDate || 'N/A'}</span>
            </div>
          </div>

          {/* Middle: Supplier & Due Date */}
          <div className="space-y-3">
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Supplier</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{bill.supplierName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Due Date</span>
              <span className={`font-mono mt-0.5 block ${bill.dueDate ? 'text-slate-700' : 'text-rose-500 font-medium'}`}>
                {bill.dueDate || 'Due Date is required to set reminder'}
              </span>
            </div>
          </div>

          {/* Right: Balance */}
          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Balance</span>
            <span className="font-extrabold text-[#001737] font-mono text-sm mt-0.5 block">
              {currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Add Reminder Form */}
      {isAddingReminder && (
        <div className="bg-[#f0f9ff] border border-sky-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-sky-100 pb-2">
            <h3 className="font-bold text-sky-900 text-xs flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-sky-600" /> Schedule Payment Reminder
            </h3>
            <button
              onClick={() => setIsAddingReminder(false)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveReminder} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1 text-[11px]">
                  Reminder Type *
                </label>
                <select
                  value={reminderType}
                  onChange={(e) => setReminderType(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
                >
                  <option value="Before Due Date">Before Due Date</option>
                  <option value="On Due Date">On Due Date</option>
                  <option value="After Due Date">After Due Date (Overdue)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1 text-[11px]">
                  Days {reminderType === 'On Due Date' ? '(N/A)' : '*'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  disabled={reminderType === 'On Due Date'}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium text-xs">
                  <input
                    type="checkbox"
                    checked={attachBill}
                    onChange={(e) => setAttachBill(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
                  />
                  <span>Attach PDF Bill</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-sky-100">
              <button
                type="button"
                onClick={() => setIsAddingReminder(false)}
                className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-[#0070ba] hover:bg-sky-700 text-white font-bold rounded text-xs transition shadow-xs cursor-pointer"
              >
                Save Reminder
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Reminders List Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
        <h3 className="text-sm font-bold text-slate-800">Reminders List</h3>

        <div className="overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-semibold text-[10.5px]">
              <tr>
                <th className="px-4 py-2.5">Created On</th>
                <th className="px-4 py-2.5">Reminder Type</th>
                <th className="px-4 py-2.5 text-center">Days</th>
                <th className="px-4 py-2.5">Reminder Date</th>
                <th className="px-4 py-2.5 text-center">Invoice Attached</th>
                <th className="px-4 py-2.5 text-center">Status</th>
                <th className="px-4 py-2.5 text-center w-24">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-[11px]">
              {reminders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No reminder records found for this bill. Click <strong>Add Reminder</strong> to set one.
                  </td>
                </tr>
              ) : (
                reminders.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono text-slate-600 text-[10.5px]">{r.createdOn}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{r.reminderType}</td>
                    <td className="px-4 py-3 text-center font-mono">{r.days}</td>
                    <td className="px-4 py-3 font-mono text-slate-600 text-[10.5px]">{r.reminderDate}</td>
                    <td className="px-4 py-3 text-center">
                      {r.invoiceAttached ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[10.5px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Yes
                        </span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDeleteReminder(r.id)}
                        className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Delete Reminder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
