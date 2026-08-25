import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'Bestfather@51';
const DB_NAME = process.env.DB_NAME || 'adwiselabs_saas';
const API_BASE_URL = 'http://localhost:5000/api';

async function runEndToEndTests() {
  console.log(`=============================================================`);
  console.log(`🧪 RUNNING FULL MODULE DATABASE PERSISTENCE TESTS (MYSQL)`);
  console.log(`=============================================================\n`);

  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
  });

  const timestamp = Date.now();
  const testResults: { module: string; endpoint: string; table: string; status: string; details?: any }[] = [];

  // Helper for API POST
  async function postData(endpoint: string, payload: any) {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new Error(`API Error ${res.status}: ${await res.text()}`);
    }
    return await res.json();
  }

  // 1. TEST CONTACTS (Customer & Supplier)
  try {
    console.log(`▶ Testing 1. Contacts Module (Customers / Suppliers)...`);
    const contactPayload = {
      id: `cnt_e2e_${timestamp}`,
      name: 'Muhammad Tariq Khan',
      businessName: 'Tariq Electronics Ltd',
      email: 'tariq@tariqelectronics.com',
      phone: '0321-9988776',
      status: 'active',
      type: 'customer',
      hasOpeningBalance: true,
      openingBalance: 125000.00,
      payables: 0,
      receivables: 125000.00,
      ntn: 'NTN-8877665',
      strn: 'STRN-1122334',
      code: 'CUST-001',
      notes: 'VIP Commercial Wholesaler',
      createdOn: '18-Aug-2026'
    };
    await postData('/contacts', contactPayload);

    // Verify in MySQL
    const [rows]: any = await connection.query(
      `SELECT id, name, business_name, email, phone, receivables FROM contacts WHERE id = ?`,
      [contactPayload.id]
    );

    if (rows.length > 0 && rows[0].name === contactPayload.name) {
      testResults.push({
        module: '1. Contacts',
        endpoint: 'POST /api/contacts',
        table: 'contacts',
        status: 'PASSED ✅',
        details: rows[0]
      });
      console.log(`   ✅ Contact saved & verified in MySQL! ID: ${rows[0].id}`);
    } else {
      throw new Error('Record not found in MySQL contacts table');
    }
  } catch (err: any) {
    testResults.push({ module: '1. Contacts', endpoint: 'POST /api/contacts', table: 'contacts', status: `FAILED ❌ (${err.message})` });
    console.error(`   ❌ Failed: ${err.message}`);
  }

  // 2. TEST PRODUCTS & INVENTORY
  try {
    console.log(`▶ Testing 2. Products & Inventory Module...`);
    const productPayload = {
      id: `prod_e2e_${timestamp}`,
      code: 'SOLAR-550W',
      name: 'Longi Solar Panel 550W Hi-MO 5',
      categoryName: 'Solar Panels',
      departmentName: 'Renewable Energy',
      purchasePrice: 18500.00,
      salePrice: 22000.00,
      stock: 45,
      trackStock: true,
      isActive: true,
      location: 'Warehouse Main',
      unitOfMeasure: 'Pcs',
      createdOn: '18-Aug-2026'
    };
    await postData('/catalog/products', productPayload);

    const [rows]: any = await connection.query(
      `SELECT id, code, name, purchase_price, sale_price, stock FROM products WHERE id = ?`,
      [productPayload.id]
    );

    if (rows.length > 0 && rows[0].name === productPayload.name) {
      testResults.push({
        module: '2. Products / Inventory',
        endpoint: 'POST /api/catalog/products',
        table: 'products',
        status: 'PASSED ✅',
        details: rows[0]
      });
      console.log(`   ✅ Product saved & verified in MySQL! Code: ${rows[0].code}`);
    } else {
      throw new Error('Record not found in MySQL products table');
    }
  } catch (err: any) {
    testResults.push({ module: '2. Products', endpoint: 'POST /api/catalog/products', table: 'products', status: `FAILED ❌ (${err.message})` });
    console.error(`   ❌ Failed: ${err.message}`);
  }

  // 3. TEST SALES QUOTATIONS
  try {
    console.log(`▶ Testing 3. Sales Quotations Module...`);
    const quotationPayload = {
      id: `quot_e2e_${timestamp}`,
      quotationNumber: `QUOT-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: `cnt_e2e_${timestamp}`,
      customerName: 'Muhammad Tariq Khan',
      date: '18-Aug-2026',
      dueDate: '25-Aug-2026',
      referenceNo: 'REF-QUOT-099',
      grossTotal: 220000.00,
      totalTax: 39600.00,
      status: 'Draft',
      items: [
        { item: 'Longi Solar Panel 550W', qtyOrdered: 10, unitPrice: 22000, taxAmount: 39600, netAmount: 259600 }
      ]
    };
    await postData('/sales/quotations', quotationPayload);

    const [rows]: any = await connection.query(
      `SELECT id, quotation_number, customer_name, gross_total, status FROM sales_quotations WHERE id = ?`,
      [quotationPayload.id]
    );

    if (rows.length > 0 && rows[0].customer_name === quotationPayload.customerName) {
      testResults.push({
        module: '3. Sales Quotations',
        endpoint: 'POST /api/sales/quotations',
        table: 'sales_quotations',
        status: 'PASSED ✅',
        details: rows[0]
      });
      console.log(`   ✅ Quotation saved & verified in MySQL! Quotation No: ${rows[0].quotation_number}`);
    } else {
      throw new Error('Record not found in MySQL sales_quotations table');
    }
  } catch (err: any) {
    testResults.push({ module: '3. Quotations', endpoint: 'POST /api/sales/quotations', table: 'sales_quotations', status: `FAILED ❌ (${err.message})` });
    console.error(`   ❌ Failed: ${err.message}`);
  }

  // 4. TEST SALES INVOICES
  try {
    console.log(`▶ Testing 4. Sales Invoices Module...`);
    const invoicePayload = {
      id: `inv_e2e_${timestamp}`,
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerId: `cnt_e2e_${timestamp}`,
      customerName: 'Muhammad Tariq Khan',
      invoiceDate: '18-Aug-2026',
      dueDate: '28-Aug-2026',
      serialNumber: 'SR-INV-771',
      grossTotal: 259600.00,
      totalTax: 39600.00,
      balance: 259600.00,
      status: 'Receive Payment',
      items: [
        { itemDescription: 'Longi Solar Panel 550W', qty: 10, unitPrice: 22000, taxAmount: 39600, netAmount: 259600 }
      ]
    };
    await postData('/sales/invoices', invoicePayload);

    const [rows]: any = await connection.query(
      `SELECT id, invoice_number, customer_name, gross_total, balance, status FROM sales_invoices WHERE id = ?`,
      [invoicePayload.id]
    );

    if (rows.length > 0 && rows[0].invoice_number === invoicePayload.invoiceNumber) {
      testResults.push({
        module: '4. Sales Invoices',
        endpoint: 'POST /api/sales/invoices',
        table: 'sales_invoices',
        status: 'PASSED ✅',
        details: rows[0]
      });
      console.log(`   ✅ Invoice saved & verified in MySQL! Invoice No: ${rows[0].invoice_number}`);
    } else {
      throw new Error('Record not found in MySQL sales_invoices table');
    }
  } catch (err: any) {
    testResults.push({ module: '4. Invoices', endpoint: 'POST /api/sales/invoices', table: 'sales_invoices', status: `FAILED ❌ (${err.message})` });
    console.error(`   ❌ Failed: ${err.message}`);
  }

  // 5. TEST CREDIT NOTES & REFUNDS
  try {
    console.log(`▶ Testing 5. Credit Notes & Refunds Module...`);
    const cnPayload = {
      id: `cn_e2e_${timestamp}`,
      creditNoteNumber: `CN-000${Math.floor(10 + Math.random() * 90)}`,
      customerId: `cnt_e2e_${timestamp}`,
      customerName: 'Muhammad Tariq Khan',
      date: '18-Aug-2026',
      grossTotal: 22000.00,
      totalTax: 3960.00,
      balance: 22000.00,
      status: 'Refund',
      refunds: [],
      items: [{ itemDescription: '1x Damaged Unit Return', qty: 1, unitPrice: 22000, netAmount: 22000 }]
    };
    await postData('/sales/credit-notes', cnPayload);

    const [rows]: any = await connection.query(
      `SELECT id, credit_note_number, customer_name, gross_total, balance, status FROM credit_notes WHERE id = ?`,
      [cnPayload.id]
    );

    if (rows.length > 0 && rows[0].credit_note_number === cnPayload.creditNoteNumber) {
      testResults.push({
        module: '5. Credit Notes & Refunds',
        endpoint: 'POST /api/sales/credit-notes',
        table: 'credit_notes',
        status: 'PASSED ✅',
        details: rows[0]
      });
      console.log(`   ✅ Credit Note saved & verified in MySQL! CN No: ${rows[0].credit_note_number}`);
    } else {
      throw new Error('Record not found in MySQL credit_notes table');
    }
  } catch (err: any) {
    testResults.push({ module: '5. Credit Notes', endpoint: 'POST /api/sales/credit-notes', table: 'credit_notes', status: `FAILED ❌ (${err.message})` });
    console.error(`   ❌ Failed: ${err.message}`);
  }

  // 6. TEST EXPENSE BILLS
  try {
    console.log(`▶ Testing 6. Expense Bills Module...`);
    const billPayload = {
      id: `bill_e2e_${timestamp}`,
      billNumber: `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierName: 'National Logistics Carrier',
      issueDate: '18-Aug-2026',
      dueDate: '30-Aug-2026',
      serialNumber: 'SR-BILL-404',
      grossTotal: 45000.00,
      totalTax: 0.00,
      balance: 45000.00,
      status: 'Make Payment',
      items: [{ itemDescription: 'Heavy Freight Transportation', qty: 1, unitPrice: 45000, netAmount: 45000 }]
    };
    await postData('/expenses/bills', billPayload);

    const [rows]: any = await connection.query(
      `SELECT id, bill_number, vendor_name, gross_total, balance, status FROM expense_bills WHERE id = ?`,
      [billPayload.id]
    );

    if (rows.length > 0 && rows[0].bill_number === billPayload.billNumber) {
      testResults.push({
        module: '6. Expense Bills',
        endpoint: 'POST /api/expenses/bills',
        table: 'expense_bills',
        status: 'PASSED ✅',
        details: rows[0]
      });
      console.log(`   ✅ Expense Bill saved & verified in MySQL! Bill No: ${rows[0].bill_number}`);
    } else {
      throw new Error('Record not found in MySQL expense_bills table');
    }
  } catch (err: any) {
    testResults.push({ module: '6. Bills', endpoint: 'POST /api/expenses/bills', table: 'expense_bills', status: `FAILED ❌ (${err.message})` });
    console.error(`   ❌ Failed: ${err.message}`);
  }

  // 7. TEST CUSTOMER PAYMENTS & DEPOSITS
  try {
    console.log(`▶ Testing 7. Customer Payments & Deposits Module...`);
    const payPayload = {
      id: `pay_e2e_${timestamp}`,
      referenceNo: `PAY-REC-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: `cnt_e2e_${timestamp}`,
      customerName: 'Muhammad Tariq Khan',
      paymentDate: '18-Aug-2026',
      paymentAccount: 'Meezan Bank - Main Operations',
      paymentAmount: 150000.00,
      whtAmount: 1500.00,
      balance: 0.00,
      status: 'Applied',
      notes: 'Cheque deposit verified'
    };
    await postData('/sales/payments', payPayload);

    const [rows]: any = await connection.query(
      `SELECT id, reference_no, customer_name, payment_amount, payment_account, status FROM customer_payments WHERE id = ?`,
      [payPayload.id]
    );

    if (rows.length > 0 && rows[0].reference_no === payPayload.referenceNo) {
      testResults.push({
        module: '7. Customer Payments',
        endpoint: 'POST /api/sales/payments',
        table: 'customer_payments',
        status: 'PASSED ✅',
        details: rows[0]
      });
      console.log(`   ✅ Customer Payment saved & verified in MySQL! Ref: ${rows[0].reference_no}`);
    } else {
      throw new Error('Record not found in MySQL customer_payments table');
    }
  } catch (err: any) {
    testResults.push({ module: '7. Payments', endpoint: 'POST /api/sales/payments', table: 'customer_payments', status: `FAILED ❌ (${err.message})` });
    console.error(`   ❌ Failed: ${err.message}`);
  }

  console.log(`\n=============================================================`);
  console.log(`📊 FINAL SUMMARY OF TESTED MODULES`);
  console.log(`=============================================================`);
  console.table(testResults.map(r => ({
    Module: r.module,
    Endpoint: r.endpoint,
    'MySQL Table': r.table,
    Status: r.status
  })));

  await connection.end();
}

runEndToEndTests().catch(err => {
  console.error('Test script crashed:', err);
  process.exit(1);
});
