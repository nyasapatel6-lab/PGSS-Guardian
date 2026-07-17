#include "battery_monitor.h"

void initBatteryMonitor() {
  pinMode(BATTERY_ADC_PIN, INPUT);   // GPIO34 is input-only anyway, explicit for clarity
  analogReadResolution(12);          // 0-4095
  analogSetPinAttenuation(BATTERY_ADC_PIN, ADC_11db); // allows reading up to ~2.6-3.3V at the pin
}

float readBatteryVoltage() {
  uint32_t mv_sum = 0;
  for (int i = 0; i < BATTERY_SAMPLES; i++) {
    // analogReadMilliVolts() uses the ESP32's factory ADC calibration
    // (eFuse). This is meaningfully more accurate than raw analogRead()
    // fed through manual math -- ESP32 ADCs are notoriously non-linear.
    mv_sum += analogReadMilliVolts(BATTERY_ADC_PIN);
    delay(2);
  }
  float v_adc  = (mv_sum / (float)BATTERY_SAMPLES) / 1000.0f;   // volts at the GPIO pin
  float v_batt = v_adc * (ADC_R1 + ADC_R2) / ADC_R2;            // undo the divider
  return v_batt;
}

int getBatteryPercent() {
  float v = readBatteryVoltage();

  // Rough single-cell 3.7V LiPo discharge curve (rest voltage, not under load).
  // This is NOT linear -- a naive "map(voltage, 3.0, 4.2, 0, 100)" is wrong
  // and will overstate remaining charge in the 3.7-3.9V band.
  struct Point { float voltage; int percent; };
  static const Point curve[] = {
    {4.20, 100}, {4.06, 90}, {3.98, 80}, {3.92, 70},
    {3.87, 60},  {3.82, 50}, {3.79, 40}, {3.77, 30},
    {3.73, 20},  {3.68, 10}, {3.45, 0}
  };
  const int n = sizeof(curve) / sizeof(curve[0]);

  if (v >= curve[0].voltage)     return 100;
  if (v <= curve[n - 1].voltage) return 0;

  for (int i = 0; i < n - 1; i++) {
    if (v <= curve[i].voltage && v >= curve[i + 1].voltage) {
      float span = curve[i].voltage - curve[i + 1].voltage;
      float pos  = v - curve[i + 1].voltage;
      float frac = pos / span;
      return curve[i + 1].percent + (int)(frac * (curve[i].percent - curve[i + 1].percent));
    }
  }
  return 0; // unreachable, keeps compiler happy
}
