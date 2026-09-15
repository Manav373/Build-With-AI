import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, Sprout, Store, Globe, LogOut
} from 'lucide-react';

export default function DomainSwitcherBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, isAuthenticated, login, logout, switchDomain } = useAuth();
  const [loggingIn, setLoggingIn] = useState(false);

  const isFarmerArea = location.pathname.startsWith('/farmer') || 
    ['/chat', '/satellite', '/predict', '/recommend', '/market-prices', '/schemes', '/sell-crops', '/orders'].some(p => location.pathname.startsWith(p));
  const isVendorArea = location.pathname.startsWith('/vendor') || location.pathname.startsWith('/vendors');
  const isAdminArea = location.pathname.startsWith('/admin');

  const currentDomain = isAdminArea ? 'admin' : isVendorArea ? 'vendor' : isFarmerArea ? 'farmer' : 'public';

  const handleQuickLogin = async (phone, pass, domain, targetPath) => {
    setLoggingIn(true);
    try {
      await login(phone, pass, domain);
      switchDomain(domain);
      navigate(targetPath);
    } catch (err) {
      alert(`Login failed: ${err.message}`);
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="bg-[#0b120c]/95 border-b border-[#223825] text-xs text-gray-300 px-4 py-2 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 backdrop-blur-md shadow-lg">
      {/* Left: Domain Indicator & Navigation */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">
          KrishiAI Ecosystem:
        </span>

        <div className="flex items-center bg-[#132015] p-1 rounded-lg border border-[#223825]">
          {/* Public */}
          <button
            onClick={() => { switchDomain('public'); navigate('/'); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              currentDomain === 'public' 
                ? 'bg-emerald-600 text-white font-medium shadow' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Public Portal</span>
          </button>

          {/* Farmer */}
          <button
            onClick={() => { switchDomain('farmer'); navigate('/chat'); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              currentDomain === 'farmer' 
                ? 'bg-emerald-600 text-white font-medium shadow' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sprout className="w-3.5 h-3.5 text-emerald-400" />
            <span>Farmer Domain</span>
          </button>

          {/* Vendor */}
          <button
            onClick={() => { switchDomain('vendor'); navigate('/vendor-dashboard'); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              currentDomain === 'vendor' 
                ? 'bg-blue-600 text-white font-medium shadow' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-blue-400" />
            <span>Vendor Domain</span>
          </button>

          {/* Admin */}
          <button
            onClick={() => { switchDomain('admin'); navigate('/admin/dashboard'); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              currentDomain === 'admin' 
                ? 'bg-purple-600 text-white font-medium shadow' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Admin Command</span>
          </button>
        </div>
      </div>

      {/* Right: User State & Fast Role Switcher */}
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-[#17271b] px-2.5 py-1 rounded-full border border-[#2b4730]">
              <span className={`w-2 h-2 rounded-full ${
                role === 'ADMIN' ? 'bg-purple-400' : role === 'VENDOR' ? 'bg-blue-400' : 'bg-emerald-400'
              }`} />
              <span className="font-semibold text-white">{user?.name || user?.phone}</span>
              <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-gray-300">
                {role}
              </span>
            </span>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 hover:bg-red-950/50 hover:text-red-400 text-gray-400 rounded-md transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-[11px]">Quick Demo Logins:</span>
            
            <button
              disabled={loggingIn}
              onClick={() => handleQuickLogin('9876543210', 'farmer123', 'farmer', '/chat')}
              className="bg-[#17271b] hover:bg-[#203625] text-emerald-300 px-2.5 py-1 rounded border border-[#2b4730] transition-colors"
            >
              Farmer (Ramesh)
            </button>

            <button
              disabled={loggingIn}
              onClick={() => handleQuickLogin('9123456780', 'vendor123', 'vendor', '/vendor-dashboard')}
              className="bg-[#132233] hover:bg-[#1c3047] text-blue-300 px-2.5 py-1 rounded border border-[#233a54] transition-colors"
            >
              Vendor (Sunil)
            </button>

            <button
              disabled={loggingIn}
              onClick={() => handleQuickLogin('9999999999', 'admin123', 'admin', '/admin/dashboard')}
              className="bg-[#241635] hover:bg-[#321e4a] text-purple-300 px-2.5 py-1 rounded border border-[#432763] transition-colors font-medium"
            >
              Chief Admin
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
