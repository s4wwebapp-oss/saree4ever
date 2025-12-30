'use client';

import { useWishlist } from '@/contexts/WishlistContext';
import { api } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getProductDisplayImage } from '@/lib/productImage';

interface Product {
  id: string;
  slug: string;
  name: string;
  primary_image_url: string | null;
  image_urls?: (string | null)[] | null;
  variants?: Array<{ image_url?: string | null } | null>;
  base_price: number;
  compare_at_price?: number | null;
  collections?: Array<{ id: string; name: string; slug: string }>;
  categories?: Array<{ id: string; name: string; slug: string }>;
  types?: Array<{ id: string; name: string; slug: string }>;
}

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (items.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const productPromises = items.map((productId) =>
          api.products.getById(productId).catch((err) => {
            console.error(`Error fetching product ${productId}:`, err);
            return null;
          })
        );

        const responses = await Promise.all(productPromises);
        const fetchedProducts: Product[] = [];

        for (const response of responses) {
          if (response) {
            // Handle both { product: {...} } and direct product object
            const product = (response as { product?: Product }).product || (response as Product);
            if (product && product.id) {
              fetchedProducts.push(product);
            }
          }
        }

        setProducts(fetchedProducts);
      } catch (err: any) {
        console.error('Error fetching wishlist products:', err);
        setError('Failed to load wishlist items. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [items]);

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="heading-serif-md mb-8">My Wishlist</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 rounded"></div>
                <div className="mt-4 h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="heading-serif-md mb-4">My Wishlist</h1>
          <p className="text-red-600 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0 || products.length === 0) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="heading-serif-md mb-4">My Wishlist</h1>
          <p className="text-gray-600 mb-8">Your wishlist is empty</p>
          <Link href="/collections" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="heading-serif-md mb-8">My Wishlist ({items.length})</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const displayCollections = product.collections || [];
            const imageUrl = getProductDisplayImage(product);

            return (
              <div key={product.id} className="product-card group relative">
                <Link href={`/product/${product.slug}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}

                    {/* Remove from Wishlist Button */}
                    <div className="absolute top-2 right-2 z-10">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeItem(product.id);
                        }}
                        className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white hover:shadow-lg transition-all"
                        aria-label="Remove from wishlist"
                      >
                        <svg
                          className="w-5 h-5 fill-red-500 text-red-500"
                          fill="currentColor"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Collection Badge */}
                    {displayCollections.length > 1 && (
                      <div className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded z-10">
                        {displayCollections.length} Collections
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    {/* Collection badges */}
                    {displayCollections.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {displayCollections.slice(0, 2).map((col) => (
                          <span
                            key={col.id}
                            className="text-xs text-gray-600 uppercase tracking-wide bg-gray-100 px-2 py-0.5 rounded"
                          >
                            {col.name}
                          </span>
                        ))}
                        {displayCollections.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{displayCollections.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                    <h3 className="font-medium mb-2 line-clamp-2 group-hover:underline">
                      {product.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {product.base_price != null ? (
                        <>
                          <span className="font-semibold">₹{product.base_price.toLocaleString()}</span>
                          {product.compare_at_price && product.compare_at_price > product.base_price && (
                            <span className="text-sm text-gray-500 line-through">
                              ₹{product.compare_at_price.toLocaleString()}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">Price not available</span>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="px-4 pb-4">
                  <Link href={`/product/${product.slug}`} className="block">
                    <button className="btn-primary w-full text-sm">
                      View Product
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}




