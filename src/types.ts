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

export interface ABCEmergencyMapCardConfig extends LovelaceCardConfig {
  type: "custom:abc-emergency-map-card";
  title?: string;
  entity?: string;
  entities?: string[];
  default_zoom?: number;
  hours_to_show?: number;
  dark_mode?: DarkModeSetting;
  show_warning_levels?: boolean;
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

export type AlertLevelColors = {
  [key: string]: string;
};

export const ALERT_COLORS: AlertLevelColors = {
  extreme: "#cc0000", // Emergency Warning - Red
  severe: "#ff6600", // Watch and Act - Orange
  moderate: "#ffcc00", // Advice - Yellow
  minor: "#3366cc", // Information - Blue
};

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
