/**
 * Type definitions for ABC Emergency Map Card
 */

import type { HomeAssistant, LovelaceCardConfig } from "custom-card-helpers";

export interface ABCEmergencyMapCardConfig extends LovelaceCardConfig {
  type: "custom:abc-emergency-map-card";
  title?: string;
  entity?: string;
  entities?: string[];
  default_zoom?: number;
  hours_to_show?: number;
  dark_mode?: boolean;
  show_warning_levels?: boolean;
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
