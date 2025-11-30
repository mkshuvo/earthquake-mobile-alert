# UI Enhancements and Fixes Design

## Architecture
*   **App.tsx**: Main layout container. Handles `activeTab`, `header`, `banner`, and `mapContainer`.
    *   `Header`: Absolute position `top: 0`.
    *   `EarthquakeMap`: Absolute fill.
    *   `LocationBanner`: Absolute position `bottom: 80`.
    *   `BottomNavigation`: Fixed at bottom.
*   **EarthquakeMap.tsx (Web)**:
    *   Leaflet map instance.
    *   Custom HTML/CSS overlays for Zoom and Locate buttons.
    *   `Zoom Controls`: `absolute`, `top: 130px`, `left: 10px`.
    *   `Locate Control`: `absolute`, `top: 130px`, `right: 10px`.
*   **EarthquakeMap.native.tsx (Native)**:
    *   `MapView` (Google Maps).
    *   `Zoom Controls`: `View` with `TouchableOpacity`, `absolute`, `top: 130`, `left: 16`.
    *   `Right Controls`: `View` with `TouchableOpacity`, `absolute`, `top: 130`, `right: 16`.

## Data Models
*   `EarthquakeEvent`: Existing interface.
*   `UserLocation`: `{ latitude, longitude }`.

## UI Layout Strategy
*   **Z-Index**:
    *   Header: 100
    *   Banner: 90
    *   Map Controls: 1000 (Web), Default (Native View order)
    *   Map: 0
    *   Bottom Nav: Implicitly high (rendered last/outside content container).

## Testing Strategy
*   **Manual Verification**:
    *   Check banner visibility and data.
    *   Check button positions on Web (simulated).
    *   Check button positions on Native (code review/simulated).
    *   Verify zoom and locate functionality.
