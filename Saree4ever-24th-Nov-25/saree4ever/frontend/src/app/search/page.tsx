import Link from 'next/link';
import { Suspense } from 'react';
import SearchClient from './SearchClient';

export default function SearchPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li>/</li>
            <li className="text-black font-medium">Search</li>
          </ol>
        </nav>

        <Suspense fallback={<div className="text-center py-12">Loading search...</div>}>
          <SearchClient />
        </Suspense>
      </div>
    </div>
  );
}
