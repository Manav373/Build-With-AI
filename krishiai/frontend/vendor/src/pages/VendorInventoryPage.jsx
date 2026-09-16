import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Boxes, AlertTriangle, RefreshCw, CheckCircle2, Edit } from 'lucide-react';

export default function VendorInventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newStock, setNewStock] = useState('');

  const rawApi = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const API_BASE = (rawApi.startsWith('http') ? rawApi : `https://${rawApi}`).replace(/\/+$/, '') + '/';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}api/vendor/products`);
      if (res.ok) {
        const json = await res.json();
        const prods = (json.products || []).map(p => ({
          id: p.id,
          name: p.name,
          category: p.category || 'Agricultural Input',
          stock: p.stock_quantity ?? 0,
          min_threshold: 10,
          batch: p.sku || `BATCH-${p.id}`,
          expiry: p.expiry_date || 'Standard Shelf Life',
        }));
        setItems(prods);
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error('Failed to fetch inventory products:', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (id) => {
    if (!newStock && newStock !== 0) return;
    const updatedQty = parseInt(newStock);
    setItems(prev => prev.map(i => i.id === id ? { ...i, stock: updatedQty } : i));
    setEditingId(null);
    setNewStock('');

    try {
      await fetch(`${API_BASE}api/vendor/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_quantity: updatedQty })
      });
    } catch (e) {
      console.error('Failed to update product stock:', e);
    }
  };

  const cardStyle = {
    background: 'rgba(8, 24, 12, 0.85)',
    border: '1px solid rgba(134, 239, 172, 0.15)',
    borderRadius: '1.25rem',
    boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
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

      {items.length === 0 ? (
        <div style={cardStyle} className="p-12 text-center space-y-3">
          <Boxes size={40} className="mx-auto text-[#86efac]/30" />
          <h3 className="text-lg font-bold text-white font-['Outfit']">No Inventory Products Found</h3>
          <p className="text-xs text-[#86efac]/60 max-w-sm mx-auto">
            You haven't listed any agricultural products yet. Create products in the Products section to monitor live stock quantities here.
          </p>
        </div>
      ) : (
        <div style={cardStyle} className="overflow-x-auto shadow-2xl">
          <table className="w-full text-left text-sm text-gray-200">
            <thead className="bg-[#0e2614] text-xs uppercase text-[#86efac]/80 border-b border-[#86efac]/10">
              <tr>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Batch / SKU</th>
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
      )}
    </div>
  );
}
