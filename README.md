# 🛡️ PGSS – Personal Guardian Safety System

> **AI-Powered Wearable Fall Prediction, Detection & Emergency Response Platform**
>
> **Intelligent Protection. Instant Response.**

## 📖 Overview

PGSS (Personal Guardian Safety System) is an AI-powered **waist-mounted wearable** designed to predict falls before they happen, detect confirmed falls in real time, and automatically notify guardians with the user's live GPS location.

The system uses an ESP32 running a TensorFlow Lite CNN model to analyze motion data from the MPU6050. When instability is detected, the wearable warns the user through vibration, buzzer, LEDs, and an OLED display. If a fall is confirmed, GPS coordinates are captured, the event is logged to Supabase, and emergency notifications are sent to the React Native app and Telegram.

---

# ✨ Features

- AI-Based Fall Prediction
- Real-Time Fall Detection
- TensorFlow Lite on ESP32
- Waist-Mounted Wearable
- GPS Tracking
- OLED Display
- Vibration, Buzzer & LED Alerts
- Manual SOS Button
- React Native Mobile App
- Supabase Cloud Integration
- Telegram Emergency Notifications
- Incident History
- Automatic Guardian Notifications
- Early Instability Warning

---

# 🚨 Problem Statement

PGSS addresses delayed emergency response for elderly individuals, women travelling alone, Parkinson's patients, epilepsy patients, stroke survivors, and industrial workers.

Unlike traditional wearable devices that only detect a fall after impact, PGSS predicts instability before a fall occurs using an embedded TensorFlow Lite CNN model running directly on the ESP32. This enables the device to warn users early through vibration, buzzer, and LED alerts while automatically notifying guardians if a fall is confirmed.

---

# 🏗️ System Architecture

```text
MPU6050 → ESP32 → TensorFlow Lite CNN
                 │
                 ▼
      Instability Prediction
                 │
      Warning (Vibration/Buzzer/LED)
                 │
        Fall Confirmed?
          │         │
         No        Yes
          │         ▼
          │      GPS Module
          │         ▼
          │     Supabase Cloud
          │         ▼
          └── React Native App
                    ▼
          Telegram Notification
```
<img width="1267" height="786" alt="image" src="https://github.com/user-attachments/assets/b9ff10e4-92bc-417a-b511-4d8bc74298bb" />


# ⚙️ Hardware

- ESP32 DevKit V1
- MPU6050
- Neo-6M GPS
- SSD1306 OLED
- Coin Vibration Motor
- Active Buzzer
- LEDs
- SOS Button
- TP4056 Charging Module
- Li-Ion Battery

# 💻 Software Stack

## Firmware
- PlatformIO
- Arduino Framework
- TensorFlow Lite for Microcontrollers

## Mobile App
- React Native
- Expo SDK 54
- Expo Router
- TypeScript

## Backend
- Supabase
- Supabase Realtime
- PostgreSQL
- Telegram Bot API

  # 📂 Project Structure

```text
PGSS/
│
├── firmware/
│   ├── src/
│   ├── sensors/
│   ├── gps/
│   ├── alerts/
│   └── fall_detection/
│
├── app/
│   ├── onboarding/
│   ├── (tabs)/
│   ├── context/
│   ├── lib/
│   ├── constants/
│   └── assets/
│
├── ai/
│   ├── dataset/
│   ├── training/
│   ├── evaluation/
│   └── model_export/
│
├── backend/
│
├── hardware/
│   ├── schematics/
│   ├── bom/
│   ├── enclosure/
│   └── testing/
│
├── app_screenshots/
│
├── assets/
│
└── README.md
```

# 📥 Prerequisites

- Git
- Node.js 18+
- PlatformIO
- VS Code
- Expo Go
- Supabase Account
- Telegram Bot

# ☁️ Supabase Setup

Create Alerts, Vitals and Commands tables and enable Realtime.

# 🤖 Telegram Setup

Create a bot using @BotFather, obtain the Bot Token and Chat ID, then add them to the .env file.

# 🔌 Hardware Connections

| Module | ESP32 Pin |
|---------|-----------|
| SDA | GPIO21 |
| SCL | GPIO22 |
| GPS RX | GPIO17 |
| GPS TX | GPIO16 |
| Buzzer | GPIO25 |
| LED | GPIO26 |
| SOS | GPIO18 |

# ⚡ Firmware

```bash
cd firmware
pio run
pio run --target upload
pio device monitor
```

# 📱 Mobile App

```bash
cd app
npm install --legacy-peer-deps
npx expo start
```


# ▶️ Running the Complete Project

## 1. Flash the Firmware

```bash
cd firmware
pio run
pio run --target upload
pio device monitor
```

## 2. Start the Mobile App

```bash
cd app
npm install --legacy-peer-deps
npx expo start
```

## 3. Connect the Device

- Power on the ESP32 wearable.
- Connect it to Wi-Fi.
- Ensure GPS has a satellite fix.
- Open the React Native app.
- Verify that the device appears online.
- Press the SOS button or simulate a fall to verify Telegram notifications and cloud logging.


# 📊 Performance

- Forward Fall: 95%
- Backward Fall: 90%
- Side Fall: 95%
- Sensitivity: 93.3%
- Specificity: 97%
- CNN Inference: 12 ms
- Telegram Alert: 1.8 s

# 🚀 Future Scope

- Heart Rate Monitoring
- SpO₂ Monitoring
- Smartwatch Integration
- Improved AI Models
- Hospital Integration

# 👥 Team

Elite Lab

- Nyasa Patel
- Ashish Bhosale
- Akriti Gupta
- Kajal Bidlan

# 📄 License

MIT License

# 🌍 Impact

PGSS combines Embedded AI, IoT, GPS, Cloud Computing, and Mobile Technologies into an affordable waist-mounted wearable capable of predicting instability before impact, detecting falls in real time, and automatically notifying guardians through the mobile application and Telegram. By reducing emergency response time and providing early warnings, PGSS aims to improve the safety, confidence, and independence of elderly individuals and other vulnerable users.

