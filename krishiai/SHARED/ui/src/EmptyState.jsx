import React from 'react';
import { PackageOpen } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  title = 'No Data Found',
  description = 'There are no items to display at this time.',
  icon: Icon = PackageOpen,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 ${className}`}>
      <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-400 mb-3">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mt-1">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
