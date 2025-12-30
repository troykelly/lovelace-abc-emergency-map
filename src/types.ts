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

export interface ABCEmergencyMapCardConfig extends LovelaceCardConfig {
  type: "custom:abc-emergency-map-card";
  title?: string;
  entity?: string;
  entities?: string[];
  default_zoom?: number;
  hours_to_show?: number;
  dark_mode?: boolean;
  show_warning_levels?: boolean;
  /** Tile provider identifier or 'custom' for custom URL */
  tile_provider?: TileProviderId;
  /** Custom tile URL template (required when tile_provider is 'custom') */
  tile_url?: string;
  /** Custom tile attribution (for custom provider) */
  tile_attribution?: string;
  /** API key for providers that require authentication (e.g., Mapbox) */
  api_key?: string;
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
  // GeoJSON polygon data will be in extra_state_attributes
}

export type AlertLevelColors = {
  [key: string]: string;
};

export const ALERT_COLORS: AlertLevelColors = {
  extreme: "#cc0000", // Emergency Warning - Red
  severe: "#ff6600", // Watch and Act - Orange
  moderate: "#ffcc00", // Advice - Yellow
  minor: "#3366cc", // Information - Blue
};
