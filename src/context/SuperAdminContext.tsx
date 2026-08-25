import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Tenant, Plan, SaaSInvoice, AuditLog, SystemSettings, TenantStatus, ModuleFlags } from '../types';
import { INITIAL_TENANTS, INITIAL_PLANS, INITIAL_SAAS_INVOICES, INITIAL_AUDIT_LOGS, INITIAL_SYSTEM_SETTINGS } from '../data/initialData';
import { api } from '../services/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'tenant_admin' | 'tenant_user';
  tenantId?: string;
}

interface SuperAdminContextType {
  currentUser: AuthUser | null;
  tenants: Tenant[];
  plans: Plan[];
  invoices: SaaSInvoice[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  activeTenant: Tenant | null;
  currentView: string;
  setCurrentView: (view: string) => void;
  loginAsSuperAdmin: (email: string, password?: string) => boolean;
  loginAsTenant: (email: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  addTenant: (tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>) => Tenant;
  updateTenant: (id: string, data: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;
  changeTenantStatus: (id: string, status: TenantStatus) => void;
  updateTenantModules: (id: string, modules: ModuleFlags) => void;
  addPlan: (plan: Omit<Plan, 'id'>) => void;
  updatePlan: (id: string, data: Partial<Plan>) => void;
  impersonateTenant: (id: string) => void;
  exitImpersonation: () => void;
  addSaaSInvoice: (invoice: Omit<SaaSInvoice, 'id'>) => void;
  deleteSaaSInvoice: (id: string) => void;
  markInvoicePaid: (id: string) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonString: string) => boolean;
  resetToDemoData: () => void;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

export const SuperAdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('adwiselabs_saas_tenants') || localStorage.getItem('moneypex_saas_tenants');
    return saved ? JSON.parse(saved) : INITIAL_TENANTS;
  });

  const [plans, setPlans] = useState<Plan[]>(() => {
    const saved = localStorage.getItem('adwiselabs_saas_plans') || localStorage.getItem('moneypex_saas_plans');
    return saved ? JSON.parse(saved) : INITIAL_PLANS;
  });

  const [invoices, setInvoices] = useState<SaaSInvoice[]>(() => {
    const saved = localStorage.getItem('adwiselabs_saas_invoices') || localStorage.getItem('moneypex_saas_invoices');
    return saved ? JSON.parse(saved) : INITIAL_SAAS_INVOICES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('adwiselabs_saas_logs') || localStorage.getItem('moneypex_saas_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('adwiselabs_saas_settings') || localStorage.getItem('moneypex_saas_settings');
    return saved ? JSON.parse(saved) : INITIAL_SYSTEM_SETTINGS;
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('adwiselabs_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTenantId, setActiveTenantId] = useState<string | null>(() => {
    return localStorage.getItem('adwiselabs_active_tenant_id') || localStorage.getItem('moneypex_active_tenant_id') || null;
  });

  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Persistence
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('adwiselabs_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('adwiselabs_auth_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('adwiselabs_saas_tenants', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('adwiselabs_saas_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('adwiselabs_saas_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('adwiselabs_saas_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('adwiselabs_saas_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (activeTenantId) {
      localStorage.setItem('adwiselabs_active_tenant_id', activeTenantId);
    } else {
      localStorage.removeItem('adwiselabs_active_tenant_id');
      localStorage.removeItem('moneypex_active_tenant_id');
    }
  }, [activeTenantId]);

  const activeTenant = tenants.find(t => t.id === activeTenantId) || null;

  const logAction = (action: string, targetTenant?: string, targetId?: string, details: string = '', status: 'success' | 'warning' | 'error' = 'success') => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: 'Super Admin',
      actorEmail: 'admin@adwiselabs.com',
      actorRole: 'Super Admin',
      action,
      targetTenant,
      targetId,
      ipAddress: '192.168.1.100',
      status,
      details
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 99)]);
  };

