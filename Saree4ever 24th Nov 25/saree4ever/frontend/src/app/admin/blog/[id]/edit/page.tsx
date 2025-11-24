'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
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

export default function EditBlogArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  const isNew = articleId === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [article, setArticle] = useState<Partial<BlogArticle>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
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
  });
  const [tagsInput, setTagsInput] = useState<string>('');

  useEffect(() => {
    if (!isNew) {
      fetchArticle();
    }
  }, [articleId, isNew]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response: any = await api.blog.getById(articleId);
      const data = response.article;
      setArticle(data);
      setTagsInput((data.tags || []).join(', '));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch article');
      console.error('Error fetching article:', err);
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
    setArticle({ ...article, title, slug: article.slug || generateSlug(title) });
  };

  const handleTagsChange = (tagsString: string) => {
    setTagsInput(tagsString);
    // Convert to array for storage, but keep input as string for better UX
    const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
    setArticle({ ...article, tags });
  };

  const handleKeywordsChange = (keywordsString: string) => {
    const keywords = keywordsString.split(',').map(k => k.trim()).filter(Boolean);
    setArticle({ ...article, meta_keywords: keywords });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const articleData = {
        ...article,
        slug: article.slug || generateSlug(article.title || ''),
        published_at: article.status === 'published' && !article.published_at
          ? new Date().toISOString()
          : article.published_at,
      };

      if (isNew) {
        await api.blog.create(articleData);
      } else {
        await api.blog.update(articleId, articleData);
      }

      router.push('/admin/blog');
    } catch (err: any) {
      setError(err.message || 'Failed to save article');
      console.error('Error saving article:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading article...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
        <div className="mb-6">
          <h1 className="heading-serif-md mb-2">
            {isNew ? 'Create New Article' : 'Edit Article'}
          </h1>
          <p className="text-gray-600">Write and manage your blog article</p>
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
                  value={article.title || ''}
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
                  value={article.slug || ''}
                  onChange={(e) => setArticle({ ...article, slug: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="article-url-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt
                </label>
                <textarea
                  value={article.excerpt || ''}
                  onChange={(e) => setArticle({ ...article, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Brief summary of the article..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured Image URL
                </label>
                <input
                  type="url"
                  value={article.featured_image_url || ''}
                  onChange={(e) => setArticle({ ...article, featured_image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-lg font-serif font-semibold mb-4">Social Media Links</h2>
            <p className="text-sm text-gray-600 mb-4">
              Add Instagram Reels and YouTube Shorts to display on the /stories page
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram Reel URL
                </label>
                <input
                  type="url"
                  value={article.instagram_reel_url || ''}
                  onChange={(e) => setArticle({ ...article, instagram_reel_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="https://www.instagram.com/reel/ABC123/ or https://www.instagram.com/p/ABC123/"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste the full Instagram Reel or Post URL
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube Short URL
                </label>
                <input
                  type="url"
                  value={article.youtube_short_url || ''}
                  onChange={(e) => setArticle({ ...article, youtube_short_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="https://www.youtube.com/shorts/ABC123 or https://youtu.be/ABC123"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste the full YouTube Short or Video URL
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-lg font-serif font-semibold mb-4">Content *</h2>
            <textarea
              value={article.content || ''}
              onChange={(e) => setArticle({ ...article, content: e.target.value })}
              required
              rows={20}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black font-mono text-sm"
              placeholder="Write your article content here. You can use HTML tags for formatting..."
            />
            <p className="text-xs text-gray-500 mt-2">
              You can use HTML tags for formatting (h2, h3, p, ul, li, strong, em, a, etc.)
            </p>
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
                  value={article.category || ''}
                  onChange={(e) => setArticle({ ...article, category: e.target.value })}
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
                  placeholder="Kanjivaram, Silk, Traditional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author Name
                </label>
                <input
                  type="text"
                  value={article.author_name || ''}
                  onChange={(e) => setArticle({ ...article, author_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Saree4Ever Editorial"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  value={article.meta_description || ''}
                  onChange={(e) => setArticle({ ...article, meta_description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="SEO meta description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={article.meta_keywords?.join(', ') || ''}
                  onChange={(e) => handleKeywordsChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="saree, kanjivaram, silk"
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
                  value={article.status || 'draft'}
                  onChange={(e) => setArticle({ ...article, status: e.target.value })}
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
                  checked={article.is_featured || false}
                  onChange={(e) => setArticle({ ...article, is_featured: e.target.checked })}
                  className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                />
                <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700">
                  Feature this article
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/blog')}
              className="px-4 py-2 border border-gray-300 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : isNew ? 'Create Article' : 'Update Article'}
            </button>
          </div>
        </form>
      </div>
  );
}

