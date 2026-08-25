import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase, query, execute, isConnected } from './db';
import { 
  INITIAL_TENANTS, 
  INITIAL_PLANS, 
  INITIAL_SAAS_INVOICES, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_SYSTEM_SETTINGS 
} from '../src/data/initialData';
import { INITIAL_CONTACTS } from '../src/types/contact';
import { 
  INITIAL_DEPARTMENTS, 
  INITIAL_MANUFACTURERS, 
  INITIAL_REGIONS, 
  INITIAL_CATEGORIES, 
  INITIAL_LOCATIONS, 
  INITIAL_PRODUCTS, 
  INITIAL_UOM 
} from '../src/types/catalog';
import { INITIAL_INVOICES } from '../src/types/sales';
import { INITIAL_BILLS } from '../src/types/billing';
import { INITIAL_QUOTATIONS } from '../src/types/quotation';
import { INITIAL_CREDIT_NOTES } from '../src/types/creditNote';
import { INITIAL_DEBIT_NOTES } from '../src/types/debitNote';
import { INITIAL_CUSTOMER_PAYMENTS } from '../src/types/customerPayment';
import { INITIAL_BANKS } from '../src/types/bank';
import { INITIAL_PROJECTS } from '../src/types/project';
import { INITIAL_EMPLOYEES } from '../src/types/employee';
import { INITIAL_JOURNALS } from '../src/types/journal';
import { INITIAL_ORG_DETAILS, DEFAULT_TEMPLATE_CUSTOMIZATION } from '../src/types/settings';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory Fallback Cache when MySQL is connecting/offline
let memoryStore = {
  tenants: [...INITIAL_TENANTS],
  plans: [...INITIAL_PLANS],
  invoices: [...INITIAL_SAAS_INVOICES],
  logs: [...INITIAL_AUDIT_LOGS],
  settings: { ...INITIAL_SYSTEM_SETTINGS },
  contacts: [...INITIAL_CONTACTS],
  departments: [...INITIAL_DEPARTMENTS],
  manufacturers: [...INITIAL_MANUFACTURERS],
  regions: [...INITIAL_REGIONS],
  categories: [...INITIAL_CATEGORIES],
  uom: [...INITIAL_UOM],
  locations: [...INITIAL_LOCATIONS],
  products: [...INITIAL_PRODUCTS],
  salesInvoices: [...INITIAL_INVOICES],
  expenseBills: [...INITIAL_BILLS],
  quotations: [...INITIAL_QUOTATIONS],
  creditNotes: [...INITIAL_CREDIT_NOTES],
  debitNotes: [...INITIAL_DEBIT_NOTES],
  customerPayments: [...INITIAL_CUSTOMER_PAYMENTS],
  bankAccounts: [...INITIAL_BANKS],
  projects: [...INITIAL_PROJECTS],
  employees: [...INITIAL_EMPLOYEES],
  journals: [...INITIAL_JOURNALS],
  organizationDetails: { ...INITIAL_ORG_DETAILS },
  invoiceCustomization: { ...DEFAULT_TEMPLATE_CUSTOMIZATION }
};

// ==========================================================
// 1. HEALTH & SYSTEM STATUS
// ==========================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isConnected ? 'MySQL (Connected)' : 'Fallback Local Engine',
    port: PORT,
    timestamp: new Date().toISOString(),
    engine: isConnected ? 'mysql2_pool' : 'in_memory_persistence'
  });
});

// ==========================================================
// 2. TENANTS & CLIENT ORGANIZATIONS
// ==========================================================
app.get('/api/tenants', async (req, res) => {
  if (isConnected) {
    try {
      const rows = await query('SELECT * FROM tenants ORDER BY created_at DESC');
      const tenants = rows.map((r: any) => ({
        id: r.id,
        companyName: r.company_name,
        planId: r.plan_id,
        status: r.status,
        planExpiresAt: r.trial_ends_at,
        currency: r.currency,
        currencySymbol: r.currency_symbol,
        country: r.country,
        phone: r.phone,
        address: r.address,
        enabledModules: typeof r.modules === 'string' ? JSON.parse(r.modules) : (r.modules || {})
      }));
      return res.json(tenants);
    } catch (err: any) {
      console.error('Error fetching tenants from MySQL:', err.message);
    }
  }
  res.json(memoryStore.tenants);
});

app.post('/api/tenants', async (req, res) => {
  const newTenant = req.body;
  if (isConnected) {
    try {
      const subdomain = (newTenant.companyName || 'tenant').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
      await execute(`
        INSERT INTO tenants (id, company_name, subdomain, plan_id, status, trial_ends_at, currency, currency_symbol, country, phone, address, modules)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE company_name=VALUES(company_name), status=VALUES(status);
      `, [
        newTenant.id, newTenant.companyName, subdomain, newTenant.planId || 'p_starter', newTenant.status || 'trial',
        newTenant.planExpiresAt || '2026-12-31', newTenant.currency || 'PKR', newTenant.currencySymbol || 'Rs',
        newTenant.country || 'Pakistan', newTenant.phone || '', newTenant.address || '', JSON.stringify(newTenant.enabledModules || {})
      ]);
      return res.status(201).json(newTenant);
    } catch (err: any) {
      console.error('Error saving tenant to MySQL:', err.message);
    }
  }
  memoryStore.tenants.unshift(newTenant);
  res.status(201).json(newTenant);
});

// ==========================================================
// 3. CONTACTS (CUSTOMERS & SUPPLIERS)
// ==========================================================
app.get('/api/contacts', async (req, res) => {
  if (isConnected) {
    try {
      const rows = await query('SELECT * FROM contacts ORDER BY created_at DESC');
      return res.json(rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        businessName: r.business_name,
        email: r.email,
        phone: r.phone,
        status: r.status,
        type: r.type,
        openingBalance: Number(r.opening_balance) || 0,
        payables: Number(r.payables) || 0,
        receivables: Number(r.receivables) || 0,
        ntn: r.ntn,
        strn: r.strn,
        code: r.code,
        notes: r.notes,
        createdOn: r.created_on
      })));
    } catch (err: any) {
      console.error('Error fetching contacts from MySQL:', err.message);
    }
  }
  res.json(memoryStore.contacts);
});

