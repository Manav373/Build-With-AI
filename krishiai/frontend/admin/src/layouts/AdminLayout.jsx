import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  PackageCheck,
  ShoppingBag,
  AlertCircle,
  FileSpreadsheet,
  Activity,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@krishiai/auth';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/users', icon: Users, label: 'User Directory' },
  { to: '/admin/vendor-verification', icon: ShieldCheck, label: 'Vendor KYC' },
  { to: '/admin/product-moderation', icon: PackageCheck, label: 'Product Moderation' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Order Monitor' },
  { to: '/admin/complaints', icon: AlertCircle, label: 'Grievance Desk' },
  { to: '/admin/schemes', icon: FileSpreadsheet, label: 'Govt Schemes' },
  { to: '/admin/audit-logs', icon: Activity, label: 'Audit Trail' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_authenticated');
    if (logout) logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#050e07] text-[#e2f0e4] flex flex-col pt-10">
      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#030905]/95 border-b border-emerald-500/15 sticky top-10 z-30 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-sm">
            KA
          </div>
          <span className="font-semibold text-white tracking-wide">KrishiAI Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-[#0a1a0d] border border-emerald-500/20 text-emerald-300 hover:text-white"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#030905]/95 backdrop-blur-md border-r border-emerald-500/15 flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0 pt-10 md:pt-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Brand Header */}
          <div className="px-6 py-5 border-b border-emerald-500/15 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#166534] via-[#15803d] to-[#4ade80] flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
                🛡️
              </div>
              <div>
                <h1 className="font-bold text-base text-white leading-tight">KrishiAI Control</h1>
                <p className="text-[11px] text-emerald-400 font-medium tracking-wider uppercase">Master Console</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-400/60">
              Operations & Moderation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 border ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35 shadow-[0_0_15px_rgba(74,222,128,0.12)] font-semibold'
                        : 'border-transparent text-emerald-200/60 hover:text-emerald-300 hover:bg-emerald-950/40 hover:border-emerald-500/20'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile & Domain Links */}
          <div className="p-3 border-t border-emerald-500/15 space-y-2">
            <div className="p-2.5 rounded-xl bg-[#0a1a0d]/90 border border-emerald-500/20 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-semibold text-xs">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-100 truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[11px] text-emerald-400 truncate capitalize">{user?.role || 'Super Admin'}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 text-emerald-300/60 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </aside>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto bg-[#050e07] p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
