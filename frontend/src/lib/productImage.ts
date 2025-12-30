export interface ProductLike {
  primary_image_url?: string | null;
  image_urls?: (string | null)[] | null;
  variants?: Array<{ image_url?: string | null } | null> | null;
}

function normalizeImages(images: Array<string | null | undefined>): string[] {
  return images
    .filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
    .map((url) => url.trim());
}

/**
 * Collect all usable product image URLs, prioritizing primary, gallery, then variant images.
 */
export function collectProductImages(product?: ProductLike | null): string[] {
  if (!product) return [];

  const galleryImages = Array.isArray(product.image_urls) ? product.image_urls : [];
  const variantImages = Array.isArray(product.variants)
    ? product.variants.map((variant) => variant?.image_url || null)
    : [];

  return normalizeImages([
    product.primary_image_url,
    ...galleryImages,
    ...variantImages,
  ]);
}

/**
 * Returns the best available image for a product.
 */
export function getProductDisplayImage(product?: ProductLike | null): string | null {
  const images = collectProductImages(product);
  return images[0] || null;
}
