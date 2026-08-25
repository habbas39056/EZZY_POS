export interface ReportItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  isFavorite?: boolean;
}

export interface ReportCategory {
  id: string;
  title: string;
  iconName: string;
  reports: { id: string; name: string }[];
}

export const REPORT_CATEGORIES: ReportCategory[] = [
  {
    id: 'purchases',
    title: 'Purchases',
    iconName: 'ShoppingCart',
    reports: [
      { id: 'rep_aged_payables', name: 'Aged Payables' },
      { id: 'rep_aged_payables_det', name: 'Aged Payables Details' },
      { id: 'rep_outstanding_payables', name: 'Outstanding Payables' },
      { id: 'rep_purchases_by_suppliers', name: 'Purchases by Suppliers' },
      { id: 'rep_supplier_statement', name: 'Supplier Statement' },
      { id: 'rep_purchases_by_region_det', name: 'Purchases by Region Details' },
      { id: 'rep_supplier_bill_det', name: 'Supplier Bill Details Report' }
    ]
  },
  {
    id: 'inventory',
    title: 'Inventory',
    iconName: 'Package',
    reports: [
      { id: 'rep_inv_summary', name: 'Inventory Summary' },
      { id: 'rep_inv_item_det', name: 'Inventory Item Details' },
      { id: 'rep_region_by_item', name: 'Region by Item Report' },
      { id: 'rep_sales_by_item', name: 'Sales by Item Report' },
      { id: 'rep_purchases_by_item', name: 'Purchases by Item Report' },
      { id: 'rep_prod_history', name: 'Product History Report' },
      { id: 'rep_prod_stock', name: 'Product Stock Report' },
      { id: 'rep_inv_perf', name: 'Inventory Performance Report' }
    ]
  },
  {
    id: 'sales',
    title: 'Sales',
    iconName: 'Receipt',
    reports: [
      { id: 'rep_aged_rec', name: 'Aged Receivables' },
      { id: 'rep_aged_rec_det', name: 'Aged Receivables Details' },
      { id: 'rep_outstanding_rec', name: 'Outstanding Receivables' },
      { id: 'rep_sales_by_cust', name: 'Sales by Customers' },
      { id: 'rep_cust_statement', name: 'Customer Statement' },
      { id: 'rep_sales_perf', name: 'Sales Performance' },
      { id: 'rep_daily_sales_out', name: 'Daily Sales and Outstanding' },
      { id: 'rep_sales_by_disc', name: 'Sales by Discount' },
      { id: 'rep_sales_by_reg_det', name: 'Sales by Region Details' },
      { id: 'rep_sales_by_reg_sum', name: 'Sales by Region Summary' },
      { id: 'rep_cash_credit_sale', name: 'Cash and Credit Sale Report' },
      { id: 'rep_cust_inv_det', name: 'Customer Invoice Details Report' },
      { id: 'rep_profit_by_cust', name: 'Profit by Customer - Summary Report' },
      { id: 'rep_profit_by_inv', name: 'Profit by Invoice - Summary Report' },
      { id: 'rep_batch_wise_profit', name: 'Batch-Wise Profit Report' },
      { id: 'rep_emp_sales_rec', name: 'Employee Sales & Recovery Report' },
      { id: 'rep_installment', name: 'Installment Report' }
    ]
  },
  {
    id: 'tax',
    title: 'TAX',
    iconName: 'FileSpreadsheet',
    reports: [
      { id: 'rep_wht_report', name: 'Withholding Tax Report' }
    ]
  },
  {
    id: 'financial',
    title: 'Financial',
    iconName: 'Landmark',
    reports: [
      { id: 'rep_trial_balance', name: 'Trial Balance' },
      { id: 'rep_profit_loss', name: 'Profit & Loss' },
      { id: 'rep_balance_sheet', name: 'Balance Sheet' }
    ]
  },
  {
    id: 'employee',
    title: 'Employee',
    iconName: 'Users2',
    reports: [
      { id: 'rep_emp_tx_summary', name: 'Employee Transaction Summary' },
      { id: 'rep_emp_tx_details', name: 'Employee Transaction Details Report' },
      { id: 'rep_emp_by_item', name: 'Employee By Item Report' }
    ]
  },
  {
    id: 'accounting',
    title: 'Accounting',
    iconName: 'FileSpreadsheet',
    reports: [
      { id: 'rep_gl_summary', name: 'General Ledger Summary' },
      { id: 'rep_acc_summary', name: 'Account Summary' },
      { id: 'rep_acc_tx', name: 'Account Transaction' },
      { id: 'rep_bank_summary', name: 'Bank Summary' },
      { id: 'rep_journal_report', name: 'Journal Report' },
      { id: 'rep_asset_report', name: 'Asset Report' }
    ]
  },
  {
    id: 'project',
    title: 'Project',
    iconName: 'FolderKanban',
    reports: [
      { id: 'rep_proj_summary', name: 'Project Summary' },
      { id: 'rep_proj_exp', name: 'Project Expense Report' },
      { id: 'rep_proj_sales', name: 'Project Sales Report' },
      { id: 'rep_proj_pl', name: 'Project Profit & Loss Report' }
    ]
  },
  {
    id: 'location',
    title: 'Location',
    iconName: 'MapPin',
    reports: [
      { id: 'rep_prod_stock_loc', name: 'Product Stock Location Report' },
      { id: 'rep_loc_stock', name: 'Location Stock Report' }
    ]
  },
  {
    id: 'batch_location',
    title: 'Batch & Location',
    iconName: 'Layers',
    reports: [
      { id: 'rep_batch_loc_stock', name: 'Batch & Location Stock Report' }
    ]
  },
  {
    id: 'distribution',
    title: 'Distribution',
    iconName: 'Truck',
    reports: [
      { id: 'rep_del_by_item', name: 'Delivery By Item Report' },
      { id: 'rep_del_by_reg', name: 'Delivery By Region Report' },
      { id: 'rep_emp_comm', name: 'Employee Commission Report' },
      { id: 'rep_load_form', name: 'Load Form Report' }
    ]
  }
];
