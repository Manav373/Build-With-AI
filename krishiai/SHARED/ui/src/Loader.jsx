import React from 'react';

export default function Loader({ size = 'md', text = '', className = '' }) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-4 ${className}`}>
      <div
        className={`${sizeMap[size] || sizeMap.md} rounded-full border-slate-700 border-t-emerald-400 animate-spin`}
      />
      {text && <p className="text-xs text-slate-400 font-medium">{text}</p>}
    </div>
  );
}
