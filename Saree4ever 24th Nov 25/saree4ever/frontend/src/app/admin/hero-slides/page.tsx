'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Image from 'next/image';

interface HeroSlide {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  button_text: string | null;
  button_link: string | null;
  button_target: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminHeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<HeroSlide>>({
    title: '',
    subtitle: '',
    image_url: '',
    button_text: '',
    button_link: '',
    button_target: '_self',
    display_order: 0,
    is_active: false,
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      if (!token) {
        setError('Not authenticated. Please login at /admin first.');
        return;
      }
      
      const response: any = await api.heroSlides.getAll();
      setSlides(response.slides || []);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch hero slides';
      if (errorMessage.includes('No token provided') || errorMessage.includes('401')) {
        setError('Authentication required. Please logout and login again at /admin');
      } else {
        setError(errorMessage);
      }
      console.error('Error fetching hero slides:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingId(slide.id);
    setFormData({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      image_url: slide.image_url,
      button_text: slide.button_text || '',
      button_link: slide.button_link || '',
      button_target: slide.button_target || '_self',
      display_order: slide.display_order || 0,
      is_active: slide.is_active,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      button_text: '',
      button_link: '',
      button_target: '_self',
      display_order: 0,
      is_active: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingId) {
        await api.heroSlides.update(editingId, formData);
      } else {
        await api.heroSlides.create(formData);
      }
      await fetchSlides();
      handleCancel();
    } catch (err: any) {
      setError(err.message || 'Failed to save hero slide');
      console.error('Error saving hero slide:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hero slide?')) return;

    try {
      await api.heroSlides.delete(id);
      await fetchSlides();
    } catch (err: any) {
      alert('Failed to delete hero slide: ' + err.message);
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      await api.heroSlides.update(slide.id, {
        is_active: !slide.is_active,
      });
      await fetchSlides();
    } catch (err: any) {
      alert('Failed to update hero slide: ' + err.message);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[index - 1];
    newSlides[index - 1] = temp;

    // Update display orders
    const slideOrders = newSlides.map((slide, i) => ({
      id: slide.id,
      display_order: i,
    }));

    try {
      await api.heroSlides.reorder(slideOrders);
      await fetchSlides();
    } catch (err: any) {
      alert('Failed to reorder slides: ' + err.message);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === slides.length - 1) return;
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[index + 1];
    newSlides[index + 1] = temp;

    // Update display orders
    const slideOrders = newSlides.map((slide, i) => ({
      id: slide.id,
      display_order: i,
    }));

    try {
      await api.heroSlides.reorder(slideOrders);
      await fetchSlides();
    } catch (err: any) {
      alert('Failed to reorder slides: ' + err.message);
    }
  };

  const activeSlides = slides.filter(s => s.is_active).sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="heading-serif-md mb-2">Hero Slides</h1>
            <p className="text-gray-600">Manage homepage hero carousel (up to 3 active slides)</p>
          </div>
          {!editingId && (
            <button
              onClick={() => {
                setEditingId('new');
                setFormData({
                  title: '',
                  subtitle: '',
                  image_url: '',
                  button_text: '',
                  button_link: '',
                  button_target: '_self',
                  display_order: slides.length,
                  is_active: false,
                });
              }}
              className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              + New Slide
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
              {editingId === 'new' ? 'Create New Hero Slide' : 'Edit Hero Slide'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  value={formData.image_url || ''}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image_url && (
                  <div className="mt-2 relative w-full h-48 bg-gray-100 rounded overflow-hidden">
                    <Image
                      src={formData.image_url}
                      alt="Preview"
                      fill
                      className="object-cover"
                      onError={() => {}}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Traditional Elegance, Modern Style"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle
                </label>
                <textarea
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Discover our curated collection of handcrafted sarees"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.button_text || ''}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="Shop Collections"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={formData.button_link || ''}
                    onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="/collections"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Button Target
                </label>
                <select
                  value={formData.button_target || '_self'}
                  onChange={(e) => setFormData({ ...formData, button_target: e.target.value })}
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
                  Lower numbers appear first. Only up to 3 active slides will be shown on homepage.
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
                  Activate this slide
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

        {/* Active Slides Preview */}
        {activeSlides.length > 0 && (
          <div className="bg-white border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-serif font-semibold mb-4">Active Slides Preview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeSlides.slice(0, 3).map((slide, index) => (
                <div key={slide.id} className="relative aspect-[16/9] bg-gray-100 rounded overflow-hidden">
                  <Image
                    src={slide.image_url}
                    alt={slide.title || `Slide ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <p className="text-sm font-semibold mb-1">{slide.title || 'No title'}</p>
                    <p className="text-xs opacity-90">{slide.subtitle || 'No subtitle'}</p>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
            {activeSlides.length > 3 && (
              <p className="text-sm text-yellow-600 mt-4">
                ⚠️ Only the first 3 active slides will be displayed on the homepage.
              </p>
            )}
          </div>
        )}

        {/* Slides List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading hero slides...</p>
          </div>
        ) : slides.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200">
            <p className="text-gray-600 mb-4">No hero slides found</p>
            <button
              onClick={() => {
                setEditingId('new');
                setFormData({
                  title: '',
                  subtitle: '',
                  image_url: '',
                  button_text: '',
                  button_link: '',
                  button_target: '_self',
                  display_order: 0,
                  is_active: false,
                });
              }}
              className="text-sm text-black hover:underline"
            >
              Create your first hero slide →
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Preview
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {slides
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((slide, index) => (
                    <tr key={slide.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="relative w-24 h-16 bg-gray-100 rounded overflow-hidden">
                          <Image
                            src={slide.image_url}
                            alt={slide.title || 'Slide'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {slide.title || 'No title'}
                        </div>
                        {slide.subtitle && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {slide.subtitle}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            className="p-1 text-gray-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            ↑
                          </button>
                          <span className="text-sm text-gray-600">{slide.display_order}</span>
                          <button
                            onClick={() => handleMoveDown(index)}
                            disabled={index === slides.length - 1}
                            className="p-1 text-gray-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            ↓
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(slide)}
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            slide.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {slide.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(slide)}
                            className="text-black hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(slide.id)}
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
      </div>
  );
}