app.post('/api/contacts', async (req, res) => {
  const c = req.body;
  if (isConnected) {
    try {
      await execute(`
        INSERT INTO contacts (id, name, business_name, email, phone, status, type, has_opening_balance, opening_balance, payables, receivables, ntn, strn, code, notes, created_on)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone), payables=VALUES(payables), receivables=VALUES(receivables), business_name=VALUES(business_name);
      `, [
        c.id, c.name, c.businessName || '', c.email || '', c.phone || '', c.status || 'active', c.type || 'customer',
        c.hasOpeningBalance ? 1 : 0, c.openingBalance || 0, c.payables || 0, c.receivables || 0, c.ntn || '', c.strn || '', c.code || '', c.notes || '', c.createdOn || ''
      ]);
      return res.status(201).json(c);
    } catch (err: any) {
      console.error('Error saving contact to MySQL:', err.message);
    }
  }
  memoryStore.contacts.unshift(c);
  res.status(201).json(c);
});

// ==========================================================
// 4. SALES INVOICES
// ==========================================================
app.get('/api/sales/invoices', async (req, res) => {
  if (isConnected) {
    try {
      const rows = await query('SELECT * FROM sales_invoices ORDER BY created_at DESC');
      return res.json(rows.map((r: any) => ({
        id: r.id,
        invoiceNumber: r.invoice_number,
        customerId: r.customer_id,
        customerName: r.customer_name,
        invoiceDate: r.invoice_date,
        dueDate: r.due_date,
        serialNumber: r.reference_no,
        referenceNumber: r.reference_no,
        grossTotal: Number(r.gross_total) || 0,
        totalTax: Number(r.tax_amount) || 0,
        taxTotal: Number(r.tax_amount) || 0,
        balance: Number(r.balance) || 0,
        status: r.status,
        items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || [])
      })));
    } catch (err: any) {
      console.error('Error fetching invoices from MySQL:', err.message);
    }
  }
  res.json(memoryStore.salesInvoices);
});

app.post('/api/sales/invoices', async (req, res) => {
  const inv = req.body;
  if (isConnected) {
    try {
      await execute(`
        INSERT INTO sales_invoices (id, invoice_number, customer_id, customer_name, invoice_date, due_date, reference_no, gross_total, tax_amount, balance, status, items)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE customer_name=VALUES(customer_name), gross_total=VALUES(gross_total), balance=VALUES(balance), status=VALUES(status);
      `, [
        inv.id, inv.invoiceNumber, inv.customerId || '', inv.customerName, inv.invoiceDate, inv.dueDate, inv.serialNumber || inv.referenceNumber || '',
        inv.grossTotal || 0, inv.totalTax || inv.taxTotal || 0, inv.balance || 0, inv.status || 'Draft', JSON.stringify(inv.items || [])
      ]);
      return res.status(201).json(inv);
    } catch (err: any) {
      console.error('Error saving invoice to MySQL:', err.message);
    }
  }
  memoryStore.salesInvoices.unshift(inv);
  res.status(201).json(inv);
});

app.delete('/api/sales/invoices/:id', async (req, res) => {
  const { id } = req.params;
  if (isConnected) {
    try {
      await execute('DELETE FROM sales_invoices WHERE id = ?', [id]);
      return res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting invoice from MySQL:', err.message);
    }
  }
  memoryStore.salesInvoices = memoryStore.salesInvoices.filter(i => i.id !== id);
  res.json({ success: true });
});

// ==========================================================
// 5. SALES QUOTATIONS
// ==========================================================
app.get('/api/sales/quotations', async (req, res) => {
  if (isConnected) {
    try {
      const rows = await query('SELECT * FROM sales_quotations ORDER BY created_at DESC');
      return res.json(rows.map((r: any) => ({
        id: r.id,
        quotationNumber: r.quotation_number,
        customerId: r.customer_id,
        customerName: r.customer_name,
        date: r.date,
        dueDate: r.expiry_date,
        referenceNo: r.reference_no,
        grossTotal: Number(r.gross_total) || 0,
        totalTax: Number(r.tax_amount) || 0,
        status: r.status,
        items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || [])
      })));
    } catch (err: any) {
      console.error('Error fetching quotations from MySQL:', err.message);
    }
  }
  res.json(memoryStore.quotations);
});

app.post('/api/sales/quotations', async (req, res) => {
  const quot = req.body;
  if (isConnected) {
    try {
      await execute(`
        INSERT INTO sales_quotations (id, quotation_number, customer_name, date, expiry_date, total, status, items)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE customer_name=VALUES(customer_name), total=VALUES(total), status=VALUES(status);
      `, [
        quot.id, quot.quotationNumber, quot.customerName, quot.date, quot.dueDate || '',
        quot.grossTotal || quot.total || 0, quot.status || 'Draft', JSON.stringify(quot.items || [])
      ]);
      return res.status(201).json(quot);
    } catch (err: any) {
      console.error('Error saving quotation to MySQL:', err.message);
    }
  }
  memoryStore.quotations.unshift(quot);
  res.status(201).json(quot);
});

app.delete('/api/sales/quotations/:id', async (req, res) => {
  const { id } = req.params;
  if (isConnected) {
    try {
      await execute('DELETE FROM sales_quotations WHERE id = ?', [id]);
      return res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting quotation from MySQL:', err.message);
    }
  }
  memoryStore.quotations = memoryStore.quotations.filter((q: any) => q.id !== id);
  res.json({ success: true });
});

// ==========================================================
// 6. CREDIT NOTES
// ==========================================================
app.get('/api/sales/credit-notes', async (req, res) => {
  if (isConnected) {
    try {
      const rows = await query('SELECT * FROM credit_notes ORDER BY created_at DESC');
      return res.json(rows.map((r: any) => ({
        id: r.id,
        creditNoteNumber: r.credit_note_number,
        customerId: r.customer_id,
        customerName: r.customer_name,
        date: r.date,
        grossTotal: Number(r.total) || 0,
        totalTax: 0,
        balance: Number(r.balance) || 0,
        status: r.status,
        refunds: [],
        items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || [])
      })));
    } catch (err: any) {
      console.error('Error fetching credit notes from MySQL:', err.message);
    }
  }
  res.json(memoryStore.creditNotes);
});

