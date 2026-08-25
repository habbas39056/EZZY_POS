import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save } from 'lucide-react';
import { 
  DEFAULT_TEMPLATE_CUSTOMIZATION, 
  type InvoiceTemplateCustomization,
  type OrganizationDetails,
  INITIAL_ORG_DETAILS
} from '../../../types/settings';
import type { Invoice } from '../../../types/sales';
import { Template1 } from './templates/Template1';
import { Template2 } from './templates/Template2';
import { Template3 } from './templates/Template3';

interface Props {
  onBack: () => void;
  templateId: string;
}

import { api } from '../../../services/api';

// Dummy invoice for preview
const previewInvoice: Invoice = {
  id: 'INV-PREV-01',
  invoiceNumber: 'INV-2026-001',
  customerId: 'CUST-01',
  customerName: 'Acme Corporation',
  invoiceDate: '20-Aug-2026',
  dueDate: '04-Sep-2026',
  status: 'Draft',
  requiresDeliveryChallan: false,
  discountType: 'Discount by Amount',
  isTaxInclusive: false,
  discount: 0,
  createdAt: new Date().toISOString(),
  items: [
    { 
      id: '1', 
      itemDescription: 'Web Design Services', 
      qty: 1, 
      unitPrice: 1500, 
      taxAmount: 0, 
      netAmount: 1500,
      batchNumber: '',
      batchExpiryDate: '',
      uom: 'Nos',
      location: '',
      discount: 0,
      account: '',
      taxRatePercent: 0
    },
    { 
      id: '2', 
      itemDescription: 'Hosting (1 Year)', 
      qty: 1, 
      unitPrice: 200, 
      taxAmount: 0, 
      netAmount: 200,
      batchNumber: '',
      batchExpiryDate: '',
      uom: 'Nos',
      location: '',
      discount: 0,
      account: '',
      taxRatePercent: 0
    }
  ],
  subtotal: 1700,
  totalTax: 0,
  grossTotal: 1700,
  balance: 1700,
  specialInstructions: 'Thank you for your business!'
};

