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
      className={`bg-[#0f1712] border border-[#1d2e22] rounded-2xl p-5 shadow-lg transition-all ${
        hover ? 'hover:border-[#2d4734] hover:shadow-xl cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={`border-b border-[#18261c] pb-3 mb-3 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ children, className = '' }) {
  return <h3 className={`font-bold text-white text-base tracking-tight ${className}`}>{children}</h3>;
};

Card.Body = function CardBody({ children, className = '' }) {
  return <div className={`text-sm text-gray-300 space-y-2 ${className}`}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={`border-t border-[#18261c] pt-3 mt-3 flex items-center justify-between text-xs text-gray-400 ${className}`}>
      {children}
    </div>
  );
};
