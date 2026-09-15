import React from 'react';

export default function Input({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-emerald-300/80 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400/60">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-[#061409] border ${
            error ? 'border-rose-500' : 'border-emerald-500/20 focus:border-emerald-400'
          } rounded-xl px-3.5 py-2 text-sm text-white placeholder-emerald-100/30 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors ${
            Icon ? 'pl-10' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  );
}
