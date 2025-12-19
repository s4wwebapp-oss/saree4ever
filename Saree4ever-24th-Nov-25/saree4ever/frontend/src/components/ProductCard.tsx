'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useState } from 'react';
import { api } from '@/lib/api';

interface Collection {
  id?: string;
  name: string;
  slug?: string;
}

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  price: number;
  compareAtPrice?: number | null;
  collection?: string; // Backward compatibility
  collections?: Collection[]; // New: multiple collections
}

export default function ProductCard({
  id,
  slug,
  name,
  image,
  price,
  compareAtPrice,
  collection,
  collections = [],
}: ProductCardProps) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useWishlist();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const isFav = isFavorite(id);

  // Use collections array if available, otherwise fall back to single collection
  const displayCollections = collections.length > 0 
    ? collections 
    : collection 
      ? [{ name: collection }] 
      : [];

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);
    
    try {
      // Try to get variants for this product
      let variantId = id; // Use product ID as variant ID for products without variants
      let variantPrice = price;
      let variantName: string | undefined = undefined;
      
      try {
        const variantsResponse: any = await api.variants.getByProduct(id);
        const variants = variantsResponse?.variants || variantsResponse || [];
        
        if (variants.length > 0) {
          // Use the first available variant
          const firstVariant = variants[0];
          variantId = firstVariant.id;
          variantPrice = firstVariant.price || price;
          variantName = firstVariant.name || name;
        }
      } catch (error) {
        // If variants fetch fails, use product base price with product ID as variant ID
        // This matches the pattern used in ProductVariantSelector
      }
      
      addItem({
        variantId: variantId,
        productId: id,
        quantity: 1,
        price: variantPrice,
        image: image || '',
        title: name,
        variantName: variantName && variantName !== name ? variantName : undefined,
      });
      
      // Show brief feedback (you can replace with a toast notification)
      const button = e.currentTarget as HTMLElement;
      const originalContent = button.innerHTML;
      button.innerHTML = '✓ Added';
      setTimeout(() => {
        button.innerHTML = originalContent;
      }, 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
  };

  return (
    <div className="product-card group relative">
      <Link href={`/product/${slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          {image ? (
            <Image
              src={image}
              alt={name}
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
          
          {/* Action Icons Overlay */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
            {/* Favorites Icon */}
            <button
              onClick={handleToggleFavorite}
              className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white hover:shadow-lg transition-all"
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg
                className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
                fill={isFav ? 'currentColor' : 'none'}
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
            
            {/* Add to Cart Icon */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white hover:shadow-lg transition-all disabled:opacity-50"
              aria-label="Add to cart"
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </button>
          </div>
          
          {/* Show badge if product is in multiple collections */}
          {displayCollections.length > 1 && (
            <div className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded z-10">
              {displayCollections.length} Collections
            </div>
          )}
        </div>
        <div className="p-4">
          {/* Show collection badges */}
          {displayCollections.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {displayCollections.slice(0, 2).map((col, index) => (
                <span
                  key={col.id || index}
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
            {name}
          </h3>
          <div className="flex items-center space-x-2">
            {price != null ? (
              <>
                <span className="font-semibold">₹{price.toLocaleString()}</span>
                {compareAtPrice && compareAtPrice > price && (
                  <span className="text-sm text-gray-500 line-through">
                    ₹{compareAtPrice.toLocaleString()}
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm text-gray-500">Price not available</span>
            )}
          </div>
        </div>
      </Link>
      {/* Buttons section outside Link to avoid nested links */}
      <div className="px-4 pb-4">
        <div className="flex gap-2">
          <Link href={`/product/${slug}`} className="flex-1">
            <button className="btn-outline w-full text-xs sm:text-sm h-10 flex items-center justify-center whitespace-nowrap">
              View
            </button>
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="flex-1 btn-primary text-xs sm:text-sm h-10 flex items-center justify-center whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

