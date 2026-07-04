    # KrishiAI Backend: Deep Dive Architecture & Library Details

This document provides an exhaustive, highly detailed breakdown of the KrishiAI backend repository. It is designed to cover every single library used, the complete directory structure, and the exact architectural flow of the system.

---

## 1. Complete Library Breakdown (`requirements.txt`)

The project uses a powerful, modern Python stack optimized for asynchronous web serving, AI agentic workflows, and machine learning. Here is every single library and exactly how it is used in the context of this backend:

### Core Web & API Framework
- **`fastapi`**: The primary web framework. Used to build the entire backend architecture (`app/main.py`), including REST endpoints (`app/api/web.py`) and Webhooks for WhatsApp (`app/api/whatsapp.py`). It provides automatic OpenAPI documentation and fast request validation.
- **`uvicorn`**: The lightning-fast ASGI web server used to actually serve the FastAPI application. In `app/main.py`, `uvicorn.run()` is used to boot the server locally.
- **`httptools`**: A high-performance HTTP request parser (written in C). It is essentially a speed optimization library that `uvicorn` utilizes under the hood to handle high-traffic incoming requests efficiently.
- **`python-multipart`**: Essential for parsing `application/x-www-form-urlencoded` requests and multipart form data. In `whatsapp.py`, when Twilio sends incoming WhatsApp messages via Webhooks, it sends them as form data. This library allows FastAPI to parse `await request.form()`.
- **`mangum`**: An adapter for deploying ASGI applications (like FastAPI) to AWS Lambda or Google Cloud Functions. It allows the FastAPI application to run in a serverless environment.

### AI & Agentic Stack
- **`groq`**: The official Python client for Groq's high-speed inference engine. This is the absolute core of KrishiAI's intelligence (`app/core/agent.py`). It is used to query `llama-3.3-70b-versatile` (primary agent logic), `llama-3.1-8b-instant` (error fallbacks/formatting), and `llama-4-scout-17b-16e-instruct` (Vision AI for crop disease).
- **`mcp`**: The Model Context Protocol library. It allows the KrishiAI backend to act as an MCP Server (`app/api/mcp.py` and `python -m app.main mcp`), exporting its 10 custom tools (weather, market, etc.) via standard I/O so that local desktop agents or IDEs can interact with KrishiAI's capabilities natively.

### Networking & External APIs
- **`httpx`**: A modern, fully async HTTP client. Used extensively in `app/api/whatsapp.py` to make non-blocking POST/GET requests to Meta's WhatsApp Graph API, Twilio's API, and external services like OpenWeatherMap without freezing the FastAPI event loop.
- **`twilio`**: The official Twilio SDK. While `httpx` is used for raw API requests, this SDK provides utilities for SMS and Twilio-specific webhook routing (`app/api/sms.py` and parts of `whatsapp.py`).

### Data Validation & Configuration
- **`pydantic`**: Used by FastAPI for defining strict data schemas (e.g., input shapes, JSON body validation). All incoming API requests on the React frontend side are validated using Pydantic `BaseModel` classes.
- **`pydantic-settings`**: Used for type-safe environment variable management, ensuring that configs (like DB URIs or API keys) are validated before the app boots up.
- **`python-dotenv`**: Used to load environment variables from the `.env` file into `os.environ` upon startup (seen at the very top of `app/main.py`).

### Database Stack
- **`sqlalchemy`**: The core Object-Relational Mapper (ORM). Used in `app/db/database.py` and `app/models/` to map Python classes to database tables and handle SQL transactions efficiently. Example: storing farmer GPS locations (`FarmerLocation` model).
- **`psycopg2-binary`**: The PostgreSQL driver for Python. While local development uses a SQLite file (`krishiai.db`), this package proves that the production deployed application uses a PostgreSQL database.

### Machine Learning Stack (Custom Predictors)
Instead of relying entirely on LLMs, KrishiAI embeds strict mathematical and ML models for things like Yield estimation and Pest forecasting:
- **`xgboost`**: Extreme Gradient Boosting. A highly efficient decision-tree-based ML library used for precision tabular data predictions.
- **`scikit-learn`**: Standard machine learning tools (preprocessing, regressions, clustering). Used alongside XGBoost.
- **`joblib`**: A library used for fast disk serialization. It is specifically used to save `.pkl` ML models and load them quickly into active memory inside the FastAPI app.
- **`pandas`**: The industry standard for tabular data manipulation. Used for processing internal market datasets, climate datasets, and ML inputs.
- **`numpy`**: Fast numerical arrays, foundational for `pandas`, `scikit-learn`, and `xgboost`.

