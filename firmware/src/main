#include <Wire.h>
#include <MPU6050.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include <LittleFS.h>
#include <WebServer.h>
#include <Update.h>
#include "pgss_model.h"
#include <TensorFlowLite_ESP32.h>
#include <tensorflow/lite/micro/micro_interpreter.h>
#include <tensorflow/lite/micro/micro_error_reporter.h>
#include <tensorflow/lite/micro/micro_mutable_op_resolver.h>
#include <tensorflow/lite/schema/schema_generated.h>
#include <esp_task_wdt.h>
#include <RTClib.h>
#include <mbedtls/sha256.h>
#include <Preferences.h>
#include <WiFiClientSecure.h>

#define TENSOR_ARENA_SIZE (68 * 1024)
alignas(16) static uint8_t tensor_arena[TENSOR_ARENA_SIZE];

static const tflite::Model*      tf_model    = nullptr;
static tflite::MicroInterpreter* interpreter = nullptr;
static TfLiteTensor*             tf_input    = nullptr;
static TfLiteTensor*             tf_output   = nullptr;

static tflite::MicroMutableOpResolver<23> resolver;

const char* WIFI_SSID     = "Shree Ganesh Pg-204";
const char* WIFI_PASSWORD = "9890490452";
const char* BOT_TOKEN     = "8928384396:AAH2OqesCLvXLV18JrcgsF8jTeNqXZQx0Qw";
const char* CHAT_ID       = "6050788061";
const char* GMAIL_FROM    = "ashish.devvv9@gmail.com";
const char* GMAIL_PASS    = "soapdcahstaappsu";
const char* GMAIL_TO      = "ashish.works@gmail.com";
const char* GDRIVE_UPLOAD_URL = "";
const char* GDRIVE_OTA_URL    = "";

#define SDA_PIN        21
#define SCL_PIN        22
#define BUZZER_PIN     25
#define LED_PIN        26
#define GPS_RX_PIN     16
#define GPS_TX_PIN     17
#define BUTTON_PIN     18

#define WINDOW_SIZE          50
#define N_FEATURES             6
#define SAMPLE_INTERVAL_MS    50

#ifndef FALL_THRESHOLD
#define FALL_THRESHOLD 0.45f
#endif

#define ALERT_ROUNDS          3
#define ALERT_ROUND_DURATION  120000UL
#define ALERT_ROUND_GAP        60000UL
#define BEEP_INTERVAL_MS        2000UL
#define BEEP_ON_MS               500UL
#define POST_ALERT_COOLDOWN_MS  420000UL

#define FALL_CONFIRM_FRAMES   3
#define FALL_MISS_FRAMES      2
static int fall_confirm_count = 0;
static int fall_miss_count    = 0;

#define NO_MOTION_THRESHOLD_MS  1800000UL
#define ACTIVE_HOUR_START       8
#define ACTIVE_HOUR_END         22
#define MOTION_DELTA_THRESHOLD  2000.0f

#define SUMMARY_INTERVAL_MS  86400000UL

#define SHORT_PRESS_MAX_MS   1000UL
#define LONG_PRESS_MIN_MS    3000UL

#define MAX_SAVED_WINDOWS  10

#define FALLS_CSV_MAX_LINES  200
#define FALLS_CSV_KEEP_LINES 100

MPU6050        mpu(0x69);
TinyGPSPlus    gps;
HardwareSerial gpsSerial(2);
RTC_DS3231     rtc;
WebServer      web_server(80);
Preferences    prefs;
bool           rtc_valid  = false;

#define OVERLAP_STEP (WINDOW_SIZE / 2)

float window_buffer[WINDOW_SIZE][N_FEATURES];
int   write_index  = 0;
int   sample_count = 0;

bool          fall_active         = false;
int           alert_round         = 0;
unsigned long next_round_time     = 0;
unsigned long next_beep_time      = 0;
unsigned long beep_on_until       = 0;
bool          beep_on             = false;
bool          round_beeping       = false;
bool          remote_sent         = false;
static bool   pending_alert       = false;
static bool   in_cooldown         = false;
static unsigned long cooldown_until = 0;
unsigned long current_round_start = 0;
String        alert_type          = "AUTO";

float         last_fall_score     = 0.0f;
unsigned long fall_trigger_time   = 0;
int           severity_score      = 0;

bool          sleep_mode          = false;

unsigned long last_motion_time    = 0;
bool          no_motion_sent      = false;
float         prev_motion_mag     = 0.0f;

unsigned long daily_step_count    = 0;
float         prev_accel_mag      = 0.0f;
bool          step_peak_detected  = false;
#define STEP_MAG_THRESHOLD  4500.0f

unsigned long last_summary_time   = 0;
int           daily_fall_count    = 0;
int           daily_manual_count  = 0;

double gps_lat   = 0.0;
double gps_lng   = 0.0;
bool   gps_valid = false;

