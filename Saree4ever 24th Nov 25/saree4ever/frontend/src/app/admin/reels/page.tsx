'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface ReelVideo {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  category: string | null;
  author_name: string | null;
  published_at: string | null;
  view_count: number;
  is_featured: boolean;
  created_at: string;
  content_type: string;
  instagram_reel_url: string | null;
  youtube_short_url: string | null;
}

export default function AdminReelsPage() {
  const [reels, setReels] = useState<ReelVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchReels();
  }, [statusFilter, searchQuery, typeFilter]);

  const fetchReels = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      const response: any = await api.blog.getAllAdmin(params);
      // Filter to only show reels and videos
      const allContent = response.articles || [];
      const filtered = allContent.filter((item: any) => 
        item.content_type === 'reel' || item.content_type === 'video' ||
        (!item.content_type && (item.instagram_reel_url || item.youtube_short_url))
      );
      
      // Further filter by type if specified
      let finalFiltered = filtered;
      if (typeFilter === 'reel') {
        finalFiltered = filtered.filter((item: any) => 
          item.content_type === 'reel' || item.instagram_reel_url
        );
      } else if (typeFilter === 'video') {
        finalFiltered = filtered.filter((item: any) => 
          item.content_type === 'video' || item.youtube_short_url
        );
      }
      
      setReels(finalFiltered);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reels/videos');
      console.error('Error fetching reels/videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reel/video?')) return;

    try {
      await api.blog.delete(id);
      fetchReels();
    } catch (err: any) {
      alert('Failed to delete reel/video: ' + err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      archived: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || styles.draft}`}>
        {status}
      </span>
    );
  };

  const getTypeBadge = (reel: ReelVideo) => {
    if (reel.instagram_reel_url) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">Instagram Reel</span>;
    }
    if (reel.youtube_short_url) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">YouTube Video</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Video</span>;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading-serif-md mb-2">Reels & Videos</h1>
          <p className="text-gray-600">Manage Instagram Reels and YouTube Shorts/Videos</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/reels/new?type=reel"
            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            + New Reel
          </Link>
          <Link
            href="/admin/reels/new?type=video"
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
          >
            + New Video
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search reels/videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="all">All Types</option>
              <option value="reel">Instagram Reels</option>
              <option value="video">YouTube Videos</option>
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 rounded">
          {error}
        </div>
      )}

      {/* Reels/Videos Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading reels/videos...</p>
        </div>
      ) : reels.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200">
          <p className="text-gray-600 mb-4">No reels or videos found</p>
          <div className="flex gap-2 justify-center">
            <Link
              href="/admin/reels/new?type=reel"
              className="text-sm text-purple-600 hover:underline"
            >
              Create your first reel →
            </Link>
            <span className="text-gray-400">|</span>
            <Link
              href="/admin/reels/new?type=video"
              className="text-sm text-red-600 hover:underline"
            >
              Create your first video →
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reels.map((reel) => (
                <tr key={reel.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {reel.title}
                      </div>
                      {reel.is_featured && (
                        <span className="text-xs text-gray-500">⭐ Featured</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getTypeBadge(reel)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(reel.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {reel.author_name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {reel.view_count || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {reel.published_at
                      ? new Date(reel.published_at).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/admin/reels/${reel.id}/edit`}
                        className="text-black hover:underline"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/stories/${reel.slug}`}
                        target="_blank"
                        className="text-gray-600 hover:text-black hover:underline"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(reel.id)}
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


