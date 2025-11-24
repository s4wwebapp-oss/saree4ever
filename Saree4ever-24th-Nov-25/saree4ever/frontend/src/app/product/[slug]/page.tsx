import { api } from '@/lib/api';
import Image from 'next/image';
import ProductVariantSelector from '@/components/ProductVariantSelector';
import { notFound } from 'next/navigation';

interface Variant {
  id: string;
  name: string;
  sku: string | null;
  price: number | null;
  compare_at_price: number | null;
  color: string | null;
  has_blouse: boolean;
  blouse_included: boolean;
  stock_quantity: number;
  track_inventory: boolean;
  image_url: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  base_price: number | null | undefined;
  compare_at_price: number | null;
  primary_image_url: string | null;
  image_urls: string[] | null | undefined;
  variants: Variant[] | null | undefined;
  collection?: {
    name: string;
  };
  category?: {
    name: string;
  };
  type?: {
    name: string;
  };
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const response = await api.products.getBySlug(slug);
    return response as Product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Safely handle image_urls - ensure it's always an array
  const imageUrls = Array.isArray(product.image_urls) ? product.image_urls : [];
  
  // Build images array, filtering out null/undefined values
  const images = product.primary_image_url
    ? [product.primary_image_url, ...imageUrls].filter(Boolean)
    : imageUrls.filter(Boolean);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            {images.length > 0 ? (
              <div className="space-y-4">
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <Image
                    src={images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {images.slice(1, 5).map((image, index) => (
                      <div key={index} className="relative aspect-square overflow-hidden bg-gray-100">
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 2}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 25vw, 12.5vw"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <p className="text-gray-400">No images available</p>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {product.collection && (
              <p className="text-sm text-gray-600 uppercase tracking-wide mb-2">
                {product.collection.name}
              </p>
            )}
            <h1 className="heading-serif-md mb-4">{product.name}</h1>

            <div className="flex items-center space-x-4 mb-6">
              {product.base_price !== undefined && product.base_price !== null ? (
                <span className="text-2xl font-semibold">
                  ₹{product.base_price.toLocaleString()}
                </span>
              ) : (
                <span className="text-2xl font-semibold text-gray-500">
                  Price not available
                </span>
              )}
              {product.compare_at_price && 
               product.base_price !== undefined && 
               product.base_price !== null &&
               product.compare_at_price > product.base_price && (
                <span className="text-lg text-gray-500 line-through">
                  ₹{product.compare_at_price.toLocaleString()}
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-gray-700 mb-6">{product.description}</p>
            )}

            {/* Variant Selector */}
            <ProductVariantSelector product={product} variants={product.variants || []} />

            {product.long_description && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="font-semibold mb-4">Description</h2>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.long_description }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

