'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    icon: '',
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response: any = await api.categories.getAll();
      const categoriesData = response.categories || response || [];
      setCategories(categoriesData.sort((a: Category, b: Category) => a.display_order - b.display_order));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setIsCreating(false);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      icon: category.icon || '',
      is_active: category.is_active,
      display_order: category.display_order,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      icon: '',
      is_active: true,
      display_order: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.categories.update(editingId, formData);
      } else if (isCreating) {
        await api.categories.create(formData);
      }
      handleCancel();
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to save category');
      console.error('Error saving category:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.categories.delete(id);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
      console.error('Error deleting category:', err);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await api.categories.update(id, { is_active: !isActive });
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to update category');
      console.error('Error updating category:', err);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: editingId ? formData.slug : generateSlug(name),
    });
  };

  if (loading) {
    return <div className="text-center py-12">Loading categories...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-serif-md mb-2">Categories Management</h1>
          <p className="text-gray-600">Manage shopping intent categories (Bridal, Festive, Party, etc.)</p>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
            setFormData({
              name: '',
              slug: '',
              description: '',
              image_url: '',
              icon: '',
              is_active: true,
              display_order: categories.length,
            });
          }}
          className="btn-primary"
        >
          + Add New Category
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <form onSubmit={handleSubmit} className="border border-black p-6 bg-gray-50">
          <h2 className="font-semibold mb-4">{editingId ? 'Edit Category' : 'Create New Category'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleNameChange(e.target.value)}
                className="input-field"
                required
                placeholder="e.g., Bridal / Wedding"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="input-field"
                required
                placeholder="e.g., bridal-wedding"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Brief description of this category"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                type="url"
                value={formData.image_url || ''}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="input-field"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Icon</label>
              <input
                type="text"
                value={formData.icon || ''}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="input-field"
                placeholder="e.g., wedding, party, festival"
              />
              <p className="text-xs text-gray-500 mt-1">Icon identifier for UI display</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Display Order</label>
              <input
                type="number"
                value={formData.display_order || 0}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="input-field"
                min="0"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium">Active (visible on storefront)</span>
              </label>
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <button type="submit" className="btn-primary">
              {editingId ? 'Update Category' : 'Create Category'}
            </button>
            <button type="button" onClick={handleCancel} className="btn-outline">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Categories List */}
      <div className="border border-black">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-black">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Icon</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No categories found. Create your first category to get started.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{category.display_order}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{category.name}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{category.slug}</td>
                    <td className="px-4 py-3 text-sm">{category.icon || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {category.description || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(category.id, category.is_active)}
                        className={`text-xs px-2 py-1 rounded ${
                          category.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {category.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-600 space-y-2">
        <p><strong>Total Categories:</strong> {categories.length}</p>
        <p>
          Categories represent shopper intent and occasion (e.g., Bridal/Wedding, Festive, Party, Office/Formal).
          They appear in the "Shop By Category" menu and filters.
        </p>
        <div className="bg-blue-50 border border-blue-200 p-3 mt-3">
          <p className="font-medium mb-1">📌 Default Categories:</p>
          <ul className="text-xs space-y-1 ml-4 list-disc">
            <li>Bridal / Wedding</li>
            <li>Festive / Celebration</li>
            <li>Party / Evening Wear</li>
            <li>Designer / Premium</li>
            <li>Handloom / Artisanal</li>
            <li>Daily / Casual / Everyday</li>
            <li>Office / Formal / Workwear</li>
            <li>Lightweight / Travel-friendly</li>
            <li>Sustainable / Eco-friendly</li>
            <li>New Arrivals</li>
            <li>Sale / Offers / Clearance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


