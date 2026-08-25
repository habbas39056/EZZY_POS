import type { Invoice } from '../types/sales';
import type { Bill } from '../types/billing';
import type { CustomerPayment } from '../types/customerPayment';
import type { SupplierPayment } from '../types/payment';

// Utility to fetch items from localStorage safely
export const fetchStorageData = <T>(key: string, fallback: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
};

const isDateInSelectedMonth = (dateString: string, selectedMonthStr: string) => {
  if (!selectedMonthStr) return true;
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return true;
  const parts = selectedMonthStr.split(' ');
  if (parts.length !== 2) return true;
  const [monthName, year] = parts;
  const targetYear = parseInt(year);
  const targetMonthIndex = new Date(`${monthName} 1, 2000`).getMonth();
  return d.getFullYear() === targetYear && d.getMonth() === targetMonthIndex;
};

export function generateProfitAndLoss(startDate: string, endDate: string) {
  const invoices = fetchStorageData<Invoice[]>('adwiselabs_invoices', []);
  const bills = fetchStorageData<Bill[]>('adwiselabs_bills', []);

  // Simplified filtering by Date, usually you'd parse dates properly.
  // For this context we'll do a simple aggregate.
  
  // Real logic: sum grossTotal of paid and unpaid invoices for revenue
  const totalSales = invoices.reduce((acc, inv) => acc + (Number(inv.grossTotal) || 0), 0);
  
  // Actually, you might calculate COGS from items or fixed % for demo if not available.
  // We'll use 62% for now to maintain the previous demo look, unless real COGS data exists.
  const totalCogs = totalSales * 0.62; 
  const grossProfit = totalSales - totalCogs;

  const totalOperatingExp = bills.reduce((acc, b) => acc + (Number(b.grossTotal) || 0), 0);
  const netProfit = grossProfit - totalOperatingExp;

  return { totalSales, totalCogs, grossProfit, totalOperatingExp, netProfit };
}

export function generateTrialBalance() {
  const invoices = fetchStorageData<Invoice[]>('adwiselabs_invoices', []);
  const bills = fetchStorageData<Bill[]>('adwiselabs_bills', []);
  const customerPayments = fetchStorageData<CustomerPayment[]>('adwiselabs_customer_payments', []);
  const supplierPayments = fetchStorageData<SupplierPayment[]>('adwiselabs_supplier_payments', []);

  const totalReceivables = invoices.reduce((acc, inv) => acc + (Number(inv.balance) || 0), 0);
  const totalPayables = bills.reduce((acc, b) => acc + (Number(b.balance) || 0), 0);
  
  const totalSales = invoices.reduce((acc, inv) => acc + (Number(inv.grossTotal) || 0), 0);
  const totalPurchases = bills.reduce((acc, b) => acc + (Number(b.grossTotal) || 0), 0);

  const cashInHand = customerPayments.reduce((acc, p) => acc + (Number(p.paymentAmount) || 0), 0) - supplierPayments.reduce((acc, p) => acc + (Number(p.paymentAmount) || 0), 0) + 100000;

  return [
    { code: '1000', name: 'Cash in Hand (Store Ledger)', debit: cashInHand > 0 ? cashInHand : 0, credit: cashInHand < 0 ? Math.abs(cashInHand) : 0 },
    { code: '1100', name: 'Accounts Receivable (Customers)', debit: totalReceivables, credit: 0 },
    { code: '2000', name: 'Accounts Payable (Suppliers)', debit: 0, credit: totalPayables },
    { code: '4000', name: 'Sales Revenue & Trading Income', debit: 0, credit: totalSales },
    { code: '5000', name: 'Cost of Goods Sold (Purchases)', debit: totalPurchases, credit: 0 },
    // Plug account to balance if needed
    { code: '3000', name: 'Owners Capital / Paid Up Equity', debit: 0, credit: (totalSales - totalPurchases + cashInHand - totalReceivables + totalPayables) > 0 ? (totalSales - totalPurchases + cashInHand - totalReceivables + totalPayables) : 0 }
  ];
}

