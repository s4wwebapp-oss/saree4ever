'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Variant {
  id: string;
  name: string;
  sku: string;
  price: number;
  compare_at_price: number | null;
  color: string | null;
  size: string | null;
  stock_quantity: number;
  track_inventory: boolean;
  is_active: boolean;
  product?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Product {
  id: string;
  name: string;
  slug: string;
}

export default function AdminVariantsPage() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [filters, setFilters] = useState({
    search: '',
    lowStock: false,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      loadVariants(selectedProduct);
    } else {
      setVariants([]);
    }
  }, [selectedProduct]);

  const loadProducts = async () => {
    try {
      const response: any = await api.products.getAll({ limit: 1000 });
      const productsList = Array.isArray(response) ? response : response.products || [];
      setProducts(productsList);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadVariants = async (productId: string) => {
    setLoading(true);
    try {
      const response: any = await api.variants.getByProduct(productId);
      const variantsList = response.variants || response || [];
      setVariants(variantsList);
    } catch (error) {
      console.error('Failed to load variants:', error);
      setVariants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;
    
    try {
      await api.variants.delete(id);
      if (selectedProduct) {
        loadVariants(selectedProduct);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to delete variant');
    }
  };

  const handleStockUpdate = async (id: string, newStock: number) => {
    try {
      await api.variants.updateStock(id, newStock);
      if (selectedProduct) {
        loadVariants(selectedProduct);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to update stock');
    }
  };

  const filteredVariants = variants.filter((variant) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        variant.name?.toLowerCase().includes(searchLower) ||
        variant.sku?.toLowerCase().includes(searchLower) ||
        variant.color?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    if (filters.lowStock) {
      if (variant.stock_quantity > 10) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="heading-serif-md mb-2">Variants</h1>
          <p className="text-gray-600">Manage product variants and inventory</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="input-field text-sm"
            >
              <option value="">All Products</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Name, SKU, Color"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input-field text-sm"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.lowStock}
                onChange={(e) => setFilters({ ...filters, lowStock: e.target.checked })}
                className="w-4 h-4 border-black"
              />
              <span className="text-sm">Low Stock Only (&lt;10)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Variants Table */}
      {!selectedProduct ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">Select a product to view its variants</p>
        </div>
      ) : loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600">Loading variants...</p>
        </div>
      ) : filteredVariants.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">No variants found.</p>
          <Link
            href={`/admin/products/${selectedProduct}/edit`}
            className="btn-outline"
          >
            Add Variants to Product
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                <tr>
                  <th className="px-6 py-3">Variant Name</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Color</th>
                  <th className="px-6 py-3">Size</th>
                  <th className="px-6 py-3 text-right">Price</th>
                  <th className="px-6 py-3 text-right">Stock</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVariants.map((variant) => (
                  <tr key={variant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{variant.name || 'N/A'}</td>
                    <td className="px-6 py-4 font-mono text-xs">{variant.sku || 'N/A'}</td>
                    <td className="px-6 py-4">{variant.color || '—'}</td>
                    <td className="px-6 py-4">{variant.size || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium">₹{variant.price?.toLocaleString()}</div>
                      {variant.compare_at_price && (
                        <div className="text-xs text-gray-500 line-through">
                          ₹{variant.compare_at_price.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <input
                          type="number"
                          value={variant.stock_quantity || 0}
                          onChange={(e) => {
                            const newStock = parseInt(e.target.value) || 0;
                            handleStockUpdate(variant.id, newStock);
                          }}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          min="0"
                        />
                        {variant.track_inventory && (
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            variant.stock_quantity < 10
                              ? 'bg-red-100 text-red-800'
                              : variant.stock_quantity < 50
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {variant.stock_quantity < 10 ? 'Low' : variant.stock_quantity < 50 ? 'Medium' : 'Good'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        variant.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {variant.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/products/${variant.product?.id}/edit`}
                          className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(variant.id)}
                          className="text-red-600 hover:text-red-900 font-medium text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


