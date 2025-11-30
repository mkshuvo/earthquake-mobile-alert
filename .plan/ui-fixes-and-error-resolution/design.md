# Design: UI Fixes and Error Resolution

## Architecture Changes
No major architectural changes. The fixes are localized to components and configuration.

## Component Updates

### 1. `EarthquakeMap.tsx` (Web)
- **Null Safety**:
  - Added conditional checks before calling `.toFixed()` on `magnitude` and `depth`.
  - Logic: `earthquake.magnitude ? earthquake.magnitude.toFixed(1) : '0.0'`
- **Map Controls**:
  - Custom HTML buttons added to the Leaflet map container.
  - **Zoom Controls**: Positioned absolute top-left.
  - **Locate Control**: Positioned absolute top-right.
  - **Event Handling**: `onclick` handlers bridge to React state/methods via `window` global.

### 2. `earthquakeService.ts`
- **MQTT Configuration**:
  - Updated `MQTT_WS_PORT` from `45329` to `8083`.
  - Rationale: `8083` is the standard WebSocket port for EMQX brokers, ensuring compatibility with the backend infrastructure.
  - URL Construction: `ws://${host}:8083/mqtt`.

### 3. `App.tsx`
- **Layout Adjustments**:
  - `locationBanner` style updated to have `bottom: 5` (5px gap).
  - `LogBox.ignoreLogs` added to suppress deprecated `expo-av` warnings.

## Data Flow
1. **Initialization**: App starts -> `EarthquakeMap` mounts -> Loads Leaflet (Web).
2. **Data Fetching**: `EarthquakeService` fetches initial data -> Connects to MQTT (port 8083).
3. **Rendering**: Map renders markers. Popups use safe accessors for data.
4. **Updates**: MQTT message -> Store update -> Map re-renders (or updates markers).

## Security & Performance
- **Null Checks**: Prevent runtime crashes (White Screen of Death).
- **Correct Port**: Prevents connection timeouts and unnecessary retries.
