export const SUBMIT_API_BASE = import.meta.env.VITE_SUBMIT_API || "";

export function submitUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${SUBMIT_API_BASE}${path}`;
}
