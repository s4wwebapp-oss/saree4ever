import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import HeroCarousel from '@/components/HeroCarousel';

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

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

interface Testimonial {
  id: string;
  customer_name: string;
  customer_role: string | null;
  content: string;
  rating: number;
  image_url: string | null;
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

async function getCollections(): Promise<Collection[]> {
  try {
    const response: any = await api.collections.getAll();
    const collections = response.collections || response || [];
    return collections.slice(0, 6); // Get top 6 collections
  } catch (error: any) {
    console.error('Error fetching collections:', error);
    // Return empty array if API fails - section won't show
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

export default async function HomePage() {
  const [heroSlides, featuredProducts, collections, testimonials] = await Promise.all([
    getHeroSlides(),
    getFeaturedProducts(),
    getCollections(),
    getTestimonials(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroCarousel slides={heroSlides} />

      {/* Featured Products */}
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

      {/* Collections Showcase */}
      {collections.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="heading-serif-md mb-4">Shop By Collection</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore our curated collections, each telling a unique story of tradition and elegance
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.slug}`}
                  className="group relative overflow-hidden bg-white border border-gray-200 hover:border-black transition-all"
                >
                  <div className="aspect-square relative bg-gray-100">
                    {collection.image_url ? (
                      <Image
                        src={collection.image_url}
                        alt={collection.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-4xl">👗</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-medium text-sm group-hover:text-black transition-colors">
                      {collection.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
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
              <h3 className="text-xl font-semibold mb-2">Worldwide Shipping</h3>
              <p className="text-gray-300">
                Free shipping worldwide with complimentary falls and pico. Your dream saree delivered safely
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

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
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

      {/* About Preview Section */}
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

      {/* Blog Preview Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="heading-serif-md mb-4">Stories & Guides</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover the art of sarees, styling tips, and stories from our heritage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/blog/art-of-draping-kanjivaram"
              className="bg-white border border-gray-200 hover:border-black transition-colors group"
            >
              <div className="relative aspect-video bg-gray-100">
                <Image
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80"
                  alt="The Art of Draping Kanjivaram"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold mb-2 group-hover:text-black transition-colors">
                  The Art of Draping Kanjivaram
                </h3>
                <p className="text-sm text-gray-600">
                  Master the perfect drape for your heavy silk sarees
                </p>
              </div>
            </Link>

            <Link
              href="/blog/history-of-banarasi-silk"
              className="bg-white border border-gray-200 hover:border-black transition-colors group"
            >
              <div className="relative aspect-video bg-gray-100">
                <Image
                  src="https://images.unsplash.com/photo-1583391726247-e99ecdf93da2?w=800&q=80"
                  alt="History of Banarasi Silk"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold mb-2 group-hover:text-black transition-colors">
                  History of Banarasi Silk
                </h3>
                <p className="text-sm text-gray-600">
                  Dive deep into the rich history of Banaras weaving
                </p>
              </div>
            </Link>

            <Link
              href="/blog/summer-saree-trends-2025"
              className="bg-white border border-gray-200 hover:border-black transition-colors group"
            >
              <div className="relative aspect-video bg-gray-100">
                <Image
                  src="https://images.unsplash.com/photo-1627054248072-c7272273e883?w=800&q=80"
                  alt="Summer Saree Trends 2025"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold mb-2 group-hover:text-black transition-colors">
                  Summer Saree Trends 2025
                </h3>
                <p className="text-sm text-gray-600">
                  Stay cool and stylish this summer
                </p>
              </div>
            </Link>
          </div>

          <div className="text-center mt-12">
            <Link href="/blog" className="btn-outline">
              Read All Stories
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
