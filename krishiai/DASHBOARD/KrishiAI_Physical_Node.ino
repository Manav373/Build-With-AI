#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

// ================= FIREBASE =================

#define API_KEY "AIzaSyBgLKAQSdNkjPXJOOBDcCH6Ane85PAlD64"
#define DATABASE_URL "https://krishiai-iot-default-rtdb.firebaseio.com"

#define FIREBASE_EMAIL "manavpanchal373@gmail.com"
#define FIREBASE_PASSWORD "manav373"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// ================= WIFI =================

#define WIFI_SSID "Hackathon-A211"
#define WIFI_PASSWORD "admin@211"

// ================= PINS =================

#define SOIL_PIN 34
#define DHT_PIN 25
#define DHT_TYPE DHT11

#define RAIN_PIN 27
#define LIGHT_PIN 32
#define RELAY_PIN 26

#define SDA_PIN 21
#define SCL_PIN 22

#define LCD_ADDRESS 0x27

// ================= SETTINGS =================
// 0% = Not on soil (sensor unplugged / in air)
// ~45% = Sorted (optimal moisture, motor OFF)
// 65%+ = Dry (soil dry, motor ON)
#define DRY_VALUE 3200
#define WET_VALUE 1500

#define MOTOR_ON_PERCENT 65
#define MOTOR_OFF_PERCENT 47

// Update every 1 second
#define SENSOR_INTERVAL 1000

// ---- Tunable step sizes for blocking waits ----
#define WIFI_RETRY_STEP_MS 100
#define WIFI_MAX_ATTEMPTS 50
#define FIREBASE_RETRY_STEP_MS 20
#define FIREBASE_WAIT_TIMEOUT_MS 3000

// ================= OBJECTS =================

LiquidCrystal_I2C lcd(LCD_ADDRESS, 16, 2);
DHT dht(DHT_PIN, DHT_TYPE);

// ================= VARIABLES =================

unsigned long lastUpdateMillis = 0;

enum ControlMode {
  AUTO_MODE,
  MANUAL_MODE
};

ControlMode mode = AUTO_MODE;

bool manualMotorCommand = false;
bool motorState = false;

int soilRaw = 0;

float moisturePercent = 0;
float temperature = 0;
float humidity = 0;

bool raining = false;
bool bright = false;

// ================= MOTOR =================

void motorON() {
  if (motorState) return;
  digitalWrite(RELAY_PIN, LOW); // Active LOW relay
  motorState = true;
  Serial.println("[ACTUATION] MOTOR ON");

  if (Firebase.ready()) {
    Firebase.RTDB.setBool(
      &fbdo,
      "krishiAI/status/motor",
      true
    );
  }
}

void motorOFF() {
  if (!motorState) return;
  digitalWrite(RELAY_PIN, HIGH); // Active LOW relay
  motorState = false;
  Serial.println("[ACTUATION] MOTOR OFF");

  if (Firebase.ready()) {
    Firebase.RTDB.setBool(
      &fbdo,
      "krishiAI/status/motor",
      false
    );
  }
}

// ================= SOIL =================

float calculateMoisture(int raw) {
  if (raw >= DRY_VALUE)
    return 0.0;

  if (raw <= WET_VALUE)
    return 100.0;

  float moisture =
    ((float)(DRY_VALUE - raw) * 100.0) /
    ((float)(DRY_VALUE - WET_VALUE));

  return round(moisture);
}

// ================= SENSORS =================

void readSensors() {
  soilRaw = analogRead(SOIL_PIN);
  moisturePercent = calculateMoisture(soilRaw);

  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (!isnan(t))
    temperature = t;

  if (!isnan(h))
    humidity = h;

  raining = digitalRead(RAIN_PIN) == LOW;
  bright = digitalRead(LIGHT_PIN) == LOW;
}

// ================= FIREBASE CONTROL =================

void readControlsFromFirebase() {
  if (!Firebase.ready())
    return;

  // MODE
  if (Firebase.RTDB.getString(&fbdo, "krishiAI/control/mode")) {
    String modeString = fbdo.stringData();
    modeString.trim();
    modeString.toUpperCase();

    if (modeString == "MANUAL") {
      mode = MANUAL_MODE;
    } else {
      mode = AUTO_MODE;
    }
  }

  // MOTOR COMMAND
  if (Firebase.RTDB.getBool(&fbdo, "krishiAI/control/motorCommand")) {
    manualMotorCommand = fbdo.boolData();
  }
}

// ================= AUTO =================

void automaticIrrigation() {
  if (mode != AUTO_MODE)
    return;

  // Rain protection
  if (raining) {
    motorOFF();
    return;
  }

  // 0% means sensor is not in soil / disconnected (safe state: motor OFF)
  if (moisturePercent <= 0) {
    motorOFF();
    return;
  }

  // 65% and up means DRY (turn motor ON to irrigate)
  if (moisturePercent >= MOTOR_ON_PERCENT) {
    motorON();
    return;
  }

  // 45% - 47% means SORTED (turn motor OFF)
  if (moisturePercent <= MOTOR_OFF_PERCENT) {
    motorOFF();
    return;
  }
}

// ================= MANUAL =================

