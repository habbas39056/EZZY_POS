import React, { useState, useEffect } from 'react';
import { X, Printer, Download } from 'lucide-react';
import type { Invoice } from '../../../types/sales';
import type { OrganizationDetails, InvoiceTemplateCustomization } from '../../../types/settings';
import { INITIAL_ORG_DETAILS, DEFAULT_TEMPLATE_CUSTOMIZATION } from '../../../types/settings';
import { Template1 } from '../sales/templates/Template1';
import { Template2 } from '../sales/templates/Template2';
import { Template3 } from '../sales/templates/Template3';
// import { PaymentReceiptTemplate } from '../sales/templates/PaymentReceiptTemplate';
import generatePDF, { Resolution, Margin } from 'react-to-pdf';

interface Props {
  document: Invoice;
  rawDocument?: any;
  onClose: () => void;
  documentType?: 'Invoice' | 'Quotation' | 'Debit Note' | 'Credit Note' | 'Payment Voucher';
}

export const DocumentPrintPreviewModal: React.FC<Props> = ({ document, rawDocument, onClose, documentType = 'Invoice' }) => {
  const [templateId, setTemplateId] = useState('template1');
  const [orgDetails, setOrgDetails] = useState<OrganizationDetails>(INITIAL_ORG_DETAILS);
  const [customization, setCustomization] = useState<InvoiceTemplateCustomization>(DEFAULT_TEMPLATE_CUSTOMIZATION);

  useEffect(() => {
    const savedTemplate = localStorage.getItem('adwiselabs_active_invoice_template');
    if (savedTemplate) setTemplateId(savedTemplate);

    const savedOrg = localStorage.getItem('adwiselabs_org_details');
    if (savedOrg) setOrgDetails(JSON.parse(savedOrg));

    const savedCust = localStorage.getItem('adwiselabs_invoice_customization');
    if (savedCust) setCustomization(JSON.parse(savedCust));
  }, []);

  const getTemplateElement = () => window.document.getElementById('printable-document-content');

  const handleDownloadPdf = () => {
    generatePDF(getTemplateElement, {
      method: 'save',
      filename: `${documentType}_${document.invoiceNumber}.pdf`,
      resolution: Resolution.HIGH,
      page: {
        margin: Margin.NONE,
        format: 'A4',
        orientation: 'portrait',
      },
      canvas: {
        mimeType: 'image/jpeg',
        qualityRatio: 1
      },
      overrides: {
        pdf: {
          compress: true
        }
      }
    });
  };

  const renderTemplate = () => {
    let dynamicTitle: string = documentType;
    let numberLabel = customization.general.invoiceNumber?.label || 'Invoice No.';
    let dateLabel = customization.general.invoiceDate?.label || 'Invoice Date';
    let showBalance = customization.totals.balance?.show ?? true;

    if (documentType === 'Invoice') {
      dynamicTitle = customization.general.invoiceTitle || 'Invoice';
    } else if (documentType === 'Quotation') {
      dynamicTitle = 'QUOTATION';
      numberLabel = 'Quotation No.';
      dateLabel = 'Quotation Date';
      showBalance = false;
    } else if (documentType === 'Credit Note') {
      dynamicTitle = 'CREDIT NOTE';
      numberLabel = 'Credit Note No.';
      dateLabel = 'Date';
    } else if (documentType === 'Debit Note') {
      dynamicTitle = 'DEBIT NOTE';
      numberLabel = 'Debit Note No.';
      dateLabel = 'Date';
    } else if (documentType === 'Payment Voucher') {
      dynamicTitle = rawDocument?.supplierId ? 'Payment Voucher' : 'Payment Receipt';
      numberLabel = 'Voucher / Ref No.';
      dateLabel = 'Payment Date';
      showBalance = false;
    }

    const dynamicCustomization: InvoiceTemplateCustomization = {
      ...customization,
      general: {
        ...customization.general,
        invoiceTitle: dynamicTitle,
        invoiceNumber: {
          ...customization.general.invoiceNumber,
          label: numberLabel
        },
        invoiceDate: {
          ...customization.general.invoiceDate,
          label: dateLabel
        }
      },
      totals: {
        ...customization.totals,
        balance: {
          ...customization.totals.balance,
          show: showBalance
        }
      }
    };

    const props = { invoice: document, orgDetails, customization: dynamicCustomization };
    switch (templateId) {
      case 'template2': return <Template2 {...props} />;
      case 'template3': return <Template3 {...props} />;
      case 'template1':
      default:
        return <Template1 {...props} />;
    }
  };


  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col font-sans text-xs">
      {/* Top Bar - Hidden in print */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 print:hidden">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Printer className="w-4 h-4 text-[#0070ba]" />
          Print / Download {documentType}
        </h3>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
          
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-[#0070ba] hover:bg-sky-700 text-white font-bold rounded shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
          
          <div className="w-px h-6 bg-slate-300 mx-2"></div>
          
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-slate-200/50 p-8 flex justify-center print:p-0 print:bg-white print:overflow-visible">
        {/* Paper Container */}
        <div 
          id="printable-document-content"
          className="bg-white shadow-2xl print:shadow-none w-[210mm] min-h-[297mm] h-[297mm] relative overflow-hidden"
        >
          <svg viewBox="0 0 800 1056" className="w-full h-full">
             <foreignObject width="800" height="1056">
                <div className="w-full h-full bg-white overflow-hidden">
                  {renderTemplate()}
                </div>
             </foreignObject>
          </svg>
        </div>
      </div>

      {/* Print-specific styles to hide everything except the document */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-document-content, #printable-document-content * {
            visibility: visible;
          }
          #printable-document-content {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
            width: 100% !important;
            height: 100% !important;
            box-shadow: none !important;
          }
          @page {
            size: auto;
            margin: 0;
          }
        }
      `}} />
    </div>
  );
};
