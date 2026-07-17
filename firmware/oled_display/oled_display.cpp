#include "oled_display.h"
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH   128
#define SCREEN_HEIGHT   64
#define OLED_ADDRESS  0x3C

static Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
static bool oled_ok = false;

void initOLED() {
  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDRESS)) {
    // Deliberately does NOT halt the whole board -- your MAX17043
    // section of the doc says "it will halt and print 'not found'".
    // For a wearable safety device, a missing display should never
    // block fall detection / alerts from running. So: log and continue.
    Serial.println("ERROR: SSD1306 not found at 0x3C -- display disabled, rest of system continues");
    oled_ok = false;
    return;
  }
  oled_ok = true;
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.display();
}

bool oledIsAvailable() {
  return oled_ok;
}

void updateOLED(int batteryPercent, bool wifiConnected, bool fallActive, bool sleepMode) {
  if (!oled_ok) return;

  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);

  display.printf("Batt: %d%%\n", batteryPercent);
  display.printf("WiFi: %s\n", wifiConnected ? "OK" : "--");

  if (fallActive) {
    display.println("STATUS: FALL ALERT");
  } else if (sleepMode) {
    display.println("STATUS: SLEEP");
  } else {
    display.println("STATUS: OK");
  }

  display.display();
}
