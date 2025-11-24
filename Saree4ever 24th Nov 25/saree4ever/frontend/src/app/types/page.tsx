import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';

interface Type {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url?: string | null;
}

async function getTypes(): Promise<Type[]> {
  try {
    const response = await api.types.getAll();
    const types = (response as { types?: Type[] }).types || (response as Type[]) || [];
    return types;
  } catch (error) {
    console.error('Error fetching types:', error);
    return [];
  }
}

export default async function TypesPage() {
  const types = await getTypes();

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li>/</li>
            <li className="text-black font-medium">Shop By Type</li>
          </ol>
        </nav>

        <div className="text-center mb-12">
          <h1 className="heading-serif-md mb-4">Shop By Type</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse our sarees by fabric type and style
          </p>
        </div>

        {types.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {types.map((type) => (
              <Link
                key={type.id}
                href={`/types/${type.slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 mb-4">
                  {type.image_url ? (
                    <Image
                      src={type.image_url}
                      alt={type.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-4xl font-serif">{type.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <h2 className="heading-serif-sm mb-2 group-hover:underline">
                  {type.name}
                </h2>
                {type.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {type.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No types available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}


