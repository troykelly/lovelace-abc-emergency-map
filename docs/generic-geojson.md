# Using Generic GeoJSON Sources

While this card is designed for the ABC Emergency Integration, it can display **any GeoJSON data** from Home Assistant `geo_location` entities.

---

## Overview

The ABC Emergency Map Card works with any `geo_location` entity that provides GeoJSON geometry data in its attributes. This allows you to use the card for:

- Weather radar polygons
- International emergency services
- Custom geographic boundaries
- IoT geofencing applications

---

## Entity Requirements

For the card to render a `geo_location` entity as a polygon, it must have these attributes:

### Required Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `latitude` | number | Center point latitude |
| `longitude` | number | Center point longitude |

### Polygon Attributes (one of)

| Attribute | Type | Description |
|-----------|------|-------------|
| `geojson` | object | GeoJSON Geometry object (preferred) |
| `geometry` | object | Alternative attribute name for GeoJSON |

### Optional Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `alert_level` | string | Severity: `extreme`, `severe`, `moderate`, `minor` |
| `friendly_name` | string | Display name for popups |
| `headline` | string | Incident headline |
| `event_type` | string | Type of event (fire, flood, etc.) |

---

## Supported GeoJSON Types

The card supports these GeoJSON geometry types:

| Type | Description |
|------|-------------|
| `Point` | Single coordinate (renders as marker) |
| `Polygon` | Single polygon with optional holes |
| `MultiPolygon` | Multiple polygons (complex boundaries) |

### Example GeoJSON Polygon

```json
{
  "type": "Polygon",
  "coordinates": [
    [
      [151.2093, -33.8688],
      [151.2100, -33.8700],
      [151.2080, -33.8710],
      [151.2070, -33.8695],
      [151.2093, -33.8688]
    ]
  ]
}
```

> **Note:** GeoJSON uses `[longitude, latitude]` order, not `[latitude, longitude]`.

---

## Configuration

### Using Explicit Entities

Add `geo_location` entities directly:

```yaml
type: custom:abc-emergency-map-card
title: Custom Polygons
entities:
  - geo_location.my_custom_polygon
  - geo_location.weather_radar_cell
```

### Using Dynamic Discovery

If you have a sensor that tracks multiple entities:

```yaml
type: custom:abc-emergency-map-card
title: Custom Source
geo_location_sources:
  - sensor.my_custom_geojson_feed
```

The sensor must expose an `entity_ids` attribute containing a list of `geo_location` entity IDs.

---

## Example Use Cases

### Weather Radar Polygons

Display storm cells or precipitation areas:

```yaml
type: custom:abc-emergency-map-card
title: Weather Radar
geo_location_sources:
  - sensor.weather_radar_storms
```

Entity attributes:
```yaml
geo_location.storm_cell_001:
  latitude: -33.8688
  longitude: 151.2093
  geojson:
    type: Polygon
    coordinates: [[[151.2, -33.8], ...]]
  alert_level: severe
  friendly_name: "Storm Cell - Sydney CBD"
  event_type: storm
```

### Property Boundaries

Display custom zones or property boundaries:

```yaml
type: custom:abc-emergency-map-card
title: Property Map
entities:
  - geo_location.farm_boundary
  - geo_location.paddock_north
  - geo_location.paddock_south
show_warning_levels: true
```

### International Emergency Services

Use with emergency services from other countries:

```yaml
type: custom:abc-emergency-map-card
title: Cal Fire Incidents
geo_location_sources:
  - sensor.calfire_active_incidents
```

---

## Creating Custom Integrations

To create a Home Assistant integration that works with this card:

### 1. Create a `geo_location` Platform

```python
from homeassistant.components.geo_location import GeolocationEvent

class CustomGeoEvent(GeolocationEvent):
    """Custom geo_location entity with polygon support."""

    def __init__(self, data):
        self._attr_latitude = data["latitude"]
        self._attr_longitude = data["longitude"]
        self._attr_name = data["name"]
        self._geometry = data.get("geometry")
        self._alert_level = data.get("alert_level", "minor")

    @property
    def extra_state_attributes(self):
        """Return entity attributes including GeoJSON."""
        attrs = {}
        if self._geometry:
            attrs["geojson"] = self._geometry
        attrs["alert_level"] = self._alert_level
        return attrs
```

### 2. Expose Entity Lists via Sensor

Create a sensor that tracks entity IDs:

```python
class CustomGeoSensor(SensorEntity):
    """Sensor that exposes geo_location entity IDs."""

    @property
    def extra_state_attributes(self):
        """Return list of geo_location entity IDs."""
        return {
            "entity_ids": [
                "geo_location.custom_event_001",
                "geo_location.custom_event_002",
            ]
        }
```

---

## Alert Level Mapping

If your data source uses different severity levels, map them to the supported values:

| Your Level | Map To | Color |
|------------|--------|-------|
| Critical, Emergency, Extreme | `extreme` | Red |
| High, Warning, Severe | `severe` | Orange |
| Medium, Advisory, Moderate | `moderate` | Yellow |
| Low, Information, Minor | `minor` | Blue |

Example in your integration:

```python
SEVERITY_MAP = {
    "critical": "extreme",
    "warning": "severe",
    "advisory": "moderate",
    "information": "minor",
}

alert_level = SEVERITY_MAP.get(raw_level, "minor")
```

---

## Current Limitations

### Hardcoded Colors

Alert level colors are currently hardcoded to the Australian Warning System:

| Level | Color |
|-------|-------|
| `extreme` | Red (#cc0000) |
| `severe` | Orange (#ff6600) |
| `moderate` | Yellow (#ffcc00) |
| `minor` | Blue (#3366cc) |

> **Coming Soon:** Customizable color schemes are planned in [Epic #44](https://github.com/troykelly/lovelace-abc-emergency-map/issues/44).

### Alert Level Values

Only these four alert level values are supported:
- `extreme`
- `severe`
- `moderate`
- `minor`

Any other value will default to `minor` (blue).

---

## Troubleshooting

### Polygon Not Appearing

1. **Check entity attributes** in Developer Tools > States
2. **Verify GeoJSON format** - coordinates must be `[longitude, latitude]`
3. **Check coordinate order** - first and last coordinate must match (closed polygon)
4. **Verify entity ID format** - must be `geo_location.*`

### Wrong Colors

1. **Check `alert_level` attribute** - must be one of the four supported values
2. **Verify attribute name** - should be `alert_level` not `severity`

### Entity Not Discovered

1. **Check sensor `entity_ids` attribute** - must be a list
2. **Verify entity IDs exist** - check in Developer Tools > States
3. **Check for typos** in entity ID strings

---

## See Also

- [Configuration Reference](configuration.md) - All configuration options
- [Features](features.md) - Feature documentation
- [ABC Emergency Integration](https://github.com/troykelly/homeassistant-abcemergency) - Reference implementation
