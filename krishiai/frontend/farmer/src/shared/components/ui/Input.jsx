import React from 'react';

export default function Input({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  ...props
}) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-gray-300">
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          className={`w-full bg-[#131d16] border ${
            error ? 'border-red-600 focus:ring-red-500' : 'border-[#223826] focus:border-emerald-500'
          } rounded-xl py-2 px-3 ${Icon ? 'pl-9' : ''} text-xs md:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all ${className}`}
          {...props}
        />
      </div>

      {error && <p className="text-[11px] text-red-400 font-medium">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-gray-500">{helperText}</p>}
    </div>
  );
}
