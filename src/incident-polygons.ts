/**
 * Incident Polygon Manager
 *
 * Renders ABC Emergency incident polygons from GeoJSON data
 * with Australian Warning System colors.
 */

import type { HomeAssistant } from "custom-card-helpers";
import type { HassEntity } from "home-assistant-js-websocket";
import type {
  Map as LeafletMap,
  GeoJSON as LeafletGeoJSON,
  Layer,
  PathOptions,
  LatLngBounds,
} from "leaflet";
import type { ABCEmergencyMapCardConfig, EmergencyIncident } from "./types";
import {
  ALERT_COLORS,
  DEFAULT_ANIMATIONS_ENABLED,
  DEFAULT_ANIMATION_DURATION,
} from "./types";

/** Prefix for ABC Emergency geo_location entities */
const ABC_EMERGENCY_PREFIX = "geo_location.abc_emergency";

/** Default polygon fill opacity */
const DEFAULT_FILL_OPACITY = 0.35;

/** Default polygon stroke opacity */
const DEFAULT_STROKE_OPACITY = 0.8;

/** Default polygon stroke weight */
const DEFAULT_STROKE_WEIGHT = 2;

/**
 * GeoJSON geometry types we support
 */
type SupportedGeometryType = "Polygon" | "MultiPolygon" | "Point";

/**
 * GeoJSON geometry object
 */
interface GeoJSONGeometry {
  type: SupportedGeometryType;
  coordinates: number[] | number[][] | number[][][] | number[][][][];
}

/**
 * GeoJSON Feature object
 */
interface GeoJSONFeature {
  type: "Feature";
  geometry: GeoJSONGeometry;
  properties: Record<string, unknown>;
}

/**
 * Extracts incident data from a Home Assistant entity.
 */
function extractIncidentData(
  entityId: string,
  entity: HassEntity
): EmergencyIncident | null {
  const attrs = entity.attributes;

  // Get coordinates - required for map placement
  const lat = attrs.latitude;
  const lon = attrs.longitude;

  if (
    typeof lat !== "number" ||
    typeof lon !== "number" ||
    isNaN(lat) ||
    isNaN(lon)
  ) {
    return null;
  }

  // Determine alert level with fallback
  const alertLevel = (attrs.alert_level as string)?.toLowerCase() || "minor";
  const validLevels = ["extreme", "severe", "moderate", "minor"];
  const normalizedLevel = validLevels.includes(alertLevel)
    ? (alertLevel as EmergencyIncident["alert_level"])
    : "minor";

  return {
    id: entityId,
    headline: (attrs.friendly_name as string) || entityId,
    latitude: lat,
    longitude: lon,
    alert_level: normalizedLevel,
    alert_text: (attrs.alert_text as string) || "",
    event_type: (attrs.event_type as string) || "unknown",
    has_polygon: !!attrs.geojson || !!attrs.geometry,
    geometry_type: attrs.geometry_type as string | undefined,
    last_updated: entity.last_updated || entity.last_changed,
    external_link: (attrs.external_link as string) ||
      (attrs.link as string) ||
      (attrs.url as string) ||
      undefined,
  };
}

/**
 * Formats a timestamp as a relative time string (e.g., "2 mins ago").
 */
function formatRelativeTime(timestamp: string | undefined): string {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins === 1) return "1 min ago";
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

/**
 * Extracts GeoJSON geometry from entity attributes.
 * Handles both 'geojson' and 'geometry' attribute formats.
 */
function extractGeoJSON(entity: HassEntity): GeoJSONGeometry | null {
  const attrs = entity.attributes;

  // Try 'geojson' attribute first (preferred format)
  if (attrs.geojson) {
    const geojson = attrs.geojson as unknown;
    if (isValidGeometry(geojson)) {
      return geojson;
    }
  }

  // Try 'geometry' attribute as fallback
  if (attrs.geometry) {
    const geometry = attrs.geometry as unknown;
    if (isValidGeometry(geometry)) {
      return geometry;
    }
  }

  return null;
}

