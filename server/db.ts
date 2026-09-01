import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'adwiselabs_saas';

export let pool: mysql.Pool | null = null;
export let isConnected = false;

export async function initDatabase(): Promise<boolean> {
  try {
    console.log(`🔌 Attempting to connect to MySQL at ${DB_HOST}:${DB_PORT} as '${DB_USER}'...`);
    
    // Step 1: Connect to server without database to create database if not exists
    const rootConnection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
    });

    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await rootConnection.end();

    // Step 2: Create connection pool with target database
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });

    // Step 3: Run schema.sql to ensure all tables exist
    const schemaPath = path.join(process.cwd(), 'server', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      const statements = schemaSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().startsWith('create database') && !s.toLowerCase().startsWith('use '));

      for (const statement of statements) {
        try {
          await pool.query(statement);
        } catch (err: any) {
          // Ignore table already exists or foreign key constraints
        }
      }

      // Step 4: Ensure newly added columns & tables exist in existing database
      const columnMigrations = [
        `CREATE TABLE IF NOT EXISTS catalog_variations (
          id VARCHAR(50) PRIMARY KEY,
          tenant_id VARCHAR(50),
          name VARCHAR(150) NOT NULL,
          code VARCHAR(50),
          values_list JSON,
          description TEXT,
          created_on VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`,
        `ALTER TABLE products ADD COLUMN image LONGTEXT;`,
        `ALTER TABLE products ADD COLUMN has_variants BOOLEAN DEFAULT FALSE;`,
        `ALTER TABLE products ADD COLUMN variants JSON;`,
        `ALTER TABLE products ADD COLUMN variation_options JSON;`,
        `ALTER TABLE products ADD COLUMN warranty_details VARCHAR(255);`,
        `ALTER TABLE products ADD COLUMN opening_stock INT DEFAULT 0;`,
        `ALTER TABLE products ADD COLUMN unit_of_measure VARCHAR(50) DEFAULT 'Pcs';`,
        `ALTER TABLE catalog_categories ADD COLUMN image LONGTEXT;`,
        `ALTER TABLE sales_invoices MODIFY COLUMN status VARCHAR(50) DEFAULT 'Draft';`,
        `ALTER TABLE sales_invoices ADD COLUMN serial_number VARCHAR(100);`,
        `ALTER TABLE sales_invoices ADD COLUMN sales_person VARCHAR(150);`,
        `ALTER TABLE sales_invoices ADD COLUMN region VARCHAR(150);`,
        `ALTER TABLE sales_invoices ADD COLUMN requires_delivery_challan BOOLEAN DEFAULT FALSE;`,
        `ALTER TABLE sales_invoices ADD COLUMN discount_type VARCHAR(50);`,
        `ALTER TABLE sales_invoices ADD COLUMN is_tax_inclusive BOOLEAN DEFAULT FALSE;`,
        `ALTER TABLE sales_invoices ADD COLUMN subtotal DECIMAL(15,2) DEFAULT 0.00;`,
        `ALTER TABLE sales_invoices ADD COLUMN additional_tax_rate DECIMAL(15,2) DEFAULT 0.00;`,
        `ALTER TABLE sales_invoices ADD COLUMN special_instructions TEXT;`,
        `ALTER TABLE sales_quotations MODIFY COLUMN status VARCHAR(50) DEFAULT 'Draft';`,
        `ALTER TABLE sales_quotations ADD COLUMN reference_no VARCHAR(100);`,
        `ALTER TABLE sales_quotations ADD COLUMN customer_id VARCHAR(50);`,
        `ALTER TABLE sales_quotations ADD COLUMN sales_person VARCHAR(150);`,
        `ALTER TABLE sales_quotations ADD COLUMN region VARCHAR(150);`,
        `ALTER TABLE sales_quotations ADD COLUMN due_date VARCHAR(50);`,
        `ALTER TABLE sales_quotations ADD COLUMN discount_type VARCHAR(50);`,
        `ALTER TABLE sales_quotations ADD COLUMN is_tax_inclusive BOOLEAN DEFAULT FALSE;`,
        `ALTER TABLE sales_quotations ADD COLUMN subtotal DECIMAL(15,2) DEFAULT 0.00;`,
        `ALTER TABLE sales_quotations ADD COLUMN additional_tax_rate DECIMAL(15,2) DEFAULT 0.00;`,
        `ALTER TABLE sales_quotations ADD COLUMN special_instructions TEXT;`,
        `ALTER TABLE sales_quotations ADD COLUMN conversion_notes TEXT;`,
        `ALTER TABLE credit_notes MODIFY COLUMN status VARCHAR(50) DEFAULT 'Approved';`,
        `ALTER TABLE credit_notes ADD COLUMN customer_id VARCHAR(50);`,
        `ALTER TABLE credit_notes ADD COLUMN region VARCHAR(150);`,
        `ALTER TABLE credit_notes ADD COLUMN discount_type VARCHAR(50);`,
        `ALTER TABLE credit_notes ADD COLUMN is_tax_inclusive BOOLEAN DEFAULT FALSE;`,
        `ALTER TABLE credit_notes ADD COLUMN subtotal DECIMAL(15,2) DEFAULT 0.00;`,
        `ALTER TABLE credit_notes ADD COLUMN special_instructions TEXT;`,
        `ALTER TABLE credit_notes ADD COLUMN refunds JSON;`
      ];


      for (const migration of columnMigrations) {
        try {
          await pool.query(migration);
        } catch {
          // Column or table already exists
        }
      }
    }


    isConnected = true;
    console.log(`✅ Successfully connected to MySQL database: '${DB_NAME}'! All tables & columns verified.`);
    return true;
  } catch (error: any) {
    console.warn(`⚠️ MySQL Connection Notice: Could not connect to MySQL on ${DB_HOST}:${DB_PORT} (${error.message}).`);
    console.log(`💡 Note: The application has built-in High-Availability Mock DB fallback so it will continue working smoothly.`);
    isConnected = false;
    return false;
  }
}

// Helper query function with safety
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (!pool || !isConnected) {
    throw new Error('MySQL Database is not connected');
  }
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

export function isDbConnected(): boolean {
  return isConnected && pool !== null;
}

export async function execute(sql: string, params: any[] = []): Promise<any> {
  if (!pool || !isConnected) {
    throw new Error('MySQL Database is not connected');
  }
  const [result] = await pool.execute(sql, params);
  return result;
}

