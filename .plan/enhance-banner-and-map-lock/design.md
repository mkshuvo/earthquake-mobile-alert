# Enhance Banner & Map Lock - Design

## 1. UI/UX Design

### 1.1 Enhanced Banner (`App.tsx`)
The banner will be transformed from a simple row into a **floating card** with high visibility.

*   **Layout**:
    *   Container: Absolute positioning (bottom of map area) or Flex (below map), with margins.
    *   **Left Border**: A 6px wide vertical bar on the left, colored by magnitude.
    *   **Background**: White with high elevation (shadow) to pop against the map/content.
    *   **Content**:
        *   **Left**: Magnitude Circle (existing, but refined) or just the text if the bar is sufficient (we will keep the circle for consistency with list).
        *   **Middle**: Location Name (Bold, Large), Distance/Time info.
        *   **Right**: "HIGH RISK" or "Monitor" badge (existing).
*   **Styling**:
    *   `shadowColor: "#000"`, `shadowOffset: { width: 0, height: 4 }`, `shadowOpacity: 0.3`, `shadowRadius: 4.65`, `elevation: 8`.
    *   `borderRadius: 8` (except top-left/bottom-left if using a strict side-bar, but usually `overflow: hidden` with a colored View strip works best).

### 1.2 Map Sticky Lock (`EarthquakeMapWeb.tsx` & `EarthquakeMap.tsx`)
*   **Logic**:
    *   The map component must prioritize `userLocation` over `earthquakeList[0]` for its initial region.
    *   **Web**: In `useEffect`, after getting `navigator.geolocation`, call `map.setView(userLat, userLng, zoomLevel)`.
    *   **Native**: Use `MapView.animateToRegion` or `initialRegion` prop tied to user location state.

## 2. Component Updates

### 2.1 `src/App.tsx`
*   **Modify `renderLocationBanner`**:
    *   Wrap content in a new `styles.bannerContainer` with shadow props.
    *   Add a `<View style={{ width: 6, backgroundColor: color }} />` as the first child for the "slight bar".
    *   Adjust padding and internal layout to accommodate the bar.

### 2.2 `src/components/EarthquakeMapWeb.tsx`
*   **Update `initializeMap`**:
    *   Ensure `center` calculation strictly prefers `userLocationRef.current` if available.
    *   Add a "My Location" button (optional but good UX) or just ensure auto-centering works reliably on load.

### 2.3 `src/components/EarthquakeMap.tsx` (Native)
*   **Update Props**: Accept `userLocation` if not already doing so.
*   **Effect**: When `userLocation` is resolved, animate map to that region.

## 3. Data Flow
No changes to data flow. Purely presentation and local state (geolocation) handling.

## 4. Testing
*   **Banner**: Verify visual appearance (shadow, left bar color) for different magnitudes.
*   **Map**: Reload app and verify map centers on "user location" (simulated or real) instead of `(0,0)` or random earthquake.
