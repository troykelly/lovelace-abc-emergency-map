/**
 * Bounds Manager
 *
 * Handles auto-fitting map bounds to show all entities and zones,
 * and provides a custom control button for manual fit-to-entities.
 */

import type {
  Map as LeafletMap,
  Control,
  LatLngBoundsExpression,
  FitBoundsOptions,
} from "leaflet";
import type { ABCEmergencyMapCardConfig } from "./types";
import {
  DEFAULT_AUTO_FIT,
  DEFAULT_FIT_PADDING,
  DEFAULT_FIT_MAX_ZOOM,
} from "./types";

/** Minimum number of positions required to calculate bounds */
const MIN_POSITIONS_FOR_BOUNDS = 1;

/** Debounce delay for auto-fit on entity updates (ms) */
const AUTO_FIT_DEBOUNCE_MS = 300;

/**
 * Normalizes padding config to Leaflet's expected format.
 * Leaflet expects [topBottom, leftRight] or a single number.
 */
function normalizePadding(
  padding: number | [number, number] | undefined
): [number, number] {
  if (padding === undefined) {
    return [DEFAULT_FIT_PADDING, DEFAULT_FIT_PADDING];
  }
  if (typeof padding === "number") {
    return [padding, padding];
  }
  return padding;
}

/**
 * Creates a custom Leaflet control for the "Fit to Entities" button.
 */
function createFitControl(onClick: () => void): Control {
  const FitControl = L.Control.extend({
    options: {
      position: "topleft" as const,
    },

    onAdd(): HTMLElement {
      const container = L.DomUtil.create(
        "div",
        "leaflet-bar leaflet-control fit-control"
      );

      const button = L.DomUtil.create("a", "fit-control-button", container);
      button.href = "#";
      button.title = "Fit to all entities";
      button.setAttribute("role", "button");
      button.setAttribute("aria-label", "Fit map to show all entities");
      button.innerHTML = `<ha-icon icon="mdi:fit-to-screen" style="--mdc-icon-size: 18px;"></ha-icon>`;

      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.on(button, "click", (e: Event) => {
        L.DomEvent.preventDefault(e);
        onClick();
      });

      return container;
    },
  });

  return new FitControl();
}

/**
 * Manages map bounds fitting and provides fit-to-entities control.
 */
export class BoundsManager {
  private _map: LeafletMap;
  private _config: ABCEmergencyMapCardConfig;
  private _fitControl?: Control;
  private _debounceTimer?: number;
  private _hasUserInteracted = false;
  private _initialFitDone = false;

  constructor(map: LeafletMap, config: ABCEmergencyMapCardConfig) {
    this._map = map;
    this._config = config;
    this._setupUserInteractionTracking();
  }

  /**
   * Updates the configuration.
   */
  public updateConfig(config: ABCEmergencyMapCardConfig): void {
    this._config = config;
  }

  /**
   * Adds the fit-to-entities control button to the map.
   */
  public addFitControl(): void {
    if (this._fitControl) {
      return;
    }

    this._fitControl = createFitControl(() => {
      this.fitToPositions(this._lastKnownPositions, true);
    });

    this._fitControl.addTo(this._map);
  }

  /**
   * Removes the fit-to-entities control button from the map.
   */
  public removeFitControl(): void {
    if (this._fitControl) {
      this._fitControl.remove();
      this._fitControl = undefined;
    }
  }

  /** Stores the last known positions for the fit control button */
  private _lastKnownPositions: [number, number][] = [];

  /**
   * Fits the map to show all provided positions.
   *
   * @param positions Array of [lat, lng] coordinate pairs
   * @param force If true, fits even if user has interacted with map
   */
  public fitToPositions(
    positions: [number, number][],
    force = false
  ): void {
    // Store for the fit control button
    this._lastKnownPositions = positions;

    // Check if auto-fit is enabled
    const autoFit = this._config.auto_fit ?? DEFAULT_AUTO_FIT;

    // Skip if auto-fit disabled and not forced (unless initial fit)
    if (!autoFit && !force && this._initialFitDone) {
      return;
    }

    // Skip if user has manually interacted with map (unless forced or initial)
    if (this._hasUserInteracted && !force && this._initialFitDone) {
      return;
    }

    // Need at least one position to fit
    if (positions.length < MIN_POSITIONS_FOR_BOUNDS) {
      return;
    }

    // Clear any pending debounce
    if (this._debounceTimer) {
      window.clearTimeout(this._debounceTimer);
    }

    // Debounce to avoid rapid updates
    this._debounceTimer = window.setTimeout(() => {
      this._performFit(positions);
      this._initialFitDone = true;
    }, force ? 0 : AUTO_FIT_DEBOUNCE_MS);
  }

  /**
   * Performs the actual bounds fitting.
   */
  private _performFit(positions: [number, number][]): void {
    const padding = normalizePadding(this._config.fit_padding);
    const maxZoom = this._config.fit_max_zoom ?? DEFAULT_FIT_MAX_ZOOM;

    if (positions.length === 1) {
      // Single position: center and use default zoom
      const [lat, lng] = positions[0];
      const zoom = Math.min(
        this._config.default_zoom ?? 10,
        maxZoom
      );
      this._map.setView([lat, lng], zoom, { animate: true });
    } else {
      // Multiple positions: fit to bounds
      const bounds: LatLngBoundsExpression = positions.map(
        ([lat, lng]) => [lat, lng] as [number, number]
      );

      const options: FitBoundsOptions = {
        padding: padding,
        maxZoom: maxZoom,
        animate: true,
      };

      this._map.fitBounds(bounds, options);
    }
  }

  /**
   * Sets up tracking for user interaction with the map.
   * Once the user manually pans or zooms, auto-fit is disabled
   * until they explicitly use the fit control button.
   */
  private _setupUserInteractionTracking(): void {
    // Track user-initiated drag/zoom
    this._map.on("dragstart", () => {
      this._hasUserInteracted = true;
    });

    this._map.on("zoomstart", () => {
      // Only mark as user interaction if triggered by user (not programmatic)
      // Unfortunately Leaflet doesn't distinguish, so we use a flag approach
      // The fit methods will temporarily ignore this by using force=true
    });
  }

  /**
   * Resets the user interaction flag.
   * Called when user explicitly clicks "fit to entities".
   */
  public resetUserInteraction(): void {
    this._hasUserInteracted = false;
  }

  /**
   * Cleans up resources.
   */
  public destroy(): void {
    if (this._debounceTimer) {
      window.clearTimeout(this._debounceTimer);
      this._debounceTimer = undefined;
    }

    this.removeFitControl();
  }
}
