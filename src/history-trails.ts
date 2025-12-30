/**
 * History Trails Manager
 *
 * Fetches entity location history from Home Assistant and renders
 * polyline trails on the Leaflet map with age-based gradient coloring.
 */

import type { HomeAssistant } from "custom-card-helpers";
import type { Map as LeafletMap, Polyline, LatLngExpression } from "leaflet";
import type {
  ABCEmergencyMapCardConfig,
  HistoryPoint,
  EntityHistoryData,
  MarkerEntityDomain,
} from "./types";
import {
  DEFAULT_SHOW_HISTORY,
  DEFAULT_HISTORY_LINE_WEIGHT,
  DEFAULT_HOURS_TO_SHOW,
  DOMAIN_COLORS,
} from "./types";
import { getDomain, isLocationDomain } from "./entity-markers";

/** Minimum time between history fetches (ms) */
const FETCH_DEBOUNCE_MS = 5000;

/** Maximum gap in minutes before breaking the trail */
const MAX_GAP_MINUTES = 30;

/** Number of segments for gradient effect */
const GRADIENT_SEGMENTS = 10;

/**
 * Fetches entity history from Home Assistant.
 * Uses the history/period WebSocket API.
 */
async function fetchEntityHistory(
  hass: HomeAssistant,
  entityId: string,
  hoursToShow: number
): Promise<HistoryPoint[]> {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - hoursToShow * 60 * 60 * 1000);

  try {
    // Define the history state type
    interface HistoryState {
      last_changed: string;
      attributes: {
        latitude?: number;
        longitude?: number;
      };
    }

    // Use the history/period API via WebSocket
    // The API returns a Record keyed by entity_id
    const history = await hass.callWS<Record<string, HistoryState[]>>({
      type: "history/history_during_period",
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      entity_ids: [entityId],
      minimal_response: false,
      significant_changes_only: false,
    });

    if (!history || !history[entityId]) {
      return [];
    }

    const points: HistoryPoint[] = [];
    const entityHistory = history[entityId];

    for (const state of entityHistory) {
      const lat = state.attributes?.latitude;
      const lon = state.attributes?.longitude;

      if (
        typeof lat === "number" &&
        typeof lon === "number" &&
        !isNaN(lat) &&
        !isNaN(lon)
      ) {
        points.push({
          timestamp: new Date(state.last_changed),
          latitude: lat,
          longitude: lon,
        });
      }
    }

    // Sort by timestamp (oldest first)
    points.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return points;
  } catch (error) {
    console.warn(`Failed to fetch history for ${entityId}:`, error);
    return [];
  }
}

/**
 * Splits points into segments based on time gaps.
 * This prevents drawing lines across large gaps in data.
 */
function splitByGaps(
  points: HistoryPoint[],
  maxGapMinutes: number
): HistoryPoint[][] {
  if (points.length === 0) return [];

  const segments: HistoryPoint[][] = [];
  let currentSegment: HistoryPoint[] = [points[0]];

  for (let i = 1; i < points.length; i++) {
    const gap =
      (points[i].timestamp.getTime() - points[i - 1].timestamp.getTime()) /
      (1000 * 60);

    if (gap > maxGapMinutes) {
      // Start a new segment
      if (currentSegment.length > 1) {
        segments.push(currentSegment);
      }
      currentSegment = [points[i]];
    } else {
      currentSegment.push(points[i]);
    }
  }

  // Add the last segment
  if (currentSegment.length > 1) {
    segments.push(currentSegment);
  }

  return segments;
}

/**
 * Calculates opacity based on age of the point.
 * Newer points are more opaque, older points are more transparent.
 */
function calculateOpacity(
  timestamp: Date,
  startTime: Date,
  endTime: Date
): number {
  const totalRange = endTime.getTime() - startTime.getTime();
  if (totalRange === 0) return 1;

  const age = endTime.getTime() - timestamp.getTime();
  const ageRatio = age / totalRange;

  // Opacity ranges from 0.2 (oldest) to 0.8 (newest)
  return 0.8 - ageRatio * 0.6;
}

/**
 * Creates gradient polyline segments for a trail.
 */
function createGradientPolylines(
  map: LeafletMap,
  points: HistoryPoint[],
  color: string,
  weight: number,
  hoursToShow: number
): Polyline[] {
  if (points.length < 2) return [];

  const polylines: Polyline[] = [];
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - hoursToShow * 60 * 60 * 1000);

  // Create segments with varying opacity
  const segmentSize = Math.max(1, Math.floor(points.length / GRADIENT_SEGMENTS));

  for (let i = 0; i < points.length - 1; i += segmentSize) {
    const segmentEnd = Math.min(i + segmentSize + 1, points.length);
    const segmentPoints = points.slice(i, segmentEnd);

    if (segmentPoints.length < 2) continue;

    const midPoint = segmentPoints[Math.floor(segmentPoints.length / 2)];
    const opacity = calculateOpacity(midPoint.timestamp, startTime, endTime);

    const latlngs: LatLngExpression[] = segmentPoints.map((p) => [
      p.latitude,
      p.longitude,
    ]);

    const polyline = L.polyline(latlngs, {
      color: color,
      weight: weight,
      opacity: opacity,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);

    polylines.push(polyline);
  }

  return polylines;
}

