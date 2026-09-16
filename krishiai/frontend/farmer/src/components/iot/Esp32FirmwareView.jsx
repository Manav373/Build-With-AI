import React, { useState } from 'react';
import { Code2, Download, Copy, Check, Terminal, ExternalLink, Cpu } from 'lucide-react';

export default function Esp32FirmwareView({ device }) {
  const [copied, setCopied] = useState(false);
  const [wifiSSID, setWifiSSID] = useState('iot-1');
  const [wifiPass, setWifiPass] = useState('Hello@123');
  const [firebaseHost, setFirebaseHost] = useState('krishiai-iot-default-rtdb.firebaseio.com');
  const [firebaseApiKey, setFirebaseApiKey] = useState('AIzaSyBgLKAQSdNkjPXJOOBDcCH6Ane85PAlD64');

  const firmwareCode = `/*
 * KrishiAI ESP32 Physical Node Firmware (Firebase Realtime Database)
 * Replaces legacy Blynk with bidirectional Firebase RTDB synchronization.
 *
 * Firebase Schema Contract:
 * - ESP32 -> krishiAI/sensors ({ soilRaw, moisture, temperature, humidity, rain, light })
 * - React -> krishiAI/control ({ mode, motorCommand })
 * - ESP32 -> krishiAI/status  ({ motor, online })
 *
 * Hardware Pin Mapping:
 * - Capacitive Soil Moisture V1.2: GPIO 34 (ADC)
 * - DHT11 (Temp + Humidity): GPIO 25
 * - FC-37 Rain Sensor: GPIO 27 (Active LOW)
 * - Light Sensor (HW-072): GPIO 32 (Active LOW)
 * - Relay (Pump Actuator): GPIO 26 (Active LOW, HIGH=OFF)
 * - LCD I2C: SDA 21, SCL 22 (0x27)
 */

#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// 1. Wi-Fi & Firebase Credentials
#define WIFI_SSID "${wifiSSID}"
#define WIFI_PASSWORD "${wifiPass}"
#define API_KEY "${firebaseApiKey}"
#define DATABASE_URL "https://${firebaseHost}"

// 2. Hardware Pin Definitions
#define SOIL_PIN 34
#define DHT_PIN 25
#define RAIN_PIN 27
#define LIGHT_PIN 32
#define RELAY_PIN 26

#define DHT_TYPE DHT11
#define LCD_ADDRESS 0x27

// Active-LOW Relay: LOW = Pump ON, HIGH = Pump OFF
#define RELAY_ON  LOW
#define RELAY_OFF HIGH

// Soil Calibration: Raw > 3900 Dry, Raw < 1500 Wet
#define SOIL_DRY 3900
#define SOIL_WET 1500

DHT dht(DHT_PIN, DHT_TYPE);
LiquidCrystal_I2C lcd(LCD_ADDRESS, 16, 2);

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// State Variables
bool actualMotorState = false;
String controlMode = "AUTO";       // "AUTO" or "MANUAL"
bool motorCommand = false;        // Requested command from React dashboard
unsigned long lastTelemetryTime = 0;
const unsigned long telemetryInterval = 2000; // Push sensor stream every 2s

void setup() {
  Serial.begin(115200);
  delay(500);

  // Safety Requirement: Pump MUST be initialized OFF at startup
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, RELAY_OFF);
  actualMotorState = false;

  pinMode(RAIN_PIN, INPUT);
  pinMode(LIGHT_PIN, INPUT);
  analogReadResolution(12);

  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("KRISHI AI IOT");
  lcd.setCursor(0, 1);
  lcd.print("Connecting WiFi");

  dht.begin();

  // Connect WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  // Initialize Firebase RTDB
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  Firebase.reconnectWiFi(true);
  fbdo.setResponseSize(1024);
  Firebase.begin(&config, &auth);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Firebase Ready");
  delay(1000);

  // Set online status in Firebase
  Firebase.RTDB.setBool(&fbdo, "krishiAI/status/online", true);
  Firebase.RTDB.setBool(&fbdo, "krishiAI/status/motor", false);
}

void loop() {
  // 1. Read Sensors
  int rawSoil = analogRead(SOIL_PIN);
  float moisture = map(rawSoil, SOIL_DRY, SOIL_WET, 0, 100);
  moisture = constrain(moisture, 0.0, 100.0);

  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  if (isnan(temp)) temp = 27.5;
  if (isnan(hum)) hum = 65.0;

  bool rain = (digitalRead(RAIN_PIN) == LOW);
  bool light = (digitalRead(LIGHT_PIN) == LOW);

  // 2. Fetch Control from Firebase (krishiAI/control)
  if (Firebase.ready()) {
    if (Firebase.RTDB.getString(&fbdo, "krishiAI/control/mode")) {
      controlMode = fbdo.stringData();
    }
    if (Firebase.RTDB.getBool(&fbdo, "krishiAI/control/motorCommand")) {
      motorCommand = fbdo.boolData();
    }
  }

  // 3. Autonomous Irrigation & Safety Controller
  bool targetPump = false;
  if (rain) {
    // Interlock: Rain cutoff takes priority over everything
    targetPump = false;
  } else if (controlMode == "MANUAL") {
    // Manual Mode: Follow dashboard command
    targetPump = motorCommand;
  } else {
    // AUTO Mode: Autonomous logic on ESP32 (failsafe even if cloud disconnects)
    if (moisture < 35.0) {
      targetPump = true;
    } else {
      targetPump = false;
    }
  }

  // Actuate Relay & write status if changed
  if (targetPump != actualMotorState) {
    actualMotorState = targetPump;
    digitalWrite(RELAY_PIN, actualMotorState ? RELAY_ON : RELAY_OFF);
    if (Firebase.ready()) {
      Firebase.RTDB.setBool(&fbdo, "krishiAI/status/motor", actualMotorState);
    }
  }

  // 4. Periodically publish sensor telemetry
  unsigned long now = millis();
  if (now - lastTelemetryTime >= telemetryInterval) {
    lastTelemetryTime = now;
    if (Firebase.ready()) {
      FirebaseJson json;
      json.set("soilRaw", rawSoil);
      json.set("moisture", moisture);
      json.set("temperature", temp);
      json.set("humidity", hum);
      json.set("rain", rain);
      json.set("light", light);
      Firebase.RTDB.updateNode(&fbdo, "krishiAI/sensors", &json);
      Firebase.RTDB.setBool(&fbdo, "krishiAI/status/online", true);
    }

    // Update Local LCD
    lcd.setCursor(0, 0);
    lcd.print("M:" + String((int)moisture) + "% T:" + String((int)temp) + "C R:" + (rain ? "Y" : "N") + "  ");
    lcd.setCursor(0, 1);
    lcd.print("P:" + String(actualMotorState ? "ON " : "OFF") + " [" + controlMode + "] ");
  }

  delay(100);
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
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Firebase Database Host:</label>
            <input
              type="text"
              value={firebaseHost}
              onChange={(e) => setFirebaseHost(e.target.value)}
              placeholder="project-id-default-rtdb.firebaseio.com"
              style={{ width: '100%', padding: '0.45rem 0.65rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'white', fontSize: '0.82rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Firebase Web API Key:</label>
            <input
              type="text"
              value={firebaseApiKey}
              onChange={(e) => setFirebaseApiKey(e.target.value)}
              placeholder="AIzaSy..."
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
