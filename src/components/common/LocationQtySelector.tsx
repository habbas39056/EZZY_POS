import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Location } from '../../types/catalog';

interface LocationQtySelectorProps {
  locations?: Location[];
  value: string;
  rowQty: number;
  onChange: (value: string) => void;
}

const parseLocationValue = (val: string): Record<string, number> => {
  if (!val) return {};
  const map: Record<string, number> = {};
  
  // Matches "Location -1 (1), Location -2 (2)" or simple "Location -1"
  const parts = val.split(/,\s*(?=[^,]+(?:\s*\(\d+(?:\.\d+)?\)|$))/);
  parts.forEach(part => {
    const trimmed = part.trim();
    if (!trimmed) return;
    const match = trimmed.match(/^(.*?)\s*\((\d+(?:\.\d+)?)\)$/);
    if (match) {
      const name = match[1].trim();
      const qty = parseFloat(match[2]);
      if (name) map[name] = isNaN(qty) ? 0 : qty;
    } else {
      map[trimmed] = 0;
    }
  });
  return map;
};

const formatLocationValue = (map: Record<string, number>): string => {
  const entries = Object.entries(map).filter(([_, qty]) => Number(qty) > 0);
  if (entries.length === 0) {
    const zeroEntries = Object.keys(map).filter(k => k.trim());
    return zeroEntries.join(', ');
  }
  return entries.map(([name, qty]) => `${name} (${qty})`).join(', ');
};

export const LocationQtySelector: React.FC<LocationQtySelectorProps> = ({
  locations = [],
  value,
  rowQty,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempAlloc, setTempAlloc] = useState<Record<string, number>>({});
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 260 });
  
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fallback default locations if none configured in catalog
  const availableLocations: { id: string; name: string }[] = locations.length > 0
    ? locations
    : [
        { id: 'loc-1', name: 'DISPLAY STORE' },
        { id: 'loc-2', name: 'Location -1' },
        { id: 'loc-3', name: 'Location -2' }
      ];

  const currentAllocations = parseLocationValue(value);

  // Synchronize temp state when opening popup
  useEffect(() => {
    if (isOpen) {
      setTempAlloc(parseLocationValue(value));
      updatePosition();
    }
  }, [isOpen, value]);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popoverWidth = 260;
      const popoverHeight = 240;

      let left = rect.left;
      if (left + popoverWidth > window.innerWidth - 12) {
        left = window.innerWidth - popoverWidth - 12;
      }
      if (left < 12) left = 12;

      // Check if opens downward or upward
      const spaceBelow = window.innerHeight - rect.bottom;
      let top = rect.bottom + 4;
      if (spaceBelow < popoverHeight && rect.top > popoverHeight) {
        top = rect.top - popoverHeight - 4;
      }

      setPopoverPos({ top, left, width: popoverWidth });
    }
  };

  // Close when clicking outside or reposition on scroll/resize
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      if (isOpen) updatePosition();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const totalTempAllocated = Object.values(tempAlloc).reduce((sum, q) => sum + (Number(q) || 0), 0);
  const isExceeded = rowQty > 0 ? totalTempAllocated > rowQty : totalTempAllocated > 0;

  const handleApply = () => {
    if (isExceeded) return;
    const formatted = formatLocationValue(tempAlloc);
    onChange(formatted);
    setIsOpen(false);
  };

  const handleRemoveLocation = (locName: string) => {
    const updated = { ...currentAllocations };
    delete updated[locName];
    onChange(formatLocationValue(updated));
  };

  const activePills = Object.entries(currentAllocations).filter(([_, q]) => q > 0);

  return (
    <div className="w-full">
      {/* Allocated location chips on top */}
      {activePills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {activePills.map(([locName, q]) => (
            <span
              key={locName}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-sky-400 bg-sky-50 text-sky-700 text-[11px] font-medium leading-none"
            >
              <span>{locName} ({q})</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveLocation(locName);
                }}
                className="text-sky-500 hover:text-sky-800 ml-0.5 text-xs font-bold leading-none cursor-pointer"
                title="Remove"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Select trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setIsOpen(prev => !prev);
        }}
        className="w-full flex items-center justify-between px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 transition text-slate-700 text-xs focus:outline-none focus:border-[#0070ba] shadow-sm"
      >
        <span className="truncate text-slate-500 font-medium">
          {activePills.length > 0 ? 'Edit Locations' : (value ? value : 'Select')}
        </span>
        <span className="text-[9px] text-slate-500 ml-1">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {/* Portal Popover - Never clipped by table container */}
      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: 'fixed',
              top: `${popoverPos.top}px`,
              left: `${popoverPos.left}px`,
              width: `${popoverPos.width}px`,
              zIndex: 99999
            }}
            className="bg-white border border-slate-200 rounded shadow-xl p-3 text-slate-800 animate-in fade-in zoom-in-95 duration-100"
          >
            {/* Location List */}
            <div className="space-y-2 divide-y divide-slate-100 max-h-56 overflow-y-auto pr-0.5">
              {availableLocations.map((loc) => {
                const currentQty = tempAlloc[loc.name];
                return (
                  <div key={loc.id || loc.name} className="flex items-center justify-between pt-2 first:pt-0 gap-2">
                    <span className="text-xs font-medium text-slate-700 truncate" title={loc.name}>
                      {loc.name}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Qty"
                      value={currentQty !== undefined && currentQty > 0 ? currentQty : ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        setTempAlloc(prev => ({
                          ...prev,
                          [loc.name]: isNaN(val) ? 0 : Math.max(0, val)
                        }));
                      }}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-center text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0070ba] bg-white"
                    />
                  </div>
                );
              })}
            </div>

            {/* Error Message if exceeded */}
            {isExceeded && (
              <div className="mt-2 p-1.5 bg-red-50 border border-red-200 rounded text-red-600 text-[10.5px] font-medium leading-tight">
                ⚠️ Exceeds row quantity ({rowQty || 0})! Total: {totalTempAllocated}
              </div>
            )}

            {rowQty <= 0 && (
              <div className="mt-2 p-1.5 bg-amber-50 border border-amber-200 rounded text-amber-700 text-[10.5px] font-medium leading-tight">
                ℹ️ Please enter item quantity first.
              </div>
            )}

            {/* Bottom bar with Apply button */}
            <div className="mt-3 pt-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">
                Total: <strong className={isExceeded ? 'text-red-600 font-bold' : 'text-slate-700'}>{totalTempAllocated}</strong> / {rowQty || 0}
              </span>
              <button
                type="button"
                disabled={isExceeded}
                onClick={handleApply}
                className="px-4 py-1.5 bg-[#002d5b] text-white text-xs font-semibold rounded hover:bg-[#001d3b] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Apply
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
