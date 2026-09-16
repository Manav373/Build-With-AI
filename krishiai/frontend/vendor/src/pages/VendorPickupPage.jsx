import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Truck, MapPin, Phone, User, CheckCircle2,
  AlertCircle, Plus, Search, Filter, ArrowRight, ShieldCheck,
  Navigation, FileText, ChevronRight, X, Sparkles
} from 'lucide-react';

export default function VendorPickupPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const rawApi = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const API_BASE = (rawApi.startsWith('http') ? rawApi : `https://${rawApi}`).replace(/\/+$/, '') + '/';

  const [pickups, setPickups] = useState(() => {
    try {
      const saved = localStorage.getItem('vendor_scheduled_pickups');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('vendor_scheduled_pickups', JSON.stringify(pickups));
    } catch (e) { }
  }, [pickups]);

  useEffect(() => {
    // Also check backend shipments if local list is empty
    const fetchShipments = async () => {
      try {
        const res = await fetch(`${API_BASE}api/vendor/logistics/shipments`);
        if (res.ok) {
          const json = await res.json();
          if (json.shipments && json.shipments.length > 0) {
            const mapped = json.shipments.map(s => ({
              id: s.shipment_code || `SHP-${s.id}`,
              farmerName: s.driver_name || 'Farmer Collective',
              farmerPhone: s.driver_phone || 'N/A',
              crop: 'Agricultural Produce',
              quantity: '40 MT',
              location: s.pickup_address || 'Village Farm-Gate',
              pickupDate: s.created_at ? s.created_at.substring(0, 10) : new Date().toISOString().substring(0, 10),
              pickupTime: '10:00 AM',
              vehicleNo: s.vehicle_number || 'MH-12-TRUCK',
              driverName: s.driver_name || 'Assigned Driver',
              driverPhone: s.driver_phone || 'N/A',
              status: s.status === 'in_transit' ? 'en_route' : s.status || 'scheduled',
              notes: `e-Way Bill: ${s.eway_bill_number || 'Generated'}`,
            }));
            setPickups(prev => prev.length > 0 ? prev : mapped);
          }
        }
      } catch (e) {
        console.error('Failed to sync live shipments:', e);
      }
    };
    fetchShipments();
  }, []);

  // Form State for New Pickup
  const [formData, setFormData] = useState({
    farmerName: '',
    farmerPhone: '',
    crop: 'Organic Soya Bean',
    quantity: '',
    location: '',
    pickupDate: '',
    pickupTime: '09:00 AM',
    vehicleNo: '',
    driverName: '',
    driverPhone: '',
    notes: '',
  });

  const handleCreatePickup = (e) => {
    e.preventDefault();
    if (!formData.farmerName || !formData.quantity || !formData.location || !formData.pickupDate) {
      alert('Please fill in all required fields!');
      return;
    }

    const newPickup = {
      id: `PKP-${Math.floor(1000 + Math.random() * 9000)}`,
      ...formData,
      status: 'scheduled',
      vehicleNo: formData.vehicleNo || 'Vehicle To Be Assigned',
      driverName: formData.driverName || 'Driver To Be Assigned',
      driverPhone: formData.driverPhone || 'N/A',
    };

    setPickups([newPickup, ...pickups]);
    setShowModal(false);
    setFormData({
      farmerName: '',
      farmerPhone: '',
      crop: 'Organic Soya Bean',
      quantity: '',
      location: '',
      pickupDate: '',
      pickupTime: '09:00 AM',
      vehicleNo: '',
      driverName: '',
      driverPhone: '',
      notes: '',
    });

    setSuccessToast(`Pickup ${newPickup.id} scheduled successfully!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const updateStatus = (id, newStatus) => {
    setPickups(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  const filteredPickups = pickups.filter(p => {
    const matchesTab = activeTab === 'all' || p.status === activeTab;
    const matchesSearch =
      p.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Calculate Summary Stats
  const totalMT = pickups.reduce((acc, curr) => acc + parseInt(curr.quantity || '0'), 0);
  const scheduledCount = pickups.filter(p => p.status === 'scheduled').length;
  const enRouteCount = pickups.filter(p => p.status === 'en_route').length;
  const completedCount = pickups.filter(p => p.status === 'completed').length;

  const cardStyle = {
    background: 'rgba(8, 24, 12, 0.85)',
    border: '1px solid rgba(134, 239, 172, 0.15)',
    borderRadius: '1.25rem',
    boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-emerald-500/90 text-white px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 border border-emerald-400/30"
          >
            <CheckCircle2 size={20} />
            <span className="font-bold text-sm">{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white font-['Outfit'] flex items-center gap-3">
            <Calendar className="text-emerald-400" size={32} />
            Farm-Gate Pickup Scheduling
          </h1>
          <p className="text-[#86efac]/70 mt-1 text-sm">
            Schedule transport trucks, track farm-gate crop pick-ups, and dispatch logistics for your procurement orders.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:scale-105 transition duration-200"
        >
          <Plus size={18} /> Schedule New Pickup
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div style={cardStyle} className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#86efac]/60 uppercase tracking-wider">Scheduled Pickups</p>
            <h3 className="text-2xl font-black text-white mt-0.5">{scheduledCount} Bids</h3>
          </div>
        </div>

        <div style={cardStyle} className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#86efac]/60 uppercase tracking-wider">En-Route Vehicles</p>
            <h3 className="text-2xl font-black text-white mt-0.5">{enRouteCount} Trucks</h3>
          </div>
        </div>

        <div style={cardStyle} className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#86efac]/60 uppercase tracking-wider">Completed Today</p>
            <h3 className="text-2xl font-black text-white mt-0.5">{completedCount} Orders</h3>
          </div>
        </div>

        <div style={cardStyle} className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#86efac]/60 uppercase tracking-wider">Total Tonnage</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-0.5">{totalMT} MT Approx</h3>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={cardStyle} className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'All Pickups' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'en_route', label: 'En-Route' },
            { id: 'completed', label: 'Completed' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-[#4ade80] border border-[#4ade80]/30 shadow-md'
                  : 'text-[#86efac]/60 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86efac]/50" size={16} />
          <input
            type="text"
            placeholder="Search farmer, crop, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-black/40 border border-[#86efac]/20 rounded-xl text-xs text-white placeholder-[#86efac]/40 focus:outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {/* Pickup Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPickups.map((p) => {
          const getStatusBadge = (status) => {
            switch (status) {
              case 'scheduled':
                return <span className="px-3 py-1 text-xs rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1.5"><Clock size={12}/> Scheduled</span>;
              case 'en_route':
                return <span className="px-3 py-1 text-xs rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30 flex items-center gap-1.5"><Truck size={12}/> En-Route</span>;
              case 'completed':
                return <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1.5"><CheckCircle2 size={12}/> Completed</span>;
              default:
                return null;
            }
          };

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={cardStyle}
              className="p-6 space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex justify-between items-start border-b border-[#86efac]/10 pb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                      {p.id}
                    </span>
                    <h3 className="text-xl font-bold text-white font-['Outfit'] mt-2">{p.crop}</h3>
                    <p className="text-xs text-[#86efac]/70 font-semibold">{p.quantity}</p>
                  </div>
                  {getStatusBadge(p.status)}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-[#86efac]/10 space-y-1">
                    <p className="text-[#86efac]/50 font-bold flex items-center gap-1"><User size={13} /> Farmer Supplier</p>
                    <p className="font-bold text-white text-sm">{p.farmerName}</p>
                    <p className="text-[#86efac]/70 flex items-center gap-1"><Phone size={12} /> {p.farmerPhone}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-[#86efac]/10 space-y-1">
                    <p className="text-[#86efac]/50 font-bold flex items-center gap-1"><Calendar size={13} /> Pickup Date & Time</p>
                    <p className="font-bold text-white text-sm">{p.pickupDate}</p>
                    <p className="text-amber-400 font-semibold flex items-center gap-1"><Clock size={12} /> {p.pickupTime}</p>
                  </div>
                </div>

                {/* Location & Transport info */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 text-[#86efac]/80 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                    <MapPin size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Pickup Location:</strong> {p.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-300 bg-black/30 p-3 rounded-xl border border-white/5">
                    <Truck size={16} className="text-blue-400 shrink-0" />
                    <div className="truncate">
                      <strong className="text-white">{p.vehicleNo}</strong>
                      <span className="text-[#86efac]/60 ml-2">Driver: {p.driverName} ({p.driverPhone})</span>
                    </div>
                  </div>
                </div>

                {p.notes && (
                  <p className="text-[0.75rem] text-gray-400 italic bg-black/20 p-2.5 rounded-lg border border-white/5">
                    "{p.notes}"
                  </p>
                )}
              </div>

              {/* Status Update Actions */}
              <div className="pt-3 border-t border-[#86efac]/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-2">
                  {p.status === 'scheduled' && (
                    <button
                      onClick={() => updateStatus(p.id, 'en_route')}
                      className="px-3.5 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 text-xs font-bold transition flex items-center gap-1.5 border border-sky-500/30"
                    >
                      <Truck size={14} /> Dispatch Truck
                    </button>
                  )}
                  {p.status === 'en_route' && (
                    <button
                      onClick={() => updateStatus(p.id, 'completed')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5 border border-emerald-500/30"
                    >
                      <CheckCircle2 size={14} /> Mark Pickup Complete
                    </button>
                  )}
                </div>

                <button
                  onClick={() => alert(`Gate pass slip generated for ${p.id}`)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-[#86efac]/80 hover:text-white hover:bg-white/10 text-xs font-semibold transition flex items-center gap-1"
                >
                  <FileText size={13} /> Gate Pass PDF
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredPickups.length === 0 && (
        <div style={cardStyle} className="p-12 text-center space-y-3">
          <Calendar size={48} className="mx-auto text-[#86efac]/30" />
          <h3 className="text-xl font-bold text-white">No Pickup Schedules Found</h3>
          <p className="text-xs text-[#86efac]/60">Try adjusting your search filters or click 'Schedule New Pickup' above.</p>
        </div>
      )}

      {/* Modal: Schedule New Pickup */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={cardStyle}
              className="w-full max-w-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar relative"
            >
              <div className="flex justify-between items-center border-b border-[#86efac]/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white font-['Outfit']">Schedule Farm-Gate Pickup</h2>
                    <p className="text-xs text-[#86efac]/70">Enter pickup details to assign logistics and issue driver gate pass.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreatePickup} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[#86efac]/80 font-bold">Farmer / Supplier Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patil"
                      value={formData.farmerName}
                      onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                      className="w-full p-3 bg-black/50 border border-[#86efac]/20 rounded-xl text-white outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#86efac]/80 font-bold">Farmer Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98220 12345"
                      value={formData.farmerPhone}
                      onChange={(e) => setFormData({ ...formData, farmerPhone: e.target.value })}
                      className="w-full p-3 bg-black/50 border border-[#86efac]/20 rounded-xl text-white outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[#86efac]/80 font-bold">Commodity / Crop *</label>
                    <select
                      value={formData.crop}
                      onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                      className="w-full p-3 bg-[#0e2614] border border-[#86efac]/20 rounded-xl text-white outline-none focus:border-emerald-400 font-semibold"
                    >
                      <option value="Organic Soya Bean">Organic Soya Bean</option>
                      <option value="Lokwan Wheat Grade-A">Lokwan Wheat Grade-A</option>
                      <option value="Desi Chana (Bengal Gram)">Desi Chana (Bengal Gram)</option>
                      <option value="Nashik Red Onion">Nashik Red Onion</option>
                      <option value="Yellow Maize / Corn">Yellow Maize / Corn</option>
                      <option value="Raw Cotton (Kapas)">Raw Cotton (Kapas)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#86efac]/80 font-bold">Quantity (Tonnage / Bags) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 50 MT (1000 Bags)"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full p-3 bg-black/50 border border-[#86efac]/20 rounded-xl text-white outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#86efac]/80 font-bold">Pickup Farm-Gate Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gate #3, APMC Yard, Sangli, Maharashtra"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-3 bg-black/50 border border-[#86efac]/20 rounded-xl text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[#86efac]/80 font-bold">Pickup Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.pickupDate}
                      onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                      className="w-full p-3 bg-black/50 border border-[#86efac]/20 rounded-xl text-white outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#86efac]/80 font-bold">Time Slot</label>
                    <input
                      type="text"
                      placeholder="e.g. 09:00 AM"
                      value={formData.pickupTime}
                      onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                      className="w-full p-3 bg-black/50 border border-[#86efac]/20 rounded-xl text-white outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[#86efac]/80 font-bold">Assigned Vehicle No.</label>
                    <input
                      type="text"
                      placeholder="e.g. MH-12-VT-9981"
                      value={formData.vehicleNo}
                      onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
                      className="w-full p-3 bg-black/50 border border-[#86efac]/20 rounded-xl text-white outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#86efac]/80 font-bold">Driver Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Eknath Shinde"
                      value={formData.driverName}
                      onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                      className="w-full p-3 bg-black/50 border border-[#86efac]/20 rounded-xl text-white outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#86efac]/80 font-bold">Driver Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98220 99881"
                      value={formData.driverPhone}
                      onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                      className="w-full p-3 bg-black/50 border border-[#86efac]/20 rounded-xl text-white outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#86efac]/80 font-bold">Special Instructions / QC Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Moisture limit < 10%. Tarpaulin required."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-3 bg-black/50 border border-[#86efac]/20 rounded-xl text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-[#86efac]/10">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold shadow-lg hover:scale-105 transition"
                  >
                    Confirm & Schedule Pickup
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
