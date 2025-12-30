# ABC Emergency Map Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)

A custom Lovelace card for Home Assistant that displays Australian emergency incidents on an interactive map with polygon boundaries.

## Features

- Renders emergency incident boundaries as polygons (not just points)
- Color-coded by Australian Warning System levels:
  - **Emergency Warning** (Red) - Highest level, immediate danger
  - **Watch and Act** (Orange) - Heightened threat, take action
  - **Advice** (Yellow) - Incident active, stay informed
  - **Information** (Blue) - General information
- Click polygons to view incident details
- Integrates with [ABC Emergency Integration](https://github.com/troykelly/homeassistant-abcemergency)

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to Frontend > Custom repositories
3. Add `https://github.com/troykelly/lovelace-abc-emergency-map` as a Lovelace plugin
4. Install "ABC Emergency Map Card"
5. Add the resource in your Lovelace configuration

### Manual Installation

1. Download `abc-emergency-map-card.js` from the latest release
2. Copy to `config/www/community/abc-emergency-map-card/`
3. Add the resource to your Lovelace configuration:

```yaml
resources:
  - url: /local/community/abc-emergency-map-card/abc-emergency-map-card.js
    type: module
```

## Configuration

```yaml
type: custom:abc-emergency-map-card
title: Emergency Map
entities:
  - geo_location.abc_emergency
default_zoom: 10
hours_to_show: 24
show_warning_levels: true
```

## Requirements

- Home Assistant 2024.1+
- [ABC Emergency Integration](https://github.com/troykelly/homeassistant-abcemergency)

## Development

See [CONTEXT.md](CONTEXT.md) for development setup instructions.

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
