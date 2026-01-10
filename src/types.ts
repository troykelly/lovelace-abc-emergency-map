/**
 * Type definitions for ABC Emergency Map Card
 */

import type { LovelaceCardConfig } from "custom-card-helpers";

/**
 * Supported tile provider identifiers.
 * - osm: OpenStreetMap (default, no API key required)
 * - cartodb: CartoDB/Carto tiles (light/dark variants available)
 * - mapbox: Mapbox tiles (requires API key)
 * - custom: User-provided tile URL template
 */
export type TileProviderId = "osm" | "cartodb" | "mapbox" | "custom";

/**
 * Configuration for a tile provider.
 */
export interface TileProviderConfig {
  /** URL template with {s}, {z}, {x}, {y} placeholders */
  url: string;
  /** Attribution HTML string */
  attribution: string;
  /** Maximum zoom level supported */
  maxZoom: number;
  /** Subdomains for load balancing (e.g., ['a', 'b', 'c']) */
  subdomains?: string | string[];
  /** Optional API key placeholder in URL */
  accessToken?: string;
}

/**
 * A tile provider preset with optional dark mode variant.
 */
export interface TileProviderPreset {
  /** Light mode tile configuration */
  light: TileProviderConfig;
  /** Dark mode tile configuration (falls back to light if not provided) */
  dark?: TileProviderConfig;
  /** Whether this provider requires an API key */
  requiresApiKey: boolean;
  /** Human-readable name for the provider */
  name: string;
}

/**
 * Dark mode setting options.
 * - "auto": Follows Home Assistant theme setting
 * - "light": Always use light mode tiles and UI
 * - "dark": Always use dark mode tiles and UI
 * - boolean: Legacy support (true = dark, false = light)
 */
export type DarkModeSetting = "auto" | "light" | "dark" | boolean;

/** Default dark mode setting */
export const DEFAULT_DARK_MODE: DarkModeSetting = "auto";

/**
 * Card configuration for ABC Emergency Map.
 *
 * ## Visibility Configuration Hierarchy
 *
 * The following options control incident visibility. They are applied in priority order:
 *
 * 1. **show_warning_levels** (boolean) - Master toggle for polygon rendering
 *    - When `false`: No polygons rendered, all incidents show as markers only
 *    - When `true` (default): Polygon rendering enabled
 *
 * 2. **hide_markers_for_polygons** (boolean) - Controls marker visibility for polygon entities
 *    - When `true` (default): Incidents with polygons only show the polygon, no marker
 *    - When `false`: Both polygon and marker are displayed
 *    - Has no effect if show_warning_levels is false
 *
 * ## Common Pitfalls
 *
 * - Setting `show_warning_levels: false` with `hide_markers_for_polygons: true` is redundant
 *   since polygons won't render anyway (a validation warning is shown)
 */