app.post('/api/sales/credit-notes', async (req, res) => {
  const cn = req.body;
  if (isConnected) {
    try {
      await execute(`
        INSERT INTO credit_notes (id, credit_note_number, customer_name, date, total, balance, status, items)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE customer_name=VALUES(customer_name), total=VALUES(total), balance=VALUES(balance), status=VALUES(status);
      `, [
        cn.id, cn.creditNoteNumber, cn.customerName, cn.date,
        cn.grossTotal || cn.total || 0, cn.balance || 0, cn.status || 'Refund',
        JSON.stringify(cn.items || [])
      ]);
      return res.status(201).json(cn);
    } catch (err: any) {
      console.error('Error saving credit note to MySQL:', err.message);
    }
  }
  memoryStore.creditNotes.unshift(cn);
  res.status(201).json(cn);
});

app.delete('/api/sales/credit-notes/:id', async (req, res) => {
  const { id } = req.params;
  if (isConnected) {
    try {
      await execute('DELETE FROM credit_notes WHERE id = ?', [id]);
      return res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting credit note from MySQL:', err.message);
    }
  }
  memoryStore.creditNotes = memoryStore.creditNotes.filter((c: any) => c.id !== id);
  res.json({ success: true });
});

// ==========================================================
// 7. EXPENSE BILLS
// ==========================================================
app.get('/api/expenses/bills', async (req, res) => {
  if (isConnected) {
    try {
      const rows = await query('SELECT * FROM expense_bills ORDER BY created_at DESC');
      return res.json(rows.map((r: any) => ({
        id: r.id,
        billNumber: r.bill_number,
        supplierName: r.vendor_name,
        issueDate: r.bill_date,
        dueDate: r.due_date,
        serialNumber: r.reference_no,
        grossTotal: Number(r.gross_total) || 0,
        totalTax: Number(r.tax_amount) || 0,
        balance: Number(r.balance) || 0,
        status: r.status,
        items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || [])
      })));
    } catch (err: any) {
      console.error('Error fetching bills from MySQL:', err.message);
    }
  }
  res.json(memoryStore.expenseBills);
});

app.post('/api/expenses/bills', async (req, res) => {
  const b = req.body;
  if (isConnected) {
    try {
      await execute(`
        INSERT INTO expense_bills (id, bill_number, vendor_name, bill_date, due_date, reference_no, gross_total, tax_amount, balance, status, items)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE vendor_name=VALUES(vendor_name), gross_total=VALUES(gross_total), balance=VALUES(balance), status=VALUES(status);
      `, [
        b.id, b.billNumber, b.supplierName || 'General Supplier', b.issueDate || '2026-07-15', b.dueDate, b.serialNumber || '',
        b.grossTotal || 0, b.totalTax || 0, b.balance || 0, b.status || 'Draft', JSON.stringify(b.items || [])
      ]);
      return res.status(201).json(b);
    } catch (err: any) {
      console.error('Error saving bill to MySQL:', err.message);
    }
  }
  memoryStore.expenseBills.unshift(b);
  res.status(201).json(b);
});

app.delete('/api/expenses/bills/:id', async (req, res) => {
  const { id } = req.params;
  if (isConnected) {
    try {
      await execute('DELETE FROM expense_bills WHERE id = ?', [id]);
      return res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting bill from MySQL:', err.message);
    }
  }
  memoryStore.expenseBills = memoryStore.expenseBills.filter(b => b.id !== id);
  res.json({ success: true });
});

// ==========================================================
// 7.5 DIRECT EXPENSES
// ==========================================================
app.get('/api/expenses/direct', async (req, res) => {
  if (isConnected) {
    try {
      const rows = await query('SELECT * FROM expenses ORDER BY created_at DESC');
      return res.json(rows.map((r: any) => ({
        id: r.id,
        date: r.expense_date,
        referenceNo: r.reference_no,
        paidThrough: r.paid_through,
        customer: r.customer || '',
        subtotal: Number(r.subtotal) || 0,
        totalTax: Number(r.tax_amount) || 0,
        grossTotal: Number(r.gross_total) || 0,
        isTaxInclusive: Boolean(r.is_tax_inclusive),
        status: r.status || 'Approved',
        items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || [])
      })));
    } catch (err: any) {
      console.error('Error fetching direct expenses from MySQL:', err.message);
    }
  }
  res.json((memoryStore as any).directExpenses || []);
});

app.post('/api/expenses/direct', async (req, res) => {
  const exp = req.body;
  if (isConnected) {
    try {
      await execute(`
        INSERT INTO expenses (id, expense_date, reference_no, paid_through, customer, subtotal, tax_amount, gross_total, is_tax_inclusive, status, items)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE paid_through=VALUES(paid_through), customer=VALUES(customer), gross_total=VALUES(gross_total), status=VALUES(status);
      `, [
        exp.id, exp.date || '', exp.referenceNo || '', exp.paidThrough || 'Cash in Hand', exp.customer || '',
        exp.subtotal || 0, exp.totalTax || 0, exp.grossTotal || 0, exp.isTaxInclusive ? 1 : 0, exp.status || 'Approved',
        JSON.stringify(exp.items || [])
      ]);
      return res.status(201).json(exp);
    } catch (err: any) {
      console.error('Error saving direct expense to MySQL:', err.message);
    }
  }
  if (!(memoryStore as any).directExpenses) (memoryStore as any).directExpenses = [];
  (memoryStore as any).directExpenses.unshift(exp);
  res.status(201).json(exp);
});

app.delete('/api/expenses/direct/:id', async (req, res) => {
  const { id } = req.params;
  if (isConnected) {
    try {
      await execute('DELETE FROM expenses WHERE id = ?', [id]);
      return res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting direct expense from MySQL:', err.message);
    }
  }
  if ((memoryStore as any).directExpenses) {
    (memoryStore as any).directExpenses = (memoryStore as any).directExpenses.filter((e: any) => e.id !== id);
  }
  res.json({ success: true });
});

