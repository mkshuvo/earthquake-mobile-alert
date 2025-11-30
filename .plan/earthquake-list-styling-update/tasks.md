# Earthquake List Styling Update - Tasks

[ ] TASK-001: Update Magnitude Color Logic
    [ ] Define central color constants or helper function (optional, but good practice).
    [ ] Update `getMagnitudeColor` in `src/App.tsx`.
    [ ] Update `getMagnitudeColor` in `src/components/EarthquakeCard.tsx`.

[ ] TASK-002: Implement High Alert UI in Banner (App.tsx)
    [ ] Import `MaterialCommunityIcons`.
    [ ] Modify `renderLocationBanner` to show Alert Icon for magnitude 8.0+.
    [ ] Apply "Blood Dark Red" background styling.

[ ] TASK-003: Implement High Alert UI in List (EarthquakeCard.tsx)
    [ ] Import `MaterialCommunityIcons`.
    [ ] Modify `EarthquakeCard` render to show Alert Icon for magnitude 8.0+.
    [ ] Ensure icon fits within or near the magnitude badge.

[ ] TASK-004: Verification & Cleanup
    [ ] Verify all color ranges (0-2.9, 3-3.9, 4-5.9, 6-7.9, 8+).
    [ ] Verify Icon appears only for 8+.
    [ ] Ensure no layout regressions.
