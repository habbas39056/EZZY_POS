import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  QrCode, 
  Copy, 
  Check, 
  Info, 
  Sliders, 
  Layers, 
  Eye
} from 'lucide-react';
import type { Product } from '../../../types/catalog';
import { 
  buildProductQRString, 
  generateProductQRCodeDataUrl, 
  printProductQRLabels, 
  type LabelPrintOptions,
  type QRPayloadMode
} from '../../../utils/productQrCode';

interface ProductQRLabelModalProps {
  products: Product[];
  initialSelectedProductId?: string;
  currencySymbol?: string;
  onClose: () => void;
}

export const ProductQRLabelModal: React.FC<ProductQRLabelModalProps> = ({
  products,
  initialSelectedProductId,
  currencySymbol = 'Rs',
  onClose
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialSelectedProductId || (products.length > 0 ? products[0].id : '')
  );
  const [printScope, setPrintScope] = useState<'single' | 'all'>('single');
  const [labelSize, setLabelSize] = useState<'thermal' | 'standard' | 'compact'>('standard');
  const [payloadMode, setPayloadMode] = useState<QRPayloadMode>('formatted');
  const [copiesMode, setCopiesMode] = useState<'fixed' | 'stock'>('fixed');
  const [fixedCopies, setFixedCopies] = useState<number>(1);
  const [showPrice, setShowPrice] = useState(true);
  const [showCategory, setShowCategory] = useState(true);
  const [showSKU, setShowSKU] = useState(true);
  const [showWarranty, setShowWarranty] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [customHeader, setCustomHeader] = useState('');

  const [activeTab, setActiveTab] = useState<'label' | 'scannedData'>('label');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('base');

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  const activeVariant = (selectedProduct?.hasVariants && selectedVariantId !== 'base')
    ? selectedProduct.variants?.find(v => v.id === selectedVariantId)
    : null;

  const displayProduct: Product = (selectedProduct && activeVariant) ? {
    ...selectedProduct,
    name: `${selectedProduct.name} (${activeVariant.name})`,
    code: activeVariant.sku || selectedProduct.code,
    salePrice: activeVariant.salePrice,
    purchasePrice: activeVariant.purchasePrice || selectedProduct.purchasePrice,
    stock: activeVariant.stock !== undefined ? activeVariant.stock : selectedProduct.stock
  } : selectedProduct;

  useEffect(() => {
    setSelectedVariantId('base');
  }, [selectedProductId]);

  useEffect(() => {
    if (!displayProduct) return;
    let isCurrent = true;
    setIsGenerating(true);

    generateProductQRCodeDataUrl(displayProduct, currencySymbol, payloadMode).then(url => {
      if (isCurrent) {
        setQrDataUrl(url);
        setIsGenerating(false);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [displayProduct, currencySymbol, payloadMode]);

  if (!selectedProduct || !displayProduct) {
    return null;
  }

  const qrString = buildProductQRString(displayProduct, currencySymbol, payloadMode);

  const handleCopyText = () => {
    navigator.clipboard.writeText(qrString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_${displayProduct.code || displayProduct.name}.png`;
    a.click();
  };


  const handlePrint = async () => {
    const productsToPrint = printScope === 'all' ? products : [selectedProduct];
    const options: LabelPrintOptions = {
      labelSize,
      copiesPerProduct: copiesMode === 'stock' ? 'stock' : fixedCopies,
      showPrice,
      showCategory,
      showSKU,
      showWarranty,
      showLocation,
      customHeader: customHeader.trim(),
      payloadMode
    };

    await printProductQRLabels(productsToPrint, currencySymbol, options);
  };

  const totalLabelsCount = printScope === 'all'
    ? products.reduce((acc, p) => acc + (copiesMode === 'stock' ? Math.max(1, p.stock || 1) : fixedCopies), 0)
    : (copiesMode === 'stock' ? Math.max(1, selectedProduct.stock || 1) : fixedCopies);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-xs text-slate-700">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0070ba] flex items-center justify-center border border-sky-200">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Product QR Code & Label Generator</h2>
              <p className="text-[11px] text-slate-500">
                Scan QR code with any smartphone camera to view full product information
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 p-1.5 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Left / Settings Column (5 cols) */}
          <div className="md:col-span-5 space-y-4 border-r border-slate-100 pr-0 md:pr-4">
            
            {/* 1. Scope & Product Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#0070ba]" />
                Print Scope
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPrintScope('single')}
                  className={`py-1.5 px-3 rounded border text-xs font-semibold transition ${
                    printScope === 'single'
                      ? 'bg-sky-50 border-[#0070ba] text-[#0070ba]'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Current Product
                </button>
                <button
                  type="button"
                  onClick={() => setPrintScope('all')}
                  className={`py-1.5 px-3 rounded border text-xs font-semibold transition ${
                    printScope === 'all'
                      ? 'bg-sky-50 border-[#0070ba] text-[#0070ba]'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Products ({products.length})
                </button>
              </div>
            </div>

            {/* Product Dropdown if multiple products available */}
            {products.length > 1 && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select Product Preview
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-[#0070ba]"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Product Variation Selector */}
            {selectedProduct?.hasVariants && selectedProduct.variants && selectedProduct.variants.length > 0 && (
              <div className="bg-sky-50/60 border border-sky-200 rounded-md p-2.5 space-y-1">
                <label className="block text-[11px] font-bold text-slate-800 flex items-center justify-between">
                  <span>Product Variation</span>
                  <span className="text-[10px] text-[#0070ba] font-bold">({selectedProduct.variants.length} tiers)</span>
                </label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-[#0070ba]"
                >
                  <option value="base">Base Product — {currencySymbol} {selectedProduct.salePrice.toLocaleString()}</option>
                  {selectedProduct.variants.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} {v.sku ? `[${v.sku}]` : ''} — {currencySymbol} {v.salePrice.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            )}


            {/* 2. Label Size / Layout */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#0070ba]" />
                Label Dimensions
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'standard', label: 'Standard', desc: '2.5" × 1.5"' },
                  { id: 'thermal', label: 'Thermal', desc: '50 × 30mm' },
                  { id: 'compact', label: 'Compact', desc: '2" × 1"' }
                ].map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setLabelSize(s.id as any)}
                    className={`p-2 rounded border text-center transition cursor-pointer ${
                      labelSize === s.id
                        ? 'bg-sky-50 border-[#0070ba] text-[#0070ba] font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs">{s.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Scanned QR Content Format */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-[#0070ba]" />
                QR Scanned Content Format
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'formatted', label: 'Standard Text', desc: 'Clean mobile summary' },
                  { id: 'detailed', label: 'Full Details', desc: 'All specs & cost info' },
                  { id: 'json', label: 'JSON Data', desc: 'For POS / Scanners' },
                  { id: 'codeOnly', label: 'SKU Only', desc: 'Direct barcode value' }
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPayloadMode(m.id as any)}
                    className={`p-2 rounded border text-left transition cursor-pointer ${
                      payloadMode === m.id
                        ? 'bg-sky-50 border-[#0070ba] text-[#0070ba] font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs">{m.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Copies per product */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Quantity / Copies
              </label>
              <div className="flex items-center gap-2 mb-2">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="copiesMode"
                    checked={copiesMode === 'fixed'}
                    onChange={() => setCopiesMode('fixed')}
                    className="text-[#0070ba]"
                  />
                  <span>Fixed count:</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  disabled={copiesMode !== 'fixed'}
                  value={fixedCopies}
                  onChange={(e) => setFixedCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-2 py-1 border border-slate-300 rounded text-xs text-center disabled:bg-slate-100"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="copiesMode"
                    checked={copiesMode === 'stock'}
                    onChange={() => setCopiesMode('stock')}
                    className="text-[#0070ba]"
                  />
                  <span>Print based on In-Stock Quantity</span>
                </label>
              </div>
            </div>

            {/* 4. Display Content Toggles */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Visible Details on Sticker
              </label>
              
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={showPrice}
                    onChange={(e) => setShowPrice(e.target.checked)}
                    className="rounded text-[#0070ba]"
                  />
                  <span>Sale Price</span>
                </label>

                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={showSKU}
                    onChange={(e) => setShowSKU(e.target.checked)}
                    className="rounded text-[#0070ba]"
                  />
                  <span>SKU / Code</span>
                </label>

                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={showCategory}
                    onChange={(e) => setShowCategory(e.target.checked)}
                    className="rounded text-[#0070ba]"
                  />
                  <span>Category</span>
                </label>

                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={showLocation}
                    onChange={(e) => setShowLocation(e.target.checked)}
                    className="rounded text-[#0070ba]"
                  />
                  <span>Location</span>
                </label>

                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={showWarranty}
                    onChange={(e) => setShowWarranty(e.target.checked)}
                    className="rounded text-[#0070ba]"
                  />
                  <span>Warranty</span>
                </label>
              </div>

              <div className="pt-2">
                <label className="block text-[10px] text-slate-500 mb-1">
                  Custom Header / Company Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. EZZY POS / Store Name"
                  value={customHeader}
                  onChange={(e) => setCustomHeader(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-[#0070ba]"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Live Preview & Scanned Info (7 cols) */}
          <div className="md:col-span-7 flex flex-col space-y-4">
            
            {/* Tabs for Live Preview vs Scanned Content */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('label')}
                  className={`px-3 py-1 rounded-md font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'label'
                      ? 'bg-sky-50 text-[#0070ba] border border-sky-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Sticker Preview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('scannedData')}
                  className={`px-3 py-1 rounded-md font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'scannedData'
                      ? 'bg-sky-50 text-[#0070ba] border border-sky-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Info className="w-3.5 h-3.5" />
                  Scanned Info Preview
                </button>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={handleDownloadQR}
                  title="Download high-resolution QR PNG image"
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded transition flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download QR</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyText}
                  title="Copy formatted text to clipboard"
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded transition flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? 'Copied' : 'Copy Data'}</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'label' ? (
              <div className="flex-1 min-h-[300px] bg-slate-100 rounded-xl p-6 flex flex-col items-center justify-center border border-slate-200">
                <div className="text-[11px] text-slate-500 mb-3 font-medium">
                  Realistic Sticker Print Preview:
                </div>

                {/* STICKER CONTAINER */}
                <div 
                  className={`bg-white rounded-lg border-2 border-dashed border-slate-300 shadow-lg p-4 flex flex-col items-center text-center transition-all ${
                    labelSize === 'thermal' ? 'w-[220px]' : labelSize === 'compact' ? 'w-[200px]' : 'w-[260px]'
                  }`}
                >
                  {customHeader && (
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                      {customHeader}
                    </div>
                  )}

                  <div className="text-xs font-bold text-slate-900 line-clamp-2 mb-1">
                    {selectedProduct.name}
                  </div>

                  <div className="my-2 bg-white p-1 rounded border border-slate-100 shadow-2xs">
                    {isGenerating || !qrDataUrl ? (
                      <div className="w-28 h-28 flex items-center justify-center bg-slate-50 text-slate-400">
                        Generating...
                      </div>
                    ) : (
                      <img
                        src={qrDataUrl}
                        alt="Product QR Code"
                        className="w-28 h-28 object-contain"
                      />
                    )}
                  </div>

                  {showSKU && (
                    <div className="text-[11px] font-mono text-slate-700 mb-0.5">
                      SKU: <strong className="text-slate-900">{selectedProduct.code}</strong>
                    </div>
                  )}

                  {showPrice && (
                    <div className="text-sm font-extrabold text-slate-900 my-0.5">
                      {currencySymbol} {Number(selectedProduct.salePrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 font-medium">
                    {showCategory && selectedProduct.categoryName && (
                      <span>{selectedProduct.categoryName}</span>
                    )}
                    {showLocation && selectedProduct.location && (
                      <span> • {selectedProduct.location}</span>
                    )}
                  </div>

                  {showWarranty && selectedProduct.warrantyDetails && (
                    <div className="text-[9px] text-slate-400 mt-0.5">
                      Wty: {selectedProduct.warrantyDetails}
                    </div>
                  )}

                  <div className="w-full mt-2 pt-1 border-t border-slate-100 text-[8px] uppercase tracking-wider text-slate-400">
                    Scan for full product info
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 mt-3 text-center">
                  Fits standard thermal barcode/QR roll stickers and multi-label sticker paper
                </p>
              </div>
            ) : (
              /* TAB 2: SCANNED INFORMATION PREVIEW */
              <div className="flex-1 bg-slate-900 text-emerald-400 font-mono rounded-xl p-4 text-xs overflow-y-auto border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-[11px] border-b border-slate-800 pb-2 mb-2 font-sans">
                  <span>📱 Phone Scanner / Camera Decoded Text:</span>
                  <span className="text-[10px] text-slate-500">Universal Plaintext Payload</span>
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed text-[11px]">
                  {qrString}
                </pre>
              </div>
            )}

            {/* Total Count Summary */}
            <div className="bg-sky-50/70 border border-sky-200/80 rounded-lg px-3.5 py-2.5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">
                  Ready to print: <span className="text-[#0070ba]">{totalLabelsCount}</span> {totalLabelsCount === 1 ? 'sticker label' : 'sticker labels'}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {printScope === 'all' ? `Across all ${products.length} catalog products` : `For ${selectedProduct.name}`}
                </span>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2 bg-[#0070ba] hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print QR Labels</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
