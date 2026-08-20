import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Star, ShoppingBag, Filter, ChevronRight,
  ShieldCheck, Building2, Calendar, Phone, Award, Truck, CheckCircle2,
  Tag, ArrowRight, ExternalLink, Sparkles, RefreshCw
} from 'lucide-react';
import { sampleVendorData } from '../components/vendor/sampleVendorData';

const INITIAL_VENDORS = [
  sampleVendorData,
  {
    vendorId: "vendor-002",
    vendorName: "Organic Farming Store",
    businessName: "Organic Farming Initiative Ltd.",
    tagline: "Certified Bio-Fertilizers & Organic Seeds for Sustainable Yields",
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&h=400&fit=crop",
    location: "Satara, Maharashtra",
    district: "Satara",
    rating: 4.8,
    totalReviews: 203,
    yearsExperience: 10,
    totalProducts: 52,
    farmersServed: 2100,
    isVerified: true,
    isTrusted: true,
    isPremium: true,
    vendorType: "seller",
    businessCategory: "Organic Products",
    gstNumber: "27AAACO9081F1Z8",
    topTags: ["Bio-Fertilizers", "Vermicompost", "Neem Oil"],
  },
  {
    vendorId: "vendor-003",
    vendorName: "Kisan Equipment & Machinery Hub",
    businessName: "Kisan Machinery Enterprises",
    tagline: "Advanced Tractors, Harvesters & Solar Irrigation Systems",
    profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=400&fit=crop",
    location: "Aurangabad, Maharashtra",
    district: "Aurangabad",
    rating: 4.6,
    totalReviews: 156,
    yearsExperience: 15,
    totalProducts: 28,
    farmersServed: 3200,
    isVerified: true,
    isTrusted: true,
    isPremium: true,
    vendorType: "seller",
    businessCategory: "Farm Equipment",
    gstNumber: "27AAACK1092K1Z2",
    topTags: ["Solar Pumps", "Rotavators", "Drip Irrigation"],
  },
  {
    vendorId: "vendor-004",
    vendorName: "Green Agro Nursery & Seedlings",
    businessName: "Green Agro Nursery",
    tagline: "High-Yield Tissue Culture Fruit Plants & Vegetable Seedlings",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&h=400&fit=crop",
    location: "Nashik, Maharashtra",
    district: "Nashik",
    rating: 4.9,
    totalReviews: 312,
    yearsExperience: 8,
    totalProducts: 64,
    farmersServed: 1800,
    isVerified: true,
    isTrusted: true,
    isPremium: false,
    vendorType: "seller",
    businessCategory: "Nursery Plants",
    gstNumber: "27AAACG4091M1Z5",
    topTags: ["Pomegranate Plants", "Grape Seedlings", "Onion Seeds"],
  }
];

const CATEGORIES = ['All', 'Procurement Buyers', 'Seeds & Fertilizers', 'Organic Products', 'Farm Equipment', 'Nursery Plants'];

