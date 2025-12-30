/**
 * Card Editor for ABC Emergency Map Card
 */

import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant } from "custom-card-helpers";
import type { ABCEmergencyMapCardConfig } from "./types";

@customElement("abc-emergency-map-card-editor")
export class ABCEmergencyMapCardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config?: ABCEmergencyMapCardConfig;

  static styles = css`
    .form-row {
      margin-bottom: 16px;
    }
    ha-textfield {
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
      <div class="form-row">
        <ha-textfield
          label="Title"
          .value=${this._config.title || ""}
          @input=${this._titleChanged}
        ></ha-textfield>
      </div>
      <!-- TODO: Add more configuration options -->
    `;
  }

  private _titleChanged(ev: Event): void {
    const target = ev.target as HTMLInputElement;
    this._fireConfigChanged({ ...this._config!, title: target.value });
  }

  private _fireConfigChanged(config: ABCEmergencyMapCardConfig): void {
    const event = new CustomEvent("config-changed", {
      detail: { config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}
