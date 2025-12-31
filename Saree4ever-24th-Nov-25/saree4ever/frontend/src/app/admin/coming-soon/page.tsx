'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';

interface ComingSoonMedia {
  id: string;
  media_type: 'video' | 'image';
  media_url: string;
  thumbnail_url?: string;
  title?: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminComingSoonPage() {
  const [media, setMedia] = useState<ComingSoonMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ComingSoonMedia>>({
    media_type: 'video',
    media_url: '',
    thumbnail_url: '',
    title: '',
    description: '',
    is_active: true,
    autoplay: true,
    muted: true,
    loop: true,
    display_order: 0,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      if (!token) {
        setError('Not authenticated. Please login at /admin first.');
        return;
      }
      
      const response: any = await api.comingSoon.getAllMedia();
      setMedia(response.media || []);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch media';
      if (errorMessage.includes('No token provided') || errorMessage.includes('401')) {
        setError('Authentication required. Please logout and login again at /admin');
      } else {
        setError(errorMessage);
      }
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: ComingSoonMedia) => {
    setEditingId(item.id);
    setFormData({
      media_type: item.media_type,
      media_url: item.media_url,
      thumbnail_url: item.thumbnail_url || '',
      title: item.title || '',
      description: item.description || '',
      is_active: item.is_active,
      autoplay: item.autoplay,
      muted: item.muted,
      loop: item.loop,
      display_order: item.display_order || 0,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      media_type: 'video',
      media_url: '',
      thumbnail_url: '',
      title: '',
      description: '',
      is_active: true,
      autoplay: true,
      muted: true,
      loop: true,
      display_order: 0,
    });
    setUploadError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      setUploadError(null);
      setUploadProgress(0);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `coming-soon/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      setUploadProgress(100);
      
      if (formData.media_type === 'video') {
        setFormData(prev => ({ ...prev, media_url: publicUrl }));
      } else {
        setFormData(prev => ({ ...prev, media_url: publicUrl }));
      }

      return publicUrl;
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.media_url) {
      setError('Media URL is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editingId) {
        await api.comingSoon.updateMedia(editingId, formData);
      } else {
        await api.comingSoon.createMedia(formData);
      }

      await fetchMedia();
      handleCancel();
    } catch (err: any) {
      setError(err.message || 'Failed to save media');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      setSaving(true);
      await api.comingSoon.deleteMedia(id);
      await fetchMedia();
    } catch (err: any) {
      setError(err.message || 'Failed to delete media');
    } finally {
      setSaving(false);
    }
  };

  const handleReorder = async (newOrder: ComingSoonMedia[]) => {
    try {
      const mediaOrders = newOrder.map((item, index) => ({
        id: item.id,
        display_order: index,
      }));
      await api.comingSoon.reorderMedia(mediaOrders);
      await fetchMedia();
    } catch (err: any) {
      setError(err.message || 'Failed to reorder media');
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...media];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setMedia(newOrder);
    handleReorder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === media.length - 1) return;
    const newOrder = [...media];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setMedia(newOrder);
    handleReorder(newOrder);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading coming soon media...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="heading-serif-md mb-2">Coming Soon Media</h1>
        <p className="text-gray-600">Manage videos and images for the coming soon page</p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {uploadError && (
        <div className="mb-6 px-4 py-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded">
          {uploadError}
        </div>
      )}

      {/* Form */}
      <div className="bg-white border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-serif font-semibold mb-4">
          {editingId ? 'Edit Media' : 'Add New Media'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Media Type
            </label>
            <select
              value={formData.media_type}
              onChange={(e) => setFormData(prev => ({ ...prev, media_type: e.target.value as 'video' | 'image' }))}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
              required
            >
              <option value="video">Video</option>
              <option value="image">Image</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.media_type === 'video' ? 'Video URL' : 'Image URL'}
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.media_url || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, media_url: e.target.value }))}
                placeholder={formData.media_type === 'video' ? 'https://example.com/video.mp4' : 'https://example.com/image.jpg'}
                className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
              <input
                type="file"
                ref={fileInputRef}
                accept={formData.media_type === 'video' ? 'video/*' : 'image/*'}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium disabled:opacity-50"
              >
                {uploading ? `Uploading... ${uploadProgress}%` : 'Upload'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title (optional)
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter title"
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {formData.media_type === 'video' && (
            <div className="grid grid-cols-3 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.autoplay ?? true}
                  onChange={(e) => setFormData(prev => ({ ...prev, autoplay: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Autoplay</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.muted ?? true}
                  onChange={(e) => setFormData(prev => ({ ...prev, muted: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Muted</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.loop ?? true}
                  onChange={(e) => setFormData(prev => ({ ...prev, loop: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Loop</span>
              </label>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={formData.display_order || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_active ?? true}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Active</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Media List */}
      <div className="bg-white border border-gray-200 p-6">
        <h2 className="text-lg font-serif font-semibold mb-4">Media List</h2>
        
        {media.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <p>No media found. Add your first video or image above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {media.map((item, index) => (
              <div key={item.id} className="border border-gray-200 p-4 rounded">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-32 h-20 bg-gray-100 rounded overflow-hidden">
                    {item.media_type === 'video' ? (
                      <video
                        src={item.media_url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={item.media_url}
                        alt={item.title || 'Media'}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{item.title || 'Untitled'}</span>
                          <span className={`px-2 py-1 text-xs rounded ${
                            item.media_type === 'video' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {item.media_type}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${
                            item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600">{item.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Order: {item.display_order}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded"
                      >
                        Delete
                      </button>
                      {index > 0 && (
                        <button
                          onClick={() => moveUp(index)}
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                        >
                          ↑
                        </button>
                      )}
                      {index < media.length - 1 && (
                        <button
                          onClick={() => moveDown(index)}
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                        >
                          ↓
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
