import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Truck, CheckCircle2, Clock, FileText, Scale } from 'lucide-react';

export default function VendorProcurementOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const rawApi = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const API_BASE = (rawApi.startsWith('http') ? rawApi : `https://${rawApi}`).replace(/\/+$/, '') + '/';

  useEffect(() => {
    fetchProcurementOrders();
  }, []);

  const fetchProcurementOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}api/vendor/procurement-orders`);
      if (res.ok) {
        const json = await res.json();
        setOrders(json.orders || []);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error('Failed to fetch procurement orders:', e);
      setOrders([]);
    } finally {
      setLoading(false);
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
          <ShoppingCart className="text-amber-400" size={32} />
          B2B Crop Procurement Orders
        </h1>
        <p className="text-[#86efac]/70 mt-1 text-sm">
          Fulfillment tracking for raw agricultural produce purchases, weight verification, and payout processing.
        </p>
      </div>

      {orders.length === 0 ? (
        <div style={cardStyle} className="p-12 text-center space-y-3">
          <ShoppingCart size={40} className="mx-auto text-amber-400/40" />
          <h3 className="text-lg font-bold text-white font-['Outfit']">No Procurement Orders Found</h3>
          <p className="text-xs text-[#86efac]/60 max-w-sm mx-auto">
            When you accept farmer applications for your buying requirements or tenders, raw produce procurement orders will be generated here in real time.
          </p>
        </div>
      ) : (
        <div style={cardStyle} className="overflow-x-auto shadow-2xl">
          <table className="w-full text-left text-sm text-gray-200">
            <thead className="bg-[#0e2614] text-xs uppercase text-[#86efac]/80 border-b border-[#86efac]/10">
              <tr>
                <th className="p-4">Order Code</th>
                <th className="p-4">Farmer / Seller</th>
                <th className="p-4">Crop</th>
                <th className="p-4">Agreed Qty & Price</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Actual Weight</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#86efac]/10">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-[#143820]/40 transition">
                  <td className="p-4 font-mono font-bold text-amber-400">{o.order_code}</td>
                  <td className="p-4 text-white font-bold">{o.farmer_user_id || 'Farmer'}</td>
                  <td className="p-4">{o.crop_name}</td>
                  <td className="p-4">
                    <p className="text-white font-semibold">{o.agreed_qty}</p>
                    <p className="text-xs text-[#86efac]/60">{o.agreed_price}</p>
                  </td>
                  <td className="p-4 font-bold text-[#4ade80]">{o.total_amount}</td>
                  <td className="p-4 font-mono text-gray-300">{o.actual_weight}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-amber-500/20 text-amber-300 font-bold capitalize">
                      {o.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
