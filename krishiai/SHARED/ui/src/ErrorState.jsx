import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this section.',
  onRetry,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-rose-950/10 border border-rose-500/20 ${className}`}>
      <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 mb-3">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
      <p className="text-xs text-rose-300/80 max-w-sm mt-1">{message}</p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onRetry} icon={RefreshCw}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