/**
 * Type guard to check if an object is a valid GeoJSON geometry.
 */
function isValidGeometry(obj: unknown): obj is GeoJSONGeometry {
  if (!obj || typeof obj !== "object") return false;

  const geo = obj as Record<string, unknown>;

  if (typeof geo.type !== "string") return false;
  if (!Array.isArray(geo.coordinates)) return false;

  const validTypes = ["Polygon", "MultiPolygon", "Point"];
  return validTypes.includes(geo.type);
}

/**
 * Gets the style for a polygon based on its alert level.
 */
function getPolygonStyle(alertLevel: string): PathOptions {
  const color = ALERT_COLORS[alertLevel] || ALERT_COLORS.minor;

  return {
    color: color,
    weight: DEFAULT_STROKE_WEIGHT,
    opacity: DEFAULT_STROKE_OPACITY,
    fillColor: color,
    fillOpacity: DEFAULT_FILL_OPACITY,
  };
}

/**
 * Creates a GeoJSON Feature from incident data and geometry.
 */
function createFeature(
  incident: EmergencyIncident,
  geometry: GeoJSONGeometry
): GeoJSONFeature {
  return {
    type: "Feature",
    geometry: geometry,
    properties: {
      id: incident.id,
      headline: incident.headline,
      alert_level: incident.alert_level,
      event_type: incident.event_type,
      alert_text: incident.alert_text,
    },
  };
}

/**
 * Gets all ABC Emergency entities from Home Assistant state.
 */
function getABCEmergencyEntities(hass: HomeAssistant): string[] {
  return Object.keys(hass.states).filter((entityId) =>
    entityId.startsWith(ABC_EMERGENCY_PREFIX)
  );
}

/**
 * Manages incident polygon rendering on a Leaflet map.
 */
export class IncidentPolygonManager {
  private _map: LeafletMap;
  private _config: ABCEmergencyMapCardConfig;
  private _layers: Map<string, LeafletGeoJSON> = new Map();
  private _incidents: Map<string, EmergencyIncident> = new Map();
  /** Track last known hash of each incident for change detection */
  private _incidentHashes: Map<string, string> = new Map();
  /** Track known entity IDs to detect new incidents */
  private _knownEntityIds: Set<string> = new Set();

  constructor(map: LeafletMap, config: ABCEmergencyMapCardConfig) {
    this._map = map;
    this._config = config;
  }

  /**
   * Creates a hash of incident data for change detection.
   */
  private _hashIncident(incident: EmergencyIncident): string {
    return `${incident.alert_level}|${incident.headline}|${incident.alert_text}|${incident.last_updated}`;
  }

  /**
   * Checks if animations are enabled.
   */
  private _animationsEnabled(): boolean {
    return this._config.animations_enabled ?? DEFAULT_ANIMATIONS_ENABLED;
  }

  /**
   * Gets the animation duration in seconds.
   */
  private _getAnimationDuration(): string {
    const ms = this._config.animation_duration ?? DEFAULT_ANIMATION_DURATION;
    return `${ms / 1000}s`;
  }

  /**
   * Updates the configuration.
   */
  public updateConfig(config: ABCEmergencyMapCardConfig): void {
    this._config = config;
  }