bool          btn_last_state      = HIGH;
unsigned long btn_press_start     = 0;
bool          btn_pressed         = false;

int saved_window_count = 0;

void triggerAlert(String type);
void sendAlerts();
void resetAlert();
void handleButton();
void saveFallToLittleFS(String type, float score, int severity);
void uploadSavedWindowsToGDrive();
void handleWebRoot();
void handleWebHistory();
String getTimestamp();
int   computeSeverity(float score, unsigned long stillness_ms);
bool  connectWiFi();

void nvsWriteWindowCount(int count) {
  prefs.begin("pgss", false);
  prefs.putInt("win_count", count);
  prefs.end();
}

int nvsScanWindowCount() {
  int count = 0;
  for (int i = 0; i < MAX_SAVED_WINDOWS; i++) {
    if (LittleFS.exists("/window_" + String(i) + ".bin")) count = i + 1;
  }
  return count;
}

bool initModel() {
  resolver.AddDepthwiseConv2D();
  resolver.AddMaxPool2D();
  resolver.AddFullyConnected();
  resolver.AddReshape();
  resolver.AddQuantize();
  resolver.AddDequantize();
  resolver.AddAdd();
  resolver.AddLogistic();
  resolver.AddConv2D();
  resolver.AddSoftmax();
  resolver.AddMul();
  resolver.AddMean();
  resolver.AddRelu();
  resolver.AddAveragePool2D();
  resolver.AddConcatenation();
  resolver.AddExpandDims();
  resolver.AddShape();
  resolver.AddStridedSlice();
  resolver.AddPack();
  resolver.AddFill();
  resolver.AddSqueeze();
  resolver.AddCast();
  resolver.AddFloor();

  tf_model = tflite::GetModel(pgss_model_data);
  if (tf_model->version() != TFLITE_SCHEMA_VERSION) {
    Serial.println("ERROR: TFLite schema version mismatch");
    return false;
  }

  static tflite::MicroErrorReporter micro_error_reporter;
  static tflite::MicroInterpreter static_interpreter(
    tf_model, resolver, &tensor_arena[0], (size_t)TENSOR_ARENA_SIZE, &micro_error_reporter
  );
  interpreter = &static_interpreter;

  Serial.printf("Interpreter created OK\n");
  Serial.flush();
  esp_task_wdt_reset();

  if (interpreter->AllocateTensors() != kTfLiteOk) {
    Serial.println("ERROR: AllocateTensors failed");
    Serial.printf("Arena used before fail: %d\n", interpreter->arena_used_bytes());
    return false;
  }

  tf_input  = interpreter->input(0);
  tf_output = interpreter->output(0);

  if (tf_input->type != kTfLiteFloat32) {
    Serial.println("ERROR: Model input not float32"); return false;
  }
  if (tf_output->type != kTfLiteFloat32) {
    Serial.println("ERROR: Model output not float32"); return false;
  }

  Serial.println("TFLite model loaded OK");
  Serial.print("Arena used: "); Serial.println(interpreter->arena_used_bytes());
  return true;
}

String getTimestamp() {
  char buf[32];
  if (rtc_valid) {
    DateTime t = rtc.now();
    snprintf(buf, sizeof(buf), "%04d-%02d-%02d %02d:%02d:%02d",
             t.year(), t.month(), t.day(),
             t.hour(), t.minute(), t.second());
  } else {
    unsigned long s = millis() / 1000;
    snprintf(buf, sizeof(buf), "Uptime %02lu:%02lu:%02lu (no RTC)",
             s / 3600, (s % 3600) / 60, s % 60);
  }
  return String(buf);
}

int getCurrentHour() {
  if (!rtc_valid) return -1;
  return rtc.now().hour();
}

int computeSeverity(float score, unsigned long stillness_ms) {
  float score_norm = (score - FALL_THRESHOLD) / (1.0f - FALL_THRESHOLD);
  score_norm = constrain(score_norm, 0.0f, 1.0f);
  float still_norm = (float)stillness_ms / 60000.0f;
  still_norm = constrain(still_norm, 0.0f, 1.0f);
  float combined = (score_norm * 0.5f) + (still_norm * 0.5f);
  int sev = (int)(combined * 9.0f) + 1;
  return constrain(sev, 1, 10);
}

String severityLabel(int sev) {
  if (sev >= 8) return "Immediate response needed";
  if (sev >= 5) return "Urgent -- check on patient";
  return "Person may have recovered";
}

void updateGPS() {
  while (gpsSerial.available() > 0) gps.encode(gpsSerial.read());
  if (gps.location.isValid() && gps.location.isUpdated()) {
    gps_lat   = gps.location.lat();
    gps_lng   = gps.location.lng();
    gps_valid = true;
  }
}

