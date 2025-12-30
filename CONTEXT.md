# Development Context for ABC Emergency Map Card

This document provides context for Claude Code agents working on this project inside the devcontainer.

## Project Overview

This is a custom Lovelace card for Home Assistant that renders emergency incident polygons on a Leaflet map. It's a companion to the [ABC Emergency Integration](https://github.com/troykelly/homeassistant-abcemergency).

## Tech Stack

- **TypeScript** - Primary language
- **Lit** - Web component framework (same as Home Assistant frontend)
- **Leaflet.js** - Map rendering library with full GeoJSON/polygon support
- **Rollup** - Module bundler
- **pnpm** - Package manager

## Key Files

| File                               | Purpose                              |
| ---------------------------------- | ------------------------------------ |
| `src/abc-emergency-map-card.ts`    | Main card component                  |
| `src/types.ts`                     | TypeScript type definitions          |
| `src/styles.ts`                    | CSS styles (Lit css tagged template) |
| `src/editor.ts`                    | Visual card configuration editor     |
| `dist/abc-emergency-map-card.js`   | Built output (single file)           |
| `rollup.config.mjs`                | Build configuration                  |

## Development Commands

```bash
# Install dependencies
pnpm install

# Build once
pnpm run build

# Build with watch mode (for development)
pnpm run dev

# Lint code
pnpm run lint

# Type check
pnpm run typecheck
```

## Integration Points

### ABC Emergency Integration

The ABC Emergency integration provides geo_location entities with:

- `latitude` / `longitude` - Point location (centroid)
- `extra_state_attributes`:
  - `alert_level` - "extreme", "severe", "moderate", "minor"
  - `alert_text` - Human-readable warning level
  - `event_type` - "bushfire", "flood", "storm", etc.
  - `has_polygon` - Boolean indicating if polygon data available
  - `geometry_type` - "Point", "Polygon", "MultiPolygon"

**NOTE:** The integration currently stores polygon data for containment detection but doesn't expose the raw GeoJSON coordinates via entity attributes. You may need to:

1. Add a service to the integration that exports GeoJSON
2. Or modify the integration to include polygon coordinates in attributes
3. Or create an API endpoint in the integration

### Leaflet GeoJSON

Leaflet has native GeoJSON support:

```typescript
L.geoJSON(geojsonData, {
  style: (feature) => ({
    color: getAlertColor(feature.properties.alert_level),
    fillOpacity: 0.3,
  }),
  onEachFeature: (feature, layer) => {
    layer.bindPopup(feature.properties.headline);
  },
}).addTo(map);
```

## Australian Warning System Colors

| Level             | API Value  | Color   | Hex       |
| ----------------- | ---------- | ------- | --------- |
| Emergency Warning | `extreme`  | Red     | `#cc0000` |
| Watch and Act     | `severe`   | Orange  | `#ff6600` |
| Advice            | `moderate` | Yellow  | `#ffcc00` |
| Information       | `minor`    | Blue    | `#3366cc` |

## Testing with Home Assistant

To test during development:

1. Build the card: `pnpm run build`
2. Copy `dist/abc-emergency-map-card.js` to your HA `config/www/` folder
3. Add the resource to Lovelace
4. Create a card configuration

For live development, consider using a symlink or HTTP server.

## GitHub Project

All work should be tracked via GitHub Issues and the project board.

- **Project:** https://github.com/users/troykelly/projects/6
- **Repository:** https://github.com/troykelly/lovelace-abc-emergency-map

## Related Resources

- [Lit Documentation](https://lit.dev/)
- [Leaflet Documentation](https://leafletjs.com/)
- [Leaflet GeoJSON Tutorial](https://leafletjs.com/examples/geojson/)
- [Home Assistant Frontend Architecture](https://developers.home-assistant.io/docs/frontend/)
- [Custom Card Tutorial](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/)
- [HACS Plugin Development](https://hacs.xyz/docs/publish/plugin/)
