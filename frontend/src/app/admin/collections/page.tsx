'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
  image_url: string | null;
}

interface CollectionFormData {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
}

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    activeOnly: false,
  });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CollectionFormData>({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const response: any = await api.collections.getAll();
      const collectionsList = response.collections || response || [];
      setCollections(collectionsList);
    } catch (error) {
      console.error('Failed to load collections:', error);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCollection(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      is_active: true,
      display_order: collections.length,
    });
    setShowModal(true);
  };

  const openEditModal = (collection: Collection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      slug: collection.slug,
      description: collection.description || '',
      image_url: collection.image_url || '',
      is_active: collection.is_active,
      display_order: collection.display_order,
    });
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Auto-generate slug from name
    if (name === 'name' && !editingCollection) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Collection name is required');
      return;
    }

    setSaving(true);
    try {
      if (editingCollection) {
        await api.collections.update(editingCollection.id, formData);
      } else {
        await api.collections.create(formData);
      }
      setShowModal(false);
      loadCollections();
    } catch (error: any) {
      alert(error.message || 'Failed to save collection');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;
    
    try {
      await api.collections.delete(id);
      loadCollections();
    } catch (error: any) {
      alert(error.message || 'Failed to delete collection');
    }
  };

  const handleStatusToggle = async (id: string, isActive: boolean) => {
    try {
      await api.collections.update(id, { is_active: !isActive });
      loadCollections();
    } catch (error: any) {
      alert(error.message || 'Failed to update collection status');
    }
  };

  const filteredCollections = collections.filter((collection) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        collection.name?.toLowerCase().includes(searchLower) ||
        collection.slug?.toLowerCase().includes(searchLower) ||
        collection.description?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    if (filters.activeOnly) {
      if (!collection.is_active) return false;
    }
    return true;
  });

  // Sort by display_order
  const sortedCollections = [...filteredCollections].sort(
    (a, b) => a.display_order - b.display_order
  );

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="heading-serif-md mb-2">Collections</h1>
          <p className="text-gray-600">Manage product collections</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary"
        >
          + New Collection
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Name, Slug, Description"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input-field text-sm"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.activeOnly}
                onChange={(e) => setFilters({ ...filters, activeOnly: e.target.checked })}
                className="w-4 h-4 border-black"
              />
              <span className="text-sm">Active Only</span>
            </label>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ search: '', activeOnly: false })}
              className="btn-outline w-full text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Collections Grid */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600">Loading collections...</p>
        </div>
      ) : sortedCollections.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">No collections found.</p>
          <button
            onClick={openCreateModal}
            className="btn-outline"
          >
            Create Your First Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCollections.map((collection) => (
            <div
              key={collection.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {collection.image_url && (
                <div className="h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={collection.image_url}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold">{collection.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    collection.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {collection.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{collection.slug}</p>
                {collection.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {collection.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    Order: {collection.display_order}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStatusToggle(collection.id, collection.is_active)}
                      className={`text-xs px-3 py-1 rounded ${
                        collection.is_active
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {collection.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => openEditModal(collection)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(collection.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Collection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingCollection ? 'Edit Collection' : 'Create New Collection'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Collection Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleFormChange}
                  className="input-field"
                  placeholder="e.g., Summer Collection"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleFormChange}
                  className="input-field"
                  placeholder="Auto-generated from name"
                />
                <p className="text-xs text-gray-500 mt-1">Used in URLs. Auto-generated if left empty.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  className="input-field"
                  rows={3}
                  placeholder="Describe this collection..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleFormChange}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Display Order</label>
                  <input
                    type="number"
                    name="display_order"
                    value={formData.display_order}
                    onChange={handleFormChange}
                    className="input-field"
                    min="0"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center space-x-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleFormChange}
                      className="w-4 h-4 border-black"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? 'Saving...' : editingCollection ? 'Update Collection' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

