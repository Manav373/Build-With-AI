import React, { useState } from 'react';
import { Code2, Download, Copy, Check, Terminal, ExternalLink, Cpu } from 'lucide-react';

export default function Esp32FirmwareView({ device }) {
  const [copied, setCopied] = useState(false);
  const [wifiSSID, setWifiSSID] = useState('MyHomeWiFi');
  const [wifiPass, setWifiPass] = useState('MyWiFiPassword');
  const [serverIp, setServerIp] = useState('192.168.1.100');
  const [serverPort, setServerPort] = useState('5000');

  const firmwareCode = `/*
 * KrishiAI ESP32 Physical Node Firmware v1.0
 * Hardware Pin Mapping based on KrishiAI PRD:
 * - Capacitive Soil Moisture V1.2: GPIO 5 (ADC)
 * - DHT11 (Temp + Humidity): GPIO 25
 * - FC-37 Rain Sensor: GPIO 27 (Digital Input)
 * - HW-072 / 3362 (Light/Dark): GPIO 34 (Digital Input)
 * - LCD I2C (16x2 / 20x4): SDA 21 / SCL 22
 * - Relay (Pump Controller): GPIO 26 (Digital Output)
 * 
 * Safety: Pump is guaranteed OFF at boot.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// WiFi Configuration
const char* ssid = "${wifiSSID}";
const char* password = "${wifiPass}";

// KrishiAI Server API Endpoint
const char* serverUrl = "http://${serverIp}:${serverPort}/api/devices/krishiai-node-01/telemetry";

// Hardware Pin Definitions (PRD Section 2)
#define PIN_SOIL_ANALOG    5   // Capacitive Moisture Sensor
#define PIN_DHT            25  // DHT11 Sensor
#define PIN_RAIN_DIGITAL   27  // FC-37 Rain Sensor (LOW = Rain)
#define PIN_LIGHT_DIGITAL  34  // HW-072 Light/Dark (LOW = Bright/Day)
#define PIN_RELAY_PUMP     26  // Relay module (Active LOW/HIGH)

#define DHTTYPE            DHT11
#define RELAY_ACTIVE_STATE LOW   // Set LOW if active-low relay
#define RELAY_OFF_STATE    HIGH

DHT dht(PIN_DHT, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

unsigned long lastSendTime = 0;
const unsigned long sendInterval = 5000; // 5 seconds
bool currentPumpState = false;

// Calibration values for Capacitive Sensor
const int AIR_VALUE = 3200;   // Value in dry air
const int WATER_VALUE = 1200; // Value in water cup

void setup() {
  Serial.begin(115200);
  Serial.println("\\n====================================");
  Serial.println("  KrishiAI ESP32 Field Node Booting ");
  Serial.println("====================================");

  // Safety Requirement 1: Pump MUST start in OFF state
  pinMode(PIN_RELAY_PUMP, OUTPUT);
  digitalWrite(PIN_RELAY_PUMP, RELAY_OFF_STATE);
  currentPumpState = false;
  Serial.println("[SAFETY] Relay initialized to OFF.");

  // Sensor Pin Configurations
  pinMode(PIN_SOIL_ANALOG, INPUT);
  pinMode(PIN_RAIN_DIGITAL, INPUT_PULLUP);
  pinMode(PIN_LIGHT_DIGITAL, INPUT);

  // Initialize Sensors & Peripherals
  dht.begin();
  
  // Initialize LCD
  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("KrishiAI Node 01");
  lcd.setCursor(0, 1);
  lcd.print("Connecting WiFi..");

  // Connect to WiFi
  connectWiFi();
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("KrishiAI Online");
  delay(1000);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  unsigned long currentMillis = millis();
  if (currentMillis - lastSendTime >= sendInterval) {
    lastSendTime = currentMillis;
    readSensorsAndSync();
  }
}

void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\\nWiFi Connected! IP: " + WiFi.localIP().toString());
  }
}

void readSensorsAndSync() {
  // 1. Read Capacitive Soil Moisture
  int rawSoil = analogRead(PIN_SOIL_ANALOG);
  int soilPercent = map(rawSoil, AIR_VALUE, WATER_VALUE, 0, 100);
  soilPercent = constrain(soilPercent, 0, 100);

  // 2. Read DHT11 Temperature & Humidity
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();
  if (isnan(temp) || isnan(humidity)) {
    temp = 28.5;
    humidity = 60.0;
  }

  // 3. Read FC-37 Rain Sensor (Active LOW)
  bool rainDetected = (digitalRead(PIN_RAIN_DIGITAL) == LOW);

  // 4. Read HW-072 Light Sensor (LOW = Bright/Day)
  bool isDayLight = (digitalRead(PIN_LIGHT_DIGITAL) == LOW);

  // 5. Update Local LCD Display (PRD Section 2)
  updateLcd(soilPercent, temp, humidity, rainDetected, currentPumpState);

  // 6. Send Telemetry to KrishiAI Backend
  if (WiFi.status() == WL_CONNECTED) {
    sendTelemetryToServer(rawSoil, soilPercent, temp, humidity, rainDetected, isDayLight);
  }
}

void updateLcd(int soil, float temp, float hum, bool rain, bool pump) {
  lcd.setCursor(0, 0);
  lcd.print("S:" + String(soil) + "% T:" + String((int)temp) + "C H:" + String((int)hum) + "%");
  
  lcd.setCursor(0, 1);
  String statusStr = rain ? "RAIN! " : "DRY   ";
  String pumpStr = pump ? "PUMP:ON " : "PUMP:OFF";
  lcd.print(statusStr + pumpStr);
}

void sendTelemetryToServer(int rawSoil, int soil, float temp, float hum, bool rain, bool light) {
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["deviceId"] = "krishiai-node-01";
  doc["soilMoisture"] = soil;
  doc["soilRaw"] = rawSoil;
  doc["temperature"] = temp;
  doc["humidity"] = hum;
  doc["rain"] = rain;
  doc["light"] = light;
  doc["pump"] = currentPumpState;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  int httpResponseCode = http.POST(jsonPayload);
  if (httpResponseCode > 0) {
    String response = http.getString();
    
    // Parse backend response for any pump control override commands
    StaticJsonDocument<384> resDoc;
    DeserializationError error = deserializeJson(resDoc, response);
    if (!error && resDoc.containsKey("pumpCommand")) {
      bool desiredPumpState = resDoc["pumpCommand"].as<bool>();
      if (desiredPumpState != currentPumpState) {
        setRelayState(desiredPumpState);
      }
    }
  }
  http.end();
}

void setRelayState(bool turnOn) {
  currentPumpState = turnOn;
  digitalWrite(PIN_RELAY_PUMP, turnOn ? RELAY_ACTIVE_STATE : RELAY_OFF_STATE);
  Serial.printf("[RELAY] Pump state switched to: %s\\n", turnOn ? "ON" : "OFF");
}
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(firmwareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const element = document.createElement('a');
    const file = new Blob([firmwareCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'KrishiAI_ESP32_Node.ino';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code2 size={22} color="var(--emerald-400)" />
              ESP32 Arduino Firmware Generator (.ino)
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Ready-to-flash code for Arduino IDE / PlatformIO with complete PRD Pin Mappings
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button id="btn-copy-code" className="btn-secondary" onClick={copyToClipboard}>
              {copied ? <Check size={16} color="var(--emerald-400)" /> : <Copy size={16} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
            </button>
            <button id="btn-download-ino" className="btn-primary" onClick={downloadFile}>
              <Download size={16} />
              <span>Download .ino File</span>
            </button>
          </div>
        </div>

        {/* Configuration inputs to auto-generate code with user's WiFi/Server */}
        <div style={{ 
          background: 'rgba(0,0,0,0.3)', 
          padding: '1rem', 
          borderRadius: 'var(--radius-md)', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '0.85rem',
          marginBottom: '1.25rem'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>WiFi SSID:</label>
            <input 
              type="text" 
              value={wifiSSID} 
              onChange={(e) => setWifiSSID(e.target.value)} 
              style={{ width: '100%', padding: '0.45rem 0.65rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'white', fontSize: '0.82rem' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>WiFi Password:</label>
            <input 
              type="password" 
              value={wifiPass} 
              onChange={(e) => setWifiPass(e.target.value)} 
              style={{ width: '100%', padding: '0.45rem 0.65rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'white', fontSize: '0.82rem' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Backend Server IP:</label>
            <input 
              type="text" 
              value={serverIp} 
              onChange={(e) => setServerIp(e.target.value)} 
              style={{ width: '100%', padding: '0.45rem 0.65rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'white', fontSize: '0.82rem' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Server Port:</label>
            <input 
              type="text" 
              value={serverPort} 
              onChange={(e) => setServerPort(e.target.value)} 
              style={{ width: '100%', padding: '0.45rem 0.65rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'white', fontSize: '0.82rem' }} 
            />
          </div>
        </div>

        {/* Code Block */}
        <pre className="font-mono" style={{ 
          background: 'rgba(3, 7, 18, 0.85)', 
          padding: '1.25rem', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--border-subtle)',
          fontSize: '0.82rem',
          color: '#38bdf8',
          maxHeight: '480px',
          overflowY: 'auto',
          lineHeight: 1.45
        }}>
          {firmwareCode}
        </pre>
      </div>
    </div>
  );
}
