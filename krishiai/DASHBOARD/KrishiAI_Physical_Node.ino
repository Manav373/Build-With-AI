#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// =====================================================
// KRISHIAI SENSOR NODE — ESP32 (HARDWARE NODE 01)
// ESP32 + SOIL + DHT11 + RAIN + LIGHT + LCD + RELAY + WIFI
// =====================================================

// =====================================================
// 1. WI-FI & DASHBOARD CONFIGURATION
// =====================================================
const char* ssid     = "YOUR_WIFI_NAME";      // Enter your Wi-Fi SSID
const char* password = "YOUR_WIFI_PASSWORD";  // Enter your Wi-Fi Password

// Laptop / Backend Server IP & Port
const char* serverUrl = "http://192.168.0.107:5000/api/devices/krishiai-node-01/telemetry";


// =====================================================
// 2. PIN DEFINITIONS (PRD Section 2)
// =====================================================
#define SOIL_PIN 5
#define DHT_PIN 25
#define RAIN_PIN 27
#define LIGHT_PIN 34
#define RELAY_PIN 26

#define SDA_PIN 21
#define SCL_PIN 22

#define DHT_TYPE DHT11

// =====================================================
// 3. LCD & DHT INSTANCES
// =====================================================
#define LCD_ADDRESS 0x27
LiquidCrystal_I2C lcd(LCD_ADDRESS, 16, 2);
DHT dht(DHT_PIN, DHT_TYPE);

// =====================================================
// 4. SOIL CALIBRATION (PRD Section 24)
// =====================================================
#define SOIL_DRY 3200
#define SOIL_WET 1400

// =====================================================
// 5. SENSOR VARIABLES
// =====================================================
int soilRaw;
int soilPercent;
float temperature = 0;
float humidity = 0;
int rainState;
int lightState;

// =====================================================
// 6. RELAY & SCREEN STATE
// =====================================================
bool relayState = false;
unsigned long lastScreenChange = 0;
int screenNumber = 0;

unsigned long lastSendTime = 0;
const unsigned long sendInterval = 4000; // Send telemetry every 4 seconds

// =====================================================
// SETUP
// =====================================================
void setup() {
  Serial.begin(115200);
  delay(500);

  // I2C Pins
  Wire.begin(SDA_PIN, SCL_PIN);

  // Sensor Pins
  pinMode(SOIL_PIN, INPUT);
  pinMode(RAIN_PIN, INPUT_PULLUP);
  pinMode(LIGHT_PIN, INPUT);

  // Relay (Safety Rule: Start strictly in OFF state)
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); // HIGH = Relay OFF (Active LOW)
  relayState = false;

  // Initialize DHT
  dht.begin();

  // Initialize LCD
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("KRISHIAI");
  lcd.setCursor(0, 1);
  lcd.print("SMART FARM NODE");
  delay(1500);

  // Connect to Wi-Fi
  Serial.println("\nConnecting to Wi-Fi: " + String(ssid));
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Connecting WiFi..");

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 15) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WIFI] Connected! Node IP: " + WiFi.localIP().toString());
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("KrishiAI Online");
    lcd.setCursor(0, 1);
    lcd.print(WiFi.localIP().toString());
  } else {
    Serial.println("\n[WIFI] Not connected. Running in Serial / Local mode.");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Serial Mode");
  }

  delay(1500);
  lcd.clear();
}

// =====================================================
// READ SENSORS
// =====================================================
void readSensors() {
  // Soil
  soilRaw = analogRead(SOIL_PIN);
  soilPercent = map(soilRaw, SOIL_DRY, SOIL_WET, 0, 100);
  soilPercent = constrain(soilPercent, 0, 100);

  // DHT11
  float newTemperature = dht.readTemperature();
  float newHumidity = dht.readHumidity();

  if (!isnan(newTemperature)) {
    temperature = newTemperature;
  }
  if (!isnan(newHumidity)) {
    humidity = newHumidity;
  }

  // Rain (FC-37 active LOW)
  rainState = digitalRead(RAIN_PIN);

  // Light (HW-072 active LOW)
  lightState = digitalRead(LIGHT_PIN);
}

// =====================================================
// STATUS STRING HELPERS
// =====================================================
String getSoilStatus() {
  if (soilPercent < 25) return "VERY DRY";
  else if (soilPercent < 40) return "DRY";
  else if (soilPercent < 70) return "GOOD";
  else return "WET";
}

