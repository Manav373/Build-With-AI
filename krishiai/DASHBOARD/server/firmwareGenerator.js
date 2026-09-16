export function generateEsp32Firmware(config = {}) {
  const wifiSSID = config.wifiSSID || 'YOUR_WIFI_SSID';
  const wifiPass = config.wifiPass || 'YOUR_WIFI_PASSWORD';
  const serverIp = config.serverIp || '192.168.1.100';
  const serverPort = config.serverPort || 5000;
  const deviceId = config.deviceId || 'krishiai-node-01';
  const pollIntervalMs = config.pollIntervalMs || 5000;

  return `/*
 * KrishiAI ESP32 Firmware v1.0
 * Hardware Pin Mapping based on KrishiAI PRD:
 * - Capacitive Soil Moisture V1.2: GPIO 5 (ADC)
 * - DHT11 (Temp + Humidity): GPIO 25
 * - FC-37 Rain Sensor: GPIO 27 (Digital Input)
 * - HW-072 / 3362 (Light/Dark Sensor): GPIO 34 (Digital Input)
 * - LCD I2C (16x2 / 20x4): SDA 21 / SCL 22
 * - Relay (Water Pump Controller): GPIO 26 (Digital Output)
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
const char* serverUrl = "http://${serverIp}:${serverPort}/api/devices/${deviceId}/telemetry";
const char* statusUrl = "http://${serverIp}:${serverPort}/api/devices/${deviceId}/latest";

// Hardware Pin Definitions
#define PIN_SOIL_ANALOG    5   // Capacitive Moisture Sensor
#define PIN_DHT            25  // DHT11 Sensor
#define PIN_RAIN_DIGITAL   27  // FC-37 Rain Sensor (LOW = Rain detected)
#define PIN_LIGHT_DIGITAL  34  // HW-072 Light/Dark (LOW = Bright / Light)
#define PIN_RELAY_PUMP     26  // Relay module (LOW = Relay ON for active-low, or HIGH for active-high)

#define DHTTYPE            DHT11
#define RELAY_ACTIVE_STATE LOW   // Set LOW if active-low relay, HIGH if active-high
#define RELAY_OFF_STATE    HIGH

DHT dht(PIN_DHT, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

unsigned long lastSendTime = 0;
const unsigned long sendInterval = ${pollIntervalMs}; // 5 seconds
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
  // Ensure WiFi is connected
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
  } else {
    Serial.println("\\nWiFi Connection Failed. Running in local mode.");
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
    Serial.println("[ERROR] Failed to read from DHT11 sensor!");
    temp = 28.5; // Fallback safe reading
    humidity = 60.0;
  }

  // 3. Read FC-37 Rain Sensor (Active LOW)
  bool rainDetected = (digitalRead(PIN_RAIN_DIGITAL) == LOW);

  // 4. Read HW-072 Light Sensor (LOW = Bright/Day, HIGH = Dark)
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
  doc["deviceId"] = "${deviceId}";
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
  } else {
    Serial.printf("[HTTP] POST failed, error: %s\\n", http.errorToString(httpResponseCode).c_str());
  }
  http.end();
}

void setRelayState(bool turnOn) {
  currentPumpState = turnOn;
  digitalWrite(PIN_RELAY_PUMP, turnOn ? RELAY_ACTIVE_STATE : RELAY_OFF_STATE);
  Serial.printf("[RELAY] Pump state switched to: %s\\n", turnOn ? "ON" : "OFF");
}
`;
}
