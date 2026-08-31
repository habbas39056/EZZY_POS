import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { resizeImageTo300x300, type ProcessedImageResult } from '../../../utils/imageResize';

interface ImageUpload300x300Props {
  value?: string;
  onChange: (dataUrl: string) => void;
  label?: string;
  description?: string;
}

export const ImageUpload300x300: React.FC<ImageUpload300x300Props> = ({
  value,
  onChange,
  label = 'Product Picture',
  description = 'Restricted to max 300 × 300 px (Auto-optimized)'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setInfo(null);
    setIsProcessing(true);

    try {
      const result: ProcessedImageResult = await resizeImageTo300x300(file);
      onChange(result.dataUrl);
      setInfo(`${result.width} × ${result.height} px • ${result.fileSizeKb} KB`);
    } catch (err: any) {
      setError(err?.message || 'Failed to process image');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setInfo(null);
    setError(null);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-slate-600 font-medium text-xs flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#0070ba]" />
          {label}
        </label>
        <span className="text-[10px] text-slate-400 font-normal">
          {description}
        </span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="relative group inline-flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="relative w-20 h-20 bg-white border border-slate-200 rounded-md overflow-hidden flex items-center justify-center shadow-2xs">
            <img
              src={value}
              alt="Uploaded Preview"
              className="w-full h-full object-contain"
            />
            <button
              type="button"
              onClick={handleRemove}
              title="Remove Picture"
              className="absolute top-1 right-1 bg-slate-900/70 hover:bg-rose-600 text-white rounded-full p-1 transition shadow cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="text-xs space-y-1">
            <div className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Optimized (≤ 300×300 px)</span>
            </div>
            {info && (
              <div className="text-[10px] text-slate-500 font-mono">
                {info}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] text-[#0070ba] hover:underline font-medium cursor-pointer block"
            >
              Change Picture
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-[#0070ba] bg-slate-50/70 hover:bg-sky-50/40 rounded-lg p-3 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5"
        >
          <div className="w-8 h-8 rounded-full bg-white text-slate-400 border border-slate-200 flex items-center justify-center shadow-2xs">
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-[#0070ba] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4 text-slate-500" />
            )}
          </div>
          <div>
            <span className="text-xs font-semibold text-[#0070ba]">
              Click to upload product picture
            </span>
            <span className="text-[11px] text-slate-500 block">
              PNG, JPG, WebP (Max 300 × 300 px)
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="text-rose-600 text-[11px] flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
