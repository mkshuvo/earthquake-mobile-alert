# Requirements: UI Fixes and Error Resolution

## Overview
This plan addresses critical runtime errors and UI regressions in the Earthquake Mobile Alert application (React Native/Expo). The primary focus is ensuring stability, correct data visualization, and reliable real-time updates via MQTT.

## Problem Statement
The user reported the following issues:
1. **Runtime Error**: `Uncaught TypeError: Cannot read properties of null (reading 'toFixed')` in `EarthquakeMap.tsx`.
2. **Connectivity Error**: WebSocket connection failure to `ws://localhost:45329/mqtt`.
3. **UI Issues**: Banner gap too large, map controls missing or misaligned (addressed in previous iterations but require final verification).

## Functional Requirements
1. **Robust Data Handling**:
   - `EarthquakeMap` must gracefully handle null/undefined values for `magnitude` and `depth`.
   - No app crashes due to missing data fields.

2. **Real-time Connectivity**:
   - The app must connect to the correct MQTT broker port.
   - Standard EMQX WebSocket port is **8083** (not 45329).
   - Connection status should be reflected in the app (if applicable).

3. **User Interface**:
   - **Banner**:
     - Positioned at the bottom with a 5px gap from the navigation bar.
     - High visibility (large font, contrasting colors).
   - **Map Controls**:
     - Zoom In/Out buttons at the top-left.
     - Locate Me button at the top-right.
     - No overlap with other UI elements.

## Technical Constraints
- **Platform**: React Native (Expo), specifically targeting Web execution but compatible with Native (Android/iOS).
- **Map Library**: Leaflet.js for Web, React Native Maps for Native (handled via `.native.tsx` and `.tsx` files).
- **State Management**: Zustand store.
- **Protocol**: MQTT over WebSockets for real-time updates.

## Verification Criteria
- [ ] App loads without `toFixed` errors.
- [ ] MQTT connection is established successfully on port 8083.
- [ ] Real-time alerts are received and displayed.
- [ ] UI elements are correctly positioned and styled.