bool connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return true;
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    esp_task_wdt_reset();
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("\nWiFi connected. IP: ");
    Serial.println(WiFi.localIP());
    return true;
  }
  Serial.println("\nWiFi failed");
  return false;
}

void sendTelegram(String message) {
  if (WiFi.status() != WL_CONNECTED) return;
  String m = message;
  m.replace("\n", "\\n");
  HTTPClient http;
  String url = "https://api.telegram.org/bot" + String(BOT_TOKEN) + "/sendMessage";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  String payload = "{\"chat_id\":" + String(CHAT_ID) +
                   ",\"text\":\"" + m +
                   "\",\"parse_mode\":\"HTML\"}";
  Serial.println("TG sending...");
  esp_task_wdt_reset();
  int response = http.POST(payload);
  String resp_body = http.getString();
  esp_task_wdt_reset();
  if (response == 200) {
    Serial.println("Telegram sent OK");
  } else {
    Serial.println("Telegram failed: " + String(response));
    Serial.println("TG error: " + resp_body);
  }
  http.end();
}

void sendEmail(String subject, String body) {
  if (WiFi.status() != WL_CONNECTED) return;
  WiFiClientSecure client;
  client.setInsecure();
  if (!client.connect("smtp.gmail.com", 465)) {
    Serial.println("Gmail: connection failed");
    return;
  }
  auto readLine = [&]() {
    String line = "";
    while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        if (c == '\n') break;
        if (c != '\r') line += c;
      }
    }
    return line;
  };
  auto base64Encode = [](const String& input) {
    const char* b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    String out = "";
    int i = 0;
    unsigned char buf[3];
    int len = input.length();
    while (i < len) {
      int chunk = min(3, len - i);
      buf[0] = input[i]; buf[1] = chunk > 1 ? input[i+1] : 0; buf[2] = chunk > 2 ? input[i+2] : 0;
      out += b64[buf[0] >> 2];
      out += b64[((buf[0] & 3) << 4) | (buf[1] >> 4)];
      out += chunk > 1 ? b64[((buf[1] & 15) << 2) | (buf[2] >> 6)] : '=';
      out += chunk > 2 ? b64[buf[2] & 63] : '=';
      i += 3;
    }
    return out;
  };
  readLine();
  client.println("EHLO esp32");
  while (client.connected()) {
    String l = readLine();
    if (l.startsWith("250 ")) break;
  }
  client.println("AUTH LOGIN");
  readLine();
  client.println(base64Encode(String(GMAIL_FROM)));
  readLine();
  client.println(base64Encode(String(GMAIL_PASS)));
  String authResp = readLine();
  if (!authResp.startsWith("235")) {
    Serial.println("Gmail: auth failed -- " + authResp);
    client.stop(); return;
  }
  client.println("MAIL FROM:<" + String(GMAIL_FROM) + ">");
  readLine();
  client.println("RCPT TO:<" + String(GMAIL_TO) + ">");
  readLine();
  client.println("DATA");
  readLine();
  client.println("From: PGSS Alert <" + String(GMAIL_FROM) + ">");
  client.println("To: " + String(GMAIL_TO));
  client.println("Subject: " + subject);
  client.println("");
  client.println(body);
  client.println(".");
  readLine();
  client.println("QUIT");
  client.stop();
  Serial.println("Gmail sent");
}

String buildLocationString() {
  if (!gps_valid) return "Location: Not available (GPS acquiring)";
  return "Location: https://maps.google.com/?q=" +
         String(gps_lat, 6) + "," + String(gps_lng, 6);
}

void sendAlerts() {
  if (strlen(WIFI_SSID) == 0 || strlen(BOT_TOKEN) == 0 || strlen(GMAIL_FROM) == 0) {
    Serial.println("ERROR: Credentials not set");
    return;
  }
  if (!connectWiFi()) { Serial.println("No WiFi -- alerts skipped"); return; }

  String ts      = getTimestamp();
  String loc     = buildLocationString();
  String sev_str = String(severity_score) + "/10";
  String sev_lbl = severityLabel(severity_score);
  String type_str = (alert_type == "MANUAL") ? "MANUAL (Panic Button)" : "AUTO (Fall Detected)";

  String tg_msg =
    "<b>PGSS ALERT</b>\n\n" +
    type_str + "\n" +
    loc + "\n" +
    "Time: " + ts + "\n" +
    "Severity: " + sev_str + " - " + sev_lbl + "\n\n" +
    "<i>PGSS - Elite Lab</i>";

  sendTelegram(tg_msg);

  String email_body =
    "PGSS FALL ALERT\n\n"
    "Type: " + type_str + "\n" +
    "Time: " + ts + "\n" +
    "Severity: " + sev_str + " - " + sev_lbl + "\n" +
    "GPS: " + (gps_valid
      ? (String(gps_lat, 6) + ", " + String(gps_lng, 6))
      : "Not available") + "\n\n" +
    "Action: Immediate assistance required\n\n-- PGSS Elite Lab";

  sendEmail("PGSS FALL ALERT", email_body);
}

