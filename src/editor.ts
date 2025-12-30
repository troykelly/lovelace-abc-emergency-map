/**
 * Card Editor for ABC Emergency Map Card
 *
 * Provides a visual configuration interface for the card in the Lovelace UI.
 */

import { LitElement, html, css, TemplateResult, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant } from "custom-card-helpers";
import type { ABCEmergencyMapCardConfig, TileProviderId, DarkModeSetting } from "./types";

/** Available tile provider options */
const TILE_PROVIDERS: { value: TileProviderId; label: string }[] = [
  { value: "osm", label: "OpenStreetMap" },
  { value: "cartodb", label: "CartoDB" },
  { value: "mapbox", label: "Mapbox (requires API key)" },
  { value: "custom", label: "Custom URL" },
];

/** Dark mode setting options */
const DARK_MODE_OPTIONS: { value: DarkModeSetting; label: string }[] = [
  { value: "auto", label: "Auto (from Home Assistant)" },
  { value: "light", label: "Always Light" },
  { value: "dark", label: "Always Dark" },
];

@customElement("abc-emergency-map-card-editor")
export class ABCEmergencyMapCardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config?: ABCEmergencyMapCardConfig;

  static styles = css`
    .editor-container {
      padding: 16px;
    }

    .section {
      margin-bottom: 24px;
    }

    .section-title {
      font-weight: 500;
      margin-bottom: 12px;
      color: var(--primary-text-color);
      border-bottom: 1px solid var(--divider-color);
      padding-bottom: 8px;
    }

    .form-row {
      margin-bottom: 16px;
    }

    .form-row-inline {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-row-inline > * {
      flex: 1;
    }

    ha-textfield,
    ha-select {
      width: 100%;
    }

    ha-entity-picker {
      width: 100%;
    }

    .toggle-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .toggle-label {
      font-size: 14px;
    }

    .toggle-description {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .slider-row {
      margin-bottom: 16px;
    }

    .slider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .slider-label {
      font-size: 14px;
    }

    .slider-value {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-color);
    }

    ha-slider {
      width: 100%;
    }
  `;

  public setConfig(config: ABCEmergencyMapCardConfig): void {
    this._config = config;
  }

  protected render(): TemplateResult {
    if (!this.hass || !this._config) {
      return html``;
    }

    return html`
      <div class="editor-container">
        <!-- Basic Settings -->
        <div class="section">
          <div class="section-title">Basic Settings</div>

          <div class="form-row">
            <ha-textfield
              label="Title"
              .value=${this._config.title || ""}
              @input=${this._valueChanged}
              .configKey=${"title"}
            ></ha-textfield>
          </div>

          <div class="form-row">
            <ha-entity-picker
              .hass=${this.hass}
              .value=${this._config.entity || ""}
              .label=${"Primary Entity (optional)"}
              .includeDomains=${["person", "device_tracker", "geo_location"]}
              @value-changed=${this._entityChanged}
              allow-custom-entity
            ></ha-entity-picker>
          </div>
        </div>

        <!-- Map Settings -->
        <div class="section">
          <div class="section-title">Map Settings</div>

          ${this._renderSlider(
            "Default Zoom",
            "default_zoom",
            this._config.default_zoom ?? 10,
            1,
            20
          )}

          <div class="form-row">
            <ha-select
              label="Tile Provider"
              .value=${this._config.tile_provider || "osm"}
              @selected=${this._tileProviderChanged}
              @closed=${(e: Event) => e.stopPropagation()}
            >
              ${TILE_PROVIDERS.map(
                (provider) => html`
                  <mwc-list-item .value=${provider.value}>
                    ${provider.label}
                  </mwc-list-item>
                `
              )}
            </ha-select>
          </div>

          ${this._config.tile_provider === "mapbox"
            ? html`
                <div class="form-row">
                  <ha-textfield
                    label="Mapbox API Key"
                    .value=${this._config.api_key || ""}
                    @input=${this._valueChanged}
                    .configKey=${"api_key"}
                    type="password"
                  ></ha-textfield>
                </div>
              `
            : nothing}

          ${this._config.tile_provider === "custom"
            ? html`
                <div class="form-row">
                  <ha-textfield
                    label="Custom Tile URL"
                    .value=${this._config.tile_url || ""}
                    @input=${this._valueChanged}
                    .configKey=${"tile_url"}
                    placeholder="https://{s}.tile.example.com/{z}/{x}/{y}.png"
                  ></ha-textfield>
                </div>
              `
            : nothing}

          <div class="form-row">
            <ha-select
              label="Theme Mode"
              .value=${this._normalizeDarkMode(this._config.dark_mode)}
              @selected=${this._darkModeChanged}
              @closed=${(e: Event) => e.stopPropagation()}
            >
              ${DARK_MODE_OPTIONS.map(
                (option) => html`
                  <mwc-list-item .value=${option.value}>
                    ${option.label}
                  </mwc-list-item>
                `
              )}
            </ha-select>
          </div>

          ${this._renderToggle(
            "Auto-fit Bounds",
            "Automatically zoom to show all entities",
            "auto_fit",
            this._config.auto_fit ?? true
          )}
        </div>

        <!-- Display Options -->
        <div class="section">
          <div class="section-title">Display Options</div>

          ${this._renderToggle(
            "Show Zones",
            "Display Home Assistant zones on map",
            "show_zones",
            this._config.show_zones ?? true
          )}

          ${this._renderToggle(
            "Show Warning Levels",
            "Display ABC Emergency incident polygons",
            "show_warning_levels",
            this._config.show_warning_levels ?? true
          )}

          ${this._renderToggle(
            "Show History Trails",
            "Display movement history for entities",
            "show_history",
            this._config.show_history ?? false
          )}

          ${this._config.show_history
            ? this._renderSlider(
                "History Hours",
                "hours_to_show",
                this._config.hours_to_show ?? 24,
                1,
                168
              )
            : nothing}

          ${this._renderToggle(
            "Show Badge",
            "Display incident count badge in header",
            "show_badge",
            this._config.show_badge ?? true
          )}
        </div>

        <!-- Animation Settings -->
        <div class="section">
          <div class="section-title">Animation Settings</div>

          ${this._renderToggle(
            "Enable Animations",
            "Pulse/glow effects for incidents",
            "animations_enabled",
            this._config.animations_enabled ?? true
          )}

          ${this._renderToggle(
            "Geometry Transitions",
            "Smooth polygon boundary transitions",
            "geometry_transitions",
            this._config.geometry_transitions ?? true
          )}

          ${this._config.geometry_transitions
            ? this._renderSlider(
                "Transition Duration (ms)",
                "transition_duration",
                this._config.transition_duration ?? 500,
                100,
                2000
              )
            : nothing}
        </div>
      </div>
    `;
  }

  /**
   * Renders a toggle switch row.
   */
  private _renderToggle(
    label: string,
    description: string,
    configKey: string,
    value: boolean
  ): TemplateResult {
    return html`
      <div class="toggle-row">
        <div>
          <div class="toggle-label">${label}</div>
          <div class="toggle-description">${description}</div>
        </div>
        <ha-switch
          .checked=${value}
          @change=${(e: Event) => this._toggleChanged(e, configKey)}
        ></ha-switch>
      </div>
    `;
  }

  /**
   * Renders a slider with value display.
   */
  private _renderSlider(
    label: string,
    configKey: string,
    value: number,
    min: number,
    max: number
  ): TemplateResult {
    return html`
      <div class="slider-row">
        <div class="slider-header">
          <span class="slider-label">${label}</span>
          <span class="slider-value">${value}</span>
        </div>
        <ha-slider
          .value=${value}
          .min=${min}
          .max=${max}
          .step=${1}
          pin
          @change=${(e: Event) => this._sliderChanged(e, configKey)}
        ></ha-slider>
      </div>
    `;
  }

  /**
   * Handles text input changes.
   */
  private _valueChanged(ev: Event): void {
    const target = ev.target as HTMLInputElement & { configKey: string };
    const configKey = target.configKey;
    const value = target.value;

    if (!configKey) return;

    this._updateConfig({ [configKey]: value || undefined });
  }

  /**
   * Handles entity picker changes.
   */
  private _entityChanged(ev: CustomEvent): void {
    const value = ev.detail.value;
    this._updateConfig({ entity: value || undefined });
  }

  /**
   * Handles tile provider selection.
   */
  private _tileProviderChanged(ev: CustomEvent): void {
    const target = ev.target as HTMLSelectElement;
    const value = target.value as TileProviderId;
    this._updateConfig({ tile_provider: value });
  }

  /**
   * Normalizes dark mode value for the dropdown.
   * Converts legacy boolean values to string format.
   */
  private _normalizeDarkMode(value: DarkModeSetting | undefined): string {
    if (value === undefined) return "auto";
    if (typeof value === "boolean") {
      return value ? "dark" : "light";
    }
    return value;
  }

  /**
   * Handles dark mode dropdown selection.
   */
  private _darkModeChanged(ev: CustomEvent): void {
    const target = ev.target as HTMLSelectElement;
    const value = target.value as DarkModeSetting;
    this._updateConfig({ dark_mode: value });
  }

  /**
   * Handles toggle switch changes.
   */
  private _toggleChanged(ev: Event, configKey: string): void {
    const target = ev.target as HTMLInputElement;
    this._updateConfig({ [configKey]: target.checked });
  }

  /**
   * Handles slider changes.
   */
  private _sliderChanged(ev: Event, configKey: string): void {
    const target = ev.target as HTMLInputElement;
    this._updateConfig({ [configKey]: Number(target.value) });
  }

  /**
   * Updates the configuration and fires the config-changed event.
   */
  private _updateConfig(update: Partial<ABCEmergencyMapCardConfig>): void {
    if (!this._config) return;

    const newConfig = { ...this._config, ...update };
    this._config = newConfig;

    const event = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

// Register the editor element
declare global {
  interface HTMLElementTagNameMap {
    "abc-emergency-map-card-editor": ABCEmergencyMapCardEditor;
  }
}
