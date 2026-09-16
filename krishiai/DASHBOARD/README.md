# 🌾 KrishiAI — Smart Agriculture Intelligence Platform

> **Version:** 1.0 (MVP & Demonstration Prototype)  
> **Platform:** Web Dashboard + ESP32 IoT Sensor Node  
> **Architecture:** Sense → Understand → Decide → Act → Learn

KrishiAI connects an ESP32-based agricultural field node with environmental and soil sensors to a modern, real-time web dashboard. The platform translates raw telemetry into actionable agricultural intelligence, provides explainable automated irrigation decisions, enforces safety cutoffs, and provides manual controls with full audit logging.

---

## ⚡ Quick Start

### 1. Install & Run Locally
```bash
# Install dependencies
npm install

# Start both Backend API Server (Port 5000) and Frontend Vite Dev (Port 5173)
npm run dev
```

- **Web Dashboard (Vite HMR):** `http://localhost:5173`
- **Backend API & WebSocket Server:** `http://localhost:5000` (also serves production build directly)
- **Live WebSocket Stream:** `ws://localhost:5000/ws`

---

## 🔌 Hardware Pin Mapping (PRD Section 2)

| Component | Purpose | ESP32 Pin | Logic / Signal |
| :--- | :--- | :--- | :--- |
| **ESP32 DevKit** | Main IoT Controller | — | Wi-Fi 802.11 b/g/n |
| **Capacitive Soil Moisture V1.2** | Soil Moisture Measurement | **GPIO 5** | Analog (ADC1_CH6, 0–4095) |
| **DHT11** | Ambient Temp + Air Humidity | **GPIO 25** | 1-Wire Digital Signal |
| **FC-37 Rain Sensor** | Raindrop Detection | **GPIO 27** | Digital Input (Active LOW) |
| **HW-072 / 3362** | Sunlight / Dark Detection | **GPIO 34** | Digital Input (Active LOW, No Lux) |
| **LCD I²C (16x2 / 20x4)** | Field-Side Local Display | **SDA 21 / SCL 22** | I²C Bus (0x27) |
| **Relay Module** | Water Pump Actuator | **GPIO 26** | Digital Output (Active LOW) |
| **Water Pump / Motor** | Irrigation Delivery | **Relay NO/COM** | Switched 5V/12V DC / AC |

---

## 🧠 Core Capabilities & PRD Implementation

### 1. Real-Time Telemetry Cards (PRD Section 7–12)
- **Soil Moisture**: Percentage (0–100%), threshold state badges (`VERY DRY <25%`, `DRY 25–39%`, `GOOD 40–69%`, `WET 70–100%`), raw ADC reading (`2450 ADC`), and calibration limits.
- **Temperature**: Current ambient field temperature with comparative trend indication (`↑ 1.2°C` / `↓ 0.5°C`) and °F conversion.
- **Humidity**: Relative air humidity (% RH) and dew point calculation.
- **Rain Detection**: High-visibility FC-37 indicator banner (`NO RAIN` vs glowing `RAIN DETECTED`) linked to safety interlock.
- **Light Condition**: HW-072 digital day/night detection (`☀️ DAY / LIGHT` vs `🌙 NIGHT / DARK`). *Strictly adheres to PRD hardware specification—no simulated false lux measurements.*
- **Irrigation Pump**: Real-time relay status (`● ON` / `● OFF`), live runtime timer, trigger reason, and operator credit.

### 2. Explainable Agricultural Decision Engine (PRD Section 15, 16, 28)
- Transparent reasoning layer breaking down every decision into 5 stages:
  1. **SENSE**: Ingests raw soil moisture, rain digital state, and micro-climate metrics.
  2. **UNDERSTAND**: Assesses soil tension, water deficit, and precipitation events.
  3. **DECIDE**: Determines whether to engage pump, maintain standby, or hold due to rainfall.
  4. **ACT**: Commands GPIO 26 Relay with safety timers.
  5. **LEARN**: Estimates soil drying velocity (`~2.1%/hr`) and hours until dry condition.

### 3. Comprehensive Safety Guard System (PRD Section 30)
- **Safe Boot State**: Pump is hardcoded and initialized to `OFF` at startup.
- **Maximum Runtime Cutoffs**: Automatic irrigation limits to max 15 minutes; manual limits to max 30 minutes.
- **Rain Interlock**: If rain is detected while the pump is active, the pump immediately shuts down to prevent waterlogging.
- **Watchdog Offline Failsafe**: Auto-shuts down pump if ESP32 telemetry is not received for >30 seconds.
- **Emergency Stop Button**: Prominently pinned in the header and irrigation station for instant de-energization.
- **No False Water Volume Estimates**: Reports precise runtime in minutes and seconds without simulated liters.

