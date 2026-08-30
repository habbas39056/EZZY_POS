-- ==========================================================
-- Adwiselabs SaaS Multi-Tenant Database Schema (MySQL)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS adwiselabs_saas;
USE adwiselabs_saas;

-- 1. Subscription Packages
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

-- 2. Tenant Organizations
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

-- 3. Users & Tenant Admins
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50),
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'tenant_admin', 'accountant', 'sales_manager', 'viewer') DEFAULT 'tenant_admin',
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- 4. SaaS Billing Invoices
CREATE TABLE IF NOT EXISTS saas_invoices (
  id VARCHAR(50) PRIMARY KEY,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  tenant_id VARCHAR(50) NOT NULL,
  tenant_name VARCHAR(150) NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  status ENUM('paid', 'overdue', 'pending') DEFAULT 'pending',
  issue_date VARCHAR(50) NOT NULL,
  due_date VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'Credit Card',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- 5. Audit Trail Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(50) PRIMARY KEY,
  timestamp VARCHAR(50) NOT NULL,
  actor_name VARCHAR(150) NOT NULL,
  actor_email VARCHAR(150) NOT NULL,
  actor_role VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_tenant VARCHAR(150),
  target_id VARCHAR(50),
  ip_address VARCHAR(50) DEFAULT '127.0.0.1',
  status ENUM('success', 'warning', 'error') DEFAULT 'success',
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. System Global Settings
CREATE TABLE IF NOT EXISTS system_settings (
  id INT PRIMARY KEY DEFAULT 1,
  platform_name VARCHAR(150) DEFAULT 'Adwiselabs SaaS Cloud Admin',
  support_email VARCHAR(150) DEFAULT 'support@adwiselabs.com',
  support_phone VARCHAR(50) DEFAULT '+1 (800) 555-0199',
  default_currency VARCHAR(10) DEFAULT 'USD',
  default_currency_symbol VARCHAR(10) DEFAULT '$',
  default_trial_days INT DEFAULT 14,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  allow_public_signups BOOLEAN DEFAULT TRUE,
  tax_rate_percent DECIMAL(5,2) DEFAULT 20.00,
  smtp_configured BOOLEAN DEFAULT TRUE,
  company_address TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. Contacts (Customers & Suppliers)
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
  contact_person_name VARCHAR(100),
  contact_person_phone VARCHAR(50),
  national_id VARCHAR(50),
  notes TEXT,
  payables DECIMAL(15,2) DEFAULT 0.00,
  receivables DECIMAL(15,2) DEFAULT 0.00,
  created_on VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- 8. Catalog Departments
CREATE TABLE IF NOT EXISTS catalog_departments (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50),
  name VARCHAR(150) NOT NULL,
  created_on VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Catalog Manufacturers
CREATE TABLE IF NOT EXISTS catalog_manufacturers (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50),
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50),
  created_on VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Catalog Regions
CREATE TABLE IF NOT EXISTS catalog_regions (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50),
  name VARCHAR(150) NOT NULL,
  parent_region VARCHAR(150),
  code VARCHAR(50),
  created_on VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Catalog Categories
CREATE TABLE IF NOT EXISTS catalog_categories (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50),
  name VARCHAR(150) NOT NULL,
  department_name VARCHAR(150),
  department_id VARCHAR(50),
  created_on VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Catalog Unit of Measures (UOM)
CREATE TABLE IF NOT EXISTS catalog_uom (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50),
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  created_on VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Catalog Locations / Warehouses
CREATE TABLE IF NOT EXISTS catalog_locations (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50),
  name VARCHAR(150) NOT NULL,
  parent_location VARCHAR(150),
  code VARCHAR(50),
  created_on VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Products & Inventory
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
  created_on VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Sales Invoices
CREATE TABLE IF NOT EXISTS sales_invoices (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50),
  invoice_number VARCHAR(100) NOT NULL,
  customer_id VARCHAR(50),
  customer_name VARCHAR(150) NOT NULL,
  invoice_date VARCHAR(50) NOT NULL,
  due_date VARCHAR(50) NOT NULL,
  reference_no VARCHAR(100),
  gross_total DECIMAL(15,2) DEFAULT 0.00,
  tax_amount DECIMAL(15,2) DEFAULT 0.00,
  discount_amount DECIMAL(15,2) DEFAULT 0.00,
  net_total DECIMAL(15,2) DEFAULT 0.00,
  paid_amount DECIMAL(15,2) DEFAULT 0.00,
  balance DECIMAL(15,2) DEFAULT 0.00,
  status ENUM('Draft', 'Awaiting Approval', 'Approved', 'Paid', 'Partially Paid', 'Overdue') DEFAULT 'Draft',
  items JSON,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. Supplier Bills / Expenses
CREATE TABLE IF NOT EXISTS expense_bills (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50),
  bill_number VARCHAR(100) NOT NULL,
  vendor_id VARCHAR(50),
  vendor_name VARCHAR(150) NOT NULL,
  bill_date VARCHAR(50) NOT NULL,
  due_date VARCHAR(50) NOT NULL,
  reference_no VARCHAR(100),
  gross_total DECIMAL(15,2) DEFAULT 0.00,
  tax_amount DECIMAL(15,2) DEFAULT 0.00,
  balance DECIMAL(15,2) DEFAULT 0.00,
  status ENUM('Draft', 'Awaiting Approval', 'Approved', 'Paid', 'Partially Paid', 'Overdue') DEFAULT 'Draft',
  items JSON,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16.5 Direct Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50),
  expense_date VARCHAR(50) NOT NULL,
  reference_no VARCHAR(100) NOT NULL,
  paid_through VARCHAR(150) NOT NULL,
  customer VARCHAR(150),
  subtotal DECIMAL(15,2) DEFAULT 0.00,
  tax_amount DECIMAL(15,2) DEFAULT 0.00,
  gross_total DECIMAL(15,2) DEFAULT 0.00,
  is_tax_inclusive BOOLEAN DEFAULT FALSE,
  status ENUM('Approved', 'Draft', 'Pending') DEFAULT 'Approved',
  items JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16.6 Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50),
  po_number VARCHAR(100) NOT NULL,
  supplier_id VARCHAR(50),
  supplier_name VARCHAR(150) NOT NULL,
  po_date VARCHAR(50) NOT NULL,
  due_date VARCHAR(50),
  special_instructions TEXT,
  total DECIMAL(15,2) DEFAULT 0.00,
  status ENUM('Partial', 'Closed', 'Draft', 'Pending') DEFAULT 'Draft',
  items JSON,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. Quotations
