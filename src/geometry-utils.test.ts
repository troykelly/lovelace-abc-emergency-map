/**
 * Unit tests for geometry-utils.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isPolygonGeometryType,
  getGeometryType,
  polygonExtentCache,
} from "./geometry-utils";

// Note: getPolygonExtentMeters requires Leaflet which is loaded at runtime
// Those tests would require mocking Leaflet or running in an integration test

describe("isPolygonGeometryType", () => {
  describe("polygon types", () => {
    it("should return true for Polygon", () => {
      expect(isPolygonGeometryType("Polygon")).toBe(true);
    });

    it("should return true for MultiPolygon", () => {
      expect(isPolygonGeometryType("MultiPolygon")).toBe(true);
    });

    it("should return true for GeometryCollection", () => {
      expect(isPolygonGeometryType("GeometryCollection")).toBe(true);
    });
  });

  describe("non-polygon types", () => {
    it("should return false for Point", () => {
      expect(isPolygonGeometryType("Point")).toBe(false);
    });

    it("should return false for LineString", () => {
      expect(isPolygonGeometryType("LineString")).toBe(false);
    });

    it("should return false for MultiPoint", () => {
      expect(isPolygonGeometryType("MultiPoint")).toBe(false);
    });

    it("should return false for MultiLineString", () => {
      expect(isPolygonGeometryType("MultiLineString")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should return false for undefined", () => {
      expect(isPolygonGeometryType(undefined)).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isPolygonGeometryType("")).toBe(false);
    });

    it("should return false for lowercase polygon", () => {
      // GeoJSON types are case-sensitive
      expect(isPolygonGeometryType("polygon")).toBe(false);
    });

    it("should return false for unknown type", () => {
      expect(isPolygonGeometryType("CustomType")).toBe(false);
    });
  });
});

describe("getGeometryType", () => {
  describe("geojson attribute", () => {
    it("should extract type from geojson attribute", () => {
      const attrs = {
        geojson: { type: "Polygon", coordinates: [] },
      };

      expect(getGeometryType(attrs)).toBe("Polygon");
    });

    it("should handle MultiPolygon type", () => {
      const attrs = {
        geojson: { type: "MultiPolygon", coordinates: [] },
      };

      expect(getGeometryType(attrs)).toBe("MultiPolygon");
    });

    it("should handle Point type", () => {
      const attrs = {
        geojson: { type: "Point", coordinates: [0, 0] },
      };

      expect(getGeometryType(attrs)).toBe("Point");
    });
  });

  describe("geometry attribute", () => {
    it("should extract type from geometry attribute when geojson is absent", () => {
      const attrs = {
        geometry: { type: "Polygon", coordinates: [] },
      };

      expect(getGeometryType(attrs)).toBe("Polygon");
    });

    it("should prefer geojson over geometry attribute", () => {
      const attrs = {
        geojson: { type: "Polygon", coordinates: [] },
        geometry: { type: "Point", coordinates: [0, 0] },
      };

      expect(getGeometryType(attrs)).toBe("Polygon");
    });
  });

  describe("geometry_type attribute fallback", () => {
    it("should use geometry_type attribute when geojson has no type", () => {
      const attrs = {
        geojson: { coordinates: [] }, // No type property
        geometry_type: "Polygon",
      };

      expect(getGeometryType(attrs)).toBe("Polygon");
    });

    it("should prefer geojson.type over geometry_type", () => {
      const attrs = {
        geojson: { type: "MultiPolygon", coordinates: [] },
        geometry_type: "Polygon",
      };

      expect(getGeometryType(attrs)).toBe("MultiPolygon");
    });
  });

  describe("edge cases", () => {
    it("should return undefined for empty attributes", () => {
      const attrs = {};

      expect(getGeometryType(attrs)).toBeUndefined();
    });

    it("should return undefined when no geometry data present", () => {
      const attrs = {
        latitude: 0,
        longitude: 0,
      };

      expect(getGeometryType(attrs)).toBeUndefined();
    });

    it("should handle null geojson", () => {
      const attrs = {
        geojson: null,
      };

      expect(getGeometryType(attrs)).toBeUndefined();
    });
  });
});

// Tests for getPolygonExtentMeters require Leaflet mocking.
// These tests use vi.stubGlobal to mock the L object.

describe("getPolygonExtentMeters (with Leaflet mock)", () => {
  beforeEach(() => {
    // Mock Leaflet using vi.stubGlobal
    const mockBounds = {
      isValid: vi.fn().mockReturnValue(true),
      getNorthEast: vi.fn().mockReturnValue({ lat: -33.0, lng: 151.5 }),
      getSouthWest: vi.fn().mockReturnValue({ lat: -34.0, lng: 150.5 }),
    };

    const mockLayer = {
      getBounds: vi.fn().mockReturnValue(mockBounds),
    };

    const mockLatLng = {
      distanceTo: vi.fn().mockReturnValue(111000), // ~111km per degree
    };

    vi.stubGlobal("L", {
      geoJSON: vi.fn().mockReturnValue(mockLayer),
      latLng: vi.fn().mockReturnValue(mockLatLng),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should return 0 for undefined input", async () => {
    // Dynamic import to get fresh module with mocked L
    const { getPolygonExtentMeters } = await import("./geometry-utils");
    expect(getPolygonExtentMeters(undefined)).toBe(0);
  });

  it("should calculate extent for valid polygon", async () => {
    const { getPolygonExtentMeters } = await import("./geometry-utils");

    const polygon: GeoJSON.Polygon = {
      type: "Polygon",
      coordinates: [
        [
          [150.5, -34.0],
          [151.5, -34.0],
          [151.5, -33.0],
          [150.5, -33.0],
          [150.5, -34.0],
        ],
      ],
    };

    const extent = getPolygonExtentMeters(polygon);

    expect(L.geoJSON).toHaveBeenCalledWith(polygon);
    expect(extent).toBeGreaterThan(0);
  });

  it("should return 0 for invalid bounds", async () => {
    // Override mock to return invalid bounds
    const mockBounds = {
      isValid: vi.fn().mockReturnValue(false),
    };

    const mockLayer = {
      getBounds: vi.fn().mockReturnValue(mockBounds),
    };

    vi.stubGlobal("L", {
      geoJSON: vi.fn().mockReturnValue(mockLayer),
      latLng: vi.fn(),
    });

    const { getPolygonExtentMeters } = await import("./geometry-utils");

    const polygon: GeoJSON.Polygon = {
      type: "Polygon",
      coordinates: [],
    };

    expect(getPolygonExtentMeters(polygon)).toBe(0);
  });

  it("should return 0 and log warning on error", async () => {
    // Override mock to throw error
    vi.stubGlobal("L", {
      geoJSON: vi.fn().mockImplementation(() => {
        throw new Error("Invalid GeoJSON");
      }),
    });

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { getPolygonExtentMeters } = await import("./geometry-utils");

    const polygon: GeoJSON.Polygon = {
      type: "Polygon",
      coordinates: [],
    };

    expect(getPolygonExtentMeters(polygon)).toBe(0);
    expect(warnSpy).toHaveBeenCalledWith(
      "ABC Emergency Map: Failed to calculate polygon extent"
    );

    warnSpy.mockRestore();
  });
});

describe("polygonExtentCache", () => {
  beforeEach(() => {
    // Clear the cache before each test
    polygonExtentCache.clear();

    // Mock Leaflet
    const mockBounds = {
      isValid: vi.fn().mockReturnValue(true),
      getNorthEast: vi.fn().mockReturnValue({ lat: -33.0, lng: 151.5 }),
      getSouthWest: vi.fn().mockReturnValue({ lat: -34.0, lng: 150.5 }),
    };

    const mockLayer = {
      getBounds: vi.fn().mockReturnValue(mockBounds),
    };

    const mockLatLng = {
      distanceTo: vi.fn().mockReturnValue(111000),
    };

    vi.stubGlobal("L", {
      geoJSON: vi.fn().mockReturnValue(mockLayer),
      latLng: vi.fn().mockReturnValue(mockLatLng),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    polygonExtentCache.clear();
  });

  describe("getExtent", () => {
    it("should return 0 for undefined geometry", () => {
      expect(polygonExtentCache.getExtent("entity1", undefined)).toBe(0);
    });

    it("should compute and cache extent on first call", () => {
      const polygon: GeoJSON.Polygon = {
        type: "Polygon",
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      };

      const extent1 = polygonExtentCache.getExtent("entity1", polygon);

      expect(extent1).toBeGreaterThan(0);
      expect(polygonExtentCache.size).toBe(1);
    });

    it("should return cached value on subsequent calls with same geometry", () => {
      const polygon: GeoJSON.Polygon = {
        type: "Polygon",
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      };

      const extent1 = polygonExtentCache.getExtent("entity1", polygon);
      const geoJSONCalls = (L.geoJSON as ReturnType<typeof vi.fn>).mock.calls.length;

      // Second call with same geometry should be cached
      const extent2 = polygonExtentCache.getExtent("entity1", polygon);

      expect(extent2).toBe(extent1);
      // L.geoJSON should not have been called again
      expect((L.geoJSON as ReturnType<typeof vi.fn>).mock.calls.length).toBe(geoJSONCalls);
    });

    it("should recompute when geometry changes", () => {
      const polygon1: GeoJSON.Polygon = {
        type: "Polygon",
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      };

      const polygon2: GeoJSON.Polygon = {
        type: "Polygon",
        coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]], // Different coordinates
      };

      polygonExtentCache.getExtent("entity1", polygon1);
      const callsAfterFirst = (L.geoJSON as ReturnType<typeof vi.fn>).mock.calls.length;

      // Call with different geometry should recompute
      polygonExtentCache.getExtent("entity1", polygon2);

      expect((L.geoJSON as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callsAfterFirst + 1);
    });

    it("should cache different entities separately", () => {
      const polygon: GeoJSON.Polygon = {
        type: "Polygon",
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      };

      polygonExtentCache.getExtent("entity1", polygon);
      polygonExtentCache.getExtent("entity2", polygon);

      expect(polygonExtentCache.size).toBe(2);
    });
  });

  describe("remove", () => {
    it("should remove a specific entity from the cache", () => {
      const polygon: GeoJSON.Polygon = {
        type: "Polygon",
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      };

      polygonExtentCache.getExtent("entity1", polygon);
      polygonExtentCache.getExtent("entity2", polygon);
      expect(polygonExtentCache.size).toBe(2);

      polygonExtentCache.remove("entity1");

      expect(polygonExtentCache.size).toBe(1);
    });
  });

  describe("cleanup", () => {
    it("should remove entities not in the active set", () => {
      const polygon: GeoJSON.Polygon = {
        type: "Polygon",
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      };

      polygonExtentCache.getExtent("entity1", polygon);
      polygonExtentCache.getExtent("entity2", polygon);
      polygonExtentCache.getExtent("entity3", polygon);
      expect(polygonExtentCache.size).toBe(3);

      const activeIds = new Set(["entity1", "entity3"]);
      const removed = polygonExtentCache.cleanup(activeIds);

      expect(removed).toBe(1);
      expect(polygonExtentCache.size).toBe(2);
    });

    it("should return 0 when all entities are active", () => {
      const polygon: GeoJSON.Polygon = {
        type: "Polygon",
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      };

      polygonExtentCache.getExtent("entity1", polygon);
      polygonExtentCache.getExtent("entity2", polygon);

      const activeIds = new Set(["entity1", "entity2"]);
      const removed = polygonExtentCache.cleanup(activeIds);

      expect(removed).toBe(0);
      expect(polygonExtentCache.size).toBe(2);
    });
  });

  describe("clear", () => {
    it("should remove all entries from the cache", () => {
      const polygon: GeoJSON.Polygon = {
        type: "Polygon",
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      };

      polygonExtentCache.getExtent("entity1", polygon);
      polygonExtentCache.getExtent("entity2", polygon);
      expect(polygonExtentCache.size).toBe(2);

      polygonExtentCache.clear();

      expect(polygonExtentCache.size).toBe(0);
    });
  });

  describe("debug logging", () => {
    it("should log cache hits when debug logging is enabled", () => {
      const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

      const polygon: GeoJSON.Polygon = {
        type: "Polygon",
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      };

      polygonExtentCache.setDebugLogging(true);
      polygonExtentCache.getExtent("entity1", polygon); // Miss
      polygonExtentCache.getExtent("entity1", polygon); // Hit

      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining("cache MISS")
      );
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining("cache HIT")
      );

      debugSpy.mockRestore();
      polygonExtentCache.setDebugLogging(false);
    });

    it("should not log when debug logging is disabled", () => {
      const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

      const polygon: GeoJSON.Polygon = {
        type: "Polygon",
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      };

      polygonExtentCache.setDebugLogging(false);
      polygonExtentCache.getExtent("entity1", polygon);
      polygonExtentCache.getExtent("entity1", polygon);

      expect(debugSpy).not.toHaveBeenCalled();

      debugSpy.mockRestore();
    });
  });
});
