# Build-With-AI (KrishiAI: Intelligence for the Next Billion Farmers)

<p align="center">
  <img src="readme_header.svg" width="800" alt="KrishiAI Header Animation" />
</p>

<p align="center">
  <img src="blink_status.svg" width="400" alt="Blink Engine Status" />
</p>

> **Empowering agriculture through real-time satellite intelligence, hyper-local market discovery, and multi-modal AI diagnostics.**

KrishiAI is a high-performance, full-stack intelligence platform designed to bridge the gap between advanced geospatial data and the everyday farmer. By leveraging Google Earth Engine and our proprietary "Blink Engine" progressive hydration model, KrishiAI delivers critical crop health metrics in under 4 seconds.

---

## 🏗️ System Architecture

Our platform leverages a modern, serverless-first architecture optimized for high concurrency and low latency.

```mermaid
graph TD
    %% Frontend Layer
    subgraph Frontend [Client / User Interface]
        UI[React 18 + Vite]
        Voice[Vapi Voice Assistant]
        State[Context API]
    end

    %% Backend Layer
    subgraph Backend [FastAPI Intelligence Engine]
        API[FastAPI Router]
        Blink["Blink Engine (Fast Track)"]
        Auth["Security & Auth"]
        Cache["Redis / Memory Cache"]
    end

    %% AI & Data Layer
    subgraph External_Services [AI & Cloud Integrations]
        GEE[Google Earth Engine]
        Gemini[Google Gemini API]
        Groq[Groq Llama 3]
        DB[("Supabase / PostgreSQL")]
    end

    %% Connections
    UI <-->|REST API / WebSockets| API
    Voice <-->|Real-time Audio| Groq
    API --> Blink
    Blink -->|Satellite Data| GEE
    API -->|LLM Reasoning| Gemini
    API -->|Persistence| DB
    API <--> Cache

    classDef primary fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#fff;
    classDef secondary fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef ext fill:#4c1d95,stroke:#8b5cf6,stroke-width:2px,color:#fff;
    
    class UI,Voice,State primary;
    class API,Blink,Auth,Cache secondary;
    class GEE,Gemini,Groq,DB ext;
```

---

## 🚀 The Blink Engine: Sub-4s Satellite Intelligence

Traditional satellite analysis takes minutes. KrishiAI's **Blink Engine** solves this latency gap through:
- **Fast Track**: Delivers current NDVI and weather data in **<3 seconds** using server-side optimizations.
- **Deep Track**: Seamlessly background-loads historical trends and 10m-resolution soil moisture.
- **Warm Boot**: Authentication with Google Cloud occurs at startup, eliminating one-time latency for every query.

<p align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" width="100%" />
</p>

---

## 🛠️ Core Modules

<div align="center">
  <table>
    <tr>
      <td width="50%">
        <h3>📡 Satellite Intel (GEE)</h3>
        Real-time crop health monitoring using Sentinel-2 and NASA SMAP datasets. 10m spatial resolution for precision farming.
      </td>
      <td width="50%">
        <h3>🎙️ Real-time Voice AI</h3>
        Hyper-localized farming advice via a high-fidelity voice interface powered by Vapi, Groq, and Gemini.
      </td>
    </tr>
    <tr>
      <td width="50%">
        <h3>📍 Mandi Map</h3>
        Tactical mapping for finding the best prices at nearby government mandis with direct API integration.
      </td>
      <td width="50%">
        <h3>👥 Community & Diagnostics</h3>
        Instant disease identification using visual AI models and peer-to-peer knowledge hubs.
      </td>
    </tr>
  </table>
</div>

---

## 💻 Tech Stack

<div align="center">
  <img src="https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python-emerald?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/AI-Gemini%20%2B%20Groq-purple?style=for-the-badge&logo=google-gemini" />
  <img src="https://img.shields.io/badge/Cloud-Google%20Earth%20Engine-blue?style=for-the-badge&logo=google-cloud" />
  <img src="https://img.shields.io/badge/Database-Supabase-green?style=for-the-badge&logo=supabase" />
</div>

---

## ⚙️ Getting Started

### 1. Quick Setup
```bash
# Clone the repository
git clone https://github.com/Manav373/Build-With-AI.git
cd Build-With-AI

# Start the Intelligence Engine (Backend)
cd backend 
pip install -r requirements.txt
uvicorn app.main:app --reload

# Start the Frontend
cd ../frontend
npm install
npm run dev
```

### 2. Environment Configuration

Create a `.env` in the `backend/` directory using our template:
```bash
cp backend/.env.example backend/.env
```
Fill in your API keys for Gemini, Groq, Google Maps, and other services.

---

## 🌍 Social Impact

KrishiAI is built to reduce the information asymmetry in rural farming communities, providing high-fidelity data that was previously only accessible to industrial combines.

<p align="center">
  <i>Built with ❤️ for the Next Billion Users.</i>
</p>
