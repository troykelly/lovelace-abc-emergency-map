/**
 * Leaflet Dynamic Loader
 *
 * Dynamically loads Leaflet.js and CSS with multiple fallback strategies.
 * Uses a singleton pattern to prevent multiple loads when several cards
 * are on the same page.
 *
 * IMPORTANT: Because our card uses Shadow DOM, we need to inject Leaflet CSS
 * into each shadow root, not just the document head.
 *
 * Loading Strategy (in order):
 * 1. Check if Leaflet is already available (window.L from another card)
 * 2. Try Home Assistant's local CSS (/static/images/leaflet/)
 * 3. Fall back to CDN (unpkg.com, then jsdelivr.net)
 *
 * Cast Compatibility:
 * - Uses HA's local assets first (no external dependencies)
 * - Falls back to CORS-friendly CDNs if needed
 * - Disables SRI in Cast environments
 * - Uses HA's marker image path for consistency
 */

import { isCastEnvironment } from "./cast-compat";

// Note: The global L declaration is in leaflet-types.d.ts

/** Leaflet version to load from CDN */
const LEAFLET_VERSION = "1.9.4";

/**
 * Home Assistant's local Leaflet assets
 * HA serves CSS and images locally. JS is bundled but DOES set window.L when loaded.
 */
const HA_LEAFLET_CSS_URL = "/static/images/leaflet/leaflet.css";
const HA_LEAFLET_IMAGES_PATH = "/static/images/leaflet/images/";

/** Maximum time to wait for HA's Leaflet to load (ms) */
const HA_LEAFLET_LOAD_TIMEOUT = 5000;

/** Polling interval when waiting for window.L (ms) */
const HA_LEAFLET_POLL_INTERVAL = 100;

/** Primary CDN URLs for Leaflet assets (unpkg.com has CORS support) */
const LEAFLET_CSS_URL = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
const LEAFLET_JS_URL = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;

/** Fallback CDN URLs (jsdelivr also has CORS support) */
const LEAFLET_CSS_URL_FALLBACK = `https://cdn.jsdelivr.net/npm/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
const LEAFLET_JS_URL_FALLBACK = `https://cdn.jsdelivr.net/npm/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;

/**
 * SRI (Subresource Integrity) hashes for Leaflet 1.9.4
 * These ensure the loaded files haven't been tampered with.
 * Note: SRI is disabled for Cast environments and local paths.
 */
const LEAFLET_CSS_INTEGRITY =
  "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
const LEAFLET_JS_INTEGRITY =
  "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";

/** Loading state tracking */
let leafletLoadPromise: Promise<typeof L> | null = null;
let leafletLoaded = false;

/** Cached Leaflet CSS content for shadow DOM injection */
let leafletCSSContent: string | null = null;

/** Track which source was used successfully */
let usedFallbackCDN = false;
let usedHALocalCSS = false;

/**
 * Fetches CSS content with multi-level fallback support.
 *
 * Strategy:
 * 1. Try HA's local CSS first (no external dependencies)
 * 2. Fall back to primary CDN (unpkg.com)
 * 3. Fall back to secondary CDN (jsdelivr.net)
 *
 * @returns Promise that resolves with the CSS content
 */
async function fetchCSSWithFallbacks(): Promise<string> {
  const inCast = isCastEnvironment();
  const errors: string[] = [];

  // Strategy 1: Try HA's local CSS first
  try {
    console.log(
      `ABC Emergency Map: Trying HA local CSS from ${HA_LEAFLET_CSS_URL}${inCast ? " (Cast mode)" : ""}`
    );
    const response = await fetch(HA_LEAFLET_CSS_URL);
    if (response.ok) {
      usedHALocalCSS = true;
      console.log("ABC Emergency Map: Using HA's local Leaflet CSS");
      return await response.text();
    }
    errors.push(`HA local: HTTP ${response.status}`);
  } catch (haError) {
    errors.push(`HA local: ${haError}`);
    console.log(
      "ABC Emergency Map: HA local CSS not available, trying CDN..."
    );
  }

  // Strategy 2: Try primary CDN
  try {
    console.log(`ABC Emergency Map: Trying primary CDN ${LEAFLET_CSS_URL}`);
    const response = await fetch(LEAFLET_CSS_URL);
    if (response.ok) {
      console.log("ABC Emergency Map: Using primary CDN CSS");
      return await response.text();
    }
    errors.push(`Primary CDN: HTTP ${response.status}`);
  } catch (primaryError) {
    errors.push(`Primary CDN: ${primaryError}`);
    console.warn(
      `ABC Emergency Map: Primary CDN failed, trying fallback...`
    );
  }

  // Strategy 3: Try fallback CDN
  try {
    console.log(`ABC Emergency Map: Trying fallback CDN ${LEAFLET_CSS_URL_FALLBACK}`);
    const response = await fetch(LEAFLET_CSS_URL_FALLBACK);
    if (response.ok) {
      usedFallbackCDN = true;
      console.log("ABC Emergency Map: Using fallback CDN CSS");
      return await response.text();
    }
    errors.push(`Fallback CDN: HTTP ${response.status}`);
  } catch (fallbackError) {
    errors.push(`Fallback CDN: ${fallbackError}`);
  }

  // All strategies failed
  const errorContext = inCast
    ? " This may be due to Cast environment network restrictions."
    : "";
  throw new Error(
    `Failed to fetch Leaflet CSS from all sources.${errorContext} Errors: ${errors.join("; ")}`
  );
}