void startBeep() {
  digitalWrite(BUZZER_PIN, HIGH);
  digitalWrite(LED_PIN, HIGH);

  beep_on       = true;
  beep_on_until = millis() + BEEP_ON_MS;
}

void tickBeep() {
  if (beep_on && millis() >= beep_on_until) {
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(LED_PIN, LOW);
    beep_on = false;
  }
}

void blinkLED(int times) {
  if (fall_active) return;
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH);
    unsigned long t = millis();
    while (millis() - t < 200) { esp_task_wdt_reset(); }
    digitalWrite(LED_PIN, LOW);
    t = millis();
    while (millis() - t < 200) { esp_task_wdt_reset(); }
  }
}

void resetAlert() {
  fall_active         = false;
  remote_sent         = false;
  pending_alert       = false;
  alert_round         = 0;
  round_beeping       = false;
  beep_on             = false;
  beep_on_until       = 0;
  next_beep_time      = 0;
  next_round_time     = 0;
  current_round_start = 0;
  fall_confirm_count  = 0;
  fall_miss_count     = 0;
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_PIN, LOW);
  Serial.println("Alert fully reset");
}

void handleButton() {
  bool state = digitalRead(BUTTON_PIN);
  unsigned long now = millis();
  static unsigned long last_debounce = 0;

  if (state == btn_last_state) return;
  if (now - last_debounce < 50) return;
  last_debounce = now;

  if (state == LOW) {
    btn_press_start = now;
    btn_pressed     = true;
    Serial.println("BTN down");
  } else {
    if (!btn_pressed) { btn_last_state = state; return; }
    unsigned long held = now - btn_press_start;
    btn_pressed = false;
    Serial.printf("BTN held=%lu fall_active=%d\n", held, (int)fall_active);

    if (held >= LONG_PRESS_MIN_MS) {
      if (fall_active) {
        resetAlert();
        Serial.println("Alert cancelled via long press");
      } else {
        sleep_mode = !sleep_mode;
        Serial.println(sleep_mode ? "SLEEP MODE ON" : "SLEEP MODE OFF");
        blinkLED(sleep_mode ? 2 : 3);
        no_motion_sent = false;
      }
    } else if (held >= 50 && held < SHORT_PRESS_MAX_MS) {
      if (fall_active) {
        resetAlert();
        Serial.println("Alert cancelled via button");
      } else {
        Serial.println("PANIC BUTTON pressed -- manual alert");
        triggerAlert("MANUAL");
      }
    }
  }
  btn_last_state = state;
}

void handleAlertRounds() {
  if (!fall_active) return;
  unsigned long now = millis();
  handleButton();
  tickBeep();

  if (pending_alert && !remote_sent) {
    unsigned long stillness_ms = min(now - fall_trigger_time, 60000UL);
    severity_score = computeSeverity(last_fall_score, stillness_ms);
    if (alert_type == "AUTO") {
      saveFallToLittleFS(alert_type, last_fall_score, severity_score);
    }
    sendAlerts();
    WiFi.disconnect();
    remote_sent   = true;
    pending_alert = false;
  }

  if (round_beeping) {
    if (now >= current_round_start + ALERT_ROUND_DURATION) {
      round_beeping   = false;
      next_round_time = now + ALERT_ROUND_GAP;
      digitalWrite(BUZZER_PIN, LOW);
      digitalWrite(LED_PIN, LOW);
      beep_on = false;
      Serial.println("Round " + String(alert_round) + " done -- gap started");
      return;
    }
    if (now >= next_beep_time && !beep_on) {
      startBeep();  // Always beep during active alert regardless of sleep mode
      next_beep_time = now + BEEP_INTERVAL_MS;
    }
  } else {
    if (now < next_round_time) return;
    alert_round++;
    if (alert_round > ALERT_ROUNDS) {
      Serial.println("All alert rounds complete -- cooldown started");
      resetAlert();
      in_cooldown    = true;
      cooldown_until = millis() + POST_ALERT_COOLDOWN_MS;
      return;
    }
    Serial.println("Alert round " + String(alert_round) + " starting");
    round_beeping       = true;
    current_round_start = now;
    next_beep_time      = now;
  }
}

void triggerAlert(String type) {
  if (fall_active) return;
  Serial.println("ALERT TRIGGERED -- type: " + type);
  alert_type          = type;
  fall_trigger_time   = millis();
  fall_active         = true;
  alert_round         = 0;
  round_beeping       = false;
  current_round_start = 0;
  next_round_time     = millis();
  if (!remote_sent) pending_alert = true;

  if (type == "MANUAL") {
    severity_score  = 10;
    last_fall_score = 1.0f;
    saveFallToLittleFS(type, last_fall_score, severity_score);
  }

  if (type == "AUTO")   daily_fall_count++;
  if (type == "MANUAL") daily_manual_count++;
}