  const addTenant = (tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Tenant => {
    const id = `ten_${Date.now().toString().slice(-4)}_${Math.random().toString(36).substring(2, 5)}`;
    const now = new Date().toISOString().substring(0, 10);
    const newTenant: Tenant = {
      ...tenantData,
      id,
      createdAt: now,
      updatedAt: now
    };

    setTenants(prev => [newTenant, ...prev]);

    // Save to backend asynchronously
    api.createTenant(newTenant).catch(err => console.error('Failed to save tenant to backend:', err));

    // Create an initial invoice if paid plan
    const plan = plans.find(p => p.id === tenantData.planId);
    if (plan && (plan.priceMonthly > 0 || plan.priceYearly > 0) && tenantData.status !== 'trial') {
      const amount = tenantData.billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
      const newInv: SaaSInvoice = {
        id: `sinv_${Date.now()}`,
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        tenantId: id,
        tenantName: newTenant.companyName,
        planName: `${plan.name} (${tenantData.billingCycle === 'yearly' ? 'Annual' : 'Monthly'})`,
        amount,
        currency: plan.currency,
        status: 'paid',
        issueDate: now,
        dueDate: now,
        paidAt: now,
        paymentMethod: 'Credit Card'
      };
      setInvoices(prev => [newInv, ...prev]);
    }

    logAction('TENANT_CREATE', newTenant.companyName, id, `Provisioned workspace with ${plan?.name || 'Custom'} plan.`);
    return newTenant;
  };

  const updateTenant = (id: string, data: Partial<Tenant>) => {
    setTenants(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...data, updatedAt: new Date().toISOString().substring(0, 10) };
        logAction('TENANT_UPDATE', updated.companyName, id, `Updated organization profile/settings.`);
        return updated;
      }
      return t;
    }));
  };

  const deleteTenant = (id: string) => {
    const tenant = tenants.find(t => t.id === id);
    if (tenant) {
      logAction('TENANT_DELETE', tenant.companyName, id, `Deleted tenant organization and deactivated workspace.`, 'warning');
      setTenants(prev => prev.filter(t => t.id !== id));
      if (activeTenantId === id) {
        setActiveTenantId(null);
      }
    }
  };

  const changeTenantStatus = (id: string, status: TenantStatus) => {
    setTenants(prev => prev.map(t => {
      if (t.id === id) {
        logAction(`TENANT_STATUS_${status.toUpperCase()}`, t.companyName, id, `Changed client status to ${status}.`, status === 'suspended' ? 'warning' : 'success');
        return { ...t, status, updatedAt: new Date().toISOString().substring(0, 10) };
      }
      return t;
    }));
  };

  const updateTenantModules = (id: string, modules: ModuleFlags) => {
    setTenants(prev => prev.map(t => {
      if (t.id === id) {
        logAction('TENANT_MODULE_PERMISSIONS', t.companyName, id, `Updated active business module entitlements.`);
        return { ...t, enabledModules: modules, updatedAt: new Date().toISOString().substring(0, 10) };
      }
      return t;
    }));
  };

  const addPlan = (planData: Omit<Plan, 'id'>) => {
    const id = `plan_${planData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
    const newPlan: Plan = { ...planData, id };
    setPlans(prev => [...prev, newPlan]);
    logAction('PLAN_CREATE', undefined, id, `Created new package tier: ${newPlan.name}`);
  };

  const updatePlan = (id: string, data: Partial<Plan>) => {
    setPlans(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...data };
        logAction('PLAN_UPDATE', undefined, id, `Updated package tier limits & pricing for ${updated.name}`);
        return updated;
      }
      return p;
    }));
  };

  const loginAsSuperAdmin = (email: string, _password?: string) => {
    const user: AuthUser = {
      id: 'super_admin_1',
      name: 'Super Administrator',
      email: email || 'admin@adwiselabs.com',
      role: 'superadmin',
    };
    setCurrentUser(user);
    setActiveTenantId(null);
    logAction('ADMIN_LOGIN', undefined, undefined, 'Super Administrator logged in.');
    return true;
  };

  const loginAsTenant = (email: string, _password?: string) => {
    const found = tenants.find(t => t.adminUser.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) {
      return { success: false, error: 'No client organization found with this email address.' };
    }
    if (found.status === 'suspended') {
      return { success: false, error: 'This client account has been suspended by the platform administrator.' };
    }

    const user: AuthUser = {
      id: found.adminUser.id || 'usr_client',
      name: found.adminUser.name,
      email: found.adminUser.email,
      role: 'tenant_admin',
      tenantId: found.id,
    };
    setCurrentUser(user);
    setActiveTenantId(found.id);
    logAction('TENANT_LOGIN', found.companyName, found.id, `Client user ${found.adminUser.name} signed into workspace.`);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveTenantId(null);
  };

  const impersonateTenant = (id: string) => {
    const tenant = tenants.find(t => t.id === id);
    if (tenant) {
      setActiveTenantId(id);
      logAction('TENANT_IMPERSONATE', tenant.companyName, id, `Super Admin logged into tenant workspace.`);
    }
  };

  const exitImpersonation = () => {
    if (activeTenant) {
      logAction('TENANT_EXIT_IMPERSONATE', activeTenant.companyName, activeTenant.id, `Returned to Super Admin Control Plane.`);
    }
    setActiveTenantId(null);
  };

  const addSaaSInvoice = (invoiceData: Omit<SaaSInvoice, 'id'>) => {
    const id = `sinv_${Date.now()}`;
    const newInv: SaaSInvoice = { ...invoiceData, id };
    setInvoices(prev => [newInv, ...prev]);
    logAction('SAAS_INVOICE_CREATE', invoiceData.tenantName, id, `Generated billing invoice ${invoiceData.invoiceNumber} for $${invoiceData.amount}`);
  };

  const deleteSaaSInvoice = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    setInvoices(prev => prev.filter(i => i.id !== id));
    if (inv) {
      logAction('SAAS_INVOICE_DELETE', inv.tenantName, id, `Deleted billing invoice ${inv.invoiceNumber}`);
    }
  };

  const markInvoicePaid = (id: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        const now = new Date().toISOString().substring(0, 10);
        logAction('SAAS_INVOICE_PAID', inv.tenantName, id, `Marked invoice ${inv.invoiceNumber} as PAID.`);
        return { ...inv, status: 'paid', paidAt: now };
      }
      return inv;
    }));
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      logAction('SYSTEM_SETTINGS_UPDATE', undefined, undefined, `Updated global platform configuration.`);
      return updated;
    });
  };

  const exportDatabaseJSON = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      platform: 'Adwiselabs SaaS Control Plane',
      version: '2.0.0',
      tenants,
      plans,
      invoices,
      auditLogs,
      settings
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adwiselabs-saas-backup-${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logAction('SYSTEM_BACKUP_EXPORT', undefined, undefined, 'Exported complete database JSON snapshot.');
  };

  const importDatabaseJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.tenants && data.plans) {
        setTenants(data.tenants);
        setPlans(data.plans);
        if (data.invoices) setInvoices(data.invoices);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
        if (data.settings) setSettings(data.settings);
        logAction('SYSTEM_BACKUP_RESTORE', undefined, undefined, 'Restored database from uploaded JSON snapshot.');
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const resetToDemoData = () => {
    setTenants(INITIAL_TENANTS);
    setPlans(INITIAL_PLANS);
    setInvoices(INITIAL_SAAS_INVOICES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSettings(INITIAL_SYSTEM_SETTINGS);
    setActiveTenantId(null);
    localStorage.clear();
    logAction('SYSTEM_RESET_DEMO', undefined, undefined, 'Reset platform data to default demo dataset.');
  };

  return (
    <SuperAdminContext.Provider
      value={{
        currentUser,
        loginAsSuperAdmin,
        loginAsTenant,
        logout,
        tenants,
        plans,
        invoices,
        auditLogs,
        settings,
        activeTenant,
        currentView,
        setCurrentView,
        addTenant,
        updateTenant,
        deleteTenant,
        changeTenantStatus,
        updateTenantModules,
        addPlan,
        updatePlan,
        impersonateTenant,
        exitImpersonation,
        addSaaSInvoice,
        deleteSaaSInvoice,
        markInvoicePaid,
        updateSettings,
        exportDatabaseJSON,
        importDatabaseJSON,
        resetToDemoData,
      }}
    >
      {children}
    </SuperAdminContext.Provider>
  );
};

export const useSuperAdmin = () => {
  const context = useContext(SuperAdminContext);
  if (!context) {
    throw new Error('useSuperAdmin must be used within a SuperAdminProvider');
  }
  return context;
};
