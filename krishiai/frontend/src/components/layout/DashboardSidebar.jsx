import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Map, TrendingUp, Sparkles, HelpCircle, Settings, Plus, MessageSquare, Trash2, Edit2, Check, Home, BarChart2, Satellite, Phone, Mic, Users, Globe, ChevronDown, Sun, Moon, ShoppingBag } from 'lucide-react';
import { LANGUAGES } from '../../utils/translations/index';
import { UserButton, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

import { translations } from '../../utils/translations/index';
import { useTheme } from '../../context/ThemeContext';

export default function DashboardSidebar({ currentPath = '/chat', onAction, onClose, chatSessions = [], currentChatId, onNewChat, onSelectChat, onDeleteChat, onRenameChat, language = 'en', onLanguageChange }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const navigate = useNavigate();
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const editInputRef = useRef(null);
  const [langOpen, setLangOpen] = useState(false);

  const t = translations[language].sidebar || translations[language].chat.sidebar;

  useEffect(() => {
    if (editingChatId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingChatId]);

  const handleRenameSubmit = (id) => {
    if (editingTitle.trim()) {
      onRenameChat(id, editingTitle.trim());
    }
    setEditingChatId(null);
  };

  const groupChats = (chats) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = { Today: [], Yesterday: [], Older: [] };
    chats.forEach(chat => {
      const d = new Date(chat.updatedAt);
      if (d >= today) groups.Today.push(chat);
      else if (d >= yesterday) groups.Yesterday.push(chat);
      else groups.Older.push(chat);
    });

    return [
      { id: 'Today', label: t.today, chats: groups.Today },
      { id: 'Yesterday', label: t.yesterday, chats: groups.Yesterday },
      { id: 'Older', label: t.older, chats: groups.Older }
    ].filter(g => g.chats.length > 0);
  };

  const chatGroups = groupChats(chatSessions);

  const coreItems = [
    { id: 'home', icon: <Home size={18} />, label: t.home, path: '/' },
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: t.dashboard, path: '/chat', active: currentPath === '/chat' },
    { id: 'community', icon: <Users size={18} />, label: t.community, path: '/community', active: currentPath === '/community' },
    { id: 'voice_assistant', icon: <Mic size={18} />, label: t.voiceAssistant, path: '/voice-assistant', active: currentPath === '/voice-assistant' },
  ];

  const intelligenceItems = [
    { id: 'predict', icon: <TrendingUp size={18} />, label: translations[language].chat.intelligence.predict.title, path: '/predict', active: currentPath === '/predict' },
    { id: 'recommend', icon: <Sparkles size={18} />, label: translations[language].chat.intelligence.recommend.title, path: '/recommend', active: currentPath === '/recommend' },
    { id: 'satellite', icon: <Satellite size={18} />, label: translations[language].chat.intelligence.satellite.title, path: '/satellite', active: currentPath === '/satellite' },
    { id: 'mandi_map', icon: <Map size={18} />, label: t.mandiMap, path: '/mandi-map', active: currentPath === '/mandi-map' },
  ];

  const toolsItems = [
    { id: 'vendors', icon: <ShoppingBag size={18} />, label: 'Vendor Marketplace', path: '/vendors', active: currentPath === '/vendors' },
    { id: 'market_prices', icon: <BarChart2 size={18} />, label: t.marketPrices, path: '/market-prices', active: currentPath === '/market-prices' },
    { id: 'analytics', icon: <LayoutDashboard size={18} />, label: t.analytics, path: '/analytics', active: currentPath === '/analytics' },
    { id: 'schemes', icon: <Sparkles size={18} />, label: t.schemes, path: '/schemes', active: currentPath === '/schemes' },
  ];

  const supportItems = [
    { id: 'whats_app', icon: <MessageSquare size={18} />, label: 'WhatsApp Bot', path: '/whatsapp', active: currentPath === '/whatsapp' },
    { id: 'call_history', icon: <Phone size={18} />, label: t.callHistory, path: '/call-history', active: currentPath === '/call-history' },
  ];

  const bottomItems = [
    { id: 'help', icon: <HelpCircle size={18} />, label: t.help, path: '/help', active: currentPath === '/help' },
    { id: 'settings', icon: <Settings size={18} />, label: t.settings, path: '/settings', active: currentPath === '/settings' },
  ];

  // Helper render function for nav items
  const renderNavGroup = (items) => (
    items.map((item, idx) => (
      <a
        key={idx}
        href={item.path}
        onClick={(e) => {
          e.preventDefault();
          if (item.path !== '#') {
            navigate(item.path);
          } else if (onAction) {
            onAction(item.id);
          }
          onClose?.();
        }}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[0.88rem] font-medium transition-all ${item.active
          ? theme === 'light'
            ? 'bg-gray-200 text-[var(--glt)] border border-[var(--g)]/10 shadow-sm hover:bg-gray-300'
            : 'bg-[#166534]/40 text-[#4ade80] border border-[#4ade80]/20 shadow-[0_0_15px_rgba(22,101,52,0.4)]'
          : theme === 'light'
            ? 'text-[var(--mut)] hover:bg-gray-200 hover:text-[var(--glt)] hover:translate-x-1 active:bg-gray-300'
            : 'text-[#86efac]/70 hover:bg-[#166534]/15 hover:text-[#86efac] border border-transparent'
          }`}
      >
        <span className={item.active ? (theme === 'light' ? 'text-[var(--glt)]' : 'text-[#4ade80]') : (theme === 'light' ? 'text-[var(--mut)]/60' : 'text-[#86efac]/50')}>{item.icon}</span>
        {item.label}
      </a>
    ))
  );

  return (
    <div className="w-full sm:w-[320px] md:w-[280px] h-full bg-[var(--sidebar-bg)] border-r border-[var(--glass-border)] flex flex-col pt-6 pb-4 z-20 shrink-0 transition-colors duration-300">
      {/* Brand */}
      <div className="px-7 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={{ fontSize: '2rem', filter: 'drop-shadow(0 0 15px rgba(74,222,128,0.5))' }}>🌾</div>
          <h1 className="font-outfit font-extrabold text-[var(--txt)] text-2xl">
            Krishi<span className="text-emerald-500">AI</span>
          </h1>
        </div>
      </div>

      <div className="px-5 mb-4">
        <button
          onClick={onNewChat}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[0.85rem] transition-all duration-300 ${theme === 'light'
              ? 'bg-gradient-to-r from-[var(--g)] to-[var(--g2)] text-white shadow-[0_4px_12px_rgba(22,101,52,0.15)] hover:shadow-[0_6px_20px_rgba(22,101,52,0.25)] hover:scale-[1.02] active:scale-95'
              : 'bg-gradient-to-r from-[#166534] to-[#15803d] text-[#86efac] shadow-[0_0_15px_rgba(22,101,52,0.4)] hover:shadow-[0_0_20px_rgba(74,222,128,0.3)]'
            }`}
        >
          <Plus size={16} /> {t.newChat}
        </button>
      </div>

      {/* Main Nav */}
      <div className="flex-1 px-4 flex flex-col gap-1.5 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

        <div className={`text-[0.7rem] font-bold px-3 mb-2 mt-4 ${theme === 'light' ? 'text-[var(--mut)] opacity-60' : 'text-[#86efac]/50'}`}>Core Features</div>
        {renderNavGroup(coreItems)}

        <div className={`text-[0.7rem] font-bold px-3 mb-2 mt-6 ${theme === 'light' ? 'text-[var(--mut)] opacity-60' : 'text-[#86efac]/50'}`}>A.I. Analytics & Maps</div>
        {renderNavGroup(intelligenceItems)}

        <div className={`text-[0.7rem] font-bold px-3 mb-2 mt-6 ${theme === 'light' ? 'text-[var(--mut)] opacity-60' : 'text-[#86efac]/50'}`}>Market Tools</div>
        {renderNavGroup(toolsItems)}

        <div className={`text-[0.7rem] font-bold px-3 mb-2 mt-6 ${theme === 'light' ? 'text-[var(--mut)] opacity-60' : 'text-[#86efac]/50'}`}>Support & Voice</div>
        {renderNavGroup(supportItems)}

        {/* Recent Chats - Grouped */}
        {chatGroups.length === 0 ? (
          <>
            <div className={`text-[0.7rem] font-bold px-3 mb-2 mt-6 ${theme === 'light' ? 'text-[var(--mut)] opacity-60' : 'text-[#86efac]/50'}`}>{t.recentChats}</div>
            <div className={`text-[0.75rem] italic px-4 py-2 ${theme === 'light' ? 'text-[var(--mut)]/50' : 'text-[#86efac]/40'}`}>{t.noHistory}</div>
          </>
        ) : (
          chatGroups.map(group => (
            <div key={group.id} className="mt-6 mb-2">
              <div className={`text-[0.7rem] font-bold px-3 mb-2 ${theme === 'light' ? 'text-[var(--mut)] opacity-60' : 'text-[#86efac]/50'}`}>{group.label}</div>
              {group.chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => { if (editingChatId !== chat.id) onSelectChat(chat.id); }}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all mb-0.5 ${currentChatId === chat.id
                    ? theme === 'light'
                      ? 'bg-gray-200 text-[var(--glt)] border border-[var(--g)]/10 shadow-sm hover:bg-gray-300'
                      : 'bg-[#166534]/30 border border-[#4ade80]/20 text-[#4ade80]'
                    : theme === 'light'
                      ? 'text-[var(--mut)] hover:bg-gray-200 hover:text-[var(--glt)] hover:translate-x-1 active:bg-gray-300'
                      : 'border-transparent text-[#86efac]/60 hover:bg-[#166534]/15 hover:text-[#86efac]'
                    }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden w-full relative">
                    <MessageSquare size={14} className="flex-shrink-0 opacity-70" />

                    {editingChatId === chat.id ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => handleRenameSubmit(chat.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSubmit(chat.id);
                          if (e.key === 'Escape') setEditingChatId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-transparent border-b border-emerald-500 text-[0.8rem] text-[var(--txt)] outline-none py-0 font-medium"
                      />
                    ) : (
                      <span className="text-[0.8rem] truncate font-medium flex-1">{chat.title}</span>
                    )}
                  </div>

                  {editingChatId === chat.id ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRenameSubmit(chat.id); }}
                      className="text-[#4ade80] p-1 rounded-md hover:bg-black/30 transition-all ml-1 flex-shrink-0"
                    >
                      <Check size={13} />
                    </button>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-all ml-1 bg-[var(--dk3)]/80 pl-1 rounded flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTitle(chat.title);
                          setEditingChatId(chat.id);
                        }}
                        className="text-[#86efac]/70 hover:text-[#4ade80] p-1.5 rounded-md hover:bg-black/40 transition-all"
                        title="Rename Chat"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                        className="text-red-500/70 hover:text-red-400 p-1.5 rounded-md hover:bg-black/40 transition-all"
                        title="Delete Chat"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        )}

        <div className={`text-[0.7rem] font-bold px-3 mb-2 mt-8 ${theme === 'light' ? 'text-[var(--glt)]' : 'text-[#86efac]/50'}`}>{t.preferences}</div>
        {bottomItems.map((item, idx) => (
          <a
            key={idx}
            href={item.path}
            onClick={(e) => {
              e.preventDefault();
              navigate(item.path);
              onClose?.();
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[0.88rem] font-medium transition-all ${item.active
              ? theme === 'light'
                ? 'bg-gray-200 text-[var(--glt)] border border-[var(--g)]/10 shadow-sm hover:bg-gray-300'
                : 'bg-[#166534]/40 text-[#4ade80] border border-[#4ade80]/20 shadow-[0_0_15px_rgba(22,101,52,0.4)]'
              : theme === 'light'
                ? 'text-[var(--mut)] hover:bg-gray-100 hover:text-[var(--glt)] active:bg-gray-200'
                : 'text-[#86efac]/70 hover:bg-[#166534]/15 hover:text-[#86efac] border border-transparent'
              }`}
          >
            <span className={item.active ? (theme === 'light' ? 'text-[var(--glt)]' : 'text-[#4ade80]') : (theme === 'light' ? 'text-[var(--mut)]/60' : 'text-[#86efac]/50')}>{item.icon}</span>
            {item.label}
          </a>
        ))}
      </div>

      {/* User Profile & Language Selector Area */}
      <div className="px-4 mt-auto pt-4 pb-2 space-y-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer group ${theme === 'light'
              ? 'bg-[var(--g)]/5 border border-[var(--glass-border)] text-[var(--glt)] hover:bg-[var(--g)]/10'
              : 'bg-white/5 border border-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
        >
          <div className="flex items-center gap-3 font-bold text-[0.88rem]">
            {theme === 'light' ? (
              <>
                <Sun size={16} className="text-amber-500" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={16} className="text-violet-400" />
                <span>Dark Mode</span>
              </>
            )}
          </div>
          <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'light' ? 'bg-amber-400' : 'bg-slate-600'}`}>
            <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-300 shadow-sm ${theme === 'light' ? 'translate-x-[16px]' : 'translate-x-0'}`} />
          </div>
        </button>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer group ${theme === 'light'
                ? 'bg-[var(--g)]/10 border border-[var(--glass-border)] text-[var(--glt)] hover:bg-[var(--g)]/20'
                : 'bg-[#166534]/10 border border-[#86efac]/10 text-[#86efac] hover:bg-[#166534]/20'
              }`}
          >
            <div className="flex items-center gap-3 font-bold text-[0.88rem]">
              <Globe size={16} className={`${theme === 'light' ? 'text-[var(--mut)] group-hover:text-[var(--glt)]' : 'text-[#86efac]/50 group-hover:text-[#4ade80]'} transition-colors`} />
              {LANGUAGES.find(l => l.code === language)?.label || 'Language'}
            </div>
            <ChevronDown size={14} className={`${theme === 'light' ? 'text-[var(--mut)]/50' : 'text-[#86efac]/50'} transition-transform duration-300 ${langOpen ? 'rotate-180' : ''}`} />
          </button>

          {langOpen && (
            <div className="absolute bottom-full left-0 w-full mb-2 bg-[var(--dk2)] border border-[var(--glass-border)] rounded-2xl shadow-2xl overflow-hidden py-2 z-50">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange?.(lang.code);
                    setLangOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${theme === 'light'
                      ? language === lang.code ? 'text-[var(--glt)] font-bold bg-[var(--g)]/20' : 'text-[var(--mut)] hover:bg-[var(--g)]/40'
                      : language === lang.code ? 'text-[#4ade80] font-bold bg-[#166534]/20' : 'text-[#86efac]/60 hover:bg-[#166534]/40'
                    }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 rounded-2xl bg-[var(--g)]/5 border border-[var(--glass-border)] flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.1)] relative hover:bg-[var(--g)]/10 transition-colors cursor-pointer group">
          {/* Clerk absolute invisible overlay for full-width clicking */}
          <div className="absolute inset-0 z-0 opacity-0 overflow-hidden rounded-2xl">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  rootBox: { width: '100%', height: '100%' },
                  userButtonTrigger: { width: '100%', height: '100%', padding: 0, margin: 0 },
                  userButtonBox: { width: '100%', height: '100%' },
                  userButtonPopoverCard: {
                    background: 'var(--tooltip-bg)',
                    border: '1px solid var(--glass-border)',
                    backdropFilter: 'blur(24px)'
                  }
                }
              }}
            />
          </div>

          {/* Visible Avatar Image (from Clerk User info) */}
          <div className="w-[38px] h-[38px] rounded-full overflow-hidden border border-[var(--glass-border)] shrink-0 relative z-10 pointer-events-none group-hover:border-[var(--glt)]/40 transition-colors">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[var(--g)] flex items-center justify-center text-[var(--glt)] font-bold text-lg">
                {(user?.firstName?.[0] || 'K').toUpperCase()}
              </div>
            )}
          </div>

          {/* Visible Name/Email text */}
          <div className="flex flex-col overflow-hidden min-w-0 relative z-10 pointer-events-none">
            <span className={`text-[0.85rem] font-bold truncate transition-colors ${theme === 'light' ? 'text-[var(--txt)] group-hover:text-[var(--glt)]' : 'text-[var(--txt)] group-hover:text-[#4ade80]'}`}>
              {user?.fullName || user?.firstName || 'Farmer Profile'}
            </span>
            <span className={`text-[0.7rem] truncate transition-colors ${theme === 'light' ? 'text-[var(--mut)] group-hover:text-[var(--txt)]' : 'text-[#86efac]/60 group-hover:text-[#86efac]/80'}`}>
              {user?.primaryEmailAddress?.emailAddress || 'Pro Member'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
