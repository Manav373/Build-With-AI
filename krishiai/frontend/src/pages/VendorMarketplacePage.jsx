import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, ShoppingBag, Filter, ChevronRight, BadgeCheck, Building2, Calendar, Shield } from 'lucide-react';
import { sampleVendorData } from '../components/vendor/sampleVendorData';

const MOCK_VENDORS = [
  sampleVendorData,
  {
    vendorId: "vendor-002",
    vendorName: "Organic Farming Store",
    businessName: "Organic Farming Initiative Ltd.",
    tagline: "Pure Organic Products for Sustainable Farming",
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&h=400&fit=crop",
    location: "Satara, Maharashtra",
    rating: 4.8,
    totalReviews: 203,
    yearsExperience: 10,
    totalProducts: 52,
    farmersServed: 2100,
    isVerified: true,
    isTrusted: true,
    isPremium: true,
    businessCategory: "Organic Products",
  },
  {
    vendorId: "vendor-003",
    vendorName: "Kisan Equipment Hub",
    businessName: "Kisan Equipment & Services",
    tagline: "Advanced Farming Machinery & Tools",
    profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=400&fit=crop",
    location: "Aurangabad, Maharashtra",
    rating: 4.6,
    totalReviews: 156,
    yearsExperience: 15,
    totalProducts: 28,
    farmersServed: 3200,
    isVerified: true,
    isTrusted: true,
    isPremium: true,
    businessCategory: "Farm Equipment",
  },
  {
    vendorId: "vendor-004",
    vendorName: "Green Nursery & Plants",
    businessName: "Green Agro Nursery",
    tagline: "Healthy Seedlings & Tissue Culture Plants",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&h=400&fit=crop",
    location: "Nashik, Maharashtra",
    rating: 4.9,
    totalReviews: 312,
    yearsExperience: 8,
    totalProducts: 64,
    farmersServed: 1800,
    isVerified: true,
    isTrusted: true,
    isPremium: false,
    businessCategory: "Nursery Plants",
  }
];

export default function VendorMarketplacePage() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState(MOCK_VENDORS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('rating');

  const categories = ['All', 'Seeds & Fertilizers', 'Organic Products', 'Farm Equipment', 'Nursery Plants'];

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || v.businessCategory === selectedCategory || (selectedCategory === 'Seeds & Fertilizers' && (v.businessCategory === 'Agricultural Supplies' || v.businessCategory === 'Seeds & Fertilizers'));
    return matchesSearch && matchesCat;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'reviews') return b.totalReviews - a.totalReviews;
    if (sortBy === 'experience') return b.yearsExperience - a.yearsExperience;
    return 0;
  });

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-12" style={{ background: 'linear-gradient(145deg, #060d12 0%, #0a1628 50%, #060d12 100%)', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white font-outfit tracking-tight mb-2">
            Vendor <span style={{ color: '#4ade80' }}>Marketplace</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto mb-4">
            Discover verified & trusted agricultural vendors, crop buyers, and input suppliers in your region
          </p>

          {/* Become a Vendor CTA Banner */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/30 backdrop-blur-md">
            <span className="text-xs text-amber-300 font-medium">Are you an Agri Business or Crop Buyer?</span>
            <button
              type="button"
              onClick={() => navigate('/vendor-type-select')}
              className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-600 to-amber-400 text-[#1c0e00] font-extrabold text-xs shadow-md hover:brightness-110 transition-all cursor-pointer"
            >
              Become a Vendor (3 Types) →
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-[#0d1b2a]/90 border border-white/10 rounded-2xl p-4 mb-8 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors by name, city, crop..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-amber-500/50"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-white outline-none cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <option value="rating" className="bg-[#0d1b2a]">Highest Rating</option>
                <option value="reviews" className="bg-[#0d1b2a]">Most Reviews</option>
                <option value="experience" className="bg-[#0d1b2a]">Years of Experience</option>
              </select>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/8">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat
                    ? 'text-amber-900 shadow-lg'
                    : 'text-gray-300 border border-white/10 hover:border-white/25 bg-white/5'
                }`}
                style={selectedCategory === cat ? { background: 'linear-gradient(135deg,#a16207,#facc15)' } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map(vendor => (
            <motion.div
              key={vendor.vendorId}
              whileHover={{ y: -6 }}
              className="bg-[#0d1b2a]/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl flex flex-col justify-between hover:border-amber-500/40 transition-all duration-300 shadow-xl"
            >
              {/* Cover & Avatar */}
              <div>
                <div className="relative h-28 overflow-hidden">
                  <img src={vendor.coverImage} alt={vendor.businessName} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b2a] via-transparent to-transparent" />
                  {vendor.isPremium && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-black rounded-full" style={{ background: 'linear-gradient(135deg,#a16207,#facc15)', color: '#1c0e00' }}>
                      ⭐ Premium
                    </span>
                  )}
                </div>

                <div className="px-5 pb-4 relative -mt-10">
                  <div className="flex items-end gap-3 mb-3">
                    <img src={vendor.profileImage} alt={vendor.vendorName} className="w-16 h-16 rounded-2xl border-2 object-cover flex-shrink-0 shadow-lg" style={{ borderColor: '#facc15' }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <h3 className="text-white font-bold text-base truncate font-outfit">{vendor.businessName}</h3>
                        {vendor.isVerified && <BadgeCheck size={16} className="text-blue-400 flex-shrink-0" />}
                      </div>
                      <p className="text-gray-400 text-xs truncate">@{vendor.vendorName}</p>
                    </div>
                  </div>

                  <p className="text-amber-400/90 text-xs italic mb-3 line-clamp-1 font-medium">"{vendor.tagline}"</p>

                  <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-white/4 border border-white/6 text-center mb-3">
                    <div>
                      <div className="text-xs text-gray-400">Rating</div>
                      <div className="text-amber-400 font-bold text-xs flex items-center justify-center gap-1 mt-0.5">
                        <Star size={11} className="fill-amber-400" /> {vendor.rating}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Experience</div>
                      <div className="text-white font-bold text-xs mt-0.5">{vendor.yearsExperience} Years</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Farmers</div>
                      <div className="text-green-400 font-bold text-xs mt-0.5">{vendor.farmersServed}+</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1"><MapPin size={12} className="text-amber-400" />{vendor.location}</span>
                    <span className="text-gray-400">{vendor.totalProducts} Products</span>
                  </div>
                </div>
              </div>

              {/* View Profile Action */}
              <div className="p-4 border-t border-white/8 bg-white/2">
                <button
                  type="button"
                  onClick={() => navigate(`/vendor/${vendor.vendorId}`)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-amber-900 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer hover:brightness-110"
                  style={{ background: 'linear-gradient(135deg,#a16207,#facc15)', boxShadow: '0 4px 14px rgba(250,204,21,0.25)' }}
                >
                  View Profile <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
