import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Package, 
  Receipt, 
  CreditCard, 
  FileText, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShoppingCart, 
  Users2, 
  BarChart3, 
  Settings as SettingsIcon, 
  LogOut, 
  ChevronDown, 
  ChevronRight, 
  HelpCircle, 
  Landmark,
  FileSpreadsheet,
  RotateCcw,
  Bell,
  AlarmClock,
  Building2,
  Factory,
  Globe,
  Layers,
  MapPin,
  FolderKanban,
  Search,
  Building,
  User,
  X
} from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import type { Tenant } from '../../types';
import type { Invoice } from '../../types/sales';
import type { Bill } from '../../types/billing';
import type { Expense } from '../../types/expense';
import type { BankAccount } from '../../types/bank';
import { ContactsView } from './contacts/ContactsView';
import { CatalogManagerView } from './catalog/CatalogManagerView';
import { ExpensesManagerView } from './expenses/ExpensesManagerView';
import { SalesManagerView } from './sales/SalesManagerView';
import { BankManagerView } from './bank/BankManagerView';
import { ProjectsManagerView } from './projects/ProjectsManagerView';
import { HRManagerView } from './hr/HRManagerView';
import { ManualJournalManagerView } from './journal/ManualJournalManagerView';
import { ReportsManagerView } from './reports/ReportsManagerView';
import { SettingsManagerView } from './settings/SettingsManagerView';
import { MyBusinessesView } from './mybusinesses/MyBusinessesView';
import logoImg from '../../assets/logo.webp';

interface TenantWorkspaceAppProps {
  tenant: Tenant;
}

