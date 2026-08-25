import React, { useState, useEffect } from 'react';
import { Palette, Check, Settings2 } from 'lucide-react';
import type { OrganizationDetails, InvoiceTemplateCustomization } from '../../../types/settings';
import { INITIAL_ORG_DETAILS, DEFAULT_TEMPLATE_CUSTOMIZATION } from '../../../types/settings';
import type { Invoice } from '../../../types/sales';
import { Template1 } from './templates/Template1';
import { Template2 } from './templates/Template2';
import { Template3 } from './templates/Template3';
import { InvoiceCustomizationScreen } from './InvoiceCustomizationScreen';

interface InvoiceTemplateOption {
  id: string;
  name: string;
  category: string;
  description: string;
  component: React.FC<any>;
}

const TEMPLATES: InvoiceTemplateOption[] = [
  {
    id: 'template1',
    name: 'Template 1',
    category: 'Classic',
    description: 'Classic layout with logo on left, details on right. Payment details in solid block.',
    component: Template1
  },
  {
    id: 'template2',
    name: 'Template 2',
    category: 'Banner',
    description: 'Bold dark top banner, high contrast tables, and professional layout.',
    component: Template2
  },
  {
    id: 'template3',
    name: 'Template 3',
    category: 'Modern',
    description: 'Clean header bar, itemized totals, structured breakdowns.',
    component: Template3
  }
];

const sampleInvoice: Invoice = {
  id: 'inv_sample',
  invoiceNumber: '11011',
  customerId: 'c_1',
  customerName: 'Arsalan Haider',
  invoiceDate: '15-Jun-2023',
  dueDate: '25-Jun-2023',
  requiresDeliveryChallan: false,
  discountType: 'Discount by Amount',
  items: [
    { id: 'i1', itemDescription: 'Product 1', qty: 10, unitPrice: 100, taxAmount: 100, netAmount: 1000, batchNumber: '', batchExpiryDate: '', uom: 'pcs', location: '', discount: 0, account: '', taxRatePercent: 0 },
    { id: 'i2', itemDescription: 'Product 2', qty: 10, unitPrice: 50, taxAmount: 50, netAmount: 500, batchNumber: '', batchExpiryDate: '', uom: 'pcs', location: '', discount: 0, account: '', taxRatePercent: 0 },
    { id: 'i3', itemDescription: 'Product 3', qty: 10, unitPrice: 200, taxAmount: 200, netAmount: 2000, batchNumber: '', batchExpiryDate: '', uom: 'pcs', location: '', discount: 0, account: '', taxRatePercent: 0 },
  ],
  isTaxInclusive: false,
  subtotal: 3500,
  discount: 0,
  totalTax: 350,
  grossTotal: 3500,
  balance: 0,
  status: 'Approved',
  createdAt: '2023-06-15'
};

