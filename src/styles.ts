/**
 * Styles for ABC Emergency Map Card
 */

import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  ha-card {
    height: 100%;
    overflow: hidden;
  }

  .card-header {
    padding: 16px 16px 0;
    font-size: 1.2em;
    font-weight: 500;
  }

  .map-wrapper {
    position: relative;
    width: 100%;
  }

  .map-container {
    height: 400px;
    width: 100%;
  }

  .leaflet-container {
    height: 100%;
    width: 100%;
    border-radius: 0 0 var(--ha-card-border-radius, 12px)
      var(--ha-card-border-radius, 12px);
  }

  /* Loading state */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    gap: 16px;
    color: var(--primary-text-color, #333);
  }

  .loading-text {
    font-size: 14px;
    opacity: 0.7;
  }

  /* Error state */
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    gap: 16px;
    color: var(--error-color, #cc0000);
    padding: 16px;
    text-align: center;
  }

  .error-container ha-icon {
    --mdc-icon-size: 48px;
  }

  .error-text {
    font-size: 14px;
    max-width: 300px;
  }

  /* Australian Warning System legend */
  .legend {
    background: var(--card-background-color, white);
    padding: 8px;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 4px 0;
    font-size: 12px;
  }

  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 2px;
  }

  /* Leaflet controls styling to match HA theme */
  .leaflet-control-zoom a {
    background: var(--card-background-color, white) !important;
    color: var(--primary-text-color, #333) !important;
  }

  .leaflet-control-zoom a:hover {
    background: var(--secondary-background-color, #f5f5f5) !important;
  }

  .leaflet-control-attribution {
    background: var(--card-background-color, rgba(255, 255, 255, 0.8)) !important;
    color: var(--secondary-text-color, #666) !important;
    font-size: 10px;
  }

  .leaflet-control-attribution a {
    color: var(--primary-color, #03a9f4) !important;
  }
`;
