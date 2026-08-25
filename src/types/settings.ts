export interface OrganizationDetails {
  firstName: string;
  businessName: string;
  tax: string;
  accountEmail: string;
  organizationEmail: string;
  taxNumber: string;
  phone: string;
  industry: string;
  startingDate: string;
  country: string;
  currency: string;
  address: string;
  city: string;
  province: string;
  postCode: string;
  strn: string;
  termsAndConditions: string;
  logoUrl?: string;
  bankName: string;
  iban: string;
  accountTitle: string;
  accountNo: string;
}

export const INITIAL_ORG_DETAILS: OrganizationDetails = {
  firstName: 'Adwiselabs',
  businessName: 'ARKIT Services',
  tax: 'Sales Tax Registered',
  accountEmail: 'admin@adwiselabs.com',
  organizationEmail: 'info@adwiselabs.com',
  taxNumber: '7829103-4',
  phone: '03158567555',
  industry: 'Manufacturing',
  startingDate: '01-Jan-2025',
  country: 'Pakistan',
  currency: 'Pakistani Rupee',
  address: '103-B4 Lotus Mall Gulberg Greens',
  city: 'Islamabad',
  province: 'Capital Territory',
  postCode: '44000',
  strn: '17-00-9821-002-19',
  termsAndConditions: 'Payment due within 15 days of invoice date. Late payments subject to 2% monthly interest charge.',
  logoUrl: '',
  bankName: 'Standard Chartered',
  iban: 'PK32SCBL00000012345678',
  accountTitle: 'ARKIT Services',
  accountNo: '0105180'
};

export interface TemplateFieldConfig {
  show: boolean;
  label: string;
}

export interface InvoiceTemplateCustomization {
  general: {
    primaryColor: string;
    templateName: string;
    invoiceTitle: string;
    orgLogo: TemplateFieldConfig;
    orgName: TemplateFieldConfig;
    orgAddress: TemplateFieldConfig;
    orgEmail: TemplateFieldConfig;
    orgPhone: TemplateFieldConfig;
    billToLabel: string;
    customerName: TemplateFieldConfig;
    invoiceDate: TemplateFieldConfig;
    dueDate: TemplateFieldConfig;
    invoiceNumber: TemplateFieldConfig;
    balanceDue: TemplateFieldConfig;
  };
  lineItems: {
    itemNo: TemplateFieldConfig;
    itemDescription: TemplateFieldConfig;
    itemQuantity: TemplateFieldConfig;
    itemUnitPrice: TemplateFieldConfig;
    itemTaxAmount: TemplateFieldConfig;
    itemTotal: TemplateFieldConfig;
  };
  totals: {
    subTotal: TemplateFieldConfig;
    totalTax: TemplateFieldConfig;
    grossTotal: TemplateFieldConfig;
    balance: TemplateFieldConfig;
  };
  footer: {
    paymentDetails: TemplateFieldConfig;
    termsAndConditions: TemplateFieldConfig;
  };
}

export const DEFAULT_TEMPLATE_CUSTOMIZATION: InvoiceTemplateCustomization = {
  general: {
    primaryColor: '#003366',
    templateName: 'Template 1',
    invoiceTitle: 'Invoice',
    orgLogo: { show: true, label: 'Organization Logo' },
    orgName: { show: true, label: 'Organization Name' },
    orgAddress: { show: true, label: 'Organization Address' },
    orgEmail: { show: true, label: 'Organization Email' },
    orgPhone: { show: true, label: 'Organization Phone' },
    billToLabel: 'Bill To',
    customerName: { show: true, label: 'Customer Name' },
    invoiceDate: { show: true, label: 'Date of Issue' },
    dueDate: { show: true, label: 'Due Date' },
    invoiceNumber: { show: true, label: 'Invoice Number' },
    balanceDue: { show: true, label: 'Balance' }
  },
  lineItems: {
    itemNo: { show: false, label: 'S.No' },
    itemDescription: { show: true, label: 'Description' },
    itemQuantity: { show: true, label: 'Qty' },
    itemUnitPrice: { show: true, label: 'Unit Price' },
    itemTaxAmount: { show: true, label: 'TAX' },
    itemTotal: { show: true, label: 'Total' }
  },
  totals: {
    subTotal: { show: true, label: 'SubTotal' },
    totalTax: { show: true, label: 'TAX' },
    grossTotal: { show: true, label: 'Total' },
    balance: { show: true, label: 'Balance Due' }
  },
  footer: {
    paymentDetails: { show: true, label: 'PAYMENT DETAILS' },
    termsAndConditions: { show: true, label: 'Terms & Conditions' }
  }
};