String getRainStatus() {
  return (rainState == LOW) ? "RAIN" : "NO RAIN";
}

String getLightStatus() {
  return (lightState == LOW) ? "LIGHT" : "DARK";
}

// =====================================================
// RELAY CONTROL FUNCTIONS
// =====================================================
void relayON() {
  digitalWrite(RELAY_PIN, LOW); // Active LOW relay ON
  relayState = true;
  Serial.println("RELAY -> ON");
}

void relayOFF() {
  digitalWrite(RELAY_PIN, HIGH); // Active LOW relay OFF
  relayState = false;
  Serial.println("RELAY -> OFF");
}

// =====================================================
// SERIAL MONITOR & JSON TELEMETRY DISPATCH
// =====================================================
void sendTelemetry() {
  // 1. Human Readable Serial Monitor
  Serial.println();
  Serial.println("----------------------------------------");
  Serial.print("Soil Raw      : "); Serial.println(soilRaw);
  Serial.print("Soil Moisture : "); Serial.print(soilPercent); Serial.println("%");
  Serial.print("Soil Status   : "); Serial.println(getSoilStatus());
  Serial.print("Temperature   : "); Serial.print(temperature, 1); Serial.println(" C");
  Serial.print("Humidity      : "); Serial.print(humidity, 0); Serial.println(" %");
  Serial.print("Rain          : "); Serial.println(getRainStatus());
  Serial.print("Light         : "); Serial.println(getLightStatus());
  Serial.print("Relay         : "); Serial.println(relayState ? "ON" : "OFF");
  Serial.println("----------------------------------------");

  // 2. Build JSON Packet for Dashboard
  StaticJsonDocument<256> doc;
  doc["deviceId"] = "krishiai-node-01";
  doc["soilMoisture"] = soilPercent;
  doc["soilRaw"] = soilRaw;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["rain"] = (rainState == LOW);
  doc["light"] = (lightState == LOW);
  doc["pump"] = relayState;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  // Print JSON for Web Serial stream
  Serial.println(jsonPayload);

  // 3. Send via Wi-Fi HTTP to Dashboard Backend
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(jsonPayload);
    if (httpResponseCode > 0) {
      String response = http.getString();
      StaticJsonDocument<384> resDoc;
      if (!deserializeJson(resDoc, response)) {
        if (resDoc.containsKey("pumpCommand")) {
          bool desiredState = resDoc["pumpCommand"].as<bool>();
          if (desiredState && !relayState) {
            relayON();
          } else if (!desiredState && relayState) {
            relayOFF();
          }
        }
      }
    }
    http.end();
  }
}

// =====================================================
// LCD SCREENS (PRD Section 2)
// =====================================================
void screenSoilRain() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Soil:");
  lcd.print(soilPercent);
  lcd.print("% ");
  lcd.print(getSoilStatus());

  lcd.setCursor(0, 1);
  lcd.print("Rain:");
  lcd.print(getRainStatus());
}

void screenClimate() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Temp:");
  lcd.print(temperature, 1);
  lcd.print("C");

  lcd.setCursor(0, 1);
  lcd.print("Humidity:");
  lcd.print((int)humidity);
  lcd.print("%");
}

void screenLight() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Light:");
  lcd.print(getLightStatus());

  lcd.setCursor(0, 1);
  lcd.print("Sensor:");
  lcd.print(lightState);
}

void screenRelay() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("KRISHIAI RELAY");

  lcd.setCursor(0, 1);
  lcd.print("Pump:");
  lcd.print(relayState ? "ON" : "OFF");
}

// =====================================================
// MAIN LOOP
// =====================================================
void loop() {
  readSensors();

  unsigned long currentMillis = millis();

  // Send Telemetry every 4 seconds
  if (currentMillis - lastSendTime >= sendInterval) {
    lastSendTime = currentMillis;
    sendTelemetry();
  }

  // Rotate LCD screens every 3 seconds
  if (currentMillis - lastScreenChange >= 3000) {
    lastScreenChange = currentMillis;
    screenNumber++;
    if (screenNumber > 3) {
      screenNumber = 0;
    }
  }

  // Display active screen
  if (screenNumber == 0) screenSoilRain();
  else if (screenNumber == 1) screenClimate();
  else if (screenNumber == 2) screenLight();
  else if (screenNumber == 3) screenRelay();

  delay(500);
}
