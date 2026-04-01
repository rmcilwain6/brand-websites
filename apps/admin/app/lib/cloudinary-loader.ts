type LoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

/**
 * Custom Next.js image loader for the admin app.
 *
 * Mirrors the loader in evrydayarchive-web: injects `w_`, `q_`, `f_auto`
 * transformation params so Cloudinary handles resizing and format conversion.
 * This prevents Next.js from proxying the original Cloudinary file server-side,
 * which would fetch the full-resolution original on every uncached request.
 */
export default function cloudinaryLoader({ src, width, quality }: LoaderProps): string {
  const q = quality ?? 85;

  // Local static assets — serve directly
  if (src.startsWith('/')) {
    return src;
  }

  // Cloudinary URLs — inject transformation parameters
  const uploadMarker = '/upload/';
  const idx = src.indexOf(uploadMarker);
  if (idx !== -1) {
    const base = src.slice(0, idx + uploadMarker.length);
    const rest = src.slice(idx + uploadMarker.length);
    const withoutVersion = rest.replace(/^v\d+\//, '');
    return `${base}w_${width},q_${q},f_auto/${withoutVersion}`;
  }

  // Non-Cloudinary remote URLs — return as-is
  return src;
}
