/**
 * Unit tests for types.ts - Configuration validation functions
 */

import { describe, it, expect } from "vitest";
import { validateVisibilityConfig, getAlertColor } from "./types";
import type { ABCEmergencyMapCardConfig } from "./types";

describe("validateVisibilityConfig", () => {
  describe("hide_markers_for_polygons with show_warning_levels", () => {
    it("should return warning when hide_markers_for_polygons is true but show_warning_levels is false", () => {
      const config: Partial<ABCEmergencyMapCardConfig> = {
        show_warning_levels: false,
        hide_markers_for_polygons: true,
      };

      const warnings = validateVisibilityConfig(config);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].id).toBe("hide-markers-no-effect");
      expect(warnings[0].severity).toBe("warning");
      expect(warnings[0].message).toContain("hide_markers_for_polygons");
      expect(warnings[0].message).toContain("no effect");
      expect(warnings[0].suggestion).toBeDefined();
    });

    it("should return no warnings when show_warning_levels is true", () => {
      const config: Partial<ABCEmergencyMapCardConfig> = {
        show_warning_levels: true,
        hide_markers_for_polygons: true,
      };

      const warnings = validateVisibilityConfig(config);

      expect(warnings).toHaveLength(0);
    });

    it("should return no warnings when hide_markers_for_polygons is false", () => {
      const config: Partial<ABCEmergencyMapCardConfig> = {
        show_warning_levels: false,
        hide_markers_for_polygons: false,
      };

      const warnings = validateVisibilityConfig(config);

      expect(warnings).toHaveLength(0);
    });

    it("should return no warnings when both options are undefined", () => {
      const config: Partial<ABCEmergencyMapCardConfig> = {};

      const warnings = validateVisibilityConfig(config);

      expect(warnings).toHaveLength(0);
    });

    it("should return no warnings when only show_warning_levels is set to false", () => {
      const config: Partial<ABCEmergencyMapCardConfig> = {
        show_warning_levels: false,
      };

      const warnings = validateVisibilityConfig(config);

      expect(warnings).toHaveLength(0);
    });

    it("should return no warnings when only hide_markers_for_polygons is set to true", () => {
      const config: Partial<ABCEmergencyMapCardConfig> = {
        hide_markers_for_polygons: true,
      };

      const warnings = validateVisibilityConfig(config);

      expect(warnings).toHaveLength(0);
    });
  });
});

describe("getAlertColor", () => {
  describe("without configuration", () => {
    it("should return default color for extreme level", () => {
      expect(getAlertColor("extreme")).toBe("#cc0000");
    });

    it("should return default color for severe level", () => {
      expect(getAlertColor("severe")).toBe("#ff6600");
    });

    it("should return default color for moderate level", () => {
      expect(getAlertColor("moderate")).toBe("#ffcc00");
    });

    it("should return default color for minor level", () => {
      expect(getAlertColor("minor")).toBe("#3366cc");
    });

    it("should return minor color for invalid level", () => {
      expect(getAlertColor("invalid")).toBe("#3366cc");
    });

    it("should return minor color for empty string", () => {
      expect(getAlertColor("")).toBe("#3366cc");
    });
  });

  describe("with alert_colors config", () => {
    it("should use custom color when provided", () => {
      const config = {
        alert_colors: {
          extreme: "#ff0000",
        },
      };

      expect(getAlertColor("extreme", config)).toBe("#ff0000");
    });

    it("should fall back to default for levels not overridden", () => {
      const config = {
        alert_colors: {
          extreme: "#ff0000",
        },
      };

      expect(getAlertColor("severe", config)).toBe("#ff6600");
    });

    it("should handle partial overrides", () => {
      const config = {
        alert_colors: {
          extreme: "#aa0000",
          minor: "#0000aa",
        },
      };

      expect(getAlertColor("extreme", config)).toBe("#aa0000");
      expect(getAlertColor("severe", config)).toBe("#ff6600"); // Default
      expect(getAlertColor("minor", config)).toBe("#0000aa");
    });
  });

  describe("with alert_color_preset config", () => {
    it("should use us_nws preset colors", () => {
      const config = {
        alert_color_preset: "us_nws" as const,
      };

      expect(getAlertColor("minor", config)).toBe("#00bfff"); // Cyan
    });

    it("should use eu_meteo preset colors", () => {
      const config = {
        alert_color_preset: "eu_meteo" as const,
      };

      expect(getAlertColor("minor", config)).toBe("#33cc33"); // Green
    });

    it("should use high_contrast preset colors", () => {
      const config = {
        alert_color_preset: "high_contrast" as const,
      };

      expect(getAlertColor("extreme", config)).toBe("#990000"); // Darker red
    });

    it("should use australian preset by default", () => {
      const config = {
        alert_color_preset: "australian" as const,
      };

      expect(getAlertColor("minor", config)).toBe("#3366cc");
    });
  });

  describe("preset with overrides", () => {
    it("should allow alert_colors to override preset values", () => {
      const config = {
        alert_color_preset: "us_nws" as const,
        alert_colors: {
          minor: "#purple", // Override the cyan
        },
      };

      expect(getAlertColor("minor", config)).toBe("#purple");
      expect(getAlertColor("severe", config)).toBe("#ff6600"); // Preset value
    });
  });
});