// ==========================================================
// 7.6 PURCHASE ORDERS
// ==========================================================
app.get('/api/expenses/purchase-orders', async (req, res) => {
  if (isConnected) {
    try {
      const rows = await query('SELECT * FROM purchase_orders ORDER BY created_at DESC');
      return res.json(rows.map((r: any) => ({
        id: r.id,
        poNumber: r.po_number,
        supplierId: r.supplier_id,
        supplierName: r.supplier_name,
        poDate: r.po_date,
        dueDate: r.due_date,
        specialInstructions: r.special_instructions,
        total: Number(r.total) || 0,
        status: r.status || 'Draft',
        notes: r.notes,
        items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || [])
      })));
    } catch (err: any) {
      console.error('Error fetching purchase orders from MySQL:', err.message);
    }
  }
  res.json((memoryStore as any).purchaseOrders || []);
});

app.post('/api/expenses/purchase-orders', async (req, res) => {
  const po = req.body;
  if (isConnected) {
    try {
      await execute(`
        INSERT INTO purchase_orders (id, po_number, supplier_id, supplier_name, po_date, due_date, special_instructions, total, status, items, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE supplier_name=VALUES(supplier_name), total=VALUES(total), status=VALUES(status);
      `, [
        po.id, po.poNumber || '', po.supplierId || '', po.supplierName || 'Unknown Supplier',
        po.poDate || '', po.dueDate || '', po.specialInstructions || '', po.total || 0,
        po.status || 'Draft', JSON.stringify(po.items || []), po.notes || ''
      ]);
      return res.status(201).json(po);
    } catch (err: any) {
      console.error('Error saving purchase order to MySQL:', err.message);
    }
  }
  if (!(memoryStore as any).purchaseOrders) (memoryStore as any).purchaseOrders = [];
  (memoryStore as any).purchaseOrders.unshift(po);
  res.status(201).json(po);
});

app.delete('/api/expenses/purchase-orders/:id', async (req, res) => {
  const { id } = req.params;
  if (isConnected) {
    try {
      await execute('DELETE FROM purchase_orders WHERE id = ?', [id]);
      return res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting purchase order from MySQL:', err.message);
    }
  }
  if ((memoryStore as any).purchaseOrders) {
    (memoryStore as any).purchaseOrders = (memoryStore as any).purchaseOrders.filter((p: any) => p.id !== id);
  }
  res.json({ success: true });
});

// ==========================================================
// 7.7 DEBIT NOTES
// ==========================================================
app.get('/api/expenses/debit-notes', async (req, res) => {
  if (isConnected) {
    try {
      const rows = await query('SELECT * FROM debit_notes ORDER BY created_at DESC');
      return res.json(rows.map((r: any) => ({
        id: r.id,
        debitNoteNumber: r.debit_note_number,
        supplierId: r.supplier_id || '',
        supplierName: r.vendor_name,
        date: r.date,
        subtotal: Number(r.total) || 0,
        discount: 0,
        totalTax: 0,
        grossTotal: Number(r.total) || 0,
        balance: Number(r.balance) || 0,
        status: r.status || 'Refund',
        isTaxInclusive: false,
        items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || [])
      })));
    } catch (err: any) {
      console.error('Error fetching debit notes from MySQL:', err.message);
    }
  }
  res.json((memoryStore as any).debitNotes || []);
});

app.post('/api/expenses/debit-notes', async (req, res) => {
  const dn = req.body;
  if (isConnected) {
    try {
      await execute(`
        INSERT INTO debit_notes (id, debit_note_number, vendor_name, date, total, balance, status, items)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE vendor_name=VALUES(vendor_name), total=VALUES(total), balance=VALUES(balance), status=VALUES(status);
      `, [
        dn.id, dn.debitNoteNumber || '', dn.supplierName || 'General Vendor',
        dn.date || '', dn.grossTotal || dn.total || 0, dn.balance || 0,
        dn.status || 'Refund', JSON.stringify(dn.items || [])
      ]);
      return res.status(201).json(dn);
    } catch (err: any) {
      console.error('Error saving debit note to MySQL:', err.message);
    }
  }
  if (!(memoryStore as any).debitNotes) (memoryStore as any).debitNotes = [];
  (memoryStore as any).debitNotes.unshift(dn);
  res.status(201).json(dn);
});

app.delete('/api/expenses/debit-notes/:id', async (req, res) => {
  const { id } = req.params;
  if (isConnected) {
    try {
      await execute('DELETE FROM debit_notes WHERE id = ?', [id]);
      return res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting debit note from MySQL:', err.message);
    }
  }
  if ((memoryStore as any).debitNotes) {
    (memoryStore as any).debitNotes = (memoryStore as any).debitNotes.filter((d: any) => d.id !== id);
  }
  res.json({ success: true });
});

// ==========================================================
// 7.8 SUPPLIER PAYMENTS (MAKE PAYMENTS)
// ==========================================================
app.get('/api/expenses/supplier-payments', async (req, res) => {
  if (isConnected) {
    try {
      const rows = await query('SELECT * FROM supplier_payments ORDER BY created_at DESC');
      return res.json(rows.map((r: any) => ({
        id: r.id,
        referenceNo: r.reference_no,
        supplierId: r.supplier_id || '',
        supplierName: r.supplier_name,
        paymentDate: r.payment_date,
        paymentAccount: r.payment_account,
        paymentAmount: Number(r.payment_amount) || 0,
        withholdingTax: Number(r.withholding_tax) || 0,
        balance: Number(r.balance) || 0,
        status: r.status || 'Applied',
        notes: r.notes || '',
        linkedBills: typeof r.linked_bills === 'string' ? JSON.parse(r.linked_bills) : (r.linked_bills || [])
      })));
    } catch (err: any) {
      console.error('Error fetching supplier payments from MySQL:', err.message);
    }
  }
  res.json((memoryStore as any).supplierPayments || []);
});