/**
 * Fetches and caches the Leaflet CSS content.
 * This is used to inject CSS into shadow roots.
 *
 * Loading order:
 * 1. HA's local CSS (best for Cast)
 * 2. Primary CDN (unpkg.com)
 * 3. Fallback CDN (jsdelivr.net)
 *
 * @returns Promise that resolves with the CSS content
 */
async function fetchLeafletCSS(): Promise<string> {
  if (leafletCSSContent) {
    return leafletCSSContent;
  }

  leafletCSSContent = await fetchCSSWithFallbacks();
  return leafletCSSContent;
}

/**
 * Injects Leaflet CSS into a shadow root.
 *
 * Because Shadow DOM creates a style boundary, CSS loaded into document.head
 * doesn't apply inside shadow roots. This function injects Leaflet's CSS
 * directly into the shadow root so map styling works correctly.
 *
 * @param shadowRoot - The shadow root to inject CSS into
 * @returns Promise that resolves when CSS is injected
 */
export async function injectLeafletCSS(shadowRoot: ShadowRoot): Promise<void> {
  console.log("ABC Emergency Map: Injecting Leaflet CSS into shadow root");

  // Check if already injected
  const existingStyle = shadowRoot.querySelector('style[data-leaflet-css]');
  if (existingStyle) {
    console.log("ABC Emergency Map: Leaflet CSS already injected");
    return;
  }

  // Fetch CSS content if not cached
  const cssContent = await fetchLeafletCSS();
  console.log("ABC Emergency Map: Fetched Leaflet CSS, length:", cssContent.length);

  // Create and inject style element
  const styleElement = document.createElement("style");
  styleElement.setAttribute("data-leaflet-css", "true");
  styleElement.textContent = cssContent;

  // Insert at the beginning of shadow root so component styles can override
  shadowRoot.insertBefore(styleElement, shadowRoot.firstChild);
  console.log("ABC Emergency Map: Leaflet CSS injected successfully");
}

/**
 * Injects a CSS stylesheet into the document head.
 *
 * For Cast environments and local paths, SRI is disabled.
 *
 * @param url - The URL of the stylesheet
 * @param integrity - SRI hash for verification (may be skipped)
 * @param isLocal - Whether this is a local HA path
 * @returns Promise that resolves when CSS is loaded
 */
function loadCSS(url: string, integrity: string, isLocal: boolean = false): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded (check all possible URLs)
    const existingLink =
      document.querySelector(`link[href="${HA_LEAFLET_CSS_URL}"]`) ||
      document.querySelector(`link[href="${LEAFLET_CSS_URL}"]`) ||
      document.querySelector(`link[href="${LEAFLET_CSS_URL_FALLBACK}"]`);
    if (existingLink) {
      resolve();
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;

    // Only set crossOrigin for external URLs
    if (!isLocal) {
      link.crossOrigin = "anonymous";
    }

    // SRI only for external CDN URLs in non-Cast environments
    if (!isLocal && !isCastEnvironment() && integrity) {
      link.integrity = integrity;
    }

    link.onload = () => resolve();
    link.onerror = () =>
      reject(new Error(`Failed to load Leaflet CSS from ${url}`));

    document.head.appendChild(link);
  });
}

/**
 * Loads CSS with multi-level fallback support.
 *
 * Strategy:
 * 1. Try HA's local CSS (no external dependencies, best for Cast)
 * 2. Fall back to primary CDN (unpkg.com)
 * 3. Fall back to secondary CDN (jsdelivr.net)
 *
 * @returns Promise that resolves when CSS is loaded
 */
