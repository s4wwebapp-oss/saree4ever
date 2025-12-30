import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import FiltersSidebarEnhanced from '@/components/FiltersSidebarEnhanced';
import CollectionProductsClient from './CollectionProductsClient';
import { Suspense } from 'react';

interface Product {
  id: string;
  slug: string;
  name: string;
  primary_image_url: string | null;
  image_urls?: (string | null)[] | null;
  variants?: Array<{ image_url?: string | null } | null>;
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

async function getCollectionProducts(slug: string, searchParams?: any): Promise<Product[]> {
  try {
    const filters: any = { collection: slug };
    
    // Apply URL filters
    if (searchParams?.search) filters.search = searchParams.search;
    if (searchParams?.minPrice) filters.minPrice = searchParams.minPrice;
    if (searchParams?.maxPrice) filters.maxPrice = searchParams.maxPrice;
    if (searchParams?.collections) filters.collections = searchParams.collections.split(',');
    if (searchParams?.categories) filters.categories = searchParams.categories.split(',');
    if (searchParams?.types) filters.types = searchParams.types.split(',');
    if (searchParams?.colors) filters.color = searchParams.colors.split(',');
    if (searchParams?.subcategories) filters.subcategories = searchParams.subcategories.split(',');
    if (searchParams?.sortBy) filters.sortBy = searchParams.sortBy;
    if (searchParams?.featured === 'true') filters.featured = true;
    
    const response = await api.products.getAll(filters);
    return (response as { products?: Product[] }).products || (response as Product[]) || [];
  } catch (error) {
    console.error('Error fetching collection products:', error);
    return [];
  }
}

export default async function CollectionProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const products = await getCollectionProducts(slug, resolvedSearchParams);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="heading-serif-md mb-2 capitalize">{slug.replace(/-/g, ' ')}</h1>
          <p className="text-gray-600">{products.length} products</p>
        </div>

        <Suspense fallback={<div className="text-center py-12">Loading products...</div>}>
          <CollectionProductsClient collectionSlug={slug} />
        </Suspense>
      </div>
    </div>
  );
}
