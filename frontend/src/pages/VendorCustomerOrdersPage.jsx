import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Users, Truck, CheckCircle2, Search, Phone, MapPin } from 'lucide-react';

export default function VendorCustomerOrdersPage() {
  const location = useLocation();
  const isCustomerTab = location.pathname.includes('/customers');
  const [activeTab, setActiveTab] = useState(isCustomerTab ? 'customers' : 'orders');

  useEffect(() => {
    if (location.pathname.includes('/customers')) {
      setActiveTab('customers');
    } else if (location.pathname.includes('/orders')) {
      setActiveTab('orders');
    }
  }, [location.pathname]);

  const [orders, setOrders] = useState([
    { id: 'ORD-901', customer: 'Ramesh Pawar', phone: '9822019482', product: 'Hybrid Cotton Seed (5 packets)', amount: '₹2,250', status: 'packed', tracking: 'TRK-PUNE-9081' },
    { id: 'ORD-902', customer: 'Mahesh Jadhav', phone: '9423018899', product: 'Organic Bio-Fertilizer 50kg', amount: '₹1,450', status: 'dispatched', tracking: 'TRK-PUNE-9082' },
    { id: 'ORD-903', customer: 'Aniket Deshmukh', phone: '9823011409', product: 'Drip Irrigation Pipe 100m Bundle', amount: '₹3,800', status: 'packed', tracking: 'TRK-PUNE-9083' },
  ]);

  const [customers] = useState([
    { id: 1, name: 'Ramesh Pawar', phone: '9822019482', location: 'Hadapsar, Pune', total_orders: 4, total_spent: '₹12,400' },
    { id: 2, name: 'Mahesh Jadhav', phone: '9423018899', location: 'Shirur, Pune', total_orders: 2, total_spent: '₹5,800' },
    { id: 3, name: 'Aniket Deshmukh', phone: '9823011409', location: 'Baramati, Pune', total_orders: 3, total_spent: '₹8,900' },
  ]);

  const updateOrderStatus = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
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
          {activeTab === 'orders' ? (
            <>
              <ShoppingCart className="text-blue-400" size={32} />
              Customer Orders Fulfillment
            </>
          ) : (
            <>
              <Users className="text-emerald-400" size={32} />
              Farmer Customer Directory
            </>
          )}
        </h1>
        <p className="text-[#86efac]/70 mt-1 text-sm">
          {activeTab === 'orders'
            ? 'Track individual retail agricultural input orders, update fulfillment status (Packed / Dispatched / Delivered), and manage dispatch tracking codes.'
            : 'View registered farmer client profiles, purchase histories, total spend metrics, and contact details.'}
        </p>
      </div>

      <div className="flex border-b border-[#86efac]/10 gap-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 font-bold text-sm transition border-b-2 ${
            activeTab === 'orders' ? 'border-[#4ade80] text-[#4ade80]' : 'border-transparent text-[#86efac]/50 hover:text-white'
          }`}
        >
          Customer Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-3 font-bold text-sm transition border-b-2 ${
            activeTab === 'customers' ? 'border-[#4ade80] text-[#4ade80]' : 'border-transparent text-[#86efac]/50 hover:text-white'
          }`}
        >
          Farmer Directory ({customers.length})
        </button>
      </div>

      {activeTab === 'orders' ? (
        <div style={cardStyle} className="overflow-x-auto shadow-2xl">
          <table className="w-full text-left text-sm text-gray-200">
            <thead className="bg-[#0e2614] text-xs uppercase text-[#86efac]/80 border-b border-[#86efac]/10">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Product Details</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Tracking Code</th>
                <th className="p-4">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#86efac]/10">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-[#143820]/40 transition">
                  <td className="p-4 font-mono font-bold text-blue-400">{o.id}</td>
                  <td className="p-4 text-white font-bold">{o.customer} ({o.phone})</td>
                  <td className="p-4">{o.product}</td>
                  <td className="p-4 font-bold text-[#4ade80]">{o.amount}</td>
                  <td className="p-4 font-mono text-xs text-gray-400">{o.tracking}</td>
                  <td className="p-4">
                    <select
                      value={o.status}
                      onChange={e => updateOrderStatus(o.id, e.target.value)}
                      style={{
                        padding: '6px 10px',
                        background: 'rgba(14, 38, 20, 0.9)',
                        border: '1px solid rgba(134, 239, 172, 0.2)',
                        borderRadius: '0.5rem', color: '#fff', fontSize: '0.78rem', fontWeight: 700
                      }}
                    >
                      <option value="packed">Packed</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {customers.map(c => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={cardStyle}
              className="p-6 space-y-3"
            >
              <h3 className="text-xl font-bold text-white font-['Outfit']">{c.name}</h3>
              <p className="text-xs text-[#86efac]/70 flex items-center gap-1"><Phone size={14}/> {c.phone}</p>
              <p className="text-xs text-[#86efac]/70 flex items-center gap-1"><MapPin size={14}/> {c.location}</p>
              <div className="flex justify-between border-t border-[#86efac]/10 pt-3 text-xs">
                <span>Total Orders: <strong className="text-white">{c.total_orders}</strong></span>
                <span>Total Spent: <strong className="text-[#4ade80]">{c.total_spent}</strong></span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
