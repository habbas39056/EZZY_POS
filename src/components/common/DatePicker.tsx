import React, { useRef } from 'react';
import { Calendar, X } from 'lucide-react';
import { formatDateToDisplay, formatDateToISO } from '../../utils/dateUtils';

export interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'DD-MMM-YYYY',
  className = '',
  disabled = false,
  required = false,
  id,
  name,
}) => {
  const hiddenNativePickerRef = useRef<HTMLInputElement>(null);

  const handleOpenPicker = () => {
    if (disabled) return;
    if (hiddenNativePickerRef.current) {
      if (typeof hiddenNativePickerRef.current.showPicker === 'function') {
        try {
          hiddenNativePickerRef.current.showPicker();
          return;
        } catch {
          // fallback if showPicker throws or is blocked
        }
      }
      hiddenNativePickerRef.current.focus();
      hiddenNativePickerRef.current.click();
    }
  };

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value; // 'YYYY-MM-DD'
    if (!rawVal) {
      onChange('');
      return;
    }
    const formatted = formatDateToDisplay(rawVal);
    onChange(formatted);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (hiddenNativePickerRef.current) {
      hiddenNativePickerRef.current.value = '';
    }
  };

  const isoValue = formatDateToISO(value);

  return (
    <div className="relative flex items-center group w-full">
      {/* Visual Display Input */}
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        onClick={handleOpenPicker}
        className={`w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800 pr-12 cursor-pointer transition-colors ${className}`}
      />

      {/* Hidden Native Date Input to trigger Browser Date Picker */}
      <input
        ref={hiddenNativePickerRef}
        type="date"
        value={isoValue}
        onChange={handleNativeDateChange}
        tabIndex={-1}
        className="absolute top-0 right-0 w-8 h-full opacity-0 pointer-events-none -z-10"
      />

      {/* Action Icons: Clear & Calendar Trigger */}
      <div className="absolute right-2 flex items-center gap-1">
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="text-slate-300 hover:text-slate-500 p-0.5 rounded transition"
            title="Clear date"
          >
            <X className="w-3 h-3" />
          </button>
        )}
        <button
          type="button"
          tabIndex={-1}
          onClick={handleOpenPicker}
          disabled={disabled}
          className="text-slate-400 hover:text-[#0070ba] p-0.5 transition cursor-pointer"
          title="Open calendar picker"
        >
          <Calendar className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
