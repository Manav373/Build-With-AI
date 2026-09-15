import React from 'react';

export default function Table({
  columns = [],
  data = [],
  loading = false,
  emptyText = 'No records found.',
  className = '',
}) {
  return (
    <div className={`bg-[#0f1712] border border-[#1d2e22] rounded-xl overflow-hidden shadow-xl ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#142017] text-gray-400 uppercase tracking-wider text-[10px] border-b border-[#1d2e22]">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`py-3 px-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#17251b]">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-gray-500">
                  Loading data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-gray-400">
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-[#131e17] transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`py-3 px-4 ${col.cellClassName || ''}`}>
                      {col.render ? col.render(row, rowIdx) : row[col.accessor]}
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
