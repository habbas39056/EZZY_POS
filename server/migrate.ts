import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
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
import { INITIAL_ORG_DETAILS } from '../src/types/settings';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'Bestfather@51';
const DB_NAME = process.env.DB_NAME || 'adwiselabs_saas';

async function migrateAndSeed() {
  console.log(`🔌 Connecting to MySQL server at ${DB_HOST}:${DB_PORT} as '${DB_USER}'...`);
  
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true
  });

  console.log(`🔨 Creating database '${DB_NAME}' if not exists...`);
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await connection.query(`USE \`${DB_NAME}\`;`);

  console.log(`🧱 Creating all ERP & SaaS relational tables in MySQL Workbench...`);

  // 1. Plans
  await connection.query(`
    CREATE TABLE IF NOT EXISTS plans (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      price_monthly DECIMAL(10,2) NOT NULL,
      price_annual DECIMAL(10,2) NOT NULL,
      max_users INT NOT NULL,
      max_invoices_per_month INT NOT NULL,
      storage_gb INT NOT NULL,
      custom_domain BOOLEAN DEFAULT FALSE,
      api_access BOOLEAN DEFAULT FALSE,
      priority_support BOOLEAN DEFAULT FALSE,
      is_popular BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Tenants
  await connection.query(`
    CREATE TABLE IF NOT EXISTS tenants (
      id VARCHAR(50) PRIMARY KEY,
      company_name VARCHAR(150) NOT NULL,
      subdomain VARCHAR(100) UNIQUE NOT NULL,
      plan_id VARCHAR(50) NOT NULL,
      status ENUM('active', 'trial', 'suspended', 'cancelled') DEFAULT 'trial',
      trial_ends_at VARCHAR(50),
      currency VARCHAR(10) DEFAULT 'PKR',
      currency_symbol VARCHAR(10) DEFAULT 'Rs',
      country VARCHAR(100) DEFAULT 'Pakistan',
      phone VARCHAR(50),
      address TEXT,
      logo_url TEXT,
      modules JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT
    );
  `);

  // 3. Contacts
  await connection.query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id VARCHAR(50) PRIMARY KEY,
      tenant_id VARCHAR(50),
      name VARCHAR(150) NOT NULL,
      business_name VARCHAR(150),
      email VARCHAR(150),
      phone VARCHAR(50),
      status ENUM('active', 'inactive') DEFAULT 'active',
      type ENUM('customer', 'supplier', 'both') DEFAULT 'customer',
      primary_address JSON,
      billing_address JSON,
      shipping_address JSON,
      has_opening_balance BOOLEAN DEFAULT FALSE,
      opening_balance DECIMAL(15,2) DEFAULT 0.00,
      opening_balance_type ENUM('debit', 'credit') DEFAULT 'debit',
      assigned_recovery_person VARCHAR(100),
      assigned_sale_person VARCHAR(100),
      website VARCHAR(150),
      ntn VARCHAR(50),
      strn VARCHAR(50),
      fbr_registration_no VARCHAR(50),
      code VARCHAR(50),
      notes TEXT,
      payables DECIMAL(15,2) DEFAULT 0.00,
      receivables DECIMAL(15,2) DEFAULT 0.00,
      created_on VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Products & Catalog
  await connection.query(`
    CREATE TABLE IF NOT EXISTS catalog_departments (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      created_on VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS catalog_manufacturers (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      code VARCHAR(50),
      created_on VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS catalog_regions (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      parent_region VARCHAR(150),
      code VARCHAR(50),
      created_on VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS catalog_categories (
      id VARCHAR(50) PRIMARY KEY,
      tenant_id VARCHAR(50),
      name VARCHAR(150) NOT NULL,
      department_name VARCHAR(150),
      department_id VARCHAR(50),
      image LONGTEXT,
      created_on VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS catalog_uom (
      id VARCHAR(50) PRIMARY KEY,
      tenant_id VARCHAR(50),
      name VARCHAR(100) NOT NULL,
      symbol VARCHAR(20) NOT NULL,
      created_on VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS catalog_locations (
      id VARCHAR(50) PRIMARY KEY,
      tenant_id VARCHAR(50),
      name VARCHAR(150) NOT NULL,
      parent_location VARCHAR(150),
      code VARCHAR(50),
      created_on VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(50) PRIMARY KEY,
      tenant_id VARCHAR(50),
      code VARCHAR(100),
      name VARCHAR(200) NOT NULL,
      category_name VARCHAR(150),
      department_name VARCHAR(150),
      purchase_price DECIMAL(15,2) DEFAULT 0.00,
      location VARCHAR(150),
      sale_price DECIMAL(15,2) DEFAULT 0.00,
      stock INT DEFAULT 0,
      opening_stock INT DEFAULT 0,
      track_stock BOOLEAN DEFAULT TRUE,
      is_active BOOLEAN DEFAULT TRUE,
      unit_of_measure VARCHAR(50) DEFAULT 'Pcs',
      description TEXT,
      variation_options JSON,
      warranty_details VARCHAR(255),
      image LONGTEXT,
      created_on VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure columns on existing live database tables
  const columnMigrations = [
    `ALTER TABLE products ADD COLUMN image LONGTEXT;`,
    `ALTER TABLE products ADD COLUMN description TEXT;`,
    `ALTER TABLE products ADD COLUMN warranty_details VARCHAR(255);`,
    `ALTER TABLE products ADD COLUMN variation_options JSON;`,
    `ALTER TABLE products ADD COLUMN opening_stock INT DEFAULT 0;`,
    `ALTER TABLE catalog_categories ADD COLUMN image LONGTEXT;`,
    `ALTER TABLE catalog_categories ADD COLUMN department_id VARCHAR(50);`
  ];
  for (const mig of columnMigrations) {
    try {
      await connection.query(mig);
    } catch {}
  }

  // 5. Sales & Invoices
  await connection.query(`
    CREATE TABLE IF NOT EXISTS sales_invoices (
      id VARCHAR(50) PRIMARY KEY,
      invoice_number VARCHAR(100) NOT NULL,
      customer_id VARCHAR(50),
      customer_name VARCHAR(150) NOT NULL,
      invoice_date VARCHAR(50) NOT NULL,
      due_date VARCHAR(50) NOT NULL,
      reference_no VARCHAR(100),
      gross_total DECIMAL(15,2) DEFAULT 0.00,
      tax_amount DECIMAL(15,2) DEFAULT 0.00,
      balance DECIMAL(15,2) DEFAULT 0.00,
      status VARCHAR(50) DEFAULT 'Draft',
      items JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS expense_bills (
      id VARCHAR(50) PRIMARY KEY,
      bill_number VARCHAR(100) NOT NULL,
      vendor_name VARCHAR(150) NOT NULL,
      bill_date VARCHAR(50) NOT NULL,
      due_date VARCHAR(50) NOT NULL,
      reference_no VARCHAR(100),
      gross_total DECIMAL(15,2) DEFAULT 0.00,
      tax_amount DECIMAL(15,2) DEFAULT 0.00,
      balance DECIMAL(15,2) DEFAULT 0.00,
      status VARCHAR(50) DEFAULT 'Draft',
      items JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sales_quotations (
      id VARCHAR(50) PRIMARY KEY,
      quotation_number VARCHAR(100) NOT NULL,
      customer_name VARCHAR(150) NOT NULL,
      date VARCHAR(50) NOT NULL,
      expiry_date VARCHAR(50),
      total DECIMAL(15,2) DEFAULT 0.00,
      status VARCHAR(50) DEFAULT 'Draft',
      items JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS credit_notes (
      id VARCHAR(50) PRIMARY KEY,
      credit_note_number VARCHAR(100) NOT NULL,
      customer_name VARCHAR(150) NOT NULL,
      date VARCHAR(50) NOT NULL,
      total DECIMAL(15,2) DEFAULT 0.00,
      balance DECIMAL(15,2) DEFAULT 0.00,
      status VARCHAR(50) DEFAULT 'Approved',
      items JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS debit_notes (
      id VARCHAR(50) PRIMARY KEY,
      debit_note_number VARCHAR(100) NOT NULL,
      vendor_name VARCHAR(150) NOT NULL,
      date VARCHAR(50) NOT NULL,
      total DECIMAL(15,2) DEFAULT 0.00,
      balance DECIMAL(15,2) DEFAULT 0.00,
      status VARCHAR(50) DEFAULT 'Approved',
      items JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS customer_payments (
      id VARCHAR(50) PRIMARY KEY,
      reference_no VARCHAR(100) NOT NULL,
      customer_name VARCHAR(150) NOT NULL,
      payment_date VARCHAR(50) NOT NULL,
      payment_account VARCHAR(150) NOT NULL,
      payment_amount DECIMAL(15,2) NOT NULL,
      wht_amount DECIMAL(15,2) DEFAULT 0.00,
      balance DECIMAL(15,2) DEFAULT 0.00,
      status VARCHAR(50) DEFAULT 'Applied',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS bank_accounts (
      id VARCHAR(50) PRIMARY KEY,
      bank_name VARCHAR(150) NOT NULL,
      account_title VARCHAR(150) NOT NULL,
      account_number VARCHAR(100) NOT NULL,
      iban VARCHAR(100) NOT NULL,
      statement_balance DECIMAL(15,2) DEFAULT 0.00,
      adwiselabs_balance DECIMAL(15,2) DEFAULT 0.00,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS projects (
      id VARCHAR(50) PRIMARY KEY,
      project_name VARCHAR(150) NOT NULL,
      status VARCHAR(50) DEFAULT 'In Progress',
      estimated_cost DECIMAL(15,2) DEFAULT 0.00,
      income DECIMAL(15,2) DEFAULT 0.00,
      cost DECIMAL(15,2) DEFAULT 0.00,
      profit DECIMAL(15,2) DEFAULT 0.00,
      start_date VARCHAR(50),
      end_date VARCHAR(50),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS employees (
      id VARCHAR(50) PRIMARY KEY,
      employee_code VARCHAR(50) NOT NULL,
      employee_name VARCHAR(150) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      email VARCHAR(150) NOT NULL,
      phone_number VARCHAR(50),
      commission_on_sales DECIMAL(5,2) DEFAULT 0.00,
      created_on VARCHAR(50),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS manual_journals (
      id VARCHAR(50) PRIMARY KEY,
      journal_id VARCHAR(50) NOT NULL,
      narration TEXT NOT NULL,
      date VARCHAR(50) NOT NULL,
      created_date VARCHAR(50) NOT NULL,
      is_tax_inclusive BOOLEAN DEFAULT FALSE,
      total DECIMAL(15,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'Posted',
      items JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS organization_details (
      id VARCHAR(50) PRIMARY KEY,
      first_name VARCHAR(100),
      business_name VARCHAR(150) NOT NULL,
      tax VARCHAR(100),
      account_email VARCHAR(150),
      organization_email VARCHAR(150),
      tax_number VARCHAR(50),
      phone VARCHAR(50),
      industry VARCHAR(100),
      starting_date VARCHAR(50),
      country VARCHAR(100) DEFAULT 'Pakistan',
      currency VARCHAR(50) DEFAULT 'Pakistani Rupee',
      address TEXT,
      city VARCHAR(100),
      province VARCHAR(100),
      post_code VARCHAR(50),
      strn VARCHAR(50),
      terms_and_conditions TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);

  console.log(`🌱 Seeding initial records into MySQL database...`);

  // Seed Plans
  for (const p of INITIAL_PLANS) {
    await connection.query(`
      INSERT INTO plans (id, name, price_monthly, price_annual, max_users, max_invoices_per_month, storage_gb, custom_domain, api_access, priority_support, is_popular)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE name=VALUES(name);
    `, [p.id, p.name, p.priceMonthly, p.priceYearly || p.priceMonthly * 10, p.maxUsers, p.maxInvoices === -1 ? 999999 : p.maxInvoices, Math.round(p.storageLimitMB / 1024), 1, 1, 1, p.isPopular ? 1 : 0]);
  }

  // Seed Tenants
  for (const t of INITIAL_TENANTS) {
    const subdomain = t.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
    await connection.query(`
      INSERT INTO tenants (id, company_name, subdomain, plan_id, status, trial_ends_at, currency, currency_symbol, country, phone, address, modules)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE company_name=VALUES(company_name);
    `, [
      t.id, t.companyName, subdomain, t.planId, t.status, t.planExpiresAt || '2026-12-31', 
      t.currency, t.currencySymbol, t.country, t.phone, t.address, JSON.stringify(t.enabledModules || {})
    ]);
  }

  // Seed Contacts
  for (const c of INITIAL_CONTACTS) {
    await connection.query(`
      INSERT INTO contacts (id, name, business_name, email, phone, status, type, has_opening_balance, opening_balance, payables, receivables, ntn, strn, code, notes, created_on)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE name=VALUES(name);
    `, [
      c.id, c.name, c.businessName || '', c.email || '', c.phone || '', c.status || 'active', c.type || 'customer',
      c.hasOpeningBalance ? 1 : 0, c.openingBalance || 0, c.payables || 0, c.receivables || 0, c.ntn || '', c.strn || '', c.code || '', c.notes || '', c.createdOn || ''
    ]);
  }

  // Seed Invoices
  for (const inv of INITIAL_INVOICES) {
    await connection.query(`
      INSERT INTO sales_invoices (id, invoice_number, customer_name, invoice_date, due_date, reference_no, gross_total, tax_amount, balance, status, items)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE customer_name=VALUES(customer_name);
    `, [
      inv.id, inv.invoiceNumber, inv.customerName, inv.invoiceDate, inv.dueDate, inv.serialNumber || (inv as any).referenceNumber || '',
      inv.grossTotal, inv.totalTax || 0, inv.balance, inv.status, JSON.stringify(inv.items || [])
    ]);
  }

  // Seed Bills
  for (const b of INITIAL_BILLS) {
    await connection.query(`
      INSERT INTO expense_bills (id, bill_number, vendor_name, bill_date, due_date, reference_no, gross_total, tax_amount, balance, status, items)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE vendor_name=VALUES(vendor_name);
    `, [
      b.id, b.billNumber, b.supplierName || 'General Supplier', b.issueDate || '2026-07-15', b.dueDate, b.serialNumber || '',
      b.grossTotal, b.totalTax || 0, b.balance, b.status, JSON.stringify(b.items || [])
    ]);
  }

  // Seed Bank Accounts
  for (const b of INITIAL_BANKS) {
    await connection.query(`
      INSERT INTO bank_accounts (id, bank_name, account_title, account_number, iban, statement_balance, adwiselabs_balance, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE bank_name=VALUES(bank_name);
    `, [b.id, b.bankName, b.accountTitle, b.accountNumber, b.iban, b.statementBalance, b.adwiselabsBalance, b.isActive ? 1 : 0]);
  }

  // Seed Projects
  for (const proj of INITIAL_PROJECTS) {
    await connection.query(`
      INSERT INTO projects (id, project_name, status, estimated_cost, income, cost, profit, start_date, end_date, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE project_name=VALUES(project_name);
    `, [proj.id, proj.projectName, proj.status, proj.estimatedCost, proj.income, proj.cost, proj.profit, proj.startDate, proj.endDate, proj.isActive ? 1 : 0]);
  }

  // Seed Employees
  for (const emp of INITIAL_EMPLOYEES) {
    await connection.query(`
      INSERT INTO employees (id, employee_code, employee_name, first_name, last_name, email, phone_number, commission_on_sales, created_on, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE employee_name=VALUES(employee_name);
    `, [emp.id, emp.employeeCode, emp.employeeName, emp.firstName, emp.lastName, emp.email, emp.phoneNumber, emp.commissionOnSales, emp.createdOn, emp.isActive ? 1 : 0]);
  }

  // Seed Journals
  for (const j of INITIAL_JOURNALS) {
    await connection.query(`
      INSERT INTO manual_journals (id, journal_id, narration, date, created_date, is_tax_inclusive, total, status, items)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE narration=VALUES(narration);
    `, [j.id, j.journalId, j.narration, j.date, j.createdDate, j.isTaxInclusive ? 1 : 0, j.total, j.status, JSON.stringify(j.items || [])]);
  }

  // Seed Organization Details
  await connection.query(`
    INSERT INTO organization_details (id, first_name, business_name, tax, account_email, organization_email, tax_number, phone, industry, starting_date, country, currency, address, city, province, post_code, strn, terms_and_conditions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE business_name=VALUES(business_name);
  `, [
    'org_main', INITIAL_ORG_DETAILS.firstName, INITIAL_ORG_DETAILS.businessName, INITIAL_ORG_DETAILS.tax,
    INITIAL_ORG_DETAILS.accountEmail, INITIAL_ORG_DETAILS.organizationEmail, INITIAL_ORG_DETAILS.taxNumber,
    INITIAL_ORG_DETAILS.phone, INITIAL_ORG_DETAILS.industry, INITIAL_ORG_DETAILS.startingDate,
    INITIAL_ORG_DETAILS.country, INITIAL_ORG_DETAILS.currency, INITIAL_ORG_DETAILS.address,
    INITIAL_ORG_DETAILS.city, INITIAL_ORG_DETAILS.province, INITIAL_ORG_DETAILS.postCode,
    INITIAL_ORG_DETAILS.strn, INITIAL_ORG_DETAILS.termsAndConditions
  ]);

  // Verification
  console.log(`\n======================================================`);
  console.log(`🎉 SUCCESS! Database 'adwiselabs_saas' created & seeded in MySQL!`);
  console.log(`======================================================`);

  const [tables] = await connection.query(`SHOW TABLES;`);
  console.log(`📊 Verified Tables in MySQL Workbench:`);
  console.log(tables);

  await connection.end();
}

migrateAndSeed().catch(err => {
  console.error(`❌ Migration Error:`, err.message);
  process.exit(1);
});
