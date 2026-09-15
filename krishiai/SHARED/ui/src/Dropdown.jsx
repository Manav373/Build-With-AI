import React, { useState, useRef, useEffect } from 'react';

export default function Dropdown({
  trigger,
  items = [],
  align = 'right',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 w-48 rounded-xl bg-[#0a1c10] border border-emerald-500/20 shadow-2xl py-1.5 z-50 focus:outline-none`}
        >
          {items.map((item, idx) => {
            if (item.divider) {
              return <div key={idx} className="my-1 border-t border-emerald-500/15" />;
            }
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setIsOpen(false);
                }}
                disabled={item.disabled}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-left transition-colors ${
                  item.danger
                    ? 'text-rose-400 hover:bg-rose-500/10'
                    : 'text-emerald-100/80 hover:text-white hover:bg-emerald-500/10'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {Icon && <Icon className="w-4 h-4 shrink-0" />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
