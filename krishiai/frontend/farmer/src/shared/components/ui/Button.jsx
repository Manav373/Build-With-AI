import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-700/20 focus:ring-emerald-500 border border-emerald-500/30',
    secondary: 'bg-[#18271c] hover:bg-[#223628] text-emerald-300 border border-[#2b4731] focus:ring-emerald-500',
    admin: 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-700/20 focus:ring-purple-500 border border-purple-500/30',
    vendor: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-700/20 focus:ring-blue-500 border border-blue-500/30',
    outline: 'bg-transparent hover:bg-white/5 text-gray-300 border border-gray-700 focus:ring-gray-500',
    danger: 'bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-white/5 text-gray-400 hover:text-white border-transparent',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-xs md:text-sm px-4 py-2 gap-2',
    lg: 'text-sm md:text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {!loading && Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
    </button>
  );
}
