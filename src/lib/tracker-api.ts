const USE_NEW_DOMAIN = false; // Set this to true when you are ready to switch to cclbuilds.com
export const TRACKER_API_BASE = USE_NEW_DOMAIN ? "https://cclbuilds.com" : "https://customcorelabs.pages.dev";

export function trackerUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${TRACKER_API_BASE}${path}`;
}

export async function trackerFetch(path: string, init?: RequestInit) {
  return fetch(trackerUrl(path), init);
}