async function loadCSSWithFallback(): Promise<void> {
  const errors: string[] = [];

  // Strategy 1: Try HA's local CSS first
  try {
    await loadCSS(HA_LEAFLET_CSS_URL, "", true);
    usedHALocalCSS = true;
    console.log("ABC Emergency Map: Loaded HA's local Leaflet CSS");
    return;
  } catch (haError) {
    errors.push(`HA local: ${haError}`);
    console.log("ABC Emergency Map: HA local CSS link failed, trying CDN...");
  }

  // Strategy 2: Try primary CDN
  try {
    await loadCSS(LEAFLET_CSS_URL, LEAFLET_CSS_INTEGRITY);
    console.log("ABC Emergency Map: Loaded primary CDN CSS");
    return;
  } catch (primaryError) {
    errors.push(`Primary CDN: ${primaryError}`);
    console.warn("ABC Emergency Map: Primary CDN CSS failed, trying fallback...");
  }

  // Strategy 3: Try fallback CDN
  try {
    await loadCSS(LEAFLET_CSS_URL_FALLBACK, LEAFLET_CSS_INTEGRITY);
    usedFallbackCDN = true;
    console.log("ABC Emergency Map: Loaded fallback CDN CSS");
    return;
  } catch (fallbackError) {
    errors.push(`Fallback CDN: ${fallbackError}`);
  }

  throw new Error(
    `Failed to load Leaflet CSS from all sources: ${errors.join("; ")}`
  );
}

/**
 * Injects a JavaScript file into the document.
 *
 * For Cast environments, SRI is disabled to avoid potential issues.
 *
 * @param url - The URL of the script
 * @param integrity - SRI hash for verification (may be skipped in Cast)
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
    script.crossOrigin = "anonymous";
    script.async = true;

    // SRI can cause issues in some Cast environments
    if (!isCastEnvironment() && integrity) {
      script.integrity = integrity;
    }

    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error(`Failed to load Leaflet JS from ${url}`));

    document.head.appendChild(script);
  });
}

/**
 * Checks if Leaflet is already available globally.
 *
 * This can happen if:
 * 1. Another custom card has already loaded Leaflet
 * 2. HA's native map has been used (sets window.L when its chunk loads)
 *
 * @returns true if window.L exists and has a valid version
 */
function isLeafletAvailableGlobally(): boolean {
  if (typeof window === "undefined") return false;
  if (!("L" in window)) return false;

  // Verify it's actually Leaflet (has version property)
  const maybeL = (window as unknown as { L?: { version?: string } }).L;
  return typeof maybeL?.version === "string";
}

/**
 * Waits for window.L to become available.
 *
 * @param timeout Maximum time to wait in ms
 * @returns Promise that resolves when window.L is available, or rejects on timeout
 */
function waitForLeafletGlobal(timeout: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      if (isLeafletAvailableGlobally()) {
        resolve();
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error("Timeout waiting for window.L"));
        return;
      }

      setTimeout(check, HA_LEAFLET_POLL_INTERVAL);
    };

    check();
  });
}

/**
 * Attempts to trigger HA's Leaflet load by creating a hidden ha-map element.
 *
 * HA lazy-loads Leaflet when ha-map is first used. By creating a temporary
 * hidden ha-map element, we can trigger this load and then access window.L.
 *
 * @returns Promise that resolves to true if successful, false otherwise
 */
async function triggerHALeafletLoad(): Promise<boolean> {
  // Check if ha-map is a registered custom element
  if (!customElements.get("ha-map")) {
    console.log("ABC Emergency Map: ha-map not registered, skipping HA Leaflet trigger");
    return false;
  }

  console.log("ABC Emergency Map: Triggering HA Leaflet load via ha-map element...");

  // Create a hidden ha-map element to trigger Leaflet load
  const container = document.createElement("div");
  container.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;";

  const haMap = document.createElement("ha-map") as HTMLElement & {
    hass?: unknown;
    zoom?: number;
  };
  // Set minimal required properties
  haMap.zoom = 1;

  container.appendChild(haMap);
  document.body.appendChild(container);

  try {
    // Wait for window.L to become available
    await waitForLeafletGlobal(HA_LEAFLET_LOAD_TIMEOUT);
    const version = (window as unknown as { L: { version: string } }).L.version;
    console.log(`ABC Emergency Map: HA Leaflet ${version} loaded successfully via ha-map trigger`);
    return true;
  } catch {
    console.log("ABC Emergency Map: HA Leaflet trigger timed out, falling back to CDN");
    return false;
  } finally {
    // Clean up the hidden element
    container.remove();
  }
}

/** Track if we loaded from HA's bundled Leaflet */
let usedHALeaflet = false;

