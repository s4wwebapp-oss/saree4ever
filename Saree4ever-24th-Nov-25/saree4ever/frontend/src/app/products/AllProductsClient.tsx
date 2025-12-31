'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import FiltersSidebarEnhanced from '@/components/FiltersSidebarEnhanced';
import { useProductFilters } from '@/hooks/useProductFilters';
import { api } from '@/lib/api';

interface Product {
  id: string;
  slug: string;
  name: string;
  primary_image_url: string | null;
  base_price: number;
  compare_at_price: number | null;
  collection?: {
    name: string;
  };
  collections?: Array<{
    id?: string;
    name: string;
    slug?: string;
  }>;
}

interface AllProductsClientProps {
  initialProducts: Product[];
  initialSearchParams?: { [key: string]: string | string[] | undefined };
}

export default function AllProductsClient({ initialProducts, initialSearchParams }: AllProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const {
    search,
    minPrice,
    maxPrice,
    selectedCollections,
    selectedCategories,
    selectedTypes,
    selectedColors,
    selectedSubcategories,
    sortBy,
    updateFilters,
    clearFilters,
  } = useProductFilters();

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const filters: any = {};

        if (search) filters.search = search;
        if (minPrice) filters.minPrice = minPrice;
        if (maxPrice) filters.maxPrice = maxPrice;
        if (selectedCollections.length > 0) filters.collections = selectedCollections.join(',');
        if (selectedCategories.length > 0) filters.categories = selectedCategories.join(',');
        if (selectedTypes.length > 0) filters.types = selectedTypes.join(',');
        if (selectedColors.length > 0) filters.color = selectedColors.join(',');
        if (selectedSubcategories.length > 0) filters.subcategories = selectedSubcategories.join(',');
        if (sortBy) filters.sortBy = sortBy;

        const response = await api.products.getAll(filters);
        const fetchedProducts = (response as { products?: Product[] }).products || (response as Product[]) || [];
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if filters have changed from initial state
    const hasFilters = search || minPrice || maxPrice || 
      selectedCollections.length > 0 || selectedCategories.length > 0 || 
      selectedTypes.length > 0 || selectedColors.length > 0 || 
      selectedSubcategories.length > 0 || sortBy;

    if (hasFilters) {
      fetchProducts();
    } else {
      // Reset to initial products if no filters
      setProducts(initialProducts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, minPrice, maxPrice, selectedCollections, selectedCategories, selectedTypes, selectedColors, selectedSubcategories, sortBy]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Mobile Filter Button */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          Showing {products.length} product{products.length !== 1 ? 's' : ''}
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
          <FiltersSidebarEnhanced
            onFiltersChange={() => {
              // Filters are managed internally by the component
              // This callback can be used to trigger parent updates if needed
            }}
          />
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
              <FiltersSidebarEnhanced
                onFiltersChange={() => {
                  // Filters are managed internally by the component
                }}
              />
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
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No products found</p>
            <button
              onClick={clearFilters}
              className="text-sm text-black hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 hidden lg:flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {products.length} product{products.length !== 1 ? 's' : ''}
              </p>
              {(search || minPrice || maxPrice || selectedCollections.length > 0 || 
                selectedCategories.length > 0 || selectedTypes.length > 0 || 
                selectedColors.length > 0 || selectedSubcategories.length > 0 || sortBy) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-black hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  image={product.primary_image_url}
                  price={product.base_price}
                  compareAtPrice={product.compare_at_price}
                  collection={product.collection?.name}
                  collections={product.collections}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

