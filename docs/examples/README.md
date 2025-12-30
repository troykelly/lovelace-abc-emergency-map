# Configuration Examples

Copy-paste examples for common use cases.

---

## Available Examples

| File | Description |
|------|-------------|
| [minimal.yaml](minimal.yaml) | Simplest possible configuration |
| [full-featured.yaml](full-featured.yaml) | All options with comments |
| [family-tracking.yaml](family-tracking.yaml) | Track family members with history |
| [custom-tiles.yaml](custom-tiles.yaml) | Using Mapbox tiles |
| [zone-focused.yaml](zone-focused.yaml) | Emphasize zone boundaries |
| [filtered-incidents.yaml](filtered-incidents.yaml) | Show specific incident types |
| [dashboard-panel.yaml](dashboard-panel.yaml) | Full dashboard panel view |

---

## Quick Reference

### Minimal

```yaml
type: custom:abc-emergency-map-card
title: Emergency Map
```

### With Entity Tracking

```yaml
type: custom:abc-emergency-map-card
title: Family Map
entities:
  - person.john
  - person.jane
```

### Filtered by Incident Type

```yaml
type: custom:abc-emergency-map-card
title: Bushfires Only
geo_location_sources:
  - sensor.abc_emergency_auremer_bushfires
```

### With History Trails

```yaml
type: custom:abc-emergency-map-card
title: Movement History
entities:
  - person.john
show_history: true
hours_to_show: 24
```

---

## Using These Examples

1. Copy the YAML configuration
2. Edit your Home Assistant dashboard
3. Add a new card > Manual
4. Paste the configuration
5. Adjust entity names to match your setup

---

## See Also

- [Configuration Reference](../configuration.md)
- [Features Documentation](../features.md)
- [Getting Started](../getting-started.md)
