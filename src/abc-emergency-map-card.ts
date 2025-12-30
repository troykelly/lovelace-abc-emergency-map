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
import type { ABCEmergencyMapCardConfig } from "./types";

// Leaflet will be loaded dynamically
declare const L: typeof import("leaflet");

@customElement("abc-emergency-map-card")
export class ABCEmergencyMapCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config?: ABCEmergencyMapCardConfig;
  @state() private _map?: L.Map;

  static styles = styles;

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

  protected render(): TemplateResult {
    if (!this._config) {
      return html`<ha-card>Invalid configuration</ha-card>`;
    }

    return html`
      <ha-card>
        ${this._config.title
          ? html`<div class="card-header">${this._config.title}</div>`
          : ""}
        <div class="map-container" id="map"></div>
      </ha-card>
    `;
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    this._initializeMap();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has("hass") && this._map) {
      this._updateMapData();
    }
  }

  private async _initializeMap(): Promise<void> {
    // TODO: Initialize Leaflet map
    // TODO: Load geo_location entities
    // TODO: Render polygons with alert-level colors
    console.log("ABC Emergency Map Card initialized");
  }

  private _updateMapData(): void {
    // TODO: Update map markers and polygons when entity states change
  }

  public getCardSize(): number {
    return 5;
  }

  static getConfigElement(): HTMLElement {
    // TODO: Return card editor element
    return document.createElement("abc-emergency-map-card-editor");
  }

  static getStubConfig(): ABCEmergencyMapCardConfig {
    return {
      type: "custom:abc-emergency-map-card",
      title: "ABC Emergency Map",
    };
  }
}

// Register the card
declare global {
  interface HTMLElementTagNameMap {
    "abc-emergency-map-card": ABCEmergencyMapCard;
  }
}

// Card registration for HACS
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "abc-emergency-map-card",
  name: "ABC Emergency Map Card",
  description:
    "Display ABC Emergency incident polygons on a Leaflet map with Australian Warning System colors",
  preview: true,
});
