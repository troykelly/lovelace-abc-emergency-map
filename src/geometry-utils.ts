/**
 * Geometry Utility Functions
 *
 * Pure utility functions for GeoJSON geometry calculations.
 * These functions are designed to be easily testable.
 */

import type { LatLngBounds } from "leaflet";

/**
 * Cache entry for polygon extent calculations.
 */
interface ExtentCacheEntry {
  /** Hash of the geometry coordinates for change detection */
  hash: string;
  /** Cached extent value in meters */
  extent: number;
}

/**
 * Cache for polygon extent calculations.
 * Stores computed extent values keyed by entity ID with geometry hash invalidation.
 */
class PolygonExtentCache {
  private _cache: Map<string, ExtentCacheEntry> = new Map();
  private _debugLogging = false;

  /**
   * Enables or disables debug logging for cache operations.
   */
  setDebugLogging(enabled: boolean): void {
    this._debugLogging = enabled;
  }

  /**
   * Generates a hash of GeoJSON geometry for change detection.
   * Uses JSON stringification of coordinates which is fast enough for our use case.
   */
  private _hashGeometry(geojson: GeoJSON.GeoJSON): string {
    // Hash based on coordinates - this is the part that changes when geometry updates
    const geo = geojson as { coordinates?: unknown };
    if (geo.coordinates) {
      return JSON.stringify(geo.coordinates);
    }
    // For GeometryCollection or other types, hash the whole thing
    return JSON.stringify(geojson);
  }

  /**
   * Gets the cached extent for an entity, or computes and caches it.
   *
   * @param entityId - The entity ID to cache by
   * @param geojson - The GeoJSON geometry
   * @returns The extent in meters
   */
  getExtent(entityId: string, geojson: GeoJSON.GeoJSON | undefined): number {
    if (!geojson) return 0;

    const hash = this._hashGeometry(geojson);
    const cached = this._cache.get(entityId);

    // Check cache hit
    if (cached && cached.hash === hash) {
      if (this._debugLogging) {
        console.debug(`ABC Emergency Map: Extent cache HIT for ${entityId}`);
      }
      return cached.extent;
    }

    // Cache miss - compute extent
    const extent = computePolygonExtent(geojson);

    // Store in cache
    this._cache.set(entityId, { hash, extent });

    if (this._debugLogging) {
      const reason = cached ? "geometry changed" : "new entry";
      console.debug(
        `ABC Emergency Map: Extent cache MISS for ${entityId} (${reason}), extent: ${Math.round(extent)}m`
      );
    }

    return extent;
  }

  /**
   * Removes a single entity from the cache.
   * Call this when an entity is no longer tracked.
   */
  remove(entityId: string): void {
    this._cache.delete(entityId);
  }

  /**
   * Removes entities that are not in the provided set.
   * Call this periodically to clean up stale entries.
   *
   * @param activeEntityIds - Set of entity IDs that are still active
   * @returns Number of entries removed
   */
  cleanup(activeEntityIds: Set<string>): number {
    let removed = 0;
    for (const entityId of this._cache.keys()) {
      if (!activeEntityIds.has(entityId)) {
        this._cache.delete(entityId);
        removed++;
      }
    }
    if (removed > 0 && this._debugLogging) {
      console.debug(`ABC Emergency Map: Extent cache cleaned up ${removed} stale entries`);
    }
    return removed;
  }

  /**
   * Clears all cached entries.
   */
  clear(): void {
    this._cache.clear();
  }

  /**
   * Returns the current cache size.
   */
  get size(): number {
    return this._cache.size;
  }
}

/** Singleton cache instance for polygon extents */
export const polygonExtentCache = new PolygonExtentCache();

/**
 * Computes the polygon extent without caching.
 * This is the raw calculation - use polygonExtentCache.getExtent() for cached access.
 *
 * @param geojson - A GeoJSON geometry object (Polygon, MultiPolygon, GeometryCollection)
 * @returns The maximum extent in meters, or 0 if the geometry is invalid/empty
 */
function computePolygonExtent(geojson: GeoJSON.GeoJSON): number {
  try {
    // Create a temporary GeoJSON layer to get bounds
    const layer = L.geoJSON(geojson);
    const bounds: LatLngBounds = layer.getBounds();

    if (!bounds.isValid()) return 0;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    // Calculate width and height in meters using Leaflet's geodetic distance
    const width = L.latLng(ne.lat, sw.lng).distanceTo(ne);
    const height = L.latLng(sw.lat, ne.lng).distanceTo(sw);

    // Return the maximum dimension
    return Math.max(width, height);
  } catch {
    console.warn("ABC Emergency Map: Failed to calculate polygon extent");
    return 0;
  }
}

/**
 * Calculates the maximum extent (width or height) of a GeoJSON geometry in meters.
 * Uses Leaflet's geodetic distance calculation for accuracy.
 *
 * Note: This is the uncached version for backwards compatibility.
 * For better performance with repeated calls, use polygonExtentCache.getExtent().
 *
 * @param geojson - A GeoJSON geometry object (Polygon, MultiPolygon, GeometryCollection)
 * @returns The maximum extent in meters, or 0 if the geometry is invalid/empty
 */
export function getPolygonExtentMeters(geojson: GeoJSON.GeoJSON | undefined): number {
  if (!geojson) return 0;
  return computePolygonExtent(geojson);
}

/**
 * Checks if a geometry type represents a polygon (not a point).
 *
 * @param geometryType - The GeoJSON geometry type string
 * @returns True if the geometry is a polygon type
 */
export function isPolygonGeometryType(geometryType: string | undefined): boolean {
  if (!geometryType) return false;
  return (
    geometryType === "Polygon" ||
    geometryType === "MultiPolygon" ||
    geometryType === "GeometryCollection"
  );
}

/**
 * Extracts the geometry type from entity attributes.
 *
 * @param attributes - Entity attributes object
 * @returns The geometry type string or undefined
 */
export function getGeometryType(
  attributes: Record<string, unknown>
): string | undefined {
  const geojson = attributes.geojson || attributes.geometry;
  if (!geojson) return undefined;

  return (
    (geojson as { type?: string }).type ||
    (attributes.geometry_type as string) ||
    undefined
  );
}