export const InvoiceTemplatesView: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(() => {
    return localStorage.getItem('adwiselabs_active_invoice_template') || 'template1';
  });

  const [orgDetails, setOrgDetails] = useState<OrganizationDetails>(() => {
    const saved = localStorage.getItem('adwiselabs_org_details');
    return saved ? JSON.parse(saved) : INITIAL_ORG_DETAILS;
  });

  const [customization, setCustomization] = useState<InvoiceTemplateCustomization>(() => {
    const saved = localStorage.getItem('adwiselabs_invoice_customization');
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATE_CUSTOMIZATION;
  });

  const [previewingTmpl, setPreviewingTmpl] = useState<InvoiceTemplateOption | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);

  useEffect(() => {
    localStorage.setItem('adwiselabs_org_details', JSON.stringify(orgDetails));
  }, [orgDetails]);

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplate(id);
    localStorage.setItem('adwiselabs_active_invoice_template', id);
    alert('Active invoice print template updated successfully!');
  };

  if (isCustomizing) {
    return (
      <InvoiceCustomizationScreen 
        templateId={selectedTemplate}
        onBack={() => {
          setIsCustomizing(false);
          const savedCust = localStorage.getItem('adwiselabs_invoice_customization');
          if (savedCust) setCustomization(JSON.parse(savedCust));
          const savedOrg = localStorage.getItem('adwiselabs_org_details');
          if (savedOrg) setOrgDetails(JSON.parse(savedOrg));
        }}
      />
    );
  }

  return (
    <div className="space-y-6 font-sans text-xs text-slate-700 select-none pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800">Invoice Print & PDF Templates</h2>
          <p className="text-xs text-slate-500">Choose the standard design used when printing or emailing invoices to your customers.</p>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TEMPLATES.map(tmpl => {
          const isSelected = selectedTemplate === tmpl.id;
          const TemplateComponent = tmpl.component;
          return (
            <div
              key={tmpl.id}
              className={`bg-white rounded-xl border p-4 space-y-4 shadow-xs flex flex-col justify-between ${
                isSelected ? 'border-[#0070ba] ring-2 ring-sky-100' : 'border-slate-200'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 z-10 translate-x-2 -translate-y-2">
                  <div className="bg-rose-600 text-white text-[10px] font-extrabold px-6 py-1 transform rotate-45 shadow-sm">
                    DEFAULT
                  </div>
                </div>
              )}

              <div className="space-y-3 flex-1 relative overflow-hidden">
                <div className="relative group cursor-pointer" onClick={() => setPreviewingTmpl(tmpl)}>
                  <svg viewBox="0 0 896 1056" className="w-full h-auto rounded-lg border border-slate-200 shadow-sm bg-slate-50 block">
                    <foreignObject width="896" height="1056">
                      <div className="w-full h-full bg-white overflow-hidden pointer-events-none">
                        <TemplateComponent invoice={sampleInvoice} orgDetails={orgDetails} customization={customization} />
                      </div>
                    </foreignObject>
                  </svg>
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold text-xs gap-1 rounded-lg pointer-events-none">
                    Click to Preview Full Size
                  </div>
                </div>

                <div className="text-center pt-2">
                  <h3 className="text-sm font-bold text-slate-900">{tmpl.name}</h3>
                  <span className="text-[11px] text-slate-500 block mt-1">{tmpl.description}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2">
                {isSelected ? (
                  <button
                    disabled
                    className="flex-1 py-2 bg-[#001e3d] text-white border border-[#001e3d] font-bold rounded text-xs cursor-default flex items-center justify-center gap-1 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" /> Active
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-[#001e3d] hover:text-white text-slate-700 font-bold rounded text-xs transition shadow-xs"
                  >
                    Set Default
                  </button>
                )}
                
                <button
                  onClick={() => setIsCustomizing(true)}
                  className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded text-xs transition shadow-xs flex items-center justify-center gap-1"
                >
                  <Settings2 className="w-3.5 h-3.5" /> Customize
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewingTmpl && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-xs">
          <div className="bg-slate-50 rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b bg-white px-6 py-4 rounded-t-xl shrink-0">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#0070ba]" /> {previewingTmpl.name} Preview
              </h3>
              <button onClick={() => setPreviewingTmpl(null)} className="text-slate-400 hover:text-slate-700 font-bold text-xl leading-none">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-200/50 flex justify-center items-start">
               {/* Render Actual Invoice Template */}
               <div className="shadow-2xl">
                 <previewingTmpl.component invoice={sampleInvoice} orgDetails={orgDetails} customization={customization} />
               </div>
            </div>

            <div className="flex justify-between items-center bg-white px-6 py-4 border-t shrink-0 rounded-b-xl">
               <button onClick={() => { setPreviewingTmpl(null); setIsCustomizing(true); }} className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-sm transition flex items-center gap-2">
                  <Settings2 className="w-4 h-4" /> Customize Details
               </button>
               <div className="flex space-x-3">
                 <button onClick={() => setPreviewingTmpl(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-sm transition">
                   Close
                 </button>
                 <button
                   onClick={() => {
                     handleSelectTemplate(previewingTmpl.id);
                     setPreviewingTmpl(null);
                   }}
                   className="px-6 py-2.5 bg-[#0070ba] hover:bg-sky-700 text-white font-bold rounded-lg text-sm transition shadow-sm"
                 >
                   Use This Template
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
