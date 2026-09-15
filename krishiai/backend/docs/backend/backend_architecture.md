# ⚙️ KrishiAI — Backend Architecture

## 1. Technical Stack
- **Framework**: FastAPI (Python 3.11+)
- **ORM & DB**: SQLAlchemy with SQLite/PostgreSQL
- **AI & MCP**: Google Gemini 1.5 Pro/Flash, Groq Llama-3-70B, Google Earth Engine, Model Context Protocol (MCP) Server
- **Voice & SMS**: Vapi AI Assistant, Twilio WhatsApp & SMS

## 2. Directory Layout
```
backend/
├── farmer/         # Farmer controllers, routes, ML services, and validators
├── vendor/         # Vendor controllers, routes, order workflows, and payouts
├── shared/         # Weather, Mandi, Location, and Groq AI utilities
├── app/            # FastAPI initialization and middleware configuration
└── server.py       # Development and production Uvicorn entry point
```