export interface ABCEmergencyMapCardConfig extends LovelaceCardConfig {
  type: "custom:abc-emergency-map-card";
  title?: string;
  entity?: string;
  entities?: string[];
  default_zoom?: number;
  hours_to_show?: number;
  dark_mode?: DarkModeSetting;
  /**
   * Master toggle for polygon/warning level rendering.
   * When false, all incidents render as markers only.
   * @default true
   */
  show_warning_levels?: boolean;
  /**
   * Whether to hide point markers for incidents that have polygon boundaries.
   * When true (default), incidents with polygon data only show the polygon.
   * When false, both the polygon and a point marker are displayed.
   * Point-only geometry always renders as a marker regardless of this setting.
   *
   * Note: Has no effect when show_warning_levels is false.
   * @default true
   */
  hide_markers_for_polygons?: boolean;
  /**
   * Minimum zoom level at which markers are visible.
   * Markers are hidden when zoom level is below this value.
   * When undefined, markers are always visible (subject to other visibility settings).
   * Valid range: 1-20
   * @example marker_min_zoom: 12 // Show markers only when zoomed in close
   */
  marker_min_zoom?: number;
  /** Tile provider identifier or 'custom' for custom URL */
  tile_provider?: TileProviderId;
  /** Custom tile URL template (required when tile_provider is 'custom') */
  tile_url?: string;
  /** Custom tile attribution (for custom provider) */
  tile_attribution?: string;
  /** API key for providers that require authentication (e.g., Mapbox) */
  api_key?: string;
  /** Whether to show Home Assistant zones on the map (default: true) */
  show_zones?: boolean;
  /** Default zone fill color (default: #4285f4) */
  zone_color?: string;
  /** Zone fill opacity 0-1 (default: 0.2) */
  zone_opacity?: number;
  /** Zone border opacity 0-1 (default: 0.5) */
  zone_border_opacity?: number;
  /** Whether to auto-fit bounds to show all entities/zones on load (default: true) */
  auto_fit?: boolean;
  /** Padding for fit bounds in pixels [vertical, horizontal] or single value (default: 50) */
  fit_padding?: number | [number, number];
  /** Maximum zoom level when auto-fitting bounds (default: 17) */
  fit_max_zoom?: number;
  /** Whether to show history trails for entities (default: false) */
  show_history?: boolean;
  /** Specific entities to show history for (defaults to all configured entities) */
  history_entities?: string[];
  /** Trail line weight in pixels (default: 3) */
  history_line_weight?: number;
  /** Whether to enable incident animations (default: true) */
  animations_enabled?: boolean;
  /** Duration of pulse animation in milliseconds (default: 2000) */
  animation_duration?: number;
  /** Whether to enable smooth geometry transitions (default: true) */
  geometry_transitions?: boolean;
  /** Duration of geometry transition in milliseconds (default: 500) */
  transition_duration?: number;
  /** Whether to show incident count badge (default: true) */
  show_badge?: boolean;
  /** Whether to show new incident indicators (default: true) */
  show_new_indicator?: boolean;
  /** Badge position (default: "top-right") */
  badge_position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  /**
   * Dynamic geo_location entity sources.
   * Configure sensor or binary_sensor entities that expose `entity_ids` or
   * `containing_entity_ids` attributes listing geo_location entity IDs.
   * These entities will be dynamically discovered and rendered on the map.
   *
   * Example sources:
   * - sensor.abc_emergency_*_incidents_total (all incidents)
   * - sensor.abc_emergency_*_bushfires (bushfire incidents)
   * - sensor.abc_emergency_*_watch_and_acts (watch and act level incidents)
   * - binary_sensor.abc_emergency_*_inside_polygon (incidents containing location)
   */
  geo_location_sources?: string[];
  /**
   * Color preset for alert levels.
   * Built-in options: "australian" (default), "us_nws", "eu_meteo", "high_contrast"
   */
  alert_color_preset?: AlertColorPreset;
  /**
   * Custom alert level colors. Overrides preset colors for specified levels.
   * Partial configuration is allowed - unspecified levels use preset/default colors.
   *
   * Example:
   * ```yaml
   * alert_colors:
   *   extreme: "#ff0000"
   *   severe: "#ff8800"
   * ```
   */
  alert_colors?: AlertColorsConfig;
}

export interface EmergencyIncident {
  id: string;
  headline: string;
  latitude: number;
  longitude: number;
  alert_level: "extreme" | "severe" | "moderate" | "minor";
  alert_text: string;
  event_type: string;
  has_polygon: boolean;
  geometry_type?: string;
  /** Last updated timestamp from entity */
  last_updated?: string;
  /** External URL for more information */
  external_link?: string;
}

/**
 * Supported entity domains for map markers.
 */
export type MarkerEntityDomain = "device_tracker" | "person" | "geo_location";

/**
 * Entity data extracted for marker display.
 */
export interface EntityMarkerData {
  /** Entity ID (e.g., "person.john") */
  entityId: string;
  /** Entity domain */
  domain: MarkerEntityDomain;
  /** Display name */
  name: string;
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
  /** Entity picture URL (if available) */
  picture?: string;
  /** Entity state (e.g., "home", "not_home", "travelling") */
  state: string;
  /** GPS accuracy in meters (if available) */
  gpsAccuracy?: number;
  /** Battery level percentage (if available) */
  battery?: number;
  /** Last updated timestamp */
  lastUpdated?: string;
}

