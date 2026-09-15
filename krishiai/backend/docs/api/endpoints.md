# API Endpoints Catalog

## 1. Authentication & System (`/api/auth`, `/api/tools`)
- `POST /api/auth/send-otp`: Sends 6-digit OTP to phone number
- `POST /api/auth/verify-otp`: Verifies OTP and generates auth token
- `GET /api/tools/*`: MCP Tools for LLM agents

## 2. Farmer Domain APIs (`/api/web`, `/api/ml`, `/api/schemes`, `/api/vapi`, `/community`)
- `POST /api/web/chat`: Multimodal chat with crop agronomist AI
- `POST /api/web/vision`: Plant pathology vision model for leaf diagnosis
- `POST /api/web/audio`: Speech-to-text audio query handler
- `GET /api/web/all-market-prices`: Live mandi prices from Gov API with DB fallback
- `GET /api/web/live-mandis`: Nearest APMC yards with road distance & travel time
- `POST /api/ml/predict`: Machine Learning crop yield prediction
- `POST /api/ml/recommend`: Soil & climate-based crop recommendations
- `POST /api/ml/resolve-location`: Reverse geocoding of coordinates & IP addresses
- `GET /api/schemes/all`: List of all active central and state agricultural schemes
- `GET /api/schemes/ai-summary`: AI-generated multilingual summary of scheme
- `GET /community/history`: Message history for community board
- `WS /community/ws`: Real-time WebSocket discussion board

## 3. Vendor Domain APIs (`/api/vendor`)
- `POST /api/vendor/register`: Register new procurement, seller, or hybrid vendor
- `GET /api/vendor/profile`: Get current vendor profile
- `POST /api/vendor/products`: Create product listing
- `GET /api/vendor/products`: List vendor products with filters
- `POST /api/vendor/buying-requirements`: Post new crop buying requirement
- `GET /api/vendor/buying-requirements`: Browse buying requirements
- `POST /api/vendor/buying-requirements/{id}/apply`: Farmer bid submission
- `POST /api/vendor/applications/{id}/negotiate`: Counter-offer negotiation round
- `POST /api/vendor/applications/{id}/accept`: Accept farmer bid and generate procurement order
- `GET /api/vendor/orders`: List customer and procurement orders
- `POST /api/vendor/quality-inspection`: AI crop grade and moisture inspection
- `GET /api/vendor/payouts`: Settlement ledger and wallet payout history