app.post('/api/expenses/supplier-payments', async (req, res) => {
  const p = req.body;
  if (isConnected) {
    try {
      await execute(`
        INSERT INTO supplier_payments (id, reference_no, supplier_id, supplier_name, payment_date, payment_account, payment_amount, withholding_tax, balance, status, linked_bills, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE supplier_name=VALUES(supplier_name), payment_amount=VALUES(payment_amount), balance=VALUES(balance), status=VALUES(status);
      `, [
        p.id, p.referenceNo || '', p.supplierId || '', p.supplierName || 'General Supplier',
        p.paymentDate || '', p.paymentAccount || 'Cash in Hand', p.paymentAmount || 0,
        p.withholdingTax || 0, p.balance || 0, p.status || 'Applied',
        JSON.stringify(p.linkedBills || []), p.notes || ''
      ]);
      return res.status(201).json(p);
    } catch (err: any) {
      console.error('Error saving supplier payment to MySQL:', err.message);
    }
  }
  if (!(memoryStore as any).supplierPayments) (memoryStore as any).supplierPayments = [];
  (memoryStore as any).supplierPayments.unshift(p);
  res.status(201).json(p);
});

app.delete('/api/expenses/supplier-payments/:id', async (req, res) => {
  const { id } = req.params;
  if (isConnected) {
    try {
      await execute('DELETE FROM supplier_payments WHERE id = ?', [id]);
      return res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting supplier payment from MySQL:', err.message);
    }
  }
  if ((memoryStore as any).supplierPayments) {
    (memoryStore as any).supplierPayments = (memoryStore as any).supplierPayments.filter((p: any) => p.id !== id);
  }
  res.json({ success: true });
});

// ==========================================================
// 8. PRODUCTS & INVENTORY
// ==========================================================
app.get('/api/catalog/products', async (req, res) => {
  if (isConnected) {
    try {
      const rows = await query('SELECT * FROM products ORDER BY created_at DESC');
      return res.json(rows.map((r: any) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        categoryName: r.category_name,
        departmentName: r.department_name,
        purchasePrice: Number(r.purchase_price) || 0,
        salePrice: Number(r.sale_price) || 0,
        stock: Number(r.stock) || 0,
        trackStock: Boolean(r.track_stock),
        isActive: Boolean(r.is_active),
        location: r.location,
        unitOfMeasure: r.unit_of_measure,
        createdOn: r.created_on
      })));
    } catch (err: any) {
      console.error('Error fetching products from MySQL:', err.message);
    }
  }
  res.json(memoryStore.products);
});

app.post('/api/catalog/products', async (req, res) => {
  const p = req.body;
  if (isConnected) {
    try {
      await execute(`
        INSERT INTO products (id, code, name, category_name, department_name, purchase_price, sale_price, stock, track_stock, is_active, location, unit_of_measure, created_on)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name=VALUES(name), sale_price=VALUES(sale_price), stock=VALUES(stock), purchase_price=VALUES(purchase_price);
      `, [
        p.id, p.code || '', p.name, p.categoryName || '', p.departmentName || '',
        p.purchasePrice || 0, p.salePrice || 0, p.stock || 0, p.trackStock ? 1 : 0,
        p.isActive ? 1 : 0, p.location || '', p.unitOfMeasure || 'Pcs', p.createdOn || ''
      ]);
      return res.status(201).json(p);
    } catch (err: any) {
      console.error('Error saving product to MySQL:', err.message);
    }
  }
  memoryStore.products.unshift(p);
  res.status(201).json(p);
});

app.delete('/api/catalog/products/:id', async (req, res) => {
  const { id } = req.params;
  if (isConnected) {
    try {
      await execute('DELETE FROM products WHERE id = ?', [id]);
      return res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting product from MySQL:', err.message);
    }
  }
  memoryStore.products = memoryStore.products.filter(p => p.id !== id);
  res.json({ success: true });
});

// ==========================================================
// 8.1 CATALOG CATEGORIES
// ==========================================================
app.get('/api/catalog/categories', async (req, res) => {
  if (isConnected) {
    try {
      const rows = await query('SELECT * FROM catalog_categories ORDER BY created_at DESC');
      return res.json(rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        departmentName: r.department_name,
        departmentId: r.department_id,
        createdOn: r.created_on
      })));
    } catch (err: any) {
      console.error('Error fetching categories from MySQL:', err.message);
    }
  }
  res.json(memoryStore.categories);
});

app.post('/api/catalog/categories', async (req, res) => {
  const cat = req.body;
  if (isConnected) {
    try {
      await execute(`
        INSERT INTO catalog_categories (id, name, department_name, department_id, created_on)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name=VALUES(name), department_name=VALUES(department_name), department_id=VALUES(department_id);
      `, [
        cat.id,
        cat.name,
        cat.departmentName || '',
        cat.departmentId || '',
        cat.createdOn || ''
      ]);
      return res.status(201).json(cat);
    } catch (err: any) {
      console.error('Error saving category to MySQL:', err.message);
    }
  }
  const idx = memoryStore.categories.findIndex(c => c.id === cat.id);
  if (idx >= 0) memoryStore.categories[idx] = cat;
  else memoryStore.categories.unshift(cat);
  res.status(201).json(cat);
});

app.delete('/api/catalog/categories/:id', async (req, res) => {
  const { id } = req.params;
  if (isConnected) {
    try {
      await execute('DELETE FROM catalog_categories WHERE id = ?', [id]);
      return res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting category from MySQL:', err.message);
    }
  }
  memoryStore.categories = memoryStore.categories.filter(c => c.id !== id);
  res.json({ success: true });
});

// ==========================================================
// 8.2 CATALOG DEPARTMENTS
// ==========================================================
app.get('/api/catalog/departments', async (req, res) => {
  if (isConnected) {
    try {
      const rows = await query('SELECT * FROM catalog_departments ORDER BY created_at DESC');
      return res.json(rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        createdOn: r.created_on
      })));
    } catch (err: any) {
      console.error('Error fetching departments from MySQL:', err.message);
    }
  }
  res.json(memoryStore.departments);
});

app.post('/api/catalog/departments', async (req, res) => {
  const d = req.body;
  if (isConnected) {
    try {
      await execute(`
        INSERT INTO catalog_departments (id, name, created_on)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE name=VALUES(name);
      `, [d.id, d.name, d.createdOn || '']);
      return res.status(201).json(d);
    } catch (err: any) {
      console.error('Error saving department to MySQL:', err.message);
    }
  }
  const idx = memoryStore.departments.findIndex(item => item.id === d.id);
  if (idx >= 0) memoryStore.departments[idx] = d;
  else memoryStore.departments.unshift(d);
  res.status(201).json(d);
});

