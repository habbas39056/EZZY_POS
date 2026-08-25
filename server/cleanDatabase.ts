import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { INITIAL_PLANS, INITIAL_TENANTS } from '../src/data/initialData';
import { INITIAL_ORG_DETAILS } from '../src/types/settings';
import { INITIAL_UOM } from '../src/types/catalog';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'Bestfather@51';
const DB_NAME = process.env.DB_NAME || 'adwiselabs_saas';

async function cleanDatabase() {
  console.log(`🔌 Connecting to MySQL database '${DB_NAME}'...`);
  
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    multipleStatements: true
  });

  console.log(`🧹 Purging all dummy records from transaction & directory tables...`);

  // Disable FK checks temporarily for truncate
  await connection.query(`SET FOREIGN_KEY_CHECKS = 0;`);

  await connection.query(`TRUNCATE TABLE contacts;`);
  await connection.query(`TRUNCATE TABLE sales_invoices;`);
  await connection.query(`TRUNCATE TABLE expense_bills;`);
  await connection.query(`TRUNCATE TABLE sales_quotations;`);
  await connection.query(`TRUNCATE TABLE credit_notes;`);
  await connection.query(`TRUNCATE TABLE debit_notes;`);
  await connection.query(`TRUNCATE TABLE customer_payments;`);
  await connection.query(`TRUNCATE TABLE bank_accounts;`);
  await connection.query(`TRUNCATE TABLE projects;`);
  await connection.query(`TRUNCATE TABLE employees;`);
  await connection.query(`TRUNCATE TABLE manual_journals;`);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS scanned_documents (
      id VARCHAR(50) PRIMARY KEY,
      tenant_id VARCHAR(50),
      file_name VARCHAR(255) NOT NULL,
      upload_date VARCHAR(50) NOT NULL,
      file_size VARCHAR(50),
      detected_type VARCHAR(50),
      detected_vendor VARCHAR(150),
      detected_total DECIMAL(15,2) DEFAULT 0.00,
      confidence INT DEFAULT 95,
      status VARCHAR(50) DEFAULT 'Processed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await connection.query(`TRUNCATE TABLE scanned_documents;`);
  await connection.query(`TRUNCATE TABLE products;`);
  await connection.query(`TRUNCATE TABLE catalog_departments;`);
  await connection.query(`TRUNCATE TABLE catalog_categories;`);
  await connection.query(`TRUNCATE TABLE catalog_manufacturers;`);
  await connection.query(`TRUNCATE TABLE catalog_regions;`);
  await connection.query(`TRUNCATE TABLE catalog_locations;`);
  await connection.query(`TRUNCATE TABLE saas_invoices;`);
  await connection.query(`TRUNCATE TABLE audit_logs;`);
  await connection.query(`TRUNCATE TABLE tenants;`);
  await connection.query(`TRUNCATE TABLE plans;`);

  await connection.query(`SET FOREIGN_KEY_CHECKS = 1;`);

  console.log(`🌱 Seeding master plans & primary business organization...`);

  // Seed Plans
  for (const p of INITIAL_PLANS) {
    await connection.query(`
      INSERT INTO plans (id, name, price_monthly, price_annual, max_users, max_invoices_per_month, storage_gb, custom_domain, api_access, priority_support, is_popular)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `, [p.id, p.name, p.priceMonthly, p.priceYearly || 190, p.maxUsers, p.maxInvoices === -1 ? 999999 : p.maxInvoices, 10, 1, 1, 1, p.isPopular ? 1 : 0]);
  }

  // Seed Primary Tenant
  for (const t of INITIAL_TENANTS) {
    await connection.query(`
      INSERT INTO tenants (id, company_name, subdomain, plan_id, status, trial_ends_at, currency, currency_symbol, country, phone, address, modules)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `, [
      t.id, t.companyName, 'arkit-services', t.planId, t.status, '2027-01-01', 
      t.currency, t.currencySymbol, t.country, t.phone, t.address, JSON.stringify(t.enabledModules || {})
    ]);
  }

  // Seed Standard UOM
  for (const u of INITIAL_UOM) {
    await connection.query(`
      INSERT INTO catalog_uom (id, name, symbol, created_on)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE name=VALUES(name);
    `, [u.id, u.name, u.symbol, u.createdOn]);
  }

  // Seed Clean Organization Settings
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

  console.log(`\n======================================================`);
  console.log(`✅ SUCCESS! All dummy data has been wiped clean from MySQL!`);
  console.log(`======================================================`);

  await connection.end();
}

cleanDatabase().catch(err => {
  console.error(`❌ Cleanup Error:`, err.message);
  process.exit(1);
});
