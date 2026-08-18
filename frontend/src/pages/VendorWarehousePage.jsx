import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Warehouse, Plus, Minus, ArrowUpRight, ArrowDownLeft, MapPin,
  CheckCircle2, AlertCircle, RefreshCw, Layers, ShieldCheck, Thermometer,
  Droplets, Boxes, Filter, Search, Clock, Trash2, X
} from 'lucide-react';

const INITIAL_WAREHOUSES = [
  {
    id: 'WH-01',
    name: 'Hadapsar Central Cold Storage',
    location: 'Hadapsar, Pune, Maharashtra',
    capacity_mt: 10000,
    bays_active: 8,
    temperature: '18°C',
    humidity: '55%',
  },
  {
    id: 'WH-02',
    name: 'APMC Grain Storage Bay #4',
    location: 'Nagpur APMC, Maharashtra',
    capacity_mt: 5000,
    bays_active: 4,
    temperature: '22°C',
    humidity: '60%',
  }
];

const INITIAL_STOCK_ITEMS = [
  {
    id: 'STK-101',
    warehouseId: 'WH-01',
    cropName: 'Sharbati Premium Wheat',
    bay: 'Bay A-1 (Cold Zone)',
    quantityMt: 2850,
    unit: 'MT',
    grade: 'Grade A-1',
    lastUpdated: '10 minutes ago',
  },
  {
    id: 'STK-102',
    warehouseId: 'WH-01',
    cropName: 'Yellow Soybean Grain',
    bay: 'Bay A-3 (Grain Silo)',
    quantityMt: 4000,
    unit: 'MT',
    grade: 'Super Grade',
    lastUpdated: '1 hour ago',
  },
  {
    id: 'STK-103',
    warehouseId: 'WH-02',
    cropName: 'Organic Long Staple Cotton',
    bay: 'Bay B-2 (Dry Storage)',
    quantityMt: 1400,
    unit: 'MT',
    grade: 'Grade A',
    lastUpdated: '3 hours ago',
  },
  {
    id: 'STK-104',
    warehouseId: 'WH-02',
    cropName: 'Hybrid Maize / Corn Grain',
    bay: 'Bay B-4 (Grain Silo)',
    quantityMt: 1000,
    unit: 'MT',
    grade: 'Grade B',
    lastUpdated: '5 hours ago',
  },
];

const INITIAL_LOGS = [
  { id: 'LOG-1', type: 'inbound', item: 'Sharbati Premium Wheat', amountMt: 250, warehouse: 'Hadapsar Central', time: '10 mins ago', notes: 'Truck MH-12-VT-8819 arrived' },
  { id: 'LOG-2', type: 'outbound', item: 'Yellow Soybean Grain', amountMt: 120, warehouse: 'Hadapsar Central', time: '1 hour ago', notes: 'Dispatched for Customer Order #ORD-902' },
  { id: 'LOG-3', type: 'inbound', item: 'Organic Long Staple Cotton', amountMt: 300, warehouse: 'APMC Grain Storage Bay #4', time: '3 hours ago', notes: 'Procurement Batch #PROC-88' },
];

