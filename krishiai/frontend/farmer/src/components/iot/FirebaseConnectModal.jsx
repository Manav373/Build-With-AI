import React, { useState } from 'react';
import { 
  X, 
  Flame, 
  Check, 
  Copy, 
  ExternalLink, 
  Radio, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Code,
  Download,
  Cpu
} from 'lucide-react';
import { saveFirebaseConfig } from '../../services/iotService';

export default function FirebaseConnectModal({ 
  isOpen, 
  onClose, 
  firebaseConfig, 
  onSaveConfig,
  isFirebaseConnected,
  onTestConnection
}) {
  if (!isOpen) return null;

  const [dbUrl, setDbUrl] = useState(firebaseConfig?.databaseUrl || 'https://krishiai-iot-default-rtdb.firebaseio.com');
  const [devicePath, setDevicePath] = useState(firebaseConfig?.devicePath || '/krishiAI');
  const [enabled, setEnabled] = useState(Boolean(firebaseConfig?.enabled));
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [activeTab, setActiveTab] = useState('connect'); // 'connect' | 'firmware'
  const [copied, setCopied] = useState(false);

  // Test connection to Firebase RTDB endpoint
  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      let cleanUrl = dbUrl.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`;
      }
      cleanUrl = cleanUrl.replace(/\/+$/, '');
      let cleanPath = devicePath.trim();
      if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`;

      const res = await fetch(`${cleanUrl}${cleanPath}.json`);
      if (res.ok) {
        const data = await res.json();
        setTestResult({ success: true, message: 'Connected successfully to Firebase Realtime Database!', data });
      } else {
        setTestResult({ success: false, message: `HTTP ${res.status}: Check database security rules or URL.` });
      }
    } catch (e) {
      setTestResult({ success: false, message: `Connection failed: ${e.message}. Ensure CORS or read permissions are allowed.` });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const newConfig = {
      enabled,
      databaseUrl: dbUrl.trim(),
      devicePath: devicePath.trim()
    };
    saveFirebaseConfig(newConfig);
    onSaveConfig(newConfig);
    onClose();
  };

  const firmwareCode = `// =====================================================
// KRISHIAI SENSOR NODE — ESP32 + FIREBASE RTDB
// =====================================================
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASS";

// Friend's Firebase RTDB URL & Node Path
const char* firebaseUrl = "${dbUrl.replace(/\/+$/, '')}${devicePath.startsWith('/') ? devicePath : '/' + devicePath}.json";

#define SOIL_PIN 5
#define DHT_PIN 25
#define RAIN_PIN 27
#define LIGHT_PIN 34
#define RELAY_PIN 26

DHT dht(DHT_PIN, DHT11);

void setup() {
  Serial.begin(115200);
  pinMode(SOIL_PIN, INPUT);
  pinMode(RAIN_PIN, INPUT_PULLUP);
  pinMode(LIGHT_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); // OFF

  dht.begin();
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\\n[WiFi] Connected!");
}

void loop() {
  int soilRaw = analogRead(SOIL_PIN);
  int moisture = map(soilRaw, 3200, 1400, 0, 100);
  moisture = constrain(moisture, 0, 100);
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  bool rain = (digitalRead(RAIN_PIN) == LOW);
  bool light = (digitalRead(LIGHT_PIN) == LOW);

  // Send JSON PATCH to Firebase RTDB
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(firebaseUrl);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<256> doc;
    doc["soilMoisture"] = moisture;
    doc["soilRaw"] = soilRaw;
    doc["temperature"] = temp;
    doc["humidity"] = hum;
    doc["rain"] = rain;
    doc["light"] = light;
    doc["timestamp"] = millis();

    String jsonPayload;
    serializeJson(doc, jsonPayload);
    int httpResponseCode = http.PATCH(jsonPayload);
    http.end();
  }
  delay(4000);
}`;

  const copyFirmware = () => {
    navigator.clipboard.writeText(firmwareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-white transition-colors">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Flame size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              Firebase IoT Realtime Connectivity
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isFirebaseConnected 
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}>
                {isFirebaseConnected ? '● LIVE SYNC ACTIVE' : '○ STANDBY'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Connect KrishiAI directly to your friend's Firebase Realtime Database
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl mb-4 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('connect')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'connect' 
                ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-500/30' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Database Settings
          </button>
          <button
            onClick={() => setActiveTab('firmware')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'firmware' 
                ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-500/30' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code size={14} /> ESP32 Arduino Code
          </button>
        </div>

        {activeTab === 'connect' ? (
          <div className="space-y-4">
            {/* Enable Firebase Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Enable Firebase Live Sync</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Stream telemetry directly from Firebase RTDB in real time</span>
              </div>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
              />
            </div>

            {/* RTDB URL */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Firebase Realtime Database URL
              </label>
              <input
                type="text"
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value)}
                placeholder="https://your-friend-project-default-rtdb.firebaseio.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:border-orange-500 font-mono transition"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Found in Firebase Console &gt; Realtime Database &gt; URL
              </span>
            </div>

            {/* Target Path */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Device Node Path
              </label>
              <input
                type="text"
                value={devicePath}
                onChange={(e) => setDevicePath(e.target.value)}
                placeholder="/krishiAI"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:border-orange-500 font-mono transition"
              />
            </div>

            {/* Test Result Banner */}
            {testResult && (
              <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testResult.success 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' 
                  : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
              }`}>
                {testResult.success ? <CheckCircle2 size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5" />}
                <div>
                  <p className="font-bold">{testResult.message}</p>
                  {testResult.data && (
                    <pre className="mt-1 text-[10px] font-mono text-slate-600 dark:text-slate-400 max-h-20 overflow-y-auto">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleTest}
                disabled={testing}
                className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
              >
                {testing ? <RefreshCw size={14} className="animate-spin" /> : <Radio size={14} />}
                Test Connection
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition shadow-lg shadow-orange-600/30"
              >
                Save & Apply Settings
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">Ready-to-flash Arduino C++ for ESP32</span>
              <button
                onClick={copyFirmware}
                className="py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 border border-slate-200 dark:border-slate-700"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-mono text-slate-800 dark:text-slate-300 max-h-64 overflow-y-auto">
              {firmwareCode}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
