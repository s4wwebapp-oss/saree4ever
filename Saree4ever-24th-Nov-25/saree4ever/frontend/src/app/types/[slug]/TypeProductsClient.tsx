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
  base_price: number;
  compare_at_price: number | null;
  collections?: Array<{
    id?: string;
    name: string;
    slug?: string;
  }>;
}

export default function TypeProductsClient({ typeSlug }: { typeSlug: string }) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [searchParams, typeSlug]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const filters: any = { type: typeSlug };
      
      // Apply URL filters (but NOT type filter since we're on a type page)
      if (searchParams?.get('search')) filters.search = searchParams.get('search');
      if (searchParams?.get('minPrice')) filters.minPrice = searchParams.get('minPrice');
      if (searchParams?.get('maxPrice')) filters.maxPrice = searchParams.get('maxPrice');
      if (searchParams?.get('collections')) filters.collections = searchParams.get('collections')?.split(',');
      if (searchParams?.get('categories')) filters.categories = searchParams.get('categories')?.split(',');
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
      {/* Filters Sidebar */}
      <aside className="lg:w-64 flex-shrink-0">
        <FiltersSidebarEnhanced onFiltersChange={loadProducts} />
      </aside>

      {/* Products Grid */}
      <div className="flex-1">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {products.length} {products.length === 1 ? 'product' : 'products'} found
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  image={product.primary_image_url}
                  price={product.base_price}
                  compareAtPrice={product.compare_at_price}
                  collections={product.collections}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found for this type.</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}



