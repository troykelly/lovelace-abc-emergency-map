/**
 * ABC Emergency Map Card
 *
 * A custom Lovelace card for Home Assistant that displays
 * ABC Emergency incident polygons on a Leaflet map.
 */

import { LitElement, html, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant } from "custom-card-helpers";
import { styles } from "./styles";
import type { ABCEmergencyMapCardConfig, TileProviderConfig } from "./types";
import {
  DEFAULT_DARK_MODE,
  DEFAULT_HIDE_MARKERS_FOR_POLYGONS,
  validateVisibilityConfig,
} from "./types";
import { isPolygonGeometryType, polygonExtentCache } from "./geometry-utils";
import { loadLeaflet, injectLeafletCSS } from "./leaflet-loader";
import { resolveTileProvider } from "./tile-providers";
import { EntityMarkerManager, getAllEntities } from "./entity-markers";
import { ZoneManager, getAllZones } from "./zone-renderer";
import { BoundsManager } from "./bounds-manager";
import { HistoryTrailManager } from "./history-trails";
import { IncidentPolygonManager } from "./incident-polygons";
import type { Map as LeafletMap, TileLayer } from "leaflet";

// Import editor component so it's bundled
import "./editor";

// Note: The global L declaration is in leaflet-types.d.ts

/** Default center point for Australia */
const DEFAULT_CENTER: [number, number] = [-25.2744, 133.7751];

/** Default zoom level showing most of Australia */
const DEFAULT_ZOOM = 4;

/** Card loading states */
type LoadingState = "loading" | "ready" | "error";

