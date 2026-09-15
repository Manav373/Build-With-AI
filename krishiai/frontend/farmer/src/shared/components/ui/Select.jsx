import React from 'react';

export default function Select({
  label,
  error,
  options = [],
  className = '',
  id,
  ...props
}) {
  const selectId = id || props.name;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-gray-300">
          {label}
        </label>
      )}

      <select
        id={selectId}
        className={`w-full bg-[#131d16] border ${
          error ? 'border-red-600 focus:ring-red-500' : 'border-[#223826] focus:border-emerald-500'
        } rounded-xl py-2 px-3 text-xs md:text-sm text-white focus:outline-none focus:ring-1 transition-all ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#101913] text-white">
            {opt.label}
          </option>
        ))}
      </select>

      {error && <p className="text-[11px] text-red-400 font-medium">{error}</p>}
    </div>
  );
}
