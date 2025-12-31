import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import FiltersSidebarEnhanced from '@/components/FiltersSidebarEnhanced';
import CategoryProductsClient from './CategoryProductsClient';
import Link from 'next/link';
import { Suspense } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

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

async function getCategory(slug: string): Promise<Category | null> {
  try {
    const response: any = await api.categories.getAll();
    const categories = (response as { categories?: Category[] }).categories || (response as Category[]) || [];
    return categories.find(c => c.slug === slug) || null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const category = await getCategory(slug);

  if (!category) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="heading-serif-md mb-4">Category Not Found</h1>
            <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
            <Link href="/collections" className="btn-primary">
              Browse All Collections
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li>/</li>
            <li><Link href="/collections" className="hover:underline">Categories</Link></li>
            <li>/</li>
            <li className="text-black font-medium">{category.name}</li>
          </ol>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="heading-serif-md mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-gray-600 max-w-3xl">{category.description}</p>
          )}
        </div>

        {/* Products with Filters */}
        <Suspense fallback={<div className="text-center py-12">Loading products...</div>}>
          <CategoryProductsClient categorySlug={slug} />
        </Suspense>
      </div>
    </div>
  );
}



