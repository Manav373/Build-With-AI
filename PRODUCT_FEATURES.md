# KrishiAI: Product Features & User Flows

---

## 📋 Table of Contents
1. [Core Features Overview](#core-features-overview)
2. [Feature 1: Smart Crop Recommendation](#feature-1-smart-crop-recommendation)
3. [Feature 2: Real-time Weather & Irrigation](#feature-2-real-time-weather--irrigation)
4. [Feature 3: Multimodal Disease Diagnostics](#feature-3-multimodal-disease-diagnostics)
5. [Feature 4: Hyper-Local Mandi Mapping](#feature-4-hyper-local-mandi-mapping)
6. [Feature 5: Community Knowledge Hub](#feature-5-community-knowledge-hub)
7. [Rythu Seva Kendra Expert Dashboard](#rythu-seva-kendra-expert-dashboard)
8. [User Journey Maps](#user-journey-maps)
9. [Use Cases](#use-cases)
10. [Feature Roadmap](#feature-roadmap)

---

## Core Features Overview

### Feature Set Matrix

```
Feature                          Availability    Access Method       Phase
────────────────────────────────────────────────────────────────────────
Smart Crop Recommendation        Phase 1 MVP     Voice + SMS + App   Launch
Weather & Irrigation Advisory    Phase 1 MVP     Voice + SMS + App   Launch
Disease Diagnostics (Photo)      Phase 1 MVP     Voice + WhatsApp    Launch
Disease Diagnostics (Voice)      Phase 1 MVP     Voice Call          Launch
Mandi Price Discovery            Phase 1 MVP     SMS + App           Launch
Expert Consultation              Phase 1 MVP     Firebase Dashboard  Launch
Community Hub (Read)             Phase 1 MVP     App + Web           Launch
Community Hub (Write)            Phase 2         App + Web           3-6m
Drone-Based Farm Imaging         Phase 2+        App (In-App Payment) 9-12m
Guaranteed Market Linkage        Phase 2+        App + SMS           9-12m
Weather-Indexed Crop Insurance   Phase 3         App Integration    12-18m
Soil Health Monitoring (IoT)     Phase 3         App + SMS           12-18m
Personalized Planting Calendar   Phase 1 MVP     SMS + App           Launch
Multi-Language Support (10+)     Phase 2         Voice + SMS + App   3-6m
```

---

## Feature 1: Smart Crop Recommendation

### What It Does
Intelligently recommends the best crops for a farmer based on:
- Real-time soil health data (from government soil cards + satellite imagery)
- Current & forecast weather conditions (7-day microclimate prediction)
- Market prices in nearby mandis (profitability analysis)
- Farmer's crop history (avoid fatigue, plan rotation)
- Water availability (align with irrigation potential)

### User Flow: Voice-Based Query

```
┌─ FARMER SCENARIO ───────────────────────────────────────────┐
│ Ramesh, a cotton farmer in Telangana, is deciding what to   │
│ plant next season. He has 2 hectares. Last year: cotton.    │
│ Soil: Deep black soil, good for groundnut too.              │
│ Concern: Water scarcity, so needs drought-resistant crop.   │
└──────────────────────────────────────────────────────────────┘

Step 1: INITIATION
  ┌─ Farmer's phone buzzes with SMS ─┐
  │ "Hi Ramesh! Planning next crop?  │
  │  Call 1-800-KRISHI-AI for advice"│
  └─────────────────────────────────┘
  
  Ramesh dials 1-800-KRISHI-AI

Step 2: VOICE INTERFACE (IVR)
  ┌─ KrishiAI Bot (in Telugu) ──────────────────┐
  │ "Namaste Ramesh! Welcome to KrishiAI.       │
  │  Press 1: Best crop to plant                │
  │  Press 2: Disease help                      │
  │  Press 3: Water advice"                     │
  └────────────────────────────────────────────┘
  
  Ramesh presses 1

Step 3: CONTEXT GATHERING
  ┌─ KrishiAI Bot ──────────────────────────────┐
  │ "Tell me about your land.                   │
  │  What did you grow last year?"              │
  └────────────────────────────────────────────┘
  
  Ramesh (in Telugu): "Cotton kar rahu hu, lekin paani km hai"
  (Translation: "Growing cotton, but water is scarce")

Step 4: BACKEND PROCESSING (Fast Track - 2.5 seconds)
  
  ┌─ FastAPI Backend ──────────────────────────────────────┐
  │                                                         │
  │ 1. Farmer Context Retrieval (100ms)                    │
  │    └─ farmer_id: Ramesh (₹123456)                     │
  │    └─ GPS: 17.36° N, 78.47° E (Hyderabad, TG)        │
  │    └─ Farm size: 2 hectares                           │
  │    └─ Crop history: [Cotton, Cotton, Sugarcane]       │
  │    └─ Soil card: Black soil, pH 7.5, good drainage   │
  │                                                         │
  │ 2. Blink Engine Fast Track (1500ms)                   │
  │    └─ Current NDVI (from cache): 0.45 (moderate)     │
  │    └─ Weather forecast (from API):                   │
  │       └─ June-July: 600mm rainfall (good)            │
  │       └─ July-Sept: Hot + 200mm rainfall              │
  │       └─ Water stress: Moderate-High                 │
  │    └─ Soil moisture (from SMAP satellite):           │
  │       └─ Current: 35% (below optimal 60%)            │
  │       └─ Prediction: Improve with monsoon            │
  │                                                         │
  │ 3. Mandi Prices (Cached - 200ms)                     │
  │    └─ Cotton: ₹4,500/quintal (market oversupply)    │
  │    └─ Groundnut: ₹6,000/quintal (good demand)        │
  │    └─ Soybean: ₹4,800/quintal (stable)               │
  │    └─ Chick Pea: ₹5,200/quintal (stable)             │
  │                                                         │
  │ 4. Gemini Reasoning (800ms) ─ Why This Crop?        │
  │    └─ Query to Gemini:                               │
  │       "Farmer: Black soil, 2 hectares, Telangana.   │
  │        Rainfall: 600mm next quarter.                 │
  │        Water: Moderate stress.                       │
  │        Market: Cotton oversupply (low price).        │
  │        History: Avoid cotton fatigue (grown 3 yrs).  │
  │        Goal: Drought-resistant, profitable.          │
  │        Top 3 crop recommendations?"                  │
  │                                                         │
  │    Gemini Response (0.3s):                           │
  │    ┌─────────────────────────────────────────────┐  │
  │    │ Recommendation 1: GROUNDNUT                 │  │
  │    │ ├─ Compatibility: 95% (perfect for soil)    │  │
  │    │ ├─ Profitability: ₹1,20,000 profit/hectare │  │
  │    │ │  (₹6,000/quintal × 2 quintal/hectare)    │  │
  │    │ ├─ Water need: 600mm (matches forecast)     │  │
  │    │ ├─ Drought tolerance: Excellent            │  │
  │    │ ├─ Market demand: High (only 8M tons used)  │  │
  │    │ └─ Risk: Low (stable crop)                  │  │
  │    │                                              │  │
  │    │ Recommendation 2: SOYBEAN                   │  │
  │    │ ├─ Compatibility: 85% (good for soil)       │  │
  │    │ ├─ Profitability: ₹96,000 profit/hectare    │  │
  │    │ │  (₹4,800/quintal × 2 quintal/hectare)    │  │
  │    │ ├─ Water need: 600-700mm (good fit)         │  │
  │    │ ├─ Drought tolerance: Good                  │  │
  │    │ ├─ Market demand: Medium (growing)          │  │
  │    │ └─ Risk: Low-Medium (emerging market)        │  │
  │    │                                              │  │
  │    │ Recommendation 3: CHICK PEA (Rabi season)    │  │
  │    │ ├─ Compatibility: 80% (suitable for soil)    │  │
  │    │ ├─ Profitability: ₹1,04,000 profit/hectare  │  │
  │    │ │  (₹5,200/quintal × 2 quintal/hectare)    │  │
  │    │ ├─ Water need: 400mm (drought proof!)       │  │
  │    │ ├─ Season: Rabi (Oct-Jan) after monsoon     │  │
  │    │ ├─ Market demand: Good (exports)             │  │
  │    │ └─ Risk: Medium (price volatility)          │  │
  │    └─────────────────────────────────────────────┘  │
  │                                                         │
  │ Total Processing Time: 2.5 seconds                    │
  └─────────────────────────────────────────────────────────┘

Step 5: VOICE RESPONSE (Text-to-Speech)
  
  ┌─ KrishiAI Voice Response (in Telugu) ──────────────┐
  │                                                     │
  │ "Namaste Ramesh! Based on your soil, water        │
  │  availability, and market prices, here are my      │
  │  top 3 recommendations:                            │
  │                                                     │
  │  NUMBER 1: GROUNDNUT (MOONGFALI)                   │
  │  ├─ This is PERFECT for your black soil            │
  │  ├─ You'll earn ₹1,20,000 in profit                │
  │  ├─ Needs exactly the water you'll get (600mm)     │
  │  ├─ Survives drought better than cotton            │
  │  └─ Price is strong right now at ₹6,000/quintal    │
  │                                                     │
  │  NUMBER 2: SOYBEAN                                 │
  │  ├─ Also very good for your soil                   │
  │  ├─ You'll earn ₹96,000 in profit                  │
  │  ├─ Demand is growing (new market)                 │
  │  └─ Low water needs (good for scarcity)            │
  │                                                     │
  │  NUMBER 3: CHICK PEA                               │
  │  ├─ Plant after monsoon (Oct-Jan)                  │
  │  ├─ Extreme drought tolerance                      │
  │  ├─ Export demand = steady prices                  │
  │  └─ You'll earn ₹1,04,000 profit                   │
  │                                                     │
  │  MY SUGGESTION: Plant GROUNDNUT (Kharif)           │
  │  + CHICK PEA (Rabi). This gives you TWO crops,     │
  │  better profit, and spreads your risk.             │
  │                                                     │
  │  Want me to send SMS with detailed growing         │
  │  instructions? Press 1 for Yes, 2 for No."         │
  └─────────────────────────────────────────────────────┘
  
  Ramesh presses 1

Step 6: SMS FOLLOW-UP
  
  ┌─ SMS to Ramesh ──────────────────────────────────┐
  │ KrishiAI Alert:                                  │
  │ Crop: GROUNDNUT (MOONGFALI)                      │
  │ Best soil temp: 25-28°C                          │
  │ Sowing time: June-July (10-20 days)              │
  │ Water needed: 600mm (rainwater sufficient)        │
  │ Fertilizer: 20-20-20 NPK (₹1500 for 2 hectares)  │
  │ Disease watch: No major risks this season        │
  │ Expected yield: 4 quintals/hectare = 8 quintals  │
  │ Expected profit: ₹1,20,000 (at ₹6000/quintal)    │
  │ Next update: June 15 (sowing recommendation)      │
  │                                                   │
  │ Query? Reply "HELP" or call 1-800-KRISHI-AI      │
  └─────────────────────────────────────────────────────┘

Step 7: FOLLOW-UP ENGAGEMENT (10 days later)
  
  ┌─ Automated SMS Check-in ──────────────────────────┐
  │ KrishiAI Alert:                                  │
  │ Hi Ramesh! Ready to plant groundnut? Weather     │
  │ prediction for June 15-25:                        │
  │ ├─ Rainfall: 60-80mm (GOOD for sowing)           │
  │ ├─ Temperature: 27-32°C (ideal)                  │
  │ ├─ Wind: Light (good for germination)            │
  │ │                                                 │
  │ │ ACTION: Sow seeds NOW (June 15-20)             │
  │ │ Nearest input shop (2km): XYZ Seeds             │
  │ │ Price: ₹500/kg (market rate)                   │
  │ │                                                 │
  │ │ Worried about cost? Apply for ₹20k subsidy     │
  │ │ (SMS "SUBSIDY" for form)                       │
  │ │                                                 │
  │ │ Weather forecast: Reply "MORE" for 7-day       │
  │ └─ Reply "DONE" once you've planted               │
  └─────────────────────────────────────────────────────┘
```

### Output Format

#### Via Voice
```
Duration: 2-3 minutes
Structure:
  1. Greeting + context acknowledgment (15 seconds)
  2. Top recommendation + rationale (45 seconds)
  3. #2 & #3 recommendations + quick comparison (60 seconds)
  4. Overall strategy suggestion (30 seconds)
  5. Call-to-action (SMS follow-up + next steps) (15 seconds)
```

#### Via SMS
```
Format: Concise, actionable, local language

Example:
"KrishiAI: Top crop: MOONGFALI. Profit: ₹120K. 
Sow: June-July. Water: 600mm. Price: ₹6000/quintal. 
Subscribe alerts? Reply YES"
```

#### Via App
```
Visual display:
  ┌─────────────────────────────────────────┐
  │ CROP RECOMMENDATION                     │
  │                                         │
  │ [1] GROUNDNUT (MOONGFALI) ⭐⭐⭐⭐⭐     │
  │     Compatibility: 95%                  │
  │     Profit estimate: ₹1,20,000          │
  │     Water need: 600mm ✓ Available       │
  │     Market price: ₹6,000/quintal        │
  │                                         │
  │     [More Details] [Set Reminder]       │
  │                                         │
  │ [2] SOYBEAN ⭐⭐⭐⭐                     │
  │     Profit: ₹96,000                     │
  │     [View]                              │
  │                                         │
  │ [3] CHICK PEA (Oct-Jan) ⭐⭐⭐⭐         │
  │     Profit: ₹1,04,000                   │
  │     [View]                              │
  │                                         │
  │ 📍 Show nearby mandis for these crops   │
  │ 💬 Ask community: What's your experience?
  │                                         │
  └─────────────────────────────────────────┘
```

### Success Metrics
```
Metric                          Target      Why Important
────────────────────────────────────────────────────────
Adoption rate                   >60%        Farmers using feature
Query satisfaction (NPS)        >60         Farmers find value
Recommendation follow-through   >40%        Farmers act on advice
Yield improvement (tracked)     +15-20%     Measurable farm impact
Profit improvement              +₹40k/farm  Direct value to farmer
Repeat query frequency          >8/month    Engagement level
Recommendation accuracy         >85%        Fewer bad suggestions
```

---

## Feature 2: Real-time Weather & Irrigation

### What It Does
Provides hyper-local weather forecasts and precision irrigation guidance to help farmers:
- Know exactly when to irrigate (avoid water waste)
- Prepare for extreme weather (droughts, floods)
- Optimize water use (save ₹5-15k per season)
- Improve yields (proper irrigation timing)

### User Flow: SMS-Based Weather Alert

```
┌─ FARMER SCENARIO ───────────────────────────────────────┐
│ Lakshmi grows cotton in Maharashtra. It's July.         │
│ Monsoon is unpredictable this year (climate change).    │
│ Her groundwater level dropped 2m last year.             │
│ Question: "Should I irrigate today or wait for rain?"   │
│ Risk: Over-irrigate = waste water + money               │
│ Risk: Under-irrigate = crop stress + low yield          │
└─────────────────────────────────────────────────────────┘

Step 1: AUTOMATED DAILY CHECK-IN (Sent at 6 AM)

  ┌─ SMS from KrishiAI ─────────────────────────────────┐
  │ "Good Morning Lakshmi! ☀️                           │
  │  Current soil moisture: 45% (moderate)              │
  │  Today's weather:                                   │
  │  ├─ Rain expected: 20-30mm (afternoon)              │
  │  ├─ Temperature: 28-32°C                            │
  │  ├─ Wind: Light                                     │
  │                                                      │
  │  💧 IRRIGATION ADVICE: WAIT FOR RAIN                │
  │  Why? Rainfall will increase moisture to 65%         │
  │  Saving you: ₹500 water cost + 50,000 liters water  │
  │                                                      │
  │  Next update: Tomorrow 6 AM                          │
  │  Reply HELP for more details"                       │
  └─────────────────────────────────────────────────────┘

Step 2: SCENARIO - UNEXPECTED DRY SPELL (Day 3)

  ┌─ SMS Alert (Sent 2 PM) ─────────────────────────────┐
  │ "⚠️ DRY SPELL WARNING                               │
  │                                                      │
  │  Expected: 30mm rain today                          │
  │  Actual: Only 5mm fell (drought developing)         │
  │  Soil moisture: Now dropped to 35% (LOW)            │
  │  Cotton stage: Flowering (critical growth phase)    │
  │                                                      │
  │  🚨 ACTION NEEDED:                                  │
  │  ├─ Irrigate TODAY (evening preferred)              │
  │  ├─ Water amount: 25mm (₹1000 cost)                │
  │  ├─ Method: Drip irrigation (if available)          │
  │  ├─ Timing: After 6 PM (cooler, less evaporation)   │
  │  ├─ Duration: 3-4 hours for 2 hectares              │
  │                                                      │
  │  Next forecast: Tomorrow 6 AM (may need 2nd irrigation)
  │  Cost: ₹1000 today vs ₹5000 if you wait too long    │
  │  Risk: Delayed irrigation = 20% yield loss          │
  │                                                      │
  │  Reply YES once irrigated (help us improve)         │
  └─────────────────────────────────────────────────────┘

Step 3: VOICE CALL OPTION (For urgent questions)

  If Lakshmi calls 1-800-KRISHI-AI:
  
  ┌─ IVR Menu ──────────────────────────────────────────┐
  │ "Hi Lakshmi! What do you need?                      │
  │  Press 1: Water advice (for today)                  │
  │  Press 2: 7-day weather forecast                    │
  │  Press 3: Irrigation schedule (next 14 days)        │
  │  Press 4: Drought preparedness plan"                │
  └─────────────────────────────────────────────────────┘
  
  Lakshmi presses 1
  
  ┌─ KrishiAI Voice Response ────────────────────────────┐
  │ "Hi Lakshmi! Based on your soil moisture (35%),     │
  │  cotton growth stage (flowering), and the dry spell,│
  │  I recommend:                                       │
  │                                                      │
  │  Irrigate TODAY (evening)                           │
  │  Amount: 25mm (25 inches per hectare)               │
  │  Duration: 3-4 hours                                │
  │  Cost: About ₹1000                                  │
  │  Savings vs overwatering: ₹4000                     │
  │                                                      │
  │  Next irrigation: Check in 7 days (if no rain)      │
  │  Or call back tomorrow for updated forecast.        │
  │                                                      │
  │  Want SMS reminder at 5 PM today? Press 1 for Yes"  │
  └─────────────────────────────────────────────────────┘

Step 4: APP INTERFACE - DETAILED IRRIGATION SCHEDULE

  ┌─ KrishiAI Mobile App ───────────────────────────────┐
  │ 💧 IRRIGATION PLANNER                               │
  │                                                      │
  │ Current Soil Moisture: [45%]████████░░               │
  │ Optimal Range: [55-70%]                              │
  │ Status: MODERATE (irrigation may be needed soon)    │
  │                                                      │
  │ ┌─ 7-DAY FORECAST & IRRIGATION PLAN ─────────────┐  │
  │ │                                                 │  │
  │ │ Day 1 (Today - July 15)                        │  │
  │ │ ├─ Rain: 20-30mm afternoon                     │  │
  │ │ ├─ Soil moisture trend: 45% → 60% (no irrig)  │  │
  │ │ ├─ Action: WAIT FOR RAIN ✓                    │  │
  │ │ └─ Savings: ₹500 water cost                   │  │
  │ │                                                 │  │
  │ │ Day 2 (July 16)                               │  │
  │ │ ├─ Rain: 5-10mm (light)                       │  │
  │ │ ├─ Soil moisture trend: 60% → 50% (evaporation) │  │
  │ │ ├─ Action: WAIT ONE MORE DAY                  │  │
  │ │ └─ Soil: Still adequate                       │  │
  │ │                                                 │  │
  │ │ Day 3 (July 17) ⚠️ DRY SPELL                  │  │
  │ │ ├─ Rain: 0mm (unexpected!)                    │  │
  │ │ ├─ Soil moisture: 45% → 35% (LOW)             │  │
  │ │ ├─ Action: IRRIGATE TODAY (evening) 🚨        │  │
  │ │ ├─ Amount: 25mm                               │  │
  │ │ ├─ Cost: ₹1000                                │  │
  │ │ └─ Duration: 3-4 hours                        │  │
  │ │                                                 │  │
  │ │ Day 4-7: Continue monitoring (next rain: 5mm) │  │
  │ │ ├─ If rain doesn't come: Irrigate Day 10      │  │
  │ │ └─ Soil will need: 20mm (₹800)                │  │
  │ │                                                 │  │
  │ │ 💰 14-Day WATER BUDGET:                        │  │
  │ │ ├─ Total cost (optimal): ₹1,800               │  │
  │ │ ├─ vs Standard practice: ₹4,500                │  │
  │ │ ├─ SAVINGS: ₹2,700 (60% less water)            │  │
  │ │ └─ Water conserved: 2,70,000 liters            │  │
  │ │                                                 │  │
  │ └─────────────────────────────────────────────────┘  │
  │                                                      │
  │ 🌾 GROWTH STAGE MONITOR                             │
  │ Crop: Cotton (Planted: April 15)                    │
  │ Current stage: FLOWERING (critical)                 │
  │ Stage details:                                      │
  │ ├─ Duration: June 15 - July 31                     │
  │ ├─ Water need: 4mm/day (60mm total this stage)     │
  │ ├─ Soil moisture: Keep 55-70% (flowering sensitive) │
  │ ├─ Risk if under-watered: 20% yield loss           │
  │ └─ Critical period: NEXT 7 DAYS                    │
  │                                                      │
  │ [Set Reminder] [View Full Schedule] [Share with Expert]
  │                                                      │
  └─────────────────────────────────────────────────────┘

Step 5: EXTREME WEATHER ALERT (Proactive)

  ┌─ SMS: Flood Risk Alert ─────────────────────────────┐
  │ "🌊 FLOOD WARNING - Telangana                       │
  │                                                      │
  │  Heavy monsoon developing (forecast: 80-100mm)     │
  │  Risk: Flash flooding in low-lying areas            │
  │                                                      │
  │  Your farm (Hyderabad, 17.36°N):                    │
  │  ├─ Elevation: 500m (SAFE from flooding)            │
  │  ├─ Drainage: Good (water will drain away)          │
  │  ├─ Recommendation: PREPARE but LOW RISK            │
  │                                                      │
  │  Safety steps:                                      │
  │  ├─ DO clear field drains (20-30cm deep trenches)   │
  │  ├─ DO NOT plant on waterlogged areas               │
  │  ├─ Store seeds/fertilizer on raised ground         │
  │  └─ Avoid soil erosion (use barriers)               │
  │                                                      │
  │  Next update: July 18 (as storm approaches)         │
  │  Helpline: 1-800-KRISHI-AI                          │
  │                                                      │
  │  Your insurance: Activate weather insurance?        │
  │  (Heavy rain = payout if crop damaged)              │
  │  Reply INSURE for details"                          │
  └─────────────────────────────────────────────────────┘
```

### Output Formats

#### Via SMS (Daily)
```
Format: Concise, 160 chars
Time: 6 AM (before farmer wakes, has whole day to plan)

Example:
"KrishiAI: Today 20-30mm rain expected. Soil: 45% ✓ 
Don't irrigate (save ₹500). Next check: Tomorrow 6 AM"
```

#### Via Voice (On-demand)
```
Format: Conversational, 2-3 minute call
Info: Detailed explanation + rationale + next steps
Tone: Friendly, actionable, local language
```

#### Via App (Daily + On-demand)
```
Visuals: 
  - Chart: Soil moisture trend (7-day)
  - Calendar: Irrigation schedule with costs
  - Map: Rainfall distribution across farm parcels
  - Alerts: Color-coded (green/yellow/red)
```

### Success Metrics
```
Metric                          Target      Why Important
────────────────────────────────────────────────────────
Water usage reduction           -25-35%     Primary value prop
Cost savings/farmer/season      ₹5-15k      Direct farmer benefit
Irrigation timing accuracy      >80%        Avoids under/over-water
Farmer alert response rate      >70%        Engagement & adoption
Yield impact (controlled study) +10-15%     Proof of value
Extreme weather prep rate       >60%        Disaster resilience
```

---

## Feature 3: Multimodal Disease Diagnostics

### What It Does
Enables farmers to get instant crop disease diagnosis via:
- **Voice Query:** "My cotton leaves are turning yellow with black spots"
- **Photo Analysis:** Send WhatsApp photo of affected leaf
- **Expert Escalation:** Complex cases sent to Rythu Seva Kendra dashboard for expert review

### Use Case 1: Voice-Based Disease Query

```
┌─ FARMER SCENARIO ───────────────────────────────────┐
│ Ravi, a sugarcane farmer (5 hectares), noticed      │
│ brown spots on his sugarcane leaves. Worried.       │
│ Is it serious? Will entire crop die?               │
│ Can't wait 7 days for agricultural officer visit.   │
│ Needs INSTANT answer.                              │
└─────────────────────────────────────────────────────┘

Step 1: VOICE CALL

  Ravi calls 1-800-KRISHI-AI

Step 2: IVR GREETING

  ┌─ KrishiAI Bot ──────────────────────────────┐
  │ "Hi Ravi! Welcome to KrishiAI Disease Help  │
  │  Tell me: What crop are you growing, and    │
  │  what symptoms do you see?"                 │
  └─────────────────────────────────────────────┘

Step 3: FARMER DESCRIBES SYMPTOMS (Voice)

  Ravi (in Marathi): "Mere sugarcane ke patte par brown
  daaag ban gaye hain, aur dhire dhire phail rahe hain.
  Bahut pareshani ho gai"
  
  Translation: "Brown spots on my sugarcane leaves, 
  spreading slowly. Very worried"

Step 4: BACKEND PROCESSING - MULTIMODAL REASONING

  ┌─ FastAPI Backend ─────────────────────────────────────┐
  │                                                        │
  │ 1. Extract Farmer Context (100ms)                     │
  │    └─ Crop: Sugarcane                                │
  │    └─ GPS: 18.52° N, 73.85° E (Pune, Maharashtra)    │
  │    └─ Farm size: 5 hectares                          │
  │    └─ Planting date: March 2024 (8 months old)       │
  │    └─ Season: Monsoon (high humidity)                │
  │    └─ Recent weather: High humidity + occasional rain │
  │    └─ Symptoms: Brown spots, spreading               │
  │                                                        │
  │ 2. Blink Engine Contextual Data (500ms)               │
  │    └─ Regional disease prevalence:                    │
  │       └─ Leaf spot diseases: HIGH (75% prevalence)    │
  │       └─ Wilt diseases: MEDIUM (35% prevalence)       │
  │       └─ Rust: LOW (10% prevalence)                   │
  │    └─ Similar farms in region:                       │
  │       └─ Disease reports last 30 days: 12 cases      │
  │       └─ Most common: Leaf scald (brown spots)        │
  │                                                        │
  │ 3. Gemini Multimodal Analysis (800ms)                 │
  │    └─ Input to Gemini:                               │
  │       "Farmer describes: Brown spots on sugarcane    │
  │        leaves, spreading. Farm: Pune, 5 hectares.    │
  │        Age: 8 months. Season: Monsoon (humid).       │
  │        Regional context: Leaf scald disease prevalent.│
  │        Question: What is the disease and treatment?" │
  │                                                        │
  │    └─ Gemini Response (text-based, since no photo):  │
  │       ┌────────────────────────────────────────────┐ │
  │       │ Most Likely Disease:                       │ │
  │       │ SUGARCANE LEAF SCALD                       │ │
  │       │ (Caused by Xanthomonas albilineans)         │ │
  │       │                                             │ │
  │       │ Confidence: 75% (based on description)     │ │
  │       │ Why: Brown spots + spreading pattern +     │ │
  │       │       monsoon season + Pune prevalence     │ │
  │       │                                             │ │
  │       │ Alternative possibilities (20%):            │ │
  │       │ ├─ Brown spot (fungal) - 12% probability    │ │
  │       │ └─ Eyespot - 8% probability                │ │
  │       │                                             │ │
  │       │ Severity: MODERATE (not yet critical)      │ │
  │       │ Time before crop loss: 2-3 weeks if untreated
  │       │ Farmer action impact: HIGH (treatment works) │ │
  │       └────────────────────────────────────────────┘ │
  │                                                        │
  │ 4. Escalation Decision Logic (100ms)                  │
  │    └─ Confidence: 75% (>70% threshold? YES)          │
  │    └─ Severity: Moderate (escalate? MAYBE)           │
  │    └─ Treatment known? Yes (standard treatment)       │
  │    └─ Decision: PROVIDE IMMEDIATE ADVICE             │
  │         (Low escalation: only if farmer skeptical)    │
  │                                                        │
  │ 5. Treatment Protocol Lookup (100ms)                  │
  │    └─ Disease: Leaf scald                            │
  │    └─ Treatment:                                      │
  │       ├─ Severity: Moderate                          │
  │       ├─ Immediate action:                           │
  │       │  ├─ Remove affected leaves (10-15%)          │
  │       │  ├─ Spray: Bordeaux mixture 1% or           │
  │       │  │         Copper sulfate 0.5%              │
  │       │  ├─ Timing: Evening (after 6 PM)             │
  │       │  └─ Repeat: Every 10 days (3 sprays total)   │
  │       │                                               │
  │       ├─ Expected outcome:                           │
  │       │  ├─ If done now: 80% crop saved              │
  │       │  ├─ Cost: ₹2000-3000 for chemicals           │
  │       │  ├─ Time: 1-2 hours for removal + spray       │
  │       │  └─ Yield loss (if treated): <5% (acceptable)│
  │       │                                               │
  │       ├─ Risk if untreated:                          │
  │       │  ├─ Crop loss: 40-60% (severe)              │
  │       │  ├─ Timeline: 2-3 weeks                      │
  │       │  └─ Financial impact: ₹2-4 lakhs loss        │
  │       │                                               │
  │       └─ Materials needed:                           │
  │          ├─ Bordeaux mixture: Available at XYZ shop   │
  │          │  (2 km away)                              │
  │          ├─ Sprayer: You have (check condition)      │
  │          ├─ Labor: 2-3 people, 2-4 hours             │
  │          └─ Cost estimate: ₹500 (materials) + ₹300 (labor)
  │                                                        │
  │ Total Processing Time: 1.6 seconds                    │
  └────────────────────────────────────────────────────────┘

Step 5: VOICE RESPONSE - DOCTOR-LIKE EXPLANATION

  ┌─ KrishiAI Voice Response (in Marathi) ─────────────────┐
  │                                                         │
  │ "Namaste Ravi! I've analyzed your farm's conditions   │
  │  and crop details. Here's what I found:               │
  │                                                         │
  │  YOUR DISEASE: Sugarcane Leaf Scald                    │
  │  ├─ Type: Bacterial disease (Xanthomonas bacteria)     │
  │  ├─ Cause: Monsoon humidity + spreading by water/tools │
  │  └─ Confidence: 75% (fairly certain, but not 100%)     │
  │                                                         │
  │  GOOD NEWS: This is TREATABLE!                         │
  │  If you act TODAY:                                     │
  │  ├─ Success rate: 80% (crop can be saved)              │
  │  ├─ Cost: Only ₹800                                    │
  │  └─ Time: 2-4 hours of work                            │
  │                                                         │
  │  BAD NEWS: If you wait 2 weeks:                        │
  │  ├─ Entire crop could die (40-60% loss)                │
  │  ├─ Financial loss: ₹2-4 lakhs                         │
  │  └─ Not much I can do then                             │
  │                                                         │
  │  WHAT TO DO RIGHT NOW:                                 │
  │                                                         │
  │  Step 1: Remove affected leaves                        │
  │  ├─ Walk through your field                            │
  │  ├─ Pinch off leaves with brown spots (10-15%)         │
  │  ├─ Don't touch healthy leaves                         │
  │  ├─ Throw removed leaves FAR from field (disease lives)│
  │  └─ Wash hands with soap (bacteria spreads)            │
  │                                                         │
  │  Step 2: Get Bordeaux mixture 1%                       │
  │  ├─ Go to XYZ Agri Shop (2 km from you)                │
  │  ├─ Ask for: Bordeaux mixture 1% or copper sulfate     │
  │  ├─ Cost: ₹400-500 per kilogram                        │
  │  ├─ Need: 5kg total (for 5 hectares + safety margin)   │
  │  ├─ Total cost: ₹2000-2500                             │
  │  ├─ Ask them to prepare it (they know how)             │
  │  └─ Tell shopkeeper: For sugarcane leaf scald          │
  │                                                         │
  │  Step 3: Spray in evening (best time)                  │
  │  ├─ Wait until 6 PM (cooler, less evaporation)         │
  │  ├─ Mix solution in your sprayer                       │
  │  ├─ Spray ENTIRE field (not just affected plants)      │
  │  ├─ Spray until leaves are dripping wet                │
  │  ├─ Spray from both sides of leaf (fungus hides)       │
  │  ├─ Time: 2-3 hours for 5 hectares                     │
  │  └─ You might need 2-3 helpers                         │
  │                                                         │
  │  Step 4: Repeat after 10 days                          │
  │  ├─ Mark your calendar: 10 days from today             │
  │  ├─ Spray again (even if looks better)                 │
  │  ├─ Do a 3rd spray 10 days after 2nd (total: 3 sprays) │
  │  └─ After 3rd spray, disease should be gone            │
  │                                                         │
  │  IMPORTANT: Preventive measures for future             │
  │  ├─ Sterilize tools: Dip sprayer in bleach solution    │
  │  ├─ Avoid spreading: Don't walk between fields         │
  │  ├─ Field rotation: Don't plant sugarcane same spot    │
  │  ├─ Remove debris: Clear old stalks after harvest      │
  │  └─ Clean water: Use clean water (not pond water)      │
  │                                                         │
  │  CONTACT EXPERT IF:                                    │
  │  ├─ Disease spreads after 1st spray (call us)          │
  │  ├─ You see different symptoms (not brown spots)       │
  │  ├─ You're unsure about diagnosis (upload photo)       │
  │  └─ You have other sick plants                         │
  │                                                         │
  │  NEXT STEP: Send me a photo after 5 days               │
  │  This helps me verify: Did treatment work?             │
  │  Reply: Text \"PHOTO\" to send picture via WhatsApp     │
  │                                                         │
  │  Cost summary:                                         │
  │  ├─ Bordeaux mixture: ₹2000                            │
  │  ├─ Labor (if you hire): ₹1000                         │
  │  ├─ Total cost: ₹3000                                  │
  │  └─ Value: Saved ₹3 lakh crop ✓ Very good ROI!         │
  │                                                         │
  │  Questions? Call back anytime. Stay strong, Ravi!      │
  │  Your farm will recover. We're with you.               │
  └─────────────────────────────────────────────────────────┘

Step 6: SMS FOLLOW-UP (Immediate)

  ┌─ SMS to Ravi ──────────────────────────────────────────┐
  │ KrishiAI: SUGARCANE LEAF SCALD TREATMENT              │
  │                                                         │
  │ Disease: Bacterial (treatable!)                       │
  │ Action: Remove affected leaves + spray today           │
  │                                                         │
  │ Materials needed:                                      │
  │ ├─ Bordeaux mixture 1%: ₹2000 @ XYZ Shop (2 km)       │
  │ └─ Sprayer: You have                                   │
  │                                                         │
  │ Steps:                                                 │
  │ 1. Remove brown-spotted leaves (discard far away)      │
  │ 2. Get Bordeaux solution from shop                     │
  │ 3. Spray entire field at 6 PM TODAY                    │
  │ 4. Repeat spray in 10 days (2nd spray)                 │
  │ 5. 3rd spray 20 days from now                          │
  │                                                         │
  │ Cost: ₹3000 total  |  Savings: ₹3 lakhs               │
  │                                                         │
  │ Contact us if issue persists: Reply HELP               │
  └─────────────────────────────────────────────────────────┘

Step 7: PHOTO VERIFICATION (5 days later - Optional)

  Ravi sends WhatsApp photo to KrishiAI number
  
  ┌─ Gemini Photo Analysis ────────────────────────────────┐
  │ Photo: Sugarcane leaf after treatment                 │
  │ Analysis:                                              │
  │ ├─ Spot progression: 20% slower (GOOD SIGN)            │
  │ ├─ New spots: None observed (treatment working!)       │
  │ ├─ Leaf color: Recovering slightly                     │
  │ └─ Recommendation: Continue with 2nd spray on Day 10   │
  │                                                         │
  │ KrishiAI SMS to Ravi:                                  │
  │ "Great news! Leaf scald responding to treatment.       │
  │  Continue with 2nd spray on Day 10 as planned.         │
  │  Your farm will recover fully. Keep monitoring! 💪"    │
  └─────────────────────────────────────────────────────────┘

Step 8: EXPERT ESCALATION (If Needed)

  Scenario: What if confidence is low or farmer is skeptical?
  
  ┌─ KrishiAI Escalation Decision ────────────────────────┐
  │ Confidence: 60% (below 70% threshold)                 │
  │ OR                                                     │
  │ Farmer response: "I'm not sure. Can an expert verify?" │
  │                                                         │
  │ Action: Create escalation in Firebase                 │
  │ ├─ Send to: Nearest Rythu Seva Kendra dashboard       │
  │ ├─ Include: Voice transcript + context + Ravi's GPS   │
  │ ├─ Priority: MEDIUM (not life-threatening)             │
  │ ├─ Request: Expert confirmation of diagnosis           │
  │ └─ Timeline: Expert will call Ravi within 12 hours     │
  │                                                         │
  │ SMS to Ravi:                                           │
  │ "I want an expert to verify this. You'll receive a    │
  │  call from Rythu Seva Kendra in next 12 hours.        │
  │  Please discuss diagnosis with them directly. ✓"       │
  └─────────────────────────────────────────────────────────┘
```

### Use Case 2: Photo-Based Disease Detection

```
Scenario: Priya (smartphone owner) sends WhatsApp photo

Step 1: Priya sends photo
  ├─ Screenshot: Brown/black spots on cotton leaf
  ├─ Sent to: WhatsApp number managed by KrishiAI
  └─ GPS auto-attached (if enabled)

Step 2: Gemini Vision Analysis (2 seconds)
  ├─ Analyze leaf texture, color patterns, spot morphology
  ├─ Match against disease library (100k+ training photos)
  ├─ Generate: Disease name + confidence + treatment

Step 3: Instant WhatsApp Response
  ├─ Text + image annotation (spots highlighted)
  ├─ Disease identification: "Cotton Leaf Curl Virus (92% confidence)"
  ├─ Treatment protocol: Step-by-step instructions
  ├─ Recommended products: Specific pesticides + where to buy
  └─ Cost estimate: ₹500-1000

Step 4: Expert Review (Async)
  ├─ All photos automatically reviewed by expert panel
  ├─ If AI misdiagnosed: Expert corrects + sends SMS correction
  ├─ Farmer never left with wrong diagnosis for long
```

---

## Feature 4: Hyper-Local Mandi Mapping

### What It Does
Helps farmers discover nearby markets (mandis) and get real-time crop prices to make better selling decisions.

### User Flow

```
Scenario: Rajesh has 10 quintals of sugarcane to sell
He wonders: "Where should I sell? What price will I get?"

Step 1: SMS Query
  Rajesh texts: "MANDI PRICES SUGARCANE"
  
  ┌─ KrishiAI SMS Response ────────────────┐
  │ Mandis near you (10-50 km):            │
  │                                        │
  │ 1. Marathawada Mandi (15 km)           │
  │    Price: ₹250/quintal                 │
  │    Distance: 15 km (1 hr drive)        │
  │    Quality payment: Yes (premium 5%)    │
  │    Contact: 9876543210                 │
  │                                        │
  │ 2. Aurangabad Main Mandi (25 km)       │
  │    Price: ₹270/quintal ⭐ BEST PRICE   │
  │    Distance: 25 km (2 hr drive)        │
  │    Quality payment: Yes (premium 10%)   │
  │    Contact: 9876543211                 │
  │                                        │
  │ 3. Local Farmer Cooperative (8 km)     │
  │    Price: ₹240/quintal                 │
  │    Distance: 8 km (45 min drive)       │
  │    Quality payment: No                  │
  │    Contact: 9876543212                 │
  │                                        │
  │ RECOMMENDATION:                        │
  │ Sell at Aurangabad Main Mandi          │
  │ Extra income: (₹270-₹250) × 10 = ₹200  │
  │                                        │
  │ Reply MANDI2 to call Aurangabad         │
  │ or DIRECTIONS to get GPS route          │
  └────────────────────────────────────────┘

Step 2: Navigate & Sell
  ├─ Rajesh drives to Aurangabad Mandi
  ├─ Shows SMS with ₹270/quintal price
  ├─ Negotiates with buyer (backed by market data)
  ├─ Sells 10 quintals × ₹270 = ₹2700 (vs ₹2500 if local)
  └─ Extra profit: ₹200 (thanks to price discovery)

Step 3: Post-Sale Feedback (Optional)
  KrishiAI SMS: "Thanks for using KrishiAI! Feedback?"
  Rajesh: "Yes, sold at ₹265 (slightly lower than quoted)"
  KrishiAI: "Thanks! This helps us improve price predictions. ✓"

Result: Community data improves future recommendations
```

---

## Feature 5: Community Knowledge Hub

### What It Does
- Farmers post crop problems / solutions in local language
- Community upvotes helpful answers
- Experts verify best solutions
- Crowdsourced agricultural wisdom

### Example Post

```
Question: "Cotton bolls becoming brown/infected (Boll Rot). 
          How to save crop? Already lost 20%."

Upvoted Solution 1 (by Farmer Narendra):
"I had same problem. Here's what worked:
1. Pick infected bolls immediately (remove source)
2. Spray Trichoderma (biocontrol) every 7 days
3. Improve drainage (boll rot spreads in moisture)
4. Avoid over-nitrogen (makes plants lush, attracts disease)
5. Result: Stopped spread, saved 60% remaining crop"
[⭐⭐⭐⭐⭐ 145 upvotes] [Expert verified ✓]

Upvoted Solution 2 (by Agricultural Scientist Dr. Sharma):
"Boll rot is fungal. Treatment:
1. Cultural: Remove infected bolls, improve spacing
2. Chemical: Copper-based fungicide (Bordeaux 1%)
3. Timing: Spray every 10 days during humid season
4. Prevention: Crop rotation, resistant varieties
Results vary by rainfall. Consult your local extension."
[⭐⭐⭐⭐ 89 upvotes] [Expert verified ✓]
```

---

## Rythu Seva Kendra Expert Dashboard

### What It Does
Dashboard for agricultural experts to:
1. Review critical cases escalated by AI
2. Provide expert diagnosis/advice
3. Track farmer outcomes
4. Generate reports for government

### Dashboard Screenshot (Text)

```
┌─ EXPERT DASHBOARD ─────────────────────────────────┐
│ Rythu Seva Kendra: Hyderabad Center                │
│ Expert: Dr. Sharma | Role: Senior Agronomist      │
│                                                    │
│ 📊 STATS                                           │
│ ├─ Escalations pending: 12                        │
│ ├─ Approved diagnostics today: 23                 │
│ ├─ Farmers helped (all-time): 4,567               │
│ └─ Avg response time: 2.3 hours                   │
│                                                    │
│ 🚨 PENDING ESCALATIONS (12)                       │
│                                                    │
│ [1] Ramesh (9876543210)        [URGENT]           │
│     ├─ Farm: Telangana, 2 hectares                │
│     ├─ Issue: Sugarcane - leaf spots              │
│     ├─ Photo: Attached ✓                          │
│     ├─ AI diagnosis: Leaf scald (75% confidence)  │
│     ├─ Severity: Moderate (2-3 weeks before loss) │
│     ├─ Needs: Expert verification + advice        │
│     └─ [APPROVE] [MODIFY] [REQUEST PHOTO] [CALL]  │
│                                                    │
│ [2] Priya (9876543211)         [MODERATE]         │
│     ├─ Farm: Karnataka, 5 hectares                │
│     ├─ Issue: Cotton - yellow spots + wilting     │
│     ├─ AI diagnosis: Cotton wilt (60% confidence) │
│     ├─ Confidence: Low (needs manual review)       │
│     ├─ Photo: Attached ✓                          │
│     └─ [REVIEW PHOTO] [CALL FARMER] [ESCALATE]    │
│                                                    │
│ [3] Sunil (9876543212)         [LOW]              │
│     ├─ Farm: Maharashtra                          │
│     ├─ Issue: Mandi prices - wants better rate    │
│     ├─ AI diagnosis: Market advice (not disease) │
│     ├─ Note: Not escalation, but referred anyway  │
│     └─ [CLOSE] [LINK TO MANDI DATA]               │
│                                                    │
│ ✅ APPROVED DIAGNOSTICS (Approved by Dr. Sharma)  │
│                                                    │
│ ├─ Sugarcane leaf scald: 5 confirmations today   │
│ ├─ Cotton leaf curl virus: 8 confirmations        │
│ ├─ Groundnut leaf spot: 3 confirmations           │
│ ├─ Tomato blight: 7 confirmations                 │
│ └─ Total: 23 cases reviewed                       │
│                                                    │
│ 📈 OUTCOMES TRACKING                              │
│ └─ 7-day farmer follow-up:                        │
│    ├─ Successfully treated: 89% (23/25)           │
│    ├─ Partially treated: 8% (2/25)                │
│    ├─ No improvement: 3% (1/25 - may be wrong diagnosis)
│    └─ Doctor notes: "High success rate validates AI"
│                                                    │
│ 📄 REPORTS                                         │
│ ├─ Monthly summary: [DOWNLOAD PDF]                 │
│ ├─ Disease distribution: [VIEW CHART]              │
│ ├─ Farmer outcomes: [VIEW ANALYTICS]               │
│ └─ Recommendations to government: [DRAFT REPORT]   │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## User Journey Maps

### Journey 1: Farmer's First Week (Onboarding)

```
Day 1: Discovery
  └─ SMS from government: "Free crop advice via 1-800-KRISHI-AI"
  └─ Farmer curiosity: Calls number

Day 1-2: Voice Interface Exploration
  └─ Farmer learns: Crop recommendations, weather, disease help
  └─ Comfort level: Moderate (new interface, takes 3-5 calls)

Day 3-4: Quick Wins
  └─ Weather advice helps farmer avoid unnecessary irrigation
  └─ Saves ₹500 water cost (positive reinforcement!)

Day 5-7: Habit Formation
  └─ Farmer checks daily SMS alerts
  └─ Adoption: Daily active user (DAU)
  └─ Engagement: 3-4 interactions/week

Week 2+: Community Engagement
  └─ Farmer reads community posts (learns from others)
  └─ Optional: Farmer posts own questions (higher engagement)
  └─ Retention: >80% of new users

Success Metrics:
  ├─ Day 1 activation: 80%+
  ├─ Week 1 retention: 70%+
  ├─ Monthly active: 60%+
  └─ NPS (satisfaction): >50
```

---

## Use Cases

### Use Case 1: Small Farmer Saves ₹40k/Season
```
Farmer: Rohit, 2 hectares, cotton
Baseline: Traditional farming, oversupplied market

With KrishiAI:
1. Crop recommendation → Switch to groundnut
   (Better price: ₹6,000 vs ₹4,500/quintal)
2. Irrigation advice → Reduce water use by 30%
   (Save ₹5,000 water cost)
3. Disease detection → Catch boll worms early
   (Avoid 20% crop loss = Save ₹20,000)
4. Mandi discovery → Find market 20% premium
   (Sell 8 quintals × ₹1,200 extra = ₹9,600)

Total Benefit: ₹40,000 profit improvement/season
Impact: Farmer can feed family better, save ₹5k for next season
```

### Use Case 2: Government Improves Rural Livelihood
```
State: Telangana
Problem: 100k small farmers with low productivity
Solution: License KrishiAI for all 100k farmers
         Cost: ₹1 crore/year
         Benefit: 
           ├─ Avg yield improvement: +20% = 20,000 extra quintals
           ├─ Market value of extra production: ₹10 crore
           ├─ Farmer income improvement: ₹40k/farmer × 100k = ₹400 crore
           ├─ Water conservation: 270M liters/year (50M m³)
           └─ Suicide prevention: Estimated 60-100 lives saved/year

ROI to Government: 400:1 (₹400 crore benefit / ₹1 crore cost)
```

---

## Feature Roadmap

### Phase 1 (Current - Launch)
```
✅ Voice-based crop recommendations
✅ Disease diagnosis (voice + photo)
✅ Weather & irrigation advice
✅ Mandi price discovery
✅ Community hub (read-only)
✅ Expert escalation dashboard
✅ Mobile app (Expo React Native)
✅ SMS alerts & notifications
```

### Phase 2 (3-6 months post-launch)
```
🔄 Community hub (user-generated posts)
🔄 Indic language support (10+ languages)
🔄 Drone farm imaging (MVP)
🔄 Guaranteed market linkage (pilot)
🔄 Advanced analytics for government
🔄 Premium features (iOS app)
🔄 WhatsApp chatbot integration
```

### Phase 3 (6-12 months)
```
⏳ Weather-indexed crop insurance partnerships
⏳ Soil health monitoring (IoT sensors)
⏳ Personalized planting calendars
⏳ Direct buyer marketplace
⏳ Yield prediction models
⏳ Supply chain traceability
⏳ Export-ready mobile app (multiple stores)
```

---

## Success Metrics Summary

```
Category          Metric                    Target (Year 1)
──────────────────────────────────────────────────────────
Adoption          Farmer activation rate    >60%
                  Monthly active users      >30k
                  Daily active users        >8k

Engagement        Queries per farmer/month  >8
                  NPS (satisfaction)        >50
                  Repeat usage rate         >70%

Product Quality   Recommendation accuracy   >85%
                  Disease diagnosis accuracy >80%
                  Farmer satisfaction       >75%

Business Impact   Revenue per farmer        ₹100-200
                  Farmer income improvement ₹20k-40k/season
                  Government contracts     1-2 states
                  B2B partnerships         3-5 companies

Social Impact     Water savings/farmer      50k-100k liters
                  Yield improvement         +15-20%
                  Farmer suicides prevented 5-10/pilot region
```

---

Refer to [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md) for implementation details of each feature.
