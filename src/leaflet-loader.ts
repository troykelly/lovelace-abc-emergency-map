/**
 * Leaflet Dynamic Loader
 *
 * Dynamically loads Leaflet.js and CSS from CDN with SRI verification.
 * Uses a singleton pattern to prevent multiple loads when several cards
 * are on the same page.
 *
 * IMPORTANT: Because our card uses Shadow DOM, we need to inject Leaflet CSS
 * into each shadow root, not just the document head.
 *
 * Cast Compatibility:
 * - Uses CORS-friendly CDN (unpkg.com supports CORS)
 * - Provides fallback to alternative CDNs if primary fails
 * - Handles network errors gracefully with informative messages
 */

import { isCastEnvironment } from "./cast-compat";

// Note: The global L declaration is in leaflet-types.d.ts

/** Leaflet version to load from CDN */
const LEAFLET_VERSION = "1.9.4";

/** Primary CDN URLs for Leaflet assets (unpkg.com has CORS support) */
const LEAFLET_CSS_URL = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
const LEAFLET_JS_URL = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;

/** Fallback CDN URLs (jsdelivr also has CORS support) */
const LEAFLET_CSS_URL_FALLBACK = `https://cdn.jsdelivr.net/npm/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
const LEAFLET_JS_URL_FALLBACK = `https://cdn.jsdelivr.net/npm/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;

/**
 * SRI (Subresource Integrity) hashes for Leaflet 1.9.4
 * These ensure the loaded files haven't been tampered with.
 * Note: SRI is disabled for Cast environments to avoid issues with
 * some Cast implementations that may modify response headers.
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

/** Track which CDN was used successfully */
let usedFallbackCDN = false;

/**
 * Fetches CSS content with fallback support.
 *
 * @param primaryUrl Primary URL to try
 * @param fallbackUrl Fallback URL if primary fails
 * @returns Promise that resolves with the CSS content
 */
async function fetchWithFallback(
  primaryUrl: string,
  fallbackUrl: string
): Promise<string> {
  const inCast = isCastEnvironment();

  // Try primary URL first
  try {
    console.log(
      `ABC Emergency Map: Fetching CSS from ${primaryUrl}${inCast ? " (Cast mode)" : ""}`
    );
    const response = await fetch(primaryUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  } catch (primaryError) {
    console.warn(
      `ABC Emergency Map: Primary CSS fetch failed (${primaryError}), trying fallback...`
    );

    // Try fallback URL
    try {
      const response = await fetch(fallbackUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      usedFallbackCDN = true;
      console.log("ABC Emergency Map: Fallback CSS fetch succeeded");
      return await response.text();
    } catch (fallbackError) {
      // Both failed - provide informative error
      const errorContext = inCast
        ? " This may be due to Cast environment network restrictions."
        : "";
      throw new Error(
        `Failed to fetch Leaflet CSS from both CDNs.${errorContext} ` +
          `Primary: ${primaryError}, Fallback: ${fallbackError}`
      );
    }
  }
}

/**
 * Fetches and caches the Leaflet CSS content.
 * This is used to inject CSS into shadow roots.
 *
 * Uses fallback CDN if primary fails, which helps with
 * Cast compatibility and network resilience.
 *
 * @returns Promise that resolves with the CSS content
 */
async function fetchLeafletCSS(): Promise<string> {
  if (leafletCSSContent) {
    return leafletCSSContent;
  }

  // Use the same CDN as was successful for JS (if we're fetching CSS second)
  const primaryUrl = usedFallbackCDN
    ? LEAFLET_CSS_URL_FALLBACK
    : LEAFLET_CSS_URL;
  const fallbackUrl = usedFallbackCDN
    ? LEAFLET_CSS_URL
    : LEAFLET_CSS_URL_FALLBACK;

  leafletCSSContent = await fetchWithFallback(primaryUrl, fallbackUrl);
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
 * For Cast environments, SRI is disabled to avoid potential issues
 * with some Cast implementations.
 *
 * @param url - The URL of the stylesheet
 * @param integrity - SRI hash for verification (may be skipped in Cast)
 * @returns Promise that resolves when CSS is loaded
 */
function loadCSS(url: string, integrity: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded (check both primary and fallback URLs)
    const existingLink =
      document.querySelector(`link[href="${LEAFLET_CSS_URL}"]`) ||
      document.querySelector(`link[href="${LEAFLET_CSS_URL_FALLBACK}"]`);
    if (existingLink) {
      resolve();
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.crossOrigin = "anonymous";

    // SRI can cause issues in some Cast environments
    // Only use it in non-Cast environments
    if (!isCastEnvironment() && integrity) {
      link.integrity = integrity;
    }

    link.onload = () => resolve();
    link.onerror = () =>
      reject(new Error(`Failed to load Leaflet CSS from ${url}`));

    document.head.appendChild(link);
  });
}

/**
 * Loads CSS with fallback support.
 *
 * @returns Promise that resolves when CSS is loaded
 */
async function loadCSSWithFallback(): Promise<void> {
  try {
    await loadCSS(LEAFLET_CSS_URL, LEAFLET_CSS_INTEGRITY);
  } catch (primaryError) {
    console.warn(
      `ABC Emergency Map: Primary CSS link failed, trying fallback...`
    );
    try {
      await loadCSS(LEAFLET_CSS_URL_FALLBACK, LEAFLET_CSS_INTEGRITY);
      usedFallbackCDN = true;
    } catch (fallbackError) {
      throw new Error(
        `Failed to load Leaflet CSS from both CDNs: ${primaryError}, ${fallbackError}`
      );
    }
  }
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
 * Loads script with fallback support.
 *
 * @returns Promise that resolves when script is loaded
 */
async function loadScriptWithFallback(): Promise<void> {
  // Check if Leaflet is already available
  if (typeof window !== "undefined" && "L" in window) {
    return;
  }

  try {
    await loadScript(LEAFLET_JS_URL, LEAFLET_JS_INTEGRITY);
  } catch (primaryError) {
    console.warn(
      `ABC Emergency Map: Primary JS script failed, trying fallback...`
    );
    try {
      await loadScript(LEAFLET_JS_URL_FALLBACK, LEAFLET_JS_INTEGRITY);
      usedFallbackCDN = true;
    } catch (fallbackError) {
      throw new Error(
        `Failed to load Leaflet JS from both CDNs: ${primaryError}, ${fallbackError}`
      );
    }
  }
}

/**
 * Loads Leaflet library from CDN.
 *
 * Uses a singleton pattern - multiple calls will return the same promise,
 * ensuring Leaflet is only loaded once even with multiple card instances.
 *
 * Cast Compatibility:
 * - Tries primary CDN (unpkg.com), falls back to jsdelivr
 * - Disables SRI in Cast environments
 * - Provides detailed error messages for debugging
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
      await loadCSSWithFallback();
      console.log("ABC Emergency Map: Leaflet CSS loaded");

      // Then load JavaScript
      await loadScriptWithFallback();
      console.log("ABC Emergency Map: Leaflet JS loaded");

      // Verify Leaflet loaded correctly
      if (typeof L === "undefined") {
        throw new Error(
          "Leaflet script loaded but L global is undefined. " +
            "This may indicate a script parsing error."
        );
      }

      leafletLoaded = true;
      console.log(
        `ABC Emergency Map: Leaflet ${L.version} ready` +
          (usedFallbackCDN ? " (using fallback CDN)" : "")
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
