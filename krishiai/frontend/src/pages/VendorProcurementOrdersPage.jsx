import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Truck, CheckCircle2, Clock, FileText, Scale } from 'lucide-react';

export default function VendorProcurementOrdersPage() {
  const [orders, setOrders] = useState([
    {
      id: 1,
      order_code: 'PO-2026-08-0099',
      farmer_name: 'Vikas Deshmukh',
      crop_name: 'Cotton (Shankar-6)',
      agreed_qty: '200 quintal',
      agreed_price: '₹7,400 / qtl',
      total_amount: '₹14,80,000',
      status: 'at_warehouse',
      pickup_date: '2026-08-12',
      actual_weight: '198.5 quintal'
    },
    {
      id: 2,
      order_code: 'PO-2026-08-0104',
      farmer_name: 'Ganesh Kadam',
      crop_name: 'Soybean (JS-335)',
      agreed_qty: '150 quintal',
      agreed_price: '₹4,850 / qtl',
      total_amount: '₹7,27,500',
      status: 'pickup_scheduled',
      pickup_date: '2026-08-16',
      actual_weight: 'Pending'
    }
  ]);

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

      <div style={{ background: 'rgba(8, 24, 12, 0.85)', border: '1px solid rgba(134, 239, 172, 0.15)', borderRadius: '1.25rem' }} className="overflow-x-auto shadow-2xl">
        <table className="w-full text-left text-sm text-gray-200">
          <thead className="bg-[#0e2614] text-xs uppercase text-[#86efac]/80 border-b border-[#86efac]/10">
            <tr>
              <th className="p-4">Order Code</th>
              <th className="p-4">Farmer</th>
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
                <td className="p-4 text-white font-bold">{o.farmer_name}</td>
                <td className="p-4">{o.crop_name}</td>
                <td className="p-4">
                  <p className="text-white font-semibold">{o.agreed_qty}</p>
                  <p className="text-xs text-[#86efac]/60">{o.agreed_price}</p>
                </td>
                <td className="p-4 font-bold text-[#4ade80]">{o.total_amount}</td>
                <td className="p-4 font-mono text-gray-300">{o.actual_weight}</td>
                <td className="p-4">
                  <span className="px-3 py-1 text-xs rounded-full bg-amber-500/20 text-amber-300 font-bold capitalize">
                    {o.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
