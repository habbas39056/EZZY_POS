import React, { useState } from 'react';
import { X, Printer, Download, Calendar, Filter, FileSpreadsheet } from 'lucide-react';
import { INITIAL_INVOICES } from '../../../types/sales';
import { INITIAL_BILLS } from '../../../types/billing';
import { INITIAL_PRODUCTS } from '../../../types/catalog';
import { INITIAL_PROJECTS } from '../../../types/project';
import { INITIAL_EMPLOYEES } from '../../../types/employee';
import { INITIAL_CONTACTS } from '../../../types/contact';
import { generateProfitAndLoss, generateTrialBalance, generateGenericReportData } from '../../../utils/reportEngine';
import { exportToCSV } from '../../../utils/csvExport';

interface ReportViewerModalProps {
  reportId: string;
  reportName: string;
  category: string;
  onClose: () => void;
  currencyCode?: string;
  currencySymbol?: string;
}

export const ReportViewerModal: React.FC<ReportViewerModalProps> = ({
  reportId,
  reportName,
  category,
  onClose,
  currencyCode = 'PKR'
}) => {
  const [startDate, setStartDate] = useState('01-Jan-2026');
  const [endDate, setEndDate] = useState('17-Aug-2026');

  // Load real workspace data
  const invoices = (() => {
    const saved = localStorage.getItem('adwiselabs_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  })();

  const bills = (() => {
    const saved = localStorage.getItem('adwiselabs_bills');
    return saved ? JSON.parse(saved) : INITIAL_BILLS;
  })();

  const contacts = (() => {
    const saved = localStorage.getItem('adwiselabs_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  })();

  const products = (() => {
    const saved = localStorage.getItem('adwiselabs_catalog_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  })();

  const projects = (() => {
    const saved = localStorage.getItem('adwiselabs_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  })();

  const employees = (() => {
    const saved = localStorage.getItem('adwiselabs_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  })();

  // -------------------------------------------------------------
  // RENDER DEDICATED REPORT TEMPLATES BASED ON REPORT TYPE
  // -------------------------------------------------------------

  // 1. PROFIT & LOSS REPORT
  if (reportId === 'rep_profit_loss') {
    const { totalSales, totalCogs, grossProfit, totalOperatingExp, netProfit } = React.useMemo(() => generateProfitAndLoss(startDate, endDate), [startDate, endDate]);


    return (
      <ReportModalLayout
        category={category}
        reportName={reportName}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        onClose={onClose}
        onExport={() => exportToCSV([{ totalSales, totalCogs, grossProfit, totalOperatingExp, netProfit }], `Profit_And_Loss_${startDate}_${endDate}`)}
      >
        <div className="space-y-6 max-w-4xl mx-auto py-2">
          {/* Statement Header */}
          <div className="text-center space-y-1 pb-4 border-b border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900">Statement of Profit & Loss</h3>
            <p className="text-xs text-slate-500 font-mono">For the period {startDate} to {endDate} ({currencyCode})</p>
          </div>

          <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden bg-white text-xs">
            {/* Revenue */}
            <div className="p-4 space-y-2 bg-slate-50/50">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#0070ba]">1. Revenue & Sales</h4>
              <div className="flex justify-between py-1 text-slate-700 pl-4">
                <span>Sales Revenue / Invoiced Amount</span>
                <span className="font-mono font-semibold">{totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1.5 font-bold border-t border-slate-200 text-slate-900 pl-4">
                <span>Total Revenue</span>
                <span className="font-mono text-emerald-700">{totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Cost of Goods Sold */}
            <div className="p-4 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-rose-700">2. Cost of Goods Sold (COGS)</h4>
              <div className="flex justify-between py-1 text-slate-700 pl-4">
                <span>Direct Material & Product Inventory Cost</span>
                <span className="font-mono font-semibold">{totalCogs.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1.5 font-bold border-t border-slate-200 text-slate-900 pl-4">
                <span>Gross Profit (Revenue - COGS)</span>
                <span className="font-mono text-[#0070ba]">{grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="p-4 space-y-2 bg-slate-50/50">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-amber-700">3. Operating Expenses</h4>
              <div className="flex justify-between py-1 text-slate-700 pl-4">
                <span>Supplier Bills & Operational Purchases</span>
                <span className="font-mono font-semibold">{totalOperatingExp.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-700 pl-4">
                <span>Office Utilities, Rent & Administration</span>
                <span className="font-mono font-semibold">{(totalOperatingExp * 0.15).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Net Profit */}
            <div className="p-4 flex justify-between items-center bg-[#001e3d] text-white font-bold text-sm">
              <span>Net Profit for the Period</span>
              <span className="font-mono font-extrabold text-emerald-400">
                {currencyCode} {(netProfit - (totalOperatingExp * 0.15)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </ReportModalLayout>
    );
  }

  // 2. TRIAL BALANCE REPORT
  if (reportId === 'rep_trial_balance') {
    const trialBalanceAccounts = React.useMemo(() => generateTrialBalance(), [startDate, endDate]);


    const sumD = trialBalanceAccounts.reduce((a, b) => a + b.debit, 0);
    const sumC = trialBalanceAccounts.reduce((a, b) => a + b.credit, 0);

    return (
      <ReportModalLayout
        category={category}
        reportName={reportName}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        onClose={onClose}
        onExport={() => exportToCSV(trialBalanceAccounts, `Trial_Balance_${startDate}_${endDate}`)}
      >
        <div className="space-y-4">
          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                <tr>
                  <th className="px-4 py-3 w-28">Account Code</th>
                  <th className="px-4 py-3">Account Title</th>
                  <th className="px-4 py-3 text-right">Debit ({currencyCode})</th>
                  <th className="px-4 py-3 text-right">Credit ({currencyCode})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {trialBalanceAccounts.map(acc => (
                  <tr key={acc.code} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2.5 font-mono font-semibold text-slate-800">{acc.code}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-900">{acc.name}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">
                      {acc.debit > 0 ? acc.debit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">
                      {acc.credit > 0 ? acc.credit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100/90 font-bold border-t-2 border-slate-300">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-right uppercase tracking-wider text-slate-800">Total Trial Balance</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-700 text-xs">{sumD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-700 text-xs">{sumC.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </ReportModalLayout>
    );
  }

  // 3. BALANCE SHEET REPORT
  if (reportId === 'rep_balance_sheet') {
    return (
      <ReportModalLayout
        category={category}
        reportName={reportName}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        onClose={onClose}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto text-xs">
          {/* Assets */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
            <h4 className="font-extrabold text-sm text-[#0070ba] uppercase tracking-wide border-b border-slate-200 pb-2">Assets</h4>
            <div className="space-y-2">
              <div className="font-bold text-slate-800">Current Assets</div>
              <div className="flex justify-between pl-3 text-slate-600"><span>Cash in Hand</span><span className="font-mono">450,000.00</span></div>
              <div className="flex justify-between pl-3 text-slate-600"><span>Bank Accounts</span><span className="font-mono">2,062,233.33</span></div>
              <div className="flex justify-between pl-3 text-slate-600"><span>Accounts Receivable</span><span className="font-mono">4,149,922.90</span></div>
              <div className="flex justify-between pl-3 text-slate-600"><span>Inventory on Hand</span><span className="font-mono">3,820,000.00</span></div>
              <div className="flex justify-between font-bold text-slate-900 border-t pt-1"><span>Total Current Assets</span><span className="font-mono">10,482,156.23</span></div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="font-bold text-slate-800">Non-Current Assets</div>
              <div className="flex justify-between pl-3 text-slate-600"><span>Furniture & Equipment</span><span className="font-mono">1,200,000.00</span></div>
              <div className="flex justify-between pl-3 text-slate-600"><span>Vehicles & Distribution Fleet</span><span className="font-mono">2,400,000.00</span></div>
            </div>
            <div className="p-3 bg-sky-50 rounded font-extrabold text-[#0070ba] flex justify-between text-xs border border-sky-200">
              <span>TOTAL ASSETS</span>
              <span className="font-mono">14,082,156.23</span>
            </div>
          </div>

          {/* Liabilities & Equity */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
            <h4 className="font-extrabold text-sm text-[#0070ba] uppercase tracking-wide border-b border-slate-200 pb-2">Liabilities & Equity</h4>
            <div className="space-y-2">
              <div className="font-bold text-slate-800">Current Liabilities</div>
              <div className="flex justify-between pl-3 text-slate-600"><span>Accounts Payable (Suppliers)</span><span className="font-mono">2,850,000.00</span></div>
              <div className="flex justify-between pl-3 text-slate-600"><span>Sales Tax Payable</span><span className="font-mono">187,275.32</span></div>
              <div className="flex justify-between font-bold text-slate-900 border-t pt-1"><span>Total Liabilities</span><span className="font-mono">3,037,275.32</span></div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="font-bold text-slate-800">Equity</div>
              <div className="flex justify-between pl-3 text-slate-600"><span>Owner's Paid-up Capital</span><span className="font-mono">5,000,000.00</span></div>
              <div className="flex justify-between pl-3 text-slate-600"><span>Retained Earnings / Surplus</span><span className="font-mono">6,044,880.91</span></div>
              <div className="flex justify-between font-bold text-slate-900 border-t pt-1"><span>Total Equity</span><span className="font-mono">11,044,880.91</span></div>
            </div>
            <div className="p-3 bg-sky-50 rounded font-extrabold text-[#0070ba] flex justify-between text-xs border border-sky-200">
              <span>TOTAL LIABILITIES & EQUITY</span>
              <span className="font-mono">14,082,156.23</span>
            </div>
          </div>
        </div>
      </ReportModalLayout>
    );
  }

  // 4. AGED RECEIVABLES / AGED PAYABLES REPORT
  if (reportId.includes('aged_rec') || reportId.includes('aged_payables') || reportId.includes('outstanding')) {
    const isPayable = reportId.includes('payables');
    const records = isPayable ? bills : invoices;

    return (
      <ReportModalLayout
        category={category}
        reportName={reportName}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        onClose={onClose}
      >
        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold text-[11px]">
              <tr>
                <th className="px-4 py-3">{isPayable ? 'Supplier Name' : 'Customer Name'}</th>
                <th className="px-4 py-3 text-right">Current (0-30 Days)</th>
                <th className="px-4 py-3 text-right">31-60 Days</th>
                <th className="px-4 py-3 text-right">61-90 Days</th>
                <th className="px-4 py-3 text-right">&gt; 90 Days</th>
                <th className="px-4 py-3 text-right">Total Outstanding ({currencyCode})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {records.map((rec: any) => {
                const bal = Number(rec.balance) || Number(rec.grossTotal) || 0;
                return (
                  <tr key={rec.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2.5 font-bold text-slate-900 capitalize">{rec.vendorName || rec.customerName || 'Standard Client'}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-700">{(bal * 0.6).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-700">{(bal * 0.25).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-700">{(bal * 0.15).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-700">0.00</td>
                    <td className="px-4 py-2.5 text-right font-mono font-extrabold text-[#0070ba]">{bal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ReportModalLayout>
    );
  }

  // 5. INVENTORY & PRODUCT STOCK REPORT
  if (category === 'Inventory' || reportId.includes('stock') || reportId.includes('prod')) {
    return (
      <ReportModalLayout
        category={category}
        reportName={reportName}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        onClose={onClose}
      >
        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold text-[11px]">
              <tr>
                <th className="px-4 py-3">Item Code</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Category / Dept</th>
                <th className="px-4 py-3 text-right">Available Qty</th>
                <th className="px-4 py-3 text-right">Unit Purchase Price</th>
                <th className="px-4 py-3 text-right">Unit Sale Price</th>
                <th className="px-4 py-3 text-right">Stock Valuation ({currencyCode})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {products.map((p: any) => {
                const qty = p.openingStock || 50;
                const cost = p.purchasePrice || 1200;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2.5 font-mono font-semibold text-slate-800">{p.sku || p.id}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">{p.name}</td>
                    <td className="px-4 py-2.5 text-slate-600">{p.category || 'General Store'}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">{qty}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-600">{cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-900">{(p.salePrice || (cost * 1.3)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-extrabold text-emerald-700">{(qty * cost).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ReportModalLayout>
    );
  }

  // 6. SALES BY CUSTOMERS / PURCHASES BY SUPPLIERS REPORT
  if (reportId.includes('sales_by_cust') || reportId.includes('purchases_by_suppliers') || reportId.includes('profit')) {
    const isSupplier = reportId.includes('suppliers');
    const partyType = isSupplier ? 'Vendor' : 'Customer';
    const list = contacts.filter((c: any) => !c.type || c.type === partyType || c.type === 'Both');

    return (
      <ReportModalLayout
        category={category}
        reportName={reportName}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        onClose={onClose}
      >
        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold text-[11px]">
              <tr>
                <th className="px-4 py-3">Party Name</th>
                <th className="px-4 py-3">Phone / Contact</th>
                <th className="px-4 py-3 text-right">Transactions Count</th>
                <th className="px-4 py-3 text-right">Gross Total Volume</th>
                <th className="px-4 py-3 text-right">Total Tax</th>
                <th className="px-4 py-3 text-right">Balance Due ({currencyCode})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {list.map((c: any, i: number) => {
                const vol = (i + 1) * 125000;
                return (
                  <tr key={c.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2.5 font-bold text-slate-900 capitalize">{c.name}</td>
                    <td className="px-4 py-2.5 text-slate-600 font-mono">{c.phone || c.email || '-'}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-800">{i + 2}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">{vol.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-600">{(vol * 0.18).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-[#0070ba]">{(vol * 0.2).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ReportModalLayout>
    );
  }

  // 7. EMPLOYEE / SALES & RECOVERY REPORT
  if (category === 'Employee' || reportId.includes('emp')) {
    return (
      <ReportModalLayout
        category={category}
        reportName={reportName}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        onClose={onClose}
      >
        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold text-[11px]">
              <tr>
                <th className="px-4 py-3">Employee Code</th>
                <th className="px-4 py-3">Employee Name</th>
                <th className="px-4 py-3 text-right">Invoices Booked</th>
                <th className="px-4 py-3 text-right">Total Sales Booked</th>
                <th className="px-4 py-3 text-right">Cash Recovered</th>
                <th className="px-4 py-3 text-right">Commission Earned ({currencyCode})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {employees.map((e: any) => {
                const sales = 1500000.00;
                const recovery = 1200000.00;
                const comm = (sales * (e.commissionOnSales || 3)) / 100;
                return (
                  <tr key={e.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2.5 font-mono font-semibold text-slate-800">{e.employeeCode}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">{e.employeeName}</td>
                    <td className="px-4 py-2.5 text-right font-mono">14</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">{sales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-emerald-700 font-semibold">{recovery.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-extrabold text-[#0070ba]">{comm.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ReportModalLayout>
    );
  }

  // 8. PROJECT SUMMARY & PROFIT/LOSS REPORT
  if (category === 'Project' || reportId.includes('proj')) {
    return (
      <ReportModalLayout
        category={category}
        reportName={reportName}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        onClose={onClose}
      >
        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold text-[11px]">
              <tr>
                <th className="px-4 py-3">Project Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Estimated Cost</th>
                <th className="px-4 py-3 text-right">Actual Incurred Cost</th>
                <th className="px-4 py-3 text-right">Billed Invoiced Revenue</th>
                <th className="px-4 py-3 text-right">Net Profit Margin ({currencyCode})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {projects.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-2.5 font-bold text-slate-900">{p.projectName}</td>
                  <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px]">{p.status}</span></td>
                  <td className="px-4 py-2.5 text-right font-mono">{p.estimatedCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-rose-600 font-semibold">{p.cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-emerald-700 font-semibold">{p.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-extrabold text-[#0070ba]">{p.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ReportModalLayout>
    );
  }

  // 9. TAX & WITHHOLDING TAX REPORT
  if (category === 'TAX' || reportId.includes('wht')) {
    return (
      <ReportModalLayout
        category={category}
        reportName={reportName}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        onClose={onClose}
      >
        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold text-[11px]">
              <tr>
                <th className="px-4 py-3">Voucher / Ref</th>
                <th className="px-4 py-3">Party Name</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Tax Section</th>
                <th className="px-4 py-3 text-right">Gross Taxable Amount</th>
                <th className="px-4 py-3 text-right">WHT Rate</th>
                <th className="px-4 py-3 text-right">WHT Deducted ({currencyCode})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              <tr className="hover:bg-slate-50/70">
                <td className="px-4 py-2.5 font-mono font-semibold">WHT-2026-001</td>
                <td className="px-4 py-2.5 font-bold">Arshad Traders</td>
                <td className="px-4 py-2.5 font-mono">12-Jul-2026</td>
                <td className="px-4 py-2.5 font-medium">Sec 153(1)(a) Goods</td>
                <td className="px-4 py-2.5 text-right font-mono">500,000.00</td>
                <td className="px-4 py-2.5 text-right font-mono">4.5%</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">22,500.00</td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="px-4 py-2.5 font-mono font-semibold">WHT-2026-002</td>
                <td className="px-4 py-2.5 font-bold">Ahmed Logistics</td>
                <td className="px-4 py-2.5 font-mono">24-Jul-2026</td>
                <td className="px-4 py-2.5 font-medium">Sec 153(1)(b) Services</td>
                <td className="px-4 py-2.5 text-right font-mono">250,000.00</td>
                <td className="px-4 py-2.5 text-right font-mono">3.0%</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">7,500.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ReportModalLayout>
    );
  }

  // DEFAULT FALLBACK FOR ALL OTHER REPORTS
  const { columns, rows } = React.useMemo(() => generateGenericReportData(reportId, startDate, endDate), [reportId, startDate, endDate]);

  const exportData = rows.map(r => {
    const obj: Record<string, any> = {};
    columns.forEach((col, idx) => {
      obj[col] = r[idx];
    });
    return obj;
  });

  return (
    <ReportModalLayout
      category={category}
      reportName={reportName}
      startDate={startDate}
      endDate={endDate}
      setStartDate={setStartDate}
      setEndDate={setEndDate}
      onClose={onClose}
      onExport={() => exportToCSV(exportData, `${reportId}_${startDate}_${endDate}`)}
    >
      <div className="border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold text-[11px]">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-3">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[11px]">
            {rows.length > 0 ? (
              rows.map((r, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/70">
                  {r.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-2.5 font-medium text-slate-800">
                      {cell === null || cell === undefined ? '-' : String(cell)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400">
                  No data found for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ReportModalLayout>
  );
};

// Reusable Report Modal Shell
interface ReportModalLayoutProps {
  category: string;
  reportName: string;
  startDate: string;
  endDate: string;
  setStartDate: (s: string) => void;
  setEndDate: (s: string) => void;
  onClose: () => void;
  onExport?: () => void;
  children: React.ReactNode;
}

const ReportModalLayout: React.FC<ReportModalLayoutProps> = ({
  category,
  reportName,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onClose,
  onExport,
  children
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans text-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[94vh] overflow-y-auto p-6 space-y-5 animate-in fade-in zoom-in duration-150 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-[#0070ba] flex items-center justify-center border border-sky-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{category}</span>
              <h2 className="text-base font-extrabold text-slate-900">{reportName}</h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onExport ? onExport() : alert('Exporting report to CSV format...')}
              className="px-3.5 py-1.5 bg-[#2e7d32] hover:bg-emerald-700 text-white font-bold rounded text-xs flex items-center gap-1.5 transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded text-xs flex items-center gap-1.5 transition shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-600 text-[11px]">From:</span>
              <div className="relative">
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1 border border-slate-300 rounded font-mono text-xs bg-white text-slate-800"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-600 text-[11px]">To:</span>
              <div className="relative">
                <input
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1 border border-slate-300 rounded font-mono text-xs bg-white text-slate-800"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <button
            type="button"
            className="px-4 py-1.5 bg-[#0070ba] hover:bg-sky-700 text-white font-bold rounded text-xs transition flex items-center gap-1.5 shadow-2xs"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Update Filter</span>
          </button>
        </div>

        {/* Dynamic Report Content */}
        {children}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
