import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import HeroCarousel from '@/components/HeroCarousel';
import ExpandableCategoryGrid from '@/components/ExpandableCategoryGrid';
import ReelsSection from '@/components/ReelsSection';
import LandingPageVideoSection from '@/components/LandingPageVideoSection';
import ReviewsSection from '@/components/ReviewsSection';
import ComingSoon, { ComingSoonMedia, ComingSoonProps } from '@/components/ComingSoon';

interface Product {
  id: string;
  slug: string;
  name: string;
  primary_image_url: string | null;
  base_price: number;
  compare_at_price: number | null;
  collection?: {
    name: string;
  };
  collections?: Array<{
    id?: string;
    name: string;
    slug?: string;
  }>;
}

interface HeroSlide {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  button_text: string | null;
  button_link: string | null;
  button_target: string;
}

interface Testimonial {
  id: string;
  customer_name: string;
  customer_role: string | null;
  content: string;
  rating: number;
  image_url: string | null;
  created_at?: string;
}

interface LandingPageVideo {
  id: string;
  video_url: string | null;
  video_file_path: string | null;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  display_order: number;
  video_orientation?: 'horizontal' | 'vertical';
}

async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const response: any = await api.heroSlides.getActive();
    return response.slides || [];
  } catch (error: any) {
    console.error('Error fetching hero slides:', error);
    // Return fallback slides if API fails
    return [
      {
        id: 'fallback-1',
        title: 'Ethereal Silk Collection',
        subtitle: 'Handwoven masterpieces for the modern woman',
        image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&q=80',
        button_text: 'Shop Collection',
        button_link: '/products',
        button_target: '_self',
      },
    ];
  }
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const response = await api.products.getAll({ featured: true, limit: 8 });
    return (response as { products?: Product[] }).products || (response as Product[]) || [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}


async function getTestimonials(): Promise<Testimonial[]> {
  try {
    // Assuming we have a testimonials API endpoint
    const response: any = await api.testimonials?.getActive?.() || { testimonials: [] };
    return response.testimonials || [];
  } catch (error: any) {
    console.error('Error fetching testimonials:', error);
    // Return fallback testimonials if API fails
    return [
      {
        id: 'fallback-1',
        customer_name: 'Priya Sharma',
        customer_role: 'Wedding Bride',
        content: 'The Kanjivaram saree I bought for my wedding was absolutely stunning. The quality of silk and the intricacy of the zari work were beyond my expectations.',
        rating: 5,
        image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      },
      {
        id: 'fallback-2',
        customer_name: 'Anjali Desai',
        customer_role: 'Regular Customer',
        content: 'I love the collection here. Whether it\'s a heavy silk saree for a function or a light cotton one for office, Saree4ever never disappoints.',
        rating: 5,
        image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
      },
    ];
  }
}

interface QuickCategory {
  name: string;
  slug: string;
  image_url: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  description: string | null;
  is_active?: boolean;
}

async function getQuickCategories(): Promise<QuickCategory[]> {
  // Define the 4 required categories
  const requiredCategories = [
    { name: 'Blouses', slug: 'blouses', image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&q=80' },
    { name: 'Jewels', slug: 'jewels', image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80' },
    { name: 'New Arrivals', slug: 'new-arrivals', image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80' },
    { name: 'Hot deals', slug: 'hot-deals', image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&q=80' },
  ];

  try {
    // Fetch existing categories from API
    const response = await api.categories.getAll();
    const categories = (response as { categories?: Category[] }).categories || (response as Category[]) || [];
    
    // Create a map of existing categories by slug
    const categoryMap = new Map<string, Category>();
    categories.forEach((cat) => {
      categoryMap.set(cat.slug.toLowerCase(), cat);
    });

    // Build result array, using existing category data if found, otherwise use defaults
    const result: QuickCategory[] = requiredCategories.map((req) => {
      const existing = categoryMap.get(req.slug.toLowerCase());
      return {
        name: existing?.name || req.name,
        slug: existing?.slug || req.slug,
        image_url: existing?.image_url || req.image_url,
      };
    });

    return result;
  } catch (error) {
    console.error('Error fetching categories, using defaults:', error);
    // Fallback to default categories if API fails
    return requiredCategories;
  }
}

async function getAllCategories(): Promise<QuickCategory[]> {
  try {
    // Fetch all categories from API
    const response = await api.categories.getAll();
    const categories = (response as { categories?: Category[] }).categories || (response as Category[]) || [];
    
    // Filter only active categories and map to QuickCategory format
    const result: QuickCategory[] = categories
      .filter((cat) => cat.is_active !== false)
      .map((cat) => ({
        name: cat.name,
        slug: cat.slug,
        image_url: cat.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80',
      }))
      .slice(0, 12); // Limit to 12 categories for display

    return result;
  } catch (error) {
    console.error('Error fetching all categories:', error);
    return [];
  }
}

interface Reel {
  id: string;
  title: string;
  slug: string;
  featured_image_url: string | null;
  instagram_reel_url: string | null;
  youtube_short_url: string | null;
}

interface Story {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  author_name: string | null;
  published_at: string;
  is_featured: boolean;
}

async function getReels(): Promise<Reel[]> {
  try {
    const response: any = await api.blog.getAll({ limit: 20 });
    const articles = response.articles || [];
    
    // Filter articles that have reels or videos
    const reels = articles
      .filter((article: any) => 
        article.instagram_reel_url || 
        article.youtube_short_url ||
        article.content_type === 'reel' ||
        article.content_type === 'video'
      )
      .slice(0, 8) // Limit to 8 reels
      .map((article: any) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        featured_image_url: article.featured_image_url,
        instagram_reel_url: article.instagram_reel_url,
        youtube_short_url: article.youtube_short_url,
      }));

    return reels;
  } catch (error) {
    console.error('Error fetching reels:', error);
    return [];
  }
}

async function getStories(): Promise<Story[]> {
  try {
    const response: any = await api.blog.getAll({ limit: 6, featured: true });
    const articles = response.articles || [];
    
    // Get featured stories or recent stories
    const stories = articles
      .filter((article: any) => 
        !article.instagram_reel_url && 
        !article.youtube_short_url &&
        article.content_type !== 'reel' &&
        article.content_type !== 'video'
      )
      .slice(0, 6)
      .map((article: any) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        featured_image_url: article.featured_image_url,
        author_name: article.author_name,
        published_at: article.published_at,
        is_featured: article.is_featured,
      }));

    return stories;
  } catch (error) {
    console.error('Error fetching stories:', error);
    return [];
  }
}

