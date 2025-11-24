'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';

interface ReelVideo {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  author_name: string | null;
  category: string | null;
  tags: string[];
  status: string;
  published_at: string | null;
  meta_description: string | null;
  meta_keywords: string[];
  is_featured: boolean;
  instagram_reel_url: string | null;
  youtube_short_url: string | null;
  content_type: 'reel' | 'video' | 'article';
}

const CATEGORIES = [
  'Collections',
  'Saree Care',
  'Fashion Tips',
  'History',
  'Styling',
  'Fabric Guide',
  'Occasions',
];

export default function EditReelVideoPage() {
  const router = useRouter();
  const params = useParams();
  const reelId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reelVideo, setReelVideo] = useState<Partial<ReelVideo>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author_name: '',
    category: '',
    tags: [],
    status: 'draft',
    published_at: null,
    meta_description: '',
    meta_keywords: [],
    is_featured: false,
    instagram_reel_url: '',
    youtube_short_url: '',
    content_type: 'reel',
  });
  const [tagsInput, setTagsInput] = useState<string>('');

  useEffect(() => {
    fetchReelVideo();
  }, [reelId]);

  const fetchReelVideo = async () => {
    try {
      setLoading(true);
      const response: any = await api.blog.getById(reelId);
      const data = response.article;
      setReelVideo({
        ...data,
        tags: data.tags || [],
        meta_keywords: data.meta_keywords || [],
      });
      setTagsInput((data.tags || []).join(', '));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reel/video');
      console.error('Error fetching reel/video:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setReelVideo({ ...reelVideo, title, slug: reelVideo.slug || generateSlug(title) });
  };

  const handleTagsChange = (tagsString: string) => {
    setTagsInput(tagsString);
    // Convert to array for storage, but keep input as string for better UX
    const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
    setReelVideo({ ...reelVideo, tags });
  };

  const handleKeywordsChange = (keywordsString: string) => {
    const keywords = keywordsString.split(',').map(k => k.trim()).filter(Boolean);
    setReelVideo({ ...reelVideo, meta_keywords: keywords });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const reelVideoData = {
        ...reelVideo,
        slug: reelVideo.slug || generateSlug(reelVideo.title || ''),
        published_at: reelVideo.status === 'published' && !reelVideo.published_at
          ? new Date().toISOString()
          : reelVideo.published_at,
      };

      await api.blog.update(reelId, reelVideoData);
      router.push('/admin/reels');
    } catch (err: any) {
      setError(err.message || 'Failed to save reel/video');
      console.error('Error saving reel/video:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading reel/video...</p>
        </div>
      </div>
    );
  }

  const type = reelVideo.content_type === 'reel' || reelVideo.instagram_reel_url ? 'reel' : 'video';

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="heading-serif-md mb-2">
          Edit {type === 'reel' ? 'Instagram Reel' : 'YouTube Video'}
        </h1>
        <p className="text-gray-600">Update your {type === 'reel' ? 'Instagram Reel' : 'YouTube Short/Video'}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-serif font-semibold mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={reelVideo.title || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                value={reelVideo.slug || ''}
                onChange={(e) => setReelVideo({ ...reelVideo, slug: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description/Excerpt
              </label>
              <textarea
                value={reelVideo.excerpt || ''}
                onChange={(e) => setReelVideo({ ...reelVideo, excerpt: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="Brief description of the video..."
              />
            </div>
          </div>
        </div>

        {/* Video URL */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-serif font-semibold mb-4">
            {type === 'reel' ? 'Instagram Reel URL' : 'YouTube Video URL'} *
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {type === 'reel' 
              ? 'Paste the full Instagram Reel URL. The video will be embedded and playable on your site.'
              : 'Paste the full YouTube Short or Video URL. The video will be embedded and playable on your site.'}
          </p>
          
          <div>
            {type === 'reel' ? (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram Reel URL *
                </label>
                <input
                  type="url"
                  value={reelVideo.instagram_reel_url || ''}
                  onChange={(e) => setReelVideo({ ...reelVideo, instagram_reel_url: e.target.value, youtube_short_url: null })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="https://www.instagram.com/reel/ABC123/ or https://www.instagram.com/p/ABC123/"
                />
              </>
            ) : (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube Video URL *
                </label>
                <input
                  type="url"
                  value={reelVideo.youtube_short_url || ''}
                  onChange={(e) => setReelVideo({ ...reelVideo, youtube_short_url: e.target.value, instagram_reel_url: null })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="https://www.youtube.com/shorts/ABC123 or https://youtu.be/ABC123"
                />
              </>
            )}
          </div>
        </div>

        {/* Optional Content */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-serif font-semibold mb-4">Additional Content (Optional)</h2>
          <textarea
            value={reelVideo.content || ''}
            onChange={(e) => setReelVideo({ ...reelVideo, content: e.target.value })}
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black font-mono text-sm"
            placeholder="Add any additional text content, description, or HTML formatting here..."
          />
        </div>

        {/* Metadata */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-serif font-semibold mb-4">Metadata</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={reelVideo.category || ''}
                onChange={(e) => setReelVideo({ ...reelVideo, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => handleTagsChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="saree, fashion, styling"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author Name
              </label>
              <input
                type="text"
                value={reelVideo.author_name || ''}
                onChange={(e) => setReelVideo({ ...reelVideo, author_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="Saree4Ever Editorial"
              />
            </div>
          </div>
        </div>

        {/* Publishing */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-serif font-semibold mb-4">Publishing</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={reelVideo.status || 'draft'}
                onChange={(e) => setReelVideo({ ...reelVideo, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_featured"
                checked={reelVideo.is_featured || false}
                onChange={(e) => setReelVideo({ ...reelVideo, is_featured: e.target.checked })}
                className="w-4 h-4 text-black border-gray-300 focus:ring-black"
              />
              <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700">
                Feature this {type === 'reel' ? 'reel' : 'video'}
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/admin/reels')}
            className="px-4 py-2 border border-gray-300 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-2 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${
              type === 'reel' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {saving ? 'Saving...' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
}

