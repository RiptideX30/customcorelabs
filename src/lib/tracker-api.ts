// The API is served from a separate Cloudflare Worker.
export const TRACKER_API_BASE = import.meta.env.DEV ? "" : "https://build-tracker.cdwojick.workers.dev";

export function trackerUrl(path: string) {
  // If the path is already a full URL, return it as is.
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  // Otherwise, construct the URL relative to the current domain.
  return `${TRACKER_API_BASE}${path}`;
}

export async function trackerFetch(path: string, init?: RequestInit) {
  return fetch(trackerUrl(path), init);
}
