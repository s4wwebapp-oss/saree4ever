import { api } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';

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
  published_at: string;
  view_count: number;
  meta_description: string | null;
  instagram_reel_url: string | null;
  youtube_short_url: string | null;
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

async function getArticle(slug: string): Promise<BlogArticle | null> {
  try {
    const response: any = await api.blog.getBySlug(slug);
    return response.article || null;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li>/</li>
            <li><Link href="/stories" className="hover:underline">Stories</Link></li>
            <li>/</li>
            <li className="text-black font-medium line-clamp-1">{article.title}</li>
          </ol>
        </nav>

        {/* Article Header */}
        <article>
          {article.category && (
            <span className="text-xs text-gray-500 uppercase tracking-wide mb-4 block">
              {article.category}
            </span>
          )}
          
          <h1 className="heading-serif-md mb-4">{article.title}</h1>
          
          {article.excerpt && (
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* Article Meta */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-8 pb-6 border-b border-gray-200">
            {article.author_name && (
              <div>
                <span className="font-medium">By {article.author_name}</span>
              </div>
            )}
            {article.published_at && (
              <>
                <span>•</span>
                <time dateTime={article.published_at}>
                  {new Date(article.published_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </>
            )}
            {article.view_count > 0 && (
              <>
                <span>•</span>
                <span>{article.view_count} views</span>
              </>
            )}
          </div>

          {/* Video Player (if Instagram Reel or YouTube Short) */}
          {(article.instagram_reel_url || article.youtube_short_url) && (
            <div className="mb-8">
              <VideoPlayer
                instagramUrl={article.instagram_reel_url}
                youtubeUrl={article.youtube_short_url}
                title={article.title}
                className="max-w-2xl mx-auto"
              />
            </div>
          )}

          {/* Featured Image (only if no video) */}
          {!article.instagram_reel_url && !article.youtube_short_url && article.featured_image_url && (
            <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 mb-8 rounded-lg">
              <Image
                src={article.featured_image_url}
                alt={article.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 896px"
              />
            </div>
          )}

          {/* Article Content */}
          <div
            className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-black prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-ul:my-4 prose-li:text-gray-700 prose-strong:text-black prose-strong:font-semibold prose-a:text-black prose-a:underline prose-a:no-underline prose-a:border-b prose-a:border-black prose-a:pb-0.5 hover:prose-a:border-gray-400"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Additional Social Media Links (if video is already embedded above) */}
          {(article.instagram_reel_url || article.youtube_short_url) && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Share this {article.instagram_reel_url ? 'reel' : 'video'} on social media
              </p>
            </div>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back to Stories */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/stories"
              className="text-sm text-gray-600 hover:text-black hover:underline"
            >
              ← Back to Stories
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}

