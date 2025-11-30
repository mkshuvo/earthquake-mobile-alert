  # Earthquake List Styling Update - Requirements

## 1. Feature Overview
Update the visual styling of the earthquake list and details to reflect magnitude severity through color coding and icons. This enhances user ability to quickly assess earthquake severity.

## 2. Functional Requirements
### 2.1 Magnitude Color Coding
The circle background color for earthquake magnitude must follow these ranges:
- **0 - 2.9**: Green
- **3.0 - 3.9**: Blue (Interpreted from "3.0-4.9" vs "4.0-5.9" overlap; 4.0+ takes precedence as Orange)
- **4.0 - 5.9**: Orange
- **6.0 - 7.9**: Red
- **8.0+**: Blood Dark Red

### 2.2 High Severity Indicators
- For earthquakes with magnitude **8.0 and above**:
  - Display a **High Alert Icon** alongside or inside the magnitude indicator.
  - Use a "Blood Dark Red" color (e.g., `#8B0000` or similar).
  - Icon Reference: User suggested `TfiAlert` from `react-icons`. 
  - **Constraint**: `react-icons` is a web library. Since this is a React Native project without `react-native-svg` setup for HTML SVGs, we will use the equivalent icon from the already installed `react-native-vector-icons` library (e.g., `FontAwesome` or `MaterialCommunityIcons` alert icon).

## 3. Non-Functional Requirements
- **Performance**: efficient rendering in FlatList.
- **Consistency**: Apply same color logic in `App.tsx` (Banner) and `EarthquakeCard.tsx` (List items).

## 4. Tech Stack
- React Native
- TypeScript
- `react-native-vector-icons` (for icons)

## 5. Assumptions
- The user meant "3.0-3.9" for Blue, as "4.0-5.9" is Orange.
- "Blood Dark Red" will be represented by a hex code like `#8B0000` or `#721c24`.
