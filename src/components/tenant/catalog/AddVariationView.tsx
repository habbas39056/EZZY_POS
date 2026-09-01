import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, Sparkles, Layers, SlidersHorizontal, Tag, Check, AlertCircle } from 'lucide-react';
import type { Variation } from '../../../types/catalog';

interface AddVariationViewProps {
  initialVariation?: Variation | null;
  onSave: (variationData: { name: string; code?: string; values: string[]; description?: string }) => void;
  onCancel: () => void;
}

const PRESET_TEMPLATES = [
  {
    name: 'Apparel Sizes',
    code: 'VAR-SIZE',
    values: ['XS', 'Small', 'Medium', 'Large', 'XL', 'XXL', '3XL']
  },
  {
    name: 'Standard Colors',
    code: 'VAR-COLOR',
    values: ['Black', 'White', 'Navy Blue', 'Charcoal Grey', 'Ruby Red', 'Emerald Green', 'Beige']
  },
  {
    name: 'Shoe Sizes (EU)',
    code: 'VAR-SHOE-EU',
    values: ['38', '39', '40', '41', '42', '43', '44', '45']
  },
  {
    name: 'Storage / Capacity',
    code: 'VAR-STORAGE',
    values: ['64GB', '128GB', '256GB', '512GB', '1TB']
  },
  {
    name: 'RAM / Memory',
    code: 'VAR-RAM',
    values: ['4GB', '8GB', '16GB', '32GB', '64GB']
  },
  {
    name: 'Material / Fabric',
    code: 'VAR-MATERIAL',
    values: ['100% Cotton', 'Polyester', 'Genuine Leather', 'Denim', 'Silk', 'Linen']
  }
];

export const AddVariationView: React.FC<AddVariationViewProps> = ({
  initialVariation,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState(initialVariation ? initialVariation.name : '');
  const [code, setCode] = useState(initialVariation ? (initialVariation.code || '') : '');
  const [description, setDescription] = useState(initialVariation ? (initialVariation.description || '') : '');
  const [values, setValues] = useState<string[]>(initialVariation ? initialVariation.values : []);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    if (initialVariation) {
      setName(initialVariation.name);
      setCode(initialVariation.code || '');
      setDescription(initialVariation.description || '');
      setValues(initialVariation.values || []);
    }
  }, [initialVariation]);

  const handleAddValue = (valToAdd?: string) => {
    const rawVal = valToAdd !== undefined ? valToAdd : inputValue;
    if (!rawVal.trim()) return;

    // Support comma-separated input in one go
    const splitVals = rawVal
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);

    const newUniqueVals = splitVals.filter(v => !values.includes(v));

    if (newUniqueVals.length === 0) {
      setInputError('Option value already added');
      setTimeout(() => setInputError(''), 2500);
      return;
    }

    setValues(prev => [...prev, ...newUniqueVals]);
    setInputValue('');
    setInputError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddValue();
    }
  };

  const handleRemoveValue = (indexToRemove: number) => {
    setValues(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleApplyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    if (!name.trim()) setName(preset.name);
    if (!code.trim()) setCode(preset.code);
    // Combine unique values
    setValues(prev => {
      const combined = [...prev];
      preset.values.forEach(v => {
        if (!combined.includes(v)) combined.push(v);
      });
      return combined;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a Variation Name.');
      return;
    }
    if (values.length === 0) {
      alert('Please add at least one option value for this variation (e.g., Small, Medium, Red).');
      return;
    }

    onSave({
      name: name.trim(),
      code: code.trim() || `VAR-${name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)}`,
      values,
      description: description.trim()
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 max-w-5xl mx-auto my-4 text-xs text-slate-700 font-sans select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0070ba] flex items-center justify-center border border-sky-200">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {initialVariation ? 'Edit Variation' : 'Add Variation'}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Define product variation attributes, option sets, and standard values.
            </p>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Variations
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Variation Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Variation Name * <span className="text-slate-400 font-normal">(e.g. Size, Color, Storage, Flavor)</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Size"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs text-slate-800 bg-white shadow-2xs font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Variation Code / SKU Prefix <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. VAR-SIZE"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs text-slate-800 bg-white shadow-2xs font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1.5">
            Description / Notes <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="Additional context about this variation set..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs text-slate-800 bg-white shadow-2xs"
          />
        </div>

        {/* Section 2: Option Values Builder */}
        <div className="border-t border-slate-200 pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#0070ba]" />
                Option Values / Choices *
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Add the specific values for this variation (press Enter or Comma to add).
              </p>
            </div>
            {values.length > 0 && (
              <button
                type="button"
                onClick={() => setValues([])}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold hover:underline"
              >
                Clear all ({values.length})
              </button>
            )}
          </div>

          {/* Value input and add button */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Type an option (e.g. Medium, Red, 256GB) and press Enter or Comma..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800 shadow-2xs"
              />
              {inputError && (
                <span className="absolute right-3 top-2 text-[10px] text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {inputError}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleAddValue()}
              className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-[#0070ba] border border-sky-300 font-bold rounded text-xs transition flex items-center gap-1 cursor-pointer shadow-2xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Add Option
            </button>
          </div>

          {/* Quick Preset Badges */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Template Presets (Click to Auto-fill):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_TEMPLATES.map(preset => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1 bg-white hover:bg-sky-50 hover:border-[#0070ba] hover:text-[#0070ba] border border-slate-200 rounded-md text-[10.5px] font-medium text-slate-700 transition flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <span>{preset.name}</span>
                  <span className="text-[9.5px] text-slate-400">({preset.values.length})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rendered Chips / Options List */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-2">
              Configured Options ({values.length}):
            </label>
            {values.length === 0 ? (
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg text-center text-slate-400 text-xs bg-slate-50/50">
                No option values added yet. Type an option value above or click a preset template.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50/70 border border-slate-200 rounded-lg min-h-[50px] items-center">
                {values.map((val, idx) => (
                  <span
                    key={`${val}-${idx}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-sky-200 text-sky-800 rounded-full text-xs font-semibold shadow-2xs group hover:border-[#0070ba] transition animate-fadeIn"
                  >
                    <span>{val}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(idx)}
                      className="text-slate-400 hover:text-rose-600 rounded-full p-0.5 transition cursor-pointer"
                      title="Remove option"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Live Preview Card */}
        {name.trim() && values.length > 0 && (
          <div className="border border-sky-200 bg-sky-50/40 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-sky-900">
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Live Product Selector Preview
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-700 border border-sky-200">
                {code || 'VAR-CUSTOM'}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-800">{name}:</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {values.map(val => (
                  <span
                    key={val}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded text-[11px] font-medium text-slate-700 shadow-2xs hover:border-[#0070ba] hover:text-[#0070ba] cursor-pointer"
                  >
                    {val}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions matching Screenshot */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-start gap-2.5">
          <button
            type="submit"
            className="px-6 py-2 bg-[#0070ba] hover:bg-sky-700 text-white font-bold rounded shadow-xs text-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            {initialVariation ? 'Update Variation' : 'Save Variation'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </form>
    </div>
  );
};
