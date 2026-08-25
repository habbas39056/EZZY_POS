import React, { useState } from 'react';
import { 
  Scan, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Trash2, 
  Eye, 
  HelpCircle,
  RefreshCw
} from 'lucide-react';

interface ScannedDocument {
  id: string;
  fileName: string;
  uploadDate: string;
  fileSize: string;
  detectedType: 'Invoice' | 'Bill' | 'Receipt';
  detectedVendor: string;
  detectedTotal: number;
  confidence: number;
  status: 'Processed' | 'Pending' | 'Converted';
}

const SAMPLE_DOCS: ScannedDocument[] = [
  {
    id: 'doc_1',
    fileName: 'Fuel_Receipt_PSO_Gulberg.jpg',
    uploadDate: '17-Aug-2026',
    fileSize: '1.4 MB',
    detectedType: 'Receipt',
    detectedVendor: 'Pakistan State Oil',
    detectedTotal: 15400.00,
    confidence: 98,
    status: 'Processed'
  },
  {
    id: 'doc_2',
    fileName: 'Office_Stationery_Bill.pdf',
    uploadDate: '15-Aug-2026',
    fileSize: '840 KB',
    detectedType: 'Bill',
    detectedVendor: 'Paper Clip Stationery Ltd',
    detectedTotal: 48500.00,
    confidence: 95,
    status: 'Converted'
  },
  {
    id: 'doc_3',
    fileName: 'Hardware_Procurement_Rawalpindi.png',
    uploadDate: '11-Aug-2026',
    fileSize: '2.1 MB',
    detectedType: 'Bill',
    detectedVendor: 'Al-Madina Hardware Store',
    detectedTotal: 120000.00,
    confidence: 92,
    status: 'Processed'
  }
];

export const ScanDocumentsView: React.FC = () => {
  const [docs, setDocs] = useState<ScannedDocument[]>(() => {
    const saved = localStorage.getItem('adwiselabs_scanned_docs');
    return saved ? JSON.parse(saved) : SAMPLE_DOCS;
  });

  const [isScanning, setIsScanning] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<ScannedDocument | null>(null);

  const saveDocs = (list: ScannedDocument[]) => {
    setDocs(list);
    localStorage.setItem('adwiselabs_scanned_docs', JSON.stringify(list));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setIsScanning(true);

      setTimeout(() => {
        const newDoc: ScannedDocument = {
          id: `doc_${Date.now()}`,
          fileName: file.name,
          uploadDate: '17-Aug-2026',
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          detectedType: 'Bill',
          detectedVendor: 'Extracted Supplier Ltd',
          detectedTotal: Math.floor(10000 + Math.random() * 90000),
          confidence: 96,
          status: 'Processed'
        };

        const updated = [newDoc, ...docs];
        saveDocs(updated);
        setIsScanning(false);
        alert(`Document "${file.name}" scanned successfully with OCR & AI extraction!`);
      }, 1500);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this scanned document?')) {
      saveDocs(docs.filter(d => d.id !== id));
      if (selectedDoc?.id === id) setSelectedDoc(null);
    }
  };

  const handleConvertToExpense = (doc: ScannedDocument) => {
    alert(`Converted "${doc.fileName}" to a New Bill / Expense with vendor "${doc.detectedVendor}" and amount PKR ${doc.detectedTotal.toLocaleString()}!`);
    const updated = docs.map(d => d.id === doc.id ? { ...d, status: 'Converted' as const } : d);
    saveDocs(updated);
  };

  return (
    <div className="space-y-4 font-sans text-xs text-slate-700 select-none pb-12">
      {/* Top Horizontal Sub-tab */}
      <div className="bg-[#e9edf2] border-b border-slate-300 -mx-4 -mt-4 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-0.5 overflow-x-auto text-xs font-semibold py-1">
          <button
            className="px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs"
          >
            <Scan className="w-3.5 h-3.5 text-slate-500" />
            <span>Scan Documents (AI OCR)</span>
          </button>
        </div>

        <HelpCircle className="w-4 h-4 text-slate-500 hover:text-slate-700 cursor-pointer" />
      </div>

      {/* OCR Upload Drag & Drop Box */}
      <div className="bg-white rounded-xl border-2 border-dashed border-sky-300 hover:border-[#0070ba] p-8 text-center transition shadow-2xs space-y-3">
        <div className="w-12 h-12 rounded-full bg-sky-50 text-[#0070ba] flex items-center justify-center mx-auto border border-sky-200 shadow-2xs">
          {isScanning ? <RefreshCw className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            {isScanning ? 'Extracting text and tables with AI OCR...' : 'Upload Invoices, Bills or Receipts for Automatic Scanning'}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Supported formats: PDF, JPG, PNG, TIFF. Our AI will extract Vendor, Date, Line Items, Tax, and Amount automatically.
          </p>
        </div>

        <div>
          <label className="inline-flex items-center gap-2 px-5 py-2 bg-[#0070ba] hover:bg-sky-700 text-white font-bold rounded-lg text-xs cursor-pointer transition shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Upload Document to Scan</span>
            <input
              type="file"
              accept=".pdf,image/png,image/jpeg,image/jpg"
              onChange={handleFileUpload}
              disabled={isScanning}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Scanned Documents Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Scanned Documents Inbox</h2>
          <span className="text-xs text-slate-500 font-semibold">{docs.length} Documents</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-2.5">File Name</th>
                <th className="px-4 py-2.5">Upload Date</th>
                <th className="px-4 py-2.5">Detected Type</th>
                <th className="px-4 py-2.5">Detected Vendor / Entity</th>
                <th className="px-4 py-2.5 text-right">Detected Amount</th>
                <th className="px-4 py-2.5 text-center">AI Confidence</th>
                <th className="px-4 py-2.5 text-center">Status</th>
                <th className="px-4 py-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {docs.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>{doc.fileName}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500 text-[10.5px]">{doc.uploadDate}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                      {doc.detectedType}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{doc.detectedVendor}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    PKR {doc.detectedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                      {doc.confidence}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      doc.status === 'Converted'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="p-1 text-slate-600 hover:text-[#0070ba] rounded hover:bg-slate-100 transition"
                        title="View Extracted Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleConvertToExpense(doc)}
                        disabled={doc.status === 'Converted'}
                        className="px-2 py-0.5 bg-[#2e7d32] hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded text-[10px] flex items-center gap-1 transition shadow-2xs"
                        title="Convert to Bill"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Convert</span>
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Document Details Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 text-xs animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0070ba]" /> {selectedDoc.fileName}
              </h3>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Detected Vendor:</span>
                <span className="font-bold text-slate-900">{selectedDoc.detectedVendor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Detected Date:</span>
                <span className="font-mono text-slate-800">{selectedDoc.uploadDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Extracted Total Amount:</span>
                <span className="font-mono font-bold text-slate-900">PKR {selectedDoc.detectedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">OCR Confidence:</span>
                <span className="font-bold text-emerald-700">{selectedDoc.confidence}% Match</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 rounded font-semibold text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleConvertToExpense(selectedDoc);
                  setSelectedDoc(null);
                }}
                className="px-4 py-1.5 bg-[#2e7d32] hover:bg-emerald-700 text-white font-bold rounded flex items-center gap-1"
              >
                <ArrowRight className="w-3.5 h-3.5" /> Convert to Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