export const InvoiceCustomizationScreen: React.FC<Props> = ({ onBack, templateId }) => {
  const [customization, setCustomization] = useState<InvoiceTemplateCustomization>(DEFAULT_TEMPLATE_CUSTOMIZATION);
  const [orgDetails, setOrgDetails] = useState<OrganizationDetails>(INITIAL_ORG_DETAILS);
  const [activeTab, setActiveTab] = useState<'general' | 'lineItems' | 'totals' | 'footer'>('general');

  useEffect(() => {
    const loadData = async () => {
      const data = await api.getOrganization();
      if (data) {
        setOrgDetails({ ...INITIAL_ORG_DETAILS, ...data });
        if (data.invoiceCustomization) {
          const parsed = data.invoiceCustomization;
          setCustomization({
            general: { ...DEFAULT_TEMPLATE_CUSTOMIZATION.general, ...(parsed.general || {}) },
            lineItems: { ...DEFAULT_TEMPLATE_CUSTOMIZATION.lineItems, ...(parsed.lineItems || {}) },
            totals: { ...DEFAULT_TEMPLATE_CUSTOMIZATION.totals, ...(parsed.totals || {}) },
            footer: { ...DEFAULT_TEMPLATE_CUSTOMIZATION.footer, ...(parsed.footer || {}) }
          });
          return;
        }
      }
      
      // Fallback to local storage if API fails or no data
      const savedCustomization = localStorage.getItem('adwiselabs_invoice_customization');
      if (savedCustomization) {
        try {
          const parsed = JSON.parse(savedCustomization);
          setCustomization({
            general: { ...DEFAULT_TEMPLATE_CUSTOMIZATION.general, ...(parsed.general || {}) },
            lineItems: { ...DEFAULT_TEMPLATE_CUSTOMIZATION.lineItems, ...(parsed.lineItems || {}) },
            totals: { ...DEFAULT_TEMPLATE_CUSTOMIZATION.totals, ...(parsed.totals || {}) },
            footer: { ...DEFAULT_TEMPLATE_CUSTOMIZATION.footer, ...(parsed.footer || {}) }
          });
        } catch (e) {
          console.error('Failed to parse saved customization', e);
        }
      }
      const savedOrg = localStorage.getItem('adwiselabs_org_details');
      if (savedOrg) {
        try {
          setOrgDetails({ ...INITIAL_ORG_DETAILS, ...JSON.parse(savedOrg) });
        } catch (e) {
          console.error('Failed to parse saved org details', e);
        }
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    await api.updateOrganization({ ...orgDetails, invoiceCustomization: customization });
    localStorage.setItem('adwiselabs_invoice_customization', JSON.stringify(customization));
    onBack();
  };

  const updateField = (section: keyof InvoiceTemplateCustomization, field: string, key: 'show' | 'label', value: any) => {
    setCustomization(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: {
          ...(prev[section] as any)[field],
          [key]: value
        }
      }
    }));
  };

  const updateSimpleField = (section: keyof InvoiceTemplateCustomization, field: string, value: string) => {
     setCustomization(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const renderTemplate = () => {
    const props = { invoice: previewInvoice, orgDetails, customization };
    switch (templateId) {
      case 'template2': return <Template2 {...props} />;
      case 'template3': return <Template3 {...props} />;
      case 'template1':
      default:
        return <Template1 {...props} />;
    }
  };

  const renderToggleInput = (section: keyof InvoiceTemplateCustomization, field: string, labelText: string) => {
    const fieldData = (customization[section] as any)[field];
    if (!fieldData) return null;
    return (
      <div className="flex items-center justify-between mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="flex-1 mr-4">
          <label className="text-sm font-medium text-slate-700 mb-1 block">{labelText}</label>
          <input
            type="text"
            className="w-full text-sm border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500"
            value={fieldData.label}
            onChange={(e) => updateField(section, field, 'label', e.target.value)}
          />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-500 mb-1">Show</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={fieldData.show}
              onChange={(e) => updateField(section, field, 'show', e.target.checked)}
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-white text-black font-sans w-full">
      {/* Left Panel: Controls */}
      <div className="w-[400px] border-r border-slate-200 flex flex-col bg-white overflow-hidden shadow-xl z-10">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <button onClick={onBack} className="text-slate-500 hover:text-slate-700 flex items-center">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="font-medium">Back</span>
          </button>
          <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center shadow-sm">
            <Save className="w-4 h-4 mr-1.5" />
            Save Changes
          </button>
        </div>
        
        <div className="flex border-b border-slate-200 bg-slate-50">
          {(['general', 'lineItems', 'totals', 'footer'] as const).map(tab => (
            <button
              key={tab}
              className={`flex-1 py-3 text-xs font-semibold capitalize ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.replace(/([A-Z])/g, ' $1').trim()}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5" style={{ scrollbarWidth: 'thin' }}>
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="mb-4">
                <label className="text-sm font-medium text-slate-700 mb-1 block">Primary Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={customization.general.primaryColor}
                    onChange={(e) => updateSimpleField('general', 'primaryColor', e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="text-sm text-slate-600 font-mono">{customization.general.primaryColor}</span>
                </div>
              </div>
              <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="text-sm font-medium text-slate-700 mb-1 block">Invoice Title</label>
                <input
                  type="text"
                  className="w-full text-sm border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  value={customization.general.invoiceTitle}
                  onChange={(e) => updateSimpleField('general', 'invoiceTitle', e.target.value)}
                />
              </div>
              <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="text-sm font-medium text-slate-700 mb-1 block">Bill To Section Label</label>
                <input
                  type="text"
                  className="w-full text-sm border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  value={customization.general.billToLabel}
                  onChange={(e) => updateSimpleField('general', 'billToLabel', e.target.value)}
                />
              </div>

              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 mt-6">Organization Details</h3>
              {renderToggleInput('general', 'orgLogo', 'Logo')}
              {renderToggleInput('general', 'orgName', 'Business Name')}
              {renderToggleInput('general', 'orgAddress', 'Address')}
              {renderToggleInput('general', 'orgEmail', 'Email')}
              {renderToggleInput('general', 'orgPhone', 'Phone')}

              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 mt-6">Invoice Details</h3>
              {renderToggleInput('general', 'customerName', 'Customer Name')}
              {renderToggleInput('general', 'invoiceDate', 'Invoice Date')}
              {renderToggleInput('general', 'dueDate', 'Due Date')}
              {renderToggleInput('general', 'invoiceNumber', 'Invoice Number')}
            </div>
          )}

          {activeTab === 'lineItems' && (
            <div className="space-y-4">
               {renderToggleInput('lineItems', 'itemNo', 'Item Number')}
               {renderToggleInput('lineItems', 'itemDescription', 'Item Description')}
               {renderToggleInput('lineItems', 'itemQuantity', 'Quantity')}
               {renderToggleInput('lineItems', 'itemUnitPrice', 'Unit Price')}
               {renderToggleInput('lineItems', 'itemTaxAmount', 'Tax Amount')}
               {renderToggleInput('lineItems', 'itemTotal', 'Item Total')}
            </div>
          )}

          {activeTab === 'totals' && (
            <div className="space-y-4">
              {renderToggleInput('totals', 'subTotal', 'Sub Total')}
              {renderToggleInput('totals', 'totalTax', 'Total Tax')}
              {renderToggleInput('totals', 'grossTotal', 'Gross Total')}
              {renderToggleInput('totals', 'balance', 'Balance Due')}
            </div>
          )}

          {activeTab === 'footer' && (
            <div className="space-y-4">
              {renderToggleInput('footer', 'paymentDetails', 'Payment Details')}
              {renderToggleInput('footer', 'termsAndConditions', 'Terms & Conditions')}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Live Preview */}
      <div className="flex-1 bg-slate-100 flex items-center justify-center p-8 overflow-hidden relative">
        <div className="absolute inset-0 pattern-dots pattern-slate-300 pattern-bg-white pattern-size-4 pattern-opacity-20" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="bg-white shadow-2xl overflow-hidden rounded flex items-center justify-center" style={{ width: '80%', height: '90%', maxHeight: '1056px', aspectRatio: '210/297' }}>
            <svg viewBox="0 0 800 1056" style={{ width: '100%', height: '100%' }}>
                <foreignObject width="800" height="1056">
                  {renderTemplate()}
                </foreignObject>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
