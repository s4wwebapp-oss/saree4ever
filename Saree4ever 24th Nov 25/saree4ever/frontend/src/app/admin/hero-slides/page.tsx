'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import Image from 'next/image';
import { validateImageFile } from '@/lib/storage';

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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    try {
      setUploading(true);
      
      // Get auth token
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('Not authenticated. Please login again.');
      }

      // Upload via backend API (uses service role, bypasses RLS)
      const formData = new FormData();
      formData.append('image', file);
      const slideId = editingId && editingId !== 'new' ? editingId : undefined;
      if (slideId) {
        formData.append('slideId', slideId);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/upload/hero-slide`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await response.json();
      setFormData({ ...formData, image_url: data.url });
      setUploadError(null);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload image');
      console.error('Error uploading image:', err);
    } finally {
      setUploading(false);
    }
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image *
                </label>
                
                {/* Upload Option */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Upload Image (Recommended)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleFileSelect}
                      disabled={uploading}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded file:border-0
                        file:text-sm file:font-semibold
                        file:bg-black file:text-white
                        hover:file:bg-gray-800
                        file:cursor-pointer
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {uploading && (
                      <span className="text-sm text-gray-600">Uploading...</span>
                    )}
                  </div>
                  {uploadError && (
                    <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Supported formats: JPEG, PNG, WebP, GIF (Max 10MB)
                  </p>
                </div>

                {/* OR Divider */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>

                {/* URL Option */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Enter Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, image_url: e.target.value });
                      setUploadError(null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Preview */}
                {formData.image_url && (
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Preview
                    </label>
                    <div className="relative w-full h-48 bg-gray-100 rounded overflow-hidden border border-gray-200">
                      <Image
                        src={formData.image_url}
                        alt="Preview"
                        fill
                        className="object-cover"
                        onError={() => {
                          setUploadError('Failed to load image. Please check the URL.');
                        }}
                      />
                    </div>
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
                  {slide.image_url ? (
                    <>
                      <Image
                        src={slide.image_url}
                        alt={slide.title || `Slide ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
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
                          {slide.image_url ? (
                            <Image
                              src={slide.image_url}
                              alt={slide.title || 'Slide'}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
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

