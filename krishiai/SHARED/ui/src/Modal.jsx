import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  className = '',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const sizeStyles = {
    sm: { maxWidth: '28rem' },
    md: { maxWidth: '32rem' },
    lg: { maxWidth: '42rem' },
    xl: { maxWidth: '56rem' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      {/* Modal Dialog */}
      <div
        style={{
          backgroundColor: '#0a180e',
          borderColor: 'rgba(16, 185, 129, 0.25)',
          boxShadow: '0 25px 70px rgba(0,0,0,0.85)',
          color: '#ffffff',
          ...(sizeStyles[size] || sizeStyles.md),
        }}
        className={`relative w-full ${sizeClasses[size] || sizeClasses.md} bg-[#0a180e] border border-emerald-500/25 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] ring-1 ring-emerald-500/10 p-6 z-10 my-8 opacity-100 ${className}`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-emerald-500/15">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            {title}
          </h3>
          {showClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-emerald-300/60 hover:text-white hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

