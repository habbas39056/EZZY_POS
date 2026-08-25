import React, { useState } from 'react';
import { ArrowLeft, Plus, MoreVertical, Trash2, Calendar, CheckCircle } from 'lucide-react';
import type { PurchaseOrder, GoodsReceivingNote } from '../../../types/purchaseOrder';
import { DatePicker } from '../../common/DatePicker';

interface GoodsReceivingNotesViewProps {
  po?: PurchaseOrder | null;
  onBack: () => void;
}

const INITIAL_GRN: GoodsReceivingNote[] = [
  {
    id: 'grn_1',
    poId: 'po_00004',
    poNumber: '00004',
    billNo: '1232',
    grnDate: '27-Apr-2025',
    receivedBy: '340',
    location: 'GWW3',
    notes: 'dwa',
    createdAt: new Date().toISOString()
  }
];

export const GoodsReceivingNotesView: React.FC<GoodsReceivingNotesViewProps> = ({
  po,
  onBack
}) => {
  const [grnList, setGrnList] = useState<GoodsReceivingNote[]>(() => {
    const saved = localStorage.getItem('adwiselabs_goods_receiving_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_GRN;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [billNo, setBillNo] = useState('');
  const getTodayFormatted = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [grnDate, setGrnDate] = useState(getTodayFormatted());
  const [receivedBy, setReceivedBy] = useState('340');
  const [location, setLocation] = useState('GWW3');
  const [notes, setNotes] = useState('');

  const saveGRNs = (items: GoodsReceivingNote[]) => {
    setGrnList(items);
    localStorage.setItem('adwiselabs_goods_receiving_notes', JSON.stringify(items));
  };

  const handleCreateGRN = (e: React.FormEvent) => {
    e.preventDefault();
    const newNote: GoodsReceivingNote = {
      id: `grn_${Date.now()}`,
      poId: po ? po.id : 'po_00004',
      poNumber: po ? po.poNumber : '00004',
      billNo: billNo.trim() || '-',
      grnDate: grnDate || getTodayFormatted(),
      receivedBy: receivedBy.trim() || '340',
      location: location.trim() || 'GWW3',
      notes: notes.trim() || '-',
      createdAt: new Date().toISOString()
    };

    const updated = [newNote, ...grnList];
    saveGRNs(updated);

    // If linked to a PO, update the PO status to Closed
    if (po) {
      try {
        const savedPOs = localStorage.getItem('adwiselabs_purchase_orders');
        if (savedPOs) {
          const poList: PurchaseOrder[] = JSON.parse(savedPOs);
          const updatedPOs = poList.map(p => p.id === po.id ? { ...p, status: 'Closed' as const } : p);
          localStorage.setItem('adwiselabs_purchase_orders', JSON.stringify(updatedPOs));
        }
      } catch (e) {}
    }

    setIsAddModalOpen(false);
    setBillNo('');
    setNotes('');
    alert(`Goods Receiving Note recorded successfully for PO ${newNote.poNumber}!`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this GRN entry?')) {
      saveGRNs(grnList.filter(g => g.id !== id));
    }
  };

  // Filter if viewing for a specific PO, or show all
  const displayedGRNs = po
    ? grnList.filter(g => g.poId === po.id || g.poNumber === po.poNumber)
    : grnList;

  // Fallback to all if list for this specific PO is empty so user sees records
  const finalList = displayedGRNs.length > 0 ? displayedGRNs : grnList;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 max-w-7xl mx-auto my-3 text-xs text-slate-700 font-sans select-none space-y-4">
      {/* Header matching Screenshot */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
            title="Back to Purchase Orders"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-base font-bold text-[#002f6c] tracking-tight">Goods Receiving Notes</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 bg-[#0070ba] hover:bg-sky-700 text-white font-bold rounded text-xs transition flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Record GRN
          </button>
          <button 
            onClick={() => {}}
            className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-50 cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table matching Screenshot */}
      <div className="overflow-x-auto border border-slate-200 rounded">
        <table className="w-full text-left text-xs">
          <thead className="bg-white border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
            <tr>
              <th className="px-4 py-2.5">PO No</th>
              <th className="px-4 py-2.5">Bill No</th>
              <th className="px-4 py-2.5">GRN Date</th>
              <th className="px-4 py-2.5">Received By</th>
              <th className="px-4 py-2.5">Location</th>
              <th className="px-4 py-2.5">Notes</th>
              <th className="px-4 py-2.5 text-center w-16">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-[11px]">
            {finalList.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-400">
                  No Goods Receiving Notes recorded yet. Click <strong>Record GRN</strong> to add one.
                </td>
              </tr>
            ) : (
              finalList.map(grn => (
                <tr key={grn.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3 font-mono font-semibold text-[#0070ba]">
                    {grn.poNumber}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-700">
                    {grn.billNo || '-'}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">
                    {grn.grnDate}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {grn.receivedBy}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {grn.location}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {grn.notes || '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(grn.id)}
                      className="text-slate-400 hover:text-rose-600 transition p-1 rounded hover:bg-rose-50 cursor-pointer"
                      title="Delete GRN"
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

      {/* Record New GRN Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">
                Record Goods Receiving Note {po ? `for PO #${po.poNumber}` : ''}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGRN} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">PO Number</label>
                <input
                  type="text"
                  readOnly
                  value={po ? po.poNumber : '00004'}
                  className="w-full px-3 py-1.5 border border-slate-200 bg-slate-100 rounded text-slate-700 font-mono text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Bill No (Optional)</label>
                <input
                  type="text"
                  value={billNo}
                  onChange={(e) => setBillNo(e.target.value)}
                  placeholder="e.g. 1232"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-800 text-xs focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">GRN Date *</label>
                <DatePicker
                  value={grnDate}
                  onChange={setGrnDate}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Received By *</label>
                  <input
                    type="text"
                    required
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    placeholder="User / Employee code"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-800 text-xs focus:outline-none focus:border-[#0070ba]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. GWW3"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-800 text-xs focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes on goods inspection / packaging condition"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-800 text-xs focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0070ba] hover:bg-sky-700 text-white rounded font-bold text-xs transition shadow-xs cursor-pointer"
                >
                  Save GRN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
