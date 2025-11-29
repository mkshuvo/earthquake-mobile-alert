# Earthquake Alert Mobile App - Setup Guide

Professional React Native mobile application for earthquake detection and real-time alerts.

## 📱 Features

✅ **Real-time Earthquake Map** - Interactive Google Maps showing earthquake locations with magnitude circles
✅ **Large Magnitude Display** - Prominent magnitude indicators (6.2, 5.1, 4.8 etc) with color-coded severity
✅ **Live Updates** - WebSocket connection for instant earthquake notifications
✅ **Advanced Search** - Search earthquakes by city, state, or country
✅ **Filtering** - Filter by magnitude, time range, and location
✅ **Detailed Cards** - Large earthquake detail cards with depth, timestamp, and tsunami info
✅ **Bottom Navigation** - 5-tab navigation (Recent, Safety, My Log, Help, More)
✅ **Real-time Connection Status** - Live indicator showing connection state
✅ **Professional UI** - Teal/green accent colors matching the design reference

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- React Native CLI: `npm install -g react-native-cli`
- Android Studio (for Android) or Xcode (for iOS)
- Earthquake Alert Backend running on port 51763

### Installation

1. **Install Dependencies**
   ```bash
   cd earthquake-mobile-alert
   npm install
   ```

2. **Link Native Modules** (if needed)
   ```bash
   npx react-native link react-native-maps
   npx react-native link react-native-vector-icons
   ```

3. **Start Metro Server**
   ```bash
   npm start
   ```

### Running the App

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

## 🏗️ Project Structure

```
earthquake-mobile-alert/
├── src/
│   ├── App.tsx                 # Main app component
│   ├── components/
│   │   ├── EarthquakeMap.tsx   # Interactive map with earthquake markers
│   │   ├── EarthquakeCard.tsx  # Earthquake detail card (LARGE)
│   │   ├── Header.tsx          # Search & filter header
│   │   └── BottomNavigation.tsx # 5-tab bottom navigation
│   ├── services/
│   │   └── earthquakeService.ts # API & WebSocket service
│   └── store/
│       └── earthquakeStore.ts  # Zustand state management
├── index.js                    # Entry point
├── app.json                    # App configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

## 🔧 Configuration

### Backend Connection

Update the API URL in `src/services/earthquakeService.ts`:

```typescript
const API_BASE_URL = 'http://localhost:51763/api';
const WS_URL = 'http://localhost:51763';
```

For Android, use your machine IP instead of localhost:
```typescript
const API_BASE_URL = 'http://192.168.x.x:51763/api';
```

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| react-native-maps | Interactive maps with markers and circles |
| react-navigation | Bottom tab navigation |
| zustand | Lightweight state management |
| socket.io-client | Real-time WebSocket updates |
| axios | HTTP client for API calls |
| moment | Date/time formatting |
| react-native-vector-icons | Material Design icons |

## 🎨 UI Components

### EarthquakeMap
- Interactive Google Map
- Earthquake magnitude circles (color-coded by severity)
- User location marker
- Map control buttons (center, refresh)
- Dynamic zoom based on selected earthquake

### EarthquakeCard (LARGE - 55% of screen)
- Large magnitude badge (60x60px)
- Location name and timestamp
- Depth and tsunami indicators
- Action buttons (Details, Share)
- Smooth animations

### Header
- Search bar with location autocomplete
- "I felt shaking" button (teal/green)
- Filters button
- Legend button

### BottomNavigation
- Recent (default active)
- Safety
- My Log
- Help
- More

## 🔌 Real-time Features

### WebSocket Integration
Automatic reconnection with exponential backoff:
- Initial delay: 1 second
- Max delay: 5 seconds
- Max attempts: 5

### Data Synchronization
- Automatic polling every 30 seconds
- Real-time earthquake event streaming
- Local state persistence

## 📍 Map Features

### Magnitude Visualization
```
6.0+ = Red (#FF3B30)
5.0-5.9 = Orange (#FF9500)
4.0-4.9 = Yellow (#FFCC00)
<4.0 = Light Yellow (#FFEB3B)
```

### Circle Ripple Effects
- Base radius: 20,000 meters
- Scale: magnitude * 15,000 meters
- Provides visual magnitude indication

## ⚡ Performance Optimizations

- FlatList for efficient earthquake list rendering
- Memoized components to prevent unnecessary re-renders
- Debounced search input
- Lazy loading of map tiles
- Optimized circle rendering for multiple earthquakes

## 🔒 Security

- HTTPS/TLS for production API calls
- Certificate validation for WebSocket
- Input validation and sanitization
- No sensitive data in logs

## 🐛 Debugging

### Enable Redux DevTools
```typescript
// In src/store/earthquakeStore.ts
// Add Redux DevTools logging for debugging state changes
```

### View Logs
```bash
npx react-native log-android  # Android
npx react-native log-ios      # iOS
```

## 📱 Device-Specific Setup

### Android
1. Install Google Play Services
2. Update `android/build.gradle`:
   ```gradle
   googlePlayServicesVersion = "21.0.1"
   ```
3. Add to `AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
   <uses-permission android:name="android.permission.INTERNET" />
   ```

### iOS
1. Install pods: `cd ios && pod install`
2. Add to `Info.plist`:
   ```xml
   <key>NSLocationWhenInUseUsageDescription</key>
   <string>We need your location to show earthquakes near you</string>
   ```

## 🚨 Common Issues

**Issue: Map not showing**
- Ensure Google Maps API key is configured
- Check Android/iOS native setup

**Issue: WebSocket connection fails**
- Verify backend is running on port 51763
- Check firewall settings
- Ensure correct IP for Android emulator

**Issue: Permissions denied**
- Grant location and internet permissions
- Check app settings in device Settings

## 📚 API Reference

### EarthquakeService

```typescript
// Fetch earthquakes with filters
getEarthquakes(filters?: Filters): Promise<EarthquakeEvent[]>

// Connect real-time WebSocket
connectWebSocket(callbacks: WebSocketCallbacks): void

// Get connection status
isConnected(): boolean

// Disconnect WebSocket
disconnectWebSocket(): void
```

### Zustand Store

```typescript
// State
earthquakes: EarthquakeEvent[]
filteredEarthquakes: EarthquakeEvent[]
selectedEarthquake: EarthquakeEvent | null
isConnected: boolean

// Actions
setEarthquakes(earthquakes)
addEarthquake(earthquake)
setSelectedEarthquake(earthquake)
setFilters(filters)
filterEarthquakes()
```

## 🌐 Production Build

### Android
```bash
npm run android -- --mode release
```

### iOS
```bash
npm run ios -- --mode release
```

## 📊 Monitoring

- Use React DevTools for component inspection
- Monitor WebSocket connection status
- Track API response times
- Log errors to Sentry/Crashlytics

## 🤝 Contributing

Follow React Native and TypeScript best practices:
- Use functional components and hooks
- Type all props and state
- Keep components small and focused
- Write meaningful comments for complex logic

## 📄 License

Proprietary - Earthquake Detection System

---

**Questions?** Check the backend API documentation or contact the development team.