app.delete('/api/catalog/departments/:id', async (req, res) => {
  const { id } = req.params;
  if (isConnected) {
    try {
      await execute('DELETE FROM catalog_departments WHERE id = ?', [id]);
      return res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting department from MySQL:', err.message);
    }
  }
  memoryStore.departments = memoryStore.departments.filter(d => d.id !== id);
  res.json({ success: true });
});

// ==========================================================
// 8.3 CATALOG MANUFACTURERS
// ==========================================================
app.get('/api/catalog/manufacturers', async (req, res) => {
  if (isConnected) {
    try {
      const rows = await query('SELECT * FROM catalog_manufacturers ORDER BY created_at DESC');
      return res.json(rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        code: r.code,
        createdOn: r.created_on
      })));
    } catch (err: any) {
      console.error('Error fetching manufacturers from MySQL:', err.message);
    }
  }
  res.json(memoryStore.manufacturers);
});

app.post('/api/catalog/manufacturers', async (req, res) => {
  const m = req.body;
  if (isConnected) {
    try {
      await execute(`
        INSERT INTO catalog_manufacturers (id, name, code, created_on)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name=VALUES(name), code=VALUES(code);
      `, [m.id, m.name, m.code || '', m.createdOn || '']);
      return res.status(201).json(m);
    } catch (err: any) {
      console.error('Error saving manufacturer to MySQL:', err.message);
    }
  }
  const idx = memoryStore.manufacturers.findIndex(item => item.id === m.id);
  if (idx >= 0) memoryStore.manufacturers[idx] = m;
  else memoryStore.manufacturers.unshift(m);
  res.status(201).json(m);
});

app.delete('/api/catalog/manufacturers/:id', async (req, res) => {
  const { id } = req.params;
  if (isConnected) {
    try {
      await execute('DELETE FROM catalog_manufacturers WHERE id = ?', [id]);
      return res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting manufacturer from MySQL:', err.message);
    }
  }
  memoryStore.manufacturers = memoryStore.manufacturers.filter(m => m.id !== id);
  res.json({ success: true });
});

// ==========================================================
// 8.4 CATALOG REGIONS
// ==========================================================
app.get('/api/catalog/regions', async (req, res) => {
  if (isConnected) {
    try {
      const rows = await query('SELECT * FROM catalog_regions ORDER BY created_at DESC');
      return res.json(rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        parentRegion: r.parent_region,
        code: r.code,
        createdOn: r.created_on
      })));
    } catch (err: any) {
      console.error('Error fetching regions from MySQL:', err.message);
    }
  }
  res.json(memoryStore.regions);
});

app.post('/api/catalog/regions', async (req, res) => {
  const r = req.body;
  if (isConnected) {
    try {
      await execute(`
        INSERT INTO catalog_regions (id, name, parent_region, code, created_on)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name=VALUES(name), parent_region=VALUES(parent_region), code=VALUES(code);
      `, [r.id, r.name, r.parentRegion || '', r.code || '', r.createdOn || '']);
      return res.status(201).json(r);
    } catch (err: any) {
      console.error('Error saving region to MySQL:', err.message);
    }
  }
  const idx = memoryStore.regions.findIndex(item => item.id === r.id);
  if (idx >= 0) memoryStore.regions[idx] = r;
  else memoryStore.regions.unshift(r);
  res.status(201).json(r);
});

app.delete('/api/catalog/regions/:id', async (req, res) => {
  const { id } = req.params;
  if (isConnected) {
    try {
      await execute('DELETE FROM catalog_regions WHERE id = ?', [id]);
      return res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting region from MySQL:', err.message);
    }
  }
  memoryStore.regions = memoryStore.regions.filter(r => r.id !== id);
  res.json({ success: true });
});

// ==========================================================
// 8.5 CATALOG UNIT OF MEASURES (UOM)
// ==========================================================
app.get('/api/catalog/uom', async (req, res) => {
  if (isConnected) {
    try {
      const rows = await query('SELECT * FROM catalog_uom ORDER BY created_at DESC');
      return res.json(rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        symbol: r.symbol,
        createdOn: r.created_on
      })));
    } catch (err: any) {
      console.error('Error fetching UOM from MySQL:', err.message);
    }
  }
  res.json(memoryStore.uom);
});

app.post('/api/catalog/uom', async (req, res) => {
  const u = req.body;
  if (isConnected) {
    try {
      await execute(`
        INSERT INTO catalog_uom (id, name, symbol, created_on)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name=VALUES(name), symbol=VALUES(symbol);
      `, [u.id, u.name, u.symbol, u.createdOn || '']);
      return res.status(201).json(u);
    } catch (err: any) {
      console.error('Error saving UOM to MySQL:', err.message);
    }
  }
  const idx = memoryStore.uom.findIndex(item => item.id === u.id);
  if (idx >= 0) memoryStore.uom[idx] = u;
  else memoryStore.uom.unshift(u);
  res.status(201).json(u);
});

app.delete('/api/catalog/uom/:id', async (req, res) => {
  const { id } = req.params;
  if (isConnected) {
    try {
      await execute('DELETE FROM catalog_uom WHERE id = ?', [id]);
      return res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting UOM from MySQL:', err.message);
    }
  }
  memoryStore.uom = memoryStore.uom.filter(u => u.id !== id);
  res.json({ success: true });
});

// ==========================================================
// 8.6 CATALOG LOCATIONS
// ==========================================================
app.get('/api/catalog/locations', async (req, res) => {
  if (isConnected) {
    try {
      const rows = await query('SELECT * FROM catalog_locations ORDER BY created_at DESC');
      return res.json(rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        parentLocation: r.parent_location,
        code: r.code,
        createdOn: r.created_on
      })));
    } catch (err: any) {
      console.error('Error fetching locations from MySQL:', err.message);
    }
  }
  res.json(memoryStore.locations);
});

