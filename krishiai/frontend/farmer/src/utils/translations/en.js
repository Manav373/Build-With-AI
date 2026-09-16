export const en = {
  header: {
    online: 'Online & Ready',
    pinned: 'Pinned Messages',
    respondingIn: 'Responding in',
    switchToEnglish: 'Switch to English',
  },
  navbar: {
    features: 'Features',
    community: 'Community',
    howItWorks: 'How It Works',
    testimonials: 'Testimonials',
    about: 'About',
    login: 'Login',
    tryFree: 'Try For Free',
    dashboard: 'Go to Dashboard',
  },
  hero: {
    introducing: 'Introducing KrishiAI 2.0',
    titleMain: 'Farm Smarter With',
    titleAccent: 'AI on WhatsApp',
    subtitle: 'Instantly access real-time market prices, hyper-local weather alerts, and expert crop disease diagnosis globally. Talk to KrishiAI from ANYWHERE.',
    btnChat: 'Start Chatting Now',
    btnExplore: 'Explore Features',
  },
  heroMessages: [
    { type: 'user', content: "What is the MSP of Wheat today?" },
    { type: 'bot', content: "Namaste! 🙏 Today the MSP for wheat is ₹2,275 per quintal. The local Mandi rate in your area is trending slightly higher at ₹2,350. Should I find buyers?" }
  ],
  features: {
    titleMain: 'Powerful Tools for',
    titleAccent: 'Every Farmer',
    subtitle: 'From soil to market, KrishiAI provides the intelligence you need to succeed in modern agriculture.',
    liveWeather: {
      title: 'Live Weather',
      desc: "Get hyper-local, real-time weather forecasts and alerts based on your farm's exact GPS location.",
      messages: [
        { type: 'user', content: "What's the weather like for my farm today?" },
        { type: 'bot', content: "📍 Based on your GPS, expect heavy rain starting at 4 PM. I recommend delaying any pesticide spraying today until tomorrow morning." }
      ]
    },
    diseaseDetection: {
      title: 'Disease Detection',
      desc: 'Upload a photo of your infected crop and let AI analyze the disease and prescribe remedies.',
      messages: [
        { type: 'user', content: "📷 [Attached Image] Why are my tomato leaves turning yellow with brown spots?" },
        { type: 'bot', content: "Analysis complete. That looks like Early Blight. Apply a copper-based fungicide immediately to prevent further spread and prune infected bottom leaves." }
      ]
    },
    cropAdvisory: {
      title: 'Crop Advisory',
      desc: 'Ask specifically about sowing, soil health, irrigation schedules, and best harvest timings.',
      messages: [
        { type: 'user', content: "Is it the right time to sow wheat in Punjab?" },
        { type: 'bot', content: "Yes! Mid-November is ideal for wheat sowing in Punjab. Ensure soil moisture is adequate. DBW 187 is a highly recommended high-yield variety for this season." }
      ]
    },
    marketPrices: {
      title: 'Market Prices',
      desc: 'Access daily official MSP prices and estimated local mandi rates before selling your produce.',
      messages: [
        { type: 'user', content: "What is the Mandi rate for Cotton in Gujarat?" },
        { type: 'bot', content: "Today's average Mandi rate for Cotton in Gujarat is ₹6,800 - ₹7,200 per quintal. The trend is slightly upward. Should I alert you if it crosses ₹7,500?" }
      ]
    },
    govtSchemes: {
      title: 'Govt Schemes',
      desc: 'Explore support programs and subsidies tailored for your farm.',
      searchPlaceholder: 'Search schemes...',
      allCategories: 'All Categories',
      applyAI: 'Check Eligibility via AI',
      officialPortal: 'Official Portal',
      mainBenefit: 'Main Benefit',
      trackDeadlines: 'Track Deadlines',
      upgradePro: 'Upgrade to Pro Advisor',
      messages: [
        { type: 'user', content: "How do I claim crop insurance under PMFBY?" },
        { type: 'bot', content: "To claim PMFBY, you must report the crop loss within 72 hours via the Crop Insurance App or toll-free number. I can help you find your local agriculture officer's contact." }
      ]
    },
    satellite: {
      title: 'Satellite Health',
      desc: 'Real-time NDVI vegetation monitoring and farm health alerts directly from orbital data.',
      messages: [
        { type: 'user', content: "Show me the health of my farm from satellite." },
        { type: 'bot', content: "🛰️ Accessing NASA MODIS data... Your farm's NDVI is 0.72 (Healthy). Vegetation is dense. I've detected a small dry patch on the north-east corner. View high-res map?" }
      ]
    },
    mandiMap: {
      title: 'Market Discovery',
      desc: 'Discover live market prices and farmer activity on a interactive spatial heatmap.',
      messages: [
        { type: 'user', content: "Where are the best onion prices nearby?" },
        { type: 'bot', content: "🗺️ Searching local Mandis... Lasalgaon APMC is reporting ₹2,400/qtl (Top Grade). It's 15km from you. 12 farmers recently shared location there. Navigate?" }
      ]
    },
    multilingual: {
      title: 'Multilingual Whatsapp',
      desc: 'Communicate securely on WhatsApp in English, Hindi, Punjabi, Marathi, and Tamil.',
      messages: [
        { type: 'user', content: "नमस्ते! मुझे अपनी मिट्टी का परीक्षण कैसे करवाना चाहिए?" },
        { type: 'bot', content: "नमस्ते! आप अपने नज़दीकी कृषि विज्ञान केंद्र (KVK) में मिट्टी का नमूना दे सकते हैं। मैं आपको सबसे नज़दीकी KVK का पता भेज रहा हूँ।" }
      ]
    },
    vendorMarketplace: {
      title: 'Agri Marketplace & Crop Sales',
      desc: 'Connect directly with certified seed, fertilizer & machinery suppliers or sell your harvest directly to verified buyers.',
      messages: [
        { type: 'user', content: "Where can I buy organic bio-fertilizers nearby or sell my wheat harvest?" },
        { type: 'bot', content: "🏪 Verified Agri Marketplace! 4 local vendors nearby sell organic NPK. Plus 3 verified grain buyers posted wheat requirement @ ₹2,350/qtl. Click to connect!" }
      ]
    },
    voiceAssistant: {
      title: 'AI Voice Assistant',
      desc: 'Hands-free, real-time voice guidance in your regional language. Just talk and listen.',
      messages: [
        { type: 'user', content: "🎙️ [Voice Call] Namaste KrishiAI, my paddy crop has brown spots, what should I do?" },
        { type: 'bot', content: "🎙️ [Voice Response] Namaste Kisan Ji! Brown spots on paddy usually indicate Brown Spot fungus. Spray Hexaconazole 5% EC @ 2ml per liter of water." }
      ]
    },
    community: {
      title: 'Farmer Community Network',
      desc: 'Join discussions with 10,000+ farmers across India. Share insights and solve farming issues together.',
      messages: [
        { type: 'user', content: "Has anyone tried zero-tillage wheat sowing in Punjab this year?" },
        { type: 'bot', content: "💬 14 farmers in Ludhiana & Sangrur shared updates! Overall 12% savings on diesel and better germination reported. Join the discussion thread!" }
      ]
    },
    recommend: {
      title: 'Soil & Crop Recommendation',
      desc: 'AI N-P-K recommendation engine matching soil chemistry and weather to peak-yield crops.',
      messages: [
        { type: 'user', content: "My soil pH is 6.8 with high Nitrogen. Which crop will give maximum profit?" },
        { type: 'bot', content: "🌱 Soil Analysis Match: Maize or Cotton is optimal for your soil N-P-K profile with expected yield of 4.5 tons/ha. View full fertilizer schedule?" }
      ]
    }
  },
  chatSelection: {
    title: 'Choose Your Path',
    subtitle: 'Select how you want to interact with KrishiAI',
    whatsappTitle: 'WhatsApp AI',
    whatsappDesc: 'Chat instantly using your favorite messaging app',
    whatsappTag: 'Recommended',
    webAppTitle: 'Web App',
    webAppDesc: 'Access advanced features and dashboard tracking',
    webAppTag: 'Advanced',
  },
  mission: {
    badge: 'Our Core Vision',
    title: 'Empowering Rural Roots,',
    accent: 'Quantifying Agricultural Success',
    desc: "KrishiAI isn't just a chatbot; it's a bridge between centuries of traditional farming wisdom and the cutting-edge power of Artificial Intelligence. We aim to bring high-tech solutions to the most remote corners of rural India.",
    card1Title: 'Tradition Meets Tech',
    card1Desc: 'Validating age-old agricultural practices with real-time data and scientific precision.',
    card2Title: 'Inclusive Design',
    card2Desc: 'Built for every farmer, regardless of technical literacy, through intuitive voice and WhatsApp interaction.',
    card3Title: 'Rural Impact',
    card3Desc: 'Reducing the gap between city markets and village fields with transparency and fair pricing.',
  },
  howItWorks: {
    badge: 'Get Started',
    title: 'Easy As',
    subtitle: 'No app downloads, no complex interfaces. KrishiAI lives where you already talk to family and friends.',
    step1Title: 'Scan this QR',
    step1Desc: 'Scan the QR code using your phone camera to start a chat with KrishiAI instantly.',
    step1Badge: 'Instant Access',
    step2Title: 'Ask Your Question',
    step2Desc: 'Send a text or voice note in your native language, or snap a photo of your fields.',
    step2Badge: 'Multilingual AI',
    step3Title: 'Get AI Solutions',
    step3Desc: 'Receive precise, real-time alerts and actionable remedies verified by top agronomy databases.',
    step3Badge: 'Expert Verified',
  },
  stats: {
    villages: 'Villages Reached',
    methods: 'Methods Validated',
    dialects: 'Regional Dialects',
    access: 'Inclusive Access',
  },
  impact: {
    badge: 'Village Impact Report',
    titleMain: 'Empowering the',
    titleAccent: 'Backbone',
    titleEnd: 'of India',
    subtitle: 'KrishiAI is specifically designed to work for traditional farmers in the most remote villages, requiring zero technical knowledge.',
    card1Tag: 'Reach',
    card1Title: '100+ Villages',
    card1Desc: 'Active digital transformation in remote rural clusters across 12+ states.',
    card2Tag: 'Tradition',
    card2Title: 'Traditional Care',
    card2Desc: 'AI-backed validation for organic methods and companion planting wisdom.',
    card3Tag: 'Fairness',
    card3Title: 'No Middlemen',
    card3Desc: 'Direct market insights helping villagers secure 15% better prices locally.',
    card4Tag: 'Inclusion',
    card4Title: 'Native Voice',
    card4Desc: 'Breaking the literacy barrier with AI that understands 15+ regional dialects.',
    testimonial: '"I don\'t know how to use apps or computers. But I know how to talk on WhatsApp. KrishiAI told me how to treat my paddy crop using local neem oil instead of expensive chemicals. It saved my whole season."',
    author: 'Sohan Lal',
    authorRole: 'Traditional Farmer • Rural Haryana',
  },
  testimonials: {
    titleMain: 'Loved by',
    titleAccent: 'Farmers',
  },
  faq: {
    badge: 'Knowledge Center',
    titleMain: 'Frequently Asked',
    titleAccent: 'Questions',
    subtitle: 'Everything you need to know about the KrishiAI platform and our village-first mission.',
    mailTitle: 'Still curious about technical details?',
    mailBtn: 'Message Support',
  },
  cta: {
    title: 'Start Farming Smarter',
    accent: 'Today — For Free',
    subtitle: 'No app downloads. No sign-ups. Just open WhatsApp and chat with India\'s smartest farming AI.',
    btnLaunch: 'Launch KrishiAI Chat',
    btnWhatsApp: 'Open in WhatsApp',
    encryption: 'End-to-End Encrypted',
    ready: 'WhatsApp Ready',
    multiLang: '15+ Languages',
    perks: ['✅ 100% Free', '✅ No App Needed', '✅ Any Phone', '✅ 15+ Languages'],
  },
  footer: {
    ready: 'Ready to',
    transform: 'Transform',
    yourFarm: 'your farm?',
    subtitle: 'Join thousands of farmers making smarter decisions every day. No app download required, just pure AI power on WhatsApp.',
    btnTry: 'Try KrishiAI for Free',
    product: 'Product',
    company: 'Company',
    support: 'Support',
    legal: 'Legal',
    allRights: 'All rights reserved.',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    madeWith: 'Made with ❤️ for Farmers of India',
    badges: {
      free: '✅ 100% Free Forever',
      eco: '🌱 Eco-Responsible AI',
      india: '🇮🇳 Made in India',
      privacy: '🔒 Privacy First',
    }
  },
  chat: {
    welcome: 'Namaste! Please select your preferred language to continue:',
    newConversation: 'New Conversation',
    connectionError: '⚠️ Connection error. Please check your internet and try again.',
    initialMsg: 'Namaste! 🌾 I am **KrishiAI**, your personal agricultural advisor.\n\nYou can ask me about:\n- 🌤 **Weather** — share your location for forecasts\n- 🌱 **Crop advice & sowing calendar** — timing, irrigation, harvest\n- 💰 **Market prices** — real-time MSP & mandi rates\n- 🐛 **Pest alerts** — seasonal threats & treatments\n- 🌿 **Soil health** — amendments & deficiency detection\n- 📊 **Yield estimator** — expected harvest for your field\n- 💧 **Irrigation calculator** — water needs by crop stage\n- 🔬 **Disease detection** — upload a crop photo\n- 📜 **Government schemes** — PM-KISAN, PMFBY & more\n\nHow can I help your farm today?',
    quickActions: {
      weather: 'Weather',
      msp: 'MSP Price',
      pest: 'Pest Alert',
      soil: 'Soil Health',
      yield: 'Yield Estimate',
      irrigation: 'Irrigation',
      schemes: 'Schemes',
      disease: 'Disease',
    },
    sidebar: {
        iot: 'IoT Smart Irrigation',
      newChat: 'New Chat',
      menu: 'Menu',
      home: 'Home',
      dashboard: 'Dashboard',
      mandiMap: 'Mandi Map',
      marketPrices: 'Market Prices',
      schemes: 'Schemes',
      analytics: 'Analytics',
      recentChats: 'Recent Chats',
      callHistory: 'Call History',
      voiceAssistant: 'Voice Assistant',
      noHistory: 'No history yet',
      today: 'Today',
      yesterday: 'Yesterday',
      older: 'Older',
      preferences: 'Preferences',
      help: 'Help & Support',
      settings: 'Settings',
      farmerProfile: 'Farmer Profile',
      proMember: 'Pro Member',
      community: 'Community',
    },
    dashboard: {
      analytics: {
        title: 'National Farmer Intelligence',
        subtitle: 'Real-time data synchronization with India\'s agricultural network',
        totalFarmers: 'Active Platform Farmers',
        webUsers: 'Web Users',
        whatsappUsers: 'WhatsApp Bot Users',
        dailyActive: 'Daily Active (24h)',
        locationCount: 'Synced Locations',
        villagesReached: 'High-Activity States',
        methodsValidated: 'Methods Validated',
        charts: {
          registrationsTrend: 'Active Engagement Trend',
          webVsWhatsapp: 'Platform Distribution',
          topQueries: 'Most Asked Farming Problems',
          liveMap: 'Live Farmer Distribution',
          noDataYet: 'Gathering Intelligence...',
          farmers: 'Farmers',
          showMandis: 'Show mandis',
          webLegend: 'Web Application',
          whatsappLegend: 'WhatsApp / SMS',
          mapInstruction: 'Click markers for tactical data',
          visitors: 'Daily Activity',
        }
      },
      community: {
        title: "Farmer Community",
        subtitle: "Real-time discussion with farmers across India",
        placeholder: "Share your experience or ask a question...",
        live: "Live Now",
        onlineCount: " farmers online"
      }
    },
    prompts: {
      explainScheme: (name) => `Please explain the "${name}" government scheme in full detail. Include eligibility, benefits, and how to apply.`,
      analyzePredict: (crop, temp, rain, ndvi, yieldVal, conf, risk, rec) => `I just ran a Yield Prediction for ${crop}. \nParameters: Temp ${temp}°C, Rain ${rain}mm, NDVI ${ndvi}. \nResult: ${yieldVal} tons/ha (${conf}% confidence, ${risk} risk). \nRecommended Next: ${rec}. \n\nPlease analyze this and give me advice.`,
      analyzeRecommend: (crop, yieldVal, conf) => `You recommended ${crop} with an expected yield of ${yieldVal} tons/ha and ${conf}% suitablity. Why is this the best choice for my soil? Compare it with other options.`,
    },
    intelligence: {
      title: 'Crop Intelligence',
      predict: {
        title: 'Yield Predictor',
        subtitle: 'AI-powered harvest forecasting based on your field conditions.',
        formTitle: 'Field Parameters',
        btnPredict: 'Predict Yield',
        analyzing: 'Analyzing with AI...',
        resultTitle: 'Prediction Result',
        predictedYield: 'Predicted Yield',
        tonsPerHectare: 'tons / hectare',
        confidence: 'Confidence',
        riskLevel: 'Risk Level',
        recommendedCrop: 'Recommended Crop',
        inputSummary: 'Input Summary',
        tipsTitle: 'Tips for Better Predictions',
      },
      recommend: {
        title: 'Crop Advisor',
        subtitle: 'Find the most profitable and suitable crop for your soil.',
        btnRecommend: 'Get Recommendations',
        bestFit: 'Best Fit for Your Soil',
        suitability: 'Suitability',
        expectedYield: 'Expected Yield',
      },
      satellite: {
        title: 'Satellite Health',
        subtitle: 'Live NDVI vegetation monitoring for your farm coordinates.',
        healthIndex: 'Health Index (NDVI)',
        vegetationStatus: 'Vegetation Status',
      },
      fields: {
        cropName: 'Crop Name',
        temperature: 'Temperature (°C)',
        rainfall: 'Rainfall (mm)',
        humidity: 'Humidity (%)',
        soilPH: 'Soil pH',
        nitrogen: 'Nitrogen (N) kg/ha',
        phosphorus: 'Phosphorus (P) kg/ha',
        potassium: 'Potassium (K) kg/ha',
        ndvi: 'NDVI Index',
      }
    },
    dashboard: {
      analytics: {
        pageTitle: 'Farmer Intelligence Dashboard',
        liveSubtitle: 'Real-time agricultural activity · India 🇮🇳',
        updatedPrefix: 'Updated',
        backendOnline: 'Backend Online',
        backendOffline: 'Backend Offline',
        refresh: 'Refresh',
        backendNotReachable: 'Backend not reachable',
        backendOfflineTip: 'Start the backend with `uvicorn app.main:app --reload` to see real data.',
        kpis: {
          totalVisitors: 'Total Visitors',
          webUsers: 'Website Users',
          whatsappUsers: 'WhatsApp Farmers',
          activeToday: 'Active Today',
          locationShared: 'Location Shared',
          nearbyMandis: 'Linked Markets',
          totalVisitorsDesc: 'All website & WhatsApp interactions',
          webUsersDesc: 'Tracked via browser sessions',
          whatsappUsersDesc: 'Via WhatsApp bot',
          activeTodayDesc: 'Sessions started today',
          locationSharedDesc: 'Farmers who allowed GPS',
          nearbyMandisDesc: 'Verified Mandi locations'
        },
        charts: {
          farmersByState: 'Farmers by State',
          noDataYet: 'no data yet',
          loadingLive: 'Fetching live data…',
          dailyVisits: 'Daily Visits (Last 7 Days)',
          visitors: 'Visitors',
          webVsWhatsapp: 'Web vs WhatsApp',
          mostAsked: 'Most Asked Farming Problems',
          liveMap: 'Live Farmer Activity Map',
          viewFullHeatmap: 'View Full Heatmap →',
          farmers: 'farmers',
          webLegend: 'Web Users',
          whatsappLegend: 'WhatsApp Users',
          mapInstruction: 'Click a dot to see location details'
        }
      },
      heatmap: {
        pageTitle: 'Farmer Activity Heatmap',
        demoData: '⚠️ Demo data — backend offline',
        waitingForFarmers: 'Waiting for farmers to share location…',
        totalLocations: (count) => `${count} farmer locations across India`,
        legend: 'Legend',
        webUsers: 'Web Users',
        whatsappUsers: 'WhatsApp Users',
        loadingMap: 'Loading farmer activity map…',
        noLocationsYet: 'No locations yet — waiting for farmers to share their GPS',
        locationInstruction: 'Locations appear when farmers click "Allow Location" on the app or share via WhatsApp'
      },
      callHistory: {
        pageTitle: 'AI Voice Call History',
        subtitle: 'Transcript and summaries of voice interactions with farmers.',
        noCalls: 'No voice calls recorded yet.',
        noCallsDesc: 'Farmers who call your AI assistant will appear here automatically.',
        searchPlaceholder: 'Search phone or summary...',
        errorLoading: 'Error Loading Data',
        tryAgain: 'Try Again',
        callId: 'Call ID',
        phone: 'Phone Number',
        duration: 'Duration',
        time: 'Time',
        summary: 'Summary',
        summaryUnavailable: 'Summary unavailable.',
        transcript: 'Full Transcript',
        viewTranscript: 'View Transcript',
        sec: 'sec',
        min: 'min',
        unknown: 'Unknown',
        close: 'Close',
        transcriptSoon: 'Transcript text is coming soon...'
      }
    }
  },
  testimonialData: [
    {
      name: "Ramesh Kumar", loc: "Punjab",
      rev: "KrishiAI accurately predicted rain right before my harvest. It saved me lakhs of rupees. The WhatsApp interface is so easy for me.",
    },
    {
      name: "Sunita Devi", loc: "Maharashtra",
      rev: "I take photos of my tomatoes and within 2 seconds it tells me what fertilizer to use. Also helped me get PM-KISAN funds.",
    },
    {
      name: "Mahesh Patel", loc: "Gujarat",
      rev: "Checking mandi rates every morning has become a habit. Now I negotiate better with local buyers thanks to the KrishiAI bot.",
    }
  ],
  faqData: [
    {
      question: "How does the AI detect crop diseases?",
      answer: "You simply take a photo of the infected crop part and send it to our WhatsApp number. Our trained computer vision models analyze the visual symptoms (like spots, wilting, or discoloration) and provide a diagnosis along with treatment recommendations."
    },
    {
      question: "Do I need a smartphone or high-speed internet?",
      answer: "KrishiAI is designed to be accessible. While our visual diagnosis needs an image upload, most of our market and weather services work perfectly on basic WhatsApp connections, ensuring even farmers in remote villages stay informed."
    },
    {
      question: "In which languages is KrishiAI available?",
      answer: "We support over 15+ languages including English, Hindi, Punjabi, Marathi, Telugu, Tamil, Bengali, and more. The AI automatically detects your language preference during the first interaction."
    },
    {
      question: "Is KrishiAI really free for farmers?",
      answer: "Yes! Our core health and price services are 100% free for individual farmers. We believe access to agricultural wisdom is a fundamental right, not a luxury."
    },
    {
      question: "Is my farm data secure?",
      answer: "Absolutely. We follow strict data privacy protocols. Your farm location and personal details are only used to provide hyper-local services like weather and mandi rates and are never shared with third parties without your consent."
    }
  ],
  privacy: {
    title: 'Privacy Policy',
    accent: 'Policy',
    legal: 'Legal',
    subtitle: 'We respect your privacy. This policy explains what data we collect, why we collect it, and how we protect it.',
    lastUpdated: 'Last Updated: March 2026',
    backHome: 'Back to Home',
    summary: [
      { id: 1, icon: '🔒', title: 'No Data Selling', desc: 'We never sell your personal data to advertisers or third parties.' },
      { id: 2, icon: '🆓', title: 'Free Service', desc: 'KrishiAI is completely free. No payment data is ever collected.' },
      { id: 3, icon: '🇮🇳', title: 'India-First', desc: 'Governed by Indian law and designed for Indian farmers.' },
    ],
    toc: 'Table of Contents',
    footerNote: 'Your privacy matters to us. KrishiAI is built by farmers, for farmers — we guard your data as carefully as you guard your harvest.',
    termsLink: 'Terms & Conditions',
    sections: [
      {
        id: 'information-collected',
        title: '1. Information We Collect',
        content: `KrishiAI collects minimal information necessary to provide you with a high-quality agricultural assistance experience:\n\n• Chat Messages & Queries: The questions and messages you send to KrishiAI are processed to generate responses. These may include crop-related questions, farm data, and agricultural queries.\n\n• Images & Media: Photos of crops, diseases, or soil that you upload for analysis.\n\n• Location Data: If you voluntarily share your location, we use it to provide local weather forecasts and nearby mandi prices. Location is never tracked without your explicit consent.\n\n• Usage Data: Anonymous data about how you interact with the Service (page views, feature usage) to improve user experience.\n\n• Device Information: Basic browser/device type for optimizing the interface.\n\nWe do NOT collect Aadhaar numbers, PAN cards, bank details, or other sensitive financial or government identification.`,
      },
      {
        id: 'how-we-use',
        title: '2. How We Use Your Information',
        content: `Information collected is used exclusively to:\n\n• Generate accurate, contextual agricultural advice and responses\n• Provide localized market prices, weather, and farming recommendations\n• Improve the accuracy and capabilities of our AI models (using anonymized, aggregated data)\n• Respond to support requests and user feedback\n• Detect and prevent misuse of the Service\n• Send important Service updates (only if you opt in)\n\nWe do NOT use your data for:\n• Targeted advertising\n• Selling to third-party marketing companies\n• Building personal profiles for non-agricultural purposes\n• Political or commercial profiling`,
      },
      {
        id: 'data-sharing',
        title: '3. Data Sharing & Third Parties',
        content: `KrishiAI does not sell your personal information to third parties. We may share data only in the following limited circumstances:\n\n• AI Processing Partners: We use trusted AI infrastructure providers (such as Google AI / Gemini) to process your queries. These partners are contractually obligated to protect your data.\n\n• Weather & Market Data Providers: Location data may be shared with weather APIs to fetch local forecasts. This is anonymous and not linked to your identity.\n\n• Legal Compliance: If required by Indian law, court order, or government regulation, we may disclose information to appropriate authorities.\n\n• Business Transfers: In the event of a merger or acquisition, user data may be transferred. You will be notified of any such change.\n\nAll third parties we work with are required to follow strict data protection standards.`,
      },
      {
        id: 'data-retention',
        title: '4. Data Retention',
        content: `We retain your data for the following periods:\n\n• Chat Histories: Stored locally in your browser (localStorage). We do not permanently store individual chat conversations on our servers unless required for AI improvement.\n\n• Uploaded Images: Processed in real-time for disease/soil analysis and not stored permanently after processing.\n\n• Anonymous Analytics: Retained for up to 12 months for service improvement.\n\nYou can clear your local chat history at any time using the "Clear Chat" button in the application dashboard. This permanently removes your conversation data from your device.`,
      },
      {
        id: 'cookies',
        title: '5. Cookies & Local Storage',
        content: `KrishiAI uses browser localStorage (not traditional cookies) to:\n\n• Save your chat history between sessions for convenience\n• Remember your language preference (English, Hindi, Gujarati, Marathi)\n• Store pinned messages you have bookmarked\n\nWe use minimal analytics cookies to understand how users interact with the landing page. These are anonymous and do not personally identify you.\n\nYou can clear localStorage at any time through your browser settings. This will reset your chat history and preferences.`,
      },
      {
        id: 'security',
        title: '6. Data Security',
        content: `We implement industry-standard security measures to protect your information:\n\n• HTTPS encryption for all data transmitted between your device and our servers\n• Secure API communication with AI processing partners\n• Regular security audits and vulnerability assessments\n• No storage of sensitive personal or financial information\n\nHowever, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security. We encourage you to avoid sharing highly sensitive personal information through the chat interface.`,
      },
      {
        id: 'your-rights',
        title: '7. Your Rights',
        content: `As a user of KrishiAI, you have the following rights:\n\n• Right to Access: Request a copy of personal data we hold about you.\n• Right to Deletion: Request deletion of your personal data from our systems.\n• Right to Correction: Request correction of inaccurate personal information.\n• Right to Data Portability: Request your data in a machine-readable format.\n• Right to Withdraw Consent: Withdraw consent for data processing at any time.\n• Right to Object: Object to processing of your data for certain purposes.\n\nTo exercise any of these rights, please contact us at privacy@krishiai.com. We will respond within 30 days in accordance with applicable Indian data protection law.`,
      },
      {
        id: 'children',
        title: '8. Children\'s Privacy',
        content: `KrishiAI's Service is intended for use by adults (18 years and above) and farmers. We do not knowingly collect personal information from children under 13 years of age.\n\nIf you believe we have inadvertently collected information from a minor, please contact us immediately at support@krishiai.com and we will take prompt action to delete such information.`,
      },
      {
        id: 'changes',
        title: '9. Changes to This Policy',
        content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.\n\nWhen we make changes, we will:\n• Update the "Last Updated" date at the top of this page\n• Post a notice on the KrishiAI homepage for significant changes\n• Notify WhatsApp users through the Service for material changes\n\nYour continued use of KrishiAI after changes are posted constitutes your acceptance of the updated Privacy Policy.`,
      },
      {
        id: 'contact-privacy',
        title: '10. Contact Us',
        content: `For privacy-related questions, requests, or concerns, please contact our Data Protection point of contact:\n\n📧 Privacy Email: privacy@krishiai.com\n📧 General Support: support@krishiai.com\n🌐 Website: krishiai.com\n📍 Jurisdiction: India\n\nWe are committed to resolving privacy concerns quickly and transparently. If you are unsatisfied with our response, you may also file a complaint with India's relevant data protection authority.`,
      },
    ]
  },
  terms: {
    title: 'Terms & Conditions',
    accent: 'Conditions',
    legal: 'Legal',
    subtitle: 'Please read these terms carefully before using KrishiAI. By using our free agricultural AI service, you agree to these terms.',
    lastUpdated: 'Last Updated: March 2026',
    backHome: 'Back to Home',
    toc: 'Table of Contents',
    footerNote: "KrishiAI is a free service built with love for India's farming community. These terms exist to protect both you and us.",
    privacyLink: 'Privacy Policy',
    freeAccess: {
      title: 'Free Access',
      content: 'KrishiAI is a 100% free tool for farmers. We do not charge subscription fees or collect payment data.'
    },
    informationalOnly: {
      title: 'Informational Only',
      content: 'AI advice should be cross-verified. We are not liable for farming outcomes based on AI analysis.'
    },
    sections: [
      {
        id: 'acceptance',
        title: '1. Acceptance of Terms',
        content: `By accessing or using the KrishiAI platform ("Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree with any part of these Terms, you must not access or use our Service.\n\nKrishiAI is a free, AI-powered agricultural assistant designed to help farmers in India and beyond make informed farming decisions. The Service is provided "as is" and is intended for informational purposes only.\n\nThese Terms apply to all users of the Service, including but not limited to website visitors, WhatsApp users, and API consumers.`,
      },
      {
        id: 'description',
        title: '2. Description of Service',
        content: `KrishiAI provides an intelligent agricultural assistance platform accessible via web browser and WhatsApp. Our Service includes:\n\n• Real-time market price information (MSP & mandi rates)\n• Crop disease identification via image analysis\n• Hyper-local weather forecasts and agricultural alerts\n• Crop advisory, sowing calendars, and irrigation guidance\n• Government scheme eligibility information (PM-KISAN, PMFBY, etc.)\n• Soil health recommendations and pest management alerts\n• Yield estimation tools\n\nKrishiAI is a FREE service. There is no charge to access or use the platform. We do not collect payment information from our users.`,
      },
      {
        id: 'user-responsibilities',
        title: '3. User Responsibilities',
        content: `By using KrishiAI, you agree to:\n\n• Provide accurate information when interacting with the AI assistant\n• Use the Service only for lawful agricultural and farming-related purposes\n• Not attempt to reverse-engineer, copy, or redistribute the AI models or underlying technology\n• Not use the Service to spread misinformation or harmful content\n• Take personal responsibility for any farming decisions you make based on AI-generated advice\n• Comply with all applicable local, state, national, and international laws and regulations\n\nYou are solely responsible for evaluating the appropriateness of any information provided by KrishiAI for your specific agricultural situation. Always consult with certified agronomists or government agricultural officers for critical decisions.`,
      },
      {
        id: 'prohibited-uses',
        title: '4. Prohibited Uses',
        content: `You may not use the KrishiAI Service for:\n\n• Any unlawful purpose or in violation of any applicable regulations\n• Transmitting harmful, abusive, threatening, or harassing content\n• Impersonating any person, organization, or agricultural institution\n• Uploading malware, viruses, or any other malicious code\n• Attempting to gain unauthorized access to our systems or servers\n• Collecting personal data of other users without their consent\n• Commercial resale or redistribution of our AI outputs without written permission\n• Circumventing any security features or access controls of the Service\n• Generating content that promotes illegal pesticide use or harmful agricultural practices\n\nViolation of these prohibited uses may result in immediate termination of your access to the Service.`,
      },
      {
        id: 'intellectual-property',
        title: '5. Intellectual Property',
        content: `All intellectual property rights in the KrishiAI Service, including but not limited to the software, AI models, interface designs, logos, brand identity, and content generated by KrishiAI, are owned by or licensed to KrishiAI.\n\nYou are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Service for personal, non-commercial agricultural purposes.\n\nYou retain ownership of any content (such as crop images or farm data) that you submit to the Service. By submitting such content, you grant KrishiAI a non-exclusive, royalty-free license to use, process, and analyze this content solely for the purpose of providing the Service to you.\n\nThe KrishiAI name, logo, and associated marks are trademarks of KrishiAI. You may not use these marks without our prior written permission.`,
      },
      {
        id: 'disclaimer',
        title: '6. Disclaimer of Warranties',
        content: `THE KRISHIAI SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.\n\nTO THE FULLEST EXTENT PERMITTED BY LAW, KRISHIAI DISCLAIMS ALL WARRANTIES, INCLUDING:\n\n• WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE\n• WARRANTIES THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE\n• WARRANTIES REGARDING THE ACCURACY, RELIABILITY, OR COMPLETENESS OF ANY INFORMATION PROVIDED\n\nAgricultural advice generated by KrishiAI is based on AI analysis and publicly available data. It is NOT a substitute for professional agronomist advice, government agricultural extension services, or certified farming experts.\n\nWeather forecasts, market prices, and disease identification results may vary. Always cross-verify critical information with local agricultural authorities or Krishi Vigyan Kendras (KVKs).`,
      },
      {
        id: 'limitation',
        title: '7. Limitation of Liability',
        content: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, KRISHIAI AND ITS CREATORS, DEVELOPERS, AND CONTRIBUTORS SHALL NOT BE LIABLE FOR:\n\n• Any direct, indirect, incidental, special, or consequential damages\n• Crop loss, yield reduction, or financial loss resulting from following AI-generated advice\n• Data loss or unauthorized access to your submitted information\n• Interruptions to the Service or technical failures\n\nSince KrishiAI is a FREE service offered in good faith to support the farming community, our total liability to you for any claims arising from the use of the Service shall not exceed ₹0 (zero rupees).\n\nThis limitation of liability applies even if KrishiAI has been advised of the possibility of such damages.`,
      },
      {
        id: 'privacy',
        title: '8. Privacy & Data',
        content: `Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.\n\nBy using KrishiAI, you consent to:\n\n• Processing of your queries and uploaded images by our AI systems\n• Storage of conversation history for improving service quality\n• Anonymous aggregation of agricultural data for research purposes\n• Use of location data (when provided) for local weather and mandi information\n\nWe do not sell your personal data to third parties. Please review our full Privacy Policy at krishiai.com/privacy for complete details.`,
      },
      {
        id: 'modifications',
        title: '9. Modifications to Terms',
        content: `KrishiAI reserves the right to modify these Terms at any time. Changes will be effective immediately upon posting to the website.\n\nWe will make reasonable efforts to notify users of significant changes through:\n• A notice on the KrishiAI website homepage\n• An announcement in the WhatsApp service\n\nYour continued use of the Service after any modifications constitutes your acceptance of the updated Terms.\n\nWe encourage you to review these Terms periodically. The "Last Updated" date at the top of this page will always indicate the most recent version.`,
      },
      {
        id: 'governing-law',
        title: '10. Governing Law & Disputes',
        content: `These Terms shall be governed by and construed in accordance with the laws of India, specifically:\n\n• The Information Technology Act, 2000 and its amendments\n• The Consumer Protection Act, 2019\n• Applicable Indian agricultural regulations\n\nAny disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in India.\n\nFor any disputes or concerns, please first contact us at support@krishiai.com. We are committed to resolving issues amicably before pursuing formal legal proceedings.`,
      },
      {
        id: 'contact',
        title: '11. Contact Information',
        content: `If you have any questions, concerns, or feedback regarding these Terms and Conditions, please contact us:\n\n📧 Email: support@krishiai.com\n🌐 Website: krishiai.com\n📱 WhatsApp: Available through the Service\n📍 Address: India\n\nWe aim to respond to all inquiries within 2–3 business days.\n\nFor urgent agricultural emergencies, please contact your local Krishi Vigyan Kendra (KVK) or state agriculture helpline directly.`,
      },
    ]
  },
  voiceAssistant: {
    title: "Voice Assistant",
    subtitle: "Enterprise-Grade Agricultural Intelligence",
    statusInactive: "Ready to help",
    statusLoading: "Establishing secure link...",
    statusActive: "KrishiAI is active",
    startCall: "Start Conversation",
    stopCall: "End Conversation",
    listening: "Listening...",
    speaking: "Speaking...",
    mute: "Mute",
    unmute: "Unmute"
  },
  whatsappPage: {
    title: "WhatsApp Bot SDK",
    subtitle: "Multi-Channel Voice & Text Support",
    heroTitle: "Unified Communication",
    heroHeading: "WhatsApp {botSDK}",
    botSDK: "Bot SDK",
    heroDesc: "The world's most powerful agricultural intelligence, now delivered directly where farmers already communicate.",
    heroCardTitle: "KrishiAI WhatsApp Bot",
    heroCardSubtitle: "Your Pocket Farming Advisor",
    heroCardDesc: "Experience full KrishiAI intelligence inside your WhatsApp. No app to download. Works effortlessly across 8 Indian languages with Voice, Text, and Image recognition.",
    btnChat: "Chat on WhatsApp",
    tabs: {
      features: "All Features",
      algorithm: "How It Works",
      languages: "Languages",
      inputs: "Input Guide"
    },
    featureListTitle: "Deployment Features",
    modulesCount: "8 Modules",
    whatToSend: "What User Needs to Send",
    supportedLangs: "Supported Languages",
    botName: "KrishiAI Bot",
    statusOnline: "online",
    globalReachTitle: "Global Reach",
    globalReachDesc: "Deployed across 12,000+ villages using the official WhatsApp Business API infrastructure.",
    agentIntelTitle: "Agent Intelligence",
    agentIntelDesc: "Powered by Llama-3.1 & Gemini Pro Vision for complex crop analysis. 99.9% Uptime.",
    techStackHeader: "Technology Stack",
    processMessagesTitle: "How we process millions of farm messages",
    liveDashboard: "Live Status Dashboard",
    latency: "Latency",
    accuracy: "Accuracy",
    latencyDesc: "Average response time for text queries.",
    accuracyDesc: "Voice message transcription & intent detection.",
    lingueIntelTitle: "Linguistic Intelligence",
    dialectsCount: "8 Dialects Supported",
    sendToStart: 'Send "{num}" to start',
    naturalLanguageTip: "KrishiAI is designed to understand natural farming language. You don't need formatted commands. Just speak or write as if you are talking to a human expert.",
    features: {
      weather: {
        title: "Weather Forecast",
        desc: "Real-time weather + 5-day forecast with farming advice",
        inputs: ["Location (GPS or city name)", "\"What's the weather?\""],
        exampleUser: "What is the weather forecast?",
        exampleBot: "🌤 *Premium Weather Report: Ahmedabad*\n\n🌡 *Temp:* 34°C (Feels 38°C)\n💧 *Humidity:* 45%\n💨 *Wind:* 12 km/h\n🌅 *Sunrise:* 6:15 AM\n🌇 *Sunset:* 7:02 PM\n\n💡 *Farming Advice:*\n*Safe to spray pesticides today — low wind.*\n*Irrigate in evening to reduce evaporation.*"
      },
      crop_advice: {
        title: "Crop Advisory",
        desc: "NPK dosage, pest control, irrigation schedules",
        inputs: ["Crop name", "Soil type (optional)", "Problem description"],
        exampleUser: "My tomato leaves have yellow spots",
        exampleBot: "🍅 *Tomato Leaf Analysis*\n\nYellow spots indicate *Early Blight (Alternaria solani)*\n\n✅ *Immediate Action:*\n• Remove affected leaves\n• Apply *Mancozeb 75% WP* @ 2g/L\n• Spray every 7 days for 3 cycles\n\n💧 *Prevention:*\n• Avoid overhead irrigation\n• Maintain plant spacing 60cm"
      },
      disease: {
        title: "Disease Detection",
        desc: "Send crop photo → AI identifies disease + treatment",
        inputs: ["Crop photo (camera/gallery)", "Optional: crop name"],
        exampleUser: "📷 [Sends photo of diseased leaf]",
        exampleBot: "📷 Analyzing your crop photo...\n\n✅ *Analysis Complete:*\n\n🔍 *Disease:* Powdery Mildew\n📊 *Severity:* Moderate (30-40%)\n🌿 *Crop:* Cucumber/Gourd family\n\n💊 *Treatment:*\n• Spray *Sulphur 80% WDG* @ 3g/L\n• Apply *Trichoderma viride* as bio-control\n• Remove severely affected leaves"
      },
      voice: {
        title: "Voice Messages",
        desc: "Speak in any language → AI transcribes & responds",
        inputs: ["Voice note in any supported language"],
        exampleUser: "🎙️ [Voice: \"Meri gehu ki fasal mein kya khad daalu?\"]",
        exampleBot: "🎙️ Processing your voice message...\n\n*गेहूं में खाद की मात्रा:*\n\n🌾 *बुवाई के समय:*\n• DAP: 50 kg/एकड़\n• यूरिया: 25 kg/एकड़\n\n🌱 *पहली सिंचाई पर (21 दिन):*\n• यूरिया: 25 kg/एकड़\n\n💧 *दूसरी सिंचाई पर (45 दिन):*\n• यूरिया: 25 kg/एकड़"
      },
      market: {
        title: "Market Prices",
        desc: "Live APMC mandi rates from Government API",
        inputs: ["\"Market price of wheat\"", "\"Onion rate in Nashik\""],
        exampleUser: "What is the price of onion in Gujarat?",
        exampleBot: "📊 *Live Onion Market Prices — Gujarat*\n\n🏪 *Rajkot APMC:* ₹1,400/qtl\n🏪 *Ahmedabad APMC:* ₹1,350/qtl\n🏪 *Surat APMC:* ₹1,500/qtl\n\n📈 *Trend:* ↑ 5% from last week\n\n💡 *Advice:* Prices rising due to low supply. Good time to sell if quality is Grade A."
      },
      location: {
        title: "Location Intelligence",
        desc: "Share GPS → Get local weather, mandis, soil info",
        inputs: ["Share location via WhatsApp attachment"],
        exampleUser: "📍 [Shares GPS location]",
        exampleBot: "📍 *Location Received: Gota, Ahmedabad*\n\n🌤 *Weather:* 34°C, Partly Cloudy\n💧 *Humidity:* 48%\n\n🏪 *Nearest Mandis:*\n• Ahmedabad APMC (8 km)\n• Gandhinagar APMC (15 km)\n\n🌱 *Best crops for your area:*\nCotton, Castor, Groundnut, Bajra"
      },
      schemes: {
        title: "Government Schemes",
        desc: "PM-KISAN, PMFBY, KCC eligibility & application help",
        inputs: ["\"What schemes am I eligible for?\"", "\"How to apply for PM-KISAN?\""],
        exampleUser: "Tell me about PM-KISAN scheme",
        exampleBot: "📜 *PM-KISAN Samman Nidhi*\n\n💰 *Benefit:* ₹6,000/year in 3 installments\n👨‍🌾 *Eligible:* All farmer families with cultivable land\n\n📋 *How to Apply:*\n1. Visit pmkisan.gov.in\n2. Click \"New Farmer Registration\"\n3. Enter Aadhaar + Bank details\n4. Upload land records\n\n📞 *Helpline:* 155261 or 011-24300606"
      },
      yield: {
        title: "Yield Prediction",
        desc: "ML-based crop yield estimation with recommendations",
        inputs: ["Crop name", "Area (acres/hectares)", "Season", "Fertilizer used"],
        exampleUser: "Predict yield for 5 acres wheat with 100kg urea",
        exampleBot: "📊 *Yield Prediction — Wheat*\n\n🌾 *Area:* 5 acres\n📈 *Predicted Yield:* 18.5 quintals\n💰 *Est. Revenue:* ₹40,700 @ MSP ₹2,200/qtl\n\n✅ *Optimization Tips:*\n• Add 50kg DAP for +15% yield\n• Ensure 4 irrigations at critical stages\n• Apply Zinc Sulphate @ 25kg/ha"
      }
    },
    algorithm: [
      { num: "1", title: "User sends \"Hi\"", desc: "Greeting detected → Language menu shown (8 languages)", icon: "👋" },
      { num: "2", title: "Language Selected", desc: "User picks 1-8 → Preference stored in session", icon: "🌐" },
      { num: "3", title: "Message Received", desc: "Text / Photo / Voice / Location analyzed", icon: "📨" },
      { num: "4", title: "Language Auto-Detect", desc: "Unicode script detection (Devanagari, Gujarati, Tamil...)", icon: "🔍" },
      { num: "5", title: "Intent Routing", desc: "Weather? Disease? Market? Scheme? → Route to service", icon: "🧠" },
      { num: "6", title: "Data Fetch", desc: "Govt API / Weather API / ML Model / Vision AI called", icon: "📡" },
      { num: "7", title: "AI Response", desc: "Groq LLM formats reply in user's language", icon: "🤖" },
      { num: "8", title: "WhatsApp Reply", desc: "Formatted message sent via Meta/Twilio API", icon: "✅" }
    ]
  },
  platformFeatures: {
    badge: 'Platform Capabilities',
    titleMain: 'A Complete',
    titleAccent: 'AI Toolkit',
    subtitle: 'From pre-sowing soil prep to post-harvest sales, KrishiAI provides 360-degree support right in your pocket.',
    items: {
      vendors: {
        title: 'Agri Marketplace & Crop Sale',
        desc: 'Direct B2B/B2C marketplace for seeds, fertilizers, machinery & direct farmer crop selling without middlemen.',
        badge: 'Marketplace',
        route: '/vendors'
      },
      voice: {
        title: 'Hands-Free Voice AI',
        desc: 'Real-time AI voice assistant for farmers speaking in 15+ regional Indian dialects.',
        badge: 'Voice AI',
        route: '/voice-assistant'
      },
      community: {
        title: 'Farmer Community',
        desc: 'Collaborative network for farmers across India to share field experience, Q&A, and live discussions.',
        badge: 'Community',
        route: '/community'
      },
      satellite: {
        title: 'Satellite NDVI Health',
        desc: 'Real-time crop health monitoring using multispectral satellite imagery. Track plant vigor and moisture levels dynamically.',
        badge: 'Orbital Tech',
        route: '/satellite'
      },
      pest: {
        title: 'AI Disease & Pest Detection',
        desc: 'Scan infested leaves with Vision AI to get instant disease identification and remedy prescriptions.',
        badge: 'Vision AI',
        route: '/predict'
      },
      recommend: {
        title: 'Soil & Crop Recommendation',
        desc: 'Smart N-P-K soil analysis and crop suitability recommendation engine for maximum harvest yield.',
        badge: 'Smart Advisor',
        route: '/recommend'
      },
      mandi: {
        title: 'Live Mandi Rates & Map',
        desc: 'Interactive geo-map and live rate tracker for all APMC mandis across India.',
        badge: 'Live Prices',
        route: '/market-prices'
      },
      weather: {
        title: 'Hyper-Local Eco-Weather',
        desc: 'Hyper-local weather forecasts and agricultural spraying alerts with precision down to 500m.',
        badge: 'Weather AI',
        route: '/chat'
      },
      subsidies: {
        title: 'Govt Schemes & Subsidies',
        desc: 'Smart eligibility tracker for PM-KISAN, crop insurance (PMFBY), seeds, and equipment subsidies.',
        badge: 'Subsidies',
        route: '/schemes'
      },
      multilingual: {
        title: 'WhatsApp AI Bot',
        desc: 'Instant 24/7 farming advisory on WhatsApp in 15+ Indian dialects with voice, image & location support.',
        badge: 'WhatsApp Bot',
        route: '/whatsapp'
      }
    }
  }
};
