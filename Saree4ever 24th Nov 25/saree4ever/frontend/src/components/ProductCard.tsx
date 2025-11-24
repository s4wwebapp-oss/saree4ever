import Link from 'next/link';
import Image from 'next/image';

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
  // Use collections array if available, otherwise fall back to single collection
  const displayCollections = collections.length > 0 
    ? collections 
    : collection 
      ? [{ name: collection }] 
      : [];

  return (
    <Link href={`/product/${slug}`} className="product-card block group">
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
        {/* Show badge if product is in multiple collections */}
        {displayCollections.length > 1 && (
          <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded">
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
        <button className="btn-outline w-full mt-3 text-sm">
          View
        </button>
      </div>
    </Link>
  );
}

