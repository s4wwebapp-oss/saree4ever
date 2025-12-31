'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DataTable from '@/components/admin/DataTable';
import Image from 'next/image';

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Type {
  id: string;
  name: string;
  slug: string;
}

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

export default function AdminProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams?.get('action');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // List view state
  const [products, setProducts] = useState<Product[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [selected, setSelected] = useState<Product[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    collection: '',
    type: '',
    category: '',
    featured: '',
    active: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
  });
  const [listCollections, setListCollections] = useState<any[]>([]);
  const [listTypes, setListTypes] = useState<any[]>([]);
  
  // Options for multi-select
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  
  // Bulk actions state
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [bulkLoading, setBulkLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    compare_at_price: '',
    mrp: '',
    sku: '',
    color: '',
    weave: '',
    length_m: '',
    blouse_included: false,
    subcategories: [] as string[],
    collection_ids: [] as string[],
    category_ids: [] as string[],
    type_ids: [] as string[],
    is_featured: false,
    is_active: true,
  });
  const [subcategoriesInput, setSubcategoriesInput] = useState<string>('');

  // Load collections, categories, and types
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        const [collectionsResponse, categoriesResponse, typesResponse] = await Promise.all([
          api.collections.getAll(),
          api.categories.getAll(),
          api.types.getAll(),
        ]);
        
        // Extract arrays from response objects
        // API returns { collections: [...] }, { categories: [...] }, { types: [...] }
        const collectionsArray = (collectionsResponse as any)?.collections || (collectionsResponse as Collection[]) || [];
        const categoriesArray = (categoriesResponse as any)?.categories || (categoriesResponse as Category[]) || [];
        const typesArray = (typesResponse as any)?.types || (typesResponse as Type[]) || [];
        
        // Ensure we have arrays
        setCollections(Array.isArray(collectionsArray) ? collectionsArray : []);
        setCategories(Array.isArray(categoriesArray) ? categoriesArray : []);
        setTypes(Array.isArray(typesArray) ? typesArray : []);
      } catch (err: any) {
        console.error('Failed to load options:', err);
        // Set empty arrays on error to prevent map errors
        setCollections([]);
        setCategories([]);
        setTypes([]);
      } finally {
        setLoadingOptions(false);
      }
    };
    
    loadOptions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleMultiSelectChange = (name: 'collection_ids' | 'category_ids' | 'type_ids', value: string) => {
    const currentIds = formData[name];
    const newIds = currentIds.includes(value)
      ? currentIds.filter(id => id !== value)
      : [...currentIds, value];
    
    setFormData({
      ...formData,
      [name]: newIds,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const productData = {
        ...formData,
        base_price: parseFloat(formData.base_price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        mrp: formData.mrp ? parseFloat(formData.mrp) : null,
        length_m: formData.length_m ? parseFloat(formData.length_m) : null,
        subcategories: formData.subcategories.length > 0 ? formData.subcategories : undefined,
      };

      const response: any = await api.products.create(productData);
      setSuccess(`Product created successfully! ID: ${response.id || response.product?.id}`);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        base_price: '',
        compare_at_price: '',
        mrp: '',
        sku: '',
        color: '',
        weave: '',
        length_m: '',
        blouse_included: false,
        subcategories: [],
        collection_ids: [],
        category_ids: [],
        type_ids: [],
        is_featured: false,
        is_active: true,
      });
      setSubcategoriesInput('');

      // Optionally redirect to product page
      // router.push(`/product/${response.slug}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  // Load products for list view
  useEffect(() => {
    if (action !== 'create') {
      loadProducts();
      loadListFilters();
    }
  }, [action, filters]);

  const loadProducts = async () => {
    try {
      setListLoading(true);
      const apiFilters: any = {
        active: filters.active === 'true' ? true : filters.active === 'false' ? false : undefined,
        featured: filters.featured === 'true' ? true : undefined,
      };
      
      if (filters.search) apiFilters.search = filters.search;
      if (filters.collection) apiFilters.collections = filters.collection;
      if (filters.type) apiFilters.types = filters.type;
      if (filters.category) apiFilters.categories = filters.category;
      if (filters.minPrice) apiFilters.minPrice = filters.minPrice;
      if (filters.maxPrice) apiFilters.maxPrice = filters.maxPrice;
      if (filters.sortBy) apiFilters.sortBy = filters.sortBy;
      
      const response: any = await api.products.getAll(apiFilters);
      const productsData = (response as { products?: Product[] }).products || (response as Product[]) || [];
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setListLoading(false);
    }
  };

  const loadListFilters = async () => {
    try {
      const [collectionsData, typesData] = await Promise.all([
        api.collections.getAll(),
        api.types.getAll(),
      ]);
      setListCollections((collectionsData as any)?.collections || collectionsData || []);
      setListTypes((typesData as any)?.types || typesData || []);
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

  // If action is not 'create', show list view
  if (action !== 'create') {
    return (
      <div className="space-y-6">
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

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="heading-serif-md mb-2">Products</h1>
            <p className="text-gray-600">{products.length} products</p>
          </div>
          <Link href="/admin/products?action=create" className="btn-primary">
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
                {listCollections.map((col) => (
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
                {listTypes.map((type) => (
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
                  search: '', collection: '', type: '', category: '', featured: '', 
                  active: '', minPrice: '', maxPrice: '', sortBy: 'newest' 
                })}
                className="btn-outline text-sm w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

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
                {listCollections.map((collection: any) => (
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
          loading={listLoading}
          onRowClick={(product) => {
            router.push(`/admin/products/${product.id}/edit`);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/products" className="text-sm text-gray-600 hover:underline mb-4 inline-block">
          ← Back to Products
        </Link>
        <h1 className="heading-serif-md">Create Product</h1>
      </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700">
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Product Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Base Price (₹) *</label>
              <input
                type="number"
                name="base_price"
                required
                step="0.01"
                value={formData.base_price}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Compare At Price (₹)</label>
              <input
                type="number"
                name="compare_at_price"
                step="0.01"
                value={formData.compare_at_price}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">MRP (₹)</label>
              <input
                type="number"
                name="mrp"
                step="0.01"
                value={formData.mrp}
                onChange={handleChange}
                className="input-field"
                placeholder="Original price before discount"
              />
            </div>
          </div>

          {/* Product Attributes */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="font-semibold mb-4">Product Attributes</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Red, Maroon, Blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Weave</label>
                <input
                  type="text"
                  name="weave"
                  value={formData.weave}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Kanjivaram weave, Banarasi weave"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Length (meters)</label>
                <input
                  type="number"
                  name="length_m"
                  step="0.1"
                  value={formData.length_m}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 5.5, 6.0"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="blouse_included"
                    checked={formData.blouse_included}
                    onChange={handleChange}
                    className="w-4 h-4 border-black"
                  />
                  <span className="text-sm">Blouse Included</span>
                </label>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Subcategories</label>
              <p className="text-xs text-gray-600 mb-2">Enter subcategories separated by commas (e.g., Pure Silk, Handloom)</p>
              <input
                type="text"
                value={subcategoriesInput}
                onChange={(e) => {
                  // Allow free typing - don't parse immediately
                  const inputValue = e.target.value;
                  setSubcategoriesInput(inputValue);
                }}
                onBlur={(e) => {
                  // Parse and update formData only when user finishes typing (on blur)
                  const inputValue = e.target.value;
                  const subcats = inputValue
                    .split(',')
                    .map(s => s.trim())
                    .filter(s => s.length > 0);
                  // Update both the input display and formData
                  const formattedValue = subcats.join(', ');
                  setSubcategoriesInput(formattedValue);
                  setFormData({ ...formData, subcategories: subcats });
                }}
                className="input-field"
                placeholder="Pure Silk, Handloom, Designer"
              />
            </div>
          </div>

          {/* Multi-select for Collections */}
          <div>
            <label className="block text-sm font-medium mb-2">Collections</label>
            <p className="text-xs text-gray-600 mb-2">Select one or more collections this product belongs to</p>
            <div className="border border-gray-300 rounded p-3 max-h-48 overflow-y-auto">
              {loadingOptions ? (
                <p className="text-sm text-gray-500">Loading collections...</p>
              ) : collections.length === 0 ? (
                <p className="text-sm text-gray-500">No collections available</p>
              ) : (
                <div className="space-y-2">
                  {collections.map((collection) => (
                    <label key={collection.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.collection_ids.includes(collection.id)}
                        onChange={() => handleMultiSelectChange('collection_ids', collection.id)}
                        className="w-4 h-4 border-black"
                      />
                      <span className="text-sm">{collection.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Multi-select for Categories */}
          <div>
            <label className="block text-sm font-medium mb-2">Categories</label>
            <p className="text-xs text-gray-600 mb-2">Select one or more categories this product belongs to</p>
            <div className="border border-gray-300 rounded p-3 max-h-48 overflow-y-auto">
              {loadingOptions ? (
                <p className="text-sm text-gray-500">Loading categories...</p>
              ) : categories.length === 0 ? (
                <p className="text-sm text-gray-500">No categories available</p>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.category_ids.includes(category.id)}
                        onChange={() => handleMultiSelectChange('category_ids', category.id)}
                        className="w-4 h-4 border-black"
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Multi-select for Types */}
          <div>
            <label className="block text-sm font-medium mb-2">Types</label>
            <p className="text-xs text-gray-600 mb-2">Select one or more types this product belongs to</p>
            <div className="border border-gray-300 rounded p-3 max-h-48 overflow-y-auto">
              {loadingOptions ? (
                <p className="text-sm text-gray-500">Loading types...</p>
              ) : types.length === 0 ? (
                <p className="text-sm text-gray-500">No types available</p>
              ) : (
                <div className="space-y-2">
                  {types.map((type) => (
                    <label key={type.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.type_ids.includes(type.id)}
                        onChange={() => handleMultiSelectChange('type_ids', type.id)}
                        className="w-4 h-4 border-black"
                      />
                      <span className="text-sm">{type.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="w-4 h-4 border-black"
              />
              <span className="text-sm">Featured Product</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 border-black"
              />
              <span className="text-sm">Active</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </form>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Note: After creating a product, you can add variants from the product detail page.
        </p>
      </div>
    </div>
  );
}

