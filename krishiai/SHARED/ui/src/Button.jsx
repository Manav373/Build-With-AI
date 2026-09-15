import React from 'react';

const variants = {
  primary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm focus:ring-emerald-500',
  secondary: 'bg-[#0a1c10] hover:bg-[#0f2c18] text-emerald-100 border border-emerald-500/25 focus:ring-emerald-500',
  outline: 'bg-transparent hover:bg-emerald-500/10 text-emerald-200 border border-emerald-500/30 focus:ring-emerald-500',
  danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm focus:ring-rose-500',
  ghost: 'bg-transparent hover:bg-emerald-500/10 text-emerald-300/80 hover:text-white',
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25',
};

const sizes = {
  xs: 'px-2 py-1 text-xs rounded-md',
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-5 py-2.5 text-base rounded-xl font-semibold',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
