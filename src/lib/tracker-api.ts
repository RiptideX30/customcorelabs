// Cloudflare Worker URL for the build tracker API
export const TRACKER_API_BASE = "https://build-tracker.cdwojick.workers.dev";

export function trackerUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${TRACKER_API_BASE}${path}`;
}

export async function trackerFetch(path: string, init?: RequestInit) {
  return fetch(trackerUrl(path), init);
}