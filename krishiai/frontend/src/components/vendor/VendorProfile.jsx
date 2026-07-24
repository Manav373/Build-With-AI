import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Star, CheckCircle2, Shield, Award, Zap, Phone, Mail,
  MessageCircle, Share2, Heart, Flag, MapPin, Clock, Globe,
  Package, Truck, CreditCard, ArrowUp, Users, ShoppingBag,
  TrendingUp, Camera, ThumbsUp, ExternalLink, Copy,
  ChevronRight, BadgeCheck, Building2, Calendar,
  Leaf, Wheat, Wrench, Tag, X, Send, CheckCheck, AlertCircle
} from 'lucide-react';

function AnimatedCount({ value, suffix = '', prefix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const end = typeof value === 'number' ? value : parseFloat(value);
    const duration = 1500;
    const step = 20;
    const increment = end / (duration / step);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, end);
      setDisplay(Number.isInteger(end) ? Math.floor(current) : current.toFixed(1));
      if (current >= end) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, [inView, value]);

  return <span ref={ref}>{prefix}{inView ? display.toLocaleString() : 0}{suffix}</span>;
}

function Stars({ rating, size = 14 }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}
        />
      ))}
    </span>
  );
}

function Section({ id, title, icon: Icon, iconColor = 'text-amber-400', children, className = '' }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`scroll-mt-20 ${className}`}
    >
      {title && (
        <div className="flex items-center gap-3 mb-6">
          {Icon && (
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Icon size={18} className={iconColor} />
            </div>
          )}
          <h2 className="text-xl font-bold text-white font-outfit">{title}</h2>
        </div>
      )}
      {children}
    </motion.section>
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#0d1b2a]/80 border border-white/8 rounded-2xl p-5 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

const TABS = [
  { id: 'overview',     label: 'Overview',      icon: TrendingUp },
  { id: 'products',     label: 'Products',      icon: Package },
  { id: 'reviews',      label: 'Reviews',       icon: Star },
  { id: 'certifications', label: 'Certificates', icon: Shield },
  { id: 'contact',      label: 'Contact',       icon: Phone },
  { id: 'gallery',      label: 'Gallery',       icon: Camera },
];