void manualIrrigation() {
  if (mode != MANUAL_MODE)
    return;

  // Rain safety lock
  if (raining && manualMotorCommand) {
    motorOFF();
    return;
  }

  if (manualMotorCommand) {
    motorON();
  } else {
    motorOFF();
  }
}

// ================= SEND DATA =================

void sendDataToFirebase() {
  if (!Firebase.ready())
    return;

  FirebaseJson json;
  json.set("soilRaw", soilRaw);
  json.set("moisture", moisturePercent);
  json.set("temperature", temperature);
  json.set("humidity", humidity);
  json.set("rain", raining);
  json.set("light", bright);

  if (Firebase.RTDB.updateNode(&fbdo, "krishiAI/sensors", &json)) {
    Firebase.RTDB.setBool(&fbdo, "krishiAI/status/motor", motorState);
    Firebase.RTDB.setBool(&fbdo, "krishiAI/status/online", true);
  } else {
    Serial.print("Firebase Error: ");
    Serial.println(fbdo.errorReason());
  }
}

// ================= LCD =================

void updateLCD() {
  lcd.clear();
  lcd.setCursor(0, 0);

  if (mode == AUTO_MODE)
    lcd.print("AUTO ");
  else
    lcd.print("MANUAL ");

  lcd.print(moisturePercent, 0);
  lcd.print("%");

  lcd.setCursor(0, 1);
  if (raining) {
    lcd.print("RAIN MOTOR OFF");
  } else if (motorState) {
    lcd.print("MOTOR ON");
  } else {
    lcd.print("MOTOR OFF");
  }
}

// ================= SERIAL =================

void printSensorData() {
  Serial.print("MODE: ");
  Serial.print(mode == AUTO_MODE ? "AUTO" : "MANUAL");
  Serial.print(" | SOIL: ");
  Serial.print(soilRaw);
  Serial.print(" | MOISTURE: ");
  Serial.print(moisturePercent, 1);
  Serial.print("% | TEMP: ");
  Serial.print(temperature, 1);
  Serial.print("C | HUM: ");
  Serial.print(humidity, 1);
  Serial.print("% | RAIN: ");
  Serial.print(raining ? "YES" : "NO");
  Serial.print(" | MOTOR: ");
  Serial.println(motorState ? "ON" : "OFF");
}

// ================= SYSTEM =================

void updateSystem() {
  // Get latest dashboard command first
  readControlsFromFirebase();

  // Read sensors
  readSensors();

  // Control motor
  if (mode == AUTO_MODE)
    automaticIrrigation();
  else
    manualIrrigation();

  // Send sensor data
  sendDataToFirebase();

  // LCD
  updateLCD();

  // Serial
  printSensorData();
}

// ================= SETUP =================

void setup() {
  Serial.begin(115200);

  // Pins
  pinMode(RAIN_PIN, INPUT);
  pinMode(LIGHT_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);

  // Motor initial state: OFF (Active LOW)
  digitalWrite(RELAY_PIN, HIGH);
  motorState = false;

  // ADC resolution
  analogReadResolution(12);
  analogSetPinAttenuation(SOIL_PIN, ADC_11db);

  // DHT & I2C LCD
  dht.begin();
  Wire.begin(SDA_PIN, SCL_PIN);
  lcd.init();
  lcd.backlight();

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("KRISHIAI");
  lcd.setCursor(0, 1);
  lcd.print("WIFI CONNECTING");

  // Wi-Fi
  WiFi.setAutoReconnect(true);
  WiFi.persistent(true);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting WiFi");

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < WIFI_MAX_ATTEMPTS) {
    delay(WIFI_RETRY_STEP_MS);
    Serial.print(".");
    attempts++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi Connected");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WIFI CONNECTED");
  } else {
    Serial.println("WiFi FAILED");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WIFI FAILED");
  }

  // Firebase Config
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  auth.user.email = FIREBASE_EMAIL;
  auth.user.password = FIREBASE_PASSWORD;

  Firebase.reconnectWiFi(true);
  fbdo.setResponseSize(1024);

  Serial.println("Starting Firebase...");
  Firebase.begin(&config, &auth);
  Serial.println("Firebase Started");

  unsigned long start = millis();
  while (!Firebase.ready() && millis() - start < FIREBASE_WAIT_TIMEOUT_MS) {
    delay(FIREBASE_RETRY_STEP_MS);
    Serial.print(".");
  }
  Serial.println();

  if (Firebase.ready()) {
    Serial.println("Firebase READY");
    Firebase.RTDB.setBool(&fbdo, "krishiAI/status/online", true);
    Firebase.RTDB.setBool(&fbdo, "krishiAI/status/motor", false);
  } else {
    Serial.println("Firebase NOT READY");
    Serial.println(fbdo.errorReason());
  }

  // Initial read & control
  readSensors();
  automaticIrrigation();
  updateLCD();

  Serial.println("KRISHIAI READY");
}

// ================= LOOP =================

void loop() {
  unsigned long now = millis();
  if (now - lastUpdateMillis >= SENSOR_INTERVAL) {
    lastUpdateMillis = now;
    updateSystem();
  }
  yield();
}
