'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import DataTable from '@/components/admin/DataTable';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  base_price: number;
  primary_image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  collections?: Array<{ name: string; slug: string }>;
  types?: Array<{ name: string }>;
  variants?: Array<{ stock_quantity: number }>;
}

export default function ProductsListPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Product[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    collection: '',
    type: '',
    category: '',
    featured: '',
    active: 'true',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
  });
  const [collections, setCollections] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    loadProducts();
    loadFilters();
  }, [filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const apiFilters: any = {
        active: filters.active === 'true' ? true : filters.active === 'false' ? false : undefined,
        featured: filters.featured === 'true' ? true : undefined,
      };
      
      if (filters.search) apiFilters.search = filters.search;
      if (filters.collection) apiFilters.collection = filters.collection;
      if (filters.type) apiFilters.type = filters.type;
      if (filters.category) apiFilters.category = filters.category;
      if (filters.minPrice) apiFilters.minPrice = filters.minPrice;
      if (filters.maxPrice) apiFilters.maxPrice = filters.maxPrice;
      if (filters.sortBy) apiFilters.sortBy = filters.sortBy;
      
      const response: any = await api.products.getAll(apiFilters);
      const productsData = (response as { products?: Product[] }).products || (response as Product[]) || [];
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const [collectionsData, typesData] = await Promise.all([
        api.collections.getAll(),
        api.types.getAll(),
      ]);
      setCollections((collectionsData as any)?.collections || collectionsData || []);
      setTypes((typesData as any)?.types || typesData || []);
    } catch (error) {
      console.error('Failed to load filters:', error);
    }
  };

  const getTotalStock = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return 0;
    return product.variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);
  };

  // Bulk action handlers
  const handleBulkSetFeatured = async () => {
    if (selected.length === 0) return;
    
    setBulkLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const promises = selected.map(product =>
        api.products.update(product.id, { is_featured: true })
      );
      
      await Promise.all(promises);
      setSuccess(`Successfully set ${selected.length} product(s) as featured`);
      setSelected([]);
      loadProducts();
    } catch (err: any) {
      setError(err.message || 'Failed to set products as featured');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkChangeCollection = async () => {
    if (selected.length === 0 || !selectedCollectionId) return;
    
    setBulkLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const promises = selected.map(product =>
        api.products.update(product.id, { collection_ids: [selectedCollectionId] })
      );
      
      await Promise.all(promises);
      setSuccess(`Successfully changed collection for ${selected.length} product(s)`);
      setSelected([]);
      setShowCollectionModal(false);
      setSelectedCollectionId('');
      loadProducts();
    } catch (err: any) {
      setError(err.message || 'Failed to change collection');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    
    setBulkLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const promises = selected.map(product =>
        api.products.delete(product.id)
      );
      
      await Promise.all(promises);
      setSuccess(`Successfully deleted ${selected.length} product(s)`);
      setSelected([]);
      setShowDeleteConfirm(false);
      loadProducts();
    } catch (err: any) {
      setError(err.message || 'Failed to delete products');
    } finally {
      setBulkLoading(false);
    }
  };

  const columns = [
    {
      key: 'primary_image_url',
      label: 'Image',
      render: (product: Product) => (
        <div className="w-16 h-20 relative bg-gray-100">
          {product.primary_image_url ? (
            <Image
              src={product.primary_image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Title',
      sortable: true,
      render: (product: Product) => (
        <div>
          <div className="font-medium">{product.name}</div>
          <div className="text-xs text-gray-600">{product.sku || 'No SKU'}</div>
        </div>
      ),
    },
    {
      key: 'base_price',
      label: 'Price',
      sortable: true,
      render: (product: Product) => `₹${product.base_price.toLocaleString()}`,
    },
    {
      key: 'collections',
      label: 'Collections',
      render: (product: Product) => (
        <div className="flex flex-wrap gap-1">
          {product.collections?.slice(0, 2).map((col, i) => (
            <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
              {col.name}
            </span>
          ))}
          {product.collections && product.collections.length > 2 && (
            <span className="text-xs text-gray-500">+{product.collections.length - 2}</span>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      sortable: true,
      render: (product: Product) => {
        const total = getTotalStock(product);
        return (
          <span className={total < 10 ? 'text-red-600 font-medium' : ''}>
            {total}
          </span>
        );
      },
    },
    {
      key: 'is_featured',
      label: 'Featured',
      render: (product: Product) => (
        <span className={product.is_featured ? 'text-green-600' : 'text-gray-400'}>
          {product.is_featured ? '★' : '☆'}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (product: Product) => (
        <span className={`text-xs px-2 py-1 rounded ${
          product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {product.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (product: Product) => (
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="text-sm text-blue-600 hover:underline"
          >
            Edit
          </Link>
          <Link
            href={`/product/${product.slug}`}
            target="_blank"
            className="text-sm text-gray-600 hover:underline"
          >
            View
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="heading-serif-md mb-2">Products</h1>
          <p className="text-gray-600">{products.length} products</p>
        </div>
        <Link href="/admin/products/create" className="btn-primary">
          + New Product
        </Link>
      </div>

      {/* Filters */}
      <div className="border border-black p-4 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Name, SKU..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Min Price (₹)</label>
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Max Price (₹)</label>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Collection</label>
            <select
              value={filters.collection}
              onChange={(e) => setFilters({ ...filters, collection: e.target.value })}
              className="input-field text-sm"
            >
              <option value="">All Collections</option>
              {collections.map((col) => (
                <option key={col.id} value={col.slug}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="input-field text-sm"
            >
              <option value="">All Types</option>
              {types.map((type) => (
                <option key={type.id} value={type.slug}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">Status</label>
            <select
              value={filters.active}
              onChange={(e) => setFilters({ ...filters, active: e.target.value })}
              className="input-field text-sm"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Sort By</label>
            <select
              value={filters.sortBy || 'newest'}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="input-field text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({
                search: '',
                collection: '',
                type: '',
                category: '',
                featured: '',
                active: 'true',
                minPrice: '',
                maxPrice: '',
                sortBy: 'newest',
              })}
              className="btn-outline text-sm w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
          <button
            onClick={() => setSuccess(null)}
            className="float-right text-green-700 hover:text-green-900"
          >
            ×
          </button>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="border border-black p-4 bg-yellow-50 flex items-center justify-between">
          <span className="text-sm font-medium">{selected.length} products selected</span>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleBulkSetFeatured}
              disabled={bulkLoading}
              className="btn-outline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkLoading ? 'Processing...' : 'Set Featured'}
            </button>
            <button 
              onClick={() => setShowCollectionModal(true)}
              disabled={bulkLoading}
              className="btn-outline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Change Collection
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              disabled={bulkLoading}
              className="btn-outline text-sm text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Collection Selection Modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">Change Collection</h2>
            <p className="text-sm text-gray-600 mb-4">
              Select a collection for {selected.length} product(s)
            </p>
            <select
              value={selectedCollectionId}
              onChange={(e) => setSelectedCollectionId(e.target.value)}
              className="w-full border border-black px-3 py-2 mb-4"
            >
              <option value="">Select a collection...</option>
              {collections.map((collection: any) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkChangeCollection}
                disabled={!selectedCollectionId || bulkLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkLoading ? 'Updating...' : 'Update'}
              </button>
              <button
                onClick={() => {
                  setShowCollectionModal(false);
                  setSelectedCollectionId('');
                }}
                disabled={bulkLoading}
                className="btn-outline disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Confirm Delete</h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete {selected.length} product(s)? This action cannot be undone.
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkDelete}
                disabled={bulkLoading}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkLoading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={bulkLoading}
                className="btn-outline disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <DataTable
        data={products}
        columns={columns}
        selectable={true}
        onSelectionChange={setSelected}
        loading={loading}
        onRowClick={(product) => {
          router.push(`/admin/products/${product.id}/edit`);
        }}
      />
    </div>
  );
}

