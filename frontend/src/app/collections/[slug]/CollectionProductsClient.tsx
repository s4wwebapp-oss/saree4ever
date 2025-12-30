'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import FiltersSidebarEnhanced from '@/components/FiltersSidebarEnhanced';

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

export default function CollectionProductsClient({ collectionSlug }: { collectionSlug: string }) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [searchParams, collectionSlug]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const filters: any = { collection: collectionSlug };
      
      // Apply URL filters
      if (searchParams?.get('search')) filters.search = searchParams.get('search');
      if (searchParams?.get('minPrice')) filters.minPrice = searchParams.get('minPrice');
      if (searchParams?.get('maxPrice')) filters.maxPrice = searchParams.get('maxPrice');
      if (searchParams?.get('collections')) filters.collections = searchParams.get('collections')?.split(',');
      if (searchParams?.get('categories')) filters.categories = searchParams.get('categories')?.split(',');
      if (searchParams?.get('types')) filters.types = searchParams.get('types')?.split(',');
      if (searchParams?.get('colors')) filters.color = searchParams.get('colors')?.split(',');
      if (searchParams?.get('subcategories')) filters.subcategories = searchParams.get('subcategories')?.split(',');
      if (searchParams?.get('sortBy')) filters.sortBy = searchParams.get('sortBy');
      if (searchParams?.get('featured') === 'true') filters.featured = true;
      
      const response = await api.products.getAll(filters);
      const productsData = (response as { products?: Product[] }).products || (response as Product[]) || [];
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Mobile Filter Button */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          {products.length} {products.length === 1 ? 'product' : 'products'} found
        </p>
        <button
          onClick={() => setIsFiltersOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-medium">Filters</span>
        </button>
      </div>

      {/* Filters Sidebar - Desktop */}
      <aside className="hidden lg:block lg:w-64 flex-shrink-0">
        <div className="sticky top-24">
          <FiltersSidebarEnhanced onFiltersChange={loadProducts} />
        </div>
      </aside>

      {/* Mobile Filters Drawer/Modal */}
      {isFiltersOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsFiltersOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-80 bg-white z-50 lg:hidden overflow-y-auto shadow-xl">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-lg">Filters</h2>
              <button
                onClick={() => setIsFiltersOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close filters"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <FiltersSidebarEnhanced onFiltersChange={loadProducts} />
            </div>
          </div>
        </>
      )}

      {/* Products Grid */}
      <div className="flex-1">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="mb-4 hidden lg:block text-sm text-gray-600">
              {products.length} {products.length === 1 ? 'product' : 'products'} found
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found.</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}


