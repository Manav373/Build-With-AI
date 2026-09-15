import React from 'react';

export default function Card({
  children,
  className = '',
  hover = false,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-[#0a1c10]/90 border border-emerald-500/15 p-5 backdrop-blur-sm transition-all duration-200 ${
        hover ? 'hover:border-emerald-500/35 hover:shadow-lg hover:shadow-emerald-950/30 hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
