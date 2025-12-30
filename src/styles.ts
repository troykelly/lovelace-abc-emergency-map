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
`;
