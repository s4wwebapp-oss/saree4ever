'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface FilterOption {
  id: string;
  filter_type: string;
  name: string;
  value: string;
  display_order: number;
  is_active: boolean;
  metadata: {
    hex?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

interface FilterOptionFormData {
  filter_type: string;
  name: string;
  value: string;
  display_order: number;
  is_active: boolean;
  metadata: {
    hex?: string;
  };
}

const FILTER_TYPES = [
  { value: 'color', label: 'Color', description: 'Color swatches for product filtering' },
  { value: 'sort', label: 'Sort Option', description: 'Sorting options for product listing' },
  { value: 'size', label: 'Size', description: 'Size options for clothing' },
  { value: 'fabric', label: 'Fabric', description: 'Fabric/material types' },
  { value: 'price_range', label: 'Price Range', description: 'Predefined price ranges' },
];

export default function AdminFilterOptionsPage() {
  const [options, setOptions] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('color');
  const [showModal, setShowModal] = useState(false);
  const [editingOption, setEditingOption] = useState<FilterOption | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FilterOptionFormData>({
    filter_type: 'color',
    name: '',
    value: '',
    display_order: 0,
    is_active: true,
    metadata: {},
  });

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    setLoading(true);
    try {
      const response: any = await api.filterOptions.getAll();
      const optionsList = response.options || [];
      setOptions(optionsList);
    } catch (error) {
      console.error('Failed to load filter options:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOptions = () => {
    return options
      .filter((opt) => opt.filter_type === activeTab)
      .sort((a, b) => a.display_order - b.display_order);
  };

  const openCreateModal = () => {
    const filteredOptions = getFilteredOptions();
    setEditingOption(null);
    setFormData({
      filter_type: activeTab,
      name: '',
      value: '',
      display_order: filteredOptions.length,
      is_active: true,
      metadata: activeTab === 'color' ? { hex: '#000000' } : {},
    });
    setShowModal(true);
  };

  const openEditModal = (option: FilterOption) => {
    setEditingOption(option);
    setFormData({
      filter_type: option.filter_type,
      name: option.name,
      value: option.value,
      display_order: option.display_order,
      is_active: option.is_active,
      metadata: option.metadata || {},
    });
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'hex') {
      setFormData((prev) => ({
        ...prev,
        metadata: { ...prev.metadata, hex: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value,
      }));
    }

    // Auto-generate value from name
    if (name === 'name' && !editingOption) {
      const autoValue = value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
      setFormData((prev) => ({ ...prev, value: autoValue }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.value.trim()) {
      alert('Name and value are required');
      return;
    }

    setSaving(true);
    try {
      if (editingOption) {
        await api.filterOptions.update(editingOption.id, formData);
      } else {
        await api.filterOptions.create(formData);
      }
      setShowModal(false);
      loadOptions();
    } catch (error: any) {
      alert(error.message || 'Failed to save filter option');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this filter option?')) return;

    try {
      await api.filterOptions.delete(id);
      loadOptions();
    } catch (error: any) {
      alert(error.message || 'Failed to delete filter option');
    }
  };

  const handleStatusToggle = async (id: string, isActive: boolean) => {
    try {
      await api.filterOptions.update(id, { is_active: !isActive });
      loadOptions();
    } catch (error: any) {
      alert(error.message || 'Failed to update status');
    }
  };

  const moveOption = async (id: string, direction: 'up' | 'down') => {
    const filteredOptions = getFilteredOptions();
    const index = filteredOptions.findIndex((opt) => opt.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= filteredOptions.length) return;

    const updates = [
      { id: filteredOptions[index].id, display_order: newIndex },
      { id: filteredOptions[newIndex].id, display_order: index },
    ];

    try {
      await api.filterOptions.updateOrder(updates);
      loadOptions();
    } catch (error: any) {
      alert(error.message || 'Failed to update order');
    }
  };

  const filteredOptions = getFilteredOptions();
  const activeCount = options.filter((opt) => opt.filter_type === activeTab && opt.is_active).length;
  const totalCount = filteredOptions.length;

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="heading-serif-lg">Filter Options</h1>
            <p className="text-gray-600 mt-1">
              Manage colors, sizes, sort options, and other filter values shown on the storefront.
            </p>
          </div>
          <button onClick={openCreateModal} className="btn-primary">
            + Add {FILTER_TYPES.find((t) => t.value === activeTab)?.label || 'Option'}
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {FILTER_TYPES.map((type) => {
              const count = options.filter((opt) => opt.filter_type === type.value).length;
              return (
                <button
                  key={type.value}
                  onClick={() => setActiveTab(type.value)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === type.value
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {type.label}
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>
            Total: <strong>{totalCount}</strong>
          </span>
          <span>|</span>
          <span>
            Active: <strong className="text-green-600">{activeCount}</strong>
          </span>
          <span>|</span>
          <span>
            Inactive: <strong className="text-gray-400">{totalCount - activeCount}</strong>
          </span>
        </div>

        {/* Options List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : filteredOptions.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-600 mb-4">
              No {FILTER_TYPES.find((t) => t.value === activeTab)?.label.toLowerCase()} options yet.
            </p>
            <button onClick={openCreateModal} className="btn-outline">
              + Add First {FILTER_TYPES.find((t) => t.value === activeTab)?.label}
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Order</th>
                  {activeTab === 'color' && (
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Preview</th>
                  )}
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Value</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOptions.map((option, index) => (
                  <tr key={option.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-500 w-6">{index + 1}</span>
                        <button
                          onClick={() => moveOption(option.id, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveOption(option.id, 'down')}
                          disabled={index === filteredOptions.length - 1}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                    {activeTab === 'color' && (
                      <td className="px-4 py-3">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: option.metadata?.hex || '#ccc' }}
                          title={option.metadata?.hex || 'No color'}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <span className="font-medium">{option.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{option.value}</code>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleStatusToggle(option.id, option.is_active)}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          option.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {option.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(option)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(option.id)}
                          className="text-sm text-red-600 hover:text-red-800 font-medium"
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
        )}

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">
            {FILTER_TYPES.find((t) => t.value === activeTab)?.label} Filter
          </h3>
          <p className="text-sm text-blue-800">
            {FILTER_TYPES.find((t) => t.value === activeTab)?.description}
          </p>
          {activeTab === 'color' && (
            <p className="text-sm text-blue-700 mt-2">
              💡 Color options appear as swatches on the storefront. Make sure to set an accurate hex
              color code for proper display.
            </p>
          )}
          {activeTab === 'sort' && (
            <p className="text-sm text-blue-700 mt-2">
              💡 The &quot;value&quot; field should match the backend sort logic (e.g., price_asc,
              price_desc, newest).
            </p>
          )}
        </div>

        {/* Modal */}
        {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">
                {editingOption ? 'Edit' : 'Add'} {FILTER_TYPES.find((t) => t.value === formData.filter_type)?.label}
              </h2>
            </div>
            <form onSubmit={handleSave}>
              <div className="px-6 py-4 space-y-4">
                {/* Filter Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    name="filter_type"
                    value={formData.filter_type}
                    onChange={handleFormChange}
                    className="input-field w-full"
                    disabled={!!editingOption}
                  >
                    {FILTER_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="input-field w-full"
                    placeholder="e.g., Royal Blue"
                    required
                  />
                </div>

                {/* Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value (Internal)</label>
                  <input
                    type="text"
                    name="value"
                    value={formData.value}
                    onChange={handleFormChange}
                    className="input-field w-full"
                    placeholder="e.g., royal_blue"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Used in URL filters and backend logic</p>
                </div>

                {/* Hex Color (for color type) */}
                {formData.filter_type === 'color' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color (Hex)</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        name="hex"
                        value={formData.metadata?.hex || '#000000'}
                        onChange={handleFormChange}
                        className="w-12 h-12 p-1 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        name="hex"
                        value={formData.metadata?.hex || '#000000'}
                        onChange={handleFormChange}
                        className="input-field flex-1"
                        placeholder="#000000"
                        pattern="^#[0-9A-Fa-f]{6}$"
                      />
                    </div>
                  </div>
                )}

                {/* Display Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    name="display_order"
                    value={formData.display_order}
                    onChange={handleFormChange}
                    className="input-field w-full"
                    min="0"
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleFormChange}
                    className="w-4 h-4"
                    id="is_active"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active (visible on storefront)
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-outline"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingOption ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
        )}
      </div>
    );
  }
