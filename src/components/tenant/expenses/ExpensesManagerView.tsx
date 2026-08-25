import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  ShoppingCart, 
  FileText, 
  RotateCcw, 
  CreditCard, 
  HelpCircle
} from 'lucide-react';
import { NewBillView } from './NewBillView';
import { BillsListView } from './BillsListView';
import { ExpensesListView } from './ExpensesListView';
import { NewExpenseView } from './NewExpenseView';
import { PurchaseOrdersListView } from './PurchaseOrdersListView';
import { NewPurchaseOrderView } from './NewPurchaseOrderView';
import { DebitNotesListView } from './DebitNotesListView';
import { NewDebitNoteView } from './NewDebitNoteView';
import { RecurringBillsListView } from './RecurringBillsListView';
import { NewRecurringBillView } from './NewRecurringBillView';
import { PaymentsListView } from './PaymentsListView';
import { NewPaymentView } from './NewPaymentView';
import type { Expense } from '../../../types/expense';
import type { PurchaseOrder } from '../../../types/purchaseOrder';
import type { DebitNote } from '../../../types/debitNote';
import type { RecurringBill } from '../../../types/recurringBill';
import type { SupplierPayment } from '../../../types/payment';
import { api } from '../../../services/api';

export type ExpensesSubTab = 'billing' | 'expenses' | 'purchase-orders' | 'debit-notes' | 'recurring-bills' | 'make-payments';

interface ExpensesManagerViewProps {
  initialTab?: ExpensesSubTab;
  initialAction?: 'new' | 'list';
  onOpenAddContact?: () => void;
  currencyCode?: string;
  currencySymbol?: string;
}

