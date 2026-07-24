import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import VendorProfile from '../components/vendor/VendorProfile';
import { sampleVendorData } from '../components/vendor/sampleVendorData';

export default function VendorProfilePage() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        if (!vendorId || vendorId === 'sample' || vendorId === 'vendor-001') {
          setVendor(sampleVendorData);
        } else {
          // Attempt API fetch or fallback
          const response = await fetch(`/api/vendors/${vendorId}`);
          if (response.ok) {
            const data = await response.json();
            setVendor(data);
          } else {
            setVendor(sampleVendorData);
          }
        }
      } catch (err) {
        setVendor(sampleVendorData);
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

  return <VendorProfile vendorData={vendor || sampleVendorData} />;
}
