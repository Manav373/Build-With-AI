import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';
import { useChat } from '../context/ChatContext';
import { MobileMenuProvider, useMobileMenu } from '../context/MobileMenuContext';

/* Inner component so it can consume the context */
function LayoutInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mobileMenuOpen, setMobileMenuOpen } = useMobileMenu();
  const {
    chatSessions,
    currentChatId,
    handleNewChat,
    handleSelectChat,
    handleDeleteChat,
    handleRenameChat,
    language,
    setLanguage,
    setShowPriceChart,
  } = useChat();

  const handleSidebarAction = (actionId) => {
    setMobileMenuOpen(false);
    switch (actionId) {
      case 'home': navigate('/'); break;
      case 'dashboard': navigate('/chat'); break;
      case 'analytics': navigate('/analytics'); break;
      case 'mandi_map': navigate('/mandi-map'); break;
      case 'market_prices':
        if (location.pathname === '/market-prices') {
          setShowPriceChart(true);
        } else {
          navigate('/market-prices');
        }
        break;
      case 'schemes': navigate('/schemes'); break;
      case 'predict': navigate('/predict'); break;
      case 'recommend': navigate('/recommend'); break;
      case 'satellite': navigate('/satellite'); break;
      case 'iot': navigate('/iot'); break;
      case 'settings': navigate('/settings'); break;
      case 'help': navigate('/help'); break;
    }
  };

  return (
    <div className="flex h-screen w-full bg-white text-slate-900 overflow-hidden font-inter selection:bg-[#4ade80]/30 selection:text-[#4ade80] dark:bg-[#030905] dark:text-[#e2f0e4]">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar — desktop static, mobile slide-in */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <DashboardSidebar
          currentPath={location.pathname}
          onAction={handleSidebarAction}
          onClose={() => setMobileMenuOpen(false)}
          chatSessions={chatSessions}
          currentChatId={currentChatId}
          onNewChat={() => { handleNewChat(); if (location.pathname !== '/chat') navigate('/chat'); setMobileMenuOpen(false); }}
          onSelectChat={(id) => { handleSelectChat(id); if (location.pathname !== '/chat') navigate('/chat'); setMobileMenuOpen(false); }}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
          language={language}
          onLanguageChange={setLanguage}
        />
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden absolute top-4 right-4 text-[#86efac]/70 p-2 bg-black/40 rounded-full"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Content Area — no left padding needed, burger lives inside page headers */}
      <main id="main-content" className="flex-1 flex flex-col min-w-0 min-h-0 relative z-10 w-full h-full overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

const MainLayout = () => (
  <MobileMenuProvider>
    <LayoutInner />
  </MobileMenuProvider>
);

export default MainLayout;
