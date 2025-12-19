import { api } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import ProductVariantSelector from '@/components/ProductVariantSelector';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductHighlights from '@/components/ProductHighlights';
import ProductDeliveryInfo from '@/components/ProductDeliveryInfo';
import ProductTabs from '@/components/ProductTabs';
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
          <div className="lg:sticky lg:top-8 lg:self-start">
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
            <h1 className="text-2xl md:text-3xl font-bold mb-3">{product.name}</h1>

            {/* Ratings (Mock - can be replaced with real ratings) */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">4.5</span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-blue-600 hover:underline cursor-pointer">2,345 ratings</span>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-blue-600 hover:underline cursor-pointer">1,234 reviews</span>
            </div>

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

            {/* Variant Selector */}
            <div className="mb-6">
              <ProductVariantSelector product={product} variants={product.variants || []} />
            </div>

            {/* Product Highlights */}
            {product.description && (
              <ProductHighlights
                highlights={[
                  product.description,
                  product.weave ? `Handwoven ${product.weave} weave` : 'Handwoven by skilled artisans',
                  product.length_m ? `${product.length_m}m length` : 'Standard 6m length',
                  product.blouse_included ? 'Blouse piece included' : 'Blouse piece available separately',
                  '100% Authentic',
                  'Free shipping across India',
                ]}
              />
            )}

            {/* Delivery Information */}
            <div className="mb-6">
              <ProductDeliveryInfo />
            </div>

            {/* Share and Wishlist Buttons */}
            <div className="flex gap-3 mb-6 pt-6 border-t border-gray-200">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="text-sm">Share</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm">Wishlist</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Tabs Section */}
        <div className="mt-12">
          <ProductTabs
            description={product.description}
            longDescription={product.long_description}
            specifications={{
              'Weave': product.weave || 'N/A',
              'Length': product.length_m ? `${product.length_m}m` : 'Standard 6m',
              'Color': product.color || 'Multiple colors available',
              'Blouse': product.blouse_included ? 'Included' : 'Available separately',
              'Subcategories': product.subcategories?.join(', ') || 'N/A',
              'SKU': product.sku || 'N/A',
              'Material': 'Pure Silk',
              'Care Instructions': 'Dry clean only',
            }}
            reviews={[]}
          />
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