CREATE TABLE IF NOT EXISTS sales_quotations (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50),
  quotation_number VARCHAR(100) NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  date VARCHAR(50) NOT NULL,
  expiry_date VARCHAR(50),
  total DECIMAL(15,2) DEFAULT 0.00,
  status ENUM('Draft', 'Sent', 'Accepted', 'Declined', 'Invoiced') DEFAULT 'Draft',
  items JSON,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. Credit Notes & Debit Notes
CREATE TABLE IF NOT EXISTS credit_notes (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50),
  credit_note_number VARCHAR(100) NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  date VARCHAR(50) NOT NULL,
  total DECIMAL(15,2) DEFAULT 0.00,
  balance DECIMAL(15,2) DEFAULT 0.00,
  status ENUM('Draft', 'Approved', 'Refunded', 'Applied') DEFAULT 'Approved',
  items JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS debit_notes (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50),
  debit_note_number VARCHAR(100) NOT NULL,
  vendor_name VARCHAR(150) NOT NULL,
  date VARCHAR(50) NOT NULL,
  total DECIMAL(15,2) DEFAULT 0.00,
  balance DECIMAL(15,2) DEFAULT 0.00,
  status ENUM('Draft', 'Approved', 'Refunded', 'Applied') DEFAULT 'Approved',
  items JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. Payments (Customer Receipts & Vendor Payments)
CREATE TABLE IF NOT EXISTS customer_payments (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50),
  reference_no VARCHAR(100) NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  payment_date VARCHAR(50) NOT NULL,
  payment_account VARCHAR(150) NOT NULL,
  payment_amount DECIMAL(15,2) NOT NULL,
  wht_amount DECIMAL(15,2) DEFAULT 0.00,
  balance DECIMAL(15,2) DEFAULT 0.00,
  status ENUM('Applied', 'UnApplied') DEFAULT 'Applied',
  allocations JSON,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS supplier_payments (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50),
  reference_no VARCHAR(100) NOT NULL,
  supplier_id VARCHAR(50),
  supplier_name VARCHAR(150) NOT NULL,
  payment_date VARCHAR(50) NOT NULL,
  payment_account VARCHAR(150) NOT NULL,
  payment_amount DECIMAL(15,2) NOT NULL,
  withholding_tax DECIMAL(15,2) DEFAULT 0.00,
  balance DECIMAL(15,2) DEFAULT 0.00,
  status ENUM('Applied', 'Unapplied', 'Draft') DEFAULT 'Applied',
  linked_bills JSON,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 20. Bank Accounts & Transactions
CREATE TABLE IF NOT EXISTS bank_accounts (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50),
  bank_name VARCHAR(150) NOT NULL,
  account_title VARCHAR(150) NOT NULL,
  account_number VARCHAR(100) NOT NULL,
  iban VARCHAR(100) NOT NULL,
  statement_balance DECIMAL(15,2) DEFAULT 0.00,
  adwiselabs_balance DECIMAL(15,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  show_on_invoices BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 21. Projects
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50),
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

-- 22. Employees
CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50),
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

-- 23. Manual Journals
CREATE TABLE IF NOT EXISTS manual_journals (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50),
  journal_id VARCHAR(50) NOT NULL,
  narration TEXT NOT NULL,
  date VARCHAR(50) NOT NULL,
  created_date VARCHAR(50) NOT NULL,
  is_tax_inclusive BOOLEAN DEFAULT FALSE,
  total DECIMAL(15,2) NOT NULL,
  status ENUM('Posted', 'Draft') DEFAULT 'Posted',
  items JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 24. Scanned Documents
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
  status ENUM('Processed', 'Pending', 'Converted') DEFAULT 'Processed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 25. Organization Details & Settings
CREATE TABLE IF NOT EXISTS organization_details (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50) UNIQUE,
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
  logo_url LONGTEXT,
  bank_name VARCHAR(150),
  iban VARCHAR(100),
  account_title VARCHAR(150),
  account_no VARCHAR(100),
  invoice_customization JSON,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