void trimFallsCSV() {
  File f = LittleFS.open("/falls.csv", "r");
  if (!f) return;
  int count = 0;
  while (f.available()) {
    String l = f.readStringUntil('\n');
    if (l.length() > 0) count++;
  }
  f.close();
  if (count <= FALLS_CSV_MAX_LINES) return;
  int skip = count - FALLS_CSV_KEEP_LINES;
  f = LittleFS.open("/falls.csv", "r");
  if (!f) return;
  File tmp = LittleFS.open("/falls_tmp.csv", "w");
  if (!tmp) { f.close(); return; }
  int idx = 0;
  while (f.available()) {
    String line = f.readStringUntil('\n');
    line.trim();
    if (line.length() == 0) continue;
    if (idx >= skip) tmp.println(line);
    idx++;
  }
  f.close(); tmp.close();
  LittleFS.remove("/falls.csv");
  LittleFS.rename("/falls_tmp.csv", "/falls.csv");
  Serial.println("LittleFS: falls.csv trimmed");
}

void saveFallToLittleFS(String type, float score, int severity) {
  trimFallsCSV();
  String line = getTimestamp() + "|" + type + "|" +
                String(score, 4) + "|" + String(severity) + "|" +
                String(gps_lat, 6) + "|" + String(gps_lng, 6) + "\n";
  File tmp = LittleFS.open("/falls_new.csv", "w");
  if (!tmp) { Serial.println("LittleFS: failed to open temp file"); return; }
  File existing = LittleFS.open("/falls.csv", "r");
  if (existing) {
    while (existing.available()) tmp.write(existing.read());
    existing.close();
  }
  tmp.print(line);
  tmp.close();
  LittleFS.remove("/falls.csv");
  LittleFS.rename("/falls_new.csv", "/falls.csv");
  Serial.println("LittleFS: fall record saved (atomic)");

  if (saved_window_count < MAX_SAVED_WINDOWS && type == "AUTO") {
    String wfile = "/window_" + String(saved_window_count) + ".bin";
    if (!LittleFS.exists(wfile)) {
      File wf = LittleFS.open(wfile, "w");
      if (wf) {
        for (int i = 0; i < WINDOW_SIZE; i++) {
          int buf_i = (write_index + i) % WINDOW_SIZE;
          wf.write((uint8_t*)window_buffer[buf_i], N_FEATURES * sizeof(float));
        }
        wf.close();
        saved_window_count++;
        nvsWriteWindowCount(saved_window_count);
      }
    }
  }
}

void uploadSavedWindowsToGDrive() {
  if (strlen(GDRIVE_UPLOAD_URL) == 0) return;
  if (saved_window_count == 0) return;
  if (WiFi.status() != WL_CONNECTED) return;
  for (int i = 0; i < saved_window_count; i++) {
    String wfile = "/window_" + String(i) + ".bin";
    File wf = LittleFS.open(wfile, "r");
    if (!wf) continue;
    HTTPClient http;
    http.begin(GDRIVE_UPLOAD_URL);
    http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
    http.addHeader("Content-Type", "application/octet-stream");
    esp_task_wdt_reset();
    int resp = http.sendRequest("POST", &wf, wf.size());
    esp_task_wdt_reset();
    wf.close(); http.end();
    if (resp == 200) LittleFS.remove(wfile);
  }
  saved_window_count = nvsScanWindowCount();
  nvsWriteWindowCount(saved_window_count);
}

void checkOTAUpdate() {
  if (strlen(GDRIVE_OTA_URL) == 0) return;
}

void handleWebRoot() {
  web_server.sendHeader("Location", "/history");
  web_server.send(301);
}

