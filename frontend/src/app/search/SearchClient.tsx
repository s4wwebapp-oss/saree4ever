'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

interface Product {
  id: string;
  slug: string;
  name: string;
  primary_image_url: string | null;
  image_urls?: (string | null)[] | null;
  variants?: Array<{ image_url?: string | null } | null>;
  base_price: number;
  compare_at_price: number | null;
  collections?: Array<{
    id?: string;
    name: string;
    slug?: string;
  }>;
}

export default function SearchClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.products.getAll({
        search: searchQuery,
        limit: 50,
      });
      const productsList = (response as { products?: Product[] }).products || (response as Product[]) || [];
      setProducts(productsList);
    } catch (error) {
      console.error('Search failed:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchInput.trim())}`;
    }
  };

  return (
    <>
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="heading-serif-md mb-4">Search</h1>
        <form onSubmit={handleSearch} className="max-w-2xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search for sarees..."
              className="input-field flex-1"
            />
            <button type="submit" className="btn-primary px-8">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Search Results */}
      {query && (
        <div>
          <p className="text-gray-600 mb-6">
            {loading ? (
              'Searching...'
            ) : (
              `Found ${products.length} result${products.length !== 1 ? 's' : ''} for "${query}"`
            )}
          </p>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Searching...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                slug={product.slug}
                name={product.name}
                image={product.primary_image_url}
                imageUrls={product.image_urls || []}
                variants={product.variants}
                price={product.base_price}
                compareAtPrice={product.compare_at_price}
                collections={product.collections}
              />
            ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No products found matching your search.</p>
              <Link href="/collections" className="btn-outline">
                Browse All Collections
              </Link>
            </div>
          )}
        </div>
      )}

      {!query && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Enter a search term to find sarees.</p>
        </div>
      )}
    </>
  );
}
