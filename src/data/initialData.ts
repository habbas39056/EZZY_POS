import type { Tenant, Plan, SaaSInvoice, AuditLog, SystemSettings } from '../types';

export const INITIAL_PLANS: Plan[] = [
  {
    id: 'plan_starter',
    name: 'Starter',
    tagline: 'Ideal for sole traders, freelancers and small startups.',
    priceMonthly: 19,
    priceYearly: 190,
    currency: 'PKR',
    currencySymbol: 'Rs',
    maxUsers: 2,
    maxInvoices: 50,
    storageLimitMB: 1024,
    features: [
      'Up to 2 Team Members',
      '50 Invoices & Bills / month',
      'Basic Sales & Expense Tracking',
      'Standard Financial Reports',
      'Email Support'
    ],
    moduleDefaults: {
      invoicing: true,
      inventory: false,
      banking: true,
      accounting: false,
      vatTax: true,
      payroll: false,
      expenses: true,
      reports: true,
      multiCurrency: false,
      pos: false,
    }
  },
  {
    id: 'plan_pro',
    name: 'Professional',
    tagline: 'Best for growing businesses with inventory & VAT needs.',
    priceMonthly: 49,
    priceYearly: 490,
    currency: 'PKR',
    currencySymbol: 'Rs',
    maxUsers: 10,
    maxInvoices: 500,
    storageLimitMB: 5120,
    isPopular: true,
    features: [
      'Up to 10 Team Members',
      '500 Invoices & Bills / month',
      'Complete Inventory & Stock Control',
      'Double-entry General Ledger',
      'Automated Bank Reconciliation',
      'Priority 24/7 Support'
    ],
    moduleDefaults: {
      invoicing: true,
      inventory: true,
      banking: true,
      accounting: true,
      vatTax: true,
      payroll: false,
      expenses: true,
      reports: true,
      multiCurrency: true,
      pos: false,
    }
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise Suite',
    tagline: 'Unlimited power for high-volume enterprises, multi-branch & retail.',
    priceMonthly: 129,
    priceYearly: 1290,
    currency: 'PKR',
    currencySymbol: 'Rs',
    maxUsers: 50,
    maxInvoices: -1,
    storageLimitMB: 25600,
    features: [
      'Unlimited Invoices & Bills',
      'Up to 50 Users',
      'Integrated Multi-Branch & POS',
      'Full HR & Employee Commission',
      'Document AI Scanning OCR',
      'Dedicated Account Manager'
    ],
    moduleDefaults: {
      invoicing: true,
      inventory: true,
      banking: true,
      accounting: true,
      vatTax: true,
      payroll: true,
      expenses: true,
      reports: true,
      multiCurrency: true,
      pos: true,
    }
  }
];

export const INITIAL_TENANTS: Tenant[] = [];

export const INITIAL_SAAS_INVOICES: SaaSInvoice[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_SYSTEM_SETTINGS: SystemSettings = {
  platformName: 'Adwiselabs SaaS Cloud Admin',
  supportEmail: 'support@adwiselabs.com',
  supportPhone: '03158567555',
  defaultCurrency: 'PKR',
  defaultCurrencySymbol: 'Rs',
  defaultTrialDays: 14,
  maintenanceMode: false,
  allowPublicSignups: true,
  taxRatePercent: 18,
  smtpConfigured: true,
  companyAddress: '103-B4 Lotus Mall Gulberg Greens, Islamabad'
};
