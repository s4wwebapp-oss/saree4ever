'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

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
  description: string | null;
  long_description: string | null;
  base_price: number;
  compare_at_price: number | null;
  mrp: number | null;
  sku: string | null;
  color: string | null;
  weave: string | null;
  length_m: number | null;
  blouse_included: boolean;
  subcategories: string[];
  collection_ids?: string[];
  category_ids?: string[];
  type_ids?: string[];
  is_featured: boolean;
  is_active: boolean;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [formData, setFormData] = useState<Product | null>(null);

  // Load product and options
  useEffect(() => {
    if (productId) {
      loadProduct();
      loadOptions();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response: any = await api.products.getById(productId);
      const product = (response as { product?: Product }).product || response as Product;
      
      // Extract IDs from relationships
      const productData: Product = {
        ...product,
        collection_ids: (product as any).collections?.map((c: any) => c.id) || [],
        category_ids: (product as any).categories?.map((c: any) => c.id) || [],
        type_ids: (product as any).types?.map((t: any) => t.id) || [],
        subcategories: product.subcategories || [],
      };
      
      setFormData(productData);
    } catch (error: any) {
      console.error('Failed to load product:', error);
      setError('Failed to load product: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      setLoadingOptions(true);
      const [collectionsRes, categoriesRes, typesRes] = await Promise.all([
        api.collections.getAll(),
        api.categories.getAll(),
        api.types.getAll(),
      ]);
      
      setCollections((collectionsRes as any)?.collections || collectionsRes || []);
      setCategories((categoriesRes as any)?.categories || categoriesRes || []);
      setTypes((typesRes as any)?.types || typesRes || []);
    } catch (error) {
      console.error('Failed to load options:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleMultiSelectChange = (name: 'collection_ids' | 'category_ids' | 'type_ids', value: string) => {
    if (!formData) return;
    
    const currentIds = formData[name] || [];
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
    if (!formData || !productId) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const productData = {
        ...formData,
        base_price: parseFloat(String(formData.base_price)),
        compare_at_price: formData.compare_at_price ? parseFloat(String(formData.compare_at_price)) : null,
        mrp: formData.mrp ? parseFloat(String(formData.mrp)) : null,
        length_m: formData.length_m ? parseFloat(String(formData.length_m)) : null,
        subcategories: formData.subcategories.length > 0 ? formData.subcategories : undefined,
      };

      await api.products.update(productId, productData);
      setSuccess('Product updated successfully!');
      
      // Redirect to products list after 2 seconds
      setTimeout(() => {
        router.push('/admin/products');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Product not found</p>
        <Link href="/admin/products" className="btn-outline mt-4 inline-block">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/products" className="text-sm text-gray-600 hover:underline mb-4 inline-block">
          ← Back to Products
        </Link>
        <h1 className="heading-serif-md">Edit Product</h1>
        <p className="text-sm text-gray-600 mt-1">{formData.name}</p>
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
            <p className="text-sm mt-1">Redirecting to products list...</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="border-t border-gray-200 pt-6">
          <h2 className="font-semibold mb-4">Basic Information</h2>
          
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

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
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
                value={formData.compare_at_price || ''}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku || ''}
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
                value={formData.mrp || ''}
                onChange={handleChange}
                className="input-field"
                placeholder="Original price before discount"
              />
            </div>
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
                value={formData.color || ''}
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
                value={formData.weave || ''}
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
                value={formData.length_m || ''}
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
              value={(formData.subcategories || []).join(', ')}
              onChange={(e) => {
                const subcats = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                setFormData({ ...formData, subcategories: subcats });
              }}
              className="input-field"
              placeholder="Pure Silk, Handloom, Designer"
            />
          </div>
        </div>

        {/* Taxonomy */}
        <div className="border-t border-gray-200 pt-6">
          <h2 className="font-semibold mb-4">Taxonomy</h2>

          {/* Collections */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Collections</label>
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
                        checked={(formData.collection_ids || []).includes(collection.id)}
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

          {/* Categories */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Categories</label>
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
                        checked={(formData.category_ids || []).includes(category.id)}
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

          {/* Types */}
          <div>
            <label className="block text-sm font-medium mb-2">Types / Fabrics</label>
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
                        checked={(formData.type_ids || []).includes(type.id)}
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
        </div>

        {/* Status */}
        <div className="border-t border-gray-200 pt-6">
          <h2 className="font-semibold mb-4">Status</h2>
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
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 pt-6 flex items-center space-x-4">
          <button
            type="submit"
            disabled={saving}
            className={`btn-primary ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/admin/products" className="btn-outline">
            Cancel
          </Link>
          <Link
            href={`/product/${(formData as any).slug}`}
            target="_blank"
            className="btn-outline text-sm"
          >
            View on Storefront
          </Link>
        </div>
      </form>
    </div>
  );
}


