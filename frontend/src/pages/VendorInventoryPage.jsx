import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Boxes, AlertTriangle, RefreshCw, CheckCircle2, Edit } from 'lucide-react';

export default function VendorInventoryPage() {
  const [items, setItems] = useState([
    { id: 1, name: 'Hybrid Cotton Seed Mahyco 7351', category: 'Seeds', stock: 120, min_threshold: 20, batch: 'B-2026-90', expiry: '2027-06' },
    { id: 2, name: 'Organic NPK Bio-Fertilizer (50kg)', category: 'Fertilizers', stock: 15, min_threshold: 30, batch: 'B-2026-12', expiry: '2026-11' },
    { id: 3, name: 'Neem-based Pesticide Spray 1L', category: 'Pesticides', stock: 85, min_threshold: 25, batch: 'B-2026-44', expiry: '2028-02' }
  ]);

  const [editingId, setEditingId] = useState(null);
  const [newStock, setNewStock] = useState('');

  const updateStock = (id) => {
    if (!newStock) return;
    setItems(prev => prev.map(i => i.id === id ? { ...i, stock: parseInt(newStock) } : i));
    setEditingId(null);
    setNewStock('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-3">
          <Boxes className="text-[#4ade80]" size={32} />
          Stock Inventory & Batch Manager
        </h1>
        <p className="text-[#86efac]/70 mt-1 text-sm">
          Track warehouse stock quantities, set low-stock alert thresholds, and manage batch expiry dates.
        </p>
      </div>

      <div style={{ background: 'rgba(8, 24, 12, 0.85)', border: '1px solid rgba(134, 239, 172, 0.15)', borderRadius: '1.25rem' }} className="overflow-x-auto shadow-2xl">
        <table className="w-full text-left text-sm text-gray-200">
          <thead className="bg-[#0e2614] text-xs uppercase text-[#86efac]/80 border-b border-[#86efac]/10">
            <tr>
              <th className="p-4">Product Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Batch / Lot</th>
              <th className="p-4">Expiry Date</th>
              <th className="p-4">Current Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4">Quick Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#86efac]/10">
            {items.map(item => {
              const isLow = item.stock <= item.min_threshold;
              return (
                <tr key={item.id} className="hover:bg-[#143820]/40 transition">
                  <td className="p-4 font-bold text-white">{item.name}</td>
                  <td className="p-4 text-[#86efac]/80">{item.category}</td>
                  <td className="p-4 font-mono text-gray-400">{item.batch}</td>
                  <td className="p-4 text-gray-300">{item.expiry}</td>
                  <td className="p-4 font-extrabold text-white text-base">{item.stock} units</td>
                  <td className="p-4">
                    {isLow ? (
                      <span className="px-3 py-1 text-xs rounded-full bg-red-500/20 text-red-400 font-bold flex items-center gap-1 w-fit border border-red-500/30">
                        <AlertTriangle size={12} /> Low Stock Warning
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1 w-fit border border-emerald-500/30">
                        <CheckCircle2 size={12} /> Adequate Stock
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Stock"
                          value={newStock}
                          onChange={e => setNewStock(e.target.value)}
                          style={{
                            width: 80, padding: '4px 8px',
                            background: 'rgba(14, 38, 20, 0.9)',
                            border: '1px solid rgba(134, 239, 172, 0.2)',
                            borderRadius: '0.5rem', color: '#fff', fontSize: '0.78rem'
                          }}
                        />
                        <button
                          onClick={() => updateStock(item.id)}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingId(item.id); setNewStock(item.stock); }}
                        className="text-[#4ade80] hover:text-[#86efac] text-xs font-bold flex items-center gap-1"
                      >
                        <Edit size={14} /> Edit Stock
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
