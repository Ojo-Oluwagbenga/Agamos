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

/**
 * Resolves any media asset URL (relative /media/... or absolute).
 */
export function getMediaUrl(rawUrl?: string | null, fallback: string = ''): string {
  if (!rawUrl || typeof rawUrl !== 'string') return fallback;

  if (
    rawUrl.startsWith('http://') ||
    rawUrl.startsWith('https://') ||
    rawUrl.startsWith('data:')
  ) {
    return rawUrl;
  }

  const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
  const backendOrigin = apiBase.replace(/\/api\/?$/, '');

  if (rawUrl.startsWith('/')) {
    return `${backendOrigin}${rawUrl}`;
  }

  return `${backendOrigin}/${rawUrl}`;
}

/**
 * Returns a robust, cross-environment QR code image URL.
 */
export function getQrCodeUrl(
  qrCode?: { qr_image?: string | null; secure_token?: string | null } | null,
  reference: string = '',
  type: 'BOOKING' | 'ORDER' = 'BOOKING'
): string {
  const token = qrCode?.secure_token || reference;
  const payload = encodeURIComponent(`AGAMOS:${type}:${token}`);
  const dynamicFallback = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${payload}`;

  if (qrCode?.qr_image) {
    return getMediaUrl(qrCode.qr_image, dynamicFallback);
  }

  return dynamicFallback;
}
