import React from 'react';

export default function Skeleton({
  variant = 'text',
  className = '',
  width,
  height,
}) {
  const base = 'animate-pulse bg-slate-800/80';
  const variants = {
    text: 'h-4 rounded-md w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`${base} ${variants[variant] || variants.text} ${className}`}
      style={style}
    />
  );
}
