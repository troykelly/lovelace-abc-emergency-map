/**
 * Cast Compatibility Utilities
 *
 * Provides detection and compatibility utilities for running
 * on Google Cast devices (Chromecast, Nest Hub, etc.)
 *
 * Home Assistant Cast uses a stripped-down frontend where:
 * 1. Some custom elements may not be registered yet
 * 2. Network requests may be restricted
 * 3. LitElement must be extracted from existing HA elements
 */

/** Cache for Cast detection result */
let isCastEnvironmentCache: boolean | null = null;

/**
 * Detects if running in a Cast environment.
 *
 * Detection is based on multiple signals:
 * 1. cast.framework presence (Cast SDK)
 * 2. window.__onGCastApiAvailable (Cast receiver)
 * 3. User agent containing "CrKey" (Chromecast identifier)
 * 4. Limited window features (no localStorage in some Cast modes)
 *
 * @returns true if likely running on Cast
 */
export function isCastEnvironment(): boolean {
  if (isCastEnvironmentCache !== null) {
    return isCastEnvironmentCache;
  }

  const checks: boolean[] = [];

  // Check 1: Cast SDK presence
  const hasCastFramework =
    typeof window !== "undefined" &&
    "cast" in window &&
    typeof (window as unknown as { cast?: { framework?: unknown } }).cast
      ?.framework !== "undefined";
  checks.push(hasCastFramework);

  // Check 2: Cast receiver callback
  const hasGCastCallback =
    typeof window !== "undefined" && "__onGCastApiAvailable" in window;
  checks.push(hasGCastCallback);

  // Check 3: User agent check for Chromecast
  const userAgent =
    typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isChromecastUA =
    userAgent.includes("CrKey") || userAgent.includes("Chromecast");
  checks.push(isChromecastUA);

  // Check 4: Home Assistant Cast specific - check for cast-specific elements
  const hasCastManager =
    typeof customElements !== "undefined" &&
    customElements.get("hc-main") !== undefined;
  checks.push(hasCastManager);

  // Check 5: Check URL for cast indicators
  const isCastUrl =
    typeof window !== "undefined" &&
    (window.location.hostname === "cast.home-assistant.io" ||
      window.location.pathname.includes("/cast"));
  checks.push(isCastUrl);

  // If any strong indicator is present, we're likely in Cast
  isCastEnvironmentCache = checks.some((check) => check);

  if (isCastEnvironmentCache) {
    console.log("ABC Emergency Map: Cast environment detected", {
      hasCastFramework,
      hasGCastCallback,
      isChromecastUA,
      hasCastManager,
      isCastUrl,
    });
  }

  return isCastEnvironmentCache;
}

/**
 * Attempts to extract LitElement from Home Assistant's existing elements.
 *
 * In Cast environments, custom cards should use HA's LitElement instance
 * rather than bundling their own, as the bundled version may conflict.
 *
 * @returns LitElement class if found, undefined otherwise
 */
export function getHALitElement(): typeof HTMLElement | undefined {
  if (typeof customElements === "undefined") {
    return undefined;
  }

  // List of HA elements that definitely extend LitElement
  const haElements = [
    "hui-view",
    "hui-panel-view",
    "home-assistant",
    "ha-card",
    "hui-root",
  ];

  for (const elementName of haElements) {
    const element = customElements.get(elementName);
    if (element) {
      const proto = Object.getPrototypeOf(element);
      // Check if this looks like LitElement (has key LitElement properties)
      if (
        proto &&
        proto.prototype &&
        typeof proto.prototype.render === "function"
      ) {
        console.log(
          `ABC Emergency Map: Extracted LitElement from ${elementName}`
        );
        return proto as typeof HTMLElement;
      }
    }
  }

  return undefined;
}

/**
 * Cast-specific error types for better diagnostics.
 */
export enum CastErrorType {
  RESOURCE_LOAD_FAILED = "RESOURCE_LOAD_FAILED",
  CORS_BLOCKED = "CORS_BLOCKED",
  LITELEMENT_UNAVAILABLE = "LITELEMENT_UNAVAILABLE",
  NETWORK_RESTRICTED = "NETWORK_RESTRICTED",
  UNKNOWN = "UNKNOWN",
}

/**
 * Classifies an error that occurred in Cast environment.
 *
 * @param error The caught error
 * @returns Classified error type
 */
export function classifyCastError(error: unknown): CastErrorType {
  if (!(error instanceof Error)) {
    return CastErrorType.UNKNOWN;
  }

  const message = error.message.toLowerCase();

  if (
    message.includes("cors") ||
    message.includes("cross-origin") ||
    message.includes("access-control")
  ) {
    return CastErrorType.CORS_BLOCKED;
  }

  if (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("load")
  ) {
    return CastErrorType.RESOURCE_LOAD_FAILED;
  }

  if (message.includes("litelement") || message.includes("lit-element")) {
    return CastErrorType.LITELEMENT_UNAVAILABLE;
  }

  return CastErrorType.UNKNOWN;
}

/**
 * Returns a user-friendly error message for Cast errors.
 *
 * @param errorType The classified error type
 * @returns Human-readable error message
 */
export function getCastErrorMessage(errorType: CastErrorType): string {
  switch (errorType) {
    case CastErrorType.CORS_BLOCKED:
      return "Unable to load map resources on Cast device due to CORS restrictions. " +
        "Try using the built-in map card for Cast, or configure CORS headers.";
    case CastErrorType.RESOURCE_LOAD_FAILED:
      return "Failed to load map library. Cast devices may have restricted network access.";
    case CastErrorType.LITELEMENT_UNAVAILABLE:
      return "Unable to initialize card in Cast environment. " +
        "Home Assistant Cast compatibility issue detected.";
    case CastErrorType.NETWORK_RESTRICTED:
      return "Network request blocked in Cast environment.";
    case CastErrorType.UNKNOWN:
    default:
      return "An error occurred loading the map on Cast device.";
  }
}

/**
 * Checks if an external URL is likely to be blocked in Cast.
 *
 * Cast environments may block:
 * 1. Mixed content (HTTP from HTTPS)
 * 2. Non-CORS resources
 * 3. Certain domains
 *
 * @param url URL to check
 * @returns true if URL might be blocked
 */
export function mightBeBlockedInCast(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Mixed content check
    if (
      typeof window !== "undefined" &&
      window.location.protocol === "https:" &&
      parsed.protocol === "http:"
    ) {
      return true;
    }

    // Known CDNs that work with Cast
    const knownGoodDomains = [
      "unpkg.com",
      "cdn.jsdelivr.net",
      "cdnjs.cloudflare.com",
    ];

    return !knownGoodDomains.some((domain) => parsed.hostname.endsWith(domain));
  } catch {
    return true; // Invalid URL, probably blocked
  }
}

/**
 * Waits for Home Assistant's custom elements to be ready.
 *
 * Cast loads HA elements asynchronously, so we may need to wait
 * for elements like hui-view to be registered.
 *
 * @param timeout Maximum time to wait in ms
 * @returns Promise that resolves when HA is ready
 */
export function waitForHAReady(timeout: number = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    // Quick check if already ready
    if (customElements.get("hui-view")) {
      resolve();
      return;
    }

    // Set up timeout
    const timeoutId = setTimeout(() => {
      reject(
        new Error("Timeout waiting for Home Assistant elements to initialize")
      );
    }, timeout);

    // Watch for hui-view registration
    const checkInterval = setInterval(() => {
      if (customElements.get("hui-view")) {
        clearInterval(checkInterval);
        clearTimeout(timeoutId);
        resolve();
      }
    }, 100);
  });
}