app.post('/api/catalog/locations', async (req, res) => {
  const loc = req.body;
  if (isConnected) {
    try {
      await execute(`
        INSERT INTO catalog_locations (id, name, parent_location, code, created_on)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name=VALUES(name), parent_location=VALUES(parent_location), code=VALUES(code);
      `, [loc.id, loc.name, loc.parentLocation || '', loc.code || '', loc.createdOn || '']);
      return res.status(201).json(loc);
    } catch (err: any) {
      console.error('Error saving location to MySQL:', err.message);
    }
  }
  const idx = memoryStore.locations.findIndex(item => item.id === loc.id);
  if (idx >= 0) memoryStore.locations[idx] = loc;
  else memoryStore.locations.unshift(loc);
  res.status(201).json(loc);
});

app.delete('/api/catalog/locations/:id', async (req, res) => {
  const { id } = req.params;
  if (isConnected) {
    try {
      await execute('DELETE FROM catalog_locations WHERE id = ?', [id]);
      return res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting location from MySQL:', err.message);
    }
  }
  memoryStore.locations = memoryStore.locations.filter(l => l.id !== id);
  res.json({ success: true });
});

// ==========================================================
// 8.5 CUSTOMER PAYMENTS & DEPOSITS
// ==========================================================
app.get('/api/sales/payments', async (req, res) => {
  if (isConnected) {
    try {
      const rows = await query('SELECT * FROM customer_payments ORDER BY created_at DESC');
      return res.json(rows.map((r: any) => ({
        id: r.id,
        referenceNo: r.reference_no,
        customerId: r.tenant_id,
        customerName: r.customer_name,
        paymentDate: r.payment_date,
        paymentAccount: r.payment_account,
        paymentAmount: Number(r.payment_amount) || 0,
        whtAmount: Number(r.wht_amount) || 0,
        balance: Number(r.balance) || 0,
        status: r.status,
        allocations: typeof r.allocations === 'string' ? JSON.parse(r.allocations) : (r.allocations || []),
        notes: r.notes,
        createdAt: r.created_at
      })));
    } catch (err: any) {
      console.error('Error fetching payments from MySQL:', err.message);
    }
  }
  res.json(memoryStore.customerPayments);
});

app.post('/api/sales/payments', async (req, res) => {
  const pay = req.body;
  if (isConnected) {
    try {
      await execute(`
        INSERT INTO customer_payments (id, reference_no, customer_name, payment_date, payment_account, payment_amount, wht_amount, balance, status, allocations, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE payment_amount=VALUES(payment_amount), status=VALUES(status);
      `, [
        pay.id, pay.referenceNo || `REF-${Date.now()}`, pay.customerName, pay.paymentDate,
        pay.paymentAccount || 'Cash In Hand', pay.paymentAmount || 0, pay.whtAmount || 0,
        pay.balance || 0, pay.status || 'Applied', JSON.stringify(pay.linkedInvoices || pay.allocations || []),
        pay.notes || ''
      ]);
      return res.status(201).json(pay);
    } catch (err: any) {
      console.error('Error saving payment to MySQL:', err.message);
    }
  }
  memoryStore.customerPayments.unshift(pay);
  res.status(201).json(pay);
});

app.delete('/api/sales/payments/:id', async (req, res) => {
  const { id } = req.params;
  if (isConnected) {
    try {
      await execute('DELETE FROM customer_payments WHERE id = ?', [id]);
      return res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting payment from MySQL:', err.message);
    }
  }
  memoryStore.customerPayments = memoryStore.customerPayments.filter((p: any) => p.id !== id);
  res.json({ success: true });
});

// ==========================================================
// 9. BANK ACCOUNTS
// ==========================================================
app.get('/api/bank/accounts', async (req, res) => {
  if (isConnected) {
    try {
      const rows = await query('SELECT * FROM bank_accounts ORDER BY created_at DESC');
      return res.json(rows.map((r: any) => ({
        id: r.id,
        bankName: r.bank_name,
        accountTitle: r.account_title,
        accountNumber: r.account_number,
        iban: r.iban,
        statementBalance: Number(r.statement_balance) || 0,
        adwiselabsBalance: Number(r.adwiselabs_balance) || 0,
        unreconciledBalance: 0,
        unreconciledTransactionsCount: 0,
        isActive: Boolean(r.is_active)
      })));
    } catch (err: any) {
      console.error('Error fetching bank accounts from MySQL:', err.message);
    }
  }
  res.json(memoryStore.bankAccounts);
});

app.post('/api/bank/accounts', async (req, res) => {
  const b = req.body;
  if (isConnected) {
    try {
      await execute(`
        INSERT INTO bank_accounts (id, bank_name, account_title, account_number, iban, statement_balance, adwiselabs_balance, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE bank_name=VALUES(bank_name), account_title=VALUES(account_title), account_number=VALUES(account_number), iban=VALUES(iban), statement_balance=VALUES(statement_balance), adwiselabs_balance=VALUES(adwiselabs_balance), is_active=VALUES(is_active);
      `, [
        b.id, b.bankName, b.accountTitle || '', b.accountNumber || '', b.iban || '',
        b.statementBalance || 0, b.adwiselabsBalance || 0, b.isActive !== false ? 1 : 0
      ]);
      return res.status(201).json(b);
    } catch (err: any) {
      console.error('Error saving bank account to MySQL:', err.message);
    }
  }
  const idx = memoryStore.bankAccounts.findIndex(item => item.id === b.id);
  if (idx >= 0) memoryStore.bankAccounts[idx] = b;
  else memoryStore.bankAccounts.unshift(b);
  res.status(201).json(b);
});

app.delete('/api/bank/accounts/:id', async (req, res) => {
  const { id } = req.params;
  if (isConnected) {
    try {
      await execute(`DELETE FROM bank_accounts WHERE id = ?`, [id]);
      return res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting bank account from MySQL:', err.message);
    }
  }
  memoryStore.bankAccounts = memoryStore.bankAccounts.filter(b => b.id !== id);
  res.json({ success: true });
});

