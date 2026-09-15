// Sample Vendor Data — All fields for KrishiAI Vendor Profile & Marketplace
export const sampleVendorData = {
  vendorId: "vendor-001",
  vendorName: "Sharma Seeds & Agro",
  businessName: "Sharma Agricultural Supplies Pvt. Ltd.",
  tagline: "Quality Seeds for Better Harvest",
  profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  coverImage: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4e7?w=1200&h=400&fit=crop",
  location: "Pune, Maharashtra, India",
  isOnline: true,
  profileCompletion: 92,

  // Ratings & Feedback
  rating: 4.7,
  totalReviews: 245,
  positiveReviews: 234,
  responseRate: 98,
  ratingBreakdown: { 5: 60, 4: 25, 3: 10, 2: 3, 1: 2 },

  // Verification & Badges
  isVerified: true,
  isTrusted: true,
  isPremium: true,
  mobileVerified: true,
  emailVerified: true,
  businessVerified: true,
  governmentVerified: true,
  gstVerified: true,
  organicCertified: false,
  seedDealerCertified: true,
  fertilizerDealerCertified: true,
  pesticideDealerCertified: false,
  isTrustedVendor: true,
  isTopRated: true,
  isFastResponder: true,
  isBestSeller: true,

  // Business Details
  businessType: "Distributor & Retailer",
  businessCategory: "Agricultural Supplies",
  yearEstablished: "2012",
  yearsExperience: 12,
  ownerName: "Ramesh Sharma",
  numberOfEmployees: "45–50",
  registrationStatus: "Registered & Verified",
  businessStory: "Founded in 2012 by Ramesh Sharma with a vision to revolutionize agriculture in rural India. What started as a small seed shop in Pune has grown into one of Maharashtra's most trusted agricultural supply chains, serving over 2,500 farmers across 6 districts.",
  mission: "To provide premium quality agricultural products that enhance crop yield and farm profitability for Indian farmers.",
  vision: "To become the most trusted agricultural supplier across Maharashtra, empowering farmers with modern farming solutions.",
  languagesSpoken: ["Hindi", "Marathi", "English"],
  storeTimings: { open: "9:00 AM", close: "6:00 PM" },
  weeklyHolidays: ["Sunday"],
  businessHours: {
    Monday:    { open: "9:00 AM", close: "6:00 PM", closed: false },
    Tuesday:   { open: "9:00 AM", close: "6:00 PM", closed: false },
    Wednesday: { open: "9:00 AM", close: "6:00 PM", closed: false },
    Thursday:  { open: "9:00 AM", close: "6:00 PM", closed: false },
    Friday:    { open: "9:00 AM", close: "6:00 PM", closed: false },
    Saturday:  { open: "9:00 AM", close: "2:00 PM", closed: false },
    Sunday:    { open: null,      close: null,       closed: true  },
  },

  // Contact Information
  primaryMobile: "+91-9876543210",
  secondaryMobile: "+91-9876543211",
  whatsappNumber: "919876543210",
  email: "contact@sharmaseeds.com",
  website: "sharmaseeds.com",
  supportNumber: "+91-1800-123-456",

  // Business Address
  address: {
    streetAddress: "123 Market Street, Ravivar Peth",
    landmark: "Near Central Market, Opp. Railway Station",
    village: "Pune City",
    taluka: "Pune",
    district: "Pune",
    state: "Maharashtra",
    country: "India",
    pincode: "411001",
    mapsUrl: "https://maps.google.com/?q=Pune+Market+Street",
  },

  // Agricultural & Service Info
  productCategories: ["Seeds", "Fertilizers", "Pesticides", "Farm Equipment", "Irrigation", "Organic Products", "Farming Tools", "Nursery Plants"],
  cropCategoriesServed: ["Cotton", "Wheat", "Sugarcane", "Soybean", "Tomato", "Onion", "Rice", "Maize"],
  serviceAreas: ["Pune", "Pimpri-Chinchwad", "Baramati", "Indapur", "Bhor", "Velhe", "Solapur"],
  deliveryCoverage: { km: 150 },
  bulkSupply: true,
  wholesaleAvailable: true,
  retailAvailable: true,
  organicProducts: true,
  seasonalProducts: true,
  farmEquipmentAvailable: true,

  // Key Performance Statistics
  totalProducts: 45,
  productsSold: 15000,
  farmersServed: 2500,
  ordersCompleted: 5600,
  repeatCustomers: 1800,

  // Products Showcase
  products: [
    { id: "p-001", name: "Premium Hybrid Cotton Seeds", category: "Seeds", price: "₹450–₹550", inStock: true, rating: 4.8, isFeatured: true, isBestSeller: true, isNew: false, image: "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=400&h=300&fit=crop", description: "High-yield hybrid cotton seeds with 95% germination rate." },
    { id: "p-002", name: "NPK Fertilizer 20-20-20", category: "Fertilizers", price: "₹250–₹350", inStock: true, rating: 4.6, isFeatured: true, isBestSeller: true, isNew: false, image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop", description: "Balanced NPK fertilizer suitable for all major cash crops." },
    { id: "p-003", name: "Organic Pesticide Spray", category: "Pesticides", price: "₹180–₹250", inStock: true, rating: 4.5, isFeatured: false, isBestSeller: true, isNew: false, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop", description: "100% organic, eco-friendly pest control solution." },
    { id: "p-004", name: "Manual Seed Drill", category: "Farm Equipment", price: "₹2500–₹3500", inStock: true, rating: 4.7, isFeatured: true, isBestSeller: false, isNew: false, image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop", description: "Precision manual seed drill for uniform spacing and sowing." },
    { id: "p-005", name: "Drip Irrigation Kit (1 Acre)", category: "Irrigation", price: "₹5000–₹7500", inStock: true, rating: 4.8, isFeatured: true, isBestSeller: false, isNew: true, image: "https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?w=400&h=300&fit=crop", description: "Water-conserving drip irrigation kit for fruit & vegetable crops." },
    { id: "p-006", name: "Organic Cow Manure (50kg)", category: "Organic Products", price: "₹150–₹200", inStock: true, rating: 4.4, isFeatured: false, isBestSeller: false, isNew: false, image: "https://images.unsplash.com/photo-1560713781-d00bcd98286e?w=400&h=300&fit=crop", description: "Decomposed organic manure for high soil microbial activity." },
    { id: "p-007", name: "Hand Hoe & Weeder Set", category: "Farming Tools", price: "₹80–₹120", inStock: true, rating: 4.3, isFeatured: false, isBestSeller: true, isNew: false, image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=400&h=300&fit=crop", description: "Heavy-duty ergonomic hand tools for field weeding." },
    { id: "p-008", name: "Hybrid Tomato Saplings", category: "Nursery Plants", price: "₹5–₹15", inStock: true, rating: 4.6, isFeatured: true, isBestSeller: true, isNew: true, image: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&h=300&fit=crop", description: "Disease-resistant hybrid tomato seedlings ready for transplanting." }
  ],

  // Customer Reviews
  reviews: [
    { id: "r-1", customerName: "Rajesh Patil", avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=60&h=60&fit=crop", rating: 5, title: "Excellent Quality & Service", content: "Ordered hybrid cotton seeds last season. 95% germination rate, just as promised. Already placed another order!", date: "2024-01-20", isVerifiedPurchase: true, helpful: 45, vendorReply: "Thank you Rajesh! We're thrilled with your results. See you next season!" },
    { id: "r-2", customerName: "Sunita Desai", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop", rating: 5, title: "Fast Delivery & Quality Products", content: "Irrigation equipment delivered in 2 days, in perfect condition. Installation support was also provided. Highly recommended!", date: "2024-01-15", isVerifiedPurchase: true, helpful: 32, vendorReply: "We appreciate your feedback! Quality service is our commitment." },
    { id: "r-3", customerName: "Ganesh Rao", avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=60&h=60&fit=crop", rating: 4, title: "Good Quality, Reasonable Prices", content: "Using their products for 3 seasons. Quality is consistent and prices are reasonable. Would give 5 stars if delivery were slightly faster.", date: "2024-01-10", isVerifiedPurchase: true, helpful: 28, vendorReply: "Thank you for the feedback! Working on improving delivery times." },
    { id: "r-4", customerName: "Meera Singh", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=60&h=60&fit=crop", rating: 5, title: "Trustworthy & Reliable", content: "Vendor is very knowledgeable and answered all my crop rotation questions. Labels and instructions were clear.", date: "2024-01-05", isVerifiedPurchase: true, helpful: 38, vendorReply: "It's our pleasure to help! Call anytime for agricultural advice." },
    { id: "r-5", customerName: "Vikram Kumar", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop", rating: 4, title: "Quality Products", content: "Good range of seeds and fertilizers. Would appreciate more organic options added soon.", date: "2023-12-28", isVerifiedPurchase: true, helpful: 22, vendorReply: "Thanks for the suggestion! Expanding organic range soon." }
  ],

  // Licenses & Certifications
  certificates: [
    { name: "GST Certificate", icon: "🏛️", issueDate: "2023-01-15", expiryDate: "2026-01-15", status: "Valid", isVerified: true },
    { name: "Trade License", icon: "📋", issueDate: "2022-06-10", expiryDate: "2027-06-10", status: "Valid", isVerified: true },
    { name: "Seed Dealer License", icon: "🌱", issueDate: "2023-03-20", expiryDate: "2025-03-20", status: "Valid", isVerified: true },
    { name: "Fertilizer License", icon: "🧪", issueDate: "2023-05-10", expiryDate: "2026-05-10", status: "Valid", isVerified: true },
    { name: "FSSAI Certificate", icon: "🛡️", issueDate: "2022-11-01", expiryDate: "2025-11-01", status: "Valid", isVerified: true },
    { name: "Pesticide License", icon: "🔬", issueDate: "2023-08-12", expiryDate: "2026-08-12", status: "Valid", isVerified: true }
  ],

  // Logistics & Delivery
  delivery: {
    homeDelivery: true,
    pickupAvailable: true,
    cashOnDelivery: true,
    estimatedTime: "2–4 Business Days",
    freeDeliveryAbove: 2000,
    charges: "₹50–₹150 based on location",
    supportedPincodes: ["411001","411002","411003","411004","413105"]
  },

  // Supported Payment Methods
  paymentMethods: ["Cash", "UPI", "Credit Card", "Debit Card", "Net Banking", "Cash on Delivery"],

  // Store Policies
  policies: {
    return: "7-day return policy on unopened products in original condition.",
    refund: "Refunds credited within 3-5 working days upon inspection.",
    replacement: "Instant free replacement for damaged or wrong products.",
    cancellation: "Orders can be cancelled prior to dispatch.",
    warranty: "Manufacturer warranty applies on equipment & machinery."
  },

  // Store & Farm Gallery
  gallery: [
    { type: "image", url: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4e7?w=600&h=400&fit=crop", caption: "Our Main Store Front in Pune" },
    { type: "image", url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop", caption: "Wheat Fields We Serve" },
    { type: "image", url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop", caption: "Seeds & Fertilizer Storage Warehouse" },
    { type: "image", url: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&h=400&fit=crop", caption: "Organic Product Demo" },
    { type: "image", url: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop", caption: "Farm Machinery Testing" },
    { type: "image", url: "https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?w=600&h=400&fit=crop", caption: "Drip Irrigation Setup Demo" }
  ]
};

export default sampleVendorData;