@customElement("abc-emergency-map-card")
export class ABCEmergencyMapCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config?: ABCEmergencyMapCardConfig;
  @state() private _loadingState: LoadingState = "loading";
  @state() private _errorMessage?: string;
  @state() private _currentDarkMode: boolean = false;

  /** Leaflet map instance */
  private _map?: LeafletMap;

  /** Tile layer instance */
  private _tileLayer?: TileLayer;

  /** Current tile provider configuration for change detection */
  private _currentTileConfig?: TileProviderConfig;

  /** Entity marker manager */
  private _markerManager?: EntityMarkerManager;

  /** Zone renderer manager */
  private _zoneManager?: ZoneManager;

  /** Bounds manager for auto-fit functionality */
  private _boundsManager?: BoundsManager;

  /** History trail manager */
  private _historyManager?: HistoryTrailManager;

  /** Incident polygon manager */
  private _incidentManager?: IncidentPolygonManager;

  /** ResizeObserver for container size changes */
  private _resizeObserver?: ResizeObserver;

  /** Debounce timer for resize events */
  private _resizeDebounce?: number;

  /** Bound theme change handler for cleanup */
  private _boundThemeHandler?: () => void;

  /** Bound zoom event handler for cleanup */
  private _boundZoomHandler?: () => void;

  /** Live region element for screen reader announcements */
  private _liveRegion?: HTMLElement;

  /** Previous marker count for change detection */
  private _previousMarkerCount = 0;

  /** Previous marker visibility state for change detection */
  private _previousMarkersVisible = true;

  static styles = styles;

  /**
   * Sets the card configuration.
   * Called by Home Assistant when the card is configured.
   */
  public setConfig(config: ABCEmergencyMapCardConfig): void {
    if (!config) {
      throw new Error("Invalid configuration");
    }

    // Validate visibility configuration and log any warnings
    const warnings = validateVisibilityConfig(config);
    warnings.forEach((warning) => {
      const prefix = "ABC Emergency Map: Config";
      if (warning.severity === "warning") {
        console.warn(`${prefix} Warning - ${warning.message}`);
        if (warning.suggestion) {
          console.warn(`${prefix} Suggestion - ${warning.suggestion}`);
        }
      } else {
        console.info(`${prefix} Info - ${warning.message}`);
        if (warning.suggestion) {
          console.info(`${prefix} Suggestion - ${warning.suggestion}`);
        }
      }
    });

    this._config = {
      title: "ABC Emergency Map",
      default_zoom: 10,
      hours_to_show: 24,
      dark_mode: DEFAULT_DARK_MODE,
      show_warning_levels: true,
      ...config,
    };
  }

  /**
   * Renders the card HTML.
   */
  protected render(): TemplateResult {
    if (!this._config) {
      return html`<ha-card>Invalid configuration</ha-card>`;
    }

    const themeClass = this._currentDarkMode ? "theme-dark" : "theme-light";
    const cardTitle = this._config.title || "Map";

    return html`
      <ha-card class="${themeClass}">
        <!-- Skip link for keyboard navigation -->
        <a
          href="#map-content-end"
          class="skip-link"
          @click=${this._handleSkipLink}
        >
          Skip map content
        </a>

        ${this._config.title
          ? html`
            <div class="card-header">
              <span class="header-title" id="map-title">${this._config.title}</span>
            </div>
          `
          : ""}
        <div
          class="map-wrapper"
          role="region"
          aria-label="${cardTitle}"
        >
          ${this._renderMapContent()}
        </div>

        <!-- Live region for screen reader announcements -->
        <div
          id="accessibility-live-region"
          class="sr-live-region"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        ></div>

        <!-- End marker for skip link -->
        <div id="map-content-end" tabindex="-1"></div>
      </ha-card>
    `;
  }

  /**
   * Handles skip link click to move focus past the map.
   */
  private _handleSkipLink(e: Event): void {
    e.preventDefault();
    const target = this.shadowRoot?.getElementById('map-content-end');
    if (target) {
      target.focus();
    }
  }

  /**
   * Renders the map content based on loading state.
   */
  private _renderMapContent(): TemplateResult {
    switch (this._loadingState) {
      case "loading":
        return html`
          <div class="loading-container" role="status" aria-label="Loading map">
            <ha-circular-progress indeterminate></ha-circular-progress>
            <div class="loading-text">Loading map...</div>
          </div>
        `;
      case "error":
        return html`
          <div class="error-container" role="alert">
            <ha-icon icon="mdi:alert-circle" aria-hidden="true"></ha-icon>
            <div class="error-text">
              ${this._errorMessage || "Failed to load map"}
            </div>
            <mwc-button @click=${this._retryLoad}>Retry</mwc-button>
          </div>
        `;
      case "ready":
      default:
        return html`
          <div
            class="map-container"
            id="map"
            role="application"
            aria-label="Interactive emergency map. Use arrow keys to pan, plus and minus to zoom."
            tabindex="0"
            @keydown=${this._handleMapKeydown}
          ></div>
        `;
    }
  }

  /**
   * Handles keyboard navigation within the map.
   * Arrow keys pan, +/- zoom, Home resets view.
   */
  private _handleMapKeydown(e: KeyboardEvent): void {
    if (!this._map) return;

    const panAmount = 100; // pixels
    const zoomAmount = 1;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        this._map.panBy([0, -panAmount]);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this._map.panBy([0, panAmount]);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this._map.panBy([-panAmount, 0]);
        break;
      case 'ArrowRight':
        e.preventDefault();
        this._map.panBy([panAmount, 0]);
        break;
      case '+':
      case '=':
        e.preventDefault();
        this._map.zoomIn(zoomAmount);
        break;
      case '-':
      case '_':
        e.preventDefault();
        this._map.zoomOut(zoomAmount);
        break;
      case 'Home':
        e.preventDefault();
        // Trigger fit to bounds
        if (this._boundsManager) {
          const positions: [number, number][] = [];
          if (this._markerManager) positions.push(...this._markerManager.getMarkerPositions());
          if (this._zoneManager) positions.push(...this._zoneManager.getZonePositions());
          if (this._incidentManager) positions.push(...this._incidentManager.getIncidentPositions());
          this._boundsManager.fitToPositions(positions, true);
        }
        break;
    }
  }

  /**
   * Called after the first render.
   * Initializes the Leaflet map.
   */
  protected async firstUpdated(
    _changedProperties: PropertyValues
  ): Promise<void> {
    super.firstUpdated(_changedProperties);
    await this._initializeMap();
  }

  /**
   * Called when properties change.
   * Updates map data and tile layer when Home Assistant state changes.
   */
  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has("hass") && this._map) {
      // Check if theme changed and update tiles if needed
      this._checkThemeChange();
      this._updateTileLayer();
      this._updateMapData();
    }
  }

  /**
   * Checks if the theme has changed and updates the dark mode state.
   * This triggers a re-render if the theme changed.
   */
  private _checkThemeChange(): void {
    const newDarkMode = this._isDarkMode();
    if (newDarkMode !== this._currentDarkMode) {
      this._currentDarkMode = newDarkMode;
      // Force tile layer update on theme change
      this._currentTileConfig = undefined;
    }
  }

  /**
   * Called when the element is removed from the DOM.
   * Cleans up map resources.
   */
  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this._removeThemeListener();
    this._cleanup();
  }

  /**
   * Called when the element is re-added to the DOM.
   * Re-initializes the map if needed.
   */
  public connectedCallback(): void {
    super.connectedCallback();

    // Add theme change listener
    this._addThemeListener();

    // If we were previously initialized and got disconnected, re-initialize
    if (this._loadingState === "ready" && !this._map) {
      this._initializeMap();
    }
  }

  /**
   * Adds a listener for Home Assistant theme-change events.
   * This enables real-time theme switching when HA theme changes.
   */
  private _addThemeListener(): void {
    this._boundThemeHandler = () => {
      this._checkThemeChange();
      if (this._map) {
        this._updateTileLayer();
      }
    };

    // Listen for Home Assistant theme changes
    window.addEventListener("settheme", this._boundThemeHandler);
    window.addEventListener("theme-changed", this._boundThemeHandler);
  }

  /**
   * Removes the theme change listener.
   */
  private _removeThemeListener(): void {
    if (this._boundThemeHandler) {
      window.removeEventListener("settheme", this._boundThemeHandler);
      window.removeEventListener("theme-changed", this._boundThemeHandler);
      this._boundThemeHandler = undefined;
    }
  }

  /**
   * Initializes the Leaflet map.
   * Loads Leaflet dynamically if not already loaded.
   */
  private async _initializeMap(): Promise<void> {
    console.log("ABC Emergency Map: Initializing map (v2.0 - Shadow DOM CSS fix)");
    this._loadingState = "loading";
    this._errorMessage = undefined;

    // Set initial dark mode state
    this._currentDarkMode = this._isDarkMode();

    try {
      // Load Leaflet from CDN if needed
      await loadLeaflet();

      // Inject Leaflet CSS into our shadow root
      // (CSS in document.head doesn't penetrate Shadow DOM)
      if (this.shadowRoot) {
        await injectLeafletCSS(this.shadowRoot);
      }

      // Set state to ready so the map container div is rendered
      this._loadingState = "ready";

      // Wait for next render cycle to ensure map container exists
      await this.updateComplete;

      // Get the map container from shadow DOM
      const mapContainer = this.shadowRoot?.getElementById("map");
      if (!mapContainer) {
        throw new Error("Map container not found in shadow DOM");
      }

      // Initialize the Leaflet map
      const center = this._getInitialCenter();
      const zoom = this._config?.default_zoom ?? DEFAULT_ZOOM;

      this._map = L.map(mapContainer, {
        center: center,
        zoom: zoom,
        zoomControl: true,
        attributionControl: true,
      });

      // Add the tile layer using the configured provider
      this._updateTileLayer();

      // Initialize entity marker manager
      this._markerManager = new EntityMarkerManager(this._map);

      // Initialize zone renderer (zones render below markers)
      this._zoneManager = new ZoneManager(this._map, this._config!);

      // Initialize bounds manager for auto-fit functionality
      this._boundsManager = new BoundsManager(this._map, this._config!);
      this._boundsManager.addFitControl();

      // Initialize history trail manager (renders below markers)
      this._historyManager = new HistoryTrailManager(this._map, this._config!);

      // Initialize incident polygon manager for ABC Emergency
      this._incidentManager = new IncidentPolygonManager(this._map, this._config!);

      // Set up zoom event listener for marker visibility control
      if (this._config?.marker_min_zoom !== undefined) {
        this._boundZoomHandler = () => this._updateMarkerZoomVisibility();
        this._map.on("zoomend", this._boundZoomHandler);
        // Apply initial visibility based on current zoom
        this._updateMarkerZoomVisibility();
      }

      // Set up ResizeObserver for container size changes
      this._setupResizeObserver(mapContainer);

      // Trigger initial resize to ensure proper sizing
      this._handleResize();

      // Load initial data if hass is available
      if (this.hass) {
        this._updateMapData();
      }
    } catch (error) {
      console.error("ABC Emergency Map: Failed to initialize map:", error);
      this._loadingState = "error";
      this._errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
    }
  }

  /**
   * Gets the initial center point for the map.
   * Uses Home Assistant's location if available, otherwise defaults to Australia center.
   */
  private _getInitialCenter(): [number, number] {
    // Try to use Home Assistant's configured location
    if (
      this.hass?.config?.latitude !== undefined &&
      this.hass?.config?.longitude !== undefined
    ) {
      console.log("ABC Emergency Map: Using HA home location:",
        this.hass.config.latitude, this.hass.config.longitude);
      return [this.hass.config.latitude, this.hass.config.longitude];
    }

    // Fall back to center of Australia
    console.log("ABC Emergency Map: No HA location, using default:", DEFAULT_CENTER);
    return DEFAULT_CENTER;
  }

  /**
   * Determines if dark mode is active.
   * Handles "auto", "light", "dark" settings and legacy boolean values.
   * In "auto" mode, follows Home Assistant's theme setting.
   */
  private _isDarkMode(): boolean {
    const setting = this._config?.dark_mode ?? DEFAULT_DARK_MODE;

    // Handle legacy boolean values
    if (typeof setting === "boolean") {
      return setting;
    }

    // Handle string settings
    switch (setting) {
      case "dark":
        return true;
      case "light":
        return false;
      case "auto":
      default:
        return this._detectHADarkMode();
    }
  }

  /**
   * Detects dark mode from Home Assistant theme settings.
   * Checks multiple sources for maximum compatibility.
   */
  private _detectHADarkMode(): boolean {
    // Method 1: Check hass.themes.darkMode (HA 2021.6+)
    const themes = this.hass?.themes as unknown as
      | { darkMode?: boolean }
      | undefined;
    if (themes?.darkMode !== undefined) {
      return themes.darkMode;
    }

    // Method 2: Check CSS prefers-color-scheme media query
    // This respects system dark mode when HA is in "auto" mode
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      return true;
    }

    // Method 3: Check if HA theme name contains "dark"
    const themeName = (this.hass?.themes as unknown as { theme?: string })?.theme;
    if (themeName && themeName.toLowerCase().includes("dark")) {
      return true;
    }

    // Default to light mode
    return false;
  }

  /**
   * Updates the tile layer based on current configuration and theme.
   * Called on initialization and when config/theme changes.
   */
  private _updateTileLayer(): void {
    if (!this._map || !this._config) {
      return;
    }

    const darkMode = this._isDarkMode();
    const tileConfig = resolveTileProvider(this._config, darkMode);

    // Skip update if tile config hasn't changed
    if (
      this._currentTileConfig &&
      this._currentTileConfig.url === tileConfig.url &&
      this._currentTileConfig.attribution === tileConfig.attribution
    ) {
      return;
    }

    // Remove existing tile layer
    if (this._tileLayer) {
      this._tileLayer.remove();
    }

    // Create new tile layer with resolved configuration
    this._tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
      subdomains: tileConfig.subdomains,
    }).addTo(this._map);

    // Store current config for change detection
    this._currentTileConfig = tileConfig;
  }

  /**
   * Sets up a ResizeObserver to handle container size changes.
   * This ensures the map properly fills its container even after resizes.
   */
  private _setupResizeObserver(container: HTMLElement): void {
    // Clean up any existing observer
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }

    this._resizeObserver = new ResizeObserver(() => {
      // Debounce resize events
      if (this._resizeDebounce) {
        window.clearTimeout(this._resizeDebounce);
      }
      this._resizeDebounce = window.setTimeout(() => {
        this._handleResize();
      }, 100);
    });

    this._resizeObserver.observe(container);
  }

  /**
   * Handles container resize events.
   * Invalidates the map size so Leaflet recalculates dimensions.
   */
  private _handleResize(): void {
    if (this._map) {
      // invalidateSize tells Leaflet to recalculate its size
      this._map.invalidateSize({ animate: false });
    }
  }

  /**
   * Cleans up map resources.
   * Called on disconnectedCallback to prevent memory leaks.
   */
  private _cleanup(): void {
    // Clear any pending resize debounce
    if (this._resizeDebounce) {
      window.clearTimeout(this._resizeDebounce);
      this._resizeDebounce = undefined;
    }

    // Disconnect ResizeObserver
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = undefined;
    }

    // Remove tile layer
    if (this._tileLayer) {
      this._tileLayer.remove();
      this._tileLayer = undefined;
    }

    // Destroy marker manager
    if (this._markerManager) {
      this._markerManager.destroy();
      this._markerManager = undefined;
    }

    // Destroy zone manager
    if (this._zoneManager) {
      this._zoneManager.destroy();
      this._zoneManager = undefined;
    }

    // Destroy bounds manager
    if (this._boundsManager) {
      this._boundsManager.destroy();
      this._boundsManager = undefined;
    }

    // Destroy history manager
    if (this._historyManager) {
      this._historyManager.destroy();
      this._historyManager = undefined;
    }

    // Destroy incident manager
    if (this._incidentManager) {
      this._incidentManager.destroy();
      this._incidentManager = undefined;
    }

    // Clear tile config cache
    this._currentTileConfig = undefined;

    // Remove zoom event listener
    if (this._map && this._boundZoomHandler) {
      this._map.off("zoomend", this._boundZoomHandler);
      this._boundZoomHandler = undefined;
    }

    // Remove and cleanup map
    if (this._map) {
      this._map.remove();
      this._map = undefined;
    }
  }

  /**
   * Retries loading the map after an error.
   */
  private async _retryLoad(): Promise<void> {
    await this._initializeMap();
  }

  /**
   * Updates marker visibility based on current zoom level.
   * Called on zoom changes when marker_min_zoom is configured.
   */
  private _updateMarkerZoomVisibility(): void {
    if (!this._map || !this._markerManager || !this._config) {
      return;
    }

    const minZoom = this._config.marker_min_zoom;
    if (minZoom === undefined) {
      return;
    }

    const currentZoom = this._map.getZoom();
    const shouldShow = currentZoom >= minZoom;

    this._markerManager.setZoomVisibility(shouldShow);

    // Announce visibility change to screen readers
    if (shouldShow !== this._previousMarkersVisible) {
      this._previousMarkersVisible = shouldShow;
      const message = shouldShow
        ? "Entity markers now visible"
        : "Entity markers hidden at current zoom level";
      this._announceChange(message);
    }
  }

  /**
   * Announces a change to screen readers via the live region.
   * Uses requestAnimationFrame to ensure the announcement is processed.
   */
  private _announceChange(message: string): void {
    if (!this._liveRegion) {
      this._liveRegion = this.shadowRoot?.getElementById("accessibility-live-region") as HTMLElement;
    }

    if (!this._liveRegion || !message) return;

    // Clear and reset to trigger announcement
    this._liveRegion.textContent = "";
    requestAnimationFrame(() => {
      if (this._liveRegion) {
        this._liveRegion.textContent = message;
      }
    });
  }

  /**
   * Updates map data when entity states change.
   * Renders zones, entity markers, history trails, and incident polygons.
   */
  private _updateMapData(): void {
    if (!this._map || !this.hass || !this._config) {
      return;
    }

    // Update zones (rendered first, below markers)
    if (this._zoneManager) {
      this._zoneManager.updateConfig(this._config);
      const zones = getAllZones(this.hass);
      console.log("ABC Emergency Map: Found zones:", zones.length, zones.map(z => z.entityId));
      this._zoneManager.updateZones(zones);
    }

    // Update entity markers (includes both static entities and geo_location_sources)
    const allEntities = this._markerManager
      ? getAllEntities(this.hass, this._config)
      : [];
    console.log("ABC Emergency Map: Found entities:", allEntities.length, allEntities.map(e => e.entityId));

    // Determine if we should hide markers for polygon entities
    const hideMarkersForPolygons = this._config.hide_markers_for_polygons ??
      DEFAULT_HIDE_MARKERS_FOR_POLYGONS;
    const polygonThreshold = this._config.marker_polygon_threshold;

    // Filter out entities that have polygon/multipolygon data (if configured)
    // Point-only geometry should always render as markers since they have no polygon bounds
    const entitiesForMarkers = hideMarkersForPolygons
      ? allEntities.filter(e => {
          const entity = this.hass.states[e.entityId];
          if (!entity) return true; // Keep if not found (shouldn't happen)

          // Check if entity has geometry data
          const geojson = entity.attributes.geojson || entity.attributes.geometry;
          if (!geojson) return true; // No geometry = render as marker

          // Check geometry type - only filter out actual polygon types
          // Point geometry should render as a marker, not as a bare GeoJSON point
          const geometryType = (geojson as { type?: string }).type ||
            (entity.attributes.geometry_type as string);

          if (isPolygonGeometryType(geometryType)) {
            // If polygon threshold is configured, check polygon size
            if (polygonThreshold !== undefined) {
              const extent = polygonExtentCache.getExtent(e.entityId, geojson as GeoJSON.GeoJSON);
              // Large polygons (>= threshold) get markers, small ones don't
              if (extent >= polygonThreshold) {
                console.log("ABC Emergency Map: Large polygon, showing marker:", e.entityId, "extent:", Math.round(extent), "m");
                return true; // Show marker for large polygon
              }
              console.log("ABC Emergency Map: Small polygon, hiding marker:", e.entityId, "extent:", Math.round(extent), "m, threshold:", polygonThreshold, "m");
              return false; // Hide marker for small polygon
            }

            console.log("ABC Emergency Map: Skipping marker for polygon entity:", e.entityId, "type:", geometryType);
            return false; // Filter out - will be rendered as polygon
          }

          // Point or unknown geometry type - render as marker
          if (geometryType === "Point") {
            console.log("ABC Emergency Map: Rendering Point geometry as marker:", e.entityId);
          }
          return true;
        })
      : allEntities; // Show all entities as markers when hide_markers_for_polygons is false

    // Clean up stale cache entries for entities that no longer exist
    if (polygonThreshold !== undefined) {
      const activeEntityIds = new Set(allEntities.map(e => e.entityId));
      polygonExtentCache.cleanup(activeEntityIds);
    }

    if (this._markerManager) {
      this._markerManager.updateMarkers(entitiesForMarkers);
      // Apply zoom-based visibility to newly created markers
      this._updateMarkerZoomVisibility();

      // Announce marker count changes to screen readers
      const newCount = this._markerManager.markerCount;
      if (newCount !== this._previousMarkerCount) {
        this._previousMarkerCount = newCount;
        if (newCount > 0) {
          const plural = newCount === 1 ? "marker" : "markers";
          this._announceChange(`${newCount} entity ${plural} displayed`);
        }
      }
    }

    // Update history trails (async, will render when data arrives)
    // Only track history for non-polygon entities (markers)
    if (this._historyManager) {
      this._historyManager.updateConfig(this._config);
      const entityIds = entitiesForMarkers.map((e) => e.entityId);
      // Fire and forget - trails will update asynchronously
      this._historyManager.updateTrails(this.hass, entityIds);
    }

    // Update polygons for entities that have GeoJSON data
    if (this._incidentManager && this._config.show_warning_levels !== false) {
      this._incidentManager.updateConfig(this._config);
      // Pass all entities - polygon manager will filter to only those with GeoJSON
      const entityIds = allEntities.map(e => e.entityId);
      this._incidentManager.updatePolygonsForEntities(this.hass, entityIds);
    }

    // Update bounds manager config and fit to all positions
    if (this._boundsManager) {
      this._boundsManager.updateConfig(this._config);

      // Collect all positions from markers and zones
      const positions: [number, number][] = [];

      if (this._markerManager) {
        positions.push(...this._markerManager.getMarkerPositions());
      }

      if (this._zoneManager) {
        positions.push(...this._zoneManager.getZonePositions());
      }

      // Get polygon bounds separately - these are actual bounds, not centroids
      const polygonBounds = this._incidentManager?.getPolygonBounds();

      // Note: History trail positions are not included in bounds calculation
      // to avoid sudden map jumps when history loads

      console.log("ABC Emergency Map: Total positions for bounds:", positions.length, positions);
      console.log("ABC Emergency Map: Polygon bounds:", polygonBounds?.toBBoxString());

      // Fit bounds to show all positions, including polygon bounds
      this._boundsManager.fitToPositionsAndBounds(positions, polygonBounds);
    }
  }


  /**
   * Returns the card size for Home Assistant layout calculations.
   */
  public getCardSize(): number {
    return 5;
  }

  /**
   * Returns the configuration element for the card editor.
   */
  static getConfigElement(): HTMLElement {
    return document.createElement("abc-emergency-map-card-editor");
  }

  /**
   * Returns stub configuration for new card instances.
   */
  static getStubConfig(): ABCEmergencyMapCardConfig {
    return {
      type: "custom:abc-emergency-map-card",
      title: "ABC Emergency Map",
    };
  }
}

// Register the card with the custom elements registry
declare global {
  interface HTMLElementTagNameMap {
    "abc-emergency-map-card": ABCEmergencyMapCard;
  }
}

// Card registration for HACS and Home Assistant
(window as unknown as Record<string, unknown[]>).customCards =
  (window as unknown as Record<string, unknown[]>).customCards || [];
(window as unknown as Record<string, unknown[]>).customCards.push({
  type: "abc-emergency-map-card",
  name: "ABC Emergency Map Card",
  description:
    "Display ABC Emergency incident polygons on a Leaflet map with Australian Warning System colors",
  preview: true,
});
