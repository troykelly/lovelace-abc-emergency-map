# ABC Emergency Map Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/release/troykelly/lovelace-abc-emergency-map.svg)](https://github.com/troykelly/lovelace-abc-emergency-map/releases)

A custom Lovelace card for Home Assistant that displays Australian emergency incidents on an interactive map with polygon boundaries.

## Features

- **Polygon Rendering**: Renders emergency incident boundaries as polygons (not just points)
- **Australian Warning System Colors**:
  - **Emergency Warning** (Red) - Highest level, immediate danger
  - **Watch and Act** (Orange) - Heightened threat, take action
  - **Advice** (Yellow) - Incident active, stay informed
  - **Information** (Blue) - General information
- **Animations**: Pulse/glow effects for new and updated incidents
- **Smooth Transitions**: Morphing polygon boundaries when incidents update
- **Badge Notifications**: Incident count badge with severity indicator
- **Entity Markers**: Display person, device_tracker, and geo_location entities
- **Zone Rendering**: Show Home Assistant zones on the map
- **History Trails**: Display entity movement history
- **Theme Support**: Auto-detects HA theme (light/dark), or set manually
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- **Visual Editor**: Full configuration UI in Lovelace

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to Frontend > Custom repositories
3. Add `https://github.com/troykelly/lovelace-abc-emergency-map` as a Lovelace plugin
4. Install "ABC Emergency Map Card"
5. Add the resource in your Lovelace configuration

### Manual Installation

1. Download `abc-emergency-map-card.js` from the [latest release](https://github.com/troykelly/lovelace-abc-emergency-map/releases)
2. Copy to `config/www/community/abc-emergency-map-card/`
3. Add the resource to your Lovelace configuration:

```yaml
resources:
  - url: /local/community/abc-emergency-map-card/abc-emergency-map-card.js
    type: module
```

## Configuration

### Basic Configuration

```yaml
type: custom:abc-emergency-map-card
title: Emergency Map
```

### Full Configuration

```yaml
type: custom:abc-emergency-map-card
title: Emergency Map
entity: person.john                    # Primary entity to track
entities:                              # Additional entities
  - device_tracker.phone
  - person.jane
default_zoom: 10                       # Initial zoom level (1-20)
hours_to_show: 24                      # Hours of history to display

# Map Settings
tile_provider: osm                     # osm, cartodb, mapbox, custom
dark_mode: auto                        # auto, light, dark
auto_fit: true                         # Auto-zoom to show all entities
fit_padding: 50                        # Padding for auto-fit in pixels
fit_max_zoom: 17                       # Maximum zoom for auto-fit

# Display Options
show_zones: true                       # Show Home Assistant zones
show_warning_levels: true              # Show ABC Emergency polygons
show_history: false                    # Show entity movement trails
show_badge: true                       # Show incident count badge
show_new_indicator: true               # Show "new" count in badge

# Zone Styling
zone_color: "#4285f4"                  # Zone fill color
zone_opacity: 0.2                      # Zone fill opacity (0-1)
zone_border_opacity: 0.5               # Zone border opacity (0-1)

# History Trails
history_entities:                      # Specific entities to show history for
  - person.john
history_line_weight: 3                 # Trail line weight in pixels

# Animations
animations_enabled: true               # Enable pulse/glow effects
animation_duration: 2000               # Animation duration in ms
geometry_transitions: true             # Smooth polygon morphing
transition_duration: 500               # Transition duration in ms

# Badge
badge_position: top-right              # top-left, top-right, bottom-left, bottom-right

# Mapbox (if using tile_provider: mapbox)
api_key: your_mapbox_api_key

# Custom Tiles (if using tile_provider: custom)
tile_url: "https://{s}.tile.example.com/{z}/{x}/{y}.png"
tile_attribution: "Custom Attribution"
```

### Tile Providers

| Provider | Description | API Key Required |
|----------|-------------|------------------|
| `osm` | OpenStreetMap (default) | No |
| `cartodb` | CartoDB Voyager/Dark tiles | No |
| `mapbox` | Mapbox Streets/Dark tiles | Yes |
| `custom` | Your own tile server | Depends |

### Theme Modes

| Mode | Description |
|------|-------------|
| `auto` | Follows Home Assistant theme setting (default) |
| `light` | Always use light map tiles |
| `dark` | Always use dark map tiles |

## Keyboard Navigation

When the map is focused:
- **Arrow keys**: Pan the map
- **+ / -**: Zoom in/out
- **Home**: Reset view to fit all content

## Requirements

- Home Assistant 2024.1+
- [ABC Emergency Integration](https://github.com/troykelly/homeassistant-abcemergency)

## Development

```bash
pnpm install      # Install dependencies
pnpm run dev      # Build with watch
pnpm run build    # Production build
pnpm run lint     # ESLint
pnpm run typecheck # TypeScript check
```

See [CONTEXT.md](CONTEXT.md) for detailed development setup instructions.

## Why Leaflet 1.9.4?

This card uses **Leaflet 1.9.4** rather than the newer 2.0.0-alpha. Here's why:

| Concern | Leaflet 1.9.4 | Leaflet 2.0.0-alpha |
|---------|---------------|---------------------|
| **Stability** | Production-ready | Alpha (expect bugs) |
| **SRI Security** | Available | Not available |
| **Plugin Ecosystem** | Full compatibility | Most plugins not updated |
| **API Stability** | Stable | May change before release |

**Leaflet 2.0 stable is targeted for November 2025.** We plan to migrate once:
- The stable release is published
- SRI hashes are available for CDN integrity verification
- Core plugins we may need are updated

If you're interested in tracking this, see the [Leaflet 2.0 discussion](https://github.com/Leaflet/Leaflet/discussions/9719).

## License

MIT
