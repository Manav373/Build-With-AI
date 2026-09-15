import React from 'react';
import { PackageOpen } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = PackageOpen,
  title = 'No Data Found',
  description = 'There are currently no records available in this section.',
  actionText,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center bg-[#0d140f] border border-[#1b2b1e] rounded-2xl ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-[#142017] border border-[#213525] flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
        <Icon className="w-7 h-7 opacity-80" />
      </div>
      <h4 className="text-base font-bold text-white tracking-tight">{title}</h4>
      <p className="text-xs text-gray-400 mt-1 max-w-sm">{description}</p>
      {actionText && onAction && (
        <div className="mt-4">
          <Button size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}
