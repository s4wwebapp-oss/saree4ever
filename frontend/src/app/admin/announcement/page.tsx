'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Announcement {
  id: string;
  text: string;
  link_url: string | null;
  link_target: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export default function AdminAnnouncementPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Announcement>>({
    text: '',
    link_url: '',
    link_target: '_self',
    is_active: false,
    display_order: 0,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response: any = await api.announcement.getAll();
      setAnnouncements(response.announcements || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch announcements');
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setFormData({
      text: announcement.text,
      link_url: announcement.link_url || '',
      link_target: announcement.link_target || '_self',
      is_active: announcement.is_active,
      display_order: announcement.display_order || 0,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      text: '',
      link_url: '',
      link_target: '_self',
      is_active: false,
      display_order: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingId) {
        await api.announcement.update(editingId, formData);
      } else {
        await api.announcement.create(formData);
      }
      await fetchAnnouncements();
      handleCancel();
    } catch (err: any) {
      setError(err.message || 'Failed to save announcement');
      console.error('Error saving announcement:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await api.announcement.delete(id);
      await fetchAnnouncements();
    } catch (err: any) {
      alert('Failed to delete announcement: ' + err.message);
    }
  };

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      await api.announcement.update(announcement.id, {
        is_active: !announcement.is_active,
      });
      await fetchAnnouncements();
    } catch (err: any) {
      alert('Failed to update announcement: ' + err.message);
    }
  };

  return (
    <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="heading-serif-md mb-2">Announcement Bar</h1>
            <p className="text-gray-600">Manage the top announcement banner</p>
          </div>
          {!editingId && (
            <button
              onClick={() => {
                setEditingId('new');
                setFormData({
                  text: '',
                  link_url: '',
                  link_target: '_self',
                  is_active: false,
                  display_order: 0,
                });
              }}
              className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              + New Announcement
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 rounded">
            {error}
          </div>
        )}

        {/* Create/Edit Form */}
        {editingId && (
          <div className="bg-white border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-serif font-semibold mb-4">
              {editingId === 'new' ? 'Create New Announcement' : 'Edit Announcement'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Announcement Text *
                </label>
                <input
                  type="text"
                  value={formData.text || ''}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="NEW STORE NOW OPEN | VISIT OUR SHOWROOM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link URL (optional)
                </label>
                <input
                  type="text"
                  value={formData.link_url || ''}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="/contact or https://example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty if announcement should not be clickable. Use relative paths (e.g., /contact) or full URLs.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Target
                </label>
                <select
                  value={formData.link_target || '_self'}
                  onChange={(e) => setFormData({ ...formData, link_target: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="_self">Same Window</option>
                  <option value="_blank">New Window</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order || 0}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first. Only one announcement can be active at a time.
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                  Activate this announcement (will deactivate others)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800"
                >
                  {editingId === 'new' ? 'Create' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Announcements List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200">
            <p className="text-gray-600 mb-4">No announcements found</p>
            <button
              onClick={() => {
                setEditingId('new');
                setFormData({
                  text: '',
                  link_url: '',
                  link_target: '_self',
                  is_active: false,
                  display_order: 0,
                });
              }}
              className="text-sm text-black hover:underline"
            >
              Create your first announcement →
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Text
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Link
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {announcements.map((announcement) => (
                  <tr key={announcement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {announcement.text}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {announcement.link_url ? (
                        <a
                          href={announcement.link_url}
                          target={announcement.link_target || '_self'}
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {announcement.link_url}
                        </a>
                      ) : (
                        <span className="text-gray-400">No link</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(announcement)}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          announcement.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {announcement.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {announcement.display_order}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(announcement)}
                          className="text-black hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(announcement.id)}
                          className="text-red-600 hover:text-red-800 hover:underline"
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

        {/* Preview */}
        {announcements.some(a => a.is_active) && (
          <div className="mt-8 bg-white border border-gray-200 p-6">
            <h2 className="text-lg font-serif font-semibold mb-4">Preview</h2>
            <div className="bg-black text-white text-xs py-2 text-center">
              {announcements
                .filter(a => a.is_active)
                .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))[0]?.text || 'No active announcement'}
            </div>
          </div>
        )}
      </div>
  );
}

