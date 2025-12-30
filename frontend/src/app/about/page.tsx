import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="heading-serif-md mb-4">About Saree4ever</h1>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Celebrating India's rich textile heritage, one saree at a time
          </p>
        </div>

        {/* Story Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <div className="relative aspect-[4/3] bg-gray-100">
              <Image
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80"
                alt="Our Story"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div>
              <h2 className="text-3xl font-serif mb-4">Our Story</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Saree4ever was born from a deep appreciation for India's timeless textile traditions. 
                Founded with a vision to make authentic, handcrafted sarees accessible to women worldwide, 
                we work directly with skilled artisans and weavers across the country.
              </p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Our journey began when we discovered the challenges faced by traditional weavers in 
                reaching a global audience. We set out to bridge this gap, creating a platform that 
                celebrates their craftsmanship while ensuring fair trade practices.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Today, Saree4ever stands as a testament to the beauty of Indian textiles, offering 
                a curated collection that honors tradition while embracing modern elegance.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 border border-gray-200">
              <h3 className="text-2xl font-serif mb-4">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To preserve and promote India's rich textile heritage by connecting skilled artisans 
                with saree lovers worldwide. We are committed to authenticity, quality, and supporting 
                the communities that keep these traditions alive.
              </p>
            </div>
            <div className="bg-gray-50 p-8 border border-gray-200">
              <h3 className="text-2xl font-serif mb-4">Our Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                To become the most trusted destination for authentic Indian sarees globally, where 
                every purchase supports traditional craftsmanship and brings the beauty of Indian 
                textiles to homes around the world.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2">Authenticity</h3>
              <p className="text-gray-600">
                Every saree is sourced directly from weavers, ensuring genuine handcrafted quality
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2">Fair Trade</h3>
              <p className="text-gray-600">
                We ensure fair compensation for artisans and support sustainable practices
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💎</div>
              <h3 className="text-xl font-semibold mb-2">Quality</h3>
              <p className="text-gray-600">
                Rigorous quality checks ensure every saree meets our high standards
              </p>
            </div>
          </div>
        </section>

        {/* Artisan Story */}
        <section className="mb-16 bg-gray-50 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-serif mb-6">Supporting Artisan Communities</h2>
            <p className="text-gray-700 mb-8 leading-relaxed">
              Behind every saree in our collection is a story of dedication, skill, and tradition. 
              Our artisans, many of whom come from families that have been weaving for generations, 
              pour their heart and soul into creating these masterpieces.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By choosing Saree4ever, you're not just buying a saree—you're supporting these 
              communities, preserving ancient techniques, and ensuring that these beautiful traditions 
              continue to thrive for generations to come.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <h2 className="text-3xl font-serif mb-4">Join Our Journey</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore our collection and discover the perfect saree that speaks to your style and celebrates tradition
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="btn-primary">
              Shop Now
            </Link>
            <Link href="/contact" className="btn-outline">
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
