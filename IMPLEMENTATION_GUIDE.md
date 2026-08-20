# KrishiAI: Implementation Guide & Setup

---

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Repository Structure](#repository-structure)
3. [Local Development Setup](#local-development-setup)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [Mobile App Setup](#mobile-app-setup)
7. [Environment Configuration](#environment-configuration)
8. [Running the Application](#running-the-application)
9. [API Endpoints Reference](#api-endpoints-reference)
10. [Deployment to Production](#deployment-to-production)
11. [Monitoring & Debugging](#monitoring--debugging)
12. [Current Implementation Status](#current-implementation-status)
13. [Known Issues & Solutions](#known-issues--solutions)

---

## Quick Start

### For Hackathon Judges

**Want to see KrishiAI working in 5 minutes?**

```bash
# 1. Clone repository
git clone https://github.com/Manav373/Build-With-AI.git
cd Build-With-AI

# 2. Choose your path:

# PATH A: See the Mobile App (Recommended for Demo)
cd krishi-mobile-app
npm install
npx expo start
# Press 's' for iOS simulator or 'a' for Android emulator

# PATH B: Run Backend API Locally
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload

# PATH C: Run Frontend Dashboard
cd frontend
npm install
npm run dev
```

### Demo Scripts
```
Voice Demo Flow:
  1. Call 1-800-KRISHI-AI
  2. Press 1 for "Crop Recommendation"
  3. Describe: "My cotton needs water"
  4. Hear: AI generates personalized advice

Mobile Demo Flow:
  1. Open Expo app on simulator
  2. Navigate to "Crop Health" tab
  3. View mandi prices on interactive map
  4. Voice button: Ask about crop recommendations
```

---

## Repository Structure

```
Build-With-AI/
├── krishiai/                          # Full-stack web implementation
│   ├── backend/                       # FastAPI backend
│   │   ├── app/
│   │   │   ├── main.py               # FastAPI app entry point
│   │   │   ├── routers/              # API route handlers
│   │   │   │   ├── crop_recommendation.py
│   │   │   │   ├── disease_diagnosis.py
│   │   │   │   ├── weather.py
│   │   │   │   └── mandi.py
│   │   │   ├── services/             # Business logic
│   │   │   │   ├── gee_service.py   # Google Earth Engine
│   │   │   │   ├── gemini_service.py # Google Gemini API
│   │   │   │   ├── weather_service.py
│   │   │   │   └── cache_service.py
│   │   │   ├── models/               # Pydantic data models
│   │   │   │   ├── schemas.py
│   │   │   │   └── database.py
│   │   │   ├── database.py           # PostgreSQL connection
│   │   │   ├── config.py             # Environment config
│   │   │   └── utils/                # Helper functions
│   │   ├── requirements.txt
│   │   ├── tests/                    # Unit & integration tests
│   │   ├── Dockerfile
│   │   └── .env.example
│   │
│   ├── frontend/                      # React 18 + Vite dashboard
│   │   ├── src/
│   │   │   ├── components/           # React components
│   │   │   ├── pages/                # Route pages
│   │   │   ├── services/             # API client
│   │   │   ├── styles/               # CSS/Tailwind
│   │   │   └── App.tsx
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tailwind.config.js
│   │
│   ├── .env                          # Environment variables
│   ├── .env.example
│   ├── docker-compose.yml            # Local dev with Docker
│   ├── START_LOCAL.md                # Local setup instructions
│   └── Dockerfile
│
├── krishi-mobile-app/                 # Primary React Native (Expo)
│   ├── app/                          # Expo Router navigation
│   │   ├── (auth)/                   # Auth screens
│   │   ├── (tabs)/                   # Main app tabs
│   │   │   ├── home/
│   │   │   ├── crop-health/
│   │   │   ├── mandi/
│   │   │   └── community/
│   │   └── _layout.tsx
│   ├── components/                   # UI components
│   │   ├── PremiumCard.tsx
│   │   ├── MapView.tsx              # Leaflet integration
│   │   └── DarkModeToggle.tsx
│   ├── services/
│   │   ├── api.ts                   # API client
│   │   └── storage.ts               # AsyncStorage wrapper
│   ├── utils/                        # Helpers
│   ├── hooks/                        # Custom React hooks
│   ├── constants/                    # App constants
│   ├── app.json                      # Expo configuration
│   ├── package.json
│   ├── tsconfig.json
│   ├── metro.config.js
│   └── eas.json                      # EAS Build config
│
├── krishi-mobile/                     # Alternative mobile variant
│   └── (similar structure to krishi-mobile-app/)
│
├── backend/                          # Shared backend (deprecated)
├── frontend/                         # Shared frontend (deprecated)
├── README.md
├── PROJECT_OVERVIEW.md
├── TECHNICAL_ARCHITECTURE.md
├── BUSINESS_STRATEGY.md
├── PRODUCT_FEATURES.md
└── IMPLEMENTATION_GUIDE.md (this file)
```

---

## Local Development Setup

### Prerequisites

```
Required Software:
├─ Node.js: v18+ (check: node --version)
├─ Python: v3.9+ (check: python --version)
├─ Git: Latest version
├─ Docker: (optional, for containerized setup)
└─ Expo CLI: npm install -g expo-cli

Required Accounts:
├─ Google Cloud Platform (for Earth Engine + Gemini API keys)
├─ Twilio: (for SMS/voice gateway testing)
├─ Supabase or PostgreSQL: (for database)
└─ Firebase: (for Realtime DB)
```

### Directory Setup

```bash
# Create project directory
mkdir krishi-development
cd krishi-development

# Clone main repo
git clone https://github.com/Manav373/Build-With-AI.git .

# Verify structure
ls -la
# Should see: krishiai/ krishi-mobile-app/ krishi-mobile/ backend/ frontend/

# Check git status
git status
git log --oneline | head -10
```

---

## Backend Setup

### Step 1: Create Python Virtual Environment

```bash
cd krishiai/backend

# Create virtual environment
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Verify activation (prompt should show (venv))
```

### Step 2: Install Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install from requirements
pip install -r requirements.txt

# Verify key packages
python -c "import fastapi; import google.cloud.earthengine; print('✓ All packages installed')"
```

### Step 3: Setup Environment Variables

```bash
# Copy example to local
cp .env.example .env

# Edit .env with your credentials
nano .env  # Linux/Mac
# or
notepad .env  # Windows
```

#### .env Template

```env
# FastAPI Configuration
DEBUG=True
API_TITLE="KrishiAI Development"
API_VERSION="0.1.0"

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/krishiai_dev"
SQLALCHEMY_ECHO=True

# Google Cloud
GCP_PROJECT_ID="your-gcp-project-id"
GCP_SERVICE_ACCOUNT_JSON="/path/to/service-account-key.json"

# APIs
GEMINI_API_KEY="your-gemini-api-key"
GROQ_API_KEY="your-groq-api-key"

# Twilio (SMS/Voice)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Supabase / Firebase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-supabase-anon-key"
FIREBASE_CONFIG_JSON="/path/to/firebase-config.json"

# Cache (Redis)
REDIS_URL="redis://localhost:6379"

# Environment
ENVIRONMENT="development"
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

### Step 4: Test Backend Start

```bash
# Run FastAPI server
python -m uvicorn app.main:app --reload --port 8000

# Expected output:
# INFO:     Uvicorn running on http://127.0.0.1:8000
# INFO:     Application startup complete

# Test API health
curl http://localhost:8000/health
# Should return: {"status": "ok"}

# View API docs
# Open browser: http://localhost:8000/docs
# You should see Swagger UI with all endpoints
```

---

## Frontend Setup

### Step 1: Install Dependencies

```bash
cd krishiai/frontend

# Install Node modules
npm install

# Verify installation
npm list
```

### Step 2: Setup Environment

```bash
# Create .env.local
cp .env.example .env.local

# Edit configuration
nano .env.local
```

#### .env.local Template

```env
VITE_API_URL="http://localhost:8000/api"
VITE_ENV="development"
```

### Step 3: Run Development Server

```bash
# Start Vite dev server
npm run dev

# Expected output:
# VITE v4.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
# ➜  Press q to quit

# Open in browser: http://localhost:5173
```

---

## Mobile App Setup

### Step 1: Install Expo

```bash
# Install Expo CLI globally
npm install -g expo-cli

# Verify installation
expo --version
```

### Step 2: Install Project Dependencies

```bash
cd krishi-mobile-app

# Install Node modules
npm install

# Install Expo modules
expo install
```

### Step 3: Run on Simulator

```bash
# Start Expo dev server
npx expo start

# Options will appear:
# ─────────────────────────────────────────────────────────────────
# › Enter an option: 
#   ✔ Tunnel
#   LAN
#   Local
#
# › Scan the QR code above with Expo Go. Anytime you want to reload
# the app, you can press 'w' to open web or 'r' to reload.
#
# s - iOS Simulator
# a - Android Emulator
# w - Web
# c - Clear console

# Press 's' for iOS Simulator or 'a' for Android Emulator
```

### Step 4: Deploy to EAS (Optional)

```bash
# Login to Expo account
expo login

# Configure EAS
npx eas-cli@latest build

# Build for iOS and Android
npx eas-cli build --platform ios
npx eas-cli build --platform android
```

---

## Environment Configuration

### GCP Setup (Google Earth Engine + Gemini)

```bash
# 1. Create GCP Project
#    - Go to https://console.cloud.google.com
#    - Create new project: "KrishiAI"

# 2. Enable APIs
#    - Enable "Google Earth Engine API"
#    - Enable "Vertex AI API"
#    - Enable "Cloud Speech-to-Text API"
#    - Enable "Cloud Text-to-Speech API"
#    - Enable "Maps Platform APIs"

# 3. Create Service Account
#    - Go to "Service Accounts" in GCP Console
#    - Create new service account: "krishiai-backend"
#    - Grant roles:
#      ├─ Editor (for development; restrict in production)
#      └─ Service Account User

# 4. Create JSON Key
#    - Create JSON key for service account
#    - Download to: krishiai/backend/gcp-key.json
#    - Update .env: GCP_SERVICE_ACCOUNT_JSON="/path/to/gcp-key.json"

# 5. Authenticate with gcloud CLI
gcloud auth activate-service-account --key-file=krishiai/backend/gcp-key.json
gcloud config set project your-gcp-project-id

# 6. Verify Earth Engine Access
python -c "
import ee
ee.Authenticate()
ee.Initialize()
print('✓ Google Earth Engine connected')
"
```

### Twilio Setup (SMS/Voice)

```bash
# 1. Create Twilio Account
#    - Go to https://www.twilio.com/console
#    - Get Account SID and Auth Token

# 2. Get Phone Number
#    - Reserve a Twilio phone number (for toll-free: ~₹500/month)
#    - Example: +1-800-KRISHI-AI

# 3. Setup Webhooks
#    - Inbound SMS webhook: http://your-domain.com/api/webhooks/sms
#    - Inbound call webhook: http://your-domain.com/api/webhooks/call

# 4. Update .env
#    TWILIO_ACCOUNT_SID="your-sid"
#    TWILIO_AUTH_TOKEN="your-token"
#    TWILIO_PHONE_NUMBER="+1..."

# 5. Test SMS Send
python -c "
from twilio.rest import Client
account_sid = 'your-sid'
auth_token = 'your-token'
client = Client(account_sid, auth_token)
message = client.messages.create(
    body='KrishiAI Test: Namaste!',
    from_='+1234567890',
    to='+91987654...'
)
print(f'✓ SMS sent: {message.sid}')
"
```

### Database Setup (PostgreSQL)

```bash
# Option 1: Local PostgreSQL
# - Install PostgreSQL
# - Create database
createdb krishiai_dev

# - Create user
psql -U postgres -d krishiai_dev -c "CREATE USER krishiai_user WITH PASSWORD 'secure_password';"

# Option 2: Supabase (Cloud Database)
# - Go to supabase.com
# - Create project
# - Copy connection string to .env

# Test connection
psql DATABASE_URL -c "SELECT 1;"
```

---

## Running the Application

### Local Development (All Services)

```bash
# Terminal 1: Backend API
cd krishiai/backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m uvicorn app.main:app --reload

# Terminal 2: Frontend Dashboard
cd krishiai/frontend
npm run dev

# Terminal 3: Mobile App (Expo)
cd krishi-mobile-app
npx expo start

# Terminal 4: Optional - Celery worker (for async tasks)
cd krishiai/backend
celery -A app.worker worker --loglevel=info
```

### Docker Setup (All-in-one)

```bash
# Build and run with Docker Compose
cd krishiai
docker-compose up -d

# Check services
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

---

## API Endpoints Reference

### Crop Recommendation

```
POST /api/v1/crop-recommendation
Content-Type: application/json

Request:
{
  "user_id": "farmer_123",
  "land_parcel_id": "parcel_456",
  "latitude": 17.3850,
  "longitude": 78.4867
}

Response:
{
  "recommendations": [
    {
      "crop_name": "Groundnut",
      "compatibility_score": 0.95,
      "profit_estimate": 120000,
      "water_requirement_mm": 600,
      "market_price_per_quintal": 6000,
      "rationale": "Perfect for black soil, drought-resistant..."
    }
  ],
  "processing_time_ms": 2543
}
```

### Weather Advisory

```
GET /api/v1/weather-advisory
?user_id=farmer_123&latitude=17.3850&longitude=78.4867

Response:
{
  "current_weather": {
    "temperature_celsius": 28.5,
    "humidity_percent": 65,
    "rainfall_mm": 0
  },
  "forecast_7day": [
    {
      "date": "2024-07-16",
      "rainfall_mm": 20,
      "temperature_max": 32,
      "recommendation": "Wait for rain, don't irrigate"
    }
  ],
  "irrigation_schedule": {
    "action": "Irrigate today",
    "amount_mm": 25,
    "cost_rupees": 1000,
    "urgency": "HIGH"
  }
}
```

### Disease Diagnosis

```
POST /api/v1/disease-diagnosis
Content-Type: multipart/form-data

Form Data:
- user_id: "farmer_123"
- crop: "cotton"
- voice_query: "My leaves are turning yellow" (optional)
- photo: <image_file> (optional)
- latitude: 17.3850
- longitude: 78.4867

Response:
{
  "diagnosis": "Cotton Leaf Curl Virus",
  "confidence_score": 0.92,
  "severity_level": 4,
  "treatment_protocol": {
    "immediate_action": "Remove affected leaves",
    "spray": "Bordeaux mixture 1%",
    "frequency": "Every 10 days",
    "cost_rupees": 3000,
    "success_rate": 0.85
  },
  "escalation": {
    "needed": false,
    "reason": null
  }
}
```

### Mandi Prices

```
GET /api/v1/mandi-prices
?crop=sugarcane&latitude=17.3850&longitude=78.4867&radius_km=50

Response:
{
  "mandis": [
    {
      "mandi_name": "Aurangabad Main Mandi",
      "distance_km": 25,
      "price_per_quintal": 270,
      "price_trend": "stable",
      "contact": "9876543210"
    }
  ]
}
```

---

## Deployment to Production

### AWS/GCP Deployment Steps

```bash
# 1. Build Docker images
docker build -t krishiai-backend:latest krishiai/backend/
docker build -t krishiai-frontend:latest krishiai/frontend/

# 2. Push to Container Registry
# AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag krishiai-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/krishiai-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/krishiai-backend:latest

# 3. Deploy with Cloud Run (GCP)
gcloud run deploy krishiai-backend \
  --image gcr.io/your-project/krishiai-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --set-env-vars GCP_PROJECT_ID=your-project-id,DATABASE_URL=...

# 4. Setup auto-scaling
gcloud run services update krishiai-backend \
  --min-instances 1 \
  --max-instances 100 \
  --region us-central1

# 5. Setup CDN (for static assets)
gsutil -m rsync -r krishiai/frontend/dist gs://your-bucket/frontend/

# 6. Configure domain
gcloud compute backend-services update krishiai-backend \
  --global \
  --enable-cdn \
  --cache-mode CACHE_ALL_STATIC
```

### Environment Variables in Production

```
# Sensitive keys stored in Secret Manager
gcloud secrets create gemini-api-key --data-file=-
gcloud secrets create database-url --data-file=-
gcloud secrets create twilio-auth-token --data-file=-

# Grant access to Cloud Run service
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member=serviceAccount:krishiai@your-project.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

---

## Monitoring & Debugging

### Health Checks

```bash
# Backend health endpoint
curl http://localhost:8000/health

# Check database connection
curl http://localhost:8000/health/database

# Check external API connections
curl http://localhost:8000/health/integrations
# Returns: {"gee": "ok", "gemini": "ok", "twilio": "ok", ...}
```

### Logs & Debugging

```bash
# Backend logs (Uvicorn)
# Check terminal running: python -m uvicorn ...

# Structured logging
python -c "
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger('krishiai')
logger.info('Server starting...')
"

# Frontend console
# Open browser DevTools: F12 → Console tab

# Mobile app debugging
npx expo start
# Press 'j' to open debugger
```

### Performance Profiling

```bash
# Backend: Measure API latency
# Use: /health/performance endpoint

# Mobile: React Native Profiler
# Use: Expo DevTools → Profiler tab

# Frontend: Chrome DevTools
# F12 → Performance tab → Record
```

---

## Current Implementation Status

### Completed ✅

```
Backend (krishiai/backend/)
├─ FastAPI server setup ✅
├─ Router structure (crop, disease, weather, mandi) ✅
├─ PostgreSQL database schema ✅
├─ Google Earth Engine integration scaffolding ✅
├─ Google Gemini API setup ✅
├─ Twilio SMS/voice gateway skeleton ✅
├─ Firebase Realtime DB connection ✅
├─ Error handling & logging ✅
└─ Basic tests ✅

Frontend (krishiai/frontend/)
├─ React 18 + Vite setup ✅
├─ Tailwind CSS styling ✅
├─ React Router navigation ✅
├─ Rythu Seva Kendra dashboard UI ✅
├─ Escalation card components ✅
├─ Real-time Firebase listener ✅
└─ API client service ✅

Mobile (krishi-mobile-app/)
├─ Expo React Native setup ✅
├─ Tab-based navigation ✅
├─ Leaflet map integration ✅
├─ Dark mode support ✅
├─ Premium UI components ✅
├─ Voice button interface ✅
├─ AsyncStorage for local data ✅
└─ API client integration ✅
```

### In Progress 🔄

```
High Priority:
├─ Full GEE satellite data pipeline (NDVI calculation)
├─ SMS/voice gateway integration (Twilio)
├─ Multi-language support (Hindi, Tamil, Telugu, Marathi)
├─ Blink Engine latency optimization (<4 seconds)
├─ Redis caching implementation
└─ Comprehensive test suite

Medium Priority:
├─ Community hub peer-to-peer features
├─ Advanced disease diagnosis model
├─ Drone integration MVP
├─ Weather-indexed insurance partnerships
└─ Analytics dashboard for government
```

### Pending ⏳

```
Before Production:
├─ Load testing (1000+ concurrent users)
├─ Security audit & penetration testing
├─ GDPR/PDPB compliance review
├─ Production database setup (managed PostgreSQL)
├─ CI/CD pipeline (GitHub Actions)
├─ Uptime monitoring & alerting
├─ Backup & disaster recovery plan
└─ SLA documentation

Nice-to-Have (Phase 2+):
├─ IoT soil sensor integration
├─ Machine learning models (crop yield prediction)
├─ Advanced analytics dashboard
├─ Mobile app store submission (iOS + Android)
└─ International expansion roadmap
```

---

## Known Issues & Solutions

### Issue 1: GEE Authentication Timeout

**Error:**
```
google.auth.exceptions.DefaultCredentialsError: Could not automatically 
determine credentials
```

**Solution:**
```bash
# Set GCP credentials
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/gcp-key.json"

# Or in Python:
import os
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/path/to/gcp-key.json'
```

### Issue 2: Twilio SMS Not Sending

**Error:**
```
TwilioRestException: [HTTP 401] Unable to create record: 
Invalid credentials
```

**Solution:**
```bash
# Verify credentials in .env
echo $TWILIO_ACCOUNT_SID
echo $TWILIO_AUTH_TOKEN

# Test with CLI
twilio phone-numbers:list
```

### Issue 3: Database Connection Refused

**Error:**
```
psycopg2.OperationalError: could not connect to server: Connection refused
```

**Solution:**
```bash
# Check PostgreSQL is running
ps aux | grep postgres

# Start PostgreSQL (Mac with Homebrew)
brew services start postgresql

# Or create database URL correctly
# Format: postgresql://user:password@host:port/database
```

### Issue 4: Mobile App Crashes on Photo Upload

**Error:**
```
Error: Cannot read property 'uri' of undefined
```

**Solution:**
```javascript
// Check image permissions in app.json
{
  "plugins": [
    ["expo-image-picker", {
      "photosPermission": "Allow $(PRODUCT_NAME) to access your photos",
      "cameraPermission": "Allow $(PRODUCT_NAME) to use your camera"
    }]
  ]
}

// Rebuild app
expo prebuild --clean
```

### Issue 5: Frontend API 404 Errors

**Error:**
```
GET /api/v1/crop-recommendation 404 Not Found
```

**Solution:**
```
1. Verify backend is running on http://localhost:8000
2. Check frontend .env.local has: VITE_API_URL="http://localhost:8000/api"
3. Verify CORS is enabled in backend:
   CORSMiddleware(app, allow_origins=[...])
```

---

## Testing

### Unit Tests

```bash
# Backend tests
cd krishiai/backend
pytest tests/ -v

# Frontend tests
cd krishiai/frontend
npm test

# Coverage report
pytest --cov=app tests/
```

### Integration Tests

```bash
# Test API endpoint
curl -X POST http://localhost:8000/api/v1/crop-recommendation \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","land_parcel_id":"test","latitude":17.3850,"longitude":78.4867}'

# Test database
python -c "
from sqlalchemy import create_engine
engine = create_engine('postgresql://...')
with engine.connect() as conn:
    result = conn.execute('SELECT 1')
    print('✓ Database connected')
"
```

### E2E Tests (Mobile)

```bash
# Install Detox
npm install detox-cli --global

# Build app for testing
detox build-framework-cache
detox build-framework-cache ios.sim.debug

# Run tests
detox test e2e/ --cleanup --record-logs all
```

---

## Troubleshooting Checklist

```
Before reporting an issue, verify:

[ ] Node.js version is 18+
[ ] Python version is 3.9+
[ ] Virtual environment is activated
[ ] .env file exists and is populated
[ ] Backend is running: curl http://localhost:8000/health
[ ] Database is connected: Check backend logs
[ ] GCP credentials are set: echo $GOOGLE_APPLICATION_CREDENTIALS
[ ] Ports are not in use: 
    [ ] 8000 (backend)
    [ ] 5173 (frontend)
    [ ] 5432 (database)
    [ ] 6379 (redis)
[ ] Run: npm install (if node_modules issues)
[ ] Run: pip install -r requirements.txt (if Python issues)
[ ] Restart all services
[ ] Check recent git commits: git log --oneline -5
[ ] Check for unstaged changes: git status
```

---

## Next Steps for Developers

1. **Read documentation first:**
   - Start with [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
   - Then [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
   - Finally this file for setup

2. **Get the environment running:**
   - Follow "Local Development Setup" steps
   - Get to the point where `http://localhost:8000/docs` loads

3. **Pick a task:**
   - Check GitHub issues tagged `good-first-issue`
   - Or pick from "In Progress" features above

4. **Make a change:**
   - Create branch: `git checkout -b feature/your-feature`
   - Make changes and test
   - Submit PR with description referencing issue

5. **Deployment:**
   - After PR merge, changes auto-deploy to staging (GCP Cloud Run)
   - Production deploy requires approval from maintainers

---

## Support & Resources

### Documentation
- Google Earth Engine: https://developers.google.com/earth-engine
- FastAPI: https://fastapi.tiangolo.com/
- React: https://react.dev/
- React Native Expo: https://docs.expo.dev/
- Tailwind CSS: https://tailwindcss.com/docs

### Community
- GitHub Discussions: https://github.com/Manav373/Build-With-AI/discussions
- Discord: [Join community server]
- Twitter: @KrishiAI_Dev

### Contacting Maintainers
- Email: manav@krishiai.dev
- GitHub Issues: https://github.com/Manav373/Build-With-AI/issues

---

**Last Updated:** July 21, 2024  
**Current Version:** 0.1.0 (MVP)  
**Node:** This is a living document. Refer to git commits for latest changes.
