# UI Enhancements and Fixes Requirements

## Feature Overview
Resolve UI breakages reported by user and enhance the location banner and map controls positioning according to specific design requirements.

## Functional Requirements
1.  **Location Banner**:
    *   Position: Bottom of the screen (above bottom navigation).
    *   Size: 100% larger than previous iteration (approx 120px height).
    *   Content: Magnitude (highlighted circle), Location (large text), Time, Depth.
    *   Styling: High contrast, readable fonts, shadow/elevation.
2.  **Map Controls (Web & Native)**:
    *   **Zoom In/Out**: Positioned at Top Left (below header).
    *   **Locate Me / Center**: Positioned at Top Right (below header).
    *   **Refresh** (Native): Positioned below Locate Me at Top Right.
3.  **Cross-Platform Compatibility**:
    *   Ensure map works on both Web (Leaflet) and Native (Google Maps).
    *   Ensure layout respects safe areas and navigation bars.

## Non-Functional Requirements
*   Responsive layout for different screen sizes.
*   Performance: No significant lag during map interactions.
*   Accessibility: Buttons should be large enough (min 44x44px) for touch targets.

## User Stories
*   As a user, I want to see earthquake details clearly at the bottom of the map so I don't obstruct the view.
*   As a user, I want to easily zoom in and out using buttons on the top left.
*   As a user, I want to quickly center the map on my location using a button on the top right.

## Tech Stack
*   React Native / Expo
*   react-native-maps (Native)
*   Leaflet (Web)
*   Zustand (State Management)

## Constraints
*   Must use existing project structure.
*   Must resolve "native-only module" errors for web.
