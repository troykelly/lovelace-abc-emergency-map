# ABC Emergency Map Card

A custom Home Assistant Lovelace card for rendering ABC Emergency incident polygons on a Leaflet map.

## Project Overview

This is a **frontend Lovelace card** (TypeScript/Lit), NOT a backend integration. It displays emergency incidents from the [ABC Emergency Integration](https://github.com/troykelly/homeassistant-abcemergency) on an interactive map with proper polygon boundaries.

## Why This Exists

Home Assistant's native map card only supports point markers. Emergency incidents often have polygon boundaries (fire perimeters, flood zones) that are critical for situational awareness. This card uses Leaflet.js to render those polygons.

## Tech Stack

- **TypeScript** + **Lit** (web components)
- **Leaflet.js** (mapping library)
- **Rollup** (bundler)
- **pnpm** (package manager)

## Development Commands

```bash
pnpm install      # Install dependencies
pnpm run dev      # Build with watch
pnpm run build    # Production build
pnpm run lint     # ESLint
pnpm run typecheck # TypeScript check
```

## Project Management

**ALL work MUST be tracked via GitHub Issues.**

| Item        | Value                                             |
| ----------- | ------------------------------------------------- |
| Project URL | https://github.com/users/troykelly/projects/6     |
| Repository  | troykelly/lovelace-abc-emergency-map              |

### The Iron Law

```
NO CODE CHANGES WITHOUT A LINKED GITHUB ISSUE
```

## Key Implementation Notes

### Getting Polygon Data

The ABC Emergency integration stores polygon coordinates internally for containment detection but may not expose them via entity attributes yet. Options:

1. Modify integration to add `geojson` attribute to geo_location entities
2. Create a service that returns GeoJSON for all incidents
3. Use WebSocket API to query the coordinator directly

### Australian Warning System Colors

```typescript
const ALERT_COLORS = {
  extreme: "#cc0000", // Emergency Warning - Red
  severe: "#ff6600", // Watch and Act - Orange
  moderate: "#ffcc00", // Advice - Yellow
  minor: "#3366cc", // Information - Blue
};
```

### Card Configuration

```yaml
type: custom:abc-emergency-map-card
title: Emergency Map
entities:
  - geo_location.abc_emergency
default_zoom: 10
```

## File Structure

```
src/
├── abc-emergency-map-card.ts   # Main card
├── editor.ts                   # Config editor
├── styles.ts                   # CSS
└── types.ts                    # TypeScript types
```

## Resources

- [Lit](https://lit.dev/)
- [Leaflet GeoJSON](https://leafletjs.com/examples/geojson/)
- [HA Custom Cards](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/)
