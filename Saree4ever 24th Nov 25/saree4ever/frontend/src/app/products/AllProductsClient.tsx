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
      {/* Filters Sidebar */}
      <aside className="lg:w-64 flex-shrink-0">
        <div className="sticky top-24">
          <FiltersSidebarEnhanced
            search={search}
            minPrice={minPrice}
            maxPrice={maxPrice}
            selectedCollections={selectedCollections}
            selectedCategories={selectedCategories}
            selectedTypes={selectedTypes}
            selectedColors={selectedColors}
            selectedSubcategories={selectedSubcategories}
            sortBy={sortBy}
            onSearchChange={(value) => updateFilters({ search: value })}
            onMinPriceChange={(value) => updateFilters({ minPrice: value })}
            onMaxPriceChange={(value) => updateFilters({ maxPrice: value })}
            onCollectionsChange={(value) => updateFilters({ selectedCollections: value })}
            onCategoriesChange={(value) => updateFilters({ selectedCategories: value })}
            onTypesChange={(value) => updateFilters({ selectedTypes: value })}
            onColorsChange={(value) => updateFilters({ selectedColors: value })}
            onSubcategoriesChange={(value) => updateFilters({ selectedSubcategories: value })}
            onSortChange={(value) => updateFilters({ sortBy: value })}
            onClearFilters={clearFilters}
          />
        </div>
      </aside>

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
            <div className="mb-4 flex items-center justify-between">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

