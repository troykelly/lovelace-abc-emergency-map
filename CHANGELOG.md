# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1] - 2026-01-10

### Changed

- **Home Assistant Local Asset Support** - Improved Cast compatibility by preferring HA's local Leaflet assets
  - CSS now loaded from `/static/images/leaflet/leaflet.css` first (no external dependencies)
  - Marker images use HA's local path `/static/images/leaflet/images/`
  - Falls back to CDN (unpkg.com then jsdelivr.net) if local assets unavailable
- **Existing Leaflet Detection** - Checks for `window.L` before loading from CDN
  - Avoids duplicate Leaflet loads if another card has already loaded it
  - Reduces resource usage and potential conflicts
- Enhanced logging to indicate which asset sources are being used

## [1.2.0] - 2026-01-10

### Added

- **Cast Compatibility Improvements** - Enhanced support for Google Cast devices (Chromecast, Nest Hub)
  - Cast environment detection with multiple detection methods
  - Fallback CDN support - automatically tries jsdelivr.net if unpkg.com fails
  - Cast-specific error messages with helpful guidance
  - SRI disabled in Cast environments to avoid compatibility issues
- **New Cast Compatibility Module** (`src/cast-compat.ts`)
  - Error classification (CORS, network, LitElement issues)
  - User-friendly error messages for each error type
  - URL safety checking for CDN resources
- **Unit Tests** - 14 new tests for Cast compatibility (87 total tests)

### Changed

- Improved error handling with Cast-aware messaging
- Loading indicator now shows "(Cast mode)" when running on Cast devices
- Enhanced console logging for debugging Cast issues

### Fixed

- Better resilience when loading Leaflet from CDN on restricted environments

## [1.1.0] - 2026-01-10

### Added

- **Marker Visibility Controls** - New configuration options for controlling entity marker display
  - `hide_markers_for_polygons` - Hide markers for entities that have polygon boundaries (default: `true`)
  - `marker_polygon_threshold` - Size threshold in meters; polygons larger than this still show markers
  - `marker_min_zoom` / `marker_max_zoom` - Control marker visibility based on zoom level
- **Screen Reader Announcements** - Announces marker count changes for accessibility
- **Semantic Popup HTML** - Improved popup structure for screen readers with proper headings and landmarks
- **Unit Testing Framework** - Added Vitest with 73 comprehensive tests covering:
  - Configuration validation
  - Geometry utilities
  - Polygon detection
  - Extent caching
- **Performance Optimization** - Polygon extent calculations are now cached with hash-based invalidation

### Changed

- Improved geometry type detection for better Point vs Polygon handling
- Enhanced documentation with marker visibility configuration guide

### Fixed

- Point geometry now correctly renders as markers instead of bare GeoJSON points

## [1.0.0] - 2025-12-30

### Added

- Initial release
- Interactive Leaflet.js map for Home Assistant
- Polygon rendering for emergency incident boundaries
- Australian Warning System color scheme
- Entity tracking (person, device_tracker, geo_location)
- Zone display
- History trails
- Dark/light theme support
- Visual card editor
- WCAG 2.1 AA accessibility compliance
- Keyboard navigation
- Responsive design

[1.2.1]: https://github.com/troykelly/lovelace-abc-emergency-map/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/troykelly/lovelace-abc-emergency-map/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/troykelly/lovelace-abc-emergency-map/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/troykelly/lovelace-abc-emergency-map/releases/tag/v1.0.0
