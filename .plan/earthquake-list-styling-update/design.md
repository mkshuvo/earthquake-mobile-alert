# Earthquake List Styling Update - Design

## 1. Architecture & Data Flow
This feature is purely a UI/Presentation layer update. No changes to the backend, API, or store are required. The data flow remains:
`Store -> Component -> Helper Function (Color Logic) -> Render`

## 2. UI/UX Design

### 2.1 Color Palette
We will use a consistent color mapping function across the app.

| Magnitude Range | Color Name     | Hex Code  | Description |
|-----------------|----------------|-----------|-------------|
| 0 - 2.9         | Green          | `#4CAF50` | Low/Minor   |
| 3.0 - 3.9       | Blue           | `#2196F3` | Moderate    |
| 4.0 - 5.9       | Orange         | `#FF9800` | Strong      |
| 6.0 - 7.9       | Red            | `#F44336` | Major       |
| 8.0+            | Blood Dark Red | `#8B0000` | Great/Extreme |

### 2.2 Visual Indicators
- **Magnitude Circle**: The background color of the magnitude circle will change based on the table above.
- **High Alert Icon (8.0+)**:
  - **Icon**: `MaterialCommunityIcons` name="alert-octagram" (or "alert-decagram" if available, otherwise "alert").
  - **Color**: White (on Dark Red background) or Dark Red (if placed outside).
  - **Placement**: Inside the magnitude circle (if space permits) or immediately adjacent to the magnitude text.

## 3. Component Design

### 3.1 `src/App.tsx`
- **Function**: `getMagnitudeColor(magnitude: number): string`
  - Update logic to support the new 5-tier scale.
- **Render**: `renderLocationBanner`
  - Add conditional rendering for the Alert Icon if `magnitude >= 8.0`.

### 3.2 `src/components/EarthquakeCard.tsx`
- **Function**: `getMagnitudeColor(magnitude: number): string`
  - Update logic to match `App.tsx`.
- **Render**:
  - Inside the `magnitudeBadge` View, conditionally render the Alert Icon.
  - Ensure layout handles the extra icon without breaking alignment.

## 4. Testing Strategy
- **Visual Verification**:
  - Temporarily hardcode mock data in `App.tsx` or `store` to force earthquakes with magnitudes: 2.5, 3.5, 5.0, 7.0, and 9.0.
  - Verify correct color and icon appearance for each case.