  /**
   * Updates incident polygons based on current entity states.
   */
  public updateIncidents(hass: HomeAssistant): void {
    // Respect show_warning_levels config - if false, hide all incident polygons
    if (this._config.show_warning_levels === false) {
      this.clear();
      return;
    }

    const entityIds = getABCEmergencyEntities(hass);
    const currentIds = new Set(entityIds);

    // Remove layers for entities that no longer exist
    for (const [entityId, layer] of this._layers) {
      if (!currentIds.has(entityId)) {
        layer.remove();
        this._layers.delete(entityId);
        this._incidents.delete(entityId);
      }
    }

    // Update or create layers for each entity
    for (const entityId of entityIds) {
      const entity = hass.states[entityId];
      if (!entity) continue;

      const incident = extractIncidentData(entityId, entity);
      if (!incident) continue;

      // Detect new vs updated incidents for animation
      const isNew = !this._knownEntityIds.has(entityId);
      const currentHash = this._hashIncident(incident);
      const previousHash = this._incidentHashes.get(entityId);
      const isUpdated = !isNew && previousHash !== currentHash;

      // Update tracking state
      this._incidents.set(entityId, incident);
      this._incidentHashes.set(entityId, currentHash);
      this._knownEntityIds.add(entityId);

      const geometry = extractGeoJSON(entity);
      if (geometry) {
        this._updatePolygonLayer(entityId, incident, geometry, isNew, isUpdated);
      } else {
        // Remove polygon layer if geometry was removed
        const existingLayer = this._layers.get(entityId);
        if (existingLayer) {
          existingLayer.remove();
          this._layers.delete(entityId);
        }
      }
    }
  }

  /**
   * Updates or creates a polygon layer for an incident.
   */
  private _updatePolygonLayer(
    entityId: string,
    incident: EmergencyIncident,
    geometry: GeoJSONGeometry,
    isNew: boolean = false,
    isUpdated: boolean = false
  ): void {
    const existingLayer = this._layers.get(entityId);
    const feature = createFeature(incident, geometry);
    const style = getPolygonStyle(incident.alert_level);

    if (existingLayer) {
      // Update existing layer by clearing and re-adding data
      existingLayer.clearLayers();
      existingLayer.addData(feature as GeoJSON.Feature);
      existingLayer.setStyle(style);

      // Apply update animation if data changed
      if (isUpdated) {
        this._applyAnimation(existingLayer, incident, "updated");
      }
    } else {
      // Create new GeoJSON layer
      const layer = L.geoJSON(feature as GeoJSON.Feature, {
        style: () => style,
        onEachFeature: (_feat, lyr) => {
          this._bindPopup(lyr, incident);
        },
      }).addTo(this._map);

      this._layers.set(entityId, layer);

      // Apply new incident animation
      if (isNew) {
        this._applyAnimation(layer, incident, "new");
      }
    }

    // Apply persistent extreme animation for emergency warnings
    if (incident.alert_level === "extreme") {
      const layer = this._layers.get(entityId);
      if (layer) {
        this._applyAnimation(layer, incident, "extreme");
      }
    }
  }

  /**
   * Binds a popup to a polygon layer.
   */
  private _bindPopup(layer: Layer, incident: EmergencyIncident): void {
    const alertColor = ALERT_COLORS[incident.alert_level] || ALERT_COLORS.minor;
    const alertLabel = this._getAlertLabel(incident.alert_level);
    const relativeTime = formatRelativeTime(incident.last_updated);

    // Build popup content with all available information
    const typeInfo = incident.event_type && incident.event_type !== "unknown"
      ? `<div class="incident-popup-row"><span class="incident-popup-label">Type:</span> ${this._escapeHtml(incident.event_type)}</div>`
      : "";

    const timeInfo = relativeTime
      ? `<div class="incident-popup-row"><span class="incident-popup-label">Updated:</span> ${relativeTime}</div>`
      : "";

    const adviceInfo = incident.alert_text
      ? `<div class="incident-popup-advice">${this._escapeHtml(incident.alert_text)}</div>`
      : "";

    const linkInfo = incident.external_link
      ? `<div class="incident-popup-link"><a href="${this._escapeHtml(incident.external_link)}" target="_blank" rel="noopener noreferrer">More Info →</a></div>`
      : "";

    const content = `
      <div class="incident-popup">
        <div class="incident-popup-header" style="border-left: 4px solid ${alertColor}; padding-left: 8px;">
          <strong>${this._escapeHtml(incident.headline)}</strong>
        </div>
        <div class="incident-popup-body">
          <div class="incident-alert-badge" style="background: ${alertColor}; color: ${this._getContrastColor(alertColor)};">
            ${alertLabel}
          </div>
          ${typeInfo}
          ${timeInfo}
          ${adviceInfo}
          ${linkInfo}
        </div>
      </div>
    `;

    (layer as Layer & { bindPopup: (content: string, options?: object) => void }).bindPopup(
      content,
      {
        maxWidth: 300,
        minWidth: 200,
        className: "incident-popup-container",
      }
    );
  }

