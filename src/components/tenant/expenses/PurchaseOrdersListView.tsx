import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  CheckSquare, 
  FileCheck, 
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Trash2
} from 'lucide-react';
import type { PurchaseOrder } from '../../../types/purchaseOrder';
import { INITIAL_PURCHASE_ORDERS } from '../../../types/purchaseOrder';
import { DatePicker } from '../../common/DatePicker';
import { isDateInRange } from '../../../utils/dateUtils';
import { GoodsReceivingNotesView } from './GoodsReceivingNotesView';
import { api } from '../../../services/api';

interface PurchaseOrdersListViewProps {
  onOpenNewPO: () => void;
  onConvertToBill?: (po: PurchaseOrder) => void;
  currencyCode?: string;
  currencySymbol?: string;
}

export const PurchaseOrdersListView: React.FC<PurchaseOrdersListViewProps> = ({
  onOpenNewPO,
  onConvertToBill,
  currencyCode = 'PKR',
  currencySymbol = 'Rs'
}) => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const remote = await api.getPurchaseOrders();
        if (remote) {
          setOrders(remote);
        } else {
          const saved = localStorage.getItem('adwiselabs_purchase_orders');
          setOrders(saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS);
        }
      } catch (e) {}
    };
    load();
  }, []);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedGRNPO, setSelectedGRNPO] = useState<PurchaseOrder | null>(null);

  if (selectedGRNPO) {
    return (
      <GoodsReceivingNotesView
        po={selectedGRNPO}
        onBack={() => setSelectedGRNPO(null)}
      />
    );
  }

  const saveOrders = (data: PurchaseOrder[]) => {
    setOrders(data);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this purchase order?')) {
      await api.deletePurchaseOrder(id);
      saveOrders(orders.filter(o => o.id !== id));
      setActiveMenuId(null);
    }
  };

  const handleGRN = (po: PurchaseOrder) => {
    setSelectedGRNPO(po);
    setActiveMenuId(null);
  };

  const filteredOrders = orders.filter(po => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      po.poNumber.toLowerCase().includes(q) ||
      po.supplierName.toLowerCase().includes(q) ||
      po.total.toString().includes(q);

    const matchesStatus = !statusFilter || po.status === statusFilter;
    const matchesDate = isDateInRange(po.poDate || po.createdAt, startDate, endDate);
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-4 font-sans text-xs text-slate-700 select-none">
      {/* ======================================================== */}
      {/* 1. TOP SEARCH CARD (MATCHING SCREENSHOT 1)               */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <h3 className="text-xs font-bold text-slate-800 mb-3">Search</h3>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* PO No, Supplier, PO Total */}
          <div className="sm:col-span-5">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              PO No, Supplier, PO Total
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
              <option value="Partial">Partial</option>
              <option value="Closed">Closed</option>
              <option value="Draft">Draft</option>
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
      {/* 2. PURCHASE ORDERS TABLE (MATCHING SCREENSHOT 1)         */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Purchase Orders</h2>

          <button
            onClick={onOpenNewPO}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded transition flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#0070ba]" /> Purchase Order
          </button>
        </div>

        {/* Full 7-Column PO Table */}
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-white border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-2.5">PO No.</th>
                <th className="px-4 py-2.5">Supplier</th>
                <th className="px-4 py-2.5">PO Date</th>
                <th className="px-4 py-2.5">Due Date</th>
                <th className="px-4 py-2.5 text-right">Total</th>
                <th className="px-4 py-2.5 text-center">Status</th>
                <th className="px-4 py-2.5 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No purchase orders found. Click <strong>+ Purchase Order</strong> to create a new order.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50/80 transition relative">
                    {/* PO No. (Clickable Blue Text) */}
                    <td className="px-4 py-3 font-semibold text-[#0070ba] font-mono cursor-pointer hover:underline">
                      {po.poNumber}
                    </td>

                    {/* Supplier */}
                    <td className="px-4 py-3 font-medium text-slate-900 capitalize">
                      {po.supplierName}
                    </td>

                    {/* PO Date */}
                    <td className="px-4 py-3 text-slate-500 font-mono text-[10.5px]">
                      {po.poDate}
                    </td>

                    {/* Due Date */}
                    <td className="px-4 py-3 text-slate-500 font-mono text-[10.5px]">
                      {po.dueDate || '-'}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                      {po.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status (Partial Orange Pill / Closed Green Pill) */}
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-3 py-0.5 rounded-full text-white font-bold text-[10px] shadow-2xs ${
                        po.status === 'Closed' ? 'bg-[#2e7d32]' : 'bg-[#e65100]'
                      }`}>
                        {po.status}
                      </span>
                    </td>

                    {/* Manage (...) with Convert to Bill & GRN matching Screenshot 1 */}
                    <td className="px-4 py-3 text-center relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === po.id ? null : po.id)}
                        className="font-extrabold text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded hover:bg-slate-200 transition text-sm tracking-tighter"
                      >
                        ...
                      </button>

                      {/* Dropdown Popup */}
                      {activeMenuId === po.id && (
                        <div className="absolute right-4 top-8 w-40 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-left text-xs">
                          <button
                            onClick={() => {
                              if (onConvertToBill) onConvertToBill(po);
                              else alert(`Converted PO ${po.poNumber} into a new Bill!`);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-800 font-medium"
                          >
                            <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                            <span>Convert to Bill</span>
                          </button>
                          <button
                            onClick={() => handleGRN(po)}
                            className="w-full px-3.5 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-800 font-medium"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-slate-500" />
                            <span>GRN</span>
                          </button>
                          <button
                            onClick={() => handleDelete(po.id)}
                            className="w-full px-3.5 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-rose-600 font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Delete</span>
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

        {/* 3. Pagination Footer matching Screenshot 1 */}
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
            1 - {orders.length} of {orders.length}
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
