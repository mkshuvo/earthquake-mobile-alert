# Tasks: Mobile Sound Alert & MQTT Refactor

- [ ] TASK-001: Install Dependencies and Polyfills
  - Install `expo-av`, `expo-location`, `mqtt`.
  - Install polyfills: `buffer`, `process`, `events`, `stream-browserify`, `url`.
  - Configure `metro.config.js` if necessary for polyfills.

- [ ] TASK-002: Create SoundService
  - Create `src/services/soundService.ts`.
  - Implement `load`, `play`, `stop` using `expo-av`.
  - Add dummy/placeholder sound file if real one not available (or download one).

- [ ] TASK-003: Implement User Location Logic
  - Update `App.tsx` to request permissions.
  - Store location in `EarthquakeStore`.

- [ ] TASK-004: Refactor EarthquakeService (MQTT)
  - Remove `window` and script injection hacks.
  - Import `mqtt` library directly.
  - Implement robust URL detection (Simulator vs Device).
  - Ensure subscription to `earthquakes/alerts` works.

- [ ] TASK-005: Implement Alert Trigger Logic
  - In `EarthquakeService` MQTT callback:
    - Retrieve user location.
    - Calculate distance.
    - If `mag >= 4.0` and `dist <= 100km`, trigger `SoundService`.
  - Add UI indicator (e.g., Alert Banner) in `App.tsx` when sound is playing.

- [ ] TASK-006: Verification
  - Run app in Simulator.
  - Manually publish MQTT message to topic.
  - Confirm sound plays and alert shows.
