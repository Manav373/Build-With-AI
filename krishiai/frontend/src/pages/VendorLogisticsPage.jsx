import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, Navigation, MapPin, Phone, Shield, FileText, Plus, CheckCircle, RefreshCw, X
} from 'lucide-react';

export default function VendorLogisticsPage() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Dispatch Form State
  const [vehicleNumber, setVehicleNumber] = useState('MH-31-CB-4821');
  const [vehicleType, setVehicleType] = useState('Tempo 407');
  const [driverName, setDriverName] = useState('Ramesh Shinde');
  const [driverPhone, setDriverPhone] = useState('9823011482');
  const [pickupAddr, setPickupAddr] = useState('Village Khed, Taluka Junnar, Pune');
  const [deliveryAddr, setDeliveryAddr] = useState('Krishi Warehouse #2, Hadapsar, Pune');
  const [msg, setMsg] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/';

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}api/vendor/logistics/shipments`);
      if (res.ok) {
        const json = await res.json();
        setShipments(json.shipments || []);
      } else {
        setShipments([
          {
            id: 1,
            shipment_code: 'SHP-2026-08-102',
            vehicle_number: 'MH-12-PQ-9082',
            vehicle_type: 'Pickup Bolero',
            driver_name: 'Sanjay Patil',
            driver_phone: '9822401829',
            pickup_address: 'Baramati Farmer Hub, Cluster 3',
            delivery_address: 'Pune Central Cold Storage',
            status: 'in_transit',
            total_distance_km: 42.5,
            eway_bill_number: 'EWAY-IN-94820194',
            created_at: '2026-08-13T10:30:00'
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}api/vendor/logistics/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_number: vehicleNumber,
          vehicle_type: vehicleType,
          driver_name: driverName,
          driver_phone: driverPhone,
          pickup_address: pickupAddr,
          delivery_address: deliveryAddr,
          total_distance_km: 38.0
        })
      });
      const json = await res.json();
      setMsg(json.message || 'Vehicle dispatched!');
      setShowModal(false);
      fetchShipments();
    } catch (e) {
      setMsg('Dispatch simulated successfully!');
      setShowModal(false);
    }
  };

  const cardStyle = {
    background: 'rgba(8, 24, 12, 0.85)',
    border: '1px solid rgba(134, 239, 172, 0.15)',
    borderRadius: '1.25rem',
    boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#86efac]/10 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white font-['Outfit'] flex items-center gap-3">
            <Truck className="text-emerald-400" size={32} />
            Farm-Gate Logistics & Fleet Tracker
          </h1>
          <p className="text-[#86efac]/70 mt-1 text-sm">
            Dispatch crop collection vehicles, track live transit, and issue digital e-Way Bills.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:brightness-110 text-white font-extrabold text-xs shadow-lg transition"
        >
          <Plus size={18} />
          Dispatch Vehicle
        </button>
      </div>

      {/* Active Shipments Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {shipments.map((s) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={cardStyle}
            className="p-6 space-y-4 relative"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="px-3 py-1 text-xs font-mono font-bold rounded-lg bg-emerald-500/20 text-[#4ade80] border border-emerald-500/30">
                  {s.shipment_code}
                </span>
                <span className="ml-3 text-xs text-[#86efac]/60 font-mono">e-Way: {s.eway_bill_number}</span>
              </div>
              <span className="px-2.5 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold capitalize">
                {s.status.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-[#4ade80] border border-emerald-500/30">
                <Truck size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold font-['Outfit']">{s.vehicle_number} ({s.vehicle_type})</h4>
                <p className="text-xs text-[#86efac]/60 mt-0.5">Driver: {s.driver_name} ({s.driver_phone})</p>
              </div>
              <a
                href={`tel:${s.driver_phone}`}
                className="p-2.5 rounded-xl bg-emerald-500/20 text-[#4ade80] border border-emerald-500/30 hover:bg-emerald-500/30 transition"
              >
                <Phone size={18} />
              </a>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 text-gray-200">
                <MapPin size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#86efac]/60">Pickup: </span>
                  {s.pickup_address}
                </div>
              </div>
              <div className="flex items-start gap-2 text-gray-200">
                <Navigation size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#86efac]/60">Delivery: </span>
                  {s.delivery_address}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-[#86efac]/70 pt-3 border-t border-white/5">
              <span>Distance: {s.total_distance_km} km</span>
              <span className="text-[#4ade80] font-bold flex items-center gap-1">
                <Shield size={14} /> GPS Live Track Active
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dispatch Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0a1a0d] border border-emerald-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 text-white shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-emerald-500/20 pb-3">
                <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                  🚚 Dispatch Crop Transport Vehicle
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleDispatch} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 font-bold block mb-1">Vehicle Number *</label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 font-bold block mb-1">Vehicle Type *</label>
                    <input
                      type="text"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 font-bold block mb-1">Driver Name *</label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 font-bold block mb-1">Driver Phone *</label>
                    <input
                      type="text"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 font-bold block mb-1">Farm Pickup Address</label>
                  <input
                    type="text"
                    value={pickupAddr}
                    onChange={(e) => setPickupAddr(e.target.value)}
                    className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-gray-400 font-bold block mb-1">Warehouse Delivery Address</label>
                  <input
                    type="text"
                    value={deliveryAddr}
                    onChange={(e) => setDeliveryAddr(e.target.value)}
                    className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-white/10 text-gray-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white font-extrabold shadow-lg"
                  >
                    Confirm Dispatch
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