void handleWebHistory() {
  web_server.setContentLength(CONTENT_LENGTH_UNKNOWN);
  web_server.send(200, "text/html", "");
  web_server.sendContent(
    "<!DOCTYPE html><html><head><meta charset='UTF-8'>"
    "<meta name='viewport' content='width=device-width,initial-scale=1'>"
    "<title>PGSS Fall History</title>"
    "<style>body{font-family:Arial,sans-serif;margin:20px;background:#f5f5f5;}"
    "h1{color:#d32f2f;}table{width:100%;border-collapse:collapse;background:#fff;}"
    "th{background:#d32f2f;color:#fff;padding:12px;text-align:left;}"
    "td{padding:10px 12px;border-bottom:1px solid #eee;}"
    ".auto{color:#d32f2f;font-weight:bold;}.manual{color:#1565c0;font-weight:bold;}"
    ".sev-high{color:#d32f2f;font-weight:bold;}.sev-med{color:#f57c00;font-weight:bold;}"
    ".sev-low{color:#388e3c;font-weight:bold;}</style></head><body>"
    "<h1>PGSS Fall History</h1>"
  );
  File f = LittleFS.open("/falls.csv", "r");
  if (!f || f.size() == 0) {
    web_server.sendContent("<p>No fall events recorded yet.</p>");
  } else {
    web_server.sendContent("<table><tr><th>#</th><th>Time</th><th>Type</th><th>Score</th><th>Severity</th><th>Location</th></tr>");
    int row = 0;
    while (f.available()) {
      String line = f.readStringUntil('\n'); line.trim();
      if (line.length() == 0) continue;
      row++;
      int p1=line.indexOf('|'); if(p1<0) continue;
      int p2=line.indexOf('|',p1+1); if(p2<0) continue;
      int p3=line.indexOf('|',p2+1); if(p3<0) continue;
      int p4=line.indexOf('|',p3+1); if(p4<0) continue;
      int p5=line.indexOf('|',p4+1); if(p5<0) continue;
      String ts=line.substring(0,p1);
      String type=line.substring(p1+1,p2);
      String sc=line.substring(p2+1,p3);
      String sev=line.substring(p3+1,p4);
      String lat=line.substring(p4+1,p5);
      String lng=line.substring(p5+1);
      int sev_int=sev.toInt();
      String sev_class=sev_int>=8?"sev-high":(sev_int>=5?"sev-med":"sev-low");
      String type_class=type=="MANUAL"?"manual":"auto";
      String loc_cell=(lat.toFloat()!=0.0f)
        ?"<a href='https://maps.google.com/?q="+lat+","+lng+"' target='_blank'>View Map</a>"
        :"No GPS";
      web_server.sendContent(
        "<tr><td>"+String(row)+"</td><td>"+ts+"</td><td class='"+type_class+"'>"+type+
        "</td><td>"+(type=="MANUAL"?String("--"):sc)+"</td><td class='"+sev_class+"'>"+sev+
        "/10</td><td>"+loc_cell+"</td></tr>");
    }
    f.close();
    web_server.sendContent("</table><p>Total: "+String(row)+"</p>");
  }
  web_server.sendContent("<p><small>PGSS -- Elite Lab</small></p></body></html>");
  web_server.sendContent("");
}

void sendDailySummary() {
  if (!connectWiFi()) return;
  unsigned long uptime_sec = millis() / 1000;
  char uptime_buf[16];
  snprintf(uptime_buf, sizeof(uptime_buf), "%02lu:%02lu:%02lu",
           uptime_sec/3600, (uptime_sec%3600)/60, uptime_sec%60);
  String msg =
    "<b>PGSS Daily Summary</b>\n\n"
    "Falls detected (auto): " + String(daily_fall_count) + "\n" +
    "Manual alerts (panic): " + String(daily_manual_count) + "\n" +
    "Steps today: " + String(daily_step_count) + "\n" +
    "Uptime: " + String(uptime_buf) + "\n" +
    "Sleep mode: " + (sleep_mode ? "Active" : "Inactive") + "\n\n" +
    "<i>PGSS -- Elite Lab</i>";
  if (WiFi.status() == WL_CONNECTED) {
    sendTelegram(msg);
    daily_fall_count = 0;
    daily_manual_count = 0;
    daily_step_count = 0;
  }
  uploadSavedWindowsToGDrive();
  checkOTAUpdate();
  WiFi.disconnect();
}

void checkNoMotion(float accel_magnitude) {
  unsigned long now = millis();
  float delta = fabsf(accel_magnitude - prev_motion_mag);
  prev_motion_mag = accel_magnitude;
  if (delta > MOTION_DELTA_THRESHOLD) { last_motion_time=now; no_motion_sent=false; }
  if (sleep_mode||fall_active||no_motion_sent) return;
  if (now - last_motion_time < NO_MOTION_THRESHOLD_MS) return;
  int hour = getCurrentHour();
  if (hour < ACTIVE_HOUR_START || hour >= ACTIVE_HOUR_END) return;
  Serial.println("NO-MOTION alert firing");
  no_motion_sent = true;
  if (!connectWiFi()) return;
  String msg =
    "<b>PGSS Inactivity Alert</b>\n\n"
    "No movement detected for 30 minutes.\n" +
    buildLocationString() + "\nTime: " + getTimestamp() + "\n\n<i>PGSS -- Elite Lab</i>";
  sendTelegram(msg);
  WiFi.disconnect();
}

void updateStepCount(float accel_mag) {
  if (fall_active) return;
  if (accel_mag > STEP_MAG_THRESHOLD && prev_accel_mag <= STEP_MAG_THRESHOLD) {
    if (!step_peak_detected) { daily_step_count++; step_peak_detected=true; }
  } else if (accel_mag < STEP_MAG_THRESHOLD) {
    step_peak_detected = false;
  }
  prev_accel_mag = accel_mag;
}

