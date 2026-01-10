/**
 * Tests for Cast Compatibility Utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  isCastEnvironment,
  classifyCastError,
  getCastErrorMessage,
  CastErrorType,
  mightBeBlockedInCast,
} from "./cast-compat";

describe("Cast Compatibility", () => {
  // Store original window properties to restore after tests
  let originalNavigator: Navigator;
  let originalLocation: Location;
  let originalCustomElements: typeof customElements;

  beforeEach(() => {
    originalNavigator = globalThis.navigator;
    originalLocation = globalThis.location;
    originalCustomElements = globalThis.customElements;

    // Reset the isCastEnvironment cache by forcing a new module import
    // This is not ideal but necessary since the module caches the result
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("classifyCastError", () => {
    it("should classify CORS errors", () => {
      const corsError = new Error("Access-Control-Allow-Origin header missing");
      expect(classifyCastError(corsError)).toBe(CastErrorType.CORS_BLOCKED);

      const crossOriginError = new Error("Blocked by cross-origin policy");
      expect(classifyCastError(crossOriginError)).toBe(CastErrorType.CORS_BLOCKED);
    });

    it("should classify network/load errors", () => {
      const fetchError = new Error("Failed to fetch resource");
      expect(classifyCastError(fetchError)).toBe(
        CastErrorType.RESOURCE_LOAD_FAILED
      );

      const networkError = new Error("Network connection failed");
      expect(classifyCastError(networkError)).toBe(
        CastErrorType.RESOURCE_LOAD_FAILED
      );

      const loadError = new Error("Could not load script");
      expect(classifyCastError(loadError)).toBe(
        CastErrorType.RESOURCE_LOAD_FAILED
      );
    });

    it("should classify LitElement errors", () => {
      const litError = new Error("LitElement is not defined");
      expect(classifyCastError(litError)).toBe(
        CastErrorType.LITELEMENT_UNAVAILABLE
      );

      const litElementError = new Error("Cannot find lit-element module");
      expect(classifyCastError(litElementError)).toBe(
        CastErrorType.LITELEMENT_UNAVAILABLE
      );
    });

    it("should classify unknown errors", () => {
      const unknownError = new Error("Something went wrong");
      expect(classifyCastError(unknownError)).toBe(CastErrorType.UNKNOWN);
    });

    it("should handle non-Error values", () => {
      expect(classifyCastError("string error")).toBe(CastErrorType.UNKNOWN);
      expect(classifyCastError(null)).toBe(CastErrorType.UNKNOWN);
      expect(classifyCastError(undefined)).toBe(CastErrorType.UNKNOWN);
      expect(classifyCastError(42)).toBe(CastErrorType.UNKNOWN);
    });
  });

  describe("getCastErrorMessage", () => {
    it("should return appropriate message for CORS errors", () => {
      const message = getCastErrorMessage(CastErrorType.CORS_BLOCKED);
      expect(message).toContain("CORS");
      expect(message).toContain("Cast");
    });

    it("should return appropriate message for resource load errors", () => {
      const message = getCastErrorMessage(CastErrorType.RESOURCE_LOAD_FAILED);
      expect(message).toContain("load");
      expect(message).toContain("Cast");
    });

    it("should return appropriate message for LitElement errors", () => {
      const message = getCastErrorMessage(CastErrorType.LITELEMENT_UNAVAILABLE);
      expect(message).toContain("Cast");
    });

    it("should return appropriate message for network errors", () => {
      const message = getCastErrorMessage(CastErrorType.NETWORK_RESTRICTED);
      expect(message).toContain("Network");
      expect(message).toContain("Cast");
    });

    it("should return appropriate message for unknown errors", () => {
      const message = getCastErrorMessage(CastErrorType.UNKNOWN);
      expect(message).toContain("error");
      expect(message).toContain("Cast");
    });
  });

  describe("mightBeBlockedInCast", () => {
    it("should allow known good CDNs", () => {
      expect(mightBeBlockedInCast("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js")).toBe(false);
      expect(mightBeBlockedInCast("https://cdn.jsdelivr.net/npm/leaflet/dist/leaflet.js")).toBe(false);
      expect(mightBeBlockedInCast("https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js")).toBe(false);
    });

    it("should flag unknown domains", () => {
      expect(mightBeBlockedInCast("https://example.com/script.js")).toBe(true);
      expect(mightBeBlockedInCast("https://unknown-cdn.net/lib.js")).toBe(true);
    });

    it("should flag invalid URLs", () => {
      expect(mightBeBlockedInCast("not-a-url")).toBe(true);
      expect(mightBeBlockedInCast("")).toBe(true);
    });
  });

  describe("CastErrorType enum", () => {
    it("should have all expected error types", () => {
      expect(CastErrorType.RESOURCE_LOAD_FAILED).toBe("RESOURCE_LOAD_FAILED");
      expect(CastErrorType.CORS_BLOCKED).toBe("CORS_BLOCKED");
      expect(CastErrorType.LITELEMENT_UNAVAILABLE).toBe("LITELEMENT_UNAVAILABLE");
      expect(CastErrorType.NETWORK_RESTRICTED).toBe("NETWORK_RESTRICTED");
      expect(CastErrorType.UNKNOWN).toBe("UNKNOWN");
    });
  });
});
