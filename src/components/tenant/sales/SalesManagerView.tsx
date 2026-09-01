import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Receipt, 
  RotateCcw, 
  CreditCard, 
  HelpCircle
} from 'lucide-react';
import { NewInvoiceView } from './NewInvoiceView';
import { InvoicesListView } from './InvoicesListView';
import { NewQuotationView } from './NewQuotationView';
import { QuotationsListView } from './QuotationsListView';
import { NewCreditNoteView } from './NewCreditNoteView';
import { CreditNotesListView } from './CreditNotesListView';
import { NewRecurringInvoiceView } from './NewRecurringInvoiceView';
import { RecurringInvoicesListView } from './RecurringInvoicesListView';
import { CustomerPaymentsListView } from './CustomerPaymentsListView';
import { NewCustomerPaymentView } from './NewCustomerPaymentView';
import { InvoiceTemplatesView } from './InvoiceTemplatesView';
import type { Invoice } from '../../../types/sales';
import type { Quotation } from '../../../types/quotation';
import type { CreditNote } from '../../../types/creditNote';
import type { RecurringInvoice } from '../../../types/recurringInvoice';
import type { CustomerPayment } from '../../../types/customerPayment';
import { api } from '../../../services/api';

export type SalesSubTab = 'invoices' | 'quotations' | 'credit-notes' | 'recurring-invoices' | 'receive-payments' | 'templates';

interface SalesManagerViewProps {
  initialTab?: SalesSubTab;
  initialAction?: 'new' | 'list';
  onOpenAddContact?: () => void;
  currencyCode?: string;
  currencySymbol?: string;
}

