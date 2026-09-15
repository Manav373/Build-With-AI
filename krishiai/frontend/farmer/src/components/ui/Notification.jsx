import React from 'react';
import { Bell, CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Notification({
  title,
  message,
  type = 'info',
  onClose,
  className = '',
}) {
  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertCircle,
    alert: Bell,
  };

  const Icon = icons[type] || Info;

  const styles = {
    info: 'bg-[#142017] border-[#223826] text-emerald-300',
    success: 'bg-emerald-950/40 border-emerald-800 text-emerald-200',
    warning: 'bg-amber-950/40 border-amber-800 text-amber-200',
    alert: 'bg-purple-950/40 border-purple-800 text-purple-200',
  };

  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs shadow-lg transition-all ${
        styles[type] || styles.info
      } ${className}`}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <div className="flex-1 space-y-0.5">
        {title && <h5 className="font-semibold text-white">{title}</h5>}
        <p className="text-gray-300 leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-0.5 rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
