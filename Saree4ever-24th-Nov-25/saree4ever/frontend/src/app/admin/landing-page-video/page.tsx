'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';

interface LandingPageVideo {
  id: string;
  video_url: string | null;
  video_file_path: string | null;
  is_active: boolean;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  display_order: number;
  video_orientation?: 'horizontal' | 'vertical';
  created_at: string;
  updated_at: string;
}

// Helper function to get video URL (same logic as LandingPageVideoSection)
const getVideoUrl = (video: LandingPageVideo): string | null => {
  // Prefer video_url if it exists (should be a full URL from backend)
  if (video.video_url) {
    // Ensure URL is absolute (starts with http:// or https://)
    if (video.video_url.startsWith('http://') || video.video_url.startsWith('https://')) {
      return video.video_url;
    }
    // If relative URL, make it absolute using current origin or API URL
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').replace('/api', '');
    return `${baseUrl}${video.video_url.startsWith('/') ? video.video_url : `/${video.video_url}`}`;
  }
  
  // Fallback: construct URL from video_file_path if available
  if (video.video_file_path) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      // Ensure Supabase URL doesn't have trailing slash
      const cleanSupabaseUrl = supabaseUrl.replace(/\/$/, '');
      return `${cleanSupabaseUrl}/storage/v1/object/public/landing-videos/${video.video_file_path}`;
    }
    // If Supabase URL not available, try to construct from API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}/api/uploads/landing-videos/${video.video_file_path}`;
  }
  
  return null;
};

