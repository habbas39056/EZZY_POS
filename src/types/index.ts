export type TenantStatus = 'active' | 'suspended' | 'trial' | 'expired';

export type BusinessIndustry = 
  | 'Retail & Wholesale'
  | 'IT & Software Services'
  | 'Construction & Real Estate'
  | 'Manufacturing'
  | 'Consulting & Professional Services'
  | 'Healthcare & Medical'
  | 'Restaurant & Hospitality'
  | 'Logistics & Transport'
  | 'E-Commerce'
  | 'Other';

export interface ModuleFlags {
  invoicing: boolean;
  inventory: boolean;
  banking: boolean;
  accounting: boolean;
  vatTax: boolean;
  payroll: boolean;
  expenses: boolean;
  reports: boolean;
  multiCurrency: boolean;
  pos: boolean;
}

export interface TenantAdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'admin' | 'accountant' | 'staff';
  lastLogin?: string;
}

export interface TenantUsage {
  invoicesCount: number;
  maxInvoices: number;
  usersCount: number;
  maxUsers: number;
  storageUsedMB: number;
  maxStorageMB: number;
}

export interface Tenant {
  id: string;
  slug: string;
  companyName: string;
  tradingName?: string;
  registrationNumber?: string;
  vatTaxNumber?: string;
  industry: BusinessIndustry;
  country: string;
  currency: string;
  currencySymbol: string;
  fiscalYearStart: string; // e.g. "01-01"
  address: string;
  city: string;
  phone: string;
  website?: string;
  status: TenantStatus;
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  planStartDate: string;
  planExpiresAt: string;
  enabledModules: ModuleFlags;
  adminUser: TenantAdminUser;
  usage: TenantUsage;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  currencySymbol: string;
  maxUsers: number;
  maxInvoices: number; // -1 for unlimited
  storageLimitMB: number;
  features: string[];
  moduleDefaults: ModuleFlags;
  isPopular?: boolean;
  isCustom?: boolean;
}

export interface SaaSInvoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  planName: string;
  amount: number;
  currency: string;
  status: 'paid' | 'unpaid' | 'overdue';
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: 'Credit Card' | 'Bank Transfer' | 'Stripe' | 'PayPal' | 'Manual';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetTenant?: string;
  targetId?: string;
  ipAddress: string;
  status: 'success' | 'warning' | 'error';
  details: string;
}

export interface SystemSettings {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  defaultCurrency: string;
  defaultCurrencySymbol: string;
  defaultTrialDays: number;
  maintenanceMode: boolean;
  allowPublicSignups: boolean;
  taxRatePercent: number;
  smtpConfigured: boolean;
  companyAddress: string;
}
