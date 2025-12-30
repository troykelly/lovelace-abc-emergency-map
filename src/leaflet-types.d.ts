/**
 * Type declarations for dynamically loaded Leaflet.
 *
 * Since we load Leaflet via CDN script injection rather than ES module import,
 * we need to declare the global L object that Leaflet creates on window.
 */

import type * as LeafletNamespace from "leaflet";

declare global {
  /**
   * The Leaflet library global object.
   * Available after loading via loadLeaflet() from leaflet-loader.ts
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const L: typeof LeafletNamespace;
}

export {};
