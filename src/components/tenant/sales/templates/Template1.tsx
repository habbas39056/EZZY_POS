import React from 'react';
import type { Invoice } from '../../../../types/sales';
import type { OrganizationDetails, InvoiceTemplateCustomization } from '../../../../types/settings';

export interface InvoiceTemplateProps {
  invoice: Invoice;
  orgDetails: OrganizationDetails;
  customization: InvoiceTemplateCustomization;
}

export const Template1: React.FC<InvoiceTemplateProps> = ({ invoice, orgDetails, customization }) => {
  const { general, lineItems, totals, footer } = customization;
  const primaryColor = general.primaryColor;

  return (
    <div className="bg-white text-black p-8 font-sans w-full max-w-4xl mx-auto border border-slate-200 shadow-sm" style={{ minHeight: '1056px' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="w-1/2">
          {general.orgLogo.show && (
            orgDetails.logoUrl ? (
              <img src={orgDetails.logoUrl} alt="Logo" className="h-16 object-contain mb-2" />
            ) : (
              <div className="w-16 h-16 rounded-full text-white flex items-center justify-center text-3xl font-bold italic mb-2" style={{ backgroundColor: primaryColor }}>
                {(orgDetails.businessName || 'Company').substring(0, 2).toUpperCase()}
              </div>
            )
          )}
          {general.orgName.show && (
            <h2 className="text-lg font-bold" style={{ color: primaryColor }}>{orgDetails.businessName}</h2>
          )}
        </div>
        <div className="w-1/2 text-right text-[11px] leading-tight text-slate-700 space-y-0.5">
          {general.orgName.show && <p className="font-semibold">{orgDetails.businessName}</p>}
          {general.orgAddress.show && <p>{orgDetails.address}</p>}
          {general.orgAddress.show && <p>{orgDetails.city}, {orgDetails.province}</p>}
          {general.orgAddress.show && <p>{orgDetails.country}</p>}
          {general.orgAddress.show && <p>{orgDetails.postCode}</p>}
          {general.orgPhone.show && <p>{orgDetails.phone}</p>}
          {general.orgEmail.show && <p>{orgDetails.organizationEmail}</p>}
        </div>
      </div>

      <div className="text-right mb-6">
        <h1 className="text-3xl font-bold" style={{ color: primaryColor }}>{general.invoiceTitle}</h1>
      </div>

      {/* Bill To & Meta Info */}
      <div className="grid grid-cols-4 gap-4 mb-8 text-sm">
        <div>
          <h3 className="font-bold text-slate-800 border-b-2 pb-1 mb-2" style={{ borderColor: primaryColor }}>{general.billToLabel}</h3>
          {general.customerName.show && <p className="text-slate-700">{invoice.customerName}</p>}
        </div>
        {general.invoiceDate.show && (
          <div>
            <h3 className="font-bold text-slate-800 border-b-2 pb-1 mb-2" style={{ borderColor: primaryColor }}>{general.invoiceDate.label}</h3>
            <p className="text-slate-700">{invoice.invoiceDate}</p>
          </div>
        )}
        {general.invoiceNumber.show && (
          <div>
            <h3 className="font-bold text-slate-800 border-b-2 pb-1 mb-2" style={{ borderColor: primaryColor }}>{general.invoiceNumber.label}</h3>
            <p className="text-slate-700">{invoice.invoiceNumber}</p>
          </div>
        )}
        {totals.grossTotal.show && (
          <div>
            <h3 className="font-bold text-slate-800 border-b-2 pb-1 mb-2" style={{ borderColor: primaryColor }}>{totals.grossTotal.label}</h3>
            <p className="text-slate-700">{invoice.grossTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        )}
        {totals.balance.show && (
          <div>
            <h3 className="font-bold text-slate-800 mt-2">{totals.balance.label}: {invoice.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          </div>
        )}
        {general.dueDate.show && (
          <div>
            <h3 className="font-bold text-slate-800 border-b-2 pb-1 mb-2 mt-2" style={{ borderColor: primaryColor }}>{general.dueDate.label}</h3>
            <p className="text-slate-700">{invoice.dueDate}</p>
          </div>
        )}
      </div>

      {/* Items Table */}
      <table className="w-full text-left mb-8 border-collapse">
        <thead>
          <tr className="border-b-2" style={{ borderColor: primaryColor }}>
            {lineItems.itemNo.show && <th className="py-2 text-sm font-bold text-slate-800">{lineItems.itemNo.label}</th>}
            {lineItems.itemDescription.show && <th className="py-2 text-sm font-bold text-slate-800">{lineItems.itemDescription.label}</th>}
            {lineItems.itemQuantity.show && <th className="py-2 text-sm font-bold text-slate-800 text-center">{lineItems.itemQuantity.label}</th>}
            {lineItems.itemUnitPrice.show && <th className="py-2 text-sm font-bold text-slate-800 text-right">{lineItems.itemUnitPrice.label}</th>}
            {lineItems.itemTaxAmount.show && <th className="py-2 text-sm font-bold text-slate-800 text-right">{lineItems.itemTaxAmount.label}</th>}
            {lineItems.itemTotal.show && <th className="py-2 text-sm font-bold text-slate-800 text-right">{lineItems.itemTotal.label}</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {invoice.items.map((item, idx) => (
            <tr key={idx}>
              {lineItems.itemNo.show && <td className="py-3 text-sm text-slate-700">{idx + 1}</td>}
              {lineItems.itemDescription.show && <td className="py-3 text-sm text-slate-700">{item.itemDescription}</td>}
              {lineItems.itemQuantity.show && <td className="py-3 text-sm text-slate-700 text-center">{item.qty}</td>}
              {lineItems.itemUnitPrice.show && <td className="py-3 text-sm text-slate-700 text-right">{(item.unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>}
              {lineItems.itemTaxAmount.show && <td className="py-3 text-sm text-slate-700 text-right">{(item.taxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>}
              {lineItems.itemTotal.show && <td className="py-3 text-sm text-slate-700 text-right">{(item.netAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer Section: Payment & Totals */}
      <div className="flex justify-between items-start mt-10">
        <div className="w-1/2 pr-8">
          {footer.paymentDetails.show && (
            <>
              <div className="text-white px-3 py-1 font-bold inline-block mb-3 uppercase text-xs" style={{ backgroundColor: primaryColor }}>
                {footer.paymentDetails.label}
              </div>
              <div className="text-[11px] leading-tight text-slate-700 space-y-0.5">
                <p>Bank Name: {orgDetails.bankName || 'Standard Chartered'}</p>
                <p>IBAN: {orgDetails.iban || 'PK32SCBL00000012345678'}</p>
                <p>Account Title: {orgDetails.accountTitle || orgDetails.businessName}</p>
                <p>Account No: {orgDetails.accountNo || '0105180'}</p>
              </div>
            </>
          )}
        </div>
        <div className="w-1/2 pl-8">
          <div className="space-y-3 text-sm">
            {totals.subTotal.show && (
              <div className="flex justify-between border-b pb-2 border-slate-200">
                <span className="font-bold text-slate-800">{totals.subTotal.label}</span>
                <span>{invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {totals.totalTax.show && (
              <div className="flex justify-between border-b pb-2 border-slate-200">
                <span className="font-bold text-slate-800">{totals.totalTax.label}</span>
                <span>{invoice.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {totals.grossTotal.show && (
              <div className="flex justify-between border-b pb-2 border-slate-200">
                <span className="font-bold text-slate-800">{totals.grossTotal.label}</span>
                <span>{invoice.grossTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {totals.balance.show && (
              <>
                <div className="flex justify-between border-b pb-2 border-slate-200 pt-2">
                  <span className="font-bold text-slate-800">Amount Paid</span>
                  <span>{(invoice.paidAmount !== undefined ? invoice.paidAmount : (invoice.grossTotal - invoice.balance)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold pt-2">
                  <span className="text-slate-800">{totals.balance.label}</span>
                  <span>{invoice.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {footer.termsAndConditions.show && (
        <div className="mt-16 text-xs text-slate-700">
          <p className="font-bold mb-1">{footer.termsAndConditions.label}:</p>
          <p>{orgDetails.termsAndConditions}</p>
        </div>
      )}
    </div>
  );
};
