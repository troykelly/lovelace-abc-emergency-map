/**
 * Geometry Utility Functions
 *
 * Pure utility functions for GeoJSON geometry calculations.
 * These functions are designed to be easily testable.
 */

import type { LatLngBounds } from "leaflet";

/**
 * Calculates the maximum extent (width or height) of a GeoJSON geometry in meters.
 * Uses Leaflet's geodetic distance calculation for accuracy.
 *
 * @param geojson - A GeoJSON geometry object (Polygon, MultiPolygon, GeometryCollection)
 * @returns The maximum extent in meters, or 0 if the geometry is invalid/empty
 */
export function getPolygonExtentMeters(geojson: GeoJSON.GeoJSON | undefined): number {
  if (!geojson) return 0;

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