/**
 * Default icons for each entity domain.
 */
export const DOMAIN_ICONS: Record<MarkerEntityDomain, string> = {
  device_tracker: "mdi:cellphone",
  person: "mdi:account",
  geo_location: "mdi:map-marker",
};

/**
 * Marker colors by entity domain.
 */
export const DOMAIN_COLORS: Record<MarkerEntityDomain, string> = {
  device_tracker: "#4CAF50", // Green
  person: "#2196F3", // Blue
  geo_location: "#FF9800", // Orange
};

/**
 * Valid alert level names.
 */
export type AlertLevel = "extreme" | "severe" | "moderate" | "minor";

/**
 * Map of alert levels to color strings.
 */
export type AlertLevelColors = {
  [K in AlertLevel]: string;
};

/**
 * Partial alert colors for user configuration (allows overriding individual levels).
 */
export type AlertColorsConfig = Partial<AlertLevelColors>;

/**
 * Available color preset identifiers.
 * - australian: Default Australian Warning System (red/orange/yellow/blue)
 * - us_nws: US National Weather Service style (red/orange/yellow/cyan)
 * - eu_meteo: European Meteorological style (red/orange/yellow/green)
 * - high_contrast: Accessibility-focused darker variants
 */
export type AlertColorPreset = "australian" | "us_nws" | "eu_meteo" | "high_contrast";

/**
 * Default alert colors (Australian Warning System).
 */
export const ALERT_COLORS: AlertLevelColors = {
  extreme: "#cc0000", // Emergency Warning - Red
  severe: "#ff6600", // Watch and Act - Orange
  moderate: "#ffcc00", // Advice - Yellow
  minor: "#3366cc", // Information - Blue
};

/**
 * Built-in color presets for different regions/use cases.
 */
export const ALERT_COLOR_PRESETS: Record<AlertColorPreset, AlertLevelColors> = {
  /** Australian Warning System (default) */
  australian: {
    extreme: "#cc0000", // Emergency Warning - Red
    severe: "#ff6600", // Watch and Act - Orange
    moderate: "#ffcc00", // Advice - Yellow
    minor: "#3366cc", // Information - Blue
  },
  /** US National Weather Service inspired */
  us_nws: {
    extreme: "#cc0000", // Warning - Red
    severe: "#ff6600", // Watch - Orange
    moderate: "#ffcc00", // Advisory - Yellow
    minor: "#00bfff", // Statement - Cyan
  },
  /** European Meteorological services inspired */
  eu_meteo: {
    extreme: "#cc0000", // Red alert
    severe: "#ff6600", // Orange alert
    moderate: "#ffcc00", // Yellow alert
    minor: "#33cc33", // Green alert
  },
  /** High contrast for accessibility */
  high_contrast: {
    extreme: "#990000", // Darker red
    severe: "#cc5500", // Darker orange
    moderate: "#ccaa00", // Darker yellow
    minor: "#003399", // Darker blue
  },
};

/** Default alert color preset */
export const DEFAULT_ALERT_COLOR_PRESET: AlertColorPreset = "australian";

/**
 * Resolves the color for a given alert level based on configuration.
 * Priority: config.alert_colors[level] → preset colors → default colors
 *
 * @param level - The alert level to get color for
 * @param config - Card configuration (optional)
 * @returns The resolved color string
 */
export function getAlertColor(
  level: string,
  config?: { alert_colors?: AlertColorsConfig; alert_color_preset?: AlertColorPreset }
): string {
  // Normalize level to valid AlertLevel
  const normalizedLevel = (["extreme", "severe", "moderate", "minor"].includes(level)
    ? level
    : "minor") as AlertLevel;

  // Check for custom color override first
  if (config?.alert_colors?.[normalizedLevel]) {
    return config.alert_colors[normalizedLevel]!;
  }

  // Check for preset
  if (config?.alert_color_preset && ALERT_COLOR_PRESETS[config.alert_color_preset]) {
    return ALERT_COLOR_PRESETS[config.alert_color_preset][normalizedLevel];
  }

  // Fall back to default (Australian) colors
  return ALERT_COLORS[normalizedLevel];
}

