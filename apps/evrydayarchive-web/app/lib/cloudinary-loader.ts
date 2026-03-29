type LoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

/**
 * Custom Next.js image loader.
 *
 * - Cloudinary URLs: injects `w_`, `q_`, `f_auto` transformation params so
 *   Cloudinary handles resizing and format conversion. Avoids the double-fetch
 *   that occurs when Next.js proxies the original through /_next/image.
 *
 * - Local static assets (src starts with "/"): returned as-is. These are
 *   pre-sized and pre-converted to WebP before being committed to public/.
 *
 * - Other remote URLs: returned as-is (no optimization).
 */
export default function cloudinaryLoader({ src, width, quality }: LoaderProps): string {
  const q = quality ?? 85;

  // Local static assets — already optimized at source, serve directly
  if (src.startsWith('/')) {
    return src;
  }

  // Cloudinary URLs — inject transformation parameters
  const uploadMarker = '/upload/';
  const idx = src.indexOf(uploadMarker);
  if (idx !== -1) {
    const base = src.slice(0, idx + uploadMarker.length);
    const rest = src.slice(idx + uploadMarker.length);
    // Strip any existing version prefix (e.g. "v1234567890/") to avoid conflicts
    const withoutVersion = rest.replace(/^v\d+\//, '');
    return `${base}w_${width},q_${q},f_auto/${withoutVersion}`;
  }

  // Non-Cloudinary remote URLs — return as-is
  return src;
}