// ==========================================================
// 10. PROJECTS
// ==========================================================
app.get('/api/projects', async (req, res) => {
  if (isConnected) {
    try {
      const rows = await query('SELECT * FROM projects ORDER BY created_at DESC');
      return res.json(rows.map((r: any) => ({
        id: r.id,
        projectName: r.project_name,
        status: r.status,
        estimatedCost: Number(r.estimated_cost) || 0,
        income: Number(r.income) || 0,
        cost: Number(r.cost) || 0,
        profit: Number(r.profit) || 0,
        startDate: r.start_date,
        endDate: r.end_date,
        isActive: Boolean(r.is_active)
      })));
    } catch (err: any) {
      console.error('Error fetching projects from MySQL:', err.message);
    }
  }
  res.json(memoryStore.projects);
});

// ==========================================================
// 11. EMPLOYEES
// ==========================================================
app.get('/api/employees', async (req, res) => {
  if (isConnected) {
    try {
      const rows = await query('SELECT * FROM employees ORDER BY created_at DESC');
      return res.json(rows.map((r: any) => ({
        id: r.id,
        employeeCode: r.employee_code,
        employeeName: r.employee_name,
        firstName: r.first_name,
        lastName: r.last_name,
        email: r.email,
        phoneNumber: r.phone_number,
        commissionOnSales: Number(r.commission_on_sales) || 0,
        createdOn: r.created_on,
        isActive: Boolean(r.is_active)
      })));
    } catch (err: any) {
      console.error('Error fetching employees from MySQL:', err.message);
    }
  }
  res.json(memoryStore.employees);
});

// ==========================================================
// 12. MANUAL JOURNALS
// ==========================================================
app.get('/api/journals', async (req, res) => {
  if (isConnected) {
    try {
      const rows = await query('SELECT * FROM manual_journals ORDER BY created_at DESC');
      return res.json(rows.map((r: any) => ({
        id: r.id,
        journalId: r.journal_id,
        narration: r.narration,
        date: r.date,
        createdDate: r.created_date,
        isTaxInclusive: Boolean(r.is_tax_inclusive),
        total: Number(r.total) || 0,
        status: r.status,
        items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || [])
      })));
    } catch (err: any) {
      console.error('Error fetching manual journals from MySQL:', err.message);
    }
  }
  res.json(memoryStore.journals);
});

// ==========================================================
// 13. ORGANIZATION DETAILS & SETTINGS
// ==========================================================
app.get('/api/organization', async (req, res) => {
  if (isConnected) {
    try {
      const rows = await query('SELECT * FROM organization_details LIMIT 1');
      if (rows.length > 0) {
        const r = rows[0];
        return res.json({
          firstName: r.first_name,
          businessName: r.business_name,
          tax: r.tax,
          accountEmail: r.account_email,
          organizationEmail: r.organization_email,
          taxNumber: r.tax_number,
          phone: r.phone,
          industry: r.industry,
          startingDate: r.starting_date,
          country: r.country,
          currency: r.currency,
          address: r.address,
          city: r.city,
          province: r.province,
          postCode: r.post_code,
          strn: r.strn,
          termsAndConditions: r.terms_and_conditions,
          logoUrl: r.logo_url,
          bankName: r.bank_name,
          iban: r.iban,
          accountTitle: r.account_title,
          accountNo: r.account_no,
          invoiceCustomization: typeof r.invoice_customization === 'string' ? JSON.parse(r.invoice_customization) : r.invoice_customization
        });
      }
    } catch (err: any) {
      console.error('Error fetching organization details from MySQL:', err.message);
    }
  }
  res.json({
    ...memoryStore.organizationDetails,
    invoiceCustomization: memoryStore.invoiceCustomization
  });
});

app.put('/api/organization', async (req, res) => {
  const data = req.body;
  if (isConnected) {
    try {
      // In a real app we'd have a tenant_id, but here we assume a single row for now
      await execute(`
        INSERT INTO organization_details (id, tenant_id, first_name, business_name, tax, account_email, organization_email, tax_number, phone, industry, starting_date, country, currency, address, city, province, post_code, strn, terms_and_conditions, logo_url, bank_name, iban, account_title, account_no, invoice_customization)
        VALUES ('org_1', 'tenant_1', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          first_name=VALUES(first_name), business_name=VALUES(business_name), tax=VALUES(tax), account_email=VALUES(account_email), organization_email=VALUES(organization_email), tax_number=VALUES(tax_number), phone=VALUES(phone), industry=VALUES(industry), starting_date=VALUES(starting_date), country=VALUES(country), currency=VALUES(currency), address=VALUES(address), city=VALUES(city), province=VALUES(province), post_code=VALUES(post_code), strn=VALUES(strn), terms_and_conditions=VALUES(terms_and_conditions), logo_url=VALUES(logo_url), bank_name=VALUES(bank_name), iban=VALUES(iban), account_title=VALUES(account_title), account_no=VALUES(account_no), invoice_customization=VALUES(invoice_customization)
      `, [
        data.firstName || '', data.businessName || '', data.tax || '', data.accountEmail || '', data.organizationEmail || '', data.taxNumber || '', data.phone || '', data.industry || '', data.startingDate || '', data.country || '', data.currency || '', data.address || '', data.city || '', data.province || '', data.postCode || '', data.strn || '', data.termsAndConditions || '', data.logoUrl || '', data.bankName || '', data.iban || '', data.accountTitle || '', data.accountNo || '', JSON.stringify(data.invoiceCustomization || {})
      ]);
      return res.json({ success: true, data });
    } catch (err: any) {
      console.error('Error saving organization details to MySQL:', err.message);
      return res.status(500).json({ error: 'Failed to save to database' });
    }
  }
  // In-memory update
  if (data.invoiceCustomization) {
    memoryStore.invoiceCustomization = data.invoiceCustomization;
  }
  memoryStore.organizationDetails = { ...memoryStore.organizationDetails, ...data };
  delete memoryStore.organizationDetails.invoiceCustomization; // Keep separate in memory
  res.json({ success: true, data });
});


// Start Server & Connect to MySQL
async function start() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Adwiselabs SaaS & ERP API Server running at http://localhost:${PORT}`);
    console.log(`📊 Connected to MySQL Database 'adwiselabs_saas'`);
  });
}

start();
