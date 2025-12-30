import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import FiltersSidebarEnhanced from '@/components/FiltersSidebarEnhanced';
import TypeProductsClient from './TypeProductsClient';
import Link from 'next/link';
import { Suspense } from 'react';

interface Type {
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

async function getType(slug: string): Promise<Type | null> {
  try {
    const response: any = await api.types.getAll();
    const types = (response as { types?: Type[] }).types || (response as Type[]) || [];
    return types.find(t => t.slug === slug) || null;
  } catch (error) {
    console.error('Error fetching type:', error);
    return null;
  }
}

export default async function TypePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const type = await getType(slug);

  if (!type) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="heading-serif-md mb-4">Type Not Found</h1>
            <p className="text-gray-600 mb-8">The fabric type you're looking for doesn't exist.</p>
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
            <li><Link href="/collections" className="hover:underline">Types</Link></li>
            <li>/</li>
            <li className="text-black font-medium">{type.name}</li>
          </ol>
        </nav>

        {/* Type Header */}
        <div className="mb-8">
          <h1 className="heading-serif-md mb-2">{type.name}</h1>
          {type.description && (
            <p className="text-gray-600 max-w-3xl">{type.description}</p>
          )}
        </div>

        {/* Products with Filters */}
        <Suspense fallback={<div className="text-center py-12">Loading products...</div>}>
          <TypeProductsClient typeSlug={slug} />
        </Suspense>
      </div>
    </div>
  );
}