### 4. Interactive Live Hardware Simulator
- Built-in floating simulator drawer allowing live testing of:
  - Soil moisture slider (0–100%) with auto-calculated raw ADC voltage
  - Rain trigger toggle (FC-37)
  - Ambient temperature & humidity sliders
  - Daylight / Night condition toggle
  - ESP32 Wi-Fi disconnect/reconnect toggle
  - One-click presets: *🚨 Dry Soil (18%)*, *🌧️ Rain Active*, *🌾 Optimal Field*, *💧 Saturated*.

### 5. Flash-Ready ESP32 Firmware Generator (PRD Section 35)
- In-dashboard Arduino C++ source code viewer (`.ino`) configured with user's Wi-Fi credentials and backend server IP.
- Features automatic HTTP JSON telemetry dispatch and bidirectional pump override commands.

---

## 📡 REST API & WebSocket Specifications (PRD Section 24 & 25)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/devices` | List registered agricultural nodes |
| `GET` | `/api/devices/:id/latest` | Retrieve current telemetry and AI decision |
| `GET` | `/api/devices/:id/history?range=1h\|6h\|24h\|7d\|30d` | Fetch historical sensor trend data points |
| `GET` | `/api/devices/:id/irrigation/history` | Retrieve dedicated irrigation session audit table |
| `GET` | `/api/devices/:id/alerts` | List active and historical incident alerts |
| `POST` | `/api/devices/:id/relay/on` | Authenticated manual pump activation with duration |
| `POST` | `/api/devices/:id/relay/off` | Manual pump stop or emergency cutoff |
| `POST` | `/api/devices/:id/mode` | Switch mode (`AUTO` vs `MANUAL`) |
| `POST` | `/api/devices/:id/telemetry` | Ingest sensor JSON packet from physical ESP32 |
| `POST` | `/api/devices/:id/settings` | Update moisture thresholds and calibration |
| `GET` | `/api/firmware/esp32` | Download configured `.ino` file |
| `WS` | `/ws` | Real-time bidirectional telemetry & alert broadcast |

### Sample ESP32 Telemetry Packet (PRD Section 24)
```json
{
  "deviceId": "krishiai-node-01",
  "soilMoisture": 34,
  "soilRaw": 2450,
  "temperature": 29.8,
  "humidity": 61,
  "rain": false,
  "light": true,
  "pump": false
}
```

---

## 🏗️ Project Structure

```
DASHBOARD/
├── IOT DASHBOARD PRD.docx        # Source Product Requirements Document
├── index.html                     # Entry HTML with Outfit & Inter typography
├── vite.config.js                 # Vite + Proxy config
├── package.json                   # Dependencies & build scripts
├── server/
│   ├── server.js                  # Express REST API + WebSocket Server
│   ├── storage.js                 # In-Memory & Historical Data Store
│   ├── decisionEngine.js          # Agricultural Explainable Rule Engine
│   ├── safetyEngine.js            # PRD Section 30 Safety Safeguards
│   └── firmwareGenerator.js       # ESP32 Arduino .ino Generator
├── src/
│   ├── index.css                  # Bespoke Vanilla CSS Design System
│   ├── main.jsx                   # React Mount Entry
│   ├── App.jsx                    # Application State & WebSocket Listener
│   └── components/
│       ├── Header.jsx             # Top bar, Live Relative Clock, Emergency Stop
│       ├── Navigation.jsx         # 10 Navigation Tab Switcher with Alert Badges
│       ├── SensorCards.jsx        # 6 Real-time Sensor Cards (Soil, Temp, Rain, Light, etc.)
│       ├── DecisionEngineCard.jsx # 5-Step Explainable Reasoning Pipeline
│       ├── ManualPumpControl.jsx  # Pump Station with Auto/Manual & Safety Checks
│       ├── PumpControlModal.jsx   # Confirmation Dialog with Duration Selector
│       ├── AnalyticsCharts.jsx    # Multi-Range Time Filtered Chart.js Trends
│       ├── IrrigationHistoryTable.jsx # Irrigation History Table with CSV Export
│       ├── FarmZonesView.jsx      # Zone A Active + Zone B & C Expansion Topology
│       ├── DeviceHealthView.jsx   # ESP32 Specs, Hardware Pinout Table & Diagnostics
│       ├── DetailedSensorsView.jsx# Sensor Specs & Raw ADC Data Model
│       ├── AlertsCenter.jsx       # Alert Incident Manager & Ack System
│       ├── Esp32FirmwareView.jsx  # Arduino C++ Code Viewer & Downloader
│       ├── SettingsView.jsx       # Moisture Thresholds & Security Audit Trail
│       └── HardwareSimulator.jsx  # Live Interactive ESP32 Signal Drawer
└── dist/                          # Production Build Bundle
```
