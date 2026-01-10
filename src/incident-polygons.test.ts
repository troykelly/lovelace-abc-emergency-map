/**
 * Unit tests for incident-polygons.ts - hasPolygonData function
 */

import { describe, it, expect } from "vitest";
import { hasPolygonData } from "./incident-polygons";
import type { HassEntity } from "home-assistant-js-websocket";

/**
 * Helper to create a mock HassEntity with specific attributes
 */
function createMockEntity(
  attributes: Record<string, unknown>
): HassEntity {
  return {
    entity_id: "geo_location.test",
    state: "active",
    attributes: {
      friendly_name: "Test Entity",
      ...attributes,
    },
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    context: {
      id: "test",
      parent_id: null,
      user_id: null,
    },
  };
}

describe("hasPolygonData", () => {
  describe("polygon geometry types", () => {
    it("should return true for Polygon geometry in geojson attribute", () => {
      const entity = createMockEntity({
        geojson: {
          type: "Polygon",
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
        },
      });

      expect(hasPolygonData(entity)).toBe(true);
    });

    it("should return true for MultiPolygon geometry", () => {
      const entity = createMockEntity({
        geojson: {
          type: "MultiPolygon",
          coordinates: [
            [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
                [0, 0],
              ],
            ],
          ],
        },
      });

      expect(hasPolygonData(entity)).toBe(true);
    });

    it("should return true for GeometryCollection", () => {
      const entity = createMockEntity({
        geojson: {
          type: "GeometryCollection",
          geometries: [],
        },
      });

      expect(hasPolygonData(entity)).toBe(true);
    });

    it("should return true for Polygon in geometry attribute", () => {
      const entity = createMockEntity({
        geometry: {
          type: "Polygon",
          coordinates: [],
        },
      });

      expect(hasPolygonData(entity)).toBe(true);
    });
  });

  describe("point geometry types", () => {
    it("should return false for Point geometry", () => {
      const entity = createMockEntity({
        geojson: {
          type: "Point",
          coordinates: [0, 0],
        },
      });

      expect(hasPolygonData(entity)).toBe(false);
    });

    it("should return false for Point in geometry attribute", () => {
      const entity = createMockEntity({
        geometry: {
          type: "Point",
          coordinates: [0, 0],
        },
      });

      expect(hasPolygonData(entity)).toBe(false);
    });
  });

  describe("geometry_type attribute fallback", () => {
    it("should use geometry_type when geojson has no type", () => {
      const entity = createMockEntity({
        geojson: { coordinates: [] },
        geometry_type: "Polygon",
      });

      expect(hasPolygonData(entity)).toBe(true);
    });

    it("should return false when geometry_type is Point", () => {
      const entity = createMockEntity({
        geojson: { coordinates: [] },
        geometry_type: "Point",
      });

      expect(hasPolygonData(entity)).toBe(false);
    });

    it("should prefer geojson.type over geometry_type", () => {
      const entity = createMockEntity({
        geojson: {
          type: "Point",
          coordinates: [0, 0],
        },
        geometry_type: "Polygon",
      });

      // Should use geojson.type (Point), not geometry_type (Polygon)
      expect(hasPolygonData(entity)).toBe(false);
    });
  });

  describe("missing geometry", () => {
    it("should return false when no geometry attributes present", () => {
      const entity = createMockEntity({
        latitude: 0,
        longitude: 0,
      });

      expect(hasPolygonData(entity)).toBe(false);
    });

    it("should return false when geojson is null", () => {
      const entity = createMockEntity({
        geojson: null,
      });

      expect(hasPolygonData(entity)).toBe(false);
    });

    it("should return false when geojson is undefined", () => {
      const entity = createMockEntity({
        geojson: undefined,
      });

      expect(hasPolygonData(entity)).toBe(false);
    });

    it("should return false when both geojson and geometry are empty objects", () => {
      const entity = createMockEntity({
        geojson: {},
        geometry: {},
      });

      expect(hasPolygonData(entity)).toBe(false);
    });
  });

  describe("line geometry types", () => {
    it("should return false for LineString geometry", () => {
      const entity = createMockEntity({
        geojson: {
          type: "LineString",
          coordinates: [
            [0, 0],
            [1, 1],
          ],
        },
      });

      expect(hasPolygonData(entity)).toBe(false);
    });

    it("should return false for MultiLineString geometry", () => {
      const entity = createMockEntity({
        geojson: {
          type: "MultiLineString",
          coordinates: [
            [
              [0, 0],
              [1, 1],
            ],
          ],
        },
      });

      expect(hasPolygonData(entity)).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle geojson attribute preference over geometry", () => {
      const entity = createMockEntity({
        geojson: {
          type: "Polygon",
          coordinates: [],
        },
        geometry: {
          type: "Point",
          coordinates: [0, 0],
        },
      });

      // Should use geojson (Polygon), not geometry (Point)
      expect(hasPolygonData(entity)).toBe(true);
    });

    it("should handle unknown geometry types", () => {
      const entity = createMockEntity({
        geojson: {
          type: "CustomType",
          coordinates: [],
        },
      });

      expect(hasPolygonData(entity)).toBe(false);
    });
  });
});
