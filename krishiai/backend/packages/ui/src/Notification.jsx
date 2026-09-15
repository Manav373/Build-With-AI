import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300',
  warning: 'bg-amber-950/90 border-amber-500/30 text-amber-300',
  error: 'bg-rose-950/90 border-rose-500/30 text-rose-300',
  info: 'bg-blue-950/90 border-blue-500/30 text-blue-300',
};

export default function Notification({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
}) {
  const Icon = icons[type] || icons.info;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-xl transition-all ${
        styles[type] || styles.info
      } ${className}`}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>}
        <p className="text-xs opacity-90 mt-0.5">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
