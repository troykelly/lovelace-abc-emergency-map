# Configuration Reference

Complete reference for all ABC Emergency Map Card configuration options.

---

## Table of Contents

- [Core Settings](#core-settings)
- [Map Settings](#map-settings)
- [Display Options](#display-options)
- [Marker Visibility](#marker-visibility)
- [Alert Colors](#alert-colors)
- [Zone Styling](#zone-styling)
- [History Trails](#history-trails)
- [Animations](#animations)
- [Badge Settings](#badge-settings)
- [Tile Providers](#tile-providers)
- [Dynamic Entity Discovery](#dynamic-entity-discovery)
- [Full Configuration Example](#full-configuration-example)

---

## Core Settings

Basic configuration options for the card.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | string | - | **Required.** Must be `custom:abc-emergency-map-card` |
| `title` | string | - | Card title displayed in the header |
| `entity` | string | - | Primary entity to track (deprecated, use `entities`) |
| `entities` | string[] | `[]` | List of entities to display as markers |
| `default_zoom` | number | `10` | Initial zoom level (1-20, where 1 is world view) |
| `hours_to_show` | number | `24` | Hours of history to display for trails |

### Example

```yaml
type: custom:abc-emergency-map-card
title: Family Tracker
entities:
  - person.john
  - person.jane
  - device_tracker.car
default_zoom: 12
hours_to_show: 48
```

---

## Map Settings

Configure the map appearance and behavior.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `tile_provider` | string | `osm` | Tile provider: `osm`, `cartodb`, `mapbox`, `custom` |
| `tile_url` | string | - | Custom tile URL template (when `tile_provider: custom`) |
| `tile_attribution` | string | - | Custom tile attribution text |
| `api_key` | string | - | API key for providers requiring authentication (Mapbox) |
| `dark_mode` | string | `auto` | Theme mode: `auto`, `light`, `dark` |
| `auto_fit` | boolean | `true` | Auto-zoom to show all entities/incidents |
| `fit_padding` | number \| [number, number] | `50` | Padding for auto-fit in pixels |
| `fit_max_zoom` | number | `17` | Maximum zoom level when auto-fitting |

### Tile Providers

| Provider | Description | API Key Required | Dark Mode |
|----------|-------------|------------------|-----------|
| `osm` | OpenStreetMap (default) | No | No |
| `cartodb` | CartoDB Voyager tiles | No | Yes |
| `mapbox` | Mapbox Streets | Yes | Yes |
| `custom` | Your own tile server | Depends | Depends |

### Example: Mapbox Tiles

```yaml
type: custom:abc-emergency-map-card
tile_provider: mapbox
api_key: your_mapbox_api_key
dark_mode: auto
```

### Example: Custom Tiles

```yaml
type: custom:abc-emergency-map-card
tile_provider: custom
tile_url: "https://{s}.tile.example.com/{z}/{x}/{y}.png"
tile_attribution: "Map data &copy; Example"
```

### Theme Modes

| Mode | Behavior |
|------|----------|
| `auto` | Follows Home Assistant theme setting (default) |
| `light` | Always use light mode tiles and UI |
| `dark` | Always use dark mode tiles and UI |

---

## Display Options

Control what elements are shown on the map.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `show_zones` | boolean | `true` | Show Home Assistant zones |
| `show_warning_levels` | boolean | `true` | Show ABC Emergency incident polygons |
| `show_history` | boolean | `false` | Show entity movement trails |
| `show_badge` | boolean | `true` | Show incident count badge |
| `show_new_indicator` | boolean | `true` | Show "new" count in badge |

### Example

```yaml
type: custom:abc-emergency-map-card
show_zones: true
show_warning_levels: true
show_history: true
show_badge: true
show_new_indicator: true
```

---

## Marker Visibility

Control how entity markers are displayed relative to incident polygons. These options help reduce visual clutter when viewing large-scale incidents.

### How Incidents Are Displayed

Incidents can be displayed as either **markers** (pin icons) or **polygons** (boundary shapes):

| Entity Has | Displays As |
|------------|-------------|
| Polygon/MultiPolygon geometry | Polygon boundary with popup |
| Point-only geometry | Marker with popup |
| No geometry (lat/lon only) | Marker with popup |

By default, when an incident has polygon data, only the polygon is shown (the marker is hidden to reduce visual clutter).

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `hide_markers_for_polygons` | boolean | `true` | Hide markers when incident has polygon geometry |
| `marker_min_zoom` | number | - | Only show markers when zoomed in beyond this level (1-20) |
| `marker_polygon_threshold` | number | - | Hide markers for polygons larger than this extent in meters |

### Configuration Priority

Options are applied in this order (first match hides the marker):

1. **`show_warning_levels`** - If `false`, polygons never render (only markers show)
2. **`hide_markers_for_polygons`** - If `true`, markers hidden for entities with polygon geometry
3. **`marker_min_zoom`** - If set, markers hidden when zoom level is below threshold
4. **`marker_polygon_threshold`** - If set, markers hidden for polygons larger than specified meters

### Example: Show Markers for All Incidents

Disable polygon rendering to show only markers:

```yaml
type: custom:abc-emergency-map-card
geo_location_sources:
  - sensor.abc_emergency_auremer_incidents_total
show_warning_levels: false
```

### Example: Show Polygons Only (Hide Markers)

Default behavior - markers hidden when polygon exists:

```yaml
type: custom:abc-emergency-map-card
geo_location_sources:
  - sensor.abc_emergency_auremer_incidents_total
hide_markers_for_polygons: true
```

### Example: Show Both Polygons and Markers

Display markers alongside polygon boundaries:

```yaml
type: custom:abc-emergency-map-card
geo_location_sources:
  - sensor.abc_emergency_auremer_incidents_total
hide_markers_for_polygons: false
```

### Example: Show Markers Only When Zoomed In

Show markers when zoom level exceeds 12 (closer view):

```yaml
type: custom:abc-emergency-map-card
geo_location_sources:
  - sensor.abc_emergency_auremer_incidents_total
hide_markers_for_polygons: true
marker_min_zoom: 12
```

### Example: Show Markers for Small Incidents Only

Hide markers for large incidents (polygon extent > 10km):

```yaml
type: custom:abc-emergency-map-card
geo_location_sources:
  - sensor.abc_emergency_auremer_incidents_total
hide_markers_for_polygons: true
marker_polygon_threshold: 10000
```

### Example: Combine Zoom and Size Thresholds

Show markers only when zoomed in AND incident is smaller than 5km:

```yaml
type: custom:abc-emergency-map-card
geo_location_sources:
  - sensor.abc_emergency_auremer_incidents_total
hide_markers_for_polygons: true
marker_min_zoom: 10
marker_polygon_threshold: 5000
```

---

## Alert Colors

Customize the colors used for incident severity levels. By default, the card uses the Australian Warning System color scheme.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `alert_color_preset` | string | `australian` | Color preset: `australian`, `us_nws`, `eu_meteo`, `high_contrast` |
| `alert_colors` | object | - | Custom colors for individual alert levels (overrides preset) |

### Color Presets

| Preset | Extreme | Severe | Moderate | Minor | Description |
|--------|---------|--------|----------|-------|-------------|
| `australian` | Red (#cc0000) | Orange (#ff6600) | Yellow (#ffcc00) | Blue (#3366cc) | Australian Warning System (default) |
| `us_nws` | Red (#cc0000) | Orange (#ff6600) | Yellow (#ffcc00) | Cyan (#00bfff) | US National Weather Service style |
| `eu_meteo` | Red (#cc0000) | Orange (#ff6600) | Yellow (#ffcc00) | Green (#33cc33) | European Meteorological style |
| `high_contrast` | Dark Red (#990000) | Dark Orange (#cc5500) | Dark Yellow (#ccaa00) | Dark Blue (#003399) | Accessibility-focused darker variants |

### Example: Using a Preset

```yaml
type: custom:abc-emergency-map-card
geo_location_sources:
  - sensor.abc_emergency_auremer_incidents_total
alert_color_preset: us_nws
```

### Example: Custom Colors

Override individual alert levels with custom colors:

```yaml
type: custom:abc-emergency-map-card
geo_location_sources:
  - sensor.abc_emergency_auremer_incidents_total
alert_colors:
  extreme: "#ff0000"
  severe: "#ff8800"
  moderate: "#ffdd00"
  minor: "#0088ff"
```

### Example: Preset with Overrides

Start with a preset and override specific levels:

```yaml
type: custom:abc-emergency-map-card
geo_location_sources:
  - sensor.abc_emergency_auremer_incidents_total
alert_color_preset: australian
alert_colors:
  minor: "#00ff00"  # Override just the minor level
```

### Alert Level Mapping

| Level | Australian Term | US NWS Term | Meaning |
|-------|-----------------|-------------|---------|
| `extreme` | Emergency Warning | Warning | Immediate danger - take action now |
| `severe` | Watch and Act | Watch | Conditions changing - prepare to act |
| `moderate` | Advice | Advisory | Incident occurring - stay informed |
| `minor` | Information | Statement | General information |

---

## Zone Styling

Customize the appearance of Home Assistant zones.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `zone_color` | string | `#4285f4` | Zone fill color (CSS color value) |
| `zone_opacity` | number | `0.2` | Zone fill opacity (0-1) |
| `zone_border_opacity` | number | `0.5` | Zone border opacity (0-1) |

### Example

```yaml
type: custom:abc-emergency-map-card
show_zones: true
zone_color: "#ff0000"
zone_opacity: 0.3
zone_border_opacity: 0.8
```

---

## History Trails

Configure entity movement history trails.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `show_history` | boolean | `false` | Enable history trails |
| `history_entities` | string[] | - | Specific entities to show history for (defaults to all) |
| `history_line_weight` | number | `3` | Trail line weight in pixels |
| `hours_to_show` | number | `24` | Hours of history to display |

### Example

```yaml
type: custom:abc-emergency-map-card
show_history: true
history_entities:
  - person.john
  - device_tracker.car
history_line_weight: 4
hours_to_show: 12
```

---

## Animations

Configure incident animations and transitions.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `animations_enabled` | boolean | `true` | Enable pulse/glow effects |
| `animation_duration` | number | `2000` | Animation duration in milliseconds |
| `geometry_transitions` | boolean | `true` | Enable smooth polygon morphing |
| `transition_duration` | number | `500` | Transition duration in milliseconds |

### Example

```yaml
type: custom:abc-emergency-map-card
animations_enabled: true
animation_duration: 3000
geometry_transitions: true
transition_duration: 750
```

### Disabling Animations

For users who prefer reduced motion:

```yaml
type: custom:abc-emergency-map-card
animations_enabled: false
geometry_transitions: false
```

> **Note:** The card also respects the `prefers-reduced-motion` CSS media query automatically.

---

## Badge Settings

Configure the incident count badge.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `show_badge` | boolean | `true` | Show the badge |
| `show_new_indicator` | boolean | `true` | Show "new" count for recent incidents |
| `badge_position` | string | `top-right` | Badge position |

### Badge Positions

| Position | Description |
|----------|-------------|
| `top-left` | Top left corner of the map |
| `top-right` | Top right corner of the map (default) |
| `bottom-left` | Bottom left corner of the map |
| `bottom-right` | Bottom right corner of the map |

### Example

```yaml
type: custom:abc-emergency-map-card
show_badge: true
show_new_indicator: true
badge_position: bottom-right
```

---

## Tile Providers

Detailed configuration for each tile provider.

### OpenStreetMap (Default)

Free, no API key required:

```yaml
type: custom:abc-emergency-map-card
tile_provider: osm
```

### CartoDB

Free with dark mode support:

```yaml
type: custom:abc-emergency-map-card
tile_provider: cartodb
dark_mode: auto
```

### Mapbox

High-quality tiles, requires API key:

```yaml
type: custom:abc-emergency-map-card
tile_provider: mapbox
api_key: pk.your_mapbox_public_access_token
dark_mode: auto
```

Get your Mapbox API key at [mapbox.com](https://www.mapbox.com/).

### Custom Tile Server

Use any tile server:

```yaml
type: custom:abc-emergency-map-card
tile_provider: custom
tile_url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
tile_attribution: "Map data &copy; OpenTopoMap contributors"
```

URL placeholders:
- `{s}` - Subdomain (for load balancing)
- `{z}` - Zoom level
- `{x}` - Tile X coordinate
- `{y}` - Tile Y coordinate

---

## Dynamic Entity Discovery

Use `geo_location_sources` to dynamically discover and display incident entities.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `geo_location_sources` | string[] | `[]` | Sensor entities that expose `entity_ids` attributes |

### How It Works

The ABC Emergency Integration creates sensors with `entity_ids` attributes listing geo_location entities. This card reads those attributes to dynamically discover which entities to display.

### Available Sources

| Sensor Pattern | Description |
|----------------|-------------|
| `sensor.abc_emergency_*_incidents_total` | All incidents |
| `sensor.abc_emergency_*_bushfires` | Bushfire incidents |
| `sensor.abc_emergency_*_floods` | Flood incidents |
| `sensor.abc_emergency_*_storms` | Storm incidents |
| `sensor.abc_emergency_*_emergency_warnings` | Emergency Warning level |
| `sensor.abc_emergency_*_watch_and_acts` | Watch and Act level |
| `sensor.abc_emergency_*_advices` | Advice level |
| `binary_sensor.abc_emergency_*_inside_polygon` | Incidents affecting a location |

### Example: Show All Incidents

```yaml
type: custom:abc-emergency-map-card
title: All Incidents
geo_location_sources:
  - sensor.abc_emergency_auremer_incidents_total
```

### Example: Show Only Bushfires

```yaml
type: custom:abc-emergency-map-card
title: Bushfires Only
geo_location_sources:
  - sensor.abc_emergency_auremer_bushfires
```

### Example: Show Incidents Affecting Home

```yaml
type: custom:abc-emergency-map-card
title: Incidents Affecting Me
geo_location_sources:
  - binary_sensor.abc_emergency_auremer_inside_polygon
```

### Example: Multiple Sources

```yaml
type: custom:abc-emergency-map-card
title: High Priority Incidents
geo_location_sources:
  - sensor.abc_emergency_auremer_emergency_warnings
  - sensor.abc_emergency_auremer_watch_and_acts
```

---

## Full Configuration Example

A comprehensive example using all available options:

```yaml
type: custom:abc-emergency-map-card
title: Complete Emergency Map

# Core Settings
entities:
  - person.john
  - person.jane
  - device_tracker.car
default_zoom: 10
hours_to_show: 24

# Map Settings
tile_provider: cartodb
dark_mode: auto
auto_fit: true
fit_padding: 50
fit_max_zoom: 17

# Display Options
show_zones: true
show_warning_levels: true
show_history: true
show_badge: true
show_new_indicator: true

# Alert Colors
alert_color_preset: australian
alert_colors:
  # Override specific levels if needed
  # extreme: "#ff0000"

# Zone Styling
zone_color: "#4285f4"
zone_opacity: 0.2
zone_border_opacity: 0.5

# History Trails
history_entities:
  - person.john
history_line_weight: 3

# Animations
animations_enabled: true
animation_duration: 2000
geometry_transitions: true
transition_duration: 500

# Badge
badge_position: top-right

# Dynamic Entity Discovery
geo_location_sources:
  - sensor.abc_emergency_auremer_incidents_total
```

---

## See Also

- [Getting Started](getting-started.md) - First-time setup guide
- [Features](features.md) - Detailed feature documentation
- [Examples](examples/) - Copy-paste configuration examples
- [Troubleshooting](troubleshooting.md) - Common issues and solutions
