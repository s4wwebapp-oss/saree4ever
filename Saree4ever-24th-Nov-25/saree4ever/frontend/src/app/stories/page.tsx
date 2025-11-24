import { api } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  author_name: string | null;
  category: string | null;
  tags: string[];
  published_at: string;
  view_count: number;
  is_featured: boolean;
  instagram_reel_url: string | null;
  youtube_short_url: string | null;
}

async function getArticles(): Promise<BlogArticle[]> {
  try {
    const response: any = await api.blog.getAll({ limit: 50 });
    return response.articles || [];
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

// Helper function to extract Instagram Reel ID from URL
function getInstagramReelId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

// Helper function to extract YouTube Video ID from URL
function getYouTubeVideoId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
}

export default async function StoriesPage() {
  const articles = await getArticles();
  const featuredArticles = articles.filter(a => a.is_featured).slice(0, 3);
  const recentArticles = articles.slice(0, 9);
  
  // Get articles with Instagram Reels and YouTube Shorts
  const articlesWithReels = articles.filter(a => a.instagram_reel_url);
  const articlesWithShorts = articles.filter(a => a.youtube_short_url);
  
  // Combine and get unique articles with social media
  const socialMediaArticles = [
    ...articlesWithReels.slice(0, 6),
    ...articlesWithShorts.slice(0, 6)
  ].filter((article, index, self) => 
    index === self.findIndex(a => a.id === article.id)
  );

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="heading-serif-md mb-4">Stories & Reels</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the world of sarees through our curated articles and Instagram reels
          </p>
        </div>

        {/* Instagram Reels & YouTube Shorts Section */}
        {(articlesWithReels.length > 0 || articlesWithShorts.length > 0) && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-serif-sm">Reels & Shorts</h2>
              <a
                href="https://www.instagram.com/saree4ever"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-black hover:underline"
              >
                Follow us @saree4ever →
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Instagram Reels */}
              {articlesWithReels.slice(0, 6).map((article) => {
                const reelId = getInstagramReelId(article.instagram_reel_url);
                return (
                  <div key={article.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-black transition-colors">
                    <Link href={`/stories/${article.slug}`} className="block">
                      <div className="aspect-[9/16] bg-gray-100 relative overflow-hidden">
                        {article.featured_image_url ? (
                          <Image
                            src={article.featured_image_url}
                            alt={article.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          Instagram
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">{article.title}</h3>
                        {article.excerpt && (
                          <p className="text-xs text-gray-600 line-clamp-2">{article.excerpt}</p>
                        )}
                      </div>
                    </Link>
                  </div>
                );
              })}
              
              {/* YouTube Shorts */}
              {articlesWithShorts.slice(0, 6).map((article) => {
                const videoId = getYouTubeVideoId(article.youtube_short_url);
                return (
                  <div key={article.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-black transition-colors">
                    <Link href={`/stories/${article.slug}`} className="block">
                      <div className="aspect-[9/16] bg-gray-100 relative overflow-hidden">
                        {article.featured_image_url ? (
                          <Image
                            src={article.featured_image_url}
                            alt={article.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : videoId ? (
                          <div className="w-full h-full flex items-center justify-center bg-black">
                            <img
                              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                          YouTube
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">{article.title}</h3>
                        {article.excerpt && (
                          <p className="text-xs text-gray-600 line-clamp-2">{article.excerpt}</p>
                        )}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
            
            {socialMediaArticles.length === 0 && (
              <div className="text-center py-12 bg-gray-50 border border-gray-200">
                <p className="text-gray-600 mb-2">No reels or shorts available yet</p>
                <p className="text-sm text-gray-500">
                  Add Instagram Reels or YouTube Shorts links when creating blog articles in the admin panel
                </p>
              </div>
            )}
          </section>
        )}

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section className="mb-16">
            <h2 className="heading-serif-sm mb-6">Featured Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/stories/${article.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 mb-4">
                    {article.featured_image_url ? (
                      <Image
                        src={article.featured_image_url}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-4xl font-serif">{article.title.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  {article.category && (
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
                      {article.category}
                    </span>
                  )}
                  <h3 className="heading-serif-sm mb-2 group-hover:underline">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Articles */}
        <section>
          <h2 className="heading-serif-sm mb-6">All Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentArticles.map((article) => (
              <Link
                key={article.id}
                href={`/stories/${article.slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 mb-4">
                  {article.featured_image_url ? (
                    <Image
                      src={article.featured_image_url}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-4xl font-serif">{article.title.charAt(0)}</span>
                    </div>
                  )}
                </div>
                {article.category && (
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
                    {article.category}
                  </span>
                )}
                <h3 className="heading-serif-sm mb-2 group-hover:underline">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                    {article.excerpt}
                  </p>
                )}
                <div className="flex items-center text-xs text-gray-500">
                  {article.author_name && <span>{article.author_name}</span>}
                  {article.published_at && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{new Date(article.published_at).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No stories available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

