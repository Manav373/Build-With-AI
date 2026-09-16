import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import VendorProfile from '../components/vendor/VendorProfile';

export default function VendorProfilePage() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  const rawApi = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const API_BASE = (rawApi.startsWith('http') ? rawApi : `https://${rawApi}`).replace(/\/+$/, '') + '/';

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        // Extract numeric ID if passed as vendor-1 or 1
        const cleanId = vendorId ? vendorId.replace('vendor-', '') : null;
        const endpoint = cleanId && !isNaN(cleanId)
          ? `${API_BASE}api/vendor/profile/${cleanId}`
          : `${API_BASE}api/vendor/me`;

        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          const v = data.vendor;
          if (v) {
            setVendor({
              vendorId: `vendor-${v.id}`,
              businessName: v.business_name,
              vendorName: v.owner_name,
              ownerName: v.owner_name,
              tagline: v.tagline || 'Registered Agricultural Vendor & Procurement Hub',
              profileImage: v.profile_image || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
              coverImage: v.cover_image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=400&fit=crop",
              location: `${v.district || v.village_city || 'Registered'}, ${v.state || 'India'}`,
              district: v.district || v.village_city || '',
              rating: v.rating || 0.0,
              totalReviews: v.total_reviews || 0,
              yearsExperience: v.years_in_business || 1,
              totalProducts: v.total_products || 0,
              farmersServed: v.farmers_served || 0,
              isVerified: v.is_verified ?? false,
              isTrusted: v.is_trusted ?? false,
              isPremium: v.is_premium ?? false,
              vendorType: v.vendor_type || 'hybrid',
              businessCategory: v.business_category || 'Agri Inputs & Seeds',
              gstNumber: v.gst_number || 'N/A',
              phone: v.phone,
              email: v.email,
              topTags: v.vendor_type === 'procurement' ? ['Crop Procurement', 'Direct Bank Settlement'] : ['Certified Seeds', 'Agri Inputs'],
              aboutText: v.business_description || 'Serving regional farmers with authenticated inputs and guaranteed crop procurement.',
              products: data.products || [],
              buyingRequirements: data.buying_requirements || [],
              reviews: data.reviews || [],
            });
          } else {
            setVendor(null);
          }
        } else {
          setVendor(null);
        }
      } catch (err) {
        console.error('Failed to load vendor profile:', err);
        setVendor(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [vendorId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #060d12, #0a1628)' }}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-12 h-12 rounded-full mx-auto mb-4 border-4 border-amber-400/20 border-t-amber-400"
          />
          <p className="text-gray-400 font-medium text-sm">Loading vendor profile…</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center" style={{ background: 'linear-gradient(145deg, #060d12, #0a1628)' }}>
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-bold text-white font-['Outfit']">Vendor Profile Not Found</h2>
          <p className="text-sm text-[#86efac]/70">The vendor profile you requested does not exist or has not yet completed registration.</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold text-sm"
          >
            Browse Verified Vendors
          </button>
        </div>
      </div>
    );
  }

  return <VendorProfile vendorData={vendor} />;
}
