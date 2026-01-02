
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

void sendHeartbeat();
void sendTelemetry();
void fetchFeatureControl();

//connect to wifi
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

void setup() {
  Serial.begin(115200);
  dht.begin();     //✅inisilized dth
  pinMode(34, INPUT);  //ADC pin analod data for temp
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected!");
}

unsigned long lastHeartbeat = 0;
unsigned long lastTelemetry = 0;

void loop() {
  unsigned long now = millis();
  //send telemetry and heartbeat data saperatly
  if (now - lastHeartbeat > 10000) { // 10 sec heartbeat
    sendHeartbeat();
    lastHeartbeat = now;
  }

  if (now - lastTelemetry > 5000) { // 5 sec telemetry
    sendTelemetry();
    fetchFeatureControl();
    lastTelemetry = now;
  }
}
//check the heartbeat of device

const char* backendURL = "http://YOUR_SERVER_IP:8000"; // Backend
const char* deviceId = "YOUR_DEVICE_ID";  //*Esp32-abc-01*
const char* deviceSecret = "YOUR_DEVICE_SECRET"; //plain secrete 

void sendHeartbeat() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(backendURL) + "/devices/heartbeat";
    
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", String("Bearer ") + deviceSecret);

    String payload = "{\"deviceId\":\"" + String(deviceId) + "\"}";
    
    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(response);
    } else {
      Serial.println("Error on sending heartbeat");
    }
    http.end();
  }
}

//sending Telemetry (Temperature, humidity, voltage)

void sendTelemetry() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  if (isnan(temp) || isnan(hum)) {
    Serial.println("❌ Failed to read from DHT sensor");
    return;
  }
  //Make sure pin 34 is connected to the voltage sensor and 3.3V reference is correct.
  float voltage = analogRead(34) * 3.3 / 4095;

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(backendURL) + "/telemetry";
    
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", String("Bearer ") + deviceSecret);

    String payload = "{\"data\": {\"temperature\":" + String(temp) +
                     ",\"humidity\":" + String(hum) +
                     ",\"voltage\":" + String(voltage) + "}}";

    int httpResponseCode = http.POST(payload);
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(response);
    } else {
      Serial.println("Error on sending telemetry");
    }
    http.end();
  }
}


//Fetch Feature Control from backend

void fetchFeatureControl() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(backendURL) + "/devices/" + deviceId + "/features";
    
    http.begin(url);
    http.addHeader("Authorization", String("Bearer ") + deviceSecret);

    int httpResponseCode = http.GET();
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(response);
      // parse JSON and apply control to relays, LEDs, etc.
    }
    http.end();
  }
}


