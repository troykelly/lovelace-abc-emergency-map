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
  DEFAULT_GEOMETRY_TRANSITIONS,
  DEFAULT_TRANSITION_DURATION,
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
  /** Track previous geometry for smooth transitions */
  private _previousGeometries: Map<string, GeoJSONGeometry> = new Map();
  /** Track active geometry transitions (animation frame IDs) */
  private _activeTransitions: Map<string, number> = new Map();

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
   * Checks if geometry transitions are enabled.
   */
  private _geometryTransitionsEnabled(): boolean {
    return this._config.geometry_transitions ?? DEFAULT_GEOMETRY_TRANSITIONS;
  }

  /**
   * Gets the transition duration in milliseconds.
   */
  private _getTransitionDurationMs(): number {
    return this._config.transition_duration ?? DEFAULT_TRANSITION_DURATION;
  }

  /**
   * Creates a hash of geometry coordinates for change detection.
   */
  private _hashGeometry(geometry: GeoJSONGeometry): string {
    return JSON.stringify(geometry.coordinates);
  }

  /**
   * Checks if geometry has changed.
   */
  private _hasGeometryChanged(entityId: string, newGeometry: GeoJSONGeometry): boolean {
    const oldGeometry = this._previousGeometries.get(entityId);
    if (!oldGeometry) return false;
    return this._hashGeometry(oldGeometry) !== this._hashGeometry(newGeometry);
  }

  /**
   * Interpolates between two coordinate arrays.
   * Handles different array lengths by resampling.
   */
  private _interpolateCoordinates(
    from: number[][],
    to: number[][],
    t: number
  ): number[][] {
    // Normalize to same length by resampling the shorter array
    const maxLen = Math.max(from.length, to.length);
    const normalizedFrom = this._resampleCoordinates(from, maxLen);
    const normalizedTo = this._resampleCoordinates(to, maxLen);

    // Linear interpolation between corresponding points
    return normalizedFrom.map((fromPoint, i) => {
      const toPoint = normalizedTo[i];
      return [
        fromPoint[0] + (toPoint[0] - fromPoint[0]) * t,
        fromPoint[1] + (toPoint[1] - fromPoint[1]) * t,
      ];
    });
  }

  /**
   * Resamples a coordinate array to a target length.
   * Uses linear interpolation along the path.
   */
  private _resampleCoordinates(coords: number[][], targetLength: number): number[][] {
    if (coords.length === 0) return [];
    if (coords.length === targetLength) return coords;
    if (coords.length === 1) {
      // Repeat single point
      return Array(targetLength).fill(coords[0]);
    }

    const result: number[][] = [];
    const totalLength = coords.length - 1;

    for (let i = 0; i < targetLength; i++) {
      const t = (i / (targetLength - 1)) * totalLength;
      const index = Math.floor(t);
      const frac = t - index;

      if (index >= totalLength) {
        result.push(coords[totalLength]);
      } else {
        const p1 = coords[index];
        const p2 = coords[index + 1];
        result.push([
          p1[0] + (p2[0] - p1[0]) * frac,
          p1[1] + (p2[1] - p1[1]) * frac,
        ]);
      }
    }

    return result;
  }

  /**
   * Interpolates between two geometry objects.
   * Supports Polygon and MultiPolygon types.
   */
  private _interpolateGeometry(
    from: GeoJSONGeometry,
    to: GeoJSONGeometry,
    t: number
  ): GeoJSONGeometry {
    // Only interpolate if types match
    if (from.type !== to.type) {
      return t < 0.5 ? from : to;
    }

    if (from.type === "Polygon" && to.type === "Polygon") {
      const fromRings = from.coordinates as number[][][];
      const toRings = to.coordinates as number[][][];
      const maxRings = Math.max(fromRings.length, toRings.length);

      const interpolatedRings: number[][][] = [];
      for (let i = 0; i < maxRings; i++) {
        const fromRing = fromRings[i] || fromRings[0] || [];
        const toRing = toRings[i] || toRings[0] || [];
        interpolatedRings.push(this._interpolateCoordinates(fromRing, toRing, t));
      }

      return {
        type: "Polygon",
        coordinates: interpolatedRings,
      };
    }

    if (from.type === "MultiPolygon" && to.type === "MultiPolygon") {
      const fromPolygons = from.coordinates as number[][][][];
      const toPolygons = to.coordinates as number[][][][];
      const maxPolygons = Math.max(fromPolygons.length, toPolygons.length);

      const interpolatedPolygons: number[][][][] = [];
      for (let i = 0; i < maxPolygons; i++) {
        const fromPoly = fromPolygons[i] || fromPolygons[0] || [[]];
        const toPoly = toPolygons[i] || toPolygons[0] || [[]];
        const maxRings = Math.max(fromPoly.length, toPoly.length);

        const interpolatedRings: number[][][] = [];
        for (let j = 0; j < maxRings; j++) {
          const fromRing = fromPoly[j] || fromPoly[0] || [];
          const toRing = toPoly[j] || toPoly[0] || [];
          interpolatedRings.push(this._interpolateCoordinates(fromRing, toRing, t));
        }
        interpolatedPolygons.push(interpolatedRings);
      }

      return {
        type: "MultiPolygon",
        coordinates: interpolatedPolygons,
      };
    }

    // For Point or unsupported types, just switch at midpoint
    return t < 0.5 ? from : to;
  }

  /**
   * Animates a geometry transition using requestAnimationFrame.
   */
  private _animateGeometryTransition(
    entityId: string,
    incident: EmergencyIncident,
    fromGeometry: GeoJSONGeometry,
    toGeometry: GeoJSONGeometry,
    style: PathOptions
  ): void {
    // Cancel any existing transition for this entity
    const existingTransition = this._activeTransitions.get(entityId);
    if (existingTransition) {
      cancelAnimationFrame(existingTransition);
    }

    const duration = this._getTransitionDurationMs();
    const startTime = performance.now();
    const layer = this._layers.get(entityId);

    if (!layer) return;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const t = 1 - Math.pow(1 - progress, 3);

      // Interpolate geometry
      const interpolatedGeometry = this._interpolateGeometry(fromGeometry, toGeometry, t);
      const feature = createFeature(incident, interpolatedGeometry);

      // Update layer with interpolated geometry
      layer.clearLayers();
      layer.addData(feature as GeoJSON.Feature);
      layer.setStyle(style);

      if (progress < 1) {
        // Continue animation
        const frameId = requestAnimationFrame(animate);
        this._activeTransitions.set(entityId, frameId);
      } else {
        // Animation complete - clean up
        this._activeTransitions.delete(entityId);
        // Store final geometry
        this._previousGeometries.set(entityId, toGeometry);
      }
    };

    // Start animation
    const frameId = requestAnimationFrame(animate);
    this._activeTransitions.set(entityId, frameId);
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

    // Check if geometry has changed for smooth transitions
    const geometryChanged = this._hasGeometryChanged(entityId, geometry);
    const previousGeometry = this._previousGeometries.get(entityId);

    if (existingLayer) {
      // Check if we should animate the geometry transition
      if (
        geometryChanged &&
        previousGeometry &&
        this._geometryTransitionsEnabled() &&
        geometry.type !== "Point"
      ) {
        // Animate transition from old geometry to new
        this._animateGeometryTransition(
          entityId,
          incident,
          previousGeometry,
          geometry,
          style
        );

        // Apply update animation alongside geometry transition
        if (isUpdated) {
          this._applyAnimation(existingLayer, incident, "updated");
        }
      } else {
        // Update immediately without transition
        existingLayer.clearLayers();
        existingLayer.addData(feature as GeoJSON.Feature);
        existingLayer.setStyle(style);

        // Store current geometry for future transitions
        this._previousGeometries.set(entityId, geometry);

        // Apply update animation if data changed
        if (isUpdated) {
          this._applyAnimation(existingLayer, incident, "updated");
        }
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

      // Store initial geometry for future transitions
      this._previousGeometries.set(entityId, geometry);

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
    // Cancel any active geometry transitions
    for (const frameId of this._activeTransitions.values()) {
      cancelAnimationFrame(frameId);
    }
    this._activeTransitions.clear();

    for (const layer of this._layers.values()) {
      layer.remove();
    }
    this._layers.clear();
    this._incidents.clear();
    this._incidentHashes.clear();
    this._knownEntityIds.clear();
    this._previousGeometries.clear();
  }

  /**
   * Cleans up resources.
   */
  public destroy(): void {
    this.clear();
  }
}