float runInference() {
  const float ACCEL_LSB_TO_G  = 1.0f / 2048.0f;
  const float GYRO_LSB_TO_DPS = 1.0f / 16.4f;
  for (int i = 0; i < WINDOW_SIZE; i++) {
    int buf_i = (write_index + i) % WINDOW_SIZE;
    float converted[N_FEATURES];
    converted[0] = window_buffer[buf_i][0] * ACCEL_LSB_TO_G;
    converted[1] = window_buffer[buf_i][1] * ACCEL_LSB_TO_G;
    converted[2] = window_buffer[buf_i][2] * ACCEL_LSB_TO_G;
    converted[3] = window_buffer[buf_i][3] * GYRO_LSB_TO_DPS;
    converted[4] = window_buffer[buf_i][4] * GYRO_LSB_TO_DPS;
    converted[5] = window_buffer[buf_i][5] * GYRO_LSB_TO_DPS;
    for (int j = 0; j < N_FEATURES; j++) {
      tf_input->data.f[i * N_FEATURES + j] =
        (converted[j] - SCALER_MEAN[j]) / SCALER_STD[j];
    }
  }
  esp_task_wdt_reset();
  if (interpreter->Invoke() != kTfLiteOk) {
    Serial.println("ERROR: Inference failed");
    return 0.0f;
  }
  esp_task_wdt_reset();
  return tf_output->data.f[0];
}

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_PIN, LOW);

  Serial.begin(115200);
  Wire.begin(SDA_PIN, SCL_PIN);
  delay(100);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);

  if (rtc.begin()) {
    if (rtc.lostPower()) rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    DateTime t = rtc.now();
    if (t.year() >= 2024 && t.year() <= 2035) {
      rtc_valid = true;
      Serial.printf("RTC time: %04d-%02d-%02d %02d:%02d:%02d\n",
        t.year(),t.month(),t.day(),t.hour(),t.minute(),t.second());
    } else {
      Serial.printf("WARN: RTC implausible year (%d)\n", t.year());
    }
  } else {
    Serial.println("WARN: DS3231 not found -- uptime fallback");
  }

  if (!LittleFS.begin(true)) {
    Serial.println("ERROR: LittleFS mount failed");
  } else {
    Serial.println("LittleFS mounted OK");
  }

  saved_window_count = nvsScanWindowCount();
  nvsWriteWindowCount(saved_window_count);

  if (strlen(WIFI_SSID) > 0) {
    if (connectWiFi()) {
      web_server.on("/",        handleWebRoot);
      web_server.on("/history", handleWebHistory);
      web_server.begin();
      Serial.println("Web server started");
      Serial.print("Fall history: http://");
      Serial.println(WiFi.localIP());
    }
  }

  esp_task_wdt_init(60, true);
  esp_task_wdt_add(NULL);

  mpu.initialize();
  delay(200);
  if (!mpu.testConnection()) {
    Serial.println("ERROR: MPU6050 not found at 0x69");
    while (true) { esp_task_wdt_reset(); }
  }
  mpu.setFullScaleAccelRange(MPU6050_ACCEL_FS_16);
  mpu.setFullScaleGyroRange(MPU6050_GYRO_FS_2000);

  Serial.printf("Free heap before TFLite: %d\n", ESP.getFreeHeap());
  if (!initModel()) {
    Serial.println("ERROR: Model init failed. Halting.");
    while (true) { esp_task_wdt_reset(); }
  }

  last_motion_time  = millis();
  last_summary_time = millis();

  Serial.println("PGSS Ready");
  Serial.println("timestamp_ms,ax,ay,az,gx,gy,gz,fall_score,status");
}

