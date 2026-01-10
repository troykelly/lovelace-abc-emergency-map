/**
 * Card Editor for ABC Emergency Map Card
 *
 * Provides a visual configuration interface for the card in the Lovelace UI.
 */

import { LitElement, html, css, TemplateResult, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant } from "custom-card-helpers";
import type {
  ABCEmergencyMapCardConfig,
  TileProviderId,
  DarkModeSetting,
  AlertColorPreset,
  AlertLevel,
  ConfigWarning,
} from "./types";
import { ALERT_COLOR_PRESETS, ALERT_COLORS, validateVisibilityConfig } from "./types";

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

/** Alert color preset options */
const ALERT_COLOR_PRESET_OPTIONS: { value: AlertColorPreset | "custom"; label: string }[] = [
  { value: "australian", label: "Australian Warning System (Default)" },
  { value: "us_nws", label: "US National Weather Service" },
  { value: "eu_meteo", label: "European Meteorological" },
  { value: "high_contrast", label: "High Contrast (Accessibility)" },
  { value: "custom", label: "Custom Colors" },
];

/** Alert level labels for the color editor */
const ALERT_LEVEL_LABELS: { level: AlertLevel; label: string }[] = [
  { level: "extreme", label: "Emergency Warning" },
  { level: "severe", label: "Watch and Act" },
  { level: "moderate", label: "Advice" },
  { level: "minor", label: "Information" },
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

    .source-help {
      padding: 12px;
      background: var(--card-background-color, #f5f5f5);
      border-radius: 4px;
      margin-top: 8px;
    }

    .help-text {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-bottom: 8px;
    }

    .help-list {
      margin: 0;
      padding-left: 20px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .help-list li {
      margin-bottom: 4px;
    }

    .help-list code {
      background: var(--code-background-color, rgba(0,0,0,0.1));
      padding: 2px 4px;
      border-radius: 2px;
      font-family: monospace;
      font-size: 11px;
    }

    .color-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .color-swatch {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      border: 1px solid var(--divider-color);
      flex-shrink: 0;
    }

    .color-label {
      flex: 1;
      font-size: 14px;
    }

    .color-input {
      width: 80px;
      padding: 4px 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
    }

    .color-input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .color-picker-wrapper {
      position: relative;
    }

    .color-picker {
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .color-preview-row {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      padding: 8px;
      background: var(--card-background-color);
      border-radius: 4px;
    }

    .color-preview-swatch {
      flex: 1;
      height: 24px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 500;
    }

    .config-warning {
      padding: 12px;
      margin: 8px 0;
      border-radius: 4px;
      font-size: 13px;
    }

    .config-warning.severity-warning {
      background-color: rgba(255, 152, 0, 0.1);
      border-left: 4px solid #ff9800;
    }

    .config-warning.severity-info {
      background-color: rgba(33, 150, 243, 0.1);
      border-left: 4px solid #2196f3;
    }

    .config-warning-message {
      color: var(--primary-text-color);
      margin-bottom: 4px;
    }

    .config-warning-suggestion {
      color: var(--secondary-text-color);
      font-size: 12px;
    }

    .input-header {
      margin-bottom: 8px;
    }

    .input-label {
      font-size: 14px;
    }

    .input-with-unit {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .input-with-unit ha-textfield {
      flex: 1;
    }

    .unit-label {
      font-size: 14px;
      color: var(--secondary-text-color);
      min-width: 50px;
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
            "Hide Markers for Polygons",
            "Don't show point markers for incidents with polygon boundaries",
            "hide_markers_for_polygons",
            this._config.hide_markers_for_polygons ?? true
          )}

          ${this._renderOptionalSlider(
            "Marker Minimum Zoom",
            "Only show markers when zoomed in (0 = always visible)",
            "marker_min_zoom",
            this._config.marker_min_zoom,
            0,
            20
          )}

          ${this._renderNumberInputWithUnit(
            "Polygon Size Threshold",
            "Show markers for polygons larger than this (0 = disabled)",
            "marker_polygon_threshold",
            this._config.marker_polygon_threshold,
            "meters",
            0,
            100000,
            500
          )}

          ${this._renderConfigWarnings()}

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

        <!-- Alert Colors -->
        <div class="section">
          <div class="section-title">Alert Colors</div>

          <div class="form-row">
            <ha-select
              label="Color Preset"
              .value=${this._getEffectivePreset()}
              @selected=${this._alertColorPresetChanged}
              @closed=${(e: Event) => e.stopPropagation()}
            >
              ${ALERT_COLOR_PRESET_OPTIONS.map(
                (option) => html`
                  <mwc-list-item .value=${option.value}>
                    ${option.label}
                  </mwc-list-item>
                `
              )}
            </ha-select>
          </div>

          ${this._getEffectivePreset() === "custom" ? this._renderCustomColors() : nothing}

          <!-- Color Preview -->
          <div class="color-preview-row">
            ${ALERT_LEVEL_LABELS.map(({ level, label }) => {
              const color = this._getEffectiveColor(level);
              const textColor = this._getContrastColor(color);
              return html`
                <div
                  class="color-preview-swatch"
                  style="background: ${color}; color: ${textColor};"
                  title="${label}"
                >
                  ${level.charAt(0).toUpperCase()}
                </div>
              `;
            })}
          </div>
        </div>

        <!-- Dynamic Entity Sources -->
        <div class="section">
          <div class="section-title">Dynamic Entity Sources (ABC Emergency)</div>

          <div class="form-row">
            <ha-textfield
              label="Geo-Location Sources (comma-separated)"
              .value=${(this._config.geo_location_sources ?? []).join(", ")}
              @input=${this._geoLocationSourcesChanged}
              placeholder="sensor.abc_emergency_treehouse_incidents_total"
              helper="Sensors exposing entity_ids attribute for dynamic geo_location discovery"
            ></ha-textfield>
          </div>

          <div class="source-help">
            <div class="help-text">
              Configure sensors or binary_sensors that expose lists of geo_location entities:
            </div>
            <ul class="help-list">
              <li><code>sensor.*_incidents_total</code> - All incidents</li>
              <li><code>sensor.*_bushfires</code> - Bushfire incidents</li>
              <li><code>sensor.*_watch_and_acts</code> - Watch and Act level</li>
              <li><code>binary_sensor.*_inside_polygon</code> - Containing incidents</li>
            </ul>
          </div>
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
   * Renders an optional slider where 0 means "disabled/not set".
   * When value is 0 or undefined, the feature is disabled.
   */
  private _renderOptionalSlider(
    label: string,
    description: string,
    configKey: string,
    value: number | undefined,
    min: number,
    max: number
  ): TemplateResult {
    const displayValue = value ?? 0;
    const displayText = displayValue === 0 ? "Always" : String(displayValue);

    return html`
      <div class="slider-row">
        <div class="slider-header">
          <div>
            <span class="slider-label">${label}</span>
            <div class="toggle-description">${description}</div>
          </div>
          <span class="slider-value">${displayText}</span>
        </div>
        <ha-slider
          .value=${displayValue}
          .min=${min}
          .max=${max}
          .step=${1}
          pin
          @change=${(e: Event) => this._optionalSliderChanged(e, configKey)}
        ></ha-slider>
      </div>
    `;
  }

  /**
   * Renders configuration warnings for conflicting visibility options.
   */
  private _renderConfigWarnings(): TemplateResult | typeof nothing {
    if (!this._config) return nothing;

    const warnings = validateVisibilityConfig(this._config);
    if (warnings.length === 0) return nothing;

    return html`
      ${warnings.map(
        (warning: ConfigWarning) => html`
          <div class="config-warning severity-${warning.severity}">
            <div class="config-warning-message">${warning.message}</div>
            ${warning.suggestion
              ? html`<div class="config-warning-suggestion">
                  ${warning.suggestion}
                </div>`
              : nothing}
          </div>
        `
      )}
    `;
  }

  /**
   * Handles optional slider changes.
   * Value of 0 means undefined (disabled).
   */
  private _optionalSliderChanged(ev: Event, configKey: string): void {
    const target = ev.target as HTMLInputElement;
    const numValue = Number(target.value);
    // 0 means "always visible" = undefined in config
    this._updateConfig({ [configKey]: numValue === 0 ? undefined : numValue });
  }

  /**
   * Renders a number input with unit label.
   * Empty or 0 value means the feature is disabled.
   */
  private _renderNumberInputWithUnit(
    label: string,
    description: string,
    configKey: string,
    value: number | undefined,
    unit: string,
    min: number,
    max: number,
    step: number = 100
  ): TemplateResult {
    const displayValue = value ?? "";

    return html`
      <div class="form-row">
        <div class="input-header">
          <span class="input-label">${label}</span>
          <div class="toggle-description">${description}</div>
        </div>
        <div class="input-with-unit">
          <ha-textfield
            type="number"
            .value=${String(displayValue)}
            .min=${String(min)}
            .max=${String(max)}
            .step=${String(step)}
            @change=${(e: Event) => this._numberInputChanged(e, configKey)}
            placeholder="Disabled"
          ></ha-textfield>
          <span class="unit-label">${unit}</span>
        </div>
      </div>
    `;
  }

  /**
   * Handles number input changes.
   * Empty or 0 means undefined (disabled).
   */
  private _numberInputChanged(ev: Event, configKey: string): void {
    const target = ev.target as HTMLInputElement;
    const strValue = target.value.trim();
    if (strValue === "" || strValue === "0") {
      this._updateConfig({ [configKey]: undefined });
    } else {
      const numValue = Number(strValue);
      if (!isNaN(numValue) && numValue > 0) {
        this._updateConfig({ [configKey]: numValue });
      }
    }
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
   * Handles geo_location_sources input changes.
   * Parses comma-separated entity IDs into an array.
   */
  private _geoLocationSourcesChanged(ev: Event): void {
    const target = ev.target as HTMLInputElement;
    const value = target.value.trim();

    if (!value) {
      this._updateConfig({ geo_location_sources: undefined });
      return;
    }

    // Parse comma-separated entity IDs, trim whitespace
    const sources = value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    this._updateConfig({
      geo_location_sources: sources.length > 0 ? sources : undefined,
    });
  }

  /**
   * Gets the effective preset value for the dropdown.
   * Returns "custom" if custom colors are defined, otherwise returns the preset or "australian".
   */
  private _getEffectivePreset(): AlertColorPreset | "custom" {
    // If custom colors are defined, show "custom" in dropdown
    if (this._config?.alert_colors && Object.keys(this._config.alert_colors).length > 0) {
      return "custom";
    }
    return this._config?.alert_color_preset || "australian";
  }

  /**
   * Gets the effective color for a given alert level based on config.
   */
  private _getEffectiveColor(level: AlertLevel): string {
    // Check for custom color first
    if (this._config?.alert_colors?.[level]) {
      return this._config.alert_colors[level]!;
    }
    // Use preset colors
    const preset = this._config?.alert_color_preset || "australian";
    return ALERT_COLOR_PRESETS[preset]?.[level] || ALERT_COLORS[level];
  }

  /**
   * Returns contrasting text color (black or white) based on background luminance.
   */
  private _getContrastColor(hexColor: string): string {
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#ffffff";
  }

  /**
   * Handles alert color preset selection.
   */
  private _alertColorPresetChanged(ev: CustomEvent): void {
    const target = ev.target as HTMLSelectElement;
    const value = target.value as AlertColorPreset | "custom";

    if (value === "custom") {
      // When switching to custom, initialize with current effective colors
      const customColors: Partial<Record<AlertLevel, string>> = {};
      for (const { level } of ALERT_LEVEL_LABELS) {
        customColors[level] = this._getEffectiveColor(level);
      }
      this._updateConfig({
        alert_color_preset: undefined,
        alert_colors: customColors,
      });
    } else {
      // When selecting a preset, clear custom colors
      this._updateConfig({
        alert_color_preset: value,
        alert_colors: undefined,
      });
    }
  }

  /**
   * Renders custom color inputs for each alert level.
   */
  private _renderCustomColors(): TemplateResult {
    return html`
      <div class="form-row">
        ${ALERT_LEVEL_LABELS.map(({ level, label }) => {
          const color = this._config?.alert_colors?.[level] || ALERT_COLORS[level];
          return html`
            <div class="color-row">
              <input
                type="color"
                class="color-picker"
                .value=${color}
                @input=${(e: Event) => this._customColorChanged(e, level)}
              />
              <span class="color-label">${label}</span>
              <input
                type="text"
                class="color-input"
                .value=${color}
                @input=${(e: Event) => this._customColorTextChanged(e, level)}
                placeholder="#000000"
              />
            </div>
          `;
        })}
      </div>
    `;
  }

  /**
   * Handles color picker changes.
   */
  private _customColorChanged(ev: Event, level: AlertLevel): void {
    const target = ev.target as HTMLInputElement;
    const color = target.value;
    this._updateAlertColor(level, color);
  }

  /**
   * Handles color text input changes.
   */
  private _customColorTextChanged(ev: Event, level: AlertLevel): void {
    const target = ev.target as HTMLInputElement;
    const color = target.value.trim();
    // Only update if it looks like a valid hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
      this._updateAlertColor(level, color);
    }
  }

  /**
   * Updates a single alert color in the config.
   */
  private _updateAlertColor(level: AlertLevel, color: string): void {
    const currentColors = this._config?.alert_colors || {};
    this._updateConfig({
      alert_colors: {
        ...currentColors,
        [level]: color,
      },
    });
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
