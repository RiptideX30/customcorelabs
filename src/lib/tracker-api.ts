// The API is served from the same domain as the frontend via Cloudflare Functions.
// We use a relative path by setting the base to an empty string.
export const TRACKER_API_BASE = "";

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
