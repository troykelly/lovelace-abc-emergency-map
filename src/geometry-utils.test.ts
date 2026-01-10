/**
 * Unit tests for geometry-utils.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isPolygonGeometryType, getGeometryType } from "./geometry-utils";

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
