import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Select({
  label,
  error,
  options = [],
  className = '',
  id,
  children,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-emerald-300/80 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full appearance-none bg-[#061409] border ${
            error ? 'border-rose-500' : 'border-emerald-500/20 focus:border-emerald-400'
          } rounded-xl pl-3.5 pr-10 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors ${className}`}
          {...props}
        >
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0a1c10] text-white">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-emerald-400/60">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  );
}
