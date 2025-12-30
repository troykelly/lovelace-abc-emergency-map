/**
 * Entity Marker System
 *
 * Handles rendering and management of entity markers on the Leaflet map.
 * Supports device_tracker, person, and geo_location entities.
 */

import type { HomeAssistant } from "custom-card-helpers";
import type { HassEntity } from "home-assistant-js-websocket";
import type { Map as LeafletMap, Marker, DivIcon, LatLngExpression } from "leaflet";
import type {
  EntityMarkerData,
  MarkerEntityDomain,
  ABCEmergencyMapCardConfig,
} from "./types";
import { DOMAIN_COLORS, DOMAIN_ICONS } from "./types";

/** Domains that support location tracking */
const LOCATION_DOMAINS: MarkerEntityDomain[] = [
  "device_tracker",
  "person",
  "geo_location",
];

/**
 * Checks if an entity domain supports location markers.
 */
export function isLocationDomain(domain: string): domain is MarkerEntityDomain {
  return LOCATION_DOMAINS.includes(domain as MarkerEntityDomain);
}

/**
 * Extracts the domain from an entity ID.
 */
export function getDomain(entityId: string): string {
  return entityId.split(".")[0];
}

/**
 * Checks if an entity has valid GPS coordinates.
 */
export function hasValidCoordinates(entity: HassEntity): boolean {
  const lat = entity.attributes.latitude;
  const lon = entity.attributes.longitude;
  return (
    typeof lat === "number" &&
    typeof lon === "number" &&
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

/**
 * Extracts marker data from a Home Assistant entity.
 */
export function extractEntityMarkerData(
  entityId: string,
  entity: HassEntity
): EntityMarkerData | null {
  const domain = getDomain(entityId);

  if (!isLocationDomain(domain)) {
    return null;
  }

  if (!hasValidCoordinates(entity)) {
    return null;
  }

  const attrs = entity.attributes;

  return {
    entityId,
    domain,
    name: attrs.friendly_name || entityId,
    latitude: attrs.latitude as number,
    longitude: attrs.longitude as number,
    picture: attrs.entity_picture as string | undefined,
    state: entity.state,
    gpsAccuracy: attrs.gps_accuracy as number | undefined,
    battery: attrs.battery as number | undefined,
    lastUpdated: entity.last_updated,
  };
}

/**
 * Gets entities to display based on card configuration.
 */
export function getConfiguredEntities(
  hass: HomeAssistant,
  config: ABCEmergencyMapCardConfig
): EntityMarkerData[] {
  const entities: EntityMarkerData[] = [];
  const processedIds = new Set<string>();

  // Process explicitly configured entities
  const configuredEntityIds: string[] = [];
  if (config.entity) {
    configuredEntityIds.push(config.entity);
  }
  if (config.entities) {
    configuredEntityIds.push(...config.entities);
  }

  for (const entityId of configuredEntityIds) {
    if (processedIds.has(entityId)) continue;
    processedIds.add(entityId);

    const entity = hass.states[entityId];
    if (!entity) continue;

    const data = extractEntityMarkerData(entityId, entity);
    if (data) {
      entities.push(data);
    }
  }

  return entities;
}

/**
 * Creates a CSS style string for a marker icon.
 */
function createMarkerIconStyle(
  data: EntityMarkerData,
  size: number
): string {
  const color = DOMAIN_COLORS[data.domain];
  const hasImage = !!data.picture;

  if (hasImage) {
    return `
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 3px solid ${color};
      background-image: url('${data.picture}');
      background-size: cover;
      background-position: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    `;
  }

  return `
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background-color: ${color};
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    color: white;
    font-size: ${size * 0.5}px;
  `;
}

/**
 * Creates the inner HTML for a marker icon.
 */
function createMarkerIconHtml(data: EntityMarkerData, size: number): string {
  const style = createMarkerIconStyle(data, size);

  if (data.picture) {
    return `<div style="${style}"></div>`;
  }

  // Use MDI icon mapping for fallback
  const iconName = DOMAIN_ICONS[data.domain];
  // Convert mdi:icon-name to ha-icon format
  return `
    <div style="${style}">
      <ha-icon icon="${iconName}" style="--mdc-icon-size: ${size * 0.6}px;"></ha-icon>
    </div>
  `;
}

/**
 * Creates a popup content HTML for an entity marker.
 */
export function createPopupContent(data: EntityMarkerData): string {
  const parts: string[] = [
    `<strong>${data.name}</strong>`,
    `<br><small>${data.entityId}</small>`,
    `<br>State: ${data.state}`,
  ];

  if (data.battery !== undefined) {
    parts.push(`<br>Battery: ${data.battery}%`);
  }

  if (data.gpsAccuracy !== undefined) {
    parts.push(`<br>GPS Accuracy: ${data.gpsAccuracy}m`);
  }

  return `<div class="entity-popup">${parts.join("")}</div>`;
}

/**
 * Manages entity markers on a Leaflet map.
 */
export class EntityMarkerManager {
  private _map: LeafletMap;
  private _markers: Map<string, Marker> = new Map();
  private _markerSize = 40;

  constructor(map: LeafletMap) {
    this._map = map;
  }

  /**
   * Updates all markers based on current entity data.
   */
  public updateMarkers(entities: EntityMarkerData[]): void {
    const currentIds = new Set(entities.map((e) => e.entityId));

    // Remove markers for entities that are no longer present
    for (const [entityId, marker] of this._markers) {
      if (!currentIds.has(entityId)) {
        marker.remove();
        this._markers.delete(entityId);
      }
    }

    // Update or create markers for each entity
    for (const data of entities) {
      this._updateOrCreateMarker(data);
    }
  }

  /**
   * Updates an existing marker or creates a new one.
   */
  private _updateOrCreateMarker(data: EntityMarkerData): void {
    const position: LatLngExpression = [data.latitude, data.longitude];
    const existingMarker = this._markers.get(data.entityId);

    if (existingMarker) {
      // Update existing marker position
      existingMarker.setLatLng(position);

      // Update icon (in case picture changed)
      const icon = this._createIcon(data);
      existingMarker.setIcon(icon);

      // Update popup content
      existingMarker.setPopupContent(createPopupContent(data));
    } else {
      // Create new marker
      const icon = this._createIcon(data);
      const marker = L.marker(position, { icon })
        .bindPopup(createPopupContent(data))
        .addTo(this._map);

      // Add tooltip with entity name on hover
      marker.bindTooltip(data.name, {
        permanent: false,
        direction: "top",
        offset: [0, -this._markerSize / 2],
      });

      this._markers.set(data.entityId, marker);
    }
  }

  /**
   * Creates a Leaflet DivIcon for an entity marker.
   */
  private _createIcon(data: EntityMarkerData): DivIcon {
    return L.divIcon({
      className: "entity-marker",
      html: createMarkerIconHtml(data, this._markerSize),
      iconSize: [this._markerSize, this._markerSize],
      iconAnchor: [this._markerSize / 2, this._markerSize / 2],
      popupAnchor: [0, -this._markerSize / 2],
    });
  }

  /**
   * Gets all current marker positions for bounds calculation.
   */
  public getMarkerPositions(): [number, number][] {
    const positions: [number, number][] = [];
    for (const marker of this._markers.values()) {
      const latLng = marker.getLatLng();
      positions.push([latLng.lat, latLng.lng]);
    }
    return positions;
  }

  /**
   * Gets the number of active markers.
   */
  public get markerCount(): number {
    return this._markers.size;
  }

  /**
   * Removes all markers from the map.
   */
  public clear(): void {
    for (const marker of this._markers.values()) {
      marker.remove();
    }
    this._markers.clear();
  }

  /**
   * Cleans up resources.
   */
  public destroy(): void {
    this.clear();
  }
}
