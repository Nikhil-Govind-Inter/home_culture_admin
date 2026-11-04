// Resolves a possibly-relative media path (as stored by the backend, e.g.
// "uploads/banners/x.jpg") into a URL the browser can load. Mirrors the
// resolution rules FileUpload.tsx's getDisplayUrl already uses for preview:
// pass through absolute URLs untouched, otherwise prepend VITE_IMAGE_URL.
export function resolveImageUrl(path: string | null | undefined): string | null {
  if (!path || !path.trim()) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const baseUrl = import.meta.env.VITE_IMAGE_URL;
  if (!baseUrl) return path;

  // Remove leading slash from path to avoid double slashes.
  return `${baseUrl}/${path.replace(/^\//, "")}`;
}
