export const hi = {
  header: {
    online: 'ऑनलाइन और तैयार',
    pinned: 'पिन किए गए संदेश',
    respondingIn: 'जवाब दे रहे हैं',
    switchToEnglish: 'अंग्रेजी में बदलें',
  },
  navbar: {
    features: 'विशेषताएं',
    howItWorks: 'यह कैसे काम करता है',
    testimonials: 'प्रशंसापत्र',
    about: 'जानकारी',
    login: 'लॉगिन',
    tryFree: 'मुफ्त में आजमाएं',
    dashboard: 'डैशबोर्ड पर जाएं',
  },
  hero: {
    introducing: 'KrishiAI 2.0 का परिचय',
    titleMain: 'खेती को स्मार्ट बनाएं',
    titleAccent: 'WhatsApp पर AI के साथ',
    subtitle: 'वास्तविक समय में बाजार की कीमतों, स्थानीय मौसम अलर्ट और विशेषज्ञ फसल रोग निदान तक तुरंत पहुंचें। कहीं से भी KrishiAI से बात करें।',
    btnChat: 'अभी चैट शुरू करें',
    btnExplore: 'विशेषताएं देखें',
  },
  heroMessages: [
    { type: 'user', content: "आज गेहूं का MSP क्या है?" },
    { type: 'bot', content: "नमस्ते! 🙏 आज गेहूं का MSP ₹2,275 प्रति क्विंटल है। आपके क्षेत्र में स्थानीय मंडी भाव ₹2,350 के साथ थोड़ा अधिक चल रहा है। क्या मुझे खरीदार खोजने चाहिए?" }
  ],
  features: {
    titleMain: 'हर किसान के लिए',
    titleAccent: 'शक्तिशाली उपकरण',
    subtitle: 'मिट्टी से लेकर बाजार तक, KrishiAI वह समझ प्रदान करता है जिसकी आपको आधुनिक कृषि में सफल होने के लिए आवश्यकता है।',
    liveWeather: {
      title: 'लाइव मौसम',
      desc: "अपने खेत के सटीक GPS स्थान के आधार पर स्थानीय, वास्तविक समय के मौसम पूर्वानुमान और अलर्ट प्राप्त करें।",
      messages: [
        { type: 'user', content: "आज मेरे खेत का मौसम कैसा है?" },
        { type: 'bot', content: "📍 आपके GPS के आधार पर, शाम 4 बजे से भारी बारिश की संभावना है। मैं कल सुबह तक किसी भी कीटनाशक छिड़काव को टालने की सलाह देता हूँ। " }
      ]
    },
    diseaseDetection: {
      title: 'रोग पहचान',
      desc: 'अपनी संक्रमित फसल की फोटो अपलोड करें और AI को रोग का विश्लेषण करने और उपचार बताने दें।',
      messages: [
        { type: 'user', content: "📷 [संलग्न चित्र] मेरे टमाटर के पत्ते भूरे धब्बों के साथ पीले क्यों पड़ रहे हैं?" },
        { type: 'bot', content: "विश्लेषण पूरा हुआ। यह अर्ली ब्लाइट (Early Blight) लग रहा है। आगे फैलने से रोकने के लिए तुरंत कॉपर-आधारित कवकनाशी लगाएं और संक्रमित निचली पत्तियों को काट दें।" }
      ]
    },
    cropAdvisory: {
      title: 'फसल परामर्श',
      desc: 'बुवाई, मिट्टी के स्वास्थ्य, सिंचाई कार्यक्रम और कटाई के सही समय के बारे में विशेष रूप से पूछें।',
      messages: [
        { type: 'user', content: "क्या पंजाब में गेहूं बोने का सही समय है?" },
        { type: 'bot', content: "हाँ! पंजाब में गेहूं की बुवाई के लिए नवंबर के मध्य का समय आदर्श है। सुनिश्चित करें कि मिट्टी की नमी पर्याप्त है। DBW 187 इस सीजन के लिए अत्यधिक अनुशंसित उच्च उपज वाली किस्म है।" }
      ]
    },
    marketPrices: {
      title: 'बाजार भाव',
      desc: 'अपनी उपज बेचने से पहले दैनिक आधिकारिक MSP कीमतों और अनुमानित स्थानीय मंडी दरों तक पहुंचें।',
      messages: [
        { type: 'user', content: "गुजरात में कपास का मंडी भाव क्या है?" },
        { type: 'bot', content: "आज गुजरात में कपास का औसत मंडी भाव ₹6,800 - ₹7,200 प्रति क्विंटल है। रुझान थोड़ा ऊपर की ओर है। यदि यह ₹7,500 को पार करता है तो क्या मुझे आपको अलर्ट करना चाहिए?" }
      ]
    },
    govtSchemes: {
      title: 'सरकारी योजनाएं',
      desc: 'अपने खेत के लिए तैयार किए गए सहायता कार्यक्रमों और सब्सिडी का अन्वेषण करें।',
      searchPlaceholder: 'योजनाएं खोजें...',
      allCategories: 'सभी श्रेणियां',
      applyAI: 'AI के साथ पात्रता जांचें',
      officialPortal: 'आधिकारिक पोर्टल',
      mainBenefit: 'मुख्य लाभ',
      trackDeadlines: 'समय सीमा ट्रैक करें',
      upgradePro: 'प्रो सलाहकार बनें',
      messages: [
        { type: 'user', content: "मैं PMFBY के तहत फसल बीमा का दावा कैसे करूँ?" },
        { type: 'bot', content: "PMFBY का दावा करने के लिए, आपको फसल बीमा ऐप या टोल-फ्री नंबर के माध्यम से 72 घंटों के भीतर फसल के नुकसान की रिपोर्ट करनी होगी। मैं आपके स्थानीय कृषि अधिकारी का संपर्क खोजने में मदद कर सकता हूँ।" }
      ]
    },
    satellite: {
      title: 'सैटेलाइट फ़ार्म हेल्थ',
      desc: 'कक्षीय डेटा (Orbital Data) से सीधे रीयल-टाइम NDVI वनस्पति निगरानी और खेत के स्वास्थ्य संबंधी अलर्ट।',
      messages: [
        { type: 'user', content: "मुझे सैटेलाइट से मेरे खेत की स्थिति दिखाएं।" },
        { type: 'bot', content: "🛰️ नासा MODIS डेटा एक्सेस कर रहा हूँ... आपके खेत का NDVI 0.72 (स्वस्थ) है। वनस्पति घनी है। मैंने उत्तर-पूर्वी कोने पर एक छोटा सूखा हिस्सा देखा है। क्या आप हाई-रेज़ मैप देखना चाहेंगे?" }
      ]
    },
    mandiMap: {
      title: 'मंडी खोज और मैप',
      desc: 'एक इंटरैक्टिव हीटमैप पर लाइव बाजार भाव और किसानों की गतिविधि का पता लगाएं।',
      messages: [
        { type: 'user', content: "पास में प्याज के सबसे अच्छे भाव कहाँ मिल रहे हैं?" },
        { type: 'bot', content: "🗺️ स्थानीय मंडियों की तलाश कर रहा हूँ... लासलगांव APMC ₹2,400/क्विंटल (टॉप ग्रेड) की रिपोर्ट कर रहा है। यह आपसे 15 किमी दूर है। हाल ही में 12 किसानों ने वहां अपनी लोकेशन शेयर की है। नेविगेट करें?" }
      ]
    },
    multilingual: {
      title: 'बहुभाषी WhatsApp',
      desc: 'WhatsApp पर अंग्रेजी, हिंदी, पंजाबी, मराठी और तमिल में सुरक्षित रूप से बातचीत करें।',
      messages: [
        { type: 'user', content: "नमस्ते! मुझे अपनी मिट्टी का परीक्षण कैसे करवाना चाहिए?" },
        { type: 'bot', content: "नमस्ते! आप अपने नज़दीकी कृषि विज्ञान केंद्र (KVK) में मिट्टी का नमूना दे सकते हैं। मैं आपको सबसे नज़दीकी KVK का पता भेज रहा हूँ।" }
      ]
    }
  },
  chatSelection: {
    title: 'अपना रास्ता चुनें',
    subtitle: 'चुनें कि आप KrishiAI के साथ कैसे बातचीत करना चाहते हैं',
    whatsappTitle: 'WhatsApp AI',
    whatsappDesc: 'अपने पसंदीदा मैसेजिंग ऐप का उपयोग करके तुरंत चैट करें',
    whatsappTag: 'अनुशंसित',
    webAppTitle: 'वेब ऐप',
    webAppDesc: 'उन्नत सुविधाओं और डैशबोर्ड ट्रैकिंग तक पहुंचें',
    webAppTag: 'उन्नत',
  },
  mission: {
    badge: 'हमारा मुख्य दृष्टिकोण',
    title: 'ग्रामीण जड़ों को सशक्त बनाना,',
    accent: 'कृषि सफलता का मापन',
    desc: "KrishiAI सिर्फ एक चैटबॉट नहीं है; यह सदियों पुरानी पारंपरिक खेती के ज्ञान और आर्टिफिशियल इंटेलिजेंस की अत्याधुनिक शक्ति के बीच एक सेतु है। हमारा लक्ष्य ग्रामीण भारत के सबसे दूरस्थ कोनों तक उच्च-तकनीकी समाधान पहुंचाना है।",
    card1Title: 'परंपरा और तकनीक का मिलन',
    card1Desc: 'वास्तविक समय के डेटा और वैज्ञानिक सटीकता के साथ सदियों पुरानी कृषि पद्धतियों की पुष्टि करना।',
    card2Title: 'समावेशी डिजाइन',
    card2Desc: 'सहज आवाज और WhatsApp बातचीत के माध्यम से, तकनीकी साक्षरता की परवाह किए बिना हर किसान के लिए बनाया गया है।',
    card3Title: 'ग्रामीण प्रभाव',
    card3Desc: 'पारदर्शिता और उचित मूल्य निर्धारण के साथ शहर के बाजारों और गांव के खेतों के बीच की दूरी को कम करना।',
  },
  howItWorks: {
    badge: 'शुरू करें',
    title: 'इतना आसान',
    subtitle: 'कोई ऐप डाउनलोड नहीं, कोई जटिल इंटरफ़ेस नहीं। KrishiAI वहीं है जहां आप पहले से ही परिवार और दोस्तों से बात करते हैं।',
    step1Title: 'इस QR को स्कैन करें',
    step1Desc: 'KrishiAI के साथ तुरंत चैट शुरू करने के लिए अपने फोन कैमरे का उपयोग करके QR कोड स्कैन करें।',
    step1Badge: 'त्वरित पहुंच',
    step2Title: 'अपना प्रश्न पूछें',
    step2Desc: 'अपनी मातृभाषा में टेक्स्ट या वॉयस नोट भेजें, या अपने खेतों की फोटो खींचकर भेजें।',
    step2Badge: 'बहुभाषी AI',
    step3Title: 'AI समाधान पाएं',
    step3Desc: 'शीर्ष कृषि विज्ञान डेटाबेस द्वारा सत्यापित सटीक, वास्तविक समय अलर्ट और कार्रवाई योग्य उपचार प्राप्त करें।',
    step3Badge: 'विशेषज्ञ सत्यापित',
  },
  stats: {
    villages: 'पहुंचे हुए गांव',
    methods: 'सत्यापित विधियां',
    dialects: 'क्षेत्रीय बोलियां',
    access: 'समावेशी पहुंच',
  },
  impact: {
    badge: 'गांव प्रभाव रिपोर्ट',
    titleMain: 'भारत की',
    titleAccent: 'रीढ़',
    titleEnd: 'को सशक्त बनाना',
    subtitle: 'KrishiAI विशेष रूप से सबसे दूरस्थ गांवों में पारंपरिक किसानों के लिए काम करने के लिए डिज़ाइन किया गया है, जिसके लिए शून्य तकनीकी ज्ञान की आवश्यकता होती है।',
    card1Tag: 'पहुंच',
    card1Title: '100+ गांव',
    card1Desc: '12+ राज्यों में दूरस्थ ग्रामीण समूहों में सक्रिय डिजिटल परिवर्तन।',
    card2Tag: 'परंपरा',
    card2Title: 'पारंपरिक देखभाल',
    card2Desc: 'जैविक तरीकों और साथी रोपण ज्ञान के लिए AI-आधारित सत्यापन।',
    card3Tag: 'निष्पक्षता',
    card3Title: 'कोई बिचौलिया नहीं',
    card3Desc: 'प्रत्यक्ष बाजार अंतर्दृष्टि ग्रामीणों को स्थानीय स्तर पर 15% बेहतर कीमतें सुरक्षित करने में मदद करती है।',
    card4Tag: 'समावेश',
    card4Title: 'देसी आवाज',
    card4Desc: '15+ क्षेत्रीय बोलियों को समझने वाले AI के साथ साक्षरता की बाधा को तोड़ना।',
    testimonial: '"मुझे नहीं पता कि ऐप्स या कंप्यूटर का उपयोग कैसे करना है। लेकिन मुझे WhatsApp पर बात करना आता है। KrishiAI ने मुझे बताया कि महंगे रसायनों के बजाय स्थानीय नीम के तेल का उपयोग करके अपनी धान की फसल का इलाज कैसे करें। इसने मेरा पूरा सीजन बचा लिया। "',
    author: 'सोहन लाल',
    authorRole: 'पारंपरिक किसान • ग्रामीण हरियाणा',
  },
  testimonials: {
    titleMain: 'किसानों द्वारा',
    titleAccent: 'पसंदीदा',
  },
  faq: {
    badge: 'ज्ञान केंद्र',
    titleMain: 'अक्सर पूछे जाने वाले',
    titleAccent: 'प्रश्न',
    subtitle: 'KrishiAI प्लेटफॉर्म और हमारे गांव-प्रथम मिशन के बारे में वह सब कुछ जो आपको जानना आवश्यक है। ',
    mailTitle: 'अभी भी तकनीकी विवरणों के बारे में उत्सुक हैं?',
    mailBtn: 'सहायता के लिए संदेश भेजें',
  },
  cta: {
    title: 'खेती को स्मार्ट बनाएं',
    accent: 'आज ही — मुफ्त में',
    subtitle: 'कोई ऐप डाउनलोड नहीं। कोई साइन-अप नहीं। बस WhatsApp खोलें और भारत के सबसे स्मार्ट कृषि AI के साथ चैट करें।',
    btnLaunch: 'KrishiAI चैट शुरू करें',
    btnWhatsApp: 'WhatsApp में खोलें',
    encryption: 'एंड-टू-एंड सुरक्षित',
    ready: 'WhatsApp पर तैयार',
    multiLang: '15+ भाषाएं',
    perks: ['✅ 100% मुफ्त', '✅ किसी ऐप की आवश्यकता नहीं', '✅ कोई भी फोन', '✅ 15+ भाषाएं'],
  },
  footer: {
    ready: 'अपने खेत को',
    transform: 'बदलने',
    yourFarm: 'के लिए तैयार हैं?',
    subtitle: 'हर दिन स्मार्ट निर्णय लेने वाले हजारों किसानों से जुड़ें। किसी ऐप डाउनलोड की आवश्यकता नहीं, बस WhatsApp पर शुद्ध AI शक्ति।',
    btnTry: 'KrishiAI को मुफ्त में आजमाएं',
    product: 'उत्पाद',
    company: 'कंपनी',
    support: 'सहायता',
    legal: 'कानूनी',
    allRights: 'सर्वाधिकार सुरक्षित।',
    privacy: 'गोपनीयता नीति',
    terms: 'सेवा की शर्तें',
    madeWith: 'भारत के किसानों के लिए ❤️ के साथ बनाया गया',
    badges: {
      free: '✅ 100% हमेशा के लिए मुफ्त',
      eco: '🌱 पर्यावरण-जिम्मेदार AI',
      india: '🇮🇳 भारत में निर्मित',
      privacy: '🔒 गोपनीयता प्रथम',
    }
  },
  chat: {
    welcome: 'नमस्ते! आगे बढ़ने के लिए कृपया अपनी पसंदीदा भाषा चुनें:',
    newConversation: 'नई बातचीत',
    connectionError: '⚠️ कनेक्शन त्रुटि। कृपया अपना इंटरनेट जांचें और पुन: प्रयास करें।',
    initialMsg: 'नमस्ते! 🌾 मैं **KrishiAI** हूँ, आपका व्यक्तिगत कृषि सलाहकार।\n\nआप मुझसे इनके बारे में पूछ सकते हैं:\n- 🌤 **मौसम** — पूर्वानुमान के लिए अपना स्थान साझा करें\n- 🌱 **फसल सलाह और बुवाई कैलेंडर** — समय, सिंचाई, कटाई\n- 💰 **बाजार भाव** — वास्तविक समय MSP और मंडी दरें\n- 🐛 **कीट अलर्ट** — मौसमी खतरे और उपचार\n- 🌿 **मिट्टी का स्वास्थ्य** — सुधार और कमी का पता लगाना\n- 📊 **उपज अनुमानक** — आपके खेत के लिए अपेक्षित फसल\n- 💧 **सिंचाई कैलकुलेटर** — फसल चरण के अनुसार पानी की आवश्यकता\n- 🔬 **रोग पहचान** — फसल की फोटो अपलोड करें\n- 📜 **सरकारी योजनाएं** — PM-KISAN, PMFBY और बहुत कुछ\n\nआज मैं आपके खेत की कैसे मदद कर सकता हूँ?',
    quickActions: {
      weather: 'मौसम',
      msp: 'MSP भाव',
      pest: 'कीट अलर्ट',
      soil: 'मिट्टी स्वास्थ्य',
      yield: 'उपज अनुमान',
      irrigation: 'सिंचाई',
      schemes: 'योजनाएं',
      disease: 'रोग पहचान',
    },
    sidebar: {
      newChat: 'नई चैट',
      menu: 'मेन्यू',
      home: 'होम',
      dashboard: 'डैशबोर्ड',
      mandiMap: 'मंडी मैप',
      marketPrices: 'बाजार भाव',
      schemes: 'योजनाएं',
      analytics: 'एनालिटिक्स',
      recentChats: 'हालिया चैट',
      callHistory: 'कॉल इतिहास',
      voiceAssistant: 'वॉयस असिस्टेंट',
      noHistory: 'अभी तक कोई इतिहास नहीं',
      today: 'आज',
      yesterday: 'कल',
      older: 'पुराना',
      preferences: 'वरीयताएँ',
      help: 'सहायता और समर्थन',
      settings: 'सेटिंग्स',
      farmerProfile: 'किसान प्रोफाइल',
      proMember: 'प्रो सदस्य',
      community: 'कम्युनिटी',
    },
    dashboard: {
      analytics: {
        title: 'राष्ट्रीय किसान इंटेलिजेंस',
        subtitle: 'भारत के कृषि नेटवर्क के साथ वास्तविक समय डेटा सिंक्रनाइज़ेशन',
        totalFarmers: 'सक्रिय प्लेटफॉर्म किसान',
        webUsers: 'वेब उपयोगकर्ता',
        whatsappUsers: 'व्हाट्सएप बॉट उपयोगकर्ता',
        dailyActive: 'दैनिक सक्रिय (24 घंटे)',
        locationCount: 'सिंक किए गए स्थान',
        villagesReached: 'उच्च-गतिविधि वाले राज्य',
        methodsValidated: 'सत्यापित विधियां',
        charts: {
          registrationsTrend: 'सक्रिय जुड़ाव रुझान',
          webVsWhatsapp: 'प्लेटफॉर्म वितरण',
          topQueries: 'सबसे ज्यादा पूछे जाने वाले खेती के सवाल',
          liveMap: 'लाइव किसान वितरण',
          noDataYet: 'इंटेलिजेंस एकत्र की जा रही है...',
          farmers: 'किसान',
          showMandis: 'मंडियां दिखाएं',
          webLegend: 'वेब एप्लीकेशन',
          whatsappLegend: 'व्हाट्सएप / एसएमएस',
          mapInstruction: 'सामरिक डेटा के लिए मार्करों पर क्लिक करें',
          visitors: 'दैनिक गतिविधि',
        }
      },
      community: {
        title: "किसान समुदाय",
        subtitle: "पूरे भारत के किसानों के साथ वास्तविक समय में चर्चा",
        placeholder: "अपना अनुभव साझा करें या प्रश्न पूछें...",
        live: "अभी लाइव",
        onlineCount: " किसान ऑनलाइन"
      }
    },
    prompts: {
      explainScheme: (name) => `कृपया "${name}" सरकारी योजना के बारे में पूरी विस्तार से बताएं। पात्रता, लाभ और आवेदन कैसे करें, इसे शामिल करें।`,
      analyzePredict: (crop, temp, rain, ndvi, yieldVal, conf, risk, rec) => `मैंने अभी ${crop} के लिए उपज का अनुमान लगाया है। \nपैरामीटर्स: तापमान ${temp}°C, वर्षा ${rain}mm, NDVI ${ndvi}। \nपरिणाम: ${yieldVal} टन/हेक्टेयर (${conf}% आत्मविश्वास, ${risk} जोखिम)। \nअनुशंसित अगली फसल: ${rec}। \n\nकृपया इसका विश्लेषण करें और मुझे सलाह दें।`,
      analyzeRecommend: (crop, yieldVal, conf) => `आपने ${yieldVal} टन/हेक्टेयर की अपेक्षित उपज और ${conf}% उपयुक्तता के साथ ${crop} की सिफारिश की है। मेरी मिट्टी के लिए यह सबसे अच्छा विकल्प क्यों है? अन्य विकल्पों के साथ इसकी तुलना करें।`,
    },
    intelligence: {
      title: 'फसल इंटेलिजेंस',
      predict: {
        title: 'उपज अनुमानक',
        subtitle: 'क्षेत्र की स्थितियों के आधार पर AI-संचालित फसल पूर्वानुमान।',
        formTitle: 'क्षेत्र के पैरामीटर',
        btnPredict: 'उपज का अनुमान लगाएं',
        analyzing: 'AI के साथ विश्लेषण किया जा रहा है...',
        resultTitle: 'भविष्यवाणी परिणाम',
        predictedYield: 'अनुमानित उपज',
        tonsPerHectare: 'टन / हेक्टेयर',
        confidence: 'आत्मविश्वास',
        riskLevel: 'जोखिम स्तर',
        recommendedCrop: 'अनुशंसित फसल',
        inputSummary: 'इनपुट सारांश',
        tipsTitle: 'बेहतर भविष्यवाणी के लिए टिप्स',
      },
      recommend: {
        title: 'फसल सलाहकार',
        subtitle: 'अपनी मिट्टी के लिए सबसे लाभदायक और उपयुक्त फसल खोजें।',
        btnRecommend: 'सिफारिशें प्राप्त करें',
        bestFit: 'आपकी मिट्टी के लिए सबसे उपयुक्त',
        suitability: 'उपयुक्तता',
        expectedYield: 'अपेक्षित उपज',
      },
      satellite: {
        title: 'सैटेलाइट स्वास्थ्य',
        subtitle: 'अपने खेत के निर्देशांकों के लिए लाइव NDVI वनस्पति निगरानी।',
        healthIndex: 'स्वास्थ्य सूचकांक (NDVI)',
        vegetationStatus: 'वनस्पति स्थिति',
      },
      fields: {
        cropName: 'फसल का नाम',
        temperature: 'तापमान (°C)',
        rainfall: 'वर्षा (mm)',
        humidity: 'नमी (%)',
        soilPH: 'मिट्टी pH',
        nitrogen: 'नाइट्रोजन (N) kg/ha',
        phosphorus: 'फास्फोरस (P) kg/ha',
        potassium: 'पोटेशियम (K) kg/ha',
        ndvi: 'NDVI इंडेक्स',
      }
    },
    dashboard: {
      analytics: {
        pageTitle: 'किसान इंटेलिजेंस डैशबोर्ड',
        liveSubtitle: 'वास्तविक समय कृषि गतिविधि · भारत 🇮🇳',
        updatedPrefix: 'अद्यतन',
        backendOnline: 'बैकएंड ऑनलाइन',
        backendOffline: 'बैकएंड ऑफलाइन',
        refresh: 'ताज़ा करें',
        backendNotReachable: 'बैकएंड तक नहीं पहुँचा जा सकता',
        backendOfflineTip: 'वास्तविक डेटा देखने के लिए बैकएंड को `uvicorn app.main:app --reload` के साथ शुरू करें।',
        kpis: {
          totalVisitors: 'कुल आगंतुक',
          webUsers: 'वेबसाइट उपयोगकर्ता',
          whatsappUsers: 'व्हाट्सएप किसान',
          activeToday: 'आज सक्रिय',
          locationShared: 'स्थान साझा किया गया',
          totalVisitorsDesc: 'सभी वेबसाइट और व्हाट्सएप बातचीत',
          webUsersDesc: 'ब्राउज़र सत्रों के माध्यम से ट्रैक किया गया',
          whatsappUsersDesc: 'व्हाट्सएप बॉट के माध्यम से',
          activeTodayDesc: 'आज शुरू किए गए सत्र',
          locationSharedDesc: 'किसान जिन्होंने GPS की अनुमति दी'
        },
        charts: {
          farmersByState: 'राज्यवार किसान',
          noDataYet: 'अभी तक कोई डेटा नहीं',
          loadingLive: 'लाइव डेटा प्राप्त किया जा रहा है...',
          dailyVisits: 'दैनिक विज़िट (पिछले 7 दिन)',
          visitors: 'आगंतुक',
          webVsWhatsapp: 'वेब बनाम व्हाट्सएप',
          mostAsked: 'अक्सर पूछे जाने वाले कृषि प्रश्न',
          liveMap: 'लाइव किसान गतिविधि मैप',
          viewFullHeatmap: 'पूरा हीटमैप देखें →',
          farmers: 'किसान',
          webLegend: 'वेब उपयोगकर्ता',
          whatsappLegend: 'व्हाट्सएप किसान',
          mapInstruction: 'स्थान विवरण देखने के लिए एक बिंदु पर क्लिक करें'
        }
      },
      heatmap: {
        pageTitle: 'किसान गतिविधि हीटमैप',
        demoData: '⚠️ डेमो डेटा — बैकएंड ऑफलाइन',
        waitingForFarmers: 'किसानों द्वारा स्थान साझा करने की प्रतीक्षा है...',
        totalLocations: (count) => `पूरे भारत में ${count} किसान स्थान`,
        legend: 'लिजेंड',
        webUsers: 'वेब उपयोगकर्ता',
        whatsappUsers: 'व्हाट्सएप किसान',
        loadingMap: 'किसान गतिविधि मैप लोड हो रहा है...',
        noLocationsYet: 'अभी तक कोई स्थान नहीं — किसानों के GPS साझा करने की प्रतीक्षा है',
        locationInstruction: 'जब किसान ऐप पर "स्थान की अनुमति दें" पर क्लिक करते हैं या व्हाट्सएप के माध्यम से साझा करते हैं तो स्थान दिखाई देते हैं'
      },
      callHistory: {
        pageTitle: 'AI वॉयस कॉल इतिहास',
        subtitle: 'किसानों के साथ वॉयस बातचीत के ट्रांसक्रिप्ट और सारांश।',
        noCalls: 'अभी तक कोई वॉयस कॉल रिकॉर्ड नहीं की गई है।',
        noCallsDesc: 'आपके AI सहायक को कॉल करने वाले किसान यहां अपने आप दिखाई देंगे।',
        searchPlaceholder: 'फ़ोन या सारांश खोजें...',
        errorLoading: 'डेटा लोड करने में त्रुटि',
        tryAgain: 'पुનः प्रयास करें',
        callId: 'कॉल ID',
        phone: 'फ़ोन नंबर',
        duration: 'अवधि',
        time: 'समय',
        summary: 'सारांश',
        summaryUnavailable: 'सारांश उपलब्ध नहीं है।',
        transcript: 'पूरा ट्रांसक्रिप्ट',
        viewTranscript: 'ट्रांसक्रिप्ट देखें',
        sec: 'सेकंड',
        min: 'मिनट',
        unknown: 'अज्ञात',
        close: 'बंद करें',
        transcriptSoon: 'ट्रांसक्रिप्ट टेक्स्ट जल्द ही आ रहा है...'
      }
    }
  },
  testimonialData: [
    {
      name: "रमेश कुमार", loc: "पंजाब",
      rev: "KrishiAI ने मेरी कटाई से ठीक पहले बारिश की सटीक भविष्यवाणी की थी। इसने मेरे लाखों रुपये बचा लिए। WhatsApp इंटरफ़ेस मेरे लिए बहुत आसान है।",
    },
    {
      name: "सुनीता देवी", loc: "महाराष्ट्र",
      rev: "मैं अपने टमाटरों की फोटो खींचती हूं और 2 सेकंड के भीतर यह मुझे बता देता है कि कौन सा उर्वरक उपयोग करना है। PM-KISAN फंड पाने में भी मदद मिली।",
    },
    {
      name: "महेश पटेल", loc: "गुजरात",
      rev: "हर सुबह मंडी भाव चेक करना एक आदत बन गई है। अब मैं KrishiAI बॉट की मदद से स्थानीय खरीदारों के साथ बेहतर बातचीत करता हूं।",
    }
  ],
  faqData: [
    {
      question: "AI फसल रोगों का पता कैसे लगाता है?",
      answer: "आप बस संक्रमित फसल के हिस्से की फोटो खींचकर हमारे WhatsApp नंबर पर भेजें। हमारे प्रशिक्षित कंप्यूटर विजन मॉडल दृश्य लक्षणों (जैसे धब्बे, मुरझाना या मलिनकिरण) का विश्लेषण करते हैं और उपचार सिफारिशों के साथ निदान प्रदान करते हैं।"
    },
    {
      question: "क्या मुझे स्मार्टफोन या हाई-स्पीड इंटरनेट की आवश्यकता है?",
      answer: "KrishiAI को सुलभ बनाने के लिए डिज़ाइन किया गया है। जबकि हमारे दृश्य निदान के लिए इमेज अपलोड की आवश्यकता होती है, हमारी अधिकांश बाजार और मौसम सेवाएं बुनियादी WhatsApp कनेक्शन पर पूरी तरह से काम करती हैं।"
    },
    {
      question: "KrishiAI किन भाषाओं में उपलब्ध है?",
      answer: "हम अंग्रेजी, हिंदी, पंजाबी, मराठी, तेलुगु, तमिल, बंगाली और अन्य सहित 15+ भाषाओं का समर्थन करते हैं। AI पहली बातचीत के दौरान स्वचालित रूप से आपकी भाषा प्राथमिकता का पता लगा लेता है।"
    },
    {
      question: "क्या KrishiAI वाकई किसानों के लिए मुफ्त है?",
      answer: "हाँ! हमारी मुख्य स्वास्थ्य और मूल्य सेवाएं व्यक्तिगत किसानों के लिए 100% मुफ्त हैं। हमारा मानना है कि कृषि ज्ञान तक पहुंच एक मौलिक अधिकार है, विलासिता नहीं।"
    },
    {
      question: "क्या मेरा फार्म डेटा सुरक्षित है?",
      answer: "बिल्कुल। हम सख्त डेटा गोपनीयता प्रोटोकॉल का पालन करते हैं। आपके फार्म का स्थान और व्यक्तिगत विवरण केवल मौसम और मंडी भाव जैसी सेवाएं प्रदान करने के लिए उपयोग किए जाते हैं।"
    }
  ],
  privacy: {
    title: 'गोपनीयता नीति',
    accent: 'नीति',
    legal: 'कानूनी',
    subtitle: 'हम आपकी गोपनीयता का सम्मान करते हैं। यह नीति बताती है कि हम कौन सा डेटा एकत्र करते हैं, क्यों करते हैं, और इसकी सुरक्षा कैसे करते हैं।',
    lastUpdated: 'अंतिम अपडेट: मार्च 2026',
    backHome: 'होम पर वापस जाएं',
    summary: [
      { id: 1, icon: '🔒', title: 'डेटा बेचना मना है', desc: 'हम आपका व्यक्तिगत डेटा कभी भी विज्ञापनदाताओं या तीसरे पक्षों को नहीं बेचते हैं।' },
      { id: 2, icon: '🆓', title: 'मुफ्त सेवा', desc: 'KrishiAI पूरी तरह से मुफ्त है। कोई भुगतान डेटा कभी एकत्र नहीं किया जाता है।' },
      { id: 3, icon: '🇮🇳', title: 'भारत-प्रथम', desc: 'भारतीय कानून द्वारा शासित और भारतीय किसानों के लिए डिज़ाइन किया गया।' },
    ],
    toc: 'विषय सूची',
    footerNote: 'आपकी गोपनीयता हमारे लिए महत्वपूर्ण है। KrishiAI किसानों द्वारा, किसानों के लिए बनाया गया है — हम आपके डेटा की रक्षा उतनी ही सावधानी से करते हैं जितनी आप अपनी फसल की करते हैं।',
    termsLink: 'सेवा की शर्तें',
    sections: [
      {
        id: 'information-collected',
        title: '1. जानकारी जो हम एकत्र करते हैं',
        content: `KrishiAI आपको उच्च गुणवत्ता वाला कृषि सहायता अनुभव प्रदान करने के लिए आवश्यक न्यूनतम जानकारी एकत्र करता है:\n\n• चैट संदेश और प्रश्न: आपके द्वारा भेजे गए प्रश्नों को उत्तर उत्पन्न करने के लिए प्रोसेस किया जाता है।\n\n• चित्र और मीडिया: विश्लेषण के लिए आपके द्वारा अपलोड की गई फसलों या रोगों की तस्वीरें।\n\n• स्थान डेटा: यदि आप साझा करते हैं, तो हम इसका उपयोग स्थानीय मौसम और मंडी भाव प्रदान करने के लिए करते हैं।\n\n• उपयोग डेटा: उपयोगकर्ता अनुभव को बेहतर बनाने के लिए गुमनाम डेटा।`,
      },
      {
        id: 'how-we-use',
        title: '2. हम आपकी जानकारी का उपयोग कैसे करते हैं',
        content: `एकत्र की गई जानकारी का उपयोग विशेष रूप से किया जाता है:\n\n• Generate accurate, contextual agricultural advice and responses\n• Provide localized market prices, weather, and farming recommendations\n• Improve the accuracy and capabilities of our AI models (using anonymized, aggregated data)\n• Respond to support requests and user feedback\n• Detect and prevent misuse of the Service\n• Send important Service updates (only if you opt in)\n\nWe do NOT use your data for:\n• Targeted advertising\n• Selling to third-party marketing companies\n• Building personal profiles for non-agricultural purposes\n• Political or commercial profiling`,
      },
      {
        id: 'data-sharing',
        title: '3. डेटा साझाकरण और तीसरे पक्ष',
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
    title: 'नियम और शर्तें',
    accent: 'शर्तें',
    legal: 'कानूनी',
    subtitle: 'KrishiAI का उपयोग करने से पहले कृपया इन शर्तों को ध्यान से पढ़ें। हमारी मुफ्त कृषि AI सेवा का उपयोग करके, आप इन शर्तों से सहमत होते हैं।',
    lastUpdated: 'अंतिम अपडेट: मार्च 2026',
    backHome: 'होम पर वापस जाएं',
    toc: 'विषय सूची',
    footerNote: "KrishiAI भारत के किसान समुदाय के लिए प्यार से बनाई गई एक मुफ्त सेवा है। ये शर्तें आपकी और हमारी दोनों की सुरक्षा के लिए हैं।",
    privacyLink: 'गोपनीयता नीति',
    freeAccess: {
      title: 'मुफ्त पहुंच',
      content: 'KrishiAI किसानों के लिए 100% मुफ्त उपकरण है। हम कोई श्लुक नहीं लेते हैं।'
    },
    informationalOnly: {
      title: 'केवल सूचनात्मक',
      content: 'AI सलाह को सत्यापित किया जाना चाहिए। हम परिणामों के लिए उत्तरदायी नहीं हैं।'
    },
    sections: [
      {
        id: 'acceptance',
        title: '1. शर्तों की स्वीकृति',
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
    ]
  },
  voiceAssistant: {
    title: "वॉयस असिस्टेंट",
    subtitle: "एंटरप्राइज-ग्रेड कृषि इंटेलिजेंस",
    statusInactive: "मदद के लिए तैयार",
    statusLoading: "सुरक्षित लिंक स्थापित कर रहा है...",
    statusActive: "KrishiAI सक्रिय है",
    startCall: "बातचीत शुरू करें",
    stopCall: "बातचीत समाप्त करें",
    listening: "सुन रहा हूँ...",
    speaking: "बोल रहा हूँ...",
    mute: "म्यूट करें",
    unmute: "अनम्यूट करें"
  },
  whatsappPage: {
    title: "WhatsApp बॉट SDK",
    subtitle: "मल्टी-चैनल वॉयस और टेक्स्ट सपोर्ट",
    heroTitle: "एकीकृत संचार",
    heroHeading: "WhatsApp {botSDK}",
    botSDK: "बॉट SDK",
    heroDesc: "दुनिया की सबसे शक्तिशाली कृषि इंटेलिजेंस, अब सीधे वहां पहुंचाई जा रही है जहां किसान पहले से ही संवाद करते हैं।",
    heroCardTitle: "KrishiAI WhatsApp बॉट",
    heroCardSubtitle: "आपकी जेब में खेती सलाहकार",
    heroCardDesc: "अपने WhatsApp के अंदर पूर्ण KrishiAI इंटेलिजेंस का अनुभव करें। कोई ऐप डाउनलोड करने की आवश्यकता नहीं है। वॉयस, टेक्स्ट और इमेज पहचान के साथ 8 भारतीय भाषाओं में सहजता से काम करता है।",
    btnChat: "WhatsApp पर चैट करें",
    tabs: {
      features: "सभी विशेषताएं",
      algorithm: "यह कैसे काम करता है",
      languages: "भाषाएं",
      inputs: "इनपुट गाइड"
    },
    featureListTitle: "परिनियोजन विशेषताएं",
    modulesCount: "8 मॉडयूल",
    whatToSend: "उपयोगकर्ता को क्या भेजने की आवश्यकता है",
    supportedLangs: "समर्थित भाषाएं",
    botName: "KrishiAI बॉट",
    statusOnline: "ऑनलाइन",
    globalReachTitle: "वैश्विक पहुंच",
    globalReachDesc: "आधिकारिक WhatsApp बिजनेस एपीआई इंफ्रास्ट्रक्चर का उपयोग करके 12,000+ गांवों में तैनात।",
    agentIntelTitle: "एजेंट इंटेलिजेंस",
    agentIntelDesc: "जटिल फसल विश्लेषण के लिए लीमा-3.1 और जेमिनी प्रो विजन द्वारा संचालित। 99.9% अपटाइम।",
    techStackHeader: "तकनीकी स्टैक",
    processMessagesTitle: "हम लाखों कृषि संदेशों को कैसे संसाधित करते हैं",
    liveDashboard: "लाइव स्टेटस डैशबोर्ड",
    latency: "विलंबता",
    accuracy: "सटीकता",
    latencyDesc: "टेक्स्ट प्रश्नों के लिए औसत प्रतिक्रिया समय।",
    accuracyDesc: "वॉयस मैसेज ट्रांसक्रिप्शन और इरादा पहचान।",
    lingueIntelTitle: "भाषाई बुद्धिमत्ता",
    dialectsCount: "8 बोलियाँ समर्थित",
    sendToStart: 'शुरू करने के लिए "{num}" भेजें',
    naturalLanguageTip: "KrishiAI को प्राकृतिक कृषि भाषा को समझने के लिए डिज़ाइन किया गया है। आपको स्वरूपित आदेशों की आवश्यकता नहीं है। बस वैसे ही बोलें या लिखें जैसे आप किसी मानव विशेषज्ञ से बात कर रहे हों।",
    features: {
      weather: {
        title: "मौसम का पूर्वानुमान",
        desc: "खेती की सलाह के साथ वास्तविक समय का मौसम + 5-दिन का पूर्वानुमान",
        inputs: ["स्थान (जीपीएस या शहर का नाम)", "\"मौसम कैसा है?\""],
        exampleUser: "मौसम का पूर्वानुमान क्या है?",
        exampleBot: "🌤 *प्रीमियम मौसम रिपोर्ट: अहमदाबाद*\n\n🌡 *तापमान:* 34°C (महसूस 38°C)\n💧 *नमी:* 45%\n💨 *हवा:* 12 किमी/घंटा\n🌅 *सूर्યોदय:* 6:15 AM\n🌇 *सूर्यास्त:* 7:02 PM\n\n💡 *खेती की सलाह:*\n*आज कीटनाशकों का छिड़काव करना सुरक्षित है — कम हवा.*\n*वाष्पीकरण कम करने के लिए शाम को सिंचाई करें।*"
      },
      crop_advice: {
        title: "फसल परामर्श",
        desc: "एनपीके खुराक, कीट नियंत्रण, सिंचाई कार्यक्रम",
        inputs: ["फसल का नाम", "मिट्टी का प्रकार (वैकल्पिक)", "समस्या का विवरण"],
        exampleUser: "मेरे टमाटर के पत्तों पर पीले धब्बे हैं",
        exampleBot: "🍅 *टमाटर पत्ती विश्लेषण*\n\nपीले धब्बे *अर्ली ब्लाइट (Alternaria solani)* का संकेत देते हैं\n\n✅ *तत्काल कार्रवाई:*\n• प्रभावित पत्तियों को हटा दें\n• *मैनकोजेब 75% डब्ल्यूपी* @ 2 ग्राम/लीटर लगाएं\n• 3 चक्रों के लिए हर 7 दिनों में स्प्रे करें\n\n💧 *निवारण:*\n• ओवरहेड सिंचाई से बचें\n• पौधों की दूरी 60 सेमी बनाए रखें"
      },
      disease: {
        title: "रोग पहचान",
        desc: "फसल की फोटो भेजें → AI रोग + उपचार की पहचान करता है",
        inputs: ["फसल की फोटो (कैमरा/गैलरी)", "वैकल्पिक: फसल का नाम"],
        exampleUser: "📷 [रोगग्रस्त पत्ती की फोटो भेजता है]",
        exampleBot: "📷 आपकी फसल की फोटो का विश्लेषण किया जा रहा है...\n\n✅ *विश्लेषण पूर्ण:*\n\n🔍 *रोग:* पाउडर फफूंदी (Powdery Mildew)\n📊 *गंभीरता:* मध्यम (30-40%)\n🌿 *फसल:* ककड़ी/लौकी परिवार\n\n💊 *उपचार:*\n• *सल्फर 80% डब्लूडीजी* @ 3 ग्राम/लीटर का स्प्रे करें\n• जैव-नियंत्रण के रूप में *ट्राइकोडर्मा विरिड* लगाएं\n• गंभीर रूप से प्रभावित पत्तियों को हटा दें"
      },
      voice: {
        title: "वॉयस संदेश",
        desc: "किसी भी भाषा में बोलें → AI ट्रांसक्राइब और जवाब देता है",
        inputs: ["किसी भी समर्थित भाषा में वॉयस नोट"],
        exampleUser: "🎙️ [वॉयस: \"मेरी गेहूं की फसल में क्या खाद डालू?\"]",
        exampleBot: "🎙️ आपके वॉयस मैसेज को प्रोसेस किया जा रहा है...\n\n*गेहूं में खाद की मात्रा:*\n\n🌾 *बुवाई के समय:*\n• DAP: 50 kg/एकड़\n• यूरिया: 25 kg/एकड़\n\n🌱 *पहली सिंचाई पर (21 दिन):*\n• यूरिया: 25 kg/एकड़\n\n💧 *दूसरी सिंचाई पर (45 दिन):*\n• यूरिया: 25 kg/एकड़"
      },
      market: {
        title: "बाजार भाव",
        desc: "सरकारी एपीआई से लाइव एपीएमसी मंडी दरें",
        inputs: ["\"गेहूं का बाजार भाव\"", "\"नासिक में प्याज की दर\""],
        exampleUser: "गुजरात में प्याज की कीमत क्या है?",
        exampleBot: "📊 *लाइव प्याज बाजार भाव — गुजरात*\n\n🏪 *राजकोट एपीएमसी:* ₹1,400/क्विंटल\n🏪 *अहमदाबाद एपीएमसी:* ₹1,350/क्विंटल\n🏪 *सूरत एपीएमसी:* ₹1,500/क्विंटल\n\n📈 *रुझान:* पिछले सप्ताह से ↑ 5% अधिक\n\n💡 *सलाह:* कम आपूर्ति के कारण कीमतें बढ़ रही हैं। यदि गुणवत्ता ग्रेड ए है तो बेचने का अच्छा समय है।"
      },
      location: {
        title: "स्थान इंटेलिजेंस",
        desc: "जीपीएस साझा करें → स्थानीय मौसम, मंडियां, मिट्टी की जानकारी प्राप्त करें",
        inputs: ["WhatsApp अटैचमेंट के जरिए लोकेशन शेयर करें"],
        exampleUser: "📍 [जीपीएस लोकेशन शेयर करता है]",
        exampleBot: "📍 *स्थान प्राप्त हुआ: गोटा, अहमदाबाद*\n\n🌤 *मौसम:* 34°C, आंशिक रूप से बादल छाए रहेंगे\n💧 *नमी:* 48%\n\n🏪 *निकટતમ मंडियां:*\n• अहमदाबाद एपीएमसी (8 किमी)\n• गांधीनगर एपीएमसी (15 किमी)\n\n🌱 *आपके क्षेत्र के लिए सर्वश्रेष्ठ फसलें:*\nकपास, अरंडी, मूंगफली, बाजरा"
      },
      schemes: {
        title: "सरकारी योजनाएं",
        desc: "PM-KISAN, PMFBY, KCC पात्रता और आवेदन सहायता",
        inputs: ["\"मैं किन योजनाओं के लिए पात्र हूं?\"", "\"PM-KISAN के लिए आवेदन कैसे करें?\""],
        exampleUser: "मुझे पीएम-किसान योजना के बारे में बताएं",
        exampleBot: "📜 *पीएम-किसान सम्मान निधि*\n\n💰 *लाभ:* 3 किस्तों में ₹6,000/वर्ष\n👨‍🌾 *पात्र:* खेती योग्य भूमि वाले सभी किसान परिवार\n\n📋 *आवेदन कैसे करें:*\n1. pmkisan.gov.in पर जाएं\n2. \"न्यू फार्मर रजिस्ट्रेशन\" पर क्लिक करें\n3. आधार + बैंक विवरण दर्ज करें\n4. भूमि रिकॉर्ड अपलोड करें\n\n📞 *हेल्पलाइन:* 155261 या 011-24300606"
      },
      yield: {
        title: "उपज की भविष्यवाणी",
        desc: "सिफारिशों के साथ एमएल-आधारित फसल उपज अनुमान",
        inputs: ["फसल का नाम", "क्षेत्र (एकड़/हेक्टेयर)", "सीजन", "उपयोग किया गया उर्वरक"],
        exampleUser: "100 किलो यूरिया के साथ 5 एकड़ गेहूं की उपज की भविष्यवाणी करें",
        exampleBot: "📊 *उपज भविष्यवाणी — गेहूं*\n\n🌾 *क्षेत्र:* 5 एकड़\n📈 *पूर्वानुमानित उपज:* 18.5 क्विंटल\n💰 *अनुमानित राजस्व:* ₹40,700 @ MSP ₹2,200/क्विंटल\n\n✅ *अनुकूलन युक्तियाँ:*\n• +15% उपज के लिए 50 किलो डीएपी जोड़ें\n• महत्वपूर्ण चरणों में 4 सिंचाई सुनिश्चित करें\n• जिंक सल्फेट @ 25 किग्रा/हेक्टेयर लगाएं"
      }
    },
    algorithm: [
      { num: "1", title: "उपयोगकर्ता \"नमस्ते\" भेजता है", desc: "अभिवादन पहचाना गया → भाषा मेनू दिखाया गया (8 भाषाएँ)", icon: "👋" },
      { num: "2", title: "भाषा चुनी गई", desc: "उपयोगकर्ता 1-8 चुनता है → प्राथमिकता सत्र में सहेजी गई", icon: "🌐" },
      { num: "3", title: "संदेश प्राप्त हुआ", desc: "पाठ / फोटो / वॉयस / स्थान का विश्लेषण किया गया", icon: "📨" },
      { num: "4", title: "भाषा स्व-पहचान", desc: "यूनिकोड स्क्रिप्ट पहचान (देवनागरी, गुजराती, तमिल...)", icon: "🔍" },
      { num: "5", title: "इरादा रूटिंग", desc: "मौसम? रोग? बाजार? योजना? → सेवा पर रूट करें", icon: "🧠" },
      { num: "6", title: "डेटा प्राप्त करें", desc: "सरकारी एपीआई / मौसम एपीआई / एमएल मॉडल / विजन एआई को कॉल किया गया", icon: "📡" },
      { num: "7", title: "AI प्रतिक्रिया", desc: "Groq LLM उपयोगकर्ता की भाषा में उत्तर तैयार करता है", icon: "🤖" },
      { num: "8", title: "WhatsApp उत्तर", desc: "मेटा/ट्विलियो एपीआई के माध्यम से स्वरूपित संदेश भेजा गया", icon: "✅" }
    ]
  },
  platformFeatures: {
    badge: 'प्लेटफॉर्म क्षमताएं',
    titleMain: 'एक संपूर्ण',
    titleAccent: 'AI टूलकिट',
    subtitle: 'बुवाई से पहले मिट्टी की तैयारी से लेकर कटाई के बाद की बिक्री तक, KrishiAI आपकी जेब में 360-डिग्री सहायता प्रदान करता है।',
    items: {
      satellite: {
        title: 'सैटेलाइट NDVI',
        desc: 'सैटेलाइट इमेजरी का उपयोग करके रीयल-टाइम फसल स्वास्थ्य निगरानी। पौधों की शक्ति और नमी के स्तर को गतिशील रूप से ट्रैक करें।'
      },
      pest: {
        title: 'कीट पहचान',
        desc: 'त्वरित उपचार नुस्खे प्राप्त करने के लिए AI के साथ संक्रमित पत्तियों को स्कैन करें।'
      },
      mandi: {
        title: 'मंडी खोज',
        desc: 'प्रत्येक स्थानीय मंडी में वास्तविक समय की दरों को दिखाने वाला इंटरैक्टिव जियो-मैप।'
      },
      weather: {
        title: 'इको-वेदर',
        desc: 'आपके स्थान के 500 मीटर तक की सटीकता के साथ हाइपर-लोकल पूर्वानुमान।'
      },
      subsidies: {
        title: 'सरकारी सब्सिडी',
        desc: 'PM-KISAN, बीज और उर्वरक सब्सिडी के लिए स्मार्ट पात्रता ट्रैकर।'
      },
      multilingual: {
        title: 'बहुभाषी AI',
        desc: 'वॉयस चैट के माध्यम से मराठी, गुजराती और हिंदी सहित 15+ भारतीय बोलियों में संवाद करें।'
      }
    }
  }
};
