// The API is served from a separate Cloudflare Worker.
export const TRACKER_API_BASE = import.meta.env.DEV
  ? "" // In dev, requests are proxied by Vite
  : "https://build-tracker.cdwojick.workers.dev";

export function trackerUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${TRACKER_API_BASE}${path}`;
}

/**
 * A wrapper around `fetch` that automatically prepends the tracker API base URL
 * and ensures headers are correctly preserved and forwarded.
 */
export async function trackerFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  // Create a new Headers object from any headers passed in the init object.
  // This ensures they are correctly structured for the native fetch call.
  const headers = new Headers(init.headers);

  // Reconstruct the init object to be passed to the fetch call.
  // This cleanly separates the headers from the rest of the init properties.
  const fetchInit: RequestInit = {
    ...init,
    headers,
  };

  return fetch(trackerUrl(path), fetchInit);
}
