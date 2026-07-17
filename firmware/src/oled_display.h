#pragma once
#include <Arduino.h>

// ============================================================
// OLED DISPLAY (SSD1306, 0.96" 128x64, I2C address 0x3C)
// ============================================================
// Shares the existing I2C bus (SDA=GPIO21, SCL=GPIO22) already
// used by MPU6050 (0x69) and DS3231 (0x68). This module does NOT
// call Wire.begin() -- your existing code already initializes the
// I2C bus for the MPU6050/DS3231. Calling Wire.begin() twice is
// harmless on ESP32, but we avoid it here to keep this module from
// having any implicit dependency on init order.
//
// If your confirmed OLED address turns out to be 0x3D instead of
// 0x3C, change OLED_ADDRESS below. Confirm with an I2C scanner
// first, don't assume.
// ============================================================

// Call once in setup(), AFTER Wire/I2C has been brought up by your
// existing MPU6050/DS3231 init code.
void initOLED();

// Call periodically (recommend every 1-2s, non-blocking -- see
// integration notes) to refresh the screen.
void updateOLED(int batteryPercent, bool wifiConnected, bool fallActive, bool sleepMode);

// True if the display responded at begin(). If false, updateOLED()
// silently no-ops -- it will NOT halt or block the rest of the firmware.
bool oledIsAvailable();