async function getLandingPageVideos(): Promise<LandingPageVideo[]> {
  try {
    const response: any = await api.landingPageVideo.getActive();
    return response.videos || [];
  } catch (error) {
    console.error('Error fetching landing page videos:', error);
    return [];
  }
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

async function getCollections(): Promise<Collection[]> {
  try {
    const response = await api.collections.getAll();
    return (response as { collections?: Collection[] }).collections || (response as Collection[]) || [];
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

async function getSectionVisibility(): Promise<Record<string, boolean>> {
  try {
    const response: any = await api.landingPageSections.getVisibility();
    return response.visibility || {};
  } catch (error) {
    console.error('Error fetching section visibility:', error);
    // Return all sections visible by default if API fails
    return {
      quick_categories: true,
      landing_videos: true,
      hero_carousel: true,
      shop_by_category: true,
      featured_products: true,
      reels: true,
      stories: true,
      testimonials: true,
      about_preview: true,
      why_choose_us: true,
      collections: true,
      reviews: true,
    };
  }
}

async function getComingSoonSettings(): Promise<{ is_enabled: boolean; title?: string; subtitle?: string }> {
  try {
    const response: any = await api.comingSoon.getSettings();
    return response.settings || { is_enabled: false };
  } catch (error) {
    console.error('Error fetching coming soon settings:', error);
    return { is_enabled: false };
  }
}

async function getComingSoonMedia(): Promise<ComingSoonMedia[]> {
  try {
    const response: any = await api.comingSoon.getMedia();
    return (response.media || []) as ComingSoonMedia[];
  } catch (error) {
    console.error('Error fetching coming soon media:', error);
    return [];
  }
}

export default async function HomePage() {
  // Check coming soon mode first
  const [comingSoonSettings, comingSoonMedia] = await Promise.all([
    getComingSoonSettings(),
    getComingSoonMedia(),
  ]);

  // If coming soon is enabled, show coming soon page
  if (comingSoonSettings.is_enabled) {
    return (
      <ComingSoon
        title={comingSoonSettings.title}
        subtitle={comingSoonSettings.subtitle}
        media={comingSoonMedia}
      />
    );
  }

  // Otherwise, show regular landing page
  const [heroSlides, featuredProducts, testimonials, quickCategories, allCategories, reels, stories, videos, collections, sectionVisibility] = await Promise.all([
    getHeroSlides(),
    getFeaturedProducts(),
    getTestimonials(),
    getQuickCategories(),
    getAllCategories(),
    getReels(),
    getStories(),
    getLandingPageVideos(),
    getCollections(),
    getSectionVisibility(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Quick Categories - Circular Icons (Above Hero) */}
      {sectionVisibility.quick_categories !== false && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex justify-center gap-4 md:gap-8 lg:gap-12 flex-wrap">
          {quickCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="group flex flex-col items-center"
            >
              <div className="relative w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden bg-gray-100 mb-2 border-2 border-gray-200 group-hover:border-black transition-all shadow-sm">
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 80px, (max-width: 1024px) 96px, 112px"
                />
              </div>
              <span className="text-xs md:text-sm font-medium text-center group-hover:text-black transition-colors max-w-[100px]">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>
      )}

      {/* Landing Page Video Section - After Quick Categories */}
      {sectionVisibility.landing_videos !== false && videos.length > 0 && <LandingPageVideoSection videos={videos} />}

      {/* Hero Section */}
      <HeroCarousel slides={heroSlides} />

      {/* Shop by Category Section */}
      {sectionVisibility.shop_by_category !== false && allCategories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="heading-serif-md mb-4">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of categories to find exactly what you're looking for
            </p>
          </div>
          <ExpandableCategoryGrid categories={allCategories} />
        </section>
      )}

      {/* Collections Section */}
      {sectionVisibility.collections !== false && collections.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="heading-serif-md mb-4">Collections</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore our curated saree collections, each one a testament to timeless elegance
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 mb-4">
                    {collection.image_url ? (
                      <Image
                        src={collection.image_url}
                        alt={collection.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <h3 className="heading-serif-sm mb-2 group-hover:underline">
                    {collection.name}
                  </h3>
                  {collection.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/collections" className="btn-outline">
                View All Collections
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {sectionVisibility.featured_products !== false && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="heading-serif-md mb-4">Featured Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Handpicked sarees from our collection, each one a masterpiece of craftsmanship
          </p>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                slug={product.slug}
                name={product.name}
                image={product.primary_image_url}
                price={product.base_price}
                compareAtPrice={product.compare_at_price}
                collection={product.collection?.name}
                collections={product.collections}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No featured products available at the moment.</p>
            <Link href="/products" className="btn-primary mt-4 inline-block">
              Browse All Products
            </Link>
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/products" className="btn-outline">
            View All Products
          </Link>
        </div>
      </section>
      )}

      {/* Reels Section */}
      {sectionVisibility.reels !== false && reels.length > 0 && <ReelsSection reels={reels} />}

      {/* Stories Section */}
      {sectionVisibility.stories !== false && stories.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="heading-serif-md mb-4">Stories</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover inspiring stories, styling tips, and insights from the world of sarees
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <Link
                  key={story.id}
                  href={`/stories/${story.slug}`}
                  className="bg-white border border-gray-200 hover:border-black transition-colors group"
                >
                  {story.featured_image_url && (
                    <div className="relative aspect-video bg-gray-100 overflow-hidden">
                      <Image
                        src={story.featured_image_url}
                        alt={story.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-semibold mb-2 group-hover:text-black transition-colors line-clamp-2">
                      {story.title}
                    </h3>
                    {story.excerpt && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {story.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {story.author_name && (
                        <span>By {story.author_name}</span>
                      )}
                      {story.published_at && (
                        <span>
                          {new Date(story.published_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/stories" className="btn-outline">
                Read All Stories
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {sectionVisibility.testimonials !== false && testimonials.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="heading-serif-md mb-4">What Our Customers Say</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Real experiences from our valued customers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white p-6 border border-gray-200 hover:border-black transition-colors"
                >
                  <div className="flex items-center mb-4">
                    {testimonial.image_url && (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden mr-3">
                        <Image
                          src={testimonial.image_url}
                          alt={testimonial.customer_name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold">{testimonial.customer_name}</h4>
                      {testimonial.customer_role && (
                        <p className="text-sm text-gray-600">{testimonial.customer_role}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">"{testimonial.content}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section - Google-style review cards */}
      {sectionVisibility.reviews !== false && testimonials.length > 0 && (
        <ReviewsSection reviews={testimonials} />
      )}

      {/* About Preview Section */}
      {sectionVisibility.about_preview !== false && (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] bg-gray-100">
              <Image
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80"
                alt="About Saree4ever"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div>
              <h2 className="heading-serif-md mb-4">Our Story</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Saree4ever was born from a passion for preserving India's rich textile heritage. 
                We work directly with skilled artisans and weavers across the country to bring you 
                authentic, handcrafted sarees that tell stories of tradition, culture, and timeless elegance.
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Every saree in our collection is carefully selected, ensuring that you receive not 
                just a piece of clothing, but a work of art that celebrates centuries of craftsmanship.
              </p>
              <Link href="/about" className="btn-outline">
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Why Choose Us Section */}
      {sectionVisibility.why_choose_us !== false && (
      <section className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="heading-serif-md mb-4 text-white">Why Choose Saree4ever</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              We bring you authentic, handcrafted sarees with a commitment to quality and tradition
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2">Authentic Handlooms</h3>
              <p className="text-gray-300">
                Direct from weavers, ensuring authenticity and supporting traditional craftsmanship
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-2">All India Shipping</h3>
              <p className="text-gray-300">
                Free shipping across India with complimentary falls and pico. Your dream saree delivered safely
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💎</div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-300">
                Every saree is carefully curated and quality-checked before reaching you
              </p>
            </div>
          </div>
        </div>
      </section>
      )}

    </div>
  );
}
