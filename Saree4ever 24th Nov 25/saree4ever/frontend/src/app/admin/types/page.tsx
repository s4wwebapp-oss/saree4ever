'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Type {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export default function AdminTypesPage() {
  const [types, setTypes] = useState<Type[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Type>>({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const response: any = await api.types.getAll();
      const typesData = response.types || response || [];
      setTypes(typesData.sort((a: Type, b: Type) => a.display_order - b.display_order));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch types');
      console.error('Error fetching types:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (type: Type) => {
    setEditingId(type.id);
    setIsCreating(false);
    setFormData({
      name: type.name,
      slug: type.slug,
      description: type.description || '',
      image_url: type.image_url || '',
      is_active: type.is_active,
      display_order: type.display_order,
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
      is_active: true,
      display_order: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.types.update(editingId, formData);
      } else if (isCreating) {
        await api.types.create(formData);
      }
      handleCancel();
      fetchTypes();
    } catch (err: any) {
      alert(err.message || 'Failed to save type');
      console.error('Error saving type:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this type?')) return;
    try {
      await api.types.delete(id);
      fetchTypes();
    } catch (err: any) {
      alert(err.message || 'Failed to delete type');
      console.error('Error deleting type:', err);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await api.types.update(id, { is_active: !isActive });
      fetchTypes();
    } catch (err: any) {
      alert(err.message || 'Failed to update type');
      console.error('Error updating type:', err);
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
    return <div className="text-center py-12">Loading types...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-serif-md mb-2">Types Management</h1>
          <p className="text-gray-600">Manage fabric and weave types (Kanjivaram, Banarasi, Cotton, etc.)</p>
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
              is_active: true,
              display_order: types.length,
            });
          }}
          className="btn-primary"
        >
          + Add New Type
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
          <h2 className="font-semibold mb-4">{editingId ? 'Edit Type' : 'Create New Type'}</h2>
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
                placeholder="e.g., Kanjivaram"
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
                placeholder="e.g., kanjivaram"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Brief description of this type"
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
              {editingId ? 'Update Type' : 'Create Type'}
            </button>
            <button type="button" onClick={handleCancel} className="btn-outline">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Types List */}
      <div className="border border-black">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-black">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {types.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No types found. Create your first type to get started.
                  </td>
                </tr>
              ) : (
                types.map((type) => (
                  <tr key={type.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{type.display_order}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{type.name}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{type.slug}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {type.description || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(type.id, type.is_active)}
                        className={`text-xs px-2 py-1 rounded ${
                          type.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {type.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(type)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(type.id)}
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

      <div className="text-sm text-gray-600">
        <p><strong>Total Types:</strong> {types.length}</p>
        <p className="mt-2">
          Types define the fabric and weave construction (e.g., Kanjivaram, Banarasi, Cotton, Chiffon).
          They appear in the "Shop By Type" menu and filters.
        </p>
      </div>
    </div>
  );
}


