'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface MenuConfig {
  id: string;
  menu_type: 'shop_by' | 'collections' | 'categories';
  column_1_title: string;
  column_2_title: string;
  column_3_title: string;
  created_at: string;
  updated_at: string;
}

export default function AdminMenuConfigPage() {
  const [configs, setConfigs] = useState<Record<string, MenuConfig>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    column_1_title: string;
    column_2_title: string;
    column_3_title: string;
  }>({
    column_1_title: '',
    column_2_title: '',
    column_3_title: '',
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response: any = await api.menuConfig.getAll();
      setConfigs(response.configs || {});
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch menu configs');
      console.error('Error fetching menu configs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (menuType: string) => {
    const config = configs[menuType];
    if (config) {
      setEditing(menuType);
      setFormData({
        column_1_title: config.column_1_title,
        column_2_title: config.column_2_title,
        column_3_title: config.column_3_title,
      });
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      column_1_title: '',
      column_2_title: '',
      column_3_title: '',
    });
  };

  const handleSubmit = async (menuType: string) => {
    try {
      await api.menuConfig.update(menuType, formData);
      setEditing(null);
      fetchConfigs();
      alert('Menu config updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update menu config');
      console.error('Error updating menu config:', err);
    }
  };

  const menuLabels: Record<string, string> = {
    shop_by: 'Shop By Dropdown',
    collections: 'Collections Dropdown',
    categories: 'Categories Dropdown',
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading menu configurations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-600">Error: {error}</div>
        <button
          onClick={fetchConfigs}
          className="mt-4 px-4 py-2 bg-black text-white hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Menu Configuration</h1>
        <p className="text-gray-600">
          Manage dropdown column titles for Shop By, Collections, and Categories menus
        </p>
      </div>

      <div className="space-y-6">
        {(['shop_by', 'collections', 'categories'] as const).map((menuType) => {
          const config = configs[menuType];
          const isEditing = editing === menuType;

          return (
            <div
              key={menuType}
              className="border border-gray-200 rounded-lg p-6 bg-white"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{menuLabels[menuType]}</h2>
                {!isEditing && (
                  <button
                    onClick={() => handleEdit(menuType)}
                    className="px-4 py-2 bg-black text-white hover:bg-gray-800 text-sm"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Column 1 Title
                    </label>
                    <input
                      type="text"
                      value={formData.column_1_title}
                      onChange={(e) =>
                        setFormData({ ...formData, column_1_title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder="Enter column 1 title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Column 2 Title
                    </label>
                    <input
                      type="text"
                      value={formData.column_2_title}
                      onChange={(e) =>
                        setFormData({ ...formData, column_2_title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder="Enter column 2 title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Column 3 Title
                    </label>
                    <input
                      type="text"
                      value={formData.column_3_title}
                      onChange={(e) =>
                        setFormData({ ...formData, column_3_title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder="Enter column 3 title"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleSubmit(menuType)}
                      className="px-4 py-2 bg-black text-white hover:bg-gray-800"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-200 text-black hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Column 1</div>
                    <div className="font-medium">{config?.column_1_title || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Column 2</div>
                    <div className="font-medium">{config?.column_2_title || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Column 3</div>
                    <div className="font-medium">{config?.column_3_title || 'N/A'}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


