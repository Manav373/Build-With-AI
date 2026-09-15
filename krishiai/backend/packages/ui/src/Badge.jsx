import React from 'react';

const badgeVariants = {
  default: 'bg-slate-800 text-slate-300 border-slate-700',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
};

export default function Badge({
  children,
  variant = 'default',
  className = '',
  dot = false,
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        badgeVariants[variant] || badgeVariants.default
      } ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'success'
              ? 'bg-emerald-400'
              : variant === 'warning'
              ? 'bg-amber-400'
              : variant === 'danger'
              ? 'bg-rose-400'
              : variant === 'info'
              ? 'bg-blue-400'
              : 'bg-slate-400'
          }`}
        />
      )}
      {children}
    </span>
  );
}
