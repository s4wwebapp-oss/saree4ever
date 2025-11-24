import Image from 'next/image';
import Link from 'next/link';
import { aboutData } from '@/data/aboutData';

export default function AboutPage() {
  const { hero, story, missionVision, values, artisan, cta } = aboutData;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="heading-serif-md mb-4">{hero.title}</h1>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            {hero.subtitle}
          </p>
        </div>

        {/* Story Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden rounded-lg">
              <Image
                src={story.image}
                alt={story.title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div>
              <h2 className="text-3xl font-serif mb-4">{story.title}</h2>
              {story.content.map((paragraph, index) => (
                <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 border border-gray-200 rounded-lg">
              <h3 className="text-2xl font-serif mb-4">{missionVision.mission.title}</h3>
              <p className="text-gray-700 leading-relaxed">
                {missionVision.mission.content}
              </p>
            </div>
            <div className="bg-gray-50 p-8 border border-gray-200 rounded-lg">
              <h3 className="text-2xl font-serif mb-4">{missionVision.vision.title}</h3>
              <p className="text-gray-700 leading-relaxed">
                {missionVision.vision.content}
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Artisan Story - Enhanced with Image */}
        <section className="mb-16 py-12 bg-gray-50 rounded-xl overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                   <h2 className="text-3xl font-serif mb-6">{artisan.title}</h2>
                   {artisan.content.map((paragraph, index) => (
                    <p key={index} className="text-gray-700 mb-6 leading-relaxed">
                      {paragraph}
                    </p>
                   ))}
                </div>
                <div className="order-1 lg:order-2 relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
                  {artisan.image && (
                    <Image
                      src={artisan.image}
                      alt="Artisan at work"
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  )}
                </div>
             </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12">
          <h2 className="text-3xl font-serif mb-4">{cta.title}</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
            {cta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={cta.primaryButton.link} className="btn-primary px-8 py-3">
              {cta.primaryButton.text}
            </Link>
            <Link href={cta.secondaryButton.link} className="btn-outline px-8 py-3">
              {cta.secondaryButton.text}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
