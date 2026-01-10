# Features Documentation

Detailed documentation of all ABC Emergency Map Card features.

---

## Table of Contents

- [Polygon Rendering](#polygon-rendering)
- [Alert Level Colors](#alert-level-colors)
- [Animations](#animations)
- [Entity Markers](#entity-markers)
- [Zone Rendering](#zone-rendering)
- [History Trails](#history-trails)
- [Badge Notifications](#badge-notifications)
- [Auto-fit Bounds](#auto-fit-bounds)
- [Theme Support](#theme-support)
- [Accessibility](#accessibility)
- [Visual Editor](#visual-editor)

---

## Polygon Rendering

The primary feature that distinguishes this card from the native Home Assistant map.

### How It Works

1. The card reads `geojson` or `geometry` attributes from `geo_location` entities
2. GeoJSON Polygon and MultiPolygon geometries are rendered as filled shapes
3. Polygons are styled based on alert level
4. Higher severity incidents render on top (z-ordering)

### Supported Geometry Types

| Type | Description | Rendering |
|------|-------------|-----------|
| Point | Single coordinate | Circle marker |
| Polygon | Single shape with optional holes | Filled polygon |
| MultiPolygon | Multiple shapes | Multiple filled polygons |

### Z-Ordering (Severity Layering)

Polygons are layered by severity to ensure visibility:

1. **Bottom:** Minor (blue) incidents
2. **Middle-low:** Moderate (yellow) incidents
3. **Middle-high:** Severe (orange) incidents
4. **Top:** Extreme (red) incidents

This ensures Emergency Warnings are always visible, even when overlapping lower-severity incidents.

### Configuration

```yaml
type: custom:abc-emergency-map-card
show_warning_levels: true  # Enable polygon rendering (default)
```

### Data Flow Architecture

Understanding how incident data flows from Home Assistant to the map:

```
Entity State (from ABC Emergency Integration)
│
├── attributes.geojson or geometry
│   │
│   ├── type: "Polygon" or "MultiPolygon"
│   │   └─→ Renders as incident polygon with severity coloring
│   │       └─→ Marker visibility controlled by hide_markers_for_polygons
│   │
│   └── type: "Point"
│       └─→ Renders as marker only (no polygon boundary available)
│           └─→ Affected by marker_min_zoom and marker_polygon_threshold
│
├── attributes.latitude/longitude
│   └─→ Marker position (fallback if no geometry)
│
└── attributes.alert_level
    └─→ Determines color: extreme=red, severe=orange, moderate=yellow, minor=blue
```

### Marker vs Polygon Decision Tree

```
For each incident entity:
│
├── Has Polygon/MultiPolygon geometry?
│   ├── YES → Render polygon
│   │         └─→ Show marker? Check hide_markers_for_polygons
│   │             ├── false → Show marker alongside polygon
│   │             └── true  → Hide marker (default)
│   │
│   └── NO (Point or no geometry) → Render marker only
│       └─→ Apply marker_min_zoom and marker_polygon_threshold filters
```

See [Marker Visibility Configuration](configuration.md#marker-visibility) for detailed options.

---

## Alert Level Colors

The card uses configurable color schemes for incident severity. The default is the official Australian Warning System colors.

### Default Colors (Australian Warning System)

| Level | Color | Hex | Meaning |
|-------|-------|-----|---------|
| **Emergency Warning** | Red | `#cc0000` | Immediate danger - take action now |
| **Watch and Act** | Orange | `#ff6600` | Conditions changing - prepare to act |
| **Advice** | Yellow | `#ffcc00` | Incident active - stay informed |
| **Information** | Blue | `#3366cc` | General information |

### International Color Presets

The card includes color presets for different regions:

| Preset | Description | Minor Color Difference |
|--------|-------------|------------------------|
| `australian` | Australian Warning System (default) | Blue (#3366cc) |
| `us_nws` | US National Weather Service style | Cyan (#00bfff) |
| `eu_meteo` | European Meteorological style | Green (#33cc33) |
| `high_contrast` | Accessibility-focused darker variants | Dark Blue (#003399) |

### Custom Colors

You can override any or all alert level colors:

```yaml
type: custom:abc-emergency-map-card
alert_color_preset: australian  # Optional: start with a preset
alert_colors:                    # Override specific levels
  extreme: "#ff0000"
  severe: "#ff8800"
  moderate: "#ffdd00"
  minor: "#0088ff"
```

### Visual Treatment

Each alert level has specific styling:

| Level | Fill | Border | Animation |
|-------|------|--------|-----------|
| Extreme | Semi-transparent | Solid color | Persistent pulse |
| Severe | Semi-transparent | Solid color | Pulse on new |
| Moderate | Semi-transparent | Solid color | None |
| Minor | Semi-transparent | Solid color | None |

For detailed information, see [Australian Warning System Reference](australian-warning-system.md) and [Configuration - Alert Colors](configuration.md#alert-colors).

---

## Animations

Visual feedback for incident changes and new incidents.

### Animation Types

#### Pulse Effect
New incidents pulse/glow to draw attention:
- 2-3 pulse cycles on appearance
- Configurable duration
- Color matches alert level

#### Update Flash
When incident data changes:
- Brief brightness increase
- Border highlight
- Smooth transition

#### Geometry Morphing
When polygon boundaries change:
- Smooth transition between shapes
- Configurable duration
- Maintains visual continuity

### Configuration

```yaml
type: custom:abc-emergency-map-card
animations_enabled: true      # Master switch
animation_duration: 2000      # Pulse duration (ms)
geometry_transitions: true    # Enable morphing
transition_duration: 500      # Morph duration (ms)
```

### Reduced Motion

The card respects user preferences:

1. **CSS `prefers-reduced-motion`** - Automatically detected
2. **Manual disable** - Set `animations_enabled: false`

```yaml
# For users preferring reduced motion
type: custom:abc-emergency-map-card
animations_enabled: false
geometry_transitions: false
```

---

## Entity Markers

Display Home Assistant entities as markers on the map.

### Supported Entity Types

| Domain | Icon | Color | Description |
|--------|------|-------|-------------|
| `person` | Person icon | Blue | Track people |
| `device_tracker` | Phone icon | Green | Track devices |
| `geo_location` | Map marker | Orange | Location events |

### Marker Features

- **Entity picture** - Shows entity picture when available
- **Fallback icon** - Uses domain-specific icon otherwise
- **Hover tooltip** - Shows entity name and state
- **Click popup** - Shows detailed information

### Configuration

```yaml
type: custom:abc-emergency-map-card
entities:
  - person.john
  - person.jane
  - device_tracker.phone
  - device_tracker.tablet
```

### Entity State Display

Markers show current state:
- **Home** - Standard display
- **Away/Not Home** - Slightly faded
- **Travelling** - Motion indicator (if available)

---

## Zone Rendering

Display Home Assistant zones on the map.

### How It Works

1. Reads all `zone.*` entities
2. Renders each as a circle based on radius
3. Applies configurable styling
4. Shows zone name on hover

### Zone Types

| Type | Border Style | Behavior |
|------|--------------|----------|
| Regular zone | Solid | Triggers automations |
| Passive zone | Dashed | Visual only |

### Configuration

```yaml
type: custom:abc-emergency-map-card
show_zones: true
zone_color: "#4285f4"      # Fill color
zone_opacity: 0.2          # Fill opacity (0-1)
zone_border_opacity: 0.5   # Border opacity (0-1)
```

### Zone Labels

- Zone name appears on hover
- Zone icon displayed in center (if configured in HA)
- Home zone (`zone.home`) shows house icon

---

## History Trails

Display entity movement history as trails on the map.

### How It Works

1. Queries Home Assistant history API
2. Extracts location data points
3. Renders as polyline trail
4. Older points fade or change color

### Configuration

```yaml
type: custom:abc-emergency-map-card
show_history: true
hours_to_show: 24           # History window
history_entities:           # Optional: specific entities
  - person.john
history_line_weight: 3      # Trail thickness (pixels)
```

### Trail Styling

- Color matches entity marker color
- Opacity fades for older points
- Smooth line through location points

### Performance

- History is fetched on card load
- Debounced updates prevent API spam
- Large history windows may impact performance

---

## Badge Notifications

Visual indicator showing incident count and severity.

### Badge Content

| Element | Description |
|---------|-------------|
| Count | Total number of incidents |
| "New" indicator | Count of recently added incidents |
| Severity color | Matches highest severity incident |

### Configuration

```yaml
type: custom:abc-emergency-map-card
show_badge: true
show_new_indicator: true
badge_position: top-right   # top-left, top-right, bottom-left, bottom-right
```

### Badge States

| State | Appearance |
|-------|------------|
| No incidents | Hidden or "0" |
| New incidents | Badge + "new" text |
| Updated incidents | Brief pulse |
| All old incidents | Static badge |

### "New" Definition

An incident is considered "new" if added within the last 5 minutes.

---

## Auto-fit Bounds

Automatically adjust map viewport to show all content.

### How It Works

1. Calculates bounding box of all visible elements
2. Adjusts map view to fit bounds
3. Applies configured padding
4. Respects maximum zoom limit

### Configuration

```yaml
type: custom:abc-emergency-map-card
auto_fit: true
fit_padding: 50             # Pixels of padding (or [vertical, horizontal])
fit_max_zoom: 17            # Don't zoom closer than this
```

### Manual Reset

- **Keyboard:** Press `Home` key when map is focused
- **UI:** Zoom controls (if visible)

### Single Entity Behavior

When only one entity/incident:
- Centers on that element
- Uses `default_zoom` instead of fitting

---

## Theme Support

Automatic theme detection and dark mode tiles.

### Theme Modes

| Mode | Behavior |
|------|----------|
| `auto` | Follows Home Assistant theme (default) |
| `light` | Always light tiles and UI |
| `dark` | Always dark tiles and UI |

### Configuration

```yaml
type: custom:abc-emergency-map-card
dark_mode: auto
tile_provider: cartodb      # Has dark variant
```

### Provider Dark Mode Support

| Provider | Dark Mode |
|----------|-----------|
| OSM | No (light only) |
| CartoDB | Yes |
| Mapbox | Yes |
| Custom | Depends on your tiles |

### UI Theme Integration

The card integrates with HA themes:
- Card background matches theme
- Text colors adapt to theme
- Popup styling follows theme

---

## Accessibility

WCAG 2.1 AA compliant features.

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Arrow keys | Pan the map |
| `+` / `-` | Zoom in/out |
| `Home` | Reset view |
| `Tab` | Navigate between elements |
| `Enter` / `Space` | Activate focused element |

### Screen Reader Support

- **ARIA labels** on all interactive elements
- **Live regions** announce updates
- **Focus management** for popups
- **Semantic HTML** structure

### Visual Accessibility

- **Color contrast** meets WCAG AA
- **Non-color indicators** (patterns, icons)
- **Reduced motion** support
- **Focus indicators** visible

### Configuration

```yaml
# Optimized for accessibility
type: custom:abc-emergency-map-card
animations_enabled: false    # Reduce motion
```

---

## Visual Editor

Configure the card without writing YAML.

### Accessing the Editor

1. Edit your dashboard
2. Click on the card
3. Click the "Edit" button (pencil icon)

### Editor Sections

| Section | Options |
|---------|---------|
| General | Title, entities, zoom |
| Map | Tile provider, dark mode |
| Display | Zones, history, badge |
| Styling | Colors, opacities |
| Animations | Enable/disable, durations |

### Editor Features

- **Live preview** - Changes update immediately
- **Validation** - Invalid values highlighted
- **Help text** - Descriptions for each option
- **Reset** - Restore defaults

---

## See Also

- [Configuration Reference](configuration.md) - All configuration options
- [Australian Warning System](australian-warning-system.md) - Alert level details
- [Troubleshooting](troubleshooting.md) - Common issues
- [Examples](examples/) - Configuration examples
