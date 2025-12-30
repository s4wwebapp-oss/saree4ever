import { api } from '@/lib/api';
import CollectionProductsClient from '../[slug]/CollectionProductsClient';
import Link from 'next/link';
import { Suspense } from 'react';

export default async function NewArrivalsPage() {
  // Fetch products that are in the "new-arrivals" collection or recently added
  // For now, we'll use a client component that filters by collection
  const collectionSlug = 'new-arrivals';

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li>/</li>
            <li><Link href="/collections" className="hover:underline">Collections</Link></li>
            <li>/</li>
            <li className="text-black font-medium">New Arrivals</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="heading-serif-md mb-2">New Arrivals</h1>
          <p className="text-gray-600 max-w-3xl">
            Discover our latest saree collections - fresh designs and timeless elegance
          </p>
        </div>

        {/* Products with Filters */}
        <Suspense fallback={<div className="text-center py-12">Loading products...</div>}>
          <CollectionProductsClient collectionSlug={collectionSlug} />
        </Suspense>
      </div>
    </div>
  );
}


