import QRCode from 'qrcode';
import type { Product } from '../types/catalog';

export type QRPayloadMode = 'formatted' | 'detailed' | 'json' | 'codeOnly';

export interface LabelPrintOptions {
  labelSize?: 'thermal' | 'standard' | 'compact' | 'sheet';
  copiesPerProduct?: number | 'stock';
  showPrice?: boolean;
  showCategory?: boolean;
  showSKU?: boolean;
  showWarranty?: boolean;
  showLocation?: boolean;
  customHeader?: string;
  payloadMode?: QRPayloadMode;
}

/**
 * Builds a clear, structured text payload containing all product information
 * that any standard smartphone camera or QR scanner can read immediately.
 */
export function buildProductQRString(
  product: Product, 
  currencySymbol: string = 'Rs',
  mode: QRPayloadMode = 'formatted'
): string {
  if (mode === 'codeOnly') {
    return product.code || product.name || 'UNKNOWN';
  }

  if (mode === 'json') {
    return JSON.stringify({
      id: product.id,
      name: product.name,
      code: product.code,
      category: product.categoryName,
      department: product.departmentName || undefined,
      salePrice: product.salePrice,
      purchasePrice: product.purchasePrice,
      stock: product.stock,
      unitOfMeasure: product.unitOfMeasure || 'Pcs',
      location: product.location,
      isActive: product.isActive,
      warranty: product.warrantyDetails || undefined,
      variants: product.variationOptions || undefined,
      description: product.description || undefined,
      createdOn: product.createdOn
    }, null, 2);
  }

  const lines: string[] = [
    `📦 PRODUCT DETAILS`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Name: ${product.name || 'N/A'}`,
    `Code / SKU: ${product.code || 'N/A'}`,
    `Category: ${product.categoryName || 'General'}`
  ];

  if (product.departmentName) {
    lines.push(`Department: ${product.departmentName}`);
  }

  lines.push(`Sale Price: ${currencySymbol} ${Number(product.salePrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);

  if (mode === 'detailed' && product.purchasePrice !== undefined && product.purchasePrice > 0) {
    lines.push(`Purchase Price: ${currencySymbol} ${Number(product.purchasePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  }

  lines.push(`Stock: ${product.stock ?? 0} ${product.unitOfMeasure || 'Pcs'}`);

  if (product.location) {
    lines.push(`Location: ${product.location}`);
  }

  lines.push(`Status: ${product.isActive ? 'Active' : 'Inactive'}`);

  if (product.warrantyDetails && product.warrantyDetails.trim()) {
    lines.push(`Warranty: ${product.warrantyDetails.trim()}`);
  }

  if (product.variationOptions && product.variationOptions.length > 0) {
    lines.push(`Variants: ${product.variationOptions.join(', ')}`);
  }

  if (product.description && product.description.trim()) {
    lines.push(`Description: ${product.description.trim()}`);
  }

  if (mode === 'detailed' && product.createdOn) {
    lines.push(`Added On: ${product.createdOn}`);
  }

  return lines.join('\n');
}

/**
 * Generates a high-quality Base64 Data URL (PNG) of the product's QR code.
 */
export async function generateProductQRCodeDataUrl(
  product: Product,
  currencySymbol: string = 'Rs',
  mode: QRPayloadMode = 'formatted'
): Promise<string> {
  const qrData = buildProductQRString(product, currencySymbol, mode);
  try {
    const dataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 250,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code for product:', product.name, err);
    return '';
  }
}

/**
 * Generates QR code data URLs for multiple products and opens a printable window.
 */
export async function printProductQRLabels(
  products: Product[],
  currencySymbol: string = 'Rs',
  options: LabelPrintOptions = {}
): Promise<void> {
  const {
    labelSize = 'standard',
    copiesPerProduct = 1,
    showPrice = true,
    showCategory = true,
    showSKU = true,
    showWarranty = true,
    showLocation = true,
    customHeader = '',
    payloadMode = 'formatted'
  } = options;

  if (!products || products.length === 0) {
    alert('No products to print labels for.');
    return;
  }

  // Pre-generate QR codes for each product
  const productQRCodes: { product: Product; qrUrl: string; copies: number }[] = [];

  for (const product of products) {
    const qrUrl = await generateProductQRCodeDataUrl(product, currencySymbol, payloadMode);
    const copies = copiesPerProduct === 'stock'
      ? Math.max(1, Number(product.stock) || 1)
      : Math.max(1, Number(copiesPerProduct) || 1);

    productQRCodes.push({ product, qrUrl, copies });
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print QR labels.');
    return;
  }

  const isThermal = labelSize === 'thermal';
  const isCompact = labelSize === 'compact';
  const labelWidth = isThermal ? '220px' : isCompact ? '200px' : '260px';
  const labelPadding = isCompact ? '6px' : '10px';

  let labelsHtml = '';

  productQRCodes.forEach(({ product, qrUrl, copies }) => {
    const vars = product.variationOptions?.length ? product.variationOptions.join(', ') : '';
    const warr = product.warrantyDetails ? `Wty: ${product.warrantyDetails}` : '';

    const singleLabel = `
      <div class="qr-label">
        ${customHeader ? `<div class="store-name">${customHeader}</div>` : ''}
        <div class="product-name">${escapeHtml(product.name)}</div>
        
        <div class="qr-container">
          <img src="${qrUrl}" alt="QR Code" class="qr-image" />
        </div>

        ${showSKU ? `<div class="sku">SKU: <strong>${escapeHtml(product.code)}</strong></div>` : ''}
        
        ${showPrice ? `
          <div class="price">
            ${currencySymbol} ${Number(product.salePrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        ` : ''}

        <div class="meta-row">
          ${showCategory && product.categoryName ? `<span>${escapeHtml(product.categoryName)}</span>` : ''}
          ${showLocation && product.location ? `<span> • ${escapeHtml(product.location)}</span>` : ''}
        </div>

        ${showWarranty && warr ? `<div class="meta-small">${escapeHtml(warr)}</div>` : ''}
        ${vars ? `<div class="meta-small">${escapeHtml(vars)}</div>` : ''}
        <div class="scan-hint">Scan for full product info</div>
      </div>
    `;

    for (let i = 0; i < copies; i++) {
      labelsHtml += singleLabel;
    }
  });

  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Product QR Code Labels</title>
        <style>
          @page {
            margin: 8mm;
            size: auto;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #ffffff;
            color: #111827;
            padding: 10px;
          }
          .labels-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            align-items: flex-start;
            justify-content: flex-start;
          }
          .qr-label {
            width: ${labelWidth};
            border: 1px dashed #cbd5e1;
            border-radius: 6px;
            padding: ${labelPadding};
            text-align: center;
            background: #ffffff;
            page-break-inside: avoid;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .store-name {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            font-weight: 700;
            margin-bottom: 2px;
          }
          .product-name {
            font-size: 13px;
            font-weight: 700;
            line-height: 1.25;
            color: #0f172a;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            margin-bottom: 4px;
          }
          .qr-container {
            margin: 4px 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .qr-image {
            width: 130px;
            height: 130px;
            object-fit: contain;
            image-rendering: pixelated;
          }
          .sku {
            font-size: 11px;
            color: #334155;
            letter-spacing: 0.2px;
            margin-bottom: 2px;
          }
          .price {
            font-size: 15px;
            font-weight: 800;
            color: #000000;
            margin: 2px 0 3px;
          }
          .meta-row {
            font-size: 10px;
            color: #64748b;
            font-weight: 500;
          }
          .meta-small {
            font-size: 9px;
            color: #64748b;
            margin-top: 1px;
          }
          .scan-hint {
            font-size: 8px;
            color: #94a3b8;
            margin-top: 4px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            border-top: 1px solid #f1f5f9;
            padding-top: 2px;
            width: 100%;
          }
          @media print {
            body {
              padding: 0;
              background: none;
            }
            .labels-grid {
              gap: 8px;
            }
            .qr-label {
              border: 1px solid #94a3b8;
              box-shadow: none;
            }
            .scan-hint {
              color: #64748b;
            }
          }
        </style>
      </head>
      <body>
        <div class="labels-grid">
          ${labelsHtml}
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(fullHtml);
  printWindow.document.close();
  printWindow.focus();

  // Wait for images to load before printing
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

function escapeHtml(str?: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
