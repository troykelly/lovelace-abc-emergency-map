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
    /* Theme-aware CSS custom properties for consistent styling */
    --map-shadow-color: rgba(0, 0, 0, 0.15);
    --map-border-color: var(--divider-color, rgba(0, 0, 0, 0.12));
  }

  /* Dark theme adjustments */
  ha-card.theme-dark {
    --map-shadow-color: rgba(0, 0, 0, 0.4);
    --map-border-color: var(--divider-color, rgba(255, 255, 255, 0.12));
  }

  /* Light theme explicit styling (for clarity) */
  ha-card.theme-light {
    --map-shadow-color: rgba(0, 0, 0, 0.15);
    --map-border-color: var(--divider-color, rgba(0, 0, 0, 0.12));
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 16px 0;
    font-size: 1.2em;
    font-weight: 500;
  }

  .header-title {
    flex: 1;
  }

  /* Incident count badge */
  .incident-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 16px;
    color: #ffffff;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
  }

  .incident-badge ha-icon {
    --mdc-icon-size: 16px;
  }

  .badge-count {
    font-weight: 700;
  }

  .badge-new {
    font-size: 11px;
    font-weight: 400;
    opacity: 0.9;
    margin-left: 4px;
    padding-left: 6px;
    border-left: 1px solid rgba(255, 255, 255, 0.3);
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

  /* Entity marker styles */
  .entity-marker {
    background: transparent;
    border: none;
  }

  .entity-marker > div {
    transition: transform 0.2s ease;
  }

  .entity-marker:hover > div {
    transform: scale(1.1);
  }

  .entity-popup {
    font-size: 13px;
    line-height: 1.4;
  }

  .entity-popup strong {
    color: var(--primary-text-color, #333);
  }

  .entity-popup small {
    color: var(--secondary-text-color, #666);
  }

  /* Leaflet popup styling to match HA theme */
  .leaflet-popup-content-wrapper {
    background: var(--card-background-color, white);
    color: var(--primary-text-color, #333);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .leaflet-popup-tip {
    background: var(--card-background-color, white);
  }

  /* Leaflet tooltip styling */
  .leaflet-tooltip {
    background: var(--card-background-color, white);
    color: var(--primary-text-color, #333);
    border: none;
    border-radius: 4px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    padding: 4px 8px;
    font-size: 12px;
  }

  .leaflet-tooltip-top:before {
    border-top-color: var(--card-background-color, white);
  }

  /* Zone popup styles */
  .zone-popup {
    font-size: 13px;
    line-height: 1.4;
  }

  .zone-popup strong {
    color: var(--primary-text-color, #333);
  }

  .zone-popup small {
    color: var(--secondary-text-color, #666);
  }

  .zone-popup em {
    color: var(--secondary-text-color, #888);
    font-style: italic;
  }

  /* Fit to entities control button */
  .fit-control {
    margin-top: 10px;
  }

  .fit-control-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background: var(--card-background-color, white) !important;
    color: var(--primary-text-color, #333) !important;
    text-decoration: none;
    cursor: pointer;
  }

  .fit-control-button:hover {
    background: var(--secondary-background-color, #f5f5f5) !important;
  }

  .fit-control-button ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Incident popup styles */
  .incident-popup {
    font-size: 13px;
    line-height: 1.5;
    min-width: 180px;
    max-width: 300px;
  }

  .incident-popup-header {
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
  }

  .incident-popup-header strong {
    color: var(--primary-text-color, #333);
    font-size: 14px;
    font-weight: 600;
    word-wrap: break-word;
  }

  .incident-popup-body {
    color: var(--secondary-text-color, #666);
  }

  .incident-alert-badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .incident-popup-row {
    margin: 4px 0;
    font-size: 12px;
  }

  .incident-popup-label {
    color: var(--secondary-text-color, #888);
    margin-right: 4px;
  }

  .incident-popup-advice {
    margin: 8px 0;
    padding: 8px;
    background: var(--secondary-background-color, #f5f5f5);
    border-radius: 4px;
    font-size: 12px;
    line-height: 1.4;
    max-height: 100px;
    overflow-y: auto;
  }

  .incident-popup-link {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--divider-color, #e0e0e0);
  }

  .incident-popup-link a {
    color: var(--primary-color, #03a9f4);
    text-decoration: none;
    font-size: 12px;
    font-weight: 500;
  }

  .incident-popup-link a:hover {
    text-decoration: underline;
  }

  /* Responsive popup container */
  .incident-popup-container .leaflet-popup-content {
    margin: 12px;
  }

  .incident-popup-container .leaflet-popup-content-wrapper {
    padding: 0;
  }

  /* Incident animation keyframes */
  @keyframes incident-appear {
    0% {
      opacity: 0;
      filter: drop-shadow(0 0 0 transparent);
    }
    30% {
      opacity: 1;
      filter: drop-shadow(0 0 12px var(--incident-glow-color, rgba(255, 102, 0, 0.8)));
    }
    100% {
      opacity: 1;
      filter: drop-shadow(0 0 0 transparent);
    }
  }

  @keyframes incident-pulse {
    0%, 100% {
      filter: drop-shadow(0 0 0 transparent);
    }
    25% {
      filter: drop-shadow(0 0 8px var(--incident-glow-color, rgba(255, 102, 0, 0.8)));
    }
    50% {
      filter: drop-shadow(0 0 0 transparent);
    }
    75% {
      filter: drop-shadow(0 0 8px var(--incident-glow-color, rgba(255, 102, 0, 0.8)));
    }
  }

  @keyframes incident-glow-extreme {
    0%, 100% {
      filter: drop-shadow(0 0 4px rgba(204, 0, 0, 0.6));
    }
    50% {
      filter: drop-shadow(0 0 12px rgba(204, 0, 0, 0.9));
    }
  }

  /* Incident animation classes */
  .incident-layer-new {
    animation: incident-appear var(--incident-animation-duration, 2s) ease-out forwards;
  }

  .incident-layer-updated {
    animation: incident-pulse var(--incident-animation-duration, 2s) ease-in-out;
  }

  .incident-layer-extreme {
    animation: incident-glow-extreme 2s ease-in-out infinite;
  }

  /* Respect prefers-reduced-motion */
  @media (prefers-reduced-motion: reduce) {
    .incident-layer-new,
    .incident-layer-updated,
    .incident-layer-extreme {
      animation: none !important;
    }
  }

  /* Animation disabled via config */
  .animations-disabled .incident-layer-new,
  .animations-disabled .incident-layer-updated,
  .animations-disabled .incident-layer-extreme {
    animation: none !important;
  }
`;