export const SalesManagerView: React.FC<SalesManagerViewProps> = ({
  initialTab = 'invoices',
  initialAction = 'new',
  onOpenAddContact,
  currencyCode = 'PKR',
  currencySymbol = 'Rs'
}) => {
  const [activeTab, setActiveTab] = useState<SalesSubTab>(initialTab);
  const [invoiceAction, setInvoiceAction] = useState<'new' | 'list'>(initialAction);
  const [quotationAction, setQuotationAction] = useState<'new' | 'list'>('list');
  const [cnAction, setCnAction] = useState<'new' | 'list'>('list');
  const [recAction, setRecAction] = useState<'new' | 'list'>('list');
  const [payAction, setPayAction] = useState<'new' | 'list'>('list');
  const [convertingQuotation, setConvertingQuotation] = useState<Quotation | null>(null);
  const [selectedPaymentInvoice, setSelectedPaymentInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
    if (initialTab === 'invoices') {
      setInvoiceAction(initialAction);
    } else if (initialTab === 'quotations') {
      setQuotationAction(initialAction);
    } else if (initialTab === 'credit-notes') {
      setCnAction(initialAction);
    } else if (initialTab === 'recurring-invoices') {
      setRecAction(initialAction);
    } else if (initialTab === 'receive-payments') {
      setPayAction(initialAction);
    }
  }, [initialTab, initialAction]);

  const handleSaveInvoice = async (newInv: Invoice) => {
    try {
      const saved = localStorage.getItem('adwiselabs_invoices');
      const list: Invoice[] = saved ? JSON.parse(saved) : [];
      const filtered = list.filter(i => i.id !== newInv.id);
      localStorage.setItem('adwiselabs_invoices', JSON.stringify([newInv, ...filtered]));
    } catch {}

    await api.saveInvoice(newInv);
    setInvoiceAction('list');
  };

  const handleSaveQuotation = async (newQuot: Quotation) => {
    try {
      const saved = localStorage.getItem('adwiselabs_quotations');
      const list: Quotation[] = saved ? JSON.parse(saved) : [];
      const filtered = list.filter(q => q.id !== newQuot.id);
      localStorage.setItem('adwiselabs_quotations', JSON.stringify([newQuot, ...filtered]));
    } catch {}

    await api.saveQuotation(newQuot);
    setQuotationAction('list');
  };

  const handleSaveCreditNote = async (newCN: CreditNote) => {
    try {
      const saved = localStorage.getItem('adwiselabs_credit_notes');
      const list: CreditNote[] = saved ? JSON.parse(saved) : [];
      const filtered = list.filter(c => c.id !== newCN.id);
      localStorage.setItem('adwiselabs_credit_notes', JSON.stringify([newCN, ...filtered]));
    } catch {}

    await api.saveCreditNote(newCN);
    setCnAction('list');
  };


  const handleSaveRecurring = (newRec: RecurringInvoice) => {
    // For now we don't have recurring API yet, keep local storage
    const saved = localStorage.getItem('adwiselabs_recurring_invoices');
    const list: RecurringInvoice[] = saved ? JSON.parse(saved) : [];
    const filtered = list.filter(r => r.id !== newRec.id);
    localStorage.setItem('adwiselabs_recurring_invoices', JSON.stringify([newRec, ...filtered]));
    setRecAction('list');
  };

  const handleSaveCustomerPayment = async (newPay: CustomerPayment) => {
    await api.savePayment(newPay);
    setPayAction('list');
  };

  return (
    <div className="space-y-3 font-sans text-xs text-slate-700 select-none">
      {/* ======================================================== */}
      {/* 🧭 TOP HORIZONTAL SUB-TABS (MATCHING SCREENSHOT)         */}
      {/* ======================================================== */}
      <div className="bg-[#e9edf2] border-b border-slate-300 -mx-4 -mt-4 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-0.5 overflow-x-auto text-xs font-semibold py-1">
          {/* Invoices */}
          <button
            onClick={() => { setActiveTab('invoices'); }}
            className={`px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition ${
              activeTab === 'invoices'
                ? 'bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            <span>Invoices</span>
          </button>

          {/* Quotations */}
          <button
            onClick={() => { setActiveTab('quotations'); }}
            className={`px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition ${
              activeTab === 'quotations'
                ? 'bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Quotation</span>
          </button>

          {/* Credit Notes */}
          <button
            onClick={() => { setActiveTab('credit-notes'); }}
            className={`px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition ${
              activeTab === 'credit-notes'
                ? 'bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            <span>Credit Notes</span>
          </button>

          {/* Recurring Invoices */}
          <button
            onClick={() => { setActiveTab('recurring-invoices'); }}
            className={`px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition ${
              activeTab === 'recurring-invoices'
                ? 'bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Recurring Invoices</span>
          </button>

          {/* Receive Payments */}
          <button
            onClick={() => { setActiveTab('receive-payments'); }}
            className={`px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition ${
              activeTab === 'receive-payments'
                ? 'bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-slate-500" />
            <span>Receive Payments</span>
          </button>

          {/* Invoice Templates */}
          <button
            onClick={() => { setActiveTab('templates'); }}
            className={`px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition ${
              activeTab === 'templates'
                ? 'bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Invoice Templates</span>
          </button>
        </div>

        <HelpCircle className="w-4 h-4 text-slate-500 hover:text-slate-700 cursor-pointer" />
      </div>

      {/* Content Area */}
      {activeTab === 'invoices' ? (
        invoiceAction === 'new' ? (
          <div>
            <div className="flex justify-end mb-2">
              <button
                onClick={() => {
                  setConvertingQuotation(null);
                  setInvoiceAction('list');
                }}
                className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[#0070ba]" /> View All Invoices
              </button>
            </div>
            <NewInvoiceView
              key={convertingQuotation ? convertingQuotation.id : 'standard_invoice'}
              currencyCode={currencyCode}
              currencySymbol={currencySymbol}
              initialQuotation={convertingQuotation}
              onOpenAddContact={onOpenAddContact}
              onSaveInvoice={(inv) => {
                handleSaveInvoice(inv);
                setConvertingQuotation(null);
              }}
              onCancel={() => {
                setConvertingQuotation(null);
                setInvoiceAction('list');
              }}
            />
          </div>
        ) : (
          <InvoicesListView
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
            onOpenNewInvoice={() => {
              setConvertingQuotation(null);
              setInvoiceAction('new');
            }}
            onReceivePayment={(inv) => {
              setSelectedPaymentInvoice(inv || null);
              setActiveTab('receive-payments');
              setPayAction('new');
            }}
          />
        )
      ) : activeTab === 'quotations' ? (
        quotationAction === 'new' ? (
          <NewQuotationView
            onSaveQuotation={handleSaveQuotation}
            onCancel={() => setQuotationAction('list')}
            onOpenAddContact={onOpenAddContact}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
          />
        ) : (
          <QuotationsListView
            onOpenNewQuotation={() => setQuotationAction('new')}
            onConvertToInvoice={(quotation) => {
              setConvertingQuotation(quotation);
              setActiveTab('invoices');
              setInvoiceAction('new');
            }}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
          />
        )
      ) : activeTab === 'credit-notes' ? (
        cnAction === 'new' ? (
          <NewCreditNoteView
            onSaveCreditNote={handleSaveCreditNote}
            onCancel={() => setCnAction('list')}
            onOpenAddContact={onOpenAddContact}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
          />
        ) : (
          <CreditNotesListView
            onOpenNewCreditNote={() => setCnAction('new')}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
          />
        )
      ) : activeTab === 'recurring-invoices' ? (
        recAction === 'new' ? (
          <NewRecurringInvoiceView
            onSaveRecurring={handleSaveRecurring}
            onCancel={() => setRecAction('list')}
            onOpenAddContact={onOpenAddContact}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
          />
        ) : (
          <RecurringInvoicesListView
            onOpenNewRecurring={() => setRecAction('new')}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
          />
        )
      ) : activeTab === 'receive-payments' ? (
        payAction === 'new' ? (
          <NewCustomerPaymentView
            initialInvoice={selectedPaymentInvoice}
            onSavePayment={(pay) => {
              handleSaveCustomerPayment(pay);
              setSelectedPaymentInvoice(null);
            }}
            onCancel={() => {
              setSelectedPaymentInvoice(null);
              setPayAction('list');
            }}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
          />
        ) : (
          <CustomerPaymentsListView
            onOpenNewPayment={() => {
              setSelectedPaymentInvoice(null);
              setPayAction('new');
            }}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
          />
        )
      ) : activeTab === 'templates' ? (
        <InvoiceTemplatesView />
      ) : null}
    </div>
  );
};