export default function VendorWarehousePage() {
  const [warehouses, setWarehouses] = useState(() => {
    const saved = localStorage.getItem('vendor_warehouses');
    return saved ? JSON.parse(saved) : INITIAL_WAREHOUSES;
  });

  const [stockItems, setStockItems] = useState(() => {
    const saved = localStorage.getItem('vendor_stock_items');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_ITEMS;
  });

  const [movementLogs, setMovementLogs] = useState(() => {
    const saved = localStorage.getItem('vendor_stock_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [selectedWarehouseId, setSelectedWarehouseId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInboundModal, setShowInboundModal] = useState(false);
  const [showOutboundModal, setShowOutboundModal] = useState(false);
  const [targetStockItem, setTargetStockItem] = useState(null);

  // Form states
  const [formWarehouse, setFormWarehouse] = useState('WH-01');
  const [formCrop, setFormCrop] = useState('');
  const [formBay, setFormBay] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formGrade, setFormGrade] = useState('Grade A-1');
  const [formNotes, setFormNotes] = useState('');

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('vendor_warehouses', JSON.stringify(warehouses));
  }, [warehouses]);

  useEffect(() => {
    localStorage.setItem('vendor_stock_items', JSON.stringify(stockItems));
  }, [stockItems]);

  useEffect(() => {
    localStorage.setItem('vendor_stock_logs', JSON.stringify(movementLogs));
  }, [movementLogs]);

  // Calculate occupied MT per warehouse automatically
  const getWarehouseOccupiedMt = (whId) => {
    return stockItems
      .filter(item => item.warehouseId === whId)
      .reduce((sum, item) => sum + Number(item.quantityMt), 0);
  };

  // Total metrics
  const totalCapacityMt = warehouses.reduce((sum, w) => sum + w.capacity_mt, 0);
  const totalOccupiedMt = stockItems.reduce((sum, item) => sum + Number(item.quantityMt), 0);
  const totalFreeMt = totalCapacityMt - totalOccupiedMt;
  const overallOccupancyPercent = Math.round((totalOccupiedMt / totalCapacityMt) * 100);

  // Filtered Stock Items
  const filteredItems = stockItems.filter(item => {
    const matchesWarehouse = selectedWarehouseId === 'all' || item.warehouseId === selectedWarehouseId;
    const matchesSearch = item.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.bay.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesWarehouse && matchesSearch;
  });

  // Handle Stock Increase (Inbound Arrival)
  const handleInboundSubmit = (e) => {
    e.preventDefault();
    if (!formCrop || !formQuantity || Number(formQuantity) <= 0) {
      alert('Please enter a valid crop name and quantity.');
      return;
    }

    const qtyMt = Number(formQuantity);
    const existingIndex = stockItems.findIndex(
      item => item.warehouseId === formWarehouse && item.cropName.toLowerCase() === formCrop.toLowerCase()
    );

    let updatedItems = [...stockItems];
    let cropTitle = formCrop;

    if (existingIndex >= 0) {
      // Increase existing stock
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantityMt: updatedItems[existingIndex].quantityMt + qtyMt,
        lastUpdated: 'Just now',
      };
      cropTitle = updatedItems[existingIndex].cropName;
    } else {
      // Add new stock item
      const newItem = {
        id: `STK-${Date.now().toString().slice(-4)}`,
        warehouseId: formWarehouse,
        cropName: formCrop,
        bay: formBay || 'Bay A-1',
        quantityMt: qtyMt,
        unit: 'MT',
        grade: formGrade,
        lastUpdated: 'Just now',
      };
      updatedItems.unshift(newItem);
    }

    const targetWh = warehouses.find(w => w.id === formWarehouse);
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      type: 'inbound',
      item: cropTitle,
      amountMt: qtyMt,
      warehouse: targetWh?.name || 'Warehouse',
      time: 'Just now',
      notes: formNotes || 'Manual Inbound Stock Addition',
    };

    setStockItems(updatedItems);
    setMovementLogs([newLog, ...movementLogs]);
    setShowInboundModal(false);
    resetForm();
  };

  // Handle Stock Decrease (Outbound Dispatch)
  const handleOutboundSubmit = (e) => {
    e.preventDefault();
    if (!targetStockItem || !formQuantity || Number(formQuantity) <= 0) {
      alert('Please enter a valid dispatch quantity.');
      return;
    }

    const qtyMt = Number(formQuantity);
    if (qtyMt > targetStockItem.quantityMt) {
      alert(`Cannot dispatch ${qtyMt} MT. Only ${targetStockItem.quantityMt} MT available in stock.`);
      return;
    }

    const updatedItems = stockItems.map(item => {
      if (item.id === targetStockItem.id) {
        return {
          ...item,
          quantityMt: item.quantityMt - qtyMt,
          lastUpdated: 'Just now',
        };
      }
      return item;
    }).filter(item => item.quantityMt > 0); // remove if zero

    const targetWh = warehouses.find(w => w.id === targetStockItem.warehouseId);
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      type: 'outbound',
      item: targetStockItem.cropName,
      amountMt: qtyMt,
      warehouse: targetWh?.name || 'Warehouse',
      time: 'Just now',
      notes: formNotes || 'Outbound Stock Dispatch',
    };

    setStockItems(updatedItems);
    setMovementLogs([newLog, ...movementLogs]);
    setShowOutboundModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormCrop('');
    setFormBay('');
    setFormQuantity('');
    setFormNotes('');
    setTargetStockItem(null);
  };

  const cardStyle = {
    background: 'rgba(8, 24, 12, 0.85)',
    border: '1px solid rgba(134, 239, 172, 0.15)',
    borderRadius: '1.25rem',
    boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Banner & Quick Stock Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#86efac]/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-3">
            <Warehouse className="text-emerald-400" size={32} />
            Smart Warehouse & Stock Control
          </h1>
          <p className="text-[#86efac]/70 mt-1 text-sm">
            Live automatic stock tracking for grain silos, cold storage bays, inbound arrivals, and outbound dispatches.
          </p>
        </div>

        {/* Action Controls: Increase / Decrease Stock */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              resetForm();
              setShowInboundModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold text-xs shadow-lg hover:brightness-110 transition flex items-center gap-2"
          >
            <Plus size={16} /> Stock Increase (Inbound)
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div style={cardStyle} className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Boxes size={24} />
          </div>
          <div>
            <p className="text-xs text-[#86efac]/60 font-semibold uppercase tracking-wider">Total Occupied</p>
            <h3 className="text-2xl font-black text-white font-['Outfit'] mt-0.5">{totalOccupiedMt.toLocaleString()} MT</h3>
            <p className="text-[0.7rem] text-emerald-400 font-bold">{overallOccupancyPercent}% of Total Capacity</p>
          </div>
        </div>

        <div style={cardStyle} className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
            <Warehouse size={24} />
          </div>
          <div>
            <p className="text-xs text-[#86efac]/60 font-semibold uppercase tracking-wider">Free Capacity</p>
            <h3 className="text-2xl font-black text-white font-['Outfit'] mt-0.5">{totalFreeMt.toLocaleString()} MT</h3>
            <p className="text-[0.7rem] text-blue-400 font-bold">Space available across bays</p>
          </div>
        </div>

        <div style={cardStyle} className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Layers size={24} />
          </div>
          <div>
            <p className="text-xs text-[#86efac]/60 font-semibold uppercase tracking-wider">Active Commodities</p>
            <h3 className="text-2xl font-black text-white font-['Outfit'] mt-0.5">{stockItems.length} Batches</h3>
            <p className="text-[0.7rem] text-amber-400 font-bold">Stored in active storage bays</p>
          </div>
        </div>

        <div style={cardStyle} className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
            <RefreshCw size={24} />
          </div>
          <div>
            <p className="text-xs text-[#86efac]/60 font-semibold uppercase tracking-wider">Stock Movements</p>
            <h3 className="text-2xl font-black text-white font-['Outfit'] mt-0.5">{movementLogs.length} Actions</h3>
            <p className="text-[0.7rem] text-purple-400 font-bold">Auto-calculated in real time</p>
          </div>
        </div>
      </div>

      {/* Warehouses Capacity Cards (Auto Updating Progress Bars) */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
          🏭 Active Storage Facilities
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {warehouses.map(w => {
            const occupiedMt = getWarehouseOccupiedMt(w.id);
            const percent = Math.round((occupiedMt / w.capacity_mt) * 100);
            return (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                style={cardStyle}
                className="p-6 space-y-4 relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[0.68rem] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {w.id}
                    </span>
                    <h3 className="text-xl font-bold text-white font-['Outfit'] mt-1">{w.name}</h3>
                    <p className="text-xs text-[#86efac]/60 flex items-center gap-1 mt-0.5">
                      <MapPin size={14} className="text-emerald-400" /> {w.location}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full font-bold border ${
                    percent > 85
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {percent}% Capacity
                  </span>
                </div>

                {/* Auto Updating Storage Meter */}
                <div className="space-y-1.5 bg-black/30 p-3 rounded-xl border border-white/5">
                  <div className="flex justify-between text-xs text-[#86efac]/80 font-semibold">
                    <span>Occupied: <strong className="text-white">{occupiedMt.toLocaleString()} MT</strong></span>
                    <span>Max Capacity: <strong className="text-white">{w.capacity_mt.toLocaleString()} MT</strong></span>
                  </div>
                  <div className="w-full h-3.5 bg-gray-900 rounded-full overflow-hidden border border-[#86efac]/10 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        percent > 85
                          ? 'bg-gradient-to-r from-amber-500 to-red-500'
                          : 'bg-gradient-to-r from-emerald-500 to-green-400'
                      }`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <p className="text-[0.68rem] text-right text-[#86efac]/50">
                    Remaining Free: {(w.capacity_mt - occupiedMt).toLocaleString()} MT
                  </p>
                </div>

                {/* Environment Metrics */}
                <div className="grid grid-cols-3 gap-3 text-xs bg-[rgba(14,38,20,0.8)] border border-[rgba(134,239,172,0.1)] p-3 rounded-xl">
                  <div>
                    <p className="text-[#86efac]/60 flex items-center gap-1"><Layers size={12}/> Active Bays</p>
                    <p className="font-bold text-white mt-1">{w.bays_active} Bays</p>
                  </div>
                  <div>
                    <p className="text-[#86efac]/60 flex items-center gap-1"><Thermometer size={12}/> Temperature</p>
                    <p className="font-bold text-[#4ade80] mt-1">{w.temperature}</p>
                  </div>
                  <div>
                    <p className="text-[#86efac]/60 flex items-center gap-1"><Droplets size={12}/> Humidity</p>
                    <p className="font-bold text-amber-400 mt-1">{w.humidity}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Live Warehouse Inventory Stock Table */}
      <div style={cardStyle} className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#86efac]/10 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white font-['Outfit']">📦 Stored Stock Batches</h2>
            <p className="text-xs text-[#86efac]/60">
              Increase or decrease commodity quantities. Stock metrics automatically update.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter by Warehouse */}
            <div className="relative">
              <select
                value={selectedWarehouseId}
                onChange={e => setSelectedWarehouseId(e.target.value)}
                className="bg-black/40 border border-white/10 text-xs text-white rounded-xl px-3 py-2 outline-none font-semibold cursor-pointer"
              >
                <option value="all" className="bg-[#0a1a0d]">All Warehouses</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id} className="bg-[#0a1a0d]">{w.name}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search crop or bay..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-black/40 border border-white/10 text-xs text-white rounded-xl pl-8 pr-3 py-2 outline-none w-44 sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Stock Items List */}
        <div className="space-y-3">
          {filteredItems.map(item => {
            const parentWh = warehouses.find(w => w.id === item.warehouseId);
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/30 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-lg flex items-center justify-center">
                    🌾
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white font-['Outfit']">{item.cropName}</h4>
                    <p className="text-xs text-[#86efac]/60">
                      {parentWh?.name || 'Warehouse'} • <span className="text-amber-400 font-semibold">{item.bay}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 justify-between md:justify-end">
                  <div className="text-left md:text-right">
                    <p className="text-[0.68rem] text-gray-400 font-semibold uppercase">STORED QUANTITY</p>
                    <p className="text-lg font-black text-[#4ade80]">
                      {item.quantityMt.toLocaleString()} {item.unit}
                    </p>
                  </div>

                  <span className="px-2.5 py-1 text-[0.7rem] font-bold rounded-lg bg-white/5 border border-white/10 text-gray-300">
                    {item.grade}
                  </span>

                  {/* Stock Action Buttons: Increase & Decrease */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setTargetStockItem(item);
                        setFormQuantity('');
                        setShowOutboundModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/25 transition flex items-center gap-1"
                      title="Dispatch / Decrease Stock"
                    >
                      <Minus size={14} /> Dispatch
                    </button>

                    <button
                      onClick={() => {
                        setFormWarehouse(item.warehouseId);
                        setFormCrop(item.cropName);
                        setFormBay(item.bay);
                        setFormQuantity('');
                        setShowInboundModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 transition flex items-center gap-1"
                      title="Add / Increase Stock"
                    >
                      <Plus size={14} /> Add Stock
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="text-center py-10 text-gray-400 space-y-2">
              <Boxes size={40} className="mx-auto text-gray-600" />
              <p className="text-sm font-semibold">No stock items found in this warehouse filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Live Stock Movement Audit Logs */}
      <div style={cardStyle} className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
          <Clock size={18} className="text-emerald-400" />
          Recent Stock Movement History (Audit Log)
        </h2>

        <div className="space-y-2">
          {movementLogs.map(log => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                  log.type === 'inbound' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {log.type === 'inbound' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </span>
                <div>
                  <p className="font-bold text-white">
                    {log.type === 'inbound' ? 'Inbound Arrival (+)' : 'Outbound Dispatch (-)'}: <span className="text-[#4ade80]">{log.amountMt} MT {log.item}</span>
                  </p>
                  <p className="text-[#86efac]/60 text-[0.7rem]">{log.warehouse} • {log.notes}</p>
                </div>
              </div>
              <span className="text-gray-400 text-[0.68rem] shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* INBOUND STOCK INCREASE MODAL */}
      <AnimatePresence>
        {showInboundModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowInboundModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-[#0a1a0d] border border-emerald-500/30 rounded-2xl p-6 space-y-4 text-white shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-emerald-500/20 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 font-['Outfit']">
                  ➕ Increase Warehouse Stock (Inbound)
                </h3>
                <button onClick={() => setShowInboundModal(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleInboundSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Select Storage Warehouse</label>
                  <select
                    value={formWarehouse}
                    onChange={e => setFormWarehouse(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white outline-none font-semibold"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id} className="bg-[#0a1a0d]">{w.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1">Commodity / Crop Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Sharbati Wheat, Soybean, Cotton"
                    value={formCrop}
                    onChange={e => setFormCrop(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Inbound Tonnage (MT) *</label>
                    <input
                      type="number"
                      placeholder="e.g., 150"
                      value={formQuantity}
                      onChange={e => setFormQuantity(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Storage Bay</label>
                    <input
                      type="text"
                      placeholder="e.g., Bay A-1"
                      value={formBay}
                      onChange={e => setFormBay(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1">Inbound Notes / Source</label>
                  <input
                    type="text"
                    placeholder="e.g. Received from Farmer Truck #MH-12-8819"
                    value={formNotes}
                    onChange={e => setFormNotes(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>

                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowInboundModal(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-white/10 text-gray-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold shadow-lg"
                  >
                    Confirm Stock Increase
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OUTBOUND STOCK DECREASE MODAL */}
      <AnimatePresence>
        {showOutboundModal && targetStockItem && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowOutboundModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-[#0a1a0d] border border-red-500/30 rounded-2xl p-6 space-y-4 text-white shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-red-500/20 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 font-['Outfit']">
                  ➖ Dispatch Stock (Decrease)
                </h3>
                <button onClick={() => setShowOutboundModal(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleOutboundSubmit} className="space-y-3 text-xs">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
                  <p className="font-bold text-red-400">{targetStockItem.cropName}</p>
                  <p className="text-[0.7rem] text-gray-300">Available Stock: <strong>{targetStockItem.quantityMt} MT</strong> in {targetStockItem.bay}</p>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1">Dispatch Quantity (MT) *</label>
                  <input
                    type="number"
                    max={targetStockItem.quantityMt}
                    placeholder={`Max ${targetStockItem.quantityMt} MT`}
                    value={formQuantity}
                    onChange={e => setFormQuantity(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1">Dispatch Reason / Order Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. Dispatched for Order #ORD-902 / Mill Transport"
                    value={formNotes}
                    onChange={e => setFormNotes(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>

                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowOutboundModal(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-white/10 text-gray-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-extrabold shadow-lg"
                  >
                    Confirm Stock Dispatch
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