export const TenantWorkspaceApp: React.FC<TenantWorkspaceAppProps> = ({ tenant }) => {
  const { currentUser, exitImpersonation, logout } = useSuperAdmin();

  // Active module & sub-item state
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    catalog: true,
    expenses: true,
    sales: true,
  });

  const currencySymbol = tenant.currencySymbol || 'PKR';
  const currencyCode = tenant.currency || 'PKR';

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Real dynamic financial data state
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('adwiselabs_invoices');
    return saved ? JSON.parse(saved) : [];
  });
  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('adwiselabs_bills');
    return saved ? JSON.parse(saved) : [];
  });
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('adwiselabs_expenses');
    return saved ? JSON.parse(saved) : [];
  });
  const [banks, setBanks] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('adwiselabs_bank_accounts');
    return saved ? JSON.parse(saved) : [];
  });

  // Refresh live data whenever switching back to dashboard
  useEffect(() => {
    if (activeMenu === 'dashboard') {
      const savedInv = localStorage.getItem('adwiselabs_invoices');
      setInvoices(savedInv ? JSON.parse(savedInv) : []);
      const savedBills = localStorage.getItem('adwiselabs_bills');
      setBills(savedBills ? JSON.parse(savedBills) : []);
      const savedExp = localStorage.getItem('adwiselabs_expenses');
      setExpenses(savedExp ? JSON.parse(savedExp) : []);
      const savedBanks = localStorage.getItem('adwiselabs_bank_accounts');
      setBanks(savedBanks ? JSON.parse(savedBanks) : []);
    }
  }, [activeMenu]);

  // Real calculations
  const todayStr = new Date().toISOString().split('T')[0];

  // Receivables
  const unpaidInvoices = invoices.filter(inv => inv.status !== 'Completed' && inv.status !== 'Paid');
  const receivablesTotal = unpaidInvoices.reduce((sum, inv) => sum + (Number(inv.balance ?? inv.grossTotal) || 0), 0);
  const currentInvoices = unpaidInvoices.filter(inv => !inv.dueDate || inv.dueDate >= todayStr);
  const overdueInvoices = unpaidInvoices.filter(inv => inv.dueDate && inv.dueDate < todayStr);
  const receivablesCurrent = currentInvoices.reduce((sum, inv) => sum + (Number(inv.balance ?? inv.grossTotal) || 0), 0);
  const receivablesOverdue = overdueInvoices.reduce((sum, inv) => sum + (Number(inv.balance ?? inv.grossTotal) || 0), 0);

  // Payables
  const unpaidBills = bills.filter(b => b.status !== 'Completed' && b.status !== 'paid');
  const payablesTotal = unpaidBills.reduce((sum, b) => sum + (Number(b.balance ?? b.grossTotal) || 0), 0);
  const currentBills = unpaidBills.filter(b => !b.dueDate || b.dueDate >= todayStr);
  const overdueBills = unpaidBills.filter(b => b.dueDate && b.dueDate < todayStr);
  const payablesCurrent = currentBills.reduce((sum, b) => sum + (Number(b.balance ?? b.grossTotal) || 0), 0);
  const payablesOverdue = overdueBills.reduce((sum, b) => sum + (Number(b.balance ?? b.grossTotal) || 0), 0);

  // Primary Bank Account
  const primaryBank = banks.find(b => b.isActive) || banks[0] || null;
  const bankBalance = primaryBank ? (Number(primaryBank.adwiselabsBalance ?? primaryBank.statementBalance) || 0) : 0;

  // Real 6-Month Timeline
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = monthNames[d.getMonth()];
    return { key, label, year: d.getFullYear(), month: d.getMonth() };
  });

  const monthlySalesData = last6Months.map(m => {
    const salesSum = invoices
      .filter(inv => (inv.invoiceDate || inv.createdAt || '').startsWith(m.key))
      .reduce((sum, inv) => sum + (Number(inv.grossTotal) || 0), 0);
    return salesSum;
  });

  const monthlyExpensesData = last6Months.map(m => {
    const billSum = bills
      .filter(b => (b.issueDate || b.createdAt || '').startsWith(m.key))
      .reduce((sum, b) => sum + (Number(b.grossTotal) || 0), 0);
    const expSum = expenses
      .filter(e => (e.date || e.createdAt || '').startsWith(m.key))
      .reduce((sum, e) => sum + (Number(e.grossTotal) || 0), 0);
    return billSum + expSum;
  });

  // Calculate dynamic SVG coordinates for Sales and Expenses chart
  const maxVal = Math.max(...monthlySalesData, ...monthlyExpensesData, 100);
  const getSalesY = (val: number) => 140 - Math.round((val / maxVal) * 110);
  const salesPoints = monthlySalesData.map((val, i) => ({ x: 50 + i * 140, y: getSalesY(val) }));
  const expensePoints = monthlyExpensesData.map((val, i) => ({ x: 50 + i * 140, y: getSalesY(val) }));

  const salesPath = salesPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`, '');
  const salesArea = `${salesPath} L ${salesPoints[salesPoints.length - 1].x},140 L ${salesPoints[0].x},140 Z`;

  const expensePath = expensePoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`, '');
  const expenseArea = `${expensePath} L ${expensePoints[expensePoints.length - 1].x},140 L ${expensePoints[0].x},140 Z`;

  // Real Tax Calculations
  const totalTaxOnSales = invoices.reduce((sum, inv) => sum + (Number(inv.totalTax) || 0), 0);
  const totalTaxOnExpenses = bills.reduce((sum, b) => sum + (Number(b.totalTax) || 0), 0) + expenses.reduce((sum, e) => sum + (Number(e.totalTax) || 0), 0);
  const totalTaxToPay = Math.max(0, totalTaxOnSales - totalTaxOnExpenses);

  // Upcoming Invoices (unpaid sorted by due date)
  const upcomingInvoices = [...unpaidInvoices]
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
    .slice(0, 5);

  // Upcoming Bills (unpaid sorted by due date)
  const upcomingBills = [...unpaidBills]
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
    .slice(0, 5);

  return (
    <div className="flex flex-col h-screen bg-[#edf2f7] text-slate-800 overflow-hidden font-sans select-none text-xs">
      {/* 🛡️ TOP SUPER ADMIN IMPERSONATION BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white px-5 py-2 text-xs flex items-center justify-between border-b border-brand-500/30 shrink-0 z-50 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 rounded-full bg-brand-500/30 text-brand-300 border border-brand-400 flex items-center justify-center font-bold text-[10px]">
            🛡️
          </div>
          <div>
            <span className="text-slate-300 font-medium">SaaS Multi-Tenant Mode:</span> Active Workspace: <strong className="text-white">{tenant.companyName}</strong> &bull; Currency: <strong className="text-emerald-400">{currencyCode} ({currencySymbol})</strong> &bull; Plan: <strong className="text-brand-300 uppercase">{tenant.planId.replace('plan_', '')}</strong>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentUser?.role === 'superadmin' ? (
            <button
              onClick={exitImpersonation}
              className="px-3.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <LogOut className="w-3.5 h-3.5" /> Return to Super Admin Hub
            </button>
          ) : (
            <button
              onClick={logout}
              className="px-3.5 py-1 rounded-lg bg-slate-700 hover:bg-rose-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* ======================================================== */}
        {/* 🧭 LEFT SIDEBAR NAVIGATION (ACCURATE MONEYPEX SIDEBAR)   */}
        {/* ======================================================== */}
        <aside className="w-56 bg-[#001737] text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-900 overflow-y-auto">
          <div>
            {/* Top Brand Logo Item */}
            <div className="h-14 px-3 border-b border-slate-800/80 bg-[#00122e] flex items-center justify-between">
              <img 
                src={logoImg} 
                alt="Adwiselabs" 
                className="h-7 w-auto max-w-[130px] object-contain object-left brightness-0 invert"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.webp';
                }}
              />
              <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-sky-900/60 text-sky-300 font-bold border border-sky-700/50 truncate max-w-[70px]">
                {tenant.companyName}
              </span>
            </div>

            {/* Navigation List (Exact Moneypex/Adwiselabs Sidebar Structure) */}
            <nav className="p-2 space-y-0.5 text-[11px]">
              {/* 1. Dashboard */}
              <button
                onClick={() => setActiveMenu('dashboard')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md font-medium transition ${
                  activeMenu === 'dashboard'
                    ? 'bg-[#00264d] text-white shadow-sm font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              {/* 2. Contacts */}
              <button
                onClick={() => setActiveMenu('contacts')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md font-medium transition ${
                  activeMenu === 'contacts'
                    ? 'bg-[#00264d] text-white font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Contacts</span>
              </button>

              {/* 3. Catalog Dropdown */}
              <div>
                <button
                  onClick={() => toggleSection('catalog')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Catalog</span>
                  </div>
                  {expandedSections.catalog ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                </button>

                {expandedSections.catalog && (
                  <div className="pl-6 pr-2 py-0.5 space-y-0.5 text-[11px]">
                    {[
                      { id: 'catalog-dept', label: 'Department', icon: Building2 },
                      { id: 'catalog-mfg', label: 'Manufacturer', icon: Factory },
                      { id: 'catalog-region', label: 'Region', icon: Globe },
                      { id: 'catalog-category', label: 'Category', icon: Layers },
                      { id: 'catalog-locations', label: 'Locations', icon: MapPin },
                      { id: 'catalog-product', label: 'Product', icon: Package },
                    ].map(sub => {
                      const IconComp = sub.icon;
                      const isActive = activeMenu === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => setActiveMenu(sub.id)}
                          className={`w-full text-left px-2.5 py-1.5 rounded flex items-center space-x-2 text-[10.5px] transition ${
                            isActive ? 'bg-[#00264d] text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                          }`}
                        >
                          <IconComp className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. Expenses Dropdown */}
              <div>
                <button
                  onClick={() => toggleSection('expenses')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Expenses</span>
                  </div>
                  {expandedSections.expenses ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                </button>

                {expandedSections.expenses && (
                  <div className="pl-6 pr-2 py-0.5 space-y-0.5 text-[11px]">
                    {[
                      { id: 'exp-new-bill', label: 'New Bill', isPlus: true },
                      { id: 'exp-view-bills', label: 'View Bills', icon: Receipt },
                      { id: 'exp-view-exp', label: 'View Expenses', icon: CreditCard },
                      { id: 'exp-po', label: 'Purchase Order', icon: FileText },
                      { id: 'exp-debit-notes', label: 'Debit Notes', icon: Receipt },
                      { id: 'exp-recurring', label: 'Recurring Bills', icon: RotateCcw },
                      { id: 'exp-make-payments', label: 'Make Payments', icon: ArrowUpRight },
                    ].map(sub => {
                      const IconComp = sub.icon;
                      const isActive = activeMenu === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => setActiveMenu(sub.id)}
                          className={`w-full text-left px-2.5 py-1.5 rounded flex items-center space-x-2 text-[10.5px] transition ${
                            isActive ? 'bg-[#00264d] text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                          }`}
                        >
                          {sub.isPlus ? (
                            <Plus className="w-3.5 h-3.5 text-slate-400" />
                          ) : IconComp ? (
                            <IconComp className="w-3.5 h-3.5 text-slate-400" />
                          ) : null}
                          <span>{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 5. Sales Dropdown */}
              <div>
                <button
                  onClick={() => toggleSection('sales')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Sales</span>
                  </div>
                  {expandedSections.sales ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                </button>

                {expandedSections.sales && (
                  <div className="pl-6 pr-2 py-0.5 space-y-0.5 text-[11px]">
                    {[
                      { id: 'sales-new-inv', label: 'New Invoice', isPlus: true },
                      { id: 'sales-view-inv', label: 'View Invoices', icon: FileText },
                      { id: 'sales-quotation', label: 'Quotation', icon: FileText },
                      { id: 'sales-credit-notes', label: 'Credit Notes', icon: FileText },
                      { id: 'sales-recurring', label: 'Recurring Invoices', icon: RotateCcw },
                      { id: 'sales-receive-payments', label: 'Receive Payments', icon: CreditCard },
                      { id: 'sales-templates', label: 'Invoice Templates', icon: FileSpreadsheet },
                    ].map(sub => {
                      const IconComp = sub.icon;
                      const isActive = activeMenu === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => setActiveMenu(sub.id)}
                          className={`w-full text-left px-2.5 py-1.5 rounded flex items-center space-x-2 text-[10.5px] transition ${
                            isActive ? 'bg-[#00264d] text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                          }`}
                        >
                          {sub.isPlus ? (
                            <Plus className="w-3.5 h-3.5 text-slate-400" />
                          ) : IconComp ? (
                            <IconComp className="w-3.5 h-3.5 text-slate-400" />
                          ) : null}
                          <span>{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 6. Bank (Matching Highlighted in Screenshot) */}
              <button
                onClick={() => setActiveMenu('bank')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md font-medium transition ${
                  activeMenu === 'bank'
                    ? 'bg-[#00264d] text-white font-bold shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>Bank</span>
              </button>

              {/* 7. Projects */}
              <button
                onClick={() => setActiveMenu('projects')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md font-medium transition ${
                  activeMenu === 'projects' ? 'bg-[#00264d] text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span>Projects</span>
              </button>

              {/* 8. HR Dropdown */}
              <div>
                <button
                  onClick={() => toggleSection('hr')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <Users2 className="w-3.5 h-3.5" />
                    <span>HR</span>
                  </div>
                  {expandedSections.hr ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                </button>

                {expandedSections.hr && (
                  <div className="pl-6 pr-2 py-0.5 space-y-0.5 text-[11px]">
                    <button
                      onClick={() => setActiveMenu('hr-employees')}
                      className={`w-full text-left px-2.5 py-1.5 rounded flex items-center space-x-2 text-[10.5px] transition ${
                        activeMenu === 'hr-employees' ? 'bg-[#00264d] text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Employees</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 9. Manual Journal */}
              <button
                onClick={() => setActiveMenu('manual-journal')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md font-medium transition ${
                  activeMenu === 'manual-journal' ? 'bg-[#00264d] text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Manual Journal</span>
              </button>

              {/* 11. Reports */}
              <button
                onClick={() => setActiveMenu('reports')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md font-medium transition ${
                  activeMenu === 'reports' ? 'bg-[#00264d] text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Reports</span>
              </button>

              {/* 12. Settings */}
              <button
                onClick={() => setActiveMenu('settings')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md font-medium transition ${
                  activeMenu === 'settings' ? 'bg-[#00264d] text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <SettingsIcon className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>

              {/* 13. My Businesses */}
              <button
                onClick={() => setActiveMenu('my-businesses')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md font-medium transition ${
                  activeMenu === 'my-businesses' ? 'bg-[#00264d] text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>My Businesses</span>
              </button>
            </nav>
          </div>

          {/* User Account / Footer */}
          <div className="p-3 border-t border-slate-800 bg-[#001026] flex items-center justify-between text-[11px]">
            <div className="truncate">
              <span className="text-slate-400 block truncate">{tenant.adminUser.name}</span>
              <span className="text-emerald-400 font-bold">{currencyCode}</span>
            </div>
            <HelpCircle className="w-4 h-4 text-slate-500 hover:text-slate-300 cursor-pointer" />
          </div>
        </aside>

        {/* ======================================================== */}
        {/* 💻 MAIN WORKSPACE DASHBOARD VIEW (MATCHING SCREENSHOT)    */}
        {/* ======================================================== */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f4f7fa]">
          {/* Header Tab Bar */}
          <header className="h-10 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setActiveMenu('dashboard')}
                className={`px-3 py-1 rounded font-bold text-[11px] flex items-center gap-1.5 transition ${
                  activeMenu === 'dashboard'
                    ? 'bg-[#0070ba] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <LayoutDashboard className="w-3 h-3" /> Dashboard
              </button>

              {activeMenu !== 'dashboard' && (
                <div className="px-3 py-1 bg-slate-200 text-slate-800 rounded font-bold text-[11px] flex items-center gap-1.5 capitalize shadow-xs">
                  {activeMenu === 'contacts' && <Users className="w-3 h-3 text-[#0070ba]" />}
                  {activeMenu.replace('-', ' ')}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
            </div>
          </header>

          {/* Dashboard Scroll Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
            {activeMenu === 'dashboard' ? (
              <>
                {/* 1. ⚡ QUICK ACTIONS ROW */}
                <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-700 mb-3">Quick Actions</h3>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {[
                      { id: 'product', label: 'Product', icon: Package, target: 'catalog-product' },
                      { id: 'invoice', label: 'Invoice', icon: Receipt, target: 'sales-new-inv' },
                      { id: 'expense', label: 'Expense', icon: ShoppingCart, target: 'exp-new-bill' },
                      { id: 'opening_balance', label: 'Bank / Balance', icon: Landmark, target: 'bank' },
                      { id: 'receive_payment', label: 'Receive Payment', icon: ArrowDownLeft, target: 'sales-receive-payments' },
                      { id: 'make_payment', label: 'Make Payment', icon: ArrowUpRight, target: 'exp-make-payments' },
                    ].map(action => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          onClick={() => setActiveMenu(action.target)}
                          className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-sky-50/60 transition group text-center"
                        >
                          <div className="w-11 h-11 rounded-full bg-sky-50 group-hover:bg-[#0070ba] text-[#0070ba] group-hover:text-white border border-sky-200 group-hover:border-[#0070ba] flex items-center justify-center shadow-sm transition mb-1.5">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-700 group-hover:text-[#0070ba]">
                            {action.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. 📊 RECEIVABLES, PAYABLES & BANK ACCOUNT CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Receivables Card */}
                  <div 
                    onClick={() => setActiveMenu('sales-view-inv')}
                    className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between cursor-pointer hover:border-[#0070ba] transition"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-slate-700">Receivables</span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          Total {currencySymbol} {receivablesTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      {/* Current green bar */}
                      <div className="space-y-1 mt-2">
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Current</span>
                          <span>{currencySymbol} {receivablesCurrent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="w-full h-3.5 bg-slate-100 rounded-sm overflow-hidden flex items-center">
                          <div 
                            className="h-full bg-emerald-700 rounded-sm flex items-center justify-end px-1.5 text-[9px] font-bold text-white min-w-[20px] transition-all"
                            style={{ width: receivablesTotal > 0 ? `${Math.max(5, (receivablesCurrent / receivablesTotal) * 100)}%` : '0%' }}
                          >
                            {receivablesCurrent > 0 ? receivablesCurrent.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : ''}
                          </div>
                        </div>
                      </div>

                      {/* Overdue red bar */}
                      <div className="space-y-1 mt-2">
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Overdue</span>
                          <span>{currencySymbol} {receivablesOverdue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="w-full h-3.5 bg-slate-100 rounded-sm overflow-hidden flex items-center">
                          <div 
                            className="h-full bg-rose-700 rounded-sm flex items-center justify-center text-[9px] font-bold text-white min-w-[20px] transition-all"
                            style={{ width: receivablesTotal > 0 ? `${Math.max(5, (receivablesOverdue / receivablesTotal) * 100)}%` : '0%' }}
                          >
                            {receivablesOverdue > 0 ? receivablesOverdue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payables Card */}
                  <div 
                    onClick={() => setActiveMenu('exp-view-bills')}
                    className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between cursor-pointer hover:border-[#0070ba] transition"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-slate-700">Payables</span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          Total {currencySymbol} {payablesTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      {/* Current green bar */}
                      <div className="space-y-1 mt-2">
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Current</span>
                          <span>{currencySymbol} {payablesCurrent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="w-full h-3.5 bg-slate-100 rounded-sm overflow-hidden flex items-center">
                          <div 
                            className="h-full bg-emerald-800 rounded-sm flex items-center justify-end px-1.5 text-[9px] font-bold text-white min-w-[20px] transition-all"
                            style={{ width: payablesTotal > 0 ? `${Math.max(5, (payablesCurrent / payablesTotal) * 100)}%` : '0%' }}
                          >
                            {payablesCurrent > 0 ? payablesCurrent.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : ''}
                          </div>
                        </div>
                      </div>

                      {/* Overdue red bar */}
                      <div className="space-y-1 mt-2">
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Overdue</span>
                          <span>{currencySymbol} {payablesOverdue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="w-full h-3.5 bg-slate-100 rounded-sm overflow-hidden flex items-center">
                          <div 
                            className="h-full bg-rose-900 rounded-sm flex items-center justify-center text-[9px] font-bold text-white min-w-[20px] transition-all"
                            style={{ width: payablesTotal > 0 ? `${Math.max(5, (payablesOverdue / payablesTotal) * 100)}%` : '0%' }}
                          >
                            {payablesOverdue > 0 ? payablesOverdue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bank Account Widget */}
                  <div 
                    onClick={() => setActiveMenu('bank')}
                    className="bg-gradient-to-r from-[#003b73] to-[#001f4d] rounded-lg p-4 text-white shadow-sm flex flex-col justify-between relative overflow-hidden cursor-pointer hover:opacity-95 transition"
                  >
                    {primaryBank ? (
                      <>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-extrabold text-sm tracking-wide">{primaryBank.bankName}</h4>
                            <p className="text-[11px] text-sky-200 mt-0.5">{primaryBank.accountTitle}</p>
                            <p className="text-[10px] text-sky-300 font-mono mt-1">{primaryBank.iban || primaryBank.accountNumber}</p>
                          </div>
                          <div className="p-1 rounded bg-white/10 hover:bg-white/20">
                            <ChevronRight className="w-4 h-4 text-white" />
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/10 text-right">
                          <span className="text-[10px] text-sky-200 uppercase tracking-wider block">Adwiselabs Balance</span>
                          <span className="text-base font-extrabold text-white tracking-tight">
                            {currencyCode} {bankBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex flex-col justify-between py-1">
                        <div>
                          <div className="flex items-center gap-2">
                            <Landmark className="w-4 h-4 text-sky-300" />
                            <h4 className="font-extrabold text-sm tracking-wide">Bank Account</h4>
                          </div>
                          <p className="text-[11px] text-sky-200 mt-1">No primary bank connected yet</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveMenu('bank'); }}
                          className="mt-3 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded text-[11px] font-bold transition flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Connect Bank Account
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. 📈 SALES AND EXPENSES LINE & AREA GRAPH */}
                <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xs font-bold text-slate-700">Sales and Expenses</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold uppercase">
                        LAST 6 MONTHS
                      </span>
                    </div>

                    {/* Chart Legend */}
                    <div className="flex items-center space-x-4 text-[10px] font-semibold">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-3 h-1 bg-[#0070ba] rounded-full inline-block" />
                        <span className="text-slate-600">Expenses</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-3 h-1 bg-[#e05624] rounded-full inline-block" />
                        <span className="text-slate-600">Income</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Chart Render */}
                  <div className="h-44 w-full relative pt-2">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 800 150">
                      {/* Gridlines */}
                      <line x1="0" y1="20" x2="800" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="50" x2="800" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="80" x2="800" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="110" x2="800" y2="110" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="140" x2="800" y2="140" stroke="#e2e8f0" strokeWidth="1" />

                      {/* Area Fill for Income */}
                      <path
                        d={salesArea}
                        fill="rgba(224, 86, 36, 0.12)"
                      />

                      {/* Area Fill for Expense */}
                      <path
                        d={expenseArea}
                        fill="rgba(0, 112, 186, 0.08)"
                      />

                      {/* Expense Line (Blue) */}
                      <path
                        d={expensePath}
                        fill="none"
                        stroke="#0070ba"
                        strokeWidth="2.5"
                      />

                      {/* Income Line (Orange/Red) */}
                      <path
                        d={salesPath}
                        fill="none"
                        stroke="#e05624"
                        strokeWidth="2.5"
                      />

                      {/* Month Markers */}
                      {last6Months.map((m, i) => {
                        const x = 50 + i * 140;
                        return (
                          <text key={m.key} x={x} y="150" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
                            {m.label}
                          </text>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* 4. 📊 CASH FLOW & TAX INFORMATION ROW */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Cash Flow Bar Chart (2 cols) */}
                  <div className="md:col-span-2 bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xs font-bold text-slate-700">Cash Flow</h3>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold uppercase">
                          LAST 6 MONTHS
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-[10px] font-semibold">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 bg-[#0070ba] rounded-sm inline-block" />
                          <span className="text-slate-600">Expenses</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 bg-[#48bb78] rounded-sm inline-block" />
                          <span className="text-slate-600">Sales</span>
                        </div>
                      </div>
                    </div>

                    {/* Bar Chart Visualization */}
                    <div className="h-36 w-full flex items-end justify-between px-6 pt-3 border-b border-slate-200">
                      {last6Months.map((item, idx) => {
                        const expVal = monthlyExpensesData[idx] || 0;
                        const salesVal = monthlySalesData[idx] || 0;
                        const expHeight = maxVal > 0 ? Math.min(100, Math.round((expVal / maxVal) * 100)) : 0;
                        const salesHeight = maxVal > 0 ? Math.min(100, Math.round((salesVal / maxVal) * 100)) : 0;
                        
                        return (
                          <div key={item.key} className="flex flex-col items-center space-y-1">
                            <div className="flex items-end space-x-1 h-28">
                              <div
                                className="w-4 bg-[#0070ba] rounded-t-sm transition-all hover:opacity-80"
                                style={{ height: `${Math.max(expVal > 0 ? 8 : 2, expHeight)}%` }}
                                title={`Expenses: ${currencySymbol} ${expVal.toLocaleString()}`}
                              />
                              <div
                                className="w-4 bg-[#48bb78] rounded-t-sm transition-all hover:opacity-80"
                                style={{ height: `${Math.max(salesVal > 0 ? 8 : 2, salesHeight)}%` }}
                                title={`Sales: ${currencySymbol} ${salesVal.toLocaleString()}`}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold">{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* TAX Information Widget */}
                  <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <h3 className="text-xs font-bold text-slate-700 mb-2">TAX Information</h3>

                    <div className="space-y-3 divide-y divide-slate-100 text-xs">
                      {/* Row 1: Tax on Expenses */}
                      <div className="pt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                            <FileText className="w-3.5 h-3.5 text-[#0070ba]" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Total Tax on Expenses</span>
                            <span className="font-extrabold text-slate-800">
                              {currencySymbol} {totalTaxOnExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Tax on Sales */}
                      <div className="pt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                            <CreditCard className="w-3.5 h-3.5 text-[#0070ba]" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Total Tax on Sales</span>
                            <span className="font-extrabold text-slate-800">
                              {currencySymbol} {totalTaxOnSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Row 3: Total TAX to Pay */}
                      <div className="pt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                            <Landmark className="w-3.5 h-3.5 text-[#0070ba]" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Total TAX to Pay</span>
                            <span className="font-extrabold text-[#0070ba]">
                              {currencySymbol} {totalTaxToPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. 📋 UPCOMING BILLS & UPCOMING INVOICES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Upcoming Bills */}
                  <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-bold text-slate-700">Upcoming Bills</h3>
                      <button
                        onClick={() => setActiveMenu('exp-new-bill')}
                        className="text-[10.5px] text-[#0070ba] font-bold hover:underline flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" /> New Bill
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="text-slate-400 border-b border-slate-100">
                            <th className="py-1.5 font-semibold">Supplier</th>
                            <th className="py-1.5 font-semibold">Due Date</th>
                            <th className="py-1.5 font-semibold text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {upcomingBills.length > 0 ? (
                            upcomingBills.map(bill => (
                              <tr 
                                key={bill.id} 
                                onClick={() => setActiveMenu('exp-view-bills')}
                                className="hover:bg-slate-50 transition cursor-pointer border-b border-slate-50 last:border-0"
                              >
                                <td className="py-2 font-medium text-slate-700">{bill.supplierName || 'Supplier'}</td>
                                <td className="py-2 text-slate-500">{bill.dueDate || 'N/A'}</td>
                                <td className="py-2 text-right font-bold text-slate-800">
                                  {currencySymbol} {(bill.balance ?? bill.grossTotal ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr className="text-slate-400">
                              <td colSpan={3} className="py-4 text-center text-slate-400 text-[10.5px]">
                                No upcoming bills found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Upcoming Invoices */}
                  <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-bold text-slate-700">Upcoming Invoices</h3>
                      <button
                        onClick={() => setActiveMenu('sales-new-inv')}
                        className="text-[10.5px] text-[#0070ba] font-bold hover:underline flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" /> New Invoice
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="text-slate-400 border-b border-slate-100">
                            <th className="py-1.5 font-semibold">Customer</th>
                            <th className="py-1.5 font-semibold">Due Date</th>
                            <th className="py-1.5 font-semibold text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {upcomingInvoices.length > 0 ? (
                            upcomingInvoices.map(inv => (
                              <tr 
                                key={inv.id} 
                                onClick={() => setActiveMenu('sales-view-inv')}
                                className="hover:bg-slate-50 transition cursor-pointer"
                              >
                                <td className="py-2 font-medium text-slate-700">{inv.customerName || 'Customer'}</td>
                                <td className="py-2 text-slate-500">{inv.dueDate || 'N/A'}</td>
                                <td className="py-2 text-right font-bold text-slate-800">
                                  {currencySymbol} {(inv.balance ?? inv.grossTotal ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr className="text-slate-400">
                              <td colSpan={3} className="py-4 text-center text-slate-400 text-[10.5px]">
                                No upcoming invoices found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* 6. 🔔 SCHEDULED PAYMENT REMINDERS WIDGET (DASHBOARD ALERT) */}
                <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-800">Active Scheduled Payment Reminders</h3>
                    </div>
                    <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                      Automated Tracking
                    </span>
                  </div>

                  {(() => {
                    // Extract all active reminders
                    const activeRemindersList: {
                      id: string;
                      type: 'Bill' | 'Invoice';
                      number: string;
                      party: string;
                      reminderType: string;
                      reminderDate: string;
                      amount: number;
                      target: string;
                    }[] = [];

                    bills.forEach(b => {
                      try {
                        const rems = JSON.parse(localStorage.getItem(`adwiselabs_bill_reminders_${b.id}`) || '[]');
                        rems.forEach((r: any) => {
                          if (r.status === 'Active') {
                            activeRemindersList.push({
                              id: r.id,
                              type: 'Bill',
                              number: b.billNumber,
                              party: b.supplierName,
                              reminderType: r.reminderType,
                              reminderDate: r.reminderDate,
                              amount: Number(b.balance ?? b.grossTotal) || 0,
                              target: 'exp-view-bills'
                            });
                          }
                        });
                      } catch (e) {}
                    });

                    invoices.forEach(inv => {
                      try {
                        const rems = JSON.parse(localStorage.getItem(`adwiselabs_invoice_reminders_${inv.id}`) || '[]');
                        rems.forEach((r: any) => {
                          if (r.status === 'Active') {
                            activeRemindersList.push({
                              id: r.id,
                              type: 'Invoice',
                              number: inv.invoiceNumber,
                              party: inv.customerName,
                              reminderType: r.reminderType,
                              reminderDate: r.reminderDate,
                              amount: Number(inv.balance ?? inv.grossTotal) || 0,
                              target: 'sales-view-inv'
                            });
                          }
                        });
                      } catch (e) {}
                    });

                    if (activeRemindersList.length === 0) {
                      return (
                        <div className="py-6 text-center text-slate-400 text-xs bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                          <p className="font-medium">No payment reminders scheduled currently.</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Set reminders from <strong>Bills &bull; Manage (•••) &bull; Set Reminder</strong> or <strong>Invoices &bull; Set Reminder</strong>.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="overflow-x-auto border border-slate-100 rounded-lg">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#f8fafc] text-slate-600 font-semibold text-[10.5px] border-b border-slate-200">
                            <tr>
                              <th className="px-3.5 py-2">Document</th>
                              <th className="px-3.5 py-2">Party</th>
                              <th className="px-3.5 py-2">Reminder Type</th>
                              <th className="px-3.5 py-2">Reminder Date</th>
                              <th className="px-3.5 py-2 text-right">Balance</th>
                              <th className="px-3.5 py-2 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-[11px]">
                            {activeRemindersList.map(r => (
                              <tr key={r.id} className="hover:bg-slate-50 transition">
                                <td className="px-3.5 py-2.5 font-mono">
                                  <span className={`inline-block mr-1.5 px-1.5 py-0.5 text-[9.5px] font-bold rounded ${
                                    r.type === 'Bill' ? 'bg-orange-100 text-orange-800' : 'bg-sky-100 text-sky-800'
                                  }`}>
                                    {r.type}
                                  </span>
                                  <span className="font-bold text-slate-800">{r.number}</span>
                                </td>
                                <td className="px-3.5 py-2.5 font-medium text-slate-700">{r.party}</td>
                                <td className="px-3.5 py-2.5 text-slate-600">{r.reminderType}</td>
                                <td className="px-3.5 py-2.5 font-mono font-semibold text-amber-700">{r.reminderDate}</td>
                                <td className="px-3.5 py-2.5 text-right font-mono font-bold text-slate-900">
                                  {currencySymbol} {r.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-3.5 py-2.5 text-center">
                                  <button
                                    onClick={() => setActiveMenu(r.target)}
                                    className="px-2.5 py-1 bg-[#0070ba] hover:bg-sky-700 text-white rounded text-[10px] font-bold transition shadow-2xs cursor-pointer"
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </>
            ) : activeMenu === 'contacts' ? (
              <ContactsView currencyCode={currencyCode} currencySymbol={currencySymbol} />
            ) : activeMenu.startsWith('catalog') ? (
              <CatalogManagerView 
                key={activeMenu}
                initialTab={
                  activeMenu === 'catalog-mfg' ? 'manufacturer' :
                  activeMenu === 'catalog-region' ? 'region' :
                  activeMenu === 'catalog-category' ? 'category' :
                  activeMenu === 'catalog-locations' ? 'location' :
                  activeMenu === 'catalog-product' ? 'product' :
                  'department'
                }
                onNavigateToProduct={() => setActiveMenu('catalog-product')}
              />
            ) : activeMenu.startsWith('exp-') ? (
              <ExpensesManagerView
                key={activeMenu}
                initialTab={
                  activeMenu === 'exp-view-exp' ? 'expenses' :
                  activeMenu === 'exp-po' ? 'purchase-orders' :
                  activeMenu === 'exp-debit-notes' ? 'debit-notes' :
                  activeMenu === 'exp-recurring' ? 'recurring-bills' :
                  activeMenu === 'exp-make-payments' ? 'make-payments' :
                  'billing'
                }
                initialAction={activeMenu === 'exp-view-bills' || activeMenu === 'exp-view-exp' || activeMenu === 'exp-po' || activeMenu === 'exp-debit-notes' || activeMenu === 'exp-recurring' || activeMenu === 'exp-make-payments' ? 'list' : 'new'}
                onOpenAddContact={() => setActiveMenu('contacts')}
                currencyCode={currencyCode}
                currencySymbol={currencySymbol}
              />
            ) : activeMenu.startsWith('sales') ? (
              <SalesManagerView
                key={activeMenu}
                initialTab={
                  activeMenu === 'sales-quotation' ? 'quotations' :
                  activeMenu === 'sales-credit-notes' ? 'credit-notes' :
                  activeMenu === 'sales-recurring' ? 'recurring-invoices' :
                  activeMenu === 'sales-receive-payments' ? 'receive-payments' :
                  activeMenu === 'sales-templates' ? 'templates' :
                  'invoices'
                }
                initialAction={activeMenu === 'sales-view-inv' || activeMenu === 'sales-quotation' || activeMenu === 'sales-credit-notes' || activeMenu === 'sales-recurring' || activeMenu === 'sales-receive-payments' || activeMenu === 'sales-templates' ? 'list' : 'new'}
                onOpenAddContact={() => setActiveMenu('contacts')}
                currencyCode={currencyCode}
                currencySymbol={currencySymbol}
              />
            ) : activeMenu === 'bank' ? (
              <BankManagerView key={activeMenu} />
            ) : activeMenu === 'projects' ? (
              <ProjectsManagerView key={activeMenu} />
            ) : activeMenu.startsWith('hr') ? (
              <HRManagerView key={activeMenu} />
            ) : activeMenu === 'manual-journal' ? (
              <ManualJournalManagerView key={activeMenu} />
            ) : activeMenu === 'reports' ? (
              <ReportsManagerView key={activeMenu} companyName={tenant.companyName} currencyCode={currencyCode} currencySymbol={currencySymbol} />
            ) : activeMenu === 'settings' ? (
              <SettingsManagerView key={activeMenu} />
            ) : activeMenu === 'my-businesses' ? (
              <MyBusinessesView key={activeMenu} />
            ) : (
              /* Specific Submodule Placeholder (Waiting for user screenshot) */
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-2xl mx-auto my-10 shadow-sm space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#0070ba] flex items-center justify-center mx-auto border border-sky-200 shadow-sm">
                  <Receipt className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 capitalize">
                    {activeMenu.replace('-', ' ')} Module
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Please provide the screenshot for this section, and we will build the exact inputs, columns, validations, and operations!
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => setActiveMenu('dashboard')}
                    className="px-4 py-2 bg-[#0070ba] text-white text-xs font-bold rounded-lg shadow transition"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