export const ExpensesManagerView: React.FC<ExpensesManagerViewProps> = ({
  initialTab = 'billing',
  initialAction = 'new',
  onOpenAddContact,
  currencyCode = 'PKR',
  currencySymbol = 'Rs'
}) => {
  const [activeTab, setActiveTab] = useState<ExpensesSubTab>(initialTab);
  const [billAction, setBillAction] = useState<'new' | 'list'>(initialAction);
  const [expenseAction, setExpenseAction] = useState<'new' | 'list'>('list');
  const [poAction, setPoAction] = useState<'new' | 'list'>('list');
  const [dnAction, setDnAction] = useState<'new' | 'list'>('list');
  const [recAction, setRecAction] = useState<'new' | 'list'>('list');
  const [payAction, setPayAction] = useState<'new' | 'list'>('list');
  const [convertingPO, setConvertingPO] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
    if (initialTab === 'billing') {
      setBillAction(initialAction);
    } else if (initialTab === 'expenses') {
      setExpenseAction(initialAction);
    } else if (initialTab === 'purchase-orders') {
      setPoAction(initialAction);
    } else if (initialTab === 'debit-notes') {
      setDnAction(initialAction);
    } else if (initialTab === 'recurring-bills') {
      setRecAction(initialAction);
    } else if (initialTab === 'make-payments') {
      setPayAction(initialAction);
    }
  }, [initialTab, initialAction]);

  const handleSaveExpense = async (newExp: Expense) => {
    await api.saveDirectExpense(newExp);
    setExpenseAction('list');
  };

  const handleSavePO = async (newPO: PurchaseOrder) => {
    await api.savePurchaseOrder(newPO);
    setPoAction('list');
  };

  const handleSaveDN = async (newDN: DebitNote) => {
    await api.saveDebitNote(newDN);
    setDnAction('list');
  };

  const handleSaveRecurring = (newRec: RecurringBill) => {
    const saved = localStorage.getItem('adwiselabs_recurring_bills');
    const list: RecurringBill[] = saved ? JSON.parse(saved) : [];
    localStorage.setItem('adwiselabs_recurring_bills', JSON.stringify([newRec, ...list]));
    setRecAction('list');
  };

  const handleSavePayment = async (newPay: SupplierPayment) => {
    await api.saveSupplierPayment(newPay);
    setPayAction('list');
  };

  return (
    <div className="space-y-3 font-sans text-xs text-slate-700 select-none">
      {/* ======================================================== */}
      {/* 🧭 TOP HORIZONTAL SUB-TABS (MATCHING SCREENSHOT)         */}
      {/* ======================================================== */}
      <div className="bg-[#e9edf2] border-b border-slate-300 -mx-4 -mt-4 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-0.5 overflow-x-auto text-xs font-semibold py-1">
          {/* Billing */}
          <button
            onClick={() => { setActiveTab('billing'); }}
            className={`px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition ${
              activeTab === 'billing'
                ? 'bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            <span>Billing</span>
          </button>

          {/* Expenses */}
          <button
            onClick={() => { setActiveTab('expenses'); }}
            className={`px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition ${
              activeTab === 'expenses'
                ? 'bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 text-slate-500" />
            <span>Expenses</span>
          </button>

          {/* Purchase Order */}
          <button
            onClick={() => { setActiveTab('purchase-orders'); }}
            className={`px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition ${
              activeTab === 'purchase-orders'
                ? 'bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Purchase Order</span>
          </button>

          {/* Debit Notes */}
          <button
            onClick={() => { setActiveTab('debit-notes'); }}
            className={`px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition ${
              activeTab === 'debit-notes'
                ? 'bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            <span>Debit Notes</span>
          </button>

          {/* Recurring Bills */}
          <button
            onClick={() => { setActiveTab('recurring-bills'); }}
            className={`px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition ${
              activeTab === 'recurring-bills'
                ? 'bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Recurring Bills</span>
          </button>

          {/* Make Payments */}
          <button
            onClick={() => { setActiveTab('make-payments'); }}
            className={`px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition ${
              activeTab === 'make-payments'
                ? 'bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-slate-500" />
            <span>Make Payments</span>
          </button>
        </div>

        <HelpCircle className="w-4 h-4 text-slate-500 hover:text-slate-700 cursor-pointer" />
      </div>

      {/* Main Content Area */}
      {activeTab === 'billing' ? (
        billAction === 'new' ? (
          <div>
            <div className="flex justify-end mb-2">
              <button
                onClick={() => {
                  setConvertingPO(null);
                  setBillAction('list');
                }}
                className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[#0070ba]" /> View All Bills
              </button>
            </div>
            <NewBillView
              key={convertingPO ? convertingPO.id : 'standard_bill'}
              currencyCode={currencyCode}
              currencySymbol={currencySymbol}
              initialPO={convertingPO}
              onOpenAddContact={onOpenAddContact}
              onSaveBill={() => {
                setConvertingPO(null);
                setBillAction('list');
              }}
            />
          </div>
        ) : (
          <BillsListView
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
            onOpenNewBill={() => {
              setConvertingPO(null);
              setBillAction('new');
            }}
          />
        )
      ) : activeTab === 'expenses' ? (
        expenseAction === 'new' ? (
          <NewExpenseView
            onSaveExpense={handleSaveExpense}
            onCancel={() => setExpenseAction('list')}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
          />
        ) : (
          <ExpensesListView
            onOpenNewExpense={() => setExpenseAction('new')}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
          />
        )
      ) : activeTab === 'purchase-orders' ? (
        poAction === 'new' ? (
          <NewPurchaseOrderView
            onSavePO={handleSavePO}
            onCancel={() => setPoAction('list')}
            onOpenAddContact={onOpenAddContact}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
          />
        ) : (
          <PurchaseOrdersListView
            onOpenNewPO={() => setPoAction('new')}
            onConvertToBill={(po) => {
              setConvertingPO(po);
              setActiveTab('billing');
              setBillAction('new');
            }}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
          />
        )
      ) : activeTab === 'debit-notes' ? (
        dnAction === 'new' ? (
          <NewDebitNoteView
            onSaveDN={handleSaveDN}
            onCancel={() => setDnAction('list')}
            onOpenAddContact={onOpenAddContact}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
          />
        ) : (
          <DebitNotesListView
            onOpenNewDN={() => setDnAction('new')}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
          />
        )
      ) : activeTab === 'recurring-bills' ? (
        recAction === 'new' ? (
          <NewRecurringBillView
            onSaveRecurring={handleSaveRecurring}
            onCancel={() => setRecAction('list')}
            onOpenAddContact={onOpenAddContact}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
          />
        ) : (
          <RecurringBillsListView
            onOpenNewRecurring={() => setRecAction('new')}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
          />
        )
      ) : activeTab === 'make-payments' ? (
        payAction === 'new' ? (
          <NewPaymentView
            onSavePayment={handleSavePayment}
            onCancel={() => setPayAction('list')}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
          />
        ) : (
          <PaymentsListView
            onOpenNewPayment={() => setPayAction('new')}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
          />
        )
      ) : null}
    </div>
  );
};
