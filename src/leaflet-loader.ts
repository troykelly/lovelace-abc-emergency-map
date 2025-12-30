/**
 * Leaflet Dynamic Loader
 *
 * Dynamically loads Leaflet.js and CSS from CDN with SRI verification.
 * Uses a singleton pattern to prevent multiple loads when several cards
 * are on the same page.
 */

// Note: The global L declaration is in leaflet-types.d.ts

/** Leaflet version to load from CDN */
const LEAFLET_VERSION = "1.9.4";

/** CDN URLs for Leaflet assets */
const LEAFLET_CSS_URL = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
const LEAFLET_JS_URL = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;

/**
 * SRI (Subresource Integrity) hashes for Leaflet 1.9.4
 * These ensure the loaded files haven't been tampered with.
 */
const LEAFLET_CSS_INTEGRITY =
  "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
const LEAFLET_JS_INTEGRITY =
  "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";

/** Loading state tracking */
let leafletLoadPromise: Promise<typeof L> | null = null;
let leafletLoaded = false;

/**
 * Injects a CSS stylesheet into the document head.
 *
 * @param url - The URL of the stylesheet
 * @param integrity - SRI hash for verification
 * @returns Promise that resolves when CSS is loaded
 */
function loadCSS(url: string, integrity: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    const existingLink = document.querySelector(`link[href="${url}"]`);
    if (existingLink) {
      resolve();
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.integrity = integrity;
    link.crossOrigin = "anonymous";

    link.onload = () => resolve();
    link.onerror = () =>
      reject(new Error(`Failed to load Leaflet CSS from ${url}`));

    document.head.appendChild(link);
  });
}

/**
 * Injects a JavaScript file into the document.
 *
 * @param url - The URL of the script
 * @param integrity - SRI hash for verification
 * @returns Promise that resolves when script is loaded
 */
function loadScript(url: string, integrity: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if Leaflet is already available
    if (typeof window !== "undefined" && "L" in window) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = url;
    script.integrity = integrity;
    script.crossOrigin = "anonymous";
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error(`Failed to load Leaflet JS from ${url}`));

    document.head.appendChild(script);
  });
}

/**
 * Loads Leaflet library from CDN.
 *
 * Uses a singleton pattern - multiple calls will return the same promise,
 * ensuring Leaflet is only loaded once even with multiple card instances.
 *
 * @returns Promise that resolves with the Leaflet L object
 * @throws Error if Leaflet fails to load
 */
export async function loadLeaflet(): Promise<typeof L> {
  // Return cached promise if already loading/loaded
  if (leafletLoadPromise) {
    return leafletLoadPromise;
  }

  // Return immediately if already loaded
  if (leafletLoaded && typeof L !== "undefined") {
    return L;
  }

  // Create loading promise
  leafletLoadPromise = (async () => {
    try {
      // Load CSS first (map rendering depends on styles)
      await loadCSS(LEAFLET_CSS_URL, LEAFLET_CSS_INTEGRITY);

      // Then load JavaScript
      await loadScript(LEAFLET_JS_URL, LEAFLET_JS_INTEGRITY);

      // Verify Leaflet loaded correctly
      if (typeof L === "undefined") {
        throw new Error("Leaflet loaded but L is undefined");
      }

      leafletLoaded = true;
      return L;
    } catch (error) {
      // Reset promise on failure to allow retry
      leafletLoadPromise = null;
      throw error;
    }
  })();

  return leafletLoadPromise;
}

/**
 * Checks if Leaflet is currently loaded.
 *
 * @returns true if Leaflet is available
 */
export function isLeafletLoaded(): boolean {
  return leafletLoaded && typeof L !== "undefined";
}
