# Enhance Banner & Map Lock - Requirements

## 1. Feature Overview
This feature focuses on two main improvements:
1.  **Banner Enhancement**: Beautify the "Latest Near Me" (or "Recent") earthquake banner in `App.tsx`. It needs to be more prominent, visually appealing, and include a colored "bar" on the left edge indicating severity (similar to the list cards).
2.  **Map Sticky Lock**: Ensure the map view automatically centers and "locks" to the user's current location, rather than drifting or defaulting to a generic world view.

## 2. Functional Requirements

### 2.1 Enhanced Banner UI
-   **Visual Style**:
    -   Must be more "beautiful" and "highlighting".
    -   Add a **vertical color bar** on the left edge (width ~4-6px).
    -   The color of the bar must match the earthquake's magnitude severity color (Green/Blue/Orange/Red/DarkRed).
    -   Include shadow/elevation for depth.
    -   Improve typography (bold location, clear magnitude).
-   **Content**: Display the most relevant earthquake (nearest or most recent).

### 2.2 Map Sticky Lock
-   **Behavior**:
    -   On app load, immediately fetch user location.
    -   Center the map on the user's coordinates.
    -   **"Sticky" Logic**: prevent the map from resetting to `(0,0)` or a default location when new earthquake data arrives, unless the user manually moves it (optional, but "sticky" implies keeping focus).
    -   For this iteration, we will focus on **initial lock** and **re-centering button** if needed, or ensuring the `region` state prefers user location over earthquake list center.

## 3. Tech Stack
-   React Native (StyleSheet, View, Text)
-   `react-native-maps` (for native map control)
-   Leaflet (for Web map control, via `EarthquakeMapWeb.tsx`)

## 4. Assumptions
-   The "Banner" refers to `renderLocationBanner` in `App.tsx`.
-   "Sticky lock" means setting the initial region to the user's location and maintaining it as the primary focus point.
