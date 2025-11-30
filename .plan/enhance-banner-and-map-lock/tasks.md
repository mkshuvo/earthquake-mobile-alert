# Enhance Banner & Map Lock - Tasks

[ ] TASK-001: Update `App.tsx` Banner Styling
    [ ] Create new styles: `bannerContainer`, `bannerContent`, `leftBar`.
    [ ] Add shadow/elevation properties to `bannerContainer`.
    [ ] Implement the "left edge bar" using a colored View.
    [ ] Refine typography and layout within the banner.

[ ] TASK-002: Implement Map Lock (Web) in `EarthquakeMapWeb.tsx`
    [ ] Verify `userLocationRef` logic.
    [ ] Ensure `initializeMap` centers on user location if available.
    [ ] Add a mechanism to re-center if the user pans away (optional, but good for "sticky" feel).

[ ] TASK-003: Implement Map Lock (Native) in `EarthquakeMap.tsx`
    [ ] Get user location using `expo-location` or similar (if not already present in App).
    [ ] Pass user location to Map component.
    [ ] Set `initialRegion` to user location.

[ ] TASK-004: Verification
    [ ] Check Banner UI: Shadow, Left Bar, Text.
    [ ] Check Map: Reload app, ensure it centers on user.
