/**
 * Tile Provider Presets
 *
 * Defines built-in tile providers with their configurations.
 * Each provider can have light and dark variants for theme support.
 */

import type {
  TileProviderId,
  TileProviderConfig,
  TileProviderPreset,
  ABCEmergencyMapCardConfig,
} from "./types";

/**
 * OpenStreetMap - Free, community-driven map tiles.
 * No API key required. Good default choice.
 */
const osmPreset: TileProviderPreset = {
  name: "OpenStreetMap",
  requiresApiKey: false,
  light: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    subdomains: ["a", "b", "c"],
  },
  // OSM doesn't have official dark tiles, so we fall back to light
};

/**
 * CartoDB/Carto - Clean, minimal map tiles.
 * No API key required for basic usage. Has excellent dark mode support.
 */
const cartodbPreset: TileProviderPreset = {
  name: "CartoDB",
  requiresApiKey: false,
  light: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
    subdomains: ["a", "b", "c", "d"],
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
    subdomains: ["a", "b", "c", "d"],
  },
};

/**
 * Mapbox - Premium map tiles with extensive customization.
 * Requires API key. Provides high-quality tiles with dark mode support.
 */
const mapboxPreset: TileProviderPreset = {
  name: "Mapbox",
  requiresApiKey: true,
  light: {
    url: "https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token={accessToken}",
    attribution:
      '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 22,
  },
  dark: {
    url: "https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token={accessToken}",
    attribution:
      '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 22,
  },
};

/**
 * Registry of all built-in tile providers.
 */
export const TILE_PROVIDERS: Record<
  Exclude<TileProviderId, "custom">,
  TileProviderPreset
> = {
  osm: osmPreset,
  cartodb: cartodbPreset,
  mapbox: mapboxPreset,
};

/**
 * Default tile provider when none is specified.
 */
export const DEFAULT_TILE_PROVIDER: TileProviderId = "osm";

/**
 * Resolves the tile configuration for a given card config.
 * Handles provider selection, dark mode variants, and custom URLs.
 *
 * @param config - The card configuration
 * @param darkMode - Whether dark mode is active
 * @returns The resolved tile provider configuration
 */
export function resolveTileProvider(
  config: ABCEmergencyMapCardConfig,
  darkMode: boolean
): TileProviderConfig {
  const providerId = config.tile_provider ?? DEFAULT_TILE_PROVIDER;

  // Handle custom tile provider
  if (providerId === "custom") {
    return resolveCustomProvider(config);
  }

  // Get the preset for the specified provider
  const preset = TILE_PROVIDERS[providerId];
  if (!preset) {
    console.warn(
      `ABC Emergency Map: Unknown tile provider "${providerId}", falling back to OSM`
    );
    return TILE_PROVIDERS.osm.light;
  }

  // Check if API key is required but not provided
  if (preset.requiresApiKey && !config.api_key) {
    console.warn(
      `ABC Emergency Map: ${preset.name} requires an API key. Falling back to OSM.`
    );
    return TILE_PROVIDERS.osm.light;
  }

  // Select light or dark variant
  const variant = darkMode && preset.dark ? preset.dark : preset.light;

  // Inject API key if provided
  if (config.api_key && variant.url.includes("{accessToken}")) {
    return {
      ...variant,
      url: variant.url.replace("{accessToken}", config.api_key),
    };
  }

  return variant;
}

/**
 * Resolves a custom tile provider from user configuration.
 *
 * @param config - The card configuration
 * @returns The custom tile provider configuration
 */
function resolveCustomProvider(
  config: ABCEmergencyMapCardConfig
): TileProviderConfig {
  if (!config.tile_url) {
    console.warn(
      "ABC Emergency Map: Custom tile provider requires tile_url. Falling back to OSM."
    );
    return TILE_PROVIDERS.osm.light;
  }

  let url = config.tile_url;

  // Replace API key placeholder if provided
  if (config.api_key && url.includes("{accessToken}")) {
    url = url.replace("{accessToken}", config.api_key);
  }

  return {
    url,
    attribution:
      config.tile_attribution ?? "Custom tiles",
    maxZoom: 19,
  };
}

/**
 * Gets the list of available tile providers for the configuration UI.
 *
 * @returns Array of provider options with id and display name
 */
export function getAvailableTileProviders(): Array<{
  id: TileProviderId;
  name: string;
  requiresApiKey: boolean;
}> {
  const providers: Array<{
    id: TileProviderId;
    name: string;
    requiresApiKey: boolean;
  }> = [];

  for (const [id, preset] of Object.entries(TILE_PROVIDERS)) {
    providers.push({
      id: id as TileProviderId,
      name: preset.name,
      requiresApiKey: preset.requiresApiKey,
    });
  }

  // Add custom option
  providers.push({
    id: "custom",
    name: "Custom URL",
    requiresApiKey: false,
  });

  return providers;
}