export default function VendorMarketplacePage() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState(INITIAL_VENDORS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/';

  useEffect(() => {
    fetchMarketplaceVendors();
  }, []);

  const fetchMarketplaceVendors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}api/vendor/marketplace`);
      if (res.ok) {
        const json = await res.json();
        if (json.vendors && json.vendors.length > 0) {
          const apiVendors = json.vendors.map(v => ({
            vendorId: `vendor-${v.id}`,
            vendorName: v.owner_name || v.business_name,
            businessName: v.business_name,
            tagline: v.tagline || 'Verified Agricultural Vendor & Supply Hub',
            profileImage: v.profile_image || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
            coverImage: v.cover_image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=400&fit=crop",
            location: `${v.district || 'Pune'}, ${v.state || 'Maharashtra'}`,
            district: v.district || 'Pune',
            rating: v.rating || 4.8,
            totalReviews: v.total_reviews || 42,
            yearsExperience: v.years_in_business || 5,
            totalProducts: v.total_products || 18,
            farmersServed: v.farmers_served || 850,
            isVerified: v.is_verified ?? true,
            isTrusted: true,
            vendorType: v.vendor_type || 'hybrid',
            businessCategory: v.business_category || (v.vendor_type === 'procurement' ? 'Procurement Buyers' : 'Seeds & Fertilizers'),
            gstNumber: v.gst_number || '27AAACM4829K1Z4',
            topTags: v.vendor_type === 'procurement' ? ['Cotton Buyer', 'Soybean Procurement', 'Cash Payout'] : ['Certified Seeds', 'Bio-Fertilizer', 'Doorstep Delivery']
          }));
          setVendors([...apiVendors, ...INITIAL_VENDORS]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(v => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = v.businessName.toLowerCase().includes(query) ||
                          v.vendorName.toLowerCase().includes(query) ||
                          v.location.toLowerCase().includes(query) ||
                          (v.topTags && v.topTags.some(t => t.toLowerCase().includes(query)));
    
    let matchesCat = true;
    if (selectedCategory === 'Procurement Buyers') {
      matchesCat = v.vendorType === 'procurement' || v.vendorType === 'hybrid';
    } else if (selectedCategory !== 'All') {
      matchesCat = v.businessCategory === selectedCategory;
    }
    
    return matchesSearch && matchesCat;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'reviews') return b.totalReviews - a.totalReviews;
    if (sortBy === 'experience') return b.yearsExperience - a.yearsExperience;
    return 0;
  });

  const cardStyle = {
    background: 'rgba(8, 24, 12, 0.88)',
    border: '1px solid rgba(134, 239, 172, 0.15)',
    borderRadius: '1.25rem',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(22, 101, 52, 0.08)',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050e07',
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#e2f0e4',
        padding: '2.5rem 1.25rem',
      }}
      className="dark"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header Banner */}
        <div className="text-center space-y-3">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles size={14} /> Verified Agricultural Directory
            </span>
          </motion.div>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-['Outfit'] tracking-tight">
            KrishiAI Vendor <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">Marketplace</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Discover verified crop buyers, certified seed & fertilizer suppliers, machinery hubs, and cold storage partners near you.
          </p>

          {/* Become a Vendor CTA */}
          <div className="pt-2">
            <button
              onClick={() => navigate('/vendor-type-select')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition shadow-lg"
            >
              <span>🏪 Are you a crop buyer or agri input supplier?</span>
              <span className="text-white underline">Register Vendor Profile →</span>
            </button>
          </div>
        </div>

        {/* Overview Stats Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Building2, label: 'Verified Vendors', val: `${vendors.length}+ Hubs`, color: '#4ade80' },
            { icon: ShieldCheck, label: 'APMC Licensed', val: '100% Verified', color: '#facc15' },
            { icon: MapPin, label: 'Districts Covered', val: '36 Districts', color: '#60a5fa' },
            { icon: ShoppingBag, label: 'Products & Buying Reqs', val: '500+ Listings', color: '#c084fc' },
          ].map((m, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(10, 26, 13, 0.8)',
                border: '1px solid rgba(134, 239, 172, 0.12)',
                borderRadius: '1rem',
              }}
              className="p-4 flex items-center gap-3"
            >
              <div
                style={{ background: `${m.color}15` }}
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              >
                <m.icon size={20} style={{ color: m.color }} />
              </div>
              <div>
                <p className="text-xs text-[#86efac]/60 font-semibold">{m.label}</p>
                <p className="text-sm font-extrabold text-white font-['Outfit']">{m.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Category Filter Section */}
        <div style={cardStyle} className="p-6 space-y-5">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Vendor Name, Crop Type, District (e.g. Pune, Seeds, Cotton)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  background: 'rgba(14, 38, 20, 0.9)',
                  border: '1px solid rgba(134, 239, 172, 0.2)',
                  borderRadius: '0.9rem',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              <span className="text-xs text-[#86efac]/70 font-semibold flex items-center gap-1">
                <Filter size={14} /> Sort By:
              </span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  padding: '0.65rem 1rem',
                  background: 'rgba(14, 38, 20, 0.9)',
                  border: '1px solid rgba(134, 239, 172, 0.2)',
                  borderRadius: '0.9rem',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  outline: 'none',
                }}
              >
                <option value="rating">⭐ Highest Rated</option>
                <option value="reviews">💬 Most Reviews</option>
                <option value="experience">📜 Years in Business</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#86efac]/10">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '50px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: selectedCategory === cat ? 'linear-gradient(135deg, #166534, #15803d)' : 'rgba(255,255,255,0.04)',
                  color: selectedCategory === cat ? '#ffffff' : 'rgba(255,255,255,0.6)',
                  border: selectedCategory === cat ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Vendors Grid */}
        {filteredVendors.length === 0 ? (
          <div style={cardStyle} className="p-12 text-center space-y-3">
            <ShoppingBag size={48} className="mx-auto text-gray-600" />
            <h3 className="text-lg font-bold text-white">No Vendors Found</h3>
            <p className="text-xs text-gray-400">Try adjusting your search keywords or category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredVendors.map(vendor => (
              <motion.div
                key={vendor.vendorId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                style={cardStyle}
                className="flex flex-col justify-between group hover:border-[#4ade80]/40 transition duration-300"
              >
                {/* Top Cover Image Banner */}
                <div className="h-32 w-full relative overflow-hidden bg-gray-900">
                  <img
                    src={vendor.coverImage}
                    alt={vendor.businessName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08180c] via-transparent to-black/30" />
                  
                  {/* Category Badge */}
                  <span className="absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full bg-black/60 border border-white/20 text-emerald-300 backdrop-blur-md">
                    {vendor.businessCategory || 'Agri Vendor'}
                  </span>
                </div>

                {/* Card Content Header */}
                <div className="p-6 space-y-4 -mt-10 relative z-10 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-end justify-between">
                      {/* Avatar Logo */}
                      <div className="relative">
                        <img
                          src={vendor.profileImage}
                          alt={vendor.vendorName}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-[#4ade80] shadow-xl"
                        />
                        {vendor.isVerified && (
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border border-black" title="Verified APMC Vendor">
                            <ShieldCheck size={14} />
                          </div>
                        )}
                      </div>

                      {/* Rating Badge */}
                      <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-extrabold text-amber-300">{vendor.rating}</span>
                        <span className="text-[0.7rem] text-gray-400">({vendor.totalReviews})</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-white font-['Outfit'] group-hover:text-emerald-400 transition">
                          {vendor.businessName}
                        </h3>
                        {vendor.isVerified && (
                          <span className="px-2 py-0.5 text-[0.65rem] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ✓ APMC VERIFIED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{vendor.tagline}</p>
                    </div>

                    {/* Location & Experience */}
                    <div className="flex items-center gap-4 text-xs text-gray-300 pt-1">
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <MapPin size={14} /> {vendor.location}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400">
                        <Calendar size={14} /> {vendor.yearsExperience} Yrs Experience
                      </span>
                    </div>

                    {/* Tags */}
                    {vendor.topTags && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {vendor.topTags.map((t, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 text-[0.68rem] font-semibold rounded-md bg-[rgba(14,38,20,0.9)] border border-[rgba(134,239,172,0.15)] text-[#86efac]">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[rgba(14,38,20,0.8)] border border-[rgba(134,239,172,0.1)] text-xs mt-4">
                    <div>
                      <p className="text-gray-400">Farmers Served</p>
                      <p className="font-extrabold text-white mt-0.5">{vendor.farmersServed}+ Farmers</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Products Catalog</p>
                      <p className="font-extrabold text-emerald-400 mt-0.5">{vendor.totalProducts} Items Listed</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-[#86efac]/10 flex items-center gap-3">
                    <button
                      onClick={() => navigate('/vendor/sample')}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#166534] to-[#15803d] hover:from-[#15803d] hover:to-[#166534] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg"
                    >
                      View Store Catalog
                      <ArrowRight size={14} />
                    </button>
                    <button
                      onClick={() => alert(`Direct contact line for ${vendor.businessName}: 9823011482`)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <Phone size={14} /> Call
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
