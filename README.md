# Build-With-AI (KrishiAI: Intelligence for the Next Billion Farmers)

<p align="center">
  <img src="readme_header.svg" width="800" alt="KrishiAI Header Animation" />
</p>

<p align="center">
  <img src="blink_status.svg" width="400" alt="Blink Engine Status" />
</p>

> **Empowering agriculture through real-time satellite intelligence, hyper-local market discovery, and multi-modal AI diagnostics.**

KrishiAI is a high-performance, full-stack intelligence platform designed to bridge the gap between advanced geospatial data and the everyday farmer. By leveraging Google Earth Engine and the "Blink Engine" progressive hydration model, KrishiAI delivers critical crop health metrics in under 4 seconds.

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
</div>

---

## ⚙️ Getting Started

### 1. Quick Setup
```bash
# Clone and enter directory
git clone https://github.com/your-repo/krishiai.git
cd krishiai

# Start the Intelligence Engine (Backend)
cd backend && ./deploy_local.sh
```

### 2. Environment Configuration

Create a `.env` in the `backend/` directory:

| Variable | Description |
| :--- | :--- |
| `GEE_SERVICE_ACCOUNT_JSON` | Path to your GCP Key (e.g., `/etc/secrets/gee_key.json`) |
| `GEMINI_API_KEY` | Your Google Gemini API Key |
| `GROQ_API_KEY` | Your Groq API Key |

---

## 🌍 Social Impact
KrishiAI is built to reduce the information asymmetry in rural farming communities, providing high-fidelity data that was previously only accessible to industrial combines.

---

<p align="center">
  <i>Built with ❤️ for the Hackathon Prototype. Optimized for the Next Billion Users.</i>
</p>