void loop() {
  static unsigned long lastSample        = 0;
  static int           steps_since_infer = 0;
  unsigned long now = millis();

  esp_task_wdt_reset();
  updateGPS();
  handleButton();
  handleAlertRounds();
  web_server.handleClient();

  if (now - last_summary_time >= SUMMARY_INTERVAL_MS) {
    last_summary_time = now;
    sendDailySummary();
  }

  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim(); cmd.toUpperCase();
    if (cmd == "RESET") {
      if (fall_active) { resetAlert(); Serial.println("Alert cancelled"); }
      else Serial.println("No active alert");
    } else if (cmd == "SLEEP") {
      sleep_mode = true; Serial.println("Sleep mode ON"); blinkLED(2);
    } else if (cmd == "AWAKE") {
      sleep_mode = false; Serial.println("Sleep mode OFF"); blinkLED(3);
    } else if (cmd == "HISTORY") {
      Serial.println("http://" + WiFi.localIP().toString() + "/history");
    } else if (cmd == "SUMMARY") {
      sendDailySummary();
    } else if (cmd == "INFER") {
      if (sample_count < WINDOW_SIZE) {
        Serial.println("Buffer not full (" + String(sample_count) + "/" + String(WINDOW_SIZE) + ")");
      } else {
        float score = runInference();
        Serial.println("=== MANUAL INFERENCE ===");
        Serial.print("Raw score: "); Serial.println(score, 6);
        Serial.print("Threshold: "); Serial.println(FALL_THRESHOLD, 6);
        Serial.println(score > FALL_THRESHOLD ? "RESULT: FALL" : "RESULT: NO FALL");
        Serial.println("========================");
      }
    }
  }

  if (now - lastSample < SAMPLE_INTERVAL_MS) return;
  lastSample = now;

  int16_t rawAx, rawAy, rawAz, rawGx, rawGy, rawGz;
  mpu.getMotion6(&rawAx, &rawAy, &rawAz, &rawGx, &rawGy, &rawGz);

  float accel_mag = sqrt((float)rawAx*rawAx + (float)rawAy*rawAy + (float)rawAz*rawAz);
  updateStepCount(accel_mag);
  checkNoMotion(accel_mag);

  window_buffer[write_index][0] = (float)rawAx;
  window_buffer[write_index][1] = (float)rawAy;
  window_buffer[write_index][2] = (float)rawAz;
  window_buffer[write_index][3] = (float)rawGx;
  window_buffer[write_index][4] = (float)rawGy;
  window_buffer[write_index][5] = (float)rawGz;

  write_index = (write_index + 1) % WINDOW_SIZE;
  if (sample_count < WINDOW_SIZE) sample_count++;

  if (sample_count < WINDOW_SIZE) {
    if (!fall_active) { Serial.print(now); Serial.println(",0,0,0,0,0,0,0,COLLECTING"); }
    return;
  }

  static bool first_full = true;
  if (first_full) { steps_since_infer = 0; first_full = false; }

  steps_since_infer++;
  if (steps_since_infer < OVERLAP_STEP) {
    if (!fall_active) {
      Serial.print(now); Serial.print(",");
      Serial.print(rawAx); Serial.print(",");
      Serial.print(rawAy); Serial.print(",");
      Serial.print(rawAz); Serial.print(",");
      Serial.print(rawGx); Serial.print(",");
      Serial.print(rawGy); Serial.print(",");
      Serial.print(rawGz); Serial.print(",0.0000,");
      Serial.println(sleep_mode ? "SLEEP" : "NORMAL");
    }
    return;
  }
  steps_since_infer = 0;

  float fall_score = runInference();
  String status = "NORMAL";

  if (fall_score < 0.1f) { fall_confirm_count = 0; fall_miss_count = 0; }

  if (in_cooldown) {
    if (millis() >= cooldown_until) {
      in_cooldown = false;
      Serial.println("Cooldown over -- monitoring resumed");
    } else {
      status = "COOLDOWN";
      if (!fall_active) {
        Serial.print(now); Serial.print(",");
        Serial.print(rawAx); Serial.print(",");
        Serial.print(rawAy); Serial.print(",");
        Serial.print(rawAz); Serial.print(",");
        Serial.print(rawGx); Serial.print(",");
        Serial.print(rawGy); Serial.print(",");
        Serial.print(rawGz); Serial.print(",");
        Serial.print(fall_score, 4); Serial.print(",COOLDOWN");
        Serial.println();
      }
      return;
    }
  }

  if (fall_score >= FALL_THRESHOLD && sample_count >= WINDOW_SIZE && !fall_active) {
    fall_confirm_count++;
    fall_miss_count = 0;
    if (fall_confirm_count >= FALL_CONFIRM_FRAMES) {
      fall_confirm_count = 0; fall_miss_count = 0;
      last_fall_score = fall_score;
      status = "FALL_DETECTED";
      triggerAlert("AUTO");
    } else {
      status = "FALL_PENDING";
    }
  } else if (fall_active) {
    fall_confirm_count = 0; fall_miss_count = 0;
    status = "ALERT_ACTIVE";
  } else {
    fall_miss_count++;
    if (fall_miss_count >= FALL_MISS_FRAMES) { fall_confirm_count=0; fall_miss_count=0; }
    if (fall_score > 0.3f) {
      status = "WARNING";

    } else {
      if (!fall_active && !sleep_mode) digitalWrite(LED_PIN, LOW);
      status = sleep_mode ? "SLEEP" : "NORMAL";
    }
  }

  if (!fall_active) {
    Serial.print(now); Serial.print(",");
    Serial.print(rawAx); Serial.print(",");
    Serial.print(rawAy); Serial.print(",");
    Serial.print(rawAz); Serial.print(",");
    Serial.print(rawGx); Serial.print(",");
    Serial.print(rawGy); Serial.print(",");
    Serial.print(rawGz); Serial.print(",");
    Serial.print(fall_score, 4); Serial.print(",");
    Serial.println(status);
  }
}