/**
 * Loads Leaflet script with multi-level fallback support.
 *
 * Strategy:
 * 1. Check if Leaflet is already available (window.L)
 * 2. Try to trigger HA's bundled Leaflet via ha-map element
 * 3. Fall back to primary CDN (unpkg.com)
 * 4. Fall back to secondary CDN (jsdelivr.net)
 *
 * @returns Promise that resolves when Leaflet is available
 */
async function loadScriptWithFallback(): Promise<void> {
  // Strategy 1: Check if Leaflet is already available globally
  if (isLeafletAvailableGlobally()) {
    const existingVersion = (window as unknown as { L: { version: string } }).L.version;
    console.log(
      `ABC Emergency Map: Using existing Leaflet ${existingVersion} from window.L`
    );
    return;
  }

  // Strategy 2: Try to trigger HA's bundled Leaflet load
  const haLeafletLoaded = await triggerHALeafletLoad();
  if (haLeafletLoaded) {
    usedHALeaflet = true;
    return;
  }

  const errors: string[] = [];

  // Strategy 3: Try primary CDN
  try {
    await loadScript(LEAFLET_JS_URL, LEAFLET_JS_INTEGRITY);
    console.log("ABC Emergency Map: Loaded Leaflet JS from primary CDN");
    return;
  } catch (primaryError) {
    errors.push(`Primary CDN: ${primaryError}`);
    console.warn(
      `ABC Emergency Map: Primary JS CDN failed, trying fallback...`
    );
  }

  // Strategy 4: Try fallback CDN
  try {
    await loadScript(LEAFLET_JS_URL_FALLBACK, LEAFLET_JS_INTEGRITY);
    usedFallbackCDN = true;
    console.log("ABC Emergency Map: Loaded Leaflet JS from fallback CDN");
    return;
  } catch (fallbackError) {
    errors.push(`Fallback CDN: ${fallbackError}`);
  }

  throw new Error(
    `Failed to load Leaflet JS from all sources: ${errors.join("; ")}`
  );
}

/**
 * Configures Leaflet to use HA's local marker images.
 *
 * This ensures consistent marker appearance with HA's native map
 * and avoids external image dependencies on Cast.
 */
function configureLeafletImagePath(): void {
  if (typeof L !== "undefined" && L.Icon?.Default?.prototype) {
    // Use HA's local marker images
    L.Icon.Default.imagePath = HA_LEAFLET_IMAGES_PATH;
    console.log(
      `ABC Emergency Map: Set marker image path to ${HA_LEAFLET_IMAGES_PATH}`
    );
  }
}

/**
 * Loads Leaflet library with optimal strategy for Cast compatibility.
 *
 * Loading Strategy:
 * 1. Check for existing window.L (from another card or HA)
 * 2. Try to trigger HA's bundled Leaflet via hidden ha-map element
 * 3. Load CSS from HA local path first, fallback to CDN
 * 4. Load JS from CDN as last resort
 * 5. Configure marker images to use HA's local path
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

  const inCast = isCastEnvironment();
  if (inCast) {
    console.log("ABC Emergency Map: Loading Leaflet in Cast environment");
  }

  // Create loading promise
  leafletLoadPromise = (async () => {
    try {
      // Load CSS first (map rendering depends on styles)
      // Tries HA local first, then CDN fallbacks
      await loadCSSWithFallback();

      // Then load JavaScript
      // Checks for existing window.L, then tries CDN fallbacks
      await loadScriptWithFallback();

      // Verify Leaflet loaded correctly
      if (typeof L === "undefined") {
        throw new Error(
          "Leaflet script loaded but L global is undefined. " +
            "This may indicate a script parsing error."
        );
      }

      // Configure Leaflet to use HA's local marker images
      configureLeafletImagePath();

      leafletLoaded = true;

      // Build status message showing what sources were used
      const sources: string[] = [];
      if (usedHALeaflet) sources.push("HA bundled JS");
      if (usedHALocalCSS) sources.push("HA local CSS");
      if (usedFallbackCDN) sources.push("fallback CDN");

      console.log(
        `ABC Emergency Map: Leaflet ${L.version} ready` +
          (sources.length > 0 ? ` (${sources.join(", ")})` : " (CDN)")
      );
      return L;
    } catch (error) {
      // Reset promise on failure to allow retry
      leafletLoadPromise = null;

      // Enhance error message for Cast environments
      if (inCast && error instanceof Error) {
        const enhanced = new Error(
          `[Cast Environment] ${error.message}. ` +
            "Cast devices may have restricted network access. " +
            "Consider using the built-in Home Assistant map card for Cast dashboards."
        );
        enhanced.cause = error;
        throw enhanced;
      }

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
