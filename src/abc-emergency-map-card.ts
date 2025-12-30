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
  ALERT_COLORS,
  DEFAULT_SHOW_BADGE,
  DEFAULT_SHOW_NEW_INDICATOR,
  NEW_INCIDENT_THRESHOLD_MS,
} from "./types";
import { loadLeaflet } from "./leaflet-loader";
import { resolveTileProvider } from "./tile-providers";
import { EntityMarkerManager, getConfiguredEntities } from "./entity-markers";
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
  @state() private _incidentCount: number = 0;
  @state() private _newIncidentCount: number = 0;
  @state() private _highestSeverity: string = "minor";

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

  static styles = styles;

  /**
   * Sets the card configuration.
   * Called by Home Assistant when the card is configured.
   */
  public setConfig(config: ABCEmergencyMapCardConfig): void {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this._config = {
      title: "ABC Emergency Map",
      default_zoom: 10,
      hours_to_show: 24,
      dark_mode: false,
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

    const showBadge = this._config.show_badge ?? DEFAULT_SHOW_BADGE;
    const showNewIndicator = this._config.show_new_indicator ?? DEFAULT_SHOW_NEW_INDICATOR;

    return html`
      <ha-card>
        ${this._config.title || (showBadge && this._incidentCount > 0)
          ? html`
            <div class="card-header">
              <span class="header-title">${this._config.title || ""}</span>
              ${showBadge && this._incidentCount > 0
                ? this._renderBadge(showNewIndicator)
                : ""}
            </div>
          `
          : ""}
        <div class="map-wrapper">
          ${this._renderMapContent()}
        </div>
      </ha-card>
    `;
  }

  /**
   * Renders the incident count badge.
   */
  private _renderBadge(showNewIndicator: boolean): TemplateResult {
    const badgeColor = ALERT_COLORS[this._highestSeverity] || ALERT_COLORS.minor;
    const newBadge = showNewIndicator && this._newIncidentCount > 0
      ? html`<span class="badge-new">+${this._newIncidentCount} new</span>`
      : "";

    return html`
      <div class="incident-badge" style="background: ${badgeColor};">
        <ha-icon icon="mdi:alert"></ha-icon>
        <span class="badge-count">${this._incidentCount}</span>
        ${newBadge}
      </div>
    `;
  }

  /**
   * Renders the map content based on loading state.
   */
  private _renderMapContent(): TemplateResult {
    switch (this._loadingState) {
      case "loading":
        return html`
          <div class="loading-container">
            <ha-circular-progress indeterminate></ha-circular-progress>
            <div class="loading-text">Loading map...</div>
          </div>
        `;
      case "error":
        return html`
          <div class="error-container">
            <ha-icon icon="mdi:alert-circle"></ha-icon>
            <div class="error-text">
              ${this._errorMessage || "Failed to load map"}
            </div>
            <mwc-button @click=${this._retryLoad}>Retry</mwc-button>
          </div>
        `;
      case "ready":
      default:
        return html`<div class="map-container" id="map"></div>`;
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
      this._updateTileLayer();
      this._updateMapData();
    }
  }

  /**
   * Called when the element is removed from the DOM.
   * Cleans up map resources.
   */
  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this._cleanup();
  }

  /**
   * Called when the element is re-added to the DOM.
   * Re-initializes the map if needed.
   */
  public connectedCallback(): void {
    super.connectedCallback();

    // If we were previously initialized and got disconnected, re-initialize
    if (this._loadingState === "ready" && !this._map) {
      this._initializeMap();
    }
  }

  /**
   * Initializes the Leaflet map.
   * Loads Leaflet dynamically if not already loaded.
   */
  private async _initializeMap(): Promise<void> {
    this._loadingState = "loading";
    this._errorMessage = undefined;

    try {
      // Load Leaflet from CDN if needed
      await loadLeaflet();

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

      // Set up ResizeObserver for container size changes
      this._setupResizeObserver(mapContainer);

      // Trigger initial resize to ensure proper sizing
      this._handleResize();

      this._loadingState = "ready";

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
      return [this.hass.config.latitude, this.hass.config.longitude];
    }

    // Fall back to center of Australia
    return DEFAULT_CENTER;
  }

  /**
   * Determines if dark mode is active.
   * Checks card config first, then falls back to Home Assistant theme setting.
   */
  private _isDarkMode(): boolean {
    // Explicit config takes precedence
    if (this._config?.dark_mode !== undefined) {
      return this._config.dark_mode;
    }

    // Check Home Assistant theme setting (available in HA 2021.6+)
    // The themes object may have a darkMode property
    const themes = this.hass?.themes as unknown as
      | { darkMode?: boolean }
      | undefined;
    if (themes?.darkMode !== undefined) {
      return themes.darkMode;
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
      this._zoneManager.updateZones(zones);
    }

    // Update entity markers
    const entities = this._markerManager
      ? getConfiguredEntities(this.hass, this._config)
      : [];

    if (this._markerManager) {
      this._markerManager.updateMarkers(entities);
    }

    // Update history trails (async, will render when data arrives)
    if (this._historyManager) {
      this._historyManager.updateConfig(this._config);
      const entityIds = entities.map((e) => e.entityId);
      // Fire and forget - trails will update asynchronously
      this._historyManager.updateTrails(this.hass, entityIds);
    }

    // Update ABC Emergency incident polygons
    if (this._incidentManager) {
      this._incidentManager.updateConfig(this._config);
      this._incidentManager.updateIncidents(this.hass);

      // Update badge data
      this._updateBadgeData();
    }

    // Update bounds manager config and fit to all positions
    if (this._boundsManager) {
      this._boundsManager.updateConfig(this._config);

      // Collect all positions from markers, zones, and incidents
      const positions: [number, number][] = [];

      if (this._markerManager) {
        positions.push(...this._markerManager.getMarkerPositions());
      }

      if (this._zoneManager) {
        positions.push(...this._zoneManager.getZonePositions());
      }

      if (this._incidentManager) {
        positions.push(...this._incidentManager.getIncidentPositions());
      }

      // Note: History trail positions are not included in bounds calculation
      // to avoid sudden map jumps when history loads

      // Fit bounds to show all positions
      this._boundsManager.fitToPositions(positions);
    }
  }

  /**
   * Updates badge data based on current incidents.
   */
  private _updateBadgeData(): void {
    if (!this.hass) return;

    // Get all ABC Emergency entities
    const entityIds = Object.keys(this.hass.states).filter(
      (id) => id.startsWith("geo_location.abc_emergency")
    );

    let count = 0;
    let newCount = 0;
    let highestSeverity = "minor";
    const severityOrder = ["minor", "moderate", "severe", "extreme"];
    const now = Date.now();

    for (const entityId of entityIds) {
      const entity = this.hass.states[entityId];
      if (!entity) continue;

      count++;

      // Check if incident is "new" based on last_updated timestamp
      const lastUpdated = entity.last_updated || entity.last_changed;
      if (lastUpdated) {
        const updatedTime = new Date(lastUpdated).getTime();
        if (now - updatedTime < NEW_INCIDENT_THRESHOLD_MS) {
          newCount++;
        }
      }

      // Track highest severity
      const alertLevel = (entity.attributes.alert_level as string)?.toLowerCase() || "minor";
      const currentIndex = severityOrder.indexOf(highestSeverity);
      const newIndex = severityOrder.indexOf(alertLevel);
      if (newIndex > currentIndex) {
        highestSeverity = alertLevel;
      }
    }

    // Update state (triggers re-render if changed)
    this._incidentCount = count;
    this._newIncidentCount = newCount;
    this._highestSeverity = highestSeverity;
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
