import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';

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

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="heading-serif-md mb-4">Collections</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our curated saree collections
          </p>
        </div>

        {collections.length > 0 ? (
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
                <h2 className="heading-serif-sm mb-2 group-hover:underline">
                  {collection.name}
                </h2>
                {collection.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {collection.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No collections available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

