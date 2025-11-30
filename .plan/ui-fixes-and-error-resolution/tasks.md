# Tasks: UI Fixes and Error Resolution

## Phase 1: Critical Bug Fixes
[x] TASK-001: Fix `toFixed` Runtime Error in `EarthquakeMap.tsx`
    [x] Identify vulnerable code in `EarthquakeMap.tsx`
    [x] Add null/undefined checks for `magnitude`
    [x] Add null/undefined checks for `depth`

[x] TASK-002: Fix MQTT Connection Failure
    [x] Identify incorrect port in `earthquakeService.ts`
    [x] Change port from 45329 to 8083
    [x] Verify backend configuration (EMQX standard port)
    [x] Fix "Close received after close" error by removing conflicting `protocol` option and increasing timeout

[x] TASK-006: Fix `toFixed` Runtime Error in `EarthquakeCard.tsx`
    [x] Identify vulnerable code in `EarthquakeCard.tsx`
    [x] Add null check for `magnitude`
    [x] Add type check for `distance`

## Phase 2: UI Refinements
[x] TASK-003: Fix Banner Positioning
    [x] Adjust `bottom` margin to 5px in `App.tsx`
    [x] Ensure correct z-index and visibility

[x] TASK-004: Fix Map Controls (Web)
    [x] Remove default Leaflet zoom control
    [x] Add custom Zoom In/Out buttons (Top-Left)
    [x] Add custom Locate Me button (Top-Right)

## Phase 3: Verification
[ ] TASK-005: End-to-End Verification
    [ ] User to confirm app loads without errors
    [ ] User to confirm MQTT connection status
    [ ] User to confirm UI layout satisfaction

## Phase 4: Revert & Stabilization (Current)
[x] TASK-007: Revert UI to Master State
    [x] Revert `src/App.tsx`
    [x] Revert `src/components/EarthquakeCard.tsx`
    [x] Revert `src/components/EarthquakeMap.tsx`
    [x] Revert `src/store/earthquakeStore.ts`
    [x] Restore `src/components/EarthquakeMapWeb.tsx` (Fix Web Bundle Error)

[x] TASK-008: Re-apply Critical Fixes
    [x] Re-add null checks in `EarthquakeCard.tsx`
    [x] Re-add null checks in `EarthquakeMap.tsx`
    [x] Ensure MQTT port fix (8083) is retained

[x] TASK-009: Verify MQTT Connection
    [x] Create test script for port 8083
    [x] Confirm successful connection to local broker