---

## 2. Deep Dive: Architectural Structure

The backend is modularized strictly by domain.

### `app/main.py`
The absolute entry point of the server. 
- Loads `.env`.
- Creates the `FastAPI` instance.
- Initializes the SQLAlchemy DB (`Base.metadata.create_all`).
- Adds permissive CORS middleware and a custom ngrok bypass header.
- Includes all sub-routers: REST, tools, Web UI, WhatsApp, SMS, Location, and ML APIs.

### `app/api/` (The Routing Layer)
Handles incoming HTTP requests and delegates them to core logic.
- **`web.py`**: The REST APIs for the React/Next.js frontend. Expects rich Markdown responses to render on UI. 
- **`whatsapp.py`**: A massive webhook handler for WhatsApp. It natively supports both Meta Cloud API and Twilio. It handles smart keyword bypasses (e.g., if you say "weather", it bypasses the LLM to lower latency to ~1 second), image handling (downloading media and passing it to Groq Vision), and audio handling.
- **`mcp.py`**: Hosts the Model Context Protocol server.

### `app/core/` (The Brain)
Where the AI logic lives.
- **`agent.py`**: The absolute core engine. Contains `process_query_base()`. It defines a `TOOLS_SCHEMA` of 10 tools. It manages Groq rate-limiting by automatically falling back from Llama 70B to Llama 8B if hitting a 429 error. It also has a sophisticated regex parser to catch unstructured JSON when the LLM hallucinates a tool call format.
- **`whatsapp_agent.py` / `web_agent.py`**: Channel-specific wrappers that inject distinct system prompts. WhatsApp gets short, punchy, conversational replies with emojis; Web gets structured, detailed markdown.

### `app/services/` (The Capabilities)
The physical implementations of the 10 tools defined in `agent.py`.
1. **`weather.py`**: Interacts with OpenWeatherMap.
2. **`market.py`**: Calculates Minimum Support Price (MSP) and Mandi values based on geography.
3. **`disease.py`**: Interacts with `llama-4-scout-17b-16e-instruct` to process image bytes and diagnose plant issues.
4. **`scheme.py`**: Routes Indian government subsidies and logic (PM-KISAN, etc.).
5. **`crop_advice.py` & `irrigation.py` & `soil.py`**: Core agronomy calculations.
6. **`yield_estimation.py`**: Where the ML libraries (`xgboost`, `pandas`) are primarily leveraged to predict tons/acre.
7. **`pest.py`**: Uses climate datasets (temp/humidity) to alert on specific impending bug attacks.

### `app/models/` & `app/db/` (Data Persistence)
- **`database.py`**: Sets up the SQLAlchemy Engine and `SessionLocal`.
- **`models/`**: Contains the SQL schemas. Ex: `user.py` for standard accounts, `location.py` to persist `(lat, lon)` from WhatsApp so the farmer doesn't have to keep re-sending their GPS ping.

### `app/utils/`
- **`speech.py`**: Used by `whatsapp.py` to transcribe incoming voice notes. Once transcribed, the text is fed directly into the native tool-calling agent.

---

## 3. The "Smart Bypass" Mechanism

A highly notable architectural feature defined in `app/api/whatsapp.py` is the **Zero-Latency Smart Bypass**. 

Because Groq LLM tool calling requires a two-step cycle (User -> Groq -> Groq decides to call tool -> Backend runs tool -> Backend returns to Groq -> Groq generates text), there is inherent latency.

To mitigate this, `whatsapp.py` uses keyword scanning arrays (e.g., `WEATHER_KEYWORDS = ["weather", "mausam"]`). If a user asks "mausam kaisa hai", the backend intercepts it, *skips the first LLM pass completely*, runs the weather function directly, and only uses the LLM once (the smaller `llama-3.1-8b-instant`) to format the resulting string natively in the user's selected language (Hindi, Gujarati, Marathi, etc.).

This allows basic critical queries (Weather, Market Price) to happen locally in under 1 second.
