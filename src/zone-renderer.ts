/**
 * Zone Renderer
 *
 * Handles rendering of Home Assistant zones on the Leaflet map.
 * Zones are displayed as circles with configurable styling.
 */

import type { HomeAssistant } from "custom-card-helpers";
import type { HassEntity } from "home-assistant-js-websocket";
import type { Map as LeafletMap, Circle, LatLngExpression } from "leaflet";
import type { ZoneData, ABCEmergencyMapCardConfig } from "./types";
import {
  DEFAULT_ZONE_COLOR,
  DEFAULT_ZONE_OPACITY,
  DEFAULT_ZONE_BORDER_OPACITY,
} from "./types";

/** Default zone radius in meters when not specified */
const DEFAULT_ZONE_RADIUS = 100;

/**
 * Checks if an entity is a zone entity.
 */
export function isZoneEntity(entityId: string): boolean {
  return entityId.startsWith("zone.");
}

/**
 * Extracts zone data from a Home Assistant zone entity.
 */
export function extractZoneData(
  entityId: string,
  entity: HassEntity
): ZoneData | null {
  const attrs = entity.attributes;

  // Zones must have coordinates
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

  return {
    entityId,
    name: attrs.friendly_name || entityId.replace("zone.", ""),
    latitude: lat,
    longitude: lon,
    radius:
      typeof attrs.radius === "number" ? attrs.radius : DEFAULT_ZONE_RADIUS,
    passive: attrs.passive === true,
    icon: attrs.icon as string | undefined,
  };
}

/**
 * Gets all zone entities from Home Assistant state.
 */
export function getAllZones(hass: HomeAssistant): ZoneData[] {
  const zones: ZoneData[] = [];

  for (const entityId of Object.keys(hass.states)) {
    if (!isZoneEntity(entityId)) continue;

    const entity = hass.states[entityId];
    const zoneData = extractZoneData(entityId, entity);

    if (zoneData) {
      zones.push(zoneData);
    }
  }

  return zones;
}

/**
 * Creates popup content for a zone.
 */
function createZonePopup(zone: ZoneData): string {
  const parts: string[] = [
    `<strong>${zone.name}</strong>`,
    `<br><small>${zone.entityId}</small>`,
    `<br>Radius: ${zone.radius}m`,
  ];

  if (zone.passive) {
    parts.push("<br><em>Passive zone</em>");
  }

  return `<div class="zone-popup">${parts.join("")}</div>`;
}

/**
 * Manages zone rendering on a Leaflet map.
 */
export class ZoneManager {
  private _map: LeafletMap;
  private _circles: Map<string, Circle> = new Map();
  private _config: ABCEmergencyMapCardConfig;

  constructor(map: LeafletMap, config: ABCEmergencyMapCardConfig) {
    this._map = map;
    this._config = config;
  }

  /**
   * Updates the configuration.
   */
  public updateConfig(config: ABCEmergencyMapCardConfig): void {
    this._config = config;
  }

  /**
   * Updates all zone circles based on current zone data.
   */
  public updateZones(zones: ZoneData[]): void {
    // If zones are disabled, clear all and return
    if (this._config.show_zones === false) {
      this.clear();
      return;
    }

    const currentIds = new Set(zones.map((z) => z.entityId));

    // Remove circles for zones that no longer exist
    for (const [entityId, circle] of this._circles) {
      if (!currentIds.has(entityId)) {
        circle.remove();
        this._circles.delete(entityId);
      }
    }

    // Update or create circles for each zone
    for (const zone of zones) {
      this._updateOrCreateCircle(zone);
    }
  }

  /**
   * Updates an existing circle or creates a new one.
   */
  private _updateOrCreateCircle(zone: ZoneData): void {
    const center: LatLngExpression = [zone.latitude, zone.longitude];
    const existingCircle = this._circles.get(zone.entityId);

    const fillColor = this._config.zone_color ?? DEFAULT_ZONE_COLOR;
    const fillOpacity = this._config.zone_opacity ?? DEFAULT_ZONE_OPACITY;
    const borderOpacity =
      this._config.zone_border_opacity ?? DEFAULT_ZONE_BORDER_OPACITY;

    const style = {
      color: fillColor,
      fillColor: fillColor,
      fillOpacity: fillOpacity,
      weight: 2,
      opacity: borderOpacity,
      dashArray: zone.passive ? "5, 5" : undefined,
    };

    if (existingCircle) {
      // Update existing circle
      existingCircle.setLatLng(center);
      existingCircle.setRadius(zone.radius);
      existingCircle.setStyle(style);
      existingCircle.setPopupContent(createZonePopup(zone));
    } else {
      // Create new circle
      const circle = L.circle(center, {
        radius: zone.radius,
        ...style,
      })
        .bindPopup(createZonePopup(zone))
        .bindTooltip(zone.name, {
          permanent: false,
          direction: "center",
        })
        .addTo(this._map);

      this._circles.set(zone.entityId, circle);
    }
  }

  /**
   * Gets all zone positions for bounds calculation.
   */
  public getZonePositions(): [number, number][] {
    const positions: [number, number][] = [];
    for (const circle of this._circles.values()) {
      const latLng = circle.getLatLng();
      positions.push([latLng.lat, latLng.lng]);
    }
    return positions;
  }

  /**
   * Gets the number of rendered zones.
   */
  public get zoneCount(): number {
    return this._circles.size;
  }

  /**
   * Removes all zone circles from the map.
   */
  public clear(): void {
    for (const circle of this._circles.values()) {
      circle.remove();
    }
    this._circles.clear();
  }

  /**
   * Cleans up resources.
   */
  public destroy(): void {
    this.clear();
  }
}
