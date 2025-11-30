# Requirements: Mobile Sound Alert & MQTT Refactor

## 1. Overview
The goal is to implement a "Loud Sound Alert" feature in the `earthquake-mobile-alert` app. This alert will be triggered when a significant earthquake is detected via MQTT near the user's location. Additionally, the current MQTT implementation relies on web-only hacks (`window`, script injection) and must be refactored to work natively on Android and iOS using proper React Native libraries.

## 2. Functional Requirements

### 2.1 Real-time Alerting
- **Mechanism**: The app must subscribe to the `earthquakes/alerts` MQTT topic.
- **Trigger**: Alerts are triggered by incoming MQTT messages containing earthquake data.
- **Condition**: An alert is considered "Critical" if:
  - Magnitude is ≥ 4.0 (High Risk).
  - Distance to user is ≤ 500 km (Monitoring Zone) - *Adjustable*.
  - **Loud Alert** specifically for Magnitude ≥ 5.0 AND Distance ≤ 100 km.

### 2.2 Audio Feedback
- **Sound**: Play a loud, distinct emergency siren sound when a Critical Alert condition is met.
- **Vibration**: Pattern vibration (SOS pattern) alongside sound.
- **Control**: User should be able to stop the sound by interacting with the alert (e.g., tapping a button).

### 2.3 User Location
- **Permission**: Request "When In Use" location permissions on startup.
- **Tracking**: Get current device coordinates (Latitude, Longitude).
- **Fallback**: If location is denied, default to a safe mode (alert on all > 6.0 earthquakes globally, or just show visual alerts).

### 2.4 Connectivity
- **Environment Awareness**:
  - **Simulator/Emulator**: Must connect to the Host machine's MQTT broker (e.g., `10.0.2.2` for Android, `localhost` for iOS).
  - **Physical Device**: Must connect to the Docker host's LAN IP (configurable).
  - **Web**: Must connect to `localhost` or specified hostname.

## 3. Non-Functional Requirements
- **Latency**: Alert processing should happen within < 100ms of receiving the MQTT packet.
- **Battery**: Location updates should be efficient (e.g., `getCurrentPositionAsync` rather than continuous watching if possible, or low-frequency watch).
- **Reliability**: MQTT connection should auto-reconnect on network loss.

## 4. Tech Stack
- **Framework**: React Native (Expo SDK 51).
- **Audio**: `expo-av` (Standard Expo library for audio).
- **Location**: `expo-location`.
- **MQTT**: `precompiled-mqtt` or `mqtt` (v4/v5) with polyfills (`buffer`, `events`, `process`, `url`).
- **State Management**: `zustand` (Existing).

## 5. Constraints
- **Background Execution**: iOS has strict background execution limits. This feature initially targets **Foreground** alerts. Background alerts (Push Notifications) are out of scope for this specific "Sound Alert" task but can be handled by the existing OS notification system if integrated later.
- **Docker Networking**: The mobile app runs *outside* the Docker network, so it must address the broker via exposed ports.
