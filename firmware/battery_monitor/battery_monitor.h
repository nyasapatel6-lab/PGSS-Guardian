#pragma once
#include <Arduino.h>

// ============================================================
// BATTERY MONITOR (ADC voltage-divider replacement for MAX17043)
// ============================================================
// You do NOT have a MAX17043 fuel gauge. This module estimates
// battery percentage from raw voltage read through a resistor
// divider on an ESP32 ADC pin. It is NOT a coulomb-counting
// fuel gauge -- expect +/-10-15% error, worse mid-discharge.
//
// HARDWARE REQUIRED (confirm you actually have these before wiring):
//   - 2x resistors for the divider (100k + 100k recommended,
//     giving a 2:1 divide -> max ~2.1V into the ADC at 4.2V battery)
//   - GPIO34 chosen deliberately: input-only, ADC1 channel (ADC1
//     pins are unaffected by WiFi; ADC2 pins are not, and several
//     ADC2 pins are already reserved by other peripherals on this
//     board -- so ADC1 is the safe choice regardless).
//   - GPIO34 does NOT appear anywhere in your existing pin map
//     (SDA21, SCL22, BUZZER25, LED26, GPS16/17, BUTTON18, INT19),
//     so this cannot collide with existing wiring or code.
//
// WIRING:
//   Battery+ ---[R1 100k]---+---[R2 100k]--- GND
//                            |
//                          GPIO34
//
// If you end up using different resistor values, update ADC_R1 /
// ADC_R2 below to match -- the math depends on the exact ratio.
// ============================================================

#define BATTERY_ADC_PIN   34
#define ADC_R1            100000.0f   // battery+ side resistor (ohms)
#define ADC_R2            100000.0f   // ground side resistor (ohms)
#define BATTERY_SAMPLES    8          // averaged readings per call, reduces ADC noise

// Call once in setup(), after Serial.begin(), before first getBatteryPercent() call.
void initBatteryMonitor();

// Returns measured battery voltage in volts (already scaled by divider ratio).
float readBatteryVoltage();

// Returns estimated percentage 0-100, based on a piecewise LiPo discharge curve.
int getBatteryPercent();
