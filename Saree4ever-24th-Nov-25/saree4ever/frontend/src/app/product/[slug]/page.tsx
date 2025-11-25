import { api } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import ProductVariantSelector from '@/components/ProductVariantSelector';
import ProductImageGallery from '@/components/ProductImageGallery';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';


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
  mrp: number | null;
  primary_image_url: string | null;
  image_urls: string[] | null | undefined;
  variants: Variant[] | null | undefined;
  sku: string | null;
  color: string | null;
  weave: string | null;
  length_m: number | null;
  blouse_included: boolean;
  subcategories: string[] | null;
  collection?: {
    id: string;
    name: string;
    slug: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  type?: {
    id: string;
    name: string;
    slug: string;
  };
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const response = await api.products.getBySlug(slug);
    
    // Handle both { product: {...} } and direct product object
    const product = (response as { product?: Product }).product || (response as Product);
    
    if (!product || !product.id) {
      return null;
    }
    
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

async function getRelatedProducts(
  currentProductId: string,
  collectionId?: string,
  categoryId?: string
): Promise<Product[]> {
  try {
    const products = await api.products.getAll();
    const allProducts = Array.isArray(products) 
      ? products 
      : (products as { products?: Product[] })?.products || [];
    
    // Filter related products (same collection or category, excluding current)
    const related = allProducts
      .filter((p: Product) => {
        if (p.id === currentProductId) return false;
        if (collectionId && p.collection?.id === collectionId) return true;
        if (categoryId && p.category?.id === categoryId) return true;
        return false;
      })
      .slice(0, 4);
    
    return related;
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
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

  // Get related products
  const relatedProducts = await getRelatedProducts(
    product.id,
    product.collection?.id,
    product.category?.id
  );

  // Safely handle image_urls - ensure it's always an array
  const imageUrls = Array.isArray(product.image_urls) ? product.image_urls : [];
  
  // Build images array, filtering out null/undefined values
  const images = product.primary_image_url
    ? [product.primary_image_url, ...imageUrls].filter(Boolean)
    : imageUrls.filter(Boolean);

  // Calculate discount percentage
  const discountPercent = product.compare_at_price && product.base_price
    ? Math.round(((product.compare_at_price - product.base_price) / product.compare_at_price) * 100)
    : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-black">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            {product.collection && (
              <>
                <Link 
                  href={`/collections/${product.collection.slug}`}
                  className="text-gray-500 hover:text-black"
                >
                  {product.collection.name}
                </Link>
                <span className="text-gray-400">/</span>
              </>
            )}
            <span className="text-black font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Product Images */}
          <div className="sticky top-8 self-start">
            <ProductImageGallery
              images={images}
              productName={product.name}
              discountPercent={discountPercent}
            />
          </div>

          {/* Product Info */}
          <div>
            {/* Collection/Category Badge */}
            <div className="flex items-center gap-3 mb-4">
              {product.collection && (
                <Link
                  href={`/collections/${product.collection.slug}`}
                  className="text-xs uppercase tracking-wider text-gray-600 hover:text-black transition-colors"
                >
                  {product.collection.name}
                </Link>
              )}
              {product.category && (
                <>
                  {product.collection && <span className="text-gray-300">•</span>}
                  <Link
                    href={`/categories/${product.category.slug}`}
                    className="text-xs uppercase tracking-wider text-gray-600 hover:text-black transition-colors"
                  >
                    {product.category.name}
                  </Link>
                </>
              )}
            </div>

            {/* Product Title */}
            <h1 className="heading-serif-md mb-4">{product.name}</h1>

            {/* Price Section */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-baseline gap-4 mb-2">
                {product.base_price !== undefined && product.base_price !== null ? (
                  <>
                    <span className="text-3xl font-bold">
                      ₹{product.base_price.toLocaleString()}
                    </span>
                    {product.compare_at_price && 
                     product.compare_at_price > product.base_price && (
                      <>
                        <span className="text-xl text-gray-500 line-through">
                          ₹{product.compare_at_price.toLocaleString()}
                        </span>
                        {discountPercent && (
                          <span className="text-sm font-semibold text-red-600">
                            Save ₹{(product.compare_at_price - product.base_price).toLocaleString()}
                          </span>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-2xl font-semibold text-gray-500">
                    Price available after variant selection
                  </span>
                )}
              </div>
              {product.mrp && product.base_price && product.mrp > product.base_price && (
                <p className="text-sm text-gray-600">
                  MRP: <span className="line-through">₹{product.mrp.toLocaleString()}</span>
                </p>
              )}
            </div>

            {/* Short Description */}
            {product.description && (
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Variant Selector */}
            <div className="mb-8">
              <ProductVariantSelector product={product} variants={product.variants || []} />
            </div>

            {/* Product Specifications */}
            {(product.weave || product.length_m !== null || product.color || product.subcategories?.length) && (
              <div className="mb-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold mb-4">Product Details</h3>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  {product.weave && (
                    <>
                      <dt className="text-gray-600">Weave</dt>
                      <dd className="font-medium">{product.weave}</dd>
                    </>
                  )}
                  {product.length_m !== null && (
                    <>
                      <dt className="text-gray-600">Length</dt>
                      <dd className="font-medium">{product.length_m}m</dd>
                    </>
                  )}
                  {product.color && (
                    <>
                      <dt className="text-gray-600">Color</dt>
                      <dd className="font-medium">{product.color}</dd>
                    </>
                  )}
                  {product.blouse_included && (
                    <>
                      <dt className="text-gray-600">Blouse</dt>
                      <dd className="font-medium">Included</dd>
                    </>
                  )}
                  {product.subcategories && product.subcategories.length > 0 && (
                    <>
                      <dt className="text-gray-600">Subcategories</dt>
                      <dd className="font-medium">{product.subcategories.join(', ')}</dd>
                    </>
                  )}
                  {product.sku && (
                    <>
                      <dt className="text-gray-600">SKU</dt>
                      <dd className="font-medium">{product.sku}</dd>
                    </>
                  )}
                </dl>
              </div>
            )}

            {/* Long Description */}
            {product.long_description && (
              <div className="pt-8 border-t border-gray-200">
                <h2 className="font-semibold text-lg mb-4">Description</h2>
                <div
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: product.long_description }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-200">
            <h2 className="heading-serif-md mb-8 text-center">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => {
                const relatedImages = relatedProduct.primary_image_url
                  ? [relatedProduct.primary_image_url, ...(relatedProduct.image_urls || [])].filter(Boolean)
                  : (relatedProduct.image_urls || []).filter(Boolean);
                
                return (
                  <Link
                    key={relatedProduct.id}
                    href={`/product/${relatedProduct.slug}`}
                    className="group"
                  >
                    <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-lg mb-3">
                      {relatedImages.length > 0 ? (
                        <Image
                          src={relatedImages[0]}
                          alt={relatedProduct.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <p className="text-xs text-gray-400">No Image</p>
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-sm mb-1 group-hover:text-gray-600 transition-colors line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    {relatedProduct.base_price && (
                      <p className="text-sm font-semibold">
                        ₹{relatedProduct.base_price.toLocaleString()}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
