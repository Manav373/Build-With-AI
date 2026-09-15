import React from 'react';

export default function Loader({ text = 'Loading...', size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 gap-3 text-gray-400 ${className}`}>
      <div
        className={`${sizes[size] || sizes.md} border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin`}
      />
      {text && <p className="text-xs font-medium text-gray-400">{text}</p>}
    </div>
  );
}