/**
 * Manages entity history trails on a Leaflet map.
 */
export class HistoryTrailManager {
  private _map: LeafletMap;
  private _config: ABCEmergencyMapCardConfig;
  private _polylines: Map<string, Polyline[]> = new Map();
  private _lastFetch = 0;
  private _fetchTimeout?: number;
  private _cachedHistory: Map<string, EntityHistoryData> = new Map();

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
   * Updates history trails for the given entities.
   */
  public async updateTrails(
    hass: HomeAssistant,
    entityIds: string[]
  ): Promise<void> {
    // Check if history is enabled
    const showHistory = this._config.show_history ?? DEFAULT_SHOW_HISTORY;
    if (!showHistory) {
      this.clear();
      return;
    }

    // Determine which entities to show history for
    const historyEntities = this._config.history_entities ?? entityIds;
    const entitiesToShow = historyEntities.filter((id) => {
      const domain = getDomain(id);
      return isLocationDomain(domain);
    });

    // Debounce fetches
    const now = Date.now();
    if (now - this._lastFetch < FETCH_DEBOUNCE_MS) {
      // Schedule a delayed fetch if not already scheduled
      if (!this._fetchTimeout) {
        this._fetchTimeout = window.setTimeout(() => {
          this._fetchTimeout = undefined;
          this.updateTrails(hass, entityIds);
        }, FETCH_DEBOUNCE_MS);
      }
      return;
    }
    this._lastFetch = now;

    // Clear scheduled fetch
    if (this._fetchTimeout) {
      window.clearTimeout(this._fetchTimeout);
      this._fetchTimeout = undefined;
    }

    const hoursToShow = this._config.hours_to_show ?? DEFAULT_HOURS_TO_SHOW;
    const weight = this._config.history_line_weight ?? DEFAULT_HISTORY_LINE_WEIGHT;

    // Remove trails for entities no longer being shown
    const currentIds = new Set(entitiesToShow);
    for (const entityId of this._polylines.keys()) {
      if (!currentIds.has(entityId)) {
        this._removeTrail(entityId);
      }
    }

    // Fetch and render trails for each entity
    for (const entityId of entitiesToShow) {
      const domain = getDomain(entityId) as MarkerEntityDomain;
      const color = DOMAIN_COLORS[domain] || "#888888";

      const points = await fetchEntityHistory(hass, entityId, hoursToShow);

      if (points.length < 2) {
        this._removeTrail(entityId);
        continue;
      }

      // Cache the history data
      this._cachedHistory.set(entityId, { entityId, color, points });

      // Remove existing polylines for this entity
      this._removeTrail(entityId);

      // Split by gaps and render
      const segments = splitByGaps(points, MAX_GAP_MINUTES);

      const polylines: Polyline[] = [];
      for (const segment of segments) {
        const segmentPolylines = createGradientPolylines(
          this._map,
          segment,
          color,
          weight,
          hoursToShow
        );
        polylines.push(...segmentPolylines);
      }

      this._polylines.set(entityId, polylines);
    }
  }

  /**
   * Removes a trail for a specific entity.
   */
  private _removeTrail(entityId: string): void {
    const polylines = this._polylines.get(entityId);
    if (polylines) {
      for (const polyline of polylines) {
        polyline.remove();
      }
      this._polylines.delete(entityId);
    }
  }

  /**
   * Gets all trail positions for bounds calculation.
   */
  public getTrailPositions(): [number, number][] {
    const positions: [number, number][] = [];
    for (const history of this._cachedHistory.values()) {
      for (const point of history.points) {
        positions.push([point.latitude, point.longitude]);
      }
    }
    return positions;
  }

  /**
   * Gets the number of active trails.
   */
  public get trailCount(): number {
    return this._polylines.size;
  }

  /**
   * Removes all trails from the map.
   */
  public clear(): void {
    for (const entityId of this._polylines.keys()) {
      this._removeTrail(entityId);
    }
    this._polylines.clear();
    this._cachedHistory.clear();
  }

  /**
   * Cleans up resources.
   */
  public destroy(): void {
    if (this._fetchTimeout) {
      window.clearTimeout(this._fetchTimeout);
      this._fetchTimeout = undefined;
    }
    this.clear();
  }
}
