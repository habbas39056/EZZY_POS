// ==========================================================
// Adwiselabs SaaS API Client (Connects to Express & MySQL)
// ==========================================================

const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Check backend server & MySQL health
  async checkHealth(): Promise<{ status: string; database: string } | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // 1. Tenants CRUD
  async getTenants() {
    try {
      const res = await fetch(`${API_BASE_URL}/tenants`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async createTenant(tenant: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenant)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // 2. Contacts CRUD
  async getContacts() {
    try {
      const res = await fetch(`${API_BASE_URL}/contacts`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async createContact(contact: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // 3. Products CRUD
  async getProducts() {
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/products`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async saveProduct(product: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async deleteProduct(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/products/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // 3.1 Categories CRUD
  async getCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/categories`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async saveCategory(category: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async deleteCategory(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/categories/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // 3.2 Departments CRUD
  async getDepartments() {
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/departments`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async saveDepartment(department: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(department)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async deleteDepartment(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/departments/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // 3.3 Manufacturers CRUD
  async getManufacturers() {
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/manufacturers`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async saveManufacturer(manufacturer: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/manufacturers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manufacturer)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async deleteManufacturer(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/manufacturers/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // 3.4 Regions CRUD
  async getRegions() {
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/regions`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async saveRegion(region: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/regions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(region)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async deleteRegion(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/regions/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // 3.5 Unit of Measure CRUD
  async getUom() {
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/uom`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async saveUom(uom: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/uom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uom)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async deleteUom(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/uom/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // 3.6 Locations CRUD
  async getLocations() {
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/locations`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async saveLocation(location: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async deleteLocation(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/locations/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // 4. Sales Invoices
  async getInvoices() {
    try {
      const res = await fetch(`${API_BASE_URL}/sales/invoices`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async saveInvoice(invoice: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/sales/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async deleteInvoice(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/sales/invoices/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // 5. Sales Quotations
  async getQuotations() {
    try {
      const res = await fetch(`${API_BASE_URL}/sales/quotations`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async saveQuotation(quotation: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/sales/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotation)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async deleteQuotation(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/sales/quotations/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // 6. Credit Notes
  async getCreditNotes() {
    try {
      const res = await fetch(`${API_BASE_URL}/sales/credit-notes`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async saveCreditNote(creditNote: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/sales/credit-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creditNote)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async deleteCreditNote(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/sales/credit-notes/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // 6.5 Customer Payments
  async getPayments() {
    try {
      const res = await fetch(`${API_BASE_URL}/sales/payments`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async savePayment(payment: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/sales/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async deletePayment(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/sales/payments/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // 7. Expense Bills
  async getBills() {
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/bills`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async saveBill(bill: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bill)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async deleteBill(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/bills/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // 7.5 Direct Expenses CRUD
  async getDirectExpenses() {
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/direct`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async saveDirectExpense(expense: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async deleteDirectExpense(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/direct/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // 7.6 Purchase Orders CRUD
  async getPurchaseOrders() {
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/purchase-orders`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async savePurchaseOrder(po: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/purchase-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(po)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async deletePurchaseOrder(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/purchase-orders/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // 7.7 Debit Notes CRUD
  async getDebitNotes() {
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/debit-notes`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async saveDebitNote(dn: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/debit-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dn)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async deleteDebitNote(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/debit-notes/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // 7.8 Supplier Payments CRUD (Make Payments)
  async getSupplierPayments() {
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/supplier-payments`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async saveSupplierPayment(p: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/supplier-payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async deleteSupplierPayment(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/supplier-payments/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // 8. Bank Accounts
  async getBankAccounts() {
    try {
      const res = await fetch(`${API_BASE_URL}/bank/accounts`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async saveBankAccount(bank: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/bank/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bank)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async deleteBankAccount(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/bank/accounts/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // 9. Projects
  async getProjects() {
    try {
      const res = await fetch(`${API_BASE_URL}/projects`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // 10. Employees
  async getEmployees() {
    try {
      const res = await fetch(`${API_BASE_URL}/employees`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // 11. Manual Journals
  async getJournals() {
    try {
      const res = await fetch(`${API_BASE_URL}/journals`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // 12. Organization Details
  async getOrganization() {
    try {
      const res = await fetch(`${API_BASE_URL}/organization`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async updateOrganization(data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/organization`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  }
};
