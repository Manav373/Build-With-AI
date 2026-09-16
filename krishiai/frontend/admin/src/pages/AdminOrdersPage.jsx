import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, ExternalLink, ArrowRight, CheckCircle, Clock, Truck } from 'lucide-react';
import { adminApi } from '@krishiai/api';
import { Button, Loader } from '@krishiai/ui';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders({ type: filterType });
      const list = res.data?.data?.orders || res.data?.orders || res.data || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('[AdminOrdersPage] Error fetching orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Cross-Domain Transaction Stream</h1>
          <p className="text-sm text-emerald-200/60">
            Monitor escrow balances, farmer-to-vendor crop procurement, and vendor-to-farmer input purchases.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader text="Loading live orders..." />
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0a1a0d]/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-emerald-100/90">
              <thead className="bg-[#061409]/90 text-xs uppercase tracking-wider text-emerald-300/70 border-b border-emerald-500/15">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Order ID</th>
                  <th className="py-3.5 px-4 font-semibold">Transaction Flow</th>
                  <th className="py-3.5 px-4 font-semibold">Commodity / Input</th>
                  <th className="py-3.5 px-4 font-semibold">Value</th>
                  <th className="py-3.5 px-4 font-semibold">Escrow Protection</th>
                  <th className="py-3.5 px-4 font-semibold">Logistics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/10">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-emerald-200/50 text-sm">
                      No transactions recorded in the ecosystem yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#07190c]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{ord.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-emerald-100">{ord.type}</div>
                      <div className="text-[11px] text-emerald-200/60">
                        {ord.seller} <span className="text-emerald-400">➔</span> {ord.buyer}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-white font-medium">{ord.product}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-white">{ord.amount}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {ord.escrowStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                        <Truck className="w-3.5 h-3.5" />
                        {ord.fulfillment}
                      </span>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
