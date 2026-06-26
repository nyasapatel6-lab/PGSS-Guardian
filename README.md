# PGSS – Personal Guardian Safety System

## AI-Powered Wearable Safety & Emergency Response Platform

PGSS (Personal Guardian Safety System) is an AI-powered wearable safety solution designed to detect falls and emergency situations in real time, automatically notify guardians, and provide live monitoring through a mobile application.

The system combines:

* Embedded AI Fall Detection
* ESP32-Based Wearable Hardware
* GPS Location Tracking
* Mobile Application Monitoring
* Cloud Connectivity
* Emergency Alert Services

---

# Problem Statement

Falls and sudden medical emergencies often occur without immediate assistance being available.

This problem is especially critical for:

* Elderly individuals
* Women travelling alone
* Industrial workers
* Parkinson's patients
* Epilepsy patients

Existing solutions are often expensive, require manual SOS activation, or lack intelligent emergency detection.

---

# Proposed Solution

PGSS continuously monitors user motion using onboard sensors and applies an AI-based fall detection model running directly on the ESP32.

When a fall is detected:

1. Motion data is analyzed by the CNN model.
2. GPS location is captured.
3. Emergency alerts are generated.
4. Data is stored in the cloud.
5. The guardian application receives the alert.
6. Guardians can view incident details and location in real time.

---

# Key Features

## Embedded AI Fall Detection

* CNN-based activity classification
* On-device inference
* Real-time fall detection

### Detects

* Forward Falls
* Backward Falls
* Side Falls

---

## GPS Tracking

* Live location acquisition
* Emergency location sharing
* Guardian monitoring

---

## Emergency Alerts

* Telegram Notifications
* App-Based Alerts
* Cloud Event Logging such as date, time, location and type

---

## Guardian Mobile Application

* Live Device Monitoring
* Emergency Alerts
* Incident History
* Guardian Management
* Device Connectivity
* User Profile Management

---

# System Architecture

```text
MPU6050 Sensor
        │
        ▼
ESP32 Controller
        │
        ▼
CNN Fall Detection Model
        │
        ▼
Fall Detected?
        │
   ┌────┴───────┐
   NO          YES
   │            │
   ▼            ▼
 Continue   GPS Module
Monitoring      │
                ▼
         Cloud Database
                │
                ▼
      Guardian Mobile App
                │
                ▼
      Emergency Notification
```

---

# Hardware Architecture

## Components

| Component  | Purpose             |
| ---------- | ------------------- |
| ESP32      | Main Controller     |
| MPU6050    | Motion Detection    |
| GPS Module | Location Tracking   |
| Battery    | Power Supply        |
| WiFi       | Cloud Communication |
| RTC Module | Date And Time       |

---

# Software Architecture

## Firmware

* PlatformIO
* ESP32
* Arduino Framework

## Mobile Application

* React Native
* Expo SDK 54
* Expo Router
* TypeScript

## Backend

* Node.js
* Express.js

## Database

* Supabase

## AI / Machine Learning

* CNN Model
* TensorFlow Lite
* Embedded Inference

---

# Mobile Application

## Tech Stack

* Expo SDK 54
* React Native
* Expo Router
* TypeScript
* Supabase
* Expo Location
* Async Storage

---

## Application Features

### Dashboard

Displays:

* Battery Level
* GPS Coordinates
* Device Status
* Guardian Information

### Connect Device

* ESP32 Connection
* WiFi Connectivity
* Device Monitoring

### History

* Previous Alerts
* Incident Records
* Severity Tracking

### Account

* Personal Profile
* Medical Information
* Guardian Details

### Onboarding

* Personal Information
* Guardian Setup
* Health Information

---

# Project Structure

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
├── hardware/
│   ├── schematics/
│   ├── bom/
│   ├── photos/
│   └── testing/
│
├── docs/
│   ├── architecture/
│   ├── screenshots/
│   ├── reports/
│   └── testing/
│
└── README.md
```

---

# Database Schema

## Alerts Table

Stores:

* Alert Type
* Severity
* GPS Location
* User Information
* Guardian Information
* Device Information

## Vitals Table

Stores:

* Battery Level
* Fall Score
* GPS Coordinates
* Device Status

## Commands Table

Stores:

* Sleep Commands
* Panic Commands
* Remote Actions

Realtime updates are enabled for remote communication.

---

# Testing Results

## Fall Detection Performance

| Scenario      | Accuracy |
| ------------- | -------- |
| Forward Fall  | 95%      |
| Backward Fall | 90%      |
| Side Fall     | 95%      |

### Overall Metrics

* Sensitivity: 93.3%
* Specificity: 97.0%

---

## Latency

| Operation        | Time  |
| ---------------- | ----- |
| CNN Inference    | 12 ms |
| Telegram Alert   | 1.8 s |
| Database Update  | 0.9 s |
| Dashboard Update | 2.0 s |

---

## GPS Performance

* Cold Start: 45–90 seconds
* Warm Start: 5–15 seconds
* Accuracy: ±3 meters

---

# Bill of Materials (BOM)

| Component  | Approx. Cost |
| ---------- | ------------ |
| ESP32      | ₹250         |
| MPU6050    | ₹100         |
| GPS Module | ₹400         |
| Battery    | ₹250         |

Estimated Total Cost: ₹1000–₹1500

---

# Installation Guide

## Firmware

```bash
pio run
```

Upload firmware using PlatformIO.

---

## Mobile App

```bash
npm install --legacy-peer-deps
npx expo start
```

Run using Expo Go or Android Emulator.

---

# Future Scope

* Smartwatch Integration
* Heart Rate Monitoring
* Blood Oxygen Monitoring
* Predictive Risk Analytics
* Voice Emergency Assistance
* Multi-Guardian Support
* Advanced Cloud Dashboard

---

# Contributors

### Project Lead

* Documentation
* Architecture
* Project Coordination

### Hardware & AI Development

* ESP32 Firmware
* Sensor Integration
* CNN Training
* GPS Integration

### Mobile Application Development

* React Native Development
* Database Integration
* UI/UX Design

### Media & Presentation

* Demo Video
* Graphics
* Submission Assets

---

# Impact

PGSS reduces emergency response time by automatically detecting falls and sharing real-time location information with guardians.

By combining Embedded AI, IoT, Cloud Computing, and Mobile Technologies, PGSS provides an affordable, scalable, and intelligent personal safety solution.
