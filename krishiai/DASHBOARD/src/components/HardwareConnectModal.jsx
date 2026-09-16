import React, { useState, useEffect, useRef } from 'react';
import { 
  Usb, 
  Wifi, 
  Cpu, 
  X, 
  Check, 
  Copy, 
  Download, 
  Terminal, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  ArrowRight,
  ExternalLink,
  Layers,
  Zap
} from 'lucide-react';

export default function HardwareConnectModal({ 
  isOpen, 
  onClose, 
  device, 
  onSendTelemetry,
  telemetry 
}) {
  const [activeMode, setActiveMode] = useState('wifi'); // 'wifi' | 'usb' | 'pinout'
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [serverIp, setServerIp] = useState('192.168.0.107'); // Detected local IP
  const [serverPort, setServerPort] = useState('5000');
  const [copied, setCopied] = useState(false);

  // Web Serial State
  const [serialConnected, setSerialConnected] = useState(false);
  const [serialLogs, setSerialLogs] = useState([]);
  const [baudRate, setBaudRate] = useState(115200);
  const portRef = useRef(null);
  const readerRef = useRef(null);
  const keepReadingRef = useRef(false);

  const [availablePorts, setAvailablePorts] = useState([]);
  const [selectedPortPath, setSelectedPortPath] = useState('');
  const [serverSerialConnected, setServerSerialConnected] = useState(false);
  const [loadingPorts, setLoadingPorts] = useState(false);
  const previousPortsRef = useRef([]);

  // Fetch available COM ports from PC backend with smart auto-detection
  const refreshPorts = async (silent = false) => {
    if (!silent) setLoadingPorts(true);
    try {
      const res = await fetch('/api/serial/ports');
      const data = await res.json();
      if (data.success && Array.isArray(data.ports)) {
        const newPorts = data.ports;
        const prevPorts = previousPortsRef.current;

        // Check if a new USB device was just plugged in
        const newlyAdded = newPorts.filter(np => !prevPorts.some(op => op.path === np.path));
        if (newlyAdded.length > 0 && prevPorts.length > 0) {
          const newUsb = newlyAdded.find(p => !p.isBluetooth || p.isEsp32) || newlyAdded[0];
          setSelectedPortPath(newUsb.path);
          addLog(`[AUTO-DETECT] 🔌 New Hardware Plugged In: ${newUsb.path} (${newUsb.friendlyName})`);
        }

        // If nothing is selected or current selection is a BT port but a real USB port exists, pick the USB port
        const bestUsbPort = newPorts.find(p => p.isEsp32 || !p.isBluetooth);
        if (!selectedPortPath && bestUsbPort) {
          setSelectedPortPath(bestUsbPort.path);
        } else if (!selectedPortPath && newPorts.length > 0) {
          setSelectedPortPath(newPorts[0].path);
        }

        previousPortsRef.current = newPorts;
        setAvailablePorts(newPorts);
      }
    } catch (e) {
      if (!silent) console.warn('Failed to fetch serial ports:', e);
    } finally {
      if (!silent) setLoadingPorts(false);
    }
  };

  // Real-time automatic port polling (every 1.5 seconds)
  useEffect(() => {
    if (!isOpen) return;

    // Initial immediate fetch
    refreshPorts(false);

    // Auto-poll interval to automatically catch plugged/unplugged hardware
    const interval = setInterval(() => {
      refreshPorts(true);
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen, selectedPortPath]);

  const handleServerConnectSerial = async () => {
    if (!selectedPortPath) return;
    try {
      const res = await fetch('/api/serial/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: selectedPortPath, baudRate })
      });
      const data = await res.json();
      if (data.success) {
        setServerSerialConnected(true);
        addLog(`[SERVER] 🔌 Successfully connected backend to ${selectedPortPath} at ${baudRate} baud`);
      } else {
        addLog(`[SERVER ERROR] ${data.error}`);
      }
    } catch (err) {
      addLog(`[SERVER ERROR] ${err.message}`);
    }
  };

  const handleServerDisconnectSerial = async () => {
    try {
      await fetch('/api/serial/disconnect', { method: 'POST' });
      setServerSerialConnected(false);
      addLog('[SERVER] Disconnected COM port.');
    } catch (e) {}
  };

  if (!isOpen) return null;

  // Web Serial Connection Handler
  const handleConnectSerial = async () => {
    if (!('serial' in navigator)) {
      alert('Web Serial API is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Opera.');
      return;
    }

    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: Number(baudRate) });
      portRef.current = port;
      setSerialConnected(true);
      keepReadingRef.current = true;
      addLog(`[SYSTEM] Connected to Serial Port at ${baudRate} baud.`);

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      let lineBuffer = '';

      while (keepReadingRef.current) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          lineBuffer += value;
          const lines = lineBuffer.split('\n');
          lineBuffer = lines.pop(); // keep partial line in buffer

          let currentBlock = {};

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed) {
              addLog(`[RX] ${trimmed}`);
              
              // 1. Try parsing JSON telemetry
              if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                try {
                  const data = JSON.parse(trimmed);
                  if (data.deviceId || data.soilMoisture !== undefined) {
                    onSendTelemetry(data);
                    addLog(`[SYNC] ✅ Ingested JSON: Soil ${data.soilMoisture}%, Temp ${data.temperature}°C`);
                  }
                } catch (e) {}
              } 
              // 2. Parse User's exact code.txt human-readable printSerialData() output
              else {
                if (trimmed.includes('Soil Raw')) {
                  const val = parseInt(trimmed.split(':')[1]);
                  if (!isNaN(val)) currentBlock.soilRaw = val;
                } else if (trimmed.includes('Soil Moisture')) {
                  const val = parseInt(trimmed.split(':')[1].replace('%', ''));
                  if (!isNaN(val)) currentBlock.soilMoisture = val;
                } else if (trimmed.includes('Temperature')) {
                  const val = parseFloat(trimmed.split(':')[1].replace('C', ''));
                  if (!isNaN(val)) currentBlock.temperature = val;
                } else if (trimmed.includes('Humidity')) {
                  const val = parseFloat(trimmed.split(':')[1].replace('%', ''));
                  if (!isNaN(val)) currentBlock.humidity = val;
                } else if (trimmed.includes('Rain') && !trimmed.includes('Rain Status')) {
                  currentBlock.rain = !trimmed.includes('NO RAIN');
                } else if (trimmed.includes('Light') && !trimmed.includes('Light Raw')) {
                  currentBlock.light = trimmed.includes('LIGHT') && !trimmed.includes('DARK');
                } else if (trimmed.includes('Relay')) {
                  currentBlock.pump = trimmed.includes('ON');
                } else if (trimmed.includes('----------------------------------------') || trimmed.includes('========================================')) {
                  if (currentBlock.soilMoisture !== undefined || currentBlock.temperature !== undefined) {
                    onSendTelemetry({
                      deviceId: 'krishiai-node-01',
                      ...currentBlock
                    });
                    addLog(`[SYNC] ✅ Ingested Hardware: Soil ${currentBlock.soilMoisture}%, Temp ${currentBlock.temperature}°C, Rain: ${currentBlock.rain ? 'YES' : 'NO'}`);
                    currentBlock = {};
                  }
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Serial connection error:', err);
      addLog(`[ERROR] Connection failed: ${err.message}`);
      setSerialConnected(false);
    }
  };

  const handleDisconnectSerial = async () => {
    keepReadingRef.current = false;
    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch (e) {}
    }
    if (portRef.current) {
      try {
        await portRef.current.close();
      } catch (e) {}
    }
    setSerialConnected(false);
    addLog('[SYSTEM] Disconnected from Serial Port.');
  };

  const addLog = (msg) => {
    const timestamp = new Date().toLocaleTimeString();
    setSerialLogs(prev => [...prev.slice(-40), `${timestamp} ${msg}`]);
  };

  const generateFullCode = () => {
    return `/*
 * 🌾 KrishiAI ESP32 Node Firmware (Complete Physical Setup)
 * Hardware Pin Mapping (PRD Section 2):
 * - Capacitive Soil Moisture V1.2 : GPIO 5  (Analog ADC1_CH6)
 * - DHT11 (Temp + Humidity)       : GPIO 25 (Digital 1-Wire)
 * - FC-37 Rain Sensor             : GPIO 27 (Digital Input, Active LOW)
 * - HW-072 / 3362 (Light/Dark)    : GPIO 34 (Digital Input, Active LOW)
 * - LCD I2C (16x2 / 20x4)         : SDA 21 / SCL 22
 * - Relay (Water Pump Controller) : GPIO 26 (Digital Output)
 * 
 * Safety: Pump is guaranteed OFF at boot.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// ===== CONFIGURATION =====
const char* ssid     = "${wifiSSID || 'YOUR_WIFI_NAME'}";
const char* password = "${wifiPass || 'YOUR_WIFI_PASSWORD'}";

// KrishiAI Server URL (Your Laptop IP & Port)
const char* serverUrl = "http://${serverIp}:${serverPort}/api/devices/krishiai-node-01/telemetry";

// Pin Definitions
#define PIN_SOIL_ANALOG    5   // Capacitive Moisture Sensor
#define PIN_DHT            25  // DHT11 Sensor
#define PIN_RAIN_DIGITAL   27  // FC-37 Rain Sensor
#define PIN_LIGHT_DIGITAL  34  // HW-072 Light/Dark Sensor
#define PIN_RELAY_PUMP     26  // Relay Module

#define DHTTYPE            DHT11
#define RELAY_ACTIVE_STATE LOW   // LOW for active-low relay, HIGH for active-high
#define RELAY_OFF_STATE    HIGH

DHT dht(PIN_DHT, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

unsigned long lastSendTime = 0;
const unsigned long sendInterval = 4000; // Send telemetry every 4 seconds
bool currentPumpState = false;

// Calibration for Capacitive Soil Moisture (PRD Section 24)
const int AIR_VALUE = 3200;   // Value in dry air (0% moisture)
const int WATER_VALUE = 1200; // Value in water cup (100% moisture)

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\\n===========================================");
  Serial.println("  🌾 KrishiAI ESP32 Node 01 Initializing   ");
  Serial.println("===========================================");

  // PRD Safety Rule 1: Pump MUST start in OFF state
  pinMode(PIN_RELAY_PUMP, OUTPUT);
  digitalWrite(PIN_RELAY_PUMP, RELAY_OFF_STATE);
  currentPumpState = false;
  Serial.println("[SAFETY] Relay initialized to OFF.");

  // Sensor Pins
  pinMode(PIN_SOIL_ANALOG, INPUT);
  pinMode(PIN_RAIN_DIGITAL, INPUT_PULLUP);
  pinMode(PIN_LIGHT_DIGITAL, INPUT);

  // Initialize DHT
  dht.begin();
  
  // Initialize LCD
  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("KrishiAI Node 01");
  lcd.setCursor(0, 1);
  lcd.print("Connecting WiFi..");

  // Connect WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\\n[WIFI] Connected! Node IP: " + WiFi.localIP().toString());
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("KrishiAI Online");
    lcd.setCursor(0, 1);
    lcd.print(WiFi.localIP().toString());
  } else {
    Serial.println("\\n[WIFI] Not connected. Running in USB Serial mode.");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("USB Serial Mode");
  }
  delay(1000);
}

void loop() {
  unsigned long currentMillis = millis();
  if (currentMillis - lastSendTime >= sendInterval) {
    lastSendTime = currentMillis;
    readSensorsAndSync();
  }
}

void readSensorsAndSync() {
  // 1. Read Capacitive Soil Moisture (GPIO 5)
  int rawSoil = analogRead(PIN_SOIL_ANALOG);
  int soilPercent = map(rawSoil, AIR_VALUE, WATER_VALUE, 0, 100);
  soilPercent = constrain(soilPercent, 0, 100);

  // 2. Read DHT11 Temperature & Humidity (GPIO 25)
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();
  if (isnan(temp) || isnan(humidity)) {
    temp = 28.5;
    humidity = 60.0;
  }

  // 3. Read FC-37 Rain Sensor (GPIO 27, Active LOW)
  bool rainDetected = (digitalRead(PIN_RAIN_DIGITAL) == LOW);

  // 4. Read HW-072 Light Sensor (GPIO 34, LOW = Sunlight, HIGH = Dark)
  bool isDayLight = (digitalRead(PIN_LIGHT_DIGITAL) == LOW);

  // 5. Update Local LCD Display (PRD Section 2)
  lcd.setCursor(0, 0);
  lcd.print("S:" + String(soilPercent) + "% T:" + String((int)temp) + "C H:" + String((int)humidity) + "% ");
  lcd.setCursor(0, 1);
  String rainStr = rainDetected ? "RAIN! " : "DRY   ";
  String pumpStr = currentPumpState ? "PUMP:ON " : "PUMP:OFF";
  lcd.print(rainStr + pumpStr + "    ");

  // 6. Build JSON Document (PRD Section 24 Data Model)
  StaticJsonDocument<256> doc;
  doc["deviceId"] = "krishiai-node-01";
  doc["soilMoisture"] = soilPercent;
  doc["soilRaw"] = rawSoil;
  doc["temperature"] = temp;
  doc["humidity"] = humidity;
  doc["rain"] = rainDetected;
  doc["light"] = isDayLight;
  doc["pump"] = currentPumpState;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  // Output to USB Serial (For Direct Web Serial connection)
  Serial.println(jsonPayload);

  // Send via Wi-Fi HTTP if connected
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    int httpCode = http.POST(jsonPayload);
    if (httpCode > 0) {
      String response = http.getString();
      StaticJsonDocument<384> resDoc;
      if (!deserializeJson(resDoc, response)) {
        if (resDoc.containsKey("pumpCommand")) {
          bool desiredState = resDoc["pumpCommand"].as<bool>();
          if (desiredState != currentPumpState) {
            setRelayState(desiredState);
          }
        }
      }
    }
    http.end();
  }
}

void setRelayState(bool turnOn) {
  currentPumpState = turnOn;
  digitalWrite(PIN_RELAY_PUMP, turnOn ? RELAY_ACTIVE_STATE : RELAY_OFF_STATE);
  Serial.printf("[RELAY] Switched to: %s\\n", turnOn ? "ON" : "OFF");
}
`;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generateFullCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadIno = () => {
    const blob = new Blob([generateFullCode()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'KrishiAI_ESP32_Node.ino';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #10b981 0%, #0284c7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={22} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Connect Physical ESP32 Hardware</h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Connect your real sensor node via Wi-Fi Network or Direct USB Cable
              </div>
            </div>
          </div>

          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.35rem 0.5rem', border: 'none' }}>
            <X size={18} />
          </button>
        </div>

        {/* Connection Mode Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <button
            className={`btn-secondary ${activeMode === 'wifi' ? 'active' : ''}`}
            style={{ 
              borderColor: activeMode === 'wifi' ? 'var(--emerald-500)' : 'var(--border-subtle)',
              background: activeMode === 'wifi' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: activeMode === 'wifi' ? 'var(--emerald-400)' : 'var(--text-secondary)',
              fontWeight: 700
            }}
            onClick={() => setActiveMode('wifi')}
          >
            <Wifi size={16} />
            <span>Method 1: Wi-Fi REST Sync (Recommended)</span>
          </button>

          <button
            className={`btn-secondary ${activeMode === 'usb' ? 'active' : ''}`}
            style={{ 
              borderColor: activeMode === 'usb' ? 'var(--sky-500)' : 'var(--border-subtle)',
              background: activeMode === 'usb' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: activeMode === 'usb' ? 'var(--sky-400)' : 'var(--text-secondary)',
              fontWeight: 700
            }}
            onClick={() => setActiveMode('usb')}
          >
            <Usb size={16} />
            <span>Method 2: Direct USB Serial (COM Port)</span>
          </button>

          <button
            className={`btn-secondary ${activeMode === 'pinout' ? 'active' : ''}`}
            style={{ 
              borderColor: activeMode === 'pinout' ? 'var(--amber-500)' : 'var(--border-subtle)',
              background: activeMode === 'pinout' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: activeMode === 'pinout' ? 'var(--amber-400)' : 'var(--text-secondary)',
              fontWeight: 700
            }}
            onClick={() => setActiveMode('pinout')}
          >
            <Layers size={16} />
            <span>Wiring Schematic</span>
          </button>
        </div>

        {/* MODE 1: WI-FI SETUP */}
        {activeMode === 'wifi' && (
          <div>
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-400)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                <CheckCircle2 size={16} /> Detected Server IP on Local Wi-Fi: <strong>http://{serverIp}:{serverPort}</strong>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Your laptop and ESP32 must be connected to the same Wi-Fi router / hotspot. The ESP32 will transmit sensor readings directly to: <br/>
                <code className="font-mono" style={{ color: 'var(--emerald-400)', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>
                  http://{serverIp}:{serverPort}/api/devices/krishiai-node-01/telemetry
                </code>
              </p>
            </div>

            {/* Wi-Fi Config Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Your Wi-Fi SSID (Name):
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. JioFiber_Home" 
                  value={wifiSSID}
                  onChange={(e) => setWifiSSID(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'white', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Your Wi-Fi Password:
                </label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'white', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Quick Step Guide */}
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-highlight)', marginBottom: '0.5rem' }}>
                🚀 3-Step Flashing Guide:
              </div>
              <ol style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <li>Open <strong>Arduino IDE</strong> and install libraries: <code className="font-mono">ArduinoJson</code> (v6/v7), <code className="font-mono">DHT sensor library</code>, <code className="font-mono">LiquidCrystal_I2C</code>.</li>
                <li>Click <strong>"Download .ino Code"</strong> below and open the file in Arduino IDE.</li>
                <li>Select board <strong>"ESP32 Dev Module"</strong>, choose your COM port, and click <strong>Upload (Ctrl+U)</strong>.</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={copyCode}>
                {copied ? <Check size={16} color="var(--emerald-400)" /> : <Copy size={16} />}
                <span>{copied ? 'Code Copied!' : 'Copy Code'}</span>
              </button>
              <button className="btn-primary" onClick={downloadIno}>
                <Download size={16} />
                <span>Download Ready-to-Flash .ino File</span>
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: DIRECT USB SERIAL */}
        {activeMode === 'usb' && (
          <div>
            <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--sky-400)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                <Usb size={18} /> Option 1: Direct USB Cable Connection (Real-Time Sensor Sync)
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Plug your ESP32 into your laptop's USB port. The dashboard automatically parses your exact sensor output from <code className="font-mono" style={{ color: 'var(--emerald-400)' }}>code.txt</code> (Soil, Temp, Humidity, Rain, Light, Relay) without changing any code!
              </p>
            </div>

            {/* Server-Side Direct COM Port Link */}
            <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-highlight)' }}>
                      Available COM Ports on Host:
                    </span>
                    <span style={{ color: 'var(--emerald-400)', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(22, 163, 74, 0.15)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(22, 163, 74, 0.3)' }}>
                      <span className="status-dot online" style={{ width: '6px', height: '6px' }}></span> Auto-polling (1.5s)
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Select your ESP32 hardware device or specify COM port:
                  </div>
                </div>
                <button className="btn-secondary" onClick={() => refreshPorts(false)} disabled={loadingPorts} style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}>
                  {loadingPorts ? 'Scanning...' : 'Rescan Ports'}
                </button>
              </div>

              {/* Clickable Port Badges Grid */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {availablePorts.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                    No active ports detected. Verify USB data cable connection.
                  </div>
                ) : (
                  availablePorts.map((p) => {
                    const isSelected = selectedPortPath === p.path;
                    return (
                      <button
                        key={p.path}
                        type="button"
                        onClick={() => setSelectedPortPath(p.path)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.4rem 0.75rem',
                          borderRadius: 'var(--radius-xs)',
                          border: isSelected ? '1px solid var(--emerald-400)' : '1px solid var(--border-subtle)',
                          background: isSelected ? 'rgba(22, 163, 74, 0.2)' : 'var(--bg-surface)',
                          color: isSelected ? '#ffffff' : (p.isEsp32 ? 'var(--emerald-400)' : 'var(--text-primary)'),
                          cursor: 'pointer',
                          fontWeight: isSelected || p.isEsp32 ? 600 : 400,
                          fontSize: '0.8rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Usb size={13} />
                        <span className="font-mono">{p.path}</span>
                        {p.isEsp32 && <span style={{ fontSize: '0.68rem', color: 'var(--emerald-400)', background: 'rgba(22, 163, 74, 0.25)', padding: '1px 4px', borderRadius: '2px' }}>USB UART</span>}
                        {p.isBluetooth && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>BT</span>}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Manual Input + Dropdown + Baud Rate + Connect Button */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr auto', gap: '0.75rem', alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Selected COM Port:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. COM3 or COM4"
                    value={selectedPortPath}
                    onChange={(e) => setSelectedPortPath(e.target.value.toUpperCase())}
                    disabled={serverSerialConnected}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      background: '#090f1d',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#ffffff',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Baud Rate:
                  </label>
                  <select 
                    value={baudRate} 
                    onChange={(e) => setBaudRate(e.target.value)}
                    disabled={serverSerialConnected || serialConnected}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      background: '#090f1d',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#ffffff',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value={115200} style={{ backgroundColor: '#090f1d', color: '#ffffff' }}>115200 Baud (code.txt default)</option>
                    <option value={9600} style={{ backgroundColor: '#090f1d', color: '#ffffff' }}>9600 Baud</option>
                    <option value={57600} style={{ backgroundColor: '#090f1d', color: '#ffffff' }}>57600 Baud</option>
                  </select>
                </div>

                <div style={{ paddingTop: '1.2rem' }}>
                  {!serverSerialConnected ? (
                    <button 
                      id="btn-server-connect-serial" 
                      className="btn-primary" 
                      onClick={handleServerConnectSerial}
                      disabled={!selectedPortPath}
                      style={{ padding: '0.55rem 1.25rem', whiteSpace: 'nowrap' }}
                    >
                      <Usb size={16} />
                      <span>Connect {selectedPortPath || 'Port'}</span>
                    </button>
                  ) : (
                    <button 
                      id="btn-server-disconnect-serial" 
                      className="btn-danger" 
                      onClick={handleServerDisconnectSerial}
                      style={{ padding: '0.55rem 1.25rem', whiteSpace: 'nowrap' }}
                    >
                      <X size={16} />
                      <span>Disconnect {selectedPortPath}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Browser Web Serial Connect Button (Alternative Direct Browser Tab Method) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-highlight)' }}>
                  Alternative: Direct Browser Web Serial API
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Opens browser device picker (Chrome / Edge)
                </div>
              </div>
              {!serialConnected ? (
                <button id="btn-start-web-serial" className="btn-secondary" onClick={handleConnectSerial} style={{ fontSize: '0.8rem' }}>
                  <Usb size={14} color="var(--sky-400)" />
                  <span>Open Browser Port Picker</span>
                </button>
              ) : (
                <button id="btn-stop-web-serial" className="btn-danger" onClick={handleDisconnectSerial} style={{ fontSize: '0.8rem' }}>
                  <X size={14} />
                  <span>Disconnect Web Serial</span>
                </button>
              )}
            </div>

            {/* Live Terminal */}
            <div style={{ 
              background: '#040810', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1rem',
              height: '220px',
              overflowY: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: '#38bdf8',
              lineHeight: 1.45
            }}>
              {serialLogs.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: '3.5rem' }}>
                  Serial Monitor Ready. Select your COM Port above and click Connect.
                </div>
              ) : (
                serialLogs.map((log, idx) => (
                  <div key={idx} style={{ color: log.includes('✅') ? '#34d399' : log.includes('ERROR') ? '#fb7185' : '#94a3b8' }}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MODE 3: WIRING PINOUT */}
        {activeMode === 'pinout' && (
          <div>
            <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Connect your sensors and actuators to the ESP32 according to the PRD Section 2 mapping:
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>ESP32 Pin</th>
                    <th>Signal Type</th>
                    <th>Wiring Guide</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Capacitive Soil V1.2</strong></td>
                    <td><span className="font-mono" style={{ color: 'var(--emerald-400)' }}>GPIO 5</span></td>
                    <td>Analog (ADC1_CH6)</td>
                    <td>VCC → 3.3V, GND → GND, AOUT → GPIO 5</td>
                  </tr>
                  <tr>
                    <td><strong>DHT11 (Temp & Humidity)</strong></td>
                    <td><span className="font-mono" style={{ color: 'var(--amber-400)' }}>GPIO 25</span></td>
                    <td>Digital 1-Wire</td>
                    <td>VCC → 3.3V, GND → GND, DATA → GPIO 25</td>
                  </tr>
                  <tr>
                    <td><strong>FC-37 Rain Sensor</strong></td>
                    <td><span className="font-mono" style={{ color: 'var(--sky-400)' }}>GPIO 27</span></td>
                    <td>Digital Input</td>
                    <td>VCC → 3.3V, GND → GND, DOUT → GPIO 27</td>
                  </tr>
                  <tr>
                    <td><strong>HW-072 Light/Dark</strong></td>
                    <td><span className="font-mono" style={{ color: '#facc15' }}>GPIO 34</span></td>
                    <td>Digital Input</td>
                    <td>VCC → 3.3V, GND → GND, DOUT → GPIO 34</td>
                  </tr>
                  <tr>
                    <td><strong>LCD 16x2 / 20x4 I²C</strong></td>
                    <td><span className="font-mono" style={{ color: '#c084fc' }}>SDA 21 / SCL 22</span></td>
                    <td>I²C Bus (0x27)</td>
                    <td>VCC → 5V/3.3V, GND → GND, SDA → 21, SCL → 22</td>
                  </tr>
                  <tr>
                    <td><strong>Relay Module (Pump)</strong></td>
                    <td><span className="font-mono" style={{ color: 'var(--rose-400)' }}>GPIO 26</span></td>
                    <td>Digital Output</td>
                    <td>VCC → 5V, GND → GND, IN → GPIO 26</td>
                  </tr>
                  <tr>
                    <td><strong>Water Pump / Motor</strong></td>
                    <td><span className="font-mono">Relay NO / COM</span></td>
                    <td>Switched Load</td>
                    <td>Connect power line through Relay Normally Open</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
