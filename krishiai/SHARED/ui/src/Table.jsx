import React from 'react';

export default function Table({
  columns = [],
  data = [],
  keyField = 'id',
  emptyMessage = 'No records found.',
  className = '',
}) {
  return (
    <div className={`w-full overflow-hidden rounded-2xl border border-emerald-500/15 bg-[#0a1c10]/90 ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-emerald-100/80">
          <thead className="bg-[#061409] text-xs uppercase tracking-wider text-emerald-300/70 border-b border-emerald-500/15">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3.5 px-4 font-semibold ${col.align === 'right' ? 'text-right' : ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-500/10">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-emerald-200/50">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr key={row[keyField] || rIdx} className="hover:bg-emerald-500/[0.04] transition-colors">
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className={`py-3.5 px-4 ${col.align === 'right' ? 'text-right' : ''}`}
                    >
                      {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