export default function VendorProfile({ vendorData: v }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [productFilter, setProductFilter] = useState('All');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    const fn = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const shareProfile = () => {
    if (navigator.share) {
      navigator.share({ title: v.businessName, text: v.tagline, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  const uniqueCategories = ['All', ...new Set((v.products || []).map(p => p.category))];
  const filteredProducts = (v.products || []).filter(p => productFilter === 'All' || p.category === productFilter);

  const trustBadges = [
    v.isVerified && { label: 'Verified Vendor', icon: BadgeCheck, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    v.isTopRated && { label: 'Top Rated', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    v.isPremium && { label: 'Premium Seller', icon: Award, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    v.governmentVerified && { label: 'Govt. Authorized', icon: Shield, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    v.isFastResponder && { label: 'Fast Responder', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    v.isBestSeller && { label: 'Best Seller', icon: TrendingUp, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
    v.organicCertified && { label: 'Organic Certified', icon: Leaf, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  ].filter(Boolean);

  const verificationBadges = [
    { label: 'Mobile Verified',    done: v.mobileVerified },
    { label: 'Email Verified',     done: v.emailVerified },
    { label: 'Business Verified',  done: v.businessVerified },
    { label: 'Govt. Verified',     done: v.governmentVerified },
    { label: 'GST Verified',       done: v.gstVerified },
    { label: 'Organic Certified',  done: v.organicCertified },
    { label: 'Seed Dealer',        done: v.seedDealerCertified },
    { label: 'Fertilizer Dealer',  done: v.fertilizerDealerCertified },
    { label: 'Pesticide Dealer',   done: v.pesticideDealerCertified },
    { label: 'Trusted Vendor',     done: v.isTrustedVendor },
  ];

  const stats = [
    { label: 'Years in Business', value: v.yearsExperience,    suffix: '+', icon: Calendar, color: 'text-amber-400' },
    { label: 'Total Products',    value: v.totalProducts,       suffix: '+', icon: Package,  color: 'text-blue-400' },
    { label: 'Farmers Served',    value: v.farmersServed,       suffix: '+', icon: Users,    color: 'text-green-400' },
    { label: 'Orders Completed',  value: v.ordersCompleted,     suffix: '+', icon: ShoppingBag, color: 'text-purple-400' },
    { label: 'Repeat Customers',  value: v.repeatCustomers,     suffix: '+', icon: Heart,    color: 'text-rose-400' },
    { label: 'Response Rate',     value: v.responseRate,        suffix: '%', icon: Zap,      color: 'text-yellow-400' },
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(145deg, #060d12 0%, #0a1628 50%, #060d12 100%)', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Hero Header */}
      <div className="relative">
        <div className="relative h-52 sm:h-64 md:h-72 overflow-hidden">
          <img
            src={v.coverImage || 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4e7?w=1200&h=400&fit=crop'}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(6,13,18,0.1) 0%, rgba(6,13,18,0.85) 100%)' }} />
          <button
            type="button"
            onClick={() => navigate('/vendors')}
            className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold text-white backdrop-blur-sm cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            ← Back to Vendors
          </button>
          <button
            type="button"
            onClick={shareProfile}
            className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold text-white backdrop-blur-sm cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <Share2 size={14} /> Share
          </button>
        </div>

        {/* Profile Info Header Bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 pb-6">
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 overflow-hidden shadow-2xl" style={{ borderColor: '#facc15' }}>
                <img src={v.profileImage} alt={v.vendorName} className="w-full h-full object-cover" />
              </div>
              {v.isOnline && (
                <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-400 rounded-full border-2 border-[#060d12]" title="Online" />
              )}
            </div>

            <div className="flex-1 min-w-0 mt-2 sm:mt-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-white font-outfit leading-tight">{v.businessName}</h1>
                {v.isVerified && <BadgeCheck size={20} className="text-blue-400 flex-shrink-0" />}
                {v.isPremium && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full" style={{ background: 'linear-gradient(135deg,#a16207,#facc15)', color: '#1c0e00' }}>
                    ⭐ Premium
                  </span>
                )}
              </div>
              <p className="text-amber-400/80 text-sm font-medium mb-1">@{v.vendorName}</p>
              <p className="text-gray-400 text-sm mb-2">{v.tagline}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><MapPin size={12} className="text-amber-400" />{v.location}</span>
                <span className="flex items-center gap-1"><Building2 size={12} className="text-amber-400" />{v.businessType}</span>
                <span className="flex items-center gap-1"><Calendar size={12} className="text-amber-400" />Est. {v.yearEstablished}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 sm:flex-shrink-0">
              <div className="flex items-center gap-2">
                <Stars rating={v.rating} size={16} />
                <span className="text-white font-bold text-lg">{v.rating}</span>
                <span className="text-gray-400 text-sm">({v.totalReviews} reviews)</span>
              </div>
              <div className="w-40">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Profile Complete</span>
                  <span>{v.profileCompletion}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg,#a16207,#facc15)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${v.profileCompletion}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pb-6">
            {[
              { label: 'Call', icon: Phone, href: `tel:${v.primaryMobile}`, primary: true },
              { label: 'WhatsApp', icon: MessageCircle, href: `https://wa.me/${v.whatsappNumber}`, green: true },
              { label: 'Email', icon: Mail, href: `mailto:${v.email}` },
              { label: 'Website', icon: Globe, href: `https://${v.website}`, target: '_blank' },
              { label: isFollowing ? 'Following' : 'Follow', icon: Heart, onClick: () => setIsFollowing(!isFollowing), active: isFollowing },
              { label: isSaved ? 'Saved' : 'Save', icon: Tag, onClick: () => setIsSaved(!isSaved), active: isSaved },
              { label: 'Inquiry', icon: Send, onClick: () => setInquiryOpen(true), gold: true },
            ].map((btn, i) => (
              btn.href ? (
                <a
                  key={i}
                  href={btn.href}
                  target={btn.target}
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    btn.primary ? 'text-white' : btn.green ? 'text-white' : 'text-gray-300 border border-white/12 hover:border-white/25'
                  }`}
                  style={
                    btn.primary ? { background: 'linear-gradient(135deg,#166534,#4ade80)', boxShadow: '0 4px 14px rgba(74,222,128,0.3)' } :
                    btn.green ? { background: '#16a34a' } :
                    { background: 'rgba(255,255,255,0.05)' }
                  }
                >
                  <btn.icon size={13} />{btn.label}
                </a>
              ) : (
                <button
                  key={i}
                  type="button"
                  onClick={btn.onClick}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    btn.active ? 'text-white' : btn.gold ? 'text-amber-900' : 'text-gray-300 border border-white/12 hover:border-white/25'
                  }`}
                  style={
                    btn.active ? { background: 'rgba(250,204,21,0.25)', border: '1px solid rgba(250,204,21,0.5)', color: '#facc15' } :
                    btn.gold ? { background: 'linear-gradient(135deg,#a16207,#facc15)', boxShadow: '0 4px 14px rgba(250,204,21,0.3)' } :
                    { background: 'rgba(255,255,255,0.05)' }
                  }
                >
                  <btn.icon size={13} />{btn.label}
                </button>
              )
            ))}
            <button
              type="button"
              onClick={() => {}}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors ml-auto cursor-pointer"
              style={{ background: 'rgba(239,68,68,0.05)' }}
            >
              <Flag size={13} /> Report
            </button>
          </div>
        </div>
      </div>

      {/* Trust Badges Bar */}
      <div className="border-y border-white/6" style={{ background: 'rgba(250,204,21,0.03)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap gap-2">
            {trustBadges.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${b.bg} ${b.color}`}
              >
                <b.icon size={12} />
                {b.label}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-40 border-b border-white/8 backdrop-blur-xl" style={{ background: 'rgba(6,13,18,0.94)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0 overflow-x-auto scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all duration-200 flex-shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-10">
                {/* Statistics */}
                <Section title="Business Statistics" icon={TrendingUp}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {stats.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.07 }}
                        className="bg-white/4 border border-white/8 rounded-xl p-4 text-center hover:border-amber-500/30 transition-colors"
                      >
                        <s.icon size={20} className={`${s.color} mx-auto mb-2`} />
                        <div className={`text-2xl font-black ${s.color} font-outfit`}>
                          <AnimatedCount value={s.value} suffix={s.suffix} />
                        </div>
                        <div className="text-xs text-gray-400 mt-1 font-medium">{s.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </Section>

                {/* About Business */}
                <Section title="About Business" icon={Building2}>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="md:col-span-2">
                      <h3 className="text-sm font-bold text-amber-400 mb-2 uppercase tracking-wider">Our Story</h3>
                      <p className="text-gray-300 leading-relaxed text-sm">{v.businessStory}</p>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Mission</h4>
                          <p className="text-gray-300 text-xs leading-relaxed">{v.mission}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Vision</h4>
                          <p className="text-gray-300 text-xs leading-relaxed">{v.vision}</p>
                        </div>
                      </div>
                    </Card>
                    <div className="space-y-3">
                      <Card>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Info</h3>
                        {[
                          { label: 'Owner', value: v.ownerName },
                          { label: 'Business Type', value: v.businessType },
                          { label: 'Category', value: v.businessCategory },
                          { label: 'Employees', value: v.numberOfEmployees },
                          { label: 'Status', value: v.registrationStatus },
                        ].map((item, i) => (
                          <div key={i} className="flex justify-between text-xs py-1.5 border-b border-white/6 last:border-0">
                            <span className="text-gray-400">{item.label}</span>
                            <span className="text-gray-200 font-medium text-right ml-2 max-w-[140px] truncate">{item.value}</span>
                          </div>
                        ))}
                      </Card>
                      <Card>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Languages</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {(v.languagesSpoken || []).map(lang => (
                            <span key={lang} className="px-2 py-1 text-xs rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">{lang}</span>
                          ))}
                        </div>
                      </Card>
                    </div>
                  </div>
                </Section>

                {/* Agricultural Info */}
                <Section title="Agricultural Information" icon={Wheat} iconColor="text-green-400">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Product Categories</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {(v.productCategories || []).map(c => (
                          <span key={c} className="px-2 py-1 text-xs rounded-lg bg-green-500/10 text-green-300 border border-green-500/20">{c}</span>
                        ))}
                      </div>
                    </Card>
                    <Card>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Crops Served</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {(v.cropCategoriesServed || []).map(c => (
                          <span key={c} className="px-2 py-1 text-xs rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20">{c}</span>
                        ))}
                      </div>
                    </Card>
                    <Card>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Service Areas</h3>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {(v.serviceAreas || []).map(a => (
                          <span key={a} className="px-2 py-1 text-xs rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">{a}</span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400">Coverage: {v.deliveryCoverage?.km}+ km radius</p>
                    </Card>
                    <Card className="sm:col-span-2 lg:col-span-3">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Availability Options</h3>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { label: 'Bulk Supply', active: v.bulkSupply, icon: Package },
                          { label: 'Wholesale', active: v.wholesaleAvailable, icon: ShoppingBag },
                          { label: 'Retail', active: v.retailAvailable, icon: Tag },
                          { label: 'Organic Products', active: v.organicProducts, icon: Leaf },
                          { label: 'Seasonal Products', active: v.seasonalProducts, icon: Calendar },
                          { label: 'Farm Equipment', active: v.farmEquipmentAvailable, icon: Wrench },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border ${
                              item.active
                                ? 'bg-green-500/10 text-green-300 border-green-500/25'
                                : 'bg-white/4 text-gray-500 border-white/8'
                            }`}
                          >
                            <item.icon size={13} />
                            {item.label}
                            {item.active ? <CheckCircle2 size={12} className="text-green-400" /> : <X size={12} className="text-gray-600" />}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </Section>

                {/* Featured Products Preview */}
                <Section title="Featured Products" icon={Package} iconColor="text-blue-400">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {(v.products || []).filter(p => p.isFeatured).slice(0, 4).map(p => (
                      <motion.div
                        key={p.id}
                        whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(250,204,21,0.15)' }}
                        className="bg-white/4 border border-white/8 rounded-xl overflow-hidden cursor-pointer hover:border-amber-500/30 transition-all duration-300"
                        onClick={() => setActiveTab('products')}
                      >
                        <img src={p.image} alt={p.name} className="w-full h-28 object-cover" loading="lazy" />
                        <div className="p-3">
                          <p className="text-white font-bold text-xs leading-tight mb-1 line-clamp-2">{p.name}</p>
                          <p className="text-amber-400 text-xs font-bold">{p.price}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star size={10} className="text-amber-400 fill-amber-400" />
                            <span className="text-gray-400 text-xs">{p.rating}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('products')}
                    className="flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    View all {v.totalProducts}+ products <ChevronRight size={16} />
                  </button>
                </Section>

                {/* Customer Reviews Preview */}
                <Section title="Customer Reviews" icon={Star} iconColor="text-amber-400">
                  <div className="grid gap-3 mb-4">
                    {(v.reviews || []).slice(0, 2).map(r => (
                      <Card key={r.id}>
                        <div className="flex items-start gap-3">
                          <img src={r.avatar} alt={r.customerName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" loading="lazy" />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-white font-bold text-sm">{r.customerName}</span>
                              <Stars rating={r.rating} size={12} />
                              {r.isVerifiedPurchase && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCheck size={11} />Verified</span>}
                            </div>
                            <p className="text-amber-400 text-xs font-semibold mb-1">{r.title}</p>
                            <p className="text-gray-300 text-xs leading-relaxed">{r.content}</p>
                            {r.vendorReply && (
                              <div className="mt-2 p-2 rounded-lg bg-amber-500/6 border border-amber-500/15">
                                <p className="text-xs text-amber-400 font-semibold mb-0.5">Vendor Reply:</p>
                                <p className="text-xs text-gray-300">{r.vendorReply}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('reviews')}
                    className="flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    See all {v.totalReviews} reviews <ChevronRight size={16} />
                  </button>
                </Section>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                <Section title={`All Products (${v.totalProducts}+)`} icon={Package} iconColor="text-blue-400">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {uniqueCategories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setProductFilter(cat)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                          productFilter === cat
                            ? 'text-amber-900'
                            : 'text-gray-300 border border-white/12 hover:border-white/25 bg-white/5'
                        }`}
                        style={productFilter === cat
                          ? { background: 'linear-gradient(135deg,#a16207,#facc15)' }
                          : {}}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map(p => (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -4 }}
                        className="bg-white/4 border border-white/8 rounded-xl overflow-hidden hover:border-amber-500/30 transition-all duration-300"
                      >
                        <div className="relative">
                          <img src={p.image} alt={p.name} className="w-full h-36 object-cover" loading="lazy" />
                          <div className="absolute top-2 left-2 flex gap-1">
                            {p.isFeatured && <span className="px-1.5 py-0.5 text-xs font-bold rounded" style={{ background: 'rgba(250,204,21,0.9)', color: '#1c0e00' }}>Featured</span>}
                            {p.isBestSeller && <span className="px-1.5 py-0.5 text-xs font-bold rounded bg-green-500/90 text-white">Best Seller</span>}
                          </div>
                        </div>
                        <div className="p-3">
                          <span className="text-xs text-amber-400/70 font-medium">{p.category}</span>
                          <h4 className="text-white font-bold text-sm mt-0.5 leading-tight line-clamp-2">{p.name}</h4>
                          <p className="text-gray-400 text-xs mt-1 line-clamp-2">{p.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-amber-400 font-bold text-sm">{p.price}</span>
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Star size={11} className="text-amber-400 fill-amber-400" />{p.rating}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="w-full mt-2 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            style={{ background: 'rgba(250,204,21,0.12)', color: '#facc15', border: '1px solid rgba(250,204,21,0.25)' }}
                            onClick={() => setInquiryOpen(true)}
                          >
                            Get Quote
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Section>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <Section title="Reviews & Ratings" icon={Star} iconColor="text-amber-400">
                  <div className="grid sm:grid-cols-3 gap-4 mb-8">
                    <Card className="flex flex-col items-center justify-center py-6">
                      <div className="text-6xl font-black text-white font-outfit mb-2">{v.rating}</div>
                      <Stars rating={v.rating} size={20} />
                      <p className="text-gray-400 text-sm mt-2">{v.totalReviews} reviews</p>
                      <p className="text-green-400 text-xs mt-1 font-medium">{v.positiveReviews} positive ({Math.round(v.positiveReviews / v.totalReviews * 100)}%)</p>
                    </Card>
                    <Card className="sm:col-span-2">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Rating Breakdown</h3>
                      {[5, 4, 3, 2, 1].map(star => {
                        const pct = v.ratingBreakdown?.[star] || 0;
                        return (
                          <div key={star} className="flex items-center gap-3 mb-2">
                            <span className="text-xs text-gray-400 w-4">{star}</span>
                            <Star size={12} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                            <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: 'linear-gradient(90deg,#a16207,#facc15)' }}
                                initial={{ width: 0 }}
                                whileInView={{ width: `${pct}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 w-8">{pct}%</span>
                          </div>
                        );
                      })}
                    </Card>
                  </div>
                  <div className="space-y-4">
                    {(v.reviews || []).map((r, i) => (
                      <Card key={r.id}>
                        <div className="flex items-start gap-4">
                          <img src={r.avatar} alt={r.customerName} className="w-11 h-11 rounded-full object-cover flex-shrink-0" loading="lazy" />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <span className="text-white font-bold">{r.customerName}</span>
                              <Stars rating={r.rating} size={13} />
                              <span className="text-xs text-gray-500">{new Date(r.date).toLocaleDateString('en-IN')}</span>
                              {r.isVerifiedPurchase && (
                                <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                                  <CheckCheck size={11} />Verified Purchase
                                </span>
                              )}
                            </div>
                            <p className="text-amber-400 font-semibold text-sm mb-1">{r.title}</p>
                            <p className="text-gray-300 text-sm leading-relaxed">{r.content}</p>
                            {r.vendorReply && (
                              <div className="mt-3 p-3 rounded-xl border" style={{ background: 'rgba(250,204,21,0.05)', borderColor: 'rgba(250,204,21,0.2)' }}>
                                <p className="text-xs font-bold text-amber-400 mb-1">🏪 Vendor Reply</p>
                                <p className="text-sm text-gray-300">{r.vendorReply}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Section>
              </div>
            )}

            {/* Certifications Tab */}
            {activeTab === 'certifications' && (
              <div className="space-y-8">
                <Section title="Verification Status" icon={BadgeCheck} iconColor="text-blue-400">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {verificationBadges.map((b, i) => (
                      <div
                        key={i}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center ${
                          b.done
                            ? 'bg-green-500/8 border-green-500/25 text-green-300'
                            : 'bg-white/4 border-white/8 text-gray-500'
                        }`}
                      >
                        {b.done
                          ? <CheckCircle2 size={24} className="text-green-400" />
                          : <AlertCircle size={24} className="text-gray-600" />}
                        <span className="text-xs font-bold leading-tight">{b.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.done ? 'bg-green-500/15 text-green-400' : 'bg-white/8 text-gray-500'}`}>
                          {b.done ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Licenses & Certificates" icon={Award} iconColor="text-amber-400">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(v.certificates || []).map((cert, i) => (
                      <Card key={i} className={cert.isVerified ? 'border-green-500/20' : 'border-yellow-500/20'}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(250,204,21,0.1)' }}>
                            {cert.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-bold text-sm">{cert.name}</h4>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              cert.status === 'Valid'
                                ? 'bg-green-500/15 text-green-400'
                                : 'bg-yellow-500/15 text-yellow-400'
                            }`}>
                              {cert.isVerified ? '✓ ' : '⏳ '}{cert.status}
                            </span>
                          </div>
                        </div>
                        {cert.issueDate && (
                          <div className="text-xs text-gray-400 space-y-1">
                            <div className="flex justify-between">
                              <span>Issued:</span>
                              <span className="text-gray-200">{cert.issueDate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Expires:</span>
                              <span className="text-gray-200">{cert.expiryDate}</span>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </Section>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Section title="Contact Information" icon={Phone} iconColor="text-green-400">
                    <Card>
                      {[
                        { label: 'Primary Mobile', value: v.primaryMobile, icon: Phone, href: `tel:${v.primaryMobile}`, copyKey: 'phone' },
                        { label: 'Secondary Mobile', value: v.secondaryMobile, icon: Phone, href: `tel:${v.secondaryMobile}`, copyKey: 'phone2' },
                        { label: 'WhatsApp', value: '+' + v.whatsappNumber, icon: MessageCircle, href: `https://wa.me/${v.whatsappNumber}`, copyKey: 'wa' },
                        { label: 'Email', value: v.email, icon: Mail, href: `mailto:${v.email}`, copyKey: 'email' },
                        { label: 'Website', value: v.website, icon: Globe, href: `https://${v.website}`, copyKey: 'web' },
                        { label: 'Support Line', value: v.supportNumber, icon: Phone, href: `tel:${v.supportNumber}`, copyKey: 'sup' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 py-3 border-b border-white/6 last:border-0 group">
                          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                            <item.icon size={14} className="text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400">{item.label}</p>
                            <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="text-gray-200 text-sm font-medium hover:text-amber-400 transition-colors truncate block">{item.value}</a>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyText(item.value, item.copyKey)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/8 cursor-pointer"
                            title="Copy"
                          >
                            {copied === item.copyKey ? <CheckCheck size={14} className="text-green-400" /> : <Copy size={14} className="text-gray-400" />}
                          </button>
                        </div>
                      ))}
                    </Card>
                  </Section>

                  <Section title="Business Address" icon={MapPin} iconColor="text-red-400">
                    <Card className="mb-4">
                      <div className="space-y-2 text-sm">
                        <p className="text-white font-medium">{v.address?.streetAddress}</p>
                        <p className="text-gray-400">{v.address?.landmark}</p>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {[
                            ['Village/City', v.address?.village],
                            ['Taluka', v.address?.taluka],
                            ['District', v.address?.district],
                            ['State', v.address?.state],
                            ['Country', v.address?.country],
                            ['Pincode', v.address?.pincode],
                          ].map(([label, val]) => (
                            <div key={label}>
                              <p className="text-xs text-gray-500">{label}</p>
                              <p className="text-gray-200 text-xs font-medium">{val}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <a
                        href={v.address?.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200"
                        style={{ background: 'linear-gradient(135deg,#166534,#4ade80)', boxShadow: '0 4px 14px rgba(74,222,128,0.25)' }}
                      >
                        <ExternalLink size={14} /> Open in Google Maps
                      </a>
                    </Card>

                    <Card>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Business Hours</h3>
                      <div className="space-y-1">
                        {days.map(day => {
                          const h = v.businessHours?.[day];
                          const isToday = day === today;
                          return (
                            <div
                              key={day}
                              className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs ${isToday ? 'bg-amber-500/10 border border-amber-500/20' : ''}`}
                            >
                              <span className={`font-medium ${isToday ? 'text-amber-400' : 'text-gray-300'}`}>
                                {isToday && '→ '}{day.slice(0, 3)}
                              </span>
                              {h?.closed
                                ? <span className="text-red-400 font-medium">Closed</span>
                                : <span className="text-gray-300">{h?.open} – {h?.close}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </Section>
                </div>

                <Section title="Send Inquiry" icon={Send} iconColor="text-amber-400">
                  <Card>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {['Your Name', 'Mobile Number', 'Village/City', 'Product Interest'].map(placeholder => (
                        <input
                          key={placeholder}
                          type="text"
                          placeholder={placeholder}
                          className="w-full px-4 py-3 rounded-xl text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                      ))}
                      <textarea
                        className="w-full sm:col-span-2 px-4 py-3 rounded-xl text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-2 focus:ring-amber-500/50 transition-all resize-none h-28"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                        placeholder="Describe your requirement (e.g., quantity, crop type, specific product need)..."
                      />
                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          className="w-full py-3 rounded-xl font-bold text-amber-900 text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                          style={{ background: 'linear-gradient(135deg,#a16207,#facc15)', boxShadow: '0 4px 16px rgba(250,204,21,0.3)' }}
                        >
                          <Send size={15} /> Send Inquiry
                        </button>
                      </div>
                    </div>
                  </Card>
                </Section>
              </div>
            )}

            {/* Gallery Tab */}
            {activeTab === 'gallery' && (
              <Section title="Gallery" icon={Camera} iconColor="text-pink-400">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(v.gallery || []).map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      className="relative overflow-hidden rounded-2xl cursor-pointer group"
                      style={{ aspectRatio: '4/3' }}
                    >
                      <img
                        src={item.url}
                        alt={item.caption}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <p className="text-white text-sm font-medium">{item.caption}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Section>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile Sticky Contact Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-white/10 backdrop-blur-xl" style={{ background: 'rgba(6,13,18,0.96)' }}>
        <div className="flex p-3 gap-2">
          <a
            href={`tel:${v.primaryMobile}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#166534,#4ade80)' }}
          >
            <Phone size={15} /> Call
          </a>
          <a
            href={`https://wa.me/${v.whatsappNumber}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-green-600"
          >
            <MessageCircle size={15} /> WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setInquiryOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-amber-900 cursor-pointer"
            style={{ background: 'linear-gradient(135deg,#a16207,#facc15)' }}
          >
            <Send size={15} /> Inquiry
          </button>
        </div>
      </div>

      {/* Inquiry Modal */}
      <AnimatePresence>
        {inquiryOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
              onClick={() => setInquiryOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-4 right-4 bottom-4 z-50 rounded-2xl p-5 max-w-lg mx-auto"
              style={{ background: '#0d1b2a', border: '1px solid rgba(250,204,21,0.25)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">Send Inquiry to {v.vendorName}</h3>
                <button type="button" onClick={() => setInquiryOpen(false)} className="text-gray-400 hover:text-white p-1 cursor-pointer"><X size={20} /></button>
              </div>
              <div className="space-y-3">
                {['Your Name', 'Mobile Number', 'Product / Requirement'].map(ph => (
                  <input
                    key={ph}
                    type="text"
                    placeholder={ph}
                    className="w-full px-4 py-3 rounded-xl text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-2 focus:ring-amber-500/50"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                ))}
                <textarea
                  rows={3}
                  placeholder="Describe your requirement..."
                  className="w-full px-4 py-3 rounded-xl text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <button
                  type="button"
                  className="w-full py-3 rounded-xl font-bold text-amber-900 flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg,#a16207,#facc15)' }}
                  onClick={() => setInquiryOpen(false)}
                >
                  <Send size={15} /> Send Inquiry
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Share Toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-sm font-bold text-green-300 border border-green-500/30"
            style={{ background: 'rgba(22,101,52,0.9)', backdropFilter: 'blur(10px)' }}
          >
            ✓ Link copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