export function generateAgedReceivables(selectedMonthStr?: string) {
  const allInvoices = fetchStorageData<Invoice[]>('adwiselabs_invoices', []);
  const invoices = selectedMonthStr ? allInvoices.filter(inv => isDateInSelectedMonth(inv.invoiceDate, selectedMonthStr)) : allInvoices;
  
  const customerMap: Record<string, { current: number, m1: number, m2: number, m3: number, older: number, total: number }> = {};
  
  invoices.forEach(inv => {
    if (inv.balance > 0) {
      if (!customerMap[inv.customerName]) {
        customerMap[inv.customerName] = { current: 0, m1: 0, m2: 0, m3: 0, older: 0, total: 0 };
      }
      
      // Simple logic: we'll put all balance in current for now unless we do real date diffs.
      // Doing real date diffs:
      const invDate = new Date(inv.invoiceDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - invDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays <= 30) customerMap[inv.customerName].current += inv.balance;
      else if (diffDays <= 60) customerMap[inv.customerName].m1 += inv.balance;
      else if (diffDays <= 90) customerMap[inv.customerName].m2 += inv.balance;
      else if (diffDays <= 120) customerMap[inv.customerName].m3 += inv.balance;
      else customerMap[inv.customerName].older += inv.balance;
      
      customerMap[inv.customerName].total += inv.balance;
    }
  });

  return Object.keys(customerMap).map(name => ({
    name,
    current: customerMap[name].current || '-',
    m1: customerMap[name].m1 || '-',
    m2: customerMap[name].m2 || '-',
    m3: customerMap[name].m3 || '-',
    older: customerMap[name].older || '-',
    total: customerMap[name].total
  }));
}

export function generateAgedPayables(selectedMonthStr?: string) {
  const allBills = fetchStorageData<Bill[]>('adwiselabs_bills', []);
  const bills = selectedMonthStr ? allBills.filter(bill => isDateInSelectedMonth(bill.issueDate, selectedMonthStr)) : allBills;
  
  const supplierMap: Record<string, { current: number, m1: number, m2: number, m3: number, older: number, total: number }> = {};
  
  bills.forEach(bill => {
    if (bill.balance > 0) {
      if (!supplierMap[bill.supplierName]) {
        supplierMap[bill.supplierName] = { current: 0, m1: 0, m2: 0, m3: 0, older: 0, total: 0 };
      }
      
      const billDate = new Date(bill.issueDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - billDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays <= 30) supplierMap[bill.supplierName].current += bill.balance;
      else if (diffDays <= 60) supplierMap[bill.supplierName].m1 += bill.balance;
      else if (diffDays <= 90) supplierMap[bill.supplierName].m2 += bill.balance;
      else if (diffDays <= 120) supplierMap[bill.supplierName].m3 += bill.balance;
      else supplierMap[bill.supplierName].older += bill.balance;
      
      supplierMap[bill.supplierName].total += bill.balance;
    }
  });

  return Object.keys(supplierMap).map(name => ({
    name,
    current: supplierMap[name].current || '-',
    m1: supplierMap[name].m1 || '-',
    m2: supplierMap[name].m2 || '-',
    m3: supplierMap[name].m3 || '-',
    older: supplierMap[name].older || '-',
    total: supplierMap[name].total
  }));
}

export function generateGenericReportData(reportId: string, startDate: string, endDate: string) {
  const invoices = fetchStorageData<Invoice[]>('adwiselabs_invoices', []).filter(inv => isDateInSelectedMonth(inv.invoiceDate, startDate));
  const bills = fetchStorageData<Bill[]>('adwiselabs_bills', []).filter(bill => isDateInSelectedMonth(bill.issueDate, startDate));

  let columns: string[] = [];
  let rows: any[][] = [];

  // Grouped logic for dynamic reports
  if (reportId.includes('sales') || reportId.includes('rec') || reportId.includes('cust')) {
    columns = ['Date', 'Invoice No', 'Customer Name', 'Total Amount', 'Balance', 'Status'];
    rows = invoices.map(inv => [
      inv.invoiceDate,
      inv.invoiceNumber,
      inv.customerName,
      inv.grossTotal,
      inv.balance,
      inv.status
    ]);
  } else if (reportId.includes('purchases') || reportId.includes('payables') || reportId.includes('supplier')) {
    columns = ['Date', 'Bill No', 'Supplier Name', 'Total Amount', 'Balance', 'Status'];
    rows = bills.map(b => [
      b.issueDate,
      b.billNumber,
      b.supplierName,
      b.grossTotal,
      b.balance,
      b.status
    ]);
  } else if (reportId.includes('inv_') || reportId.includes('item') || reportId.includes('stock')) {
    // Inventory placeholder (using mock logic since there might not be real inventory items in localStorage in this workspace context)
    const items = fetchStorageData<any[]>('adwiselabs_items', [
      { id: '1', name: 'Product A', qty: 150, price: 100 },
      { id: '2', name: 'Product B', qty: 30, price: 250 },
      { id: '3', name: 'Product C', qty: 5, price: 900 }
    ]);
    columns = ['Item ID', 'Item Name', 'In Stock', 'Unit Price', 'Total Value'];
    rows = items.map(item => [
      item.id,
      item.name,
      item.qty,
      item.price,
      (item.qty * item.price).toFixed(2)
    ]);
  } else {
    // Fallback for unknown reports (Employee, Tax, etc.)
    columns = ['Record Type', 'Date', 'Description', 'Amount'];
    rows = [
      ['System Log', new Date().toISOString().split('T')[0], `Placeholder data for ${reportId}`, 0.00]
    ];
  }

  return { columns, rows };
}
