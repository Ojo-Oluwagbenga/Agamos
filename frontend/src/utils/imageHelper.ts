/**
 * Helper to resolve product and media image URLs across local and production environments.
 */
export function getProductImageUrl(
  product?: {
    images?: Array<{ image: string; is_primary?: boolean }>;
    primary_image?: string | null;
  } | null,
  fallback: string = '/agamos-symbol.png'
): string {
  if (!product) return fallback;

  // 1. Primary image string or from images array
  const rawUrl =
    product.primary_image ||
    product.images?.find((img) => img.is_primary)?.image ||
    product.images?.[0]?.image;

  if (!rawUrl || typeof rawUrl !== 'string') return fallback;

  // 2. If already absolute URL or data URI
  if (
    rawUrl.startsWith('http://') ||
    rawUrl.startsWith('https://') ||
    rawUrl.startsWith('data:')
  ) {
    return rawUrl;
  }

  // 3. If relative path like /media/products/... or products/...
  const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
  const backendOrigin = apiBase.replace(/\/api\/?$/, '');

  if (rawUrl.startsWith('/')) {
    return `${backendOrigin}${rawUrl}`;
  }

  return `${backendOrigin}/${rawUrl}`;
}
