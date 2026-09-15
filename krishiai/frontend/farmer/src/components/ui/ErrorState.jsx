import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'Failed to load information from the server.',
  onRetry,
  className = '',
}) {
  return (
    <div className={`p-6 rounded-2xl bg-red-950/20 border border-red-900/40 text-center flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-400">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-red-200">{title}</h4>
        <p className="text-xs text-red-300/80 mt-0.5 max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" icon={RotateCcw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
