#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

/* ================== DHT ================== */
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);
#define BULB_PIN LED_BUILTIN
#define FAN_PIN  D6
#define SWITCH_PIN D7

/* ================== ADC ================== */
#define VOLTAGE_PIN A0   // ESP8266 has only A0 (0–1V)

/* ================== WIFI ================== */
const char* ssid = "wifi_name";
const char* password = "password";

/* ================== BACKEND ================== */
const char* backendURL = "http://hotspotIP:8000/api/v1";
const char* deviceId = "deviceId";
const char* deviceSecret = "device secret"; // plain secret

/* ================== TIMERS ================== */
unsigned long lastHeartbeat = 0;
unsigned long lastTelemetry = 0;

/* ================== SETUP ================== */
void setup() {
  Serial.begin(115200);
  dht.begin();
  // Pins for outputs
  pinMode(BULB_PIN, OUTPUT);
  pinMode(FAN_PIN, OUTPUT);
  pinMode(SWITCH_PIN, OUTPUT);

  WiFi.begin(ssid, password);
  Serial.print("Connecting");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ WiFi connected");
  Serial.println("IP: " + WiFi.localIP().toString());
}

/* ================== LOOP ================== */
void loop() {
  unsigned long now = millis();

  // 1️⃣ Ensure WiFi is connected
  if (WiFi.status() != WL_CONNECTED) {
    reconnectWiFi();
    return;  // skip network calls
  }

  // 2️⃣ Heartbeat every 10 seconds
  if (now - lastHeartbeat >= 10000) {
    sendHeartbeat();
    lastHeartbeat = now;
  }

  // 3️⃣ Telemetry + Feature fetch every 5 seconds
  if (now - lastTelemetry >= 5000) {
    sendTelemetry();
    fetchFeatureControl();
    lastTelemetry = now;
  }
}


/* ================== RECONNECT WIFI ================== */
void reconnectWiFi() {
  static unsigned long lastAttempt = 0;
  unsigned long now = millis();
  Serial.print("WiFi disconnected. Reconnecting");
  // Try reconnect every 5 seconds
  if (now - lastAttempt >= 5000) {
    Serial.print(".");
    WiFi.disconnect();
    WiFi.begin(ssid, password);
    lastAttempt = now;
  }
}

/* ================== HEARTBEAT ================== */
void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClient client;
  HTTPClient http;

  String url = String(backendURL) + "/devices/heartbeat";
  http.begin(client, url);

  // ⚠ Send deviceId & deviceSecret in headers
  http.addHeader("x-device-id", deviceId);
  http.addHeader("x-device-secret", deviceSecret);
  http.addHeader("Content-Type", "application/json");

  // heartbeat does not need JSON body
  int code = http.POST("{}");

  if (code > 0) {
    Serial.print("Heartbeat: ");
    Serial.println(code);
    Serial.println(http.getString());
  } else {
    Serial.print("❌ Heartbeat failed, error: ");
    Serial.println(http.errorToString(code));
  }

  http.end();
}

/* ================== TELEMETRY ================== */
void sendTelemetry() {
  float temp = dht.readTemperature();
  float hum  = dht.readHumidity();

  if (isnan(temp) || isnan(hum)) {
    Serial.println("❌ DHT read failed");
    return;
  }

  // Convert analog voltage (0–1023) → 0–1V
  float voltage = analogRead(VOLTAGE_PIN) * (1.0 / 1023.0);

  WiFiClient client;
  HTTPClient http;

  String url = String(backendURL) + "/telemetry";
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + String(deviceSecret));

  String payload = "{\"data\":{"
                   "\"temperature\":" + String(temp) +
                   ",\"humidity\":" + String(hum) +
                   ",\"voltage\":" + String(voltage) +
                   "}}";

  int code = http.POST(payload);
  if (code > 0) {
    Serial.print("Telemetry: ");
    Serial.println(code);
    Serial.println(http.getString());
  } else {
    Serial.print("❌ Telemetry failed, error: ");
    Serial.println(http.errorToString(code));
  }

  http.end();
}

/* ================== FEATURE CONTROL ================== */
void fetchFeatureControl() {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClient client;
  HTTPClient http;

  String url = String(backendURL) + "/devices/" + deviceId + "/features";
  http.begin(client, url);

  // ✅ Send custom headers required by verifyDevice middleware
  http.addHeader("x-device-id", deviceId);
  http.addHeader("x-device-secret", deviceSecret);

  int code = http.GET();

  if (code > 0) {
    Serial.print("Features: ");
    Serial.println(code);
    String response = http.getString();
    Serial.println(response);
    // Parse JSON
    DynamicJsonDocument doc(1024);
    DeserializationError error = deserializeJson(doc, response);
    if (error) {
      Serial.println("❌ JSON parse failed");
      return;
    }

    JsonArray features = doc["features"];

    for (JsonObject feature : features) {
      const char* type = feature["type"];
      bool isOn = feature["isOn"];
      int level = feature["level"];

      if (strcmp(type, "bulb") == 0) {
        digitalWrite(BULB_PIN, isOn ? HIGH : LOW);
      } 
      else if (strcmp(type, "fan") == 0) {
        // Map level (1-5) to PWM 0-1023
        int pwm = map(level, 0, 5, 0, 1023);
        analogWrite(FAN_PIN, pwm);
      } 
      else if (strcmp(type, "switch") == 0) {
        digitalWrite(SWITCH_PIN, isOn ? HIGH : LOW);
      }
    }
  } else {
    Serial.print("❌ Features request failed, error: ");
    Serial.println(http.errorToString(code));
  }

  http.end();
}