  /**
   * Escapes HTML special characters to prevent XSS.
   */
  private _escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Returns black or white text color based on background luminance.
   */
  private _getContrastColor(hexColor: string): string {
    // Remove # if present
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? "#000000" : "#ffffff";
  }

  /**
   * Gets a human-readable label for an alert level.
   */
  private _getAlertLabel(alertLevel: string): string {
    const labels: Record<string, string> = {
      extreme: "Emergency Warning",
      severe: "Watch and Act",
      moderate: "Advice",
      minor: "Information",
    };
    return labels[alertLevel] || "Information";
  }

  /**
   * Applies animation to a GeoJSON layer.
   */
  private _applyAnimation(
    layer: LeafletGeoJSON,
    incident: EmergencyIncident,
    animationType: "new" | "updated" | "extreme"
  ): void {
    if (!this._animationsEnabled()) {
      return;
    }

    // Get the underlying SVG path elements from the layer
    layer.eachLayer((sublayer) => {
      const element = (sublayer as Layer & { getElement?: () => HTMLElement | undefined }).getElement?.();
      if (element) {
        this._applyAnimationToElement(element, incident, animationType);
      }
    });
  }

  /**
   * Applies animation classes and styles to an SVG element.
   */
  private _applyAnimationToElement(
    element: HTMLElement,
    incident: EmergencyIncident,
    animationType: "new" | "updated" | "extreme"
  ): void {
    // Set CSS custom properties for animation
    const alertColor = ALERT_COLORS[incident.alert_level] || ALERT_COLORS.minor;
    element.style.setProperty("--incident-glow-color", `${alertColor}80`);
    element.style.setProperty("--incident-animation-duration", this._getAnimationDuration());

    // Remove any existing animation classes
    element.classList.remove(
      "incident-layer-new",
      "incident-layer-updated",
      "incident-layer-extreme"
    );

    // Add appropriate animation class
    switch (animationType) {
      case "new":
        element.classList.add("incident-layer-new");
        break;
      case "updated":
        element.classList.add("incident-layer-updated");
        break;
      case "extreme":
        element.classList.add("incident-layer-extreme");
        break;
    }
  }

  /**
   * Gets all polygon bounds for map fitting.
   */
  public getPolygonBounds(): LatLngBounds | null {
    if (this._layers.size === 0) {
      return null;
    }

    let combinedBounds: LatLngBounds | null = null;

    for (const layer of this._layers.values()) {
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        if (combinedBounds) {
          combinedBounds.extend(bounds);
        } else {
          combinedBounds = bounds;
        }
      }
    }

    return combinedBounds;
  }

  /**
   * Gets all incident center positions for bounds calculation.
   */
  public getIncidentPositions(): [number, number][] {
    const positions: [number, number][] = [];
    for (const incident of this._incidents.values()) {
      positions.push([incident.latitude, incident.longitude]);
    }
    return positions;
  }

  /**
   * Gets the number of active incident polygons.
   */
  public get polygonCount(): number {
    return this._layers.size;
  }

  /**
   * Gets the total number of incidents (with or without polygons).
   */
  public get incidentCount(): number {
    return this._incidents.size;
  }

  /**
   * Removes all incident layers from the map.
   */
  public clear(): void {
    for (const layer of this._layers.values()) {
      layer.remove();
    }
    this._layers.clear();
    this._incidents.clear();
    this._incidentHashes.clear();
    this._knownEntityIds.clear();
  }

  /**
   * Cleans up resources.
   */
  public destroy(): void {
    this.clear();
  }
}