export default function AdminLandingPageVideoPage() {
  const [videos, setVideos] = useState<LandingPageVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<LandingPageVideo>>({
    video_url: '',
    is_active: true,
    autoplay: true,
    muted: true,
    loop: true,
    display_order: 0,
    video_orientation: 'horizontal',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'direct' | 'backend'>('direct');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      if (!token) {
        setError('Not authenticated. Please login at /admin first.');
        return;
      }
      
      const response: any = await api.landingPageVideo.getAll();
      setVideos(response.videos || []);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch videos';
      if (errorMessage.includes('No token provided') || errorMessage.includes('401')) {
        setError('Authentication required. Please logout and login again at /admin');
      } else {
        setError(errorMessage);
      }
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (video: LandingPageVideo) => {
    setEditingId(video.id);
    setFormData({
      video_url: video.video_url || '',
      is_active: video.is_active,
      autoplay: video.autoplay,
      muted: video.muted,
      loop: video.loop,
      display_order: video.display_order || 0,
      video_orientation: video.video_orientation || 'horizontal',
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      video_url: '',
      is_active: true,
      autoplay: true,
      muted: true,
      loop: true,
      display_order: 0,
      video_orientation: 'horizontal',
    });
    setUploadError(null);
    setUploadProgress(0);
    setUploadMethod('direct');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Direct upload via backend (uses service role key, bypasses RLS, supports up to 500MB)
  const handleDirectUpload = async (file: File) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'landing-page-video/page.tsx:100',message:'handleDirectUpload entry',data:{fileSize:file.size,fileName:file.name,fileType:file.type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('Not authenticated. Please login again.');
      }

      const formData = new FormData();
      formData.append('video', file);

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'landing-page-video/page.tsx:113',message:'FormData created, before fetch',data:{formDataSize:'N/A',fileSize:file.size},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      // Use direct endpoint which uses service role key (bypasses RLS)
      // This supports up to 500MB and doesn't have RLS restrictions
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/upload/landing-page-video/direct`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'landing-page-video/page.tsx:124',message:'Fetch response received',data:{status:response.status,statusText:response.statusText,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'landing-page-video/page.tsx:130',message:'Error response received',data:{errorData,status:response.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        throw new Error(errorData.error || 'Failed to upload video');
      }

      const data = await response.json();
      setFormData({ ...formData, video_url: data.url });
      setUploadProgress(100);
      setUploadError(null);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload video');
      console.error('Error uploading video:', err);
      throw err;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Backend upload (existing method)
  const handleBackendUpload = async (file: File) => {
    try {
      setUploading(true);
      setUploadError(null);

      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('Not authenticated. Please login again.');
      }

      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/upload/landing-page-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Failed to upload video');
      }

      const data = await response.json();
      setFormData({ ...formData, video_url: data.url });
      setUploadError(null);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload video');
      console.error('Error uploading video:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Only MP4, WebM, OGG, and QuickTime videos are allowed.');
      return;
    }

    // Validate file size based on upload method
    const maxSize = uploadMethod === 'direct' ? 500 * 1024 * 1024 : 500 * 1024 * 1024; // 500MB for both methods
    if (file.size > maxSize) {
      setUploadError(`File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB for ${uploadMethod === 'direct' ? 'direct' : 'backend'} upload.`);
      return;
    }

    try {
      if (uploadMethod === 'direct') {
        await handleDirectUpload(file);
      } else {
        await handleBackendUpload(file);
      }
    } catch (err) {
      // Error already handled in respective functions
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    console.log('Form submission - formData:', formData);
    console.log('Form submission - editingId:', editingId);

    if (!formData.video_url) {
      setError('Please provide a video URL or upload a video file.');
      setSaving(false);
      return;
    }

    try {
      const submitData = {
        video_url: formData.video_url,
        is_active: formData.is_active ?? true,
        autoplay: formData.autoplay ?? true,
        muted: formData.muted ?? true,
        loop: formData.loop ?? true,
        display_order: formData.display_order ?? 0,
        video_orientation: formData.video_orientation || 'horizontal',
      };

      console.log('Submitting data:', submitData);

      if (editingId && editingId !== 'new') {
        const result = await api.landingPageVideo.update(editingId, submitData);
        console.log('Update result:', result);
      } else {
        const result = await api.landingPageVideo.create(submitData);
        console.log('Create result:', result);
      }
      
      await fetchVideos();
      handleCancel();
    } catch (err: any) {
      console.error('Error saving video - full error:', err);
      const errorMessage = err.message || err.error || 'Failed to save video';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`); // Also show alert for visibility
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      await api.landingPageVideo.delete(id);
      await fetchVideos();
    } catch (err: any) {
      alert('Failed to delete video: ' + err.message);
    }
  };

  const handleToggleActive = async (video: LandingPageVideo) => {
    try {
      await api.landingPageVideo.update(video.id, {
        is_active: !video.is_active,
      });
      await fetchVideos();
    } catch (err: any) {
      alert('Failed to update video: ' + err.message);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newVideos = [...videos];
    const temp = newVideos[index];
    newVideos[index] = newVideos[index - 1];
    newVideos[index - 1] = temp;

    const videoOrders = newVideos.map((video, i) => ({
      id: video.id,
      display_order: i,
    }));

    try {
      await api.landingPageVideo.reorder(videoOrders);
      await fetchVideos();
    } catch (err: any) {
      alert('Failed to reorder videos: ' + err.message);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === videos.length - 1) return;
    const newVideos = [...videos];
    const temp = newVideos[index];
    newVideos[index] = newVideos[index + 1];
    newVideos[index + 1] = temp;

    const videoOrders = newVideos.map((video, i) => ({
      id: video.id,
      display_order: i,
    }));

    try {
      await api.landingPageVideo.reorder(videoOrders);
      await fetchVideos();
    } catch (err: any) {
      alert('Failed to reorder videos: ' + err.message);
    }
  };

  if (loading) {
    return <div className="p-8">Loading videos...</div>;
  }

  const activeVideos = videos.filter(v => v.is_active).sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading-serif-md mb-2">Landing Page Videos</h1>
          <p className="text-gray-600">Manage autoplay videos for the landing page (horizontal scroll)</p>
        </div>
        {!editingId && (
          <button
            onClick={() => {
              setEditingId('new');
              setFormData({
                video_url: '',
                is_active: true,
                autoplay: true,
                muted: true,
                loop: true,
                display_order: videos.length,
                video_orientation: 'horizontal',
              });
              setUploadMethod('direct');
              setUploadError(null);
              setUploadProgress(0);
              setError(null);
            }}
            className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            + New Video
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 rounded">
          {error}
        </div>
      )}

      {editingId && (
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-serif font-semibold mb-4">
            {editingId === 'new' ? 'Create New Video' : 'Edit Video'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video *
              </label>
              
              {/* Upload Method Selection */}
              <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Upload Method
                </label>
                <div className="flex gap-4">
                  <label className={`flex items-center space-x-2 cursor-pointer ${uploadMethod === 'direct' ? 'text-black font-medium' : 'text-gray-600'}`}>
                    <input
                      type="radio"
                      name="uploadMethod"
                      value="direct"
                      checked={uploadMethod === 'direct'}
                      onChange={() => setUploadMethod('direct')}
                      disabled={uploading}
                      className="cursor-pointer w-4 h-4 text-black focus:ring-2 focus:ring-black"
                    />
                    <span className="text-sm">
                      Direct Upload (Recommended - Up to 500MB, faster)
                    </span>
                  </label>
                  <label className={`flex items-center space-x-2 cursor-pointer ${uploadMethod === 'backend' ? 'text-black font-medium' : 'text-gray-600'}`}>
                    <input
                      type="radio"
                      name="uploadMethod"
                      value="backend"
                      checked={uploadMethod === 'backend'}
                      onChange={() => setUploadMethod('backend')}
                      disabled={uploading}
                      className="cursor-pointer w-4 h-4 text-black focus:ring-2 focus:ring-black"
                    />
                    <span className="text-sm">
                      Backend Upload (Up to 500MB)
                    </span>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Upload Video (Max 500MB)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    onChange={handleFileSelect}
                    className="text-sm"
                    disabled={uploading}
                  />
                  {uploading && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Uploading...</span>
                      {uploadProgress > 0 && uploadMethod === 'direct' && (
                        <span className="text-xs text-gray-400">{uploadProgress}%</span>
                      )}
                    </div>
                  )}
                </div>
                {uploadError && (
                  <p className="text-sm text-red-600 mt-1">{uploadError}</p>
                )}
                {uploadMethod === 'direct' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Direct upload bypasses backend limits and is recommended for larger files.
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Or Enter Video URL
                </label>
                <input
                  type="url"
                  value={formData.video_url || ''}
                  onChange={(e) => {
                    const url = e.target.value;
                    // #region agent log
                    fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'landing-page-video/page.tsx:444',message:'Video URL changed',data:{url,urlLength:url.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'preview'})}).catch(()=>{});
                    // #endregion
                    setFormData({ ...formData, video_url: url });
                  }}
                  placeholder="https://example.com/video.mp4"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {formData.video_url && (
                <div className="mt-4">
                  <p className="text-xs text-gray-600 mb-2">Preview:</p>
                  {(() => {
                    const url = formData.video_url;
                    // Check if it's a YouTube URL (including Shorts)
                    // Handles: youtube.com/watch?v=ID, youtube.com/v/ID, youtube.com/shorts/ID, youtu.be/ID
                    // YouTube Shorts can have variable length IDs, so we capture until the next query param or end
                    let videoId = null;
                    // Try standard YouTube patterns first
                    const standardMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                    if (standardMatch) {
                      videoId = standardMatch[1];
                    } else {
                      // Try YouTube Shorts pattern (shorts/VIDEO_ID)
                      const shortsMatch = url.match(/youtube\.com\/shorts\/([^"&?\/\s]+)/);
                      if (shortsMatch) {
                        videoId = shortsMatch[1];
                      }
                    }
                    
                    if (videoId) {
                      // #region agent log
                      fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'landing-page-video/page.tsx:477',message:'YouTube URL detected',data:{url,videoId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'preview'})}).catch(()=>{});
                      // #endregion
                      return (
                        <div className="w-full max-w-md rounded border border-gray-300 overflow-hidden">
                          <iframe
                            width="100%"
                            height="315"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full"
                          />
                        </div>
                      );
                    }
                    // Check if it's a Vimeo URL
                    const vimeoMatch = url.match(/(?:vimeo\.com\/)(?:.*\/)?(\d+)/);
                    if (vimeoMatch) {
                      const videoId = vimeoMatch[1];
                      return (
                        <div className="w-full max-w-md rounded border border-gray-300 overflow-hidden">
                          <iframe
                            width="100%"
                            height="315"
                            src={`https://player.vimeo.com/video/${videoId}`}
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            className="w-full"
                          />
                        </div>
                      );
                    }
                    // Direct video file URL
                    return (
                      <video
                        src={url}
                        controls
                        className="w-full max-w-md rounded border border-gray-300"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          // #region agent log
                          fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'landing-page-video/page.tsx:490',message:'Video preview error',data:{url,error:JSON.stringify(e)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'preview'})}).catch(()=>{});
                          // #endregion
                          console.error('Video preview error:', e);
                        }}
                        onLoadStart={() => {
                          // #region agent log
                          fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'landing-page-video/page.tsx:497',message:'Video preview loading started',data:{url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'preview'})}).catch(()=>{});
                          // #endregion
                        }}
                        onLoadedData={() => {
                          // #region agent log
                          fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'landing-page-video/page.tsx:503',message:'Video preview loaded successfully',data:{url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'preview'})}).catch(()=>{});
                          // #endregion
                        }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active ?? true}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.autoplay ?? true}
                    onChange={(e) => setFormData({ ...formData, autoplay: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Autoplay</span>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.muted ?? true}
                    onChange={(e) => setFormData({ ...formData, muted: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Muted</span>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.loop ?? true}
                    onChange={(e) => setFormData({ ...formData, loop: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Loop</span>
                </label>
              </div>
            </div>

            {/* Video Orientation Selector */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Format *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="video_orientation"
                    value="horizontal"
                    checked={formData.video_orientation === 'horizontal'}
                    onChange={(e) => setFormData({ ...formData, video_orientation: e.target.value as 'horizontal' | 'vertical' })}
                    className="w-4 h-4 text-black focus:ring-2 focus:ring-black"
                  />
                  <span className="text-sm">Horizontal (16:9) - Standard videos</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="video_orientation"
                    value="vertical"
                    checked={formData.video_orientation === 'vertical'}
                    onChange={(e) => setFormData({ ...formData, video_orientation: e.target.value as 'horizontal' | 'vertical' })}
                    className="w-4 h-4 text-black focus:ring-2 focus:ring-black"
                  />
                  <span className="text-sm">Vertical (9:16) - Reels/Shorts</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select the format that matches your video. Vertical is for reels, shorts, and mobile-first content.
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={uploading || saving}
                className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : uploading ? 'Uploading...' : (editingId && editingId !== 'new' ? 'Update Video' : 'Create Video')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-serif font-semibold">
          Active Videos ({activeVideos.length})
        </h2>
        {activeVideos.length === 0 ? (
          <p className="text-gray-600">No active videos. Add one above.</p>
        ) : (
          <div className="space-y-4">
            {activeVideos.map((video, index) => {
              const videoUrl = getVideoUrl(video);
              
              return (
                <div key={video.id} className="border border-gray-200 p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium">Order: {video.display_order}</span>
                        <span className={`text-xs px-2 py-1 rounded ${video.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {video.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {videoUrl && (
                        <video
                          src={videoUrl}
                          controls
                          className="w-full max-w-md rounded border border-gray-300 mb-2"
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>Autoplay: {video.autoplay ? 'Yes' : 'No'}</p>
                        <p>Muted: {video.muted ? 'Yes' : 'No'}</p>
                        <p>Loop: {video.loop ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleEdit(video)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(video)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        {video.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-800 transition-colors"
                      >
                        Delete
                      </button>
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === activeVideos.length - 1}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {videos.filter(v => !v.is_active).length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-serif font-semibold">
            Inactive Videos
          </h2>
          <div className="space-y-4">
            {videos.filter(v => !v.is_active).map((video) => {
              const videoUrl = getVideoUrl(video);
              
              return (
                <div key={video.id} className="border border-gray-200 p-4 opacity-60">
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      {videoUrl && (
                        <video
                          src={videoUrl}
                          controls
                          className="w-full max-w-md rounded border border-gray-300 mb-2"
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleEdit(video)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(video)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        Activate
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-800 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}