/**
 * Zone data extracted from Home Assistant zone entities.
 */
export interface ZoneData {
  /** Entity ID (e.g., "zone.home") */
  entityId: string;
  /** Zone display name */
  name: string;
  /** Center latitude */
  latitude: number;
  /** Center longitude */
  longitude: number;
  /** Zone radius in meters */
  radius: number;
  /** Whether this is a passive zone (doesn't trigger automations) */
  passive: boolean;
  /** Zone icon (e.g., "mdi:home") */
  icon?: string;
}

/** Default zone color (Google Blue) */
export const DEFAULT_ZONE_COLOR = "#4285f4";

/** Default zone fill opacity */
export const DEFAULT_ZONE_OPACITY = 0.2;

/** Default zone border opacity */
export const DEFAULT_ZONE_BORDER_OPACITY = 0.5;

/** Default auto-fit enabled */
export const DEFAULT_AUTO_FIT = true;

/** Default fit bounds padding in pixels */
export const DEFAULT_FIT_PADDING = 50;

/** Default maximum zoom level when auto-fitting */
export const DEFAULT_FIT_MAX_ZOOM = 17;

/** Default show history setting */
export const DEFAULT_SHOW_HISTORY = false;

/** Default history line weight in pixels */
export const DEFAULT_HISTORY_LINE_WEIGHT = 3;

/** Default hours to show for history trails */
export const DEFAULT_HOURS_TO_SHOW = 24;

/** Default animations enabled setting */
export const DEFAULT_ANIMATIONS_ENABLED = true;

/** Default animation duration in milliseconds */
export const DEFAULT_ANIMATION_DURATION = 2000;

/** Default geometry transitions enabled */
export const DEFAULT_GEOMETRY_TRANSITIONS = true;

/** Default geometry transition duration in milliseconds */
export const DEFAULT_TRANSITION_DURATION = 500;

/** Default show badge setting */
export const DEFAULT_SHOW_BADGE = true;

/** Default show new indicator setting */
export const DEFAULT_SHOW_NEW_INDICATOR = true;

/** Default hide markers for polygons setting */
export const DEFAULT_HIDE_MARKERS_FOR_POLYGONS = true;

/** Default badge position */
export const DEFAULT_BADGE_POSITION = "top-right";

/** Duration in ms for an incident to be considered "new" */
export const NEW_INCIDENT_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

/**
 * A single history point with timestamp and coordinates.
 */
export interface HistoryPoint {
  /** Timestamp of the history point */
  timestamp: Date;
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
}

/**
 * Entity history data for trail rendering.
 */
export interface EntityHistoryData {
  /** Entity ID */
  entityId: string;
  /** Entity color for the trail */
  color: string;
  /** Array of history points in chronological order */
  points: HistoryPoint[];
}

/**
 * Severity levels for configuration warnings.
 */
export type ConfigWarningSeverity = "warning" | "info";

/**
 * A configuration validation warning.
 */
export interface ConfigWarning {
  /** Unique identifier for this warning type */
  id: string;
  /** Severity level of the warning */
  severity: ConfigWarningSeverity;
  /** Warning message describing the issue */
  message: string;
  /** Suggestion for how to fix the issue */
  suggestion?: string;
}

/**
 * Validates visibility configuration options and returns any warnings.
 * This helps users understand when their configuration may cause unexpected behavior.
 *
 * @param config - The card configuration to validate
 * @returns Array of configuration warnings (empty if no issues found)
 */
export function validateVisibilityConfig(
  config: Partial<ABCEmergencyMapCardConfig>
): ConfigWarning[] {
  const warnings: ConfigWarning[] = [];

  // Check: hide_markers_for_polygons has no effect when show_warning_levels is false
  if (
    config.show_warning_levels === false &&
    config.hide_markers_for_polygons === true
  ) {
    warnings.push({
      id: "hide-markers-no-effect",
      severity: "warning",
      message:
        "'hide_markers_for_polygons' has no effect when 'show_warning_levels' is false.",
      suggestion:
        "Polygon entities will render as markers only. Remove 'hide_markers_for_polygons' or set 'show_warning_levels: true'.",
    });
  }

  return warnings;
}
