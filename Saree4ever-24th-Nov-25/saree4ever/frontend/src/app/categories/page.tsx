import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url?: string | null;
}

async function getCategories(): Promise<Category[]> {
  try {
    const response = await api.categories.getAll();
    const categories = (response as { categories?: Category[] }).categories || (response as Category[]) || [];
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li>/</li>
            <li className="text-black font-medium">Categories</li>
          </ol>
        </nav>

        <div className="text-center mb-12">
          <h1 className="heading-serif-md mb-4">Shop By Category</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our sarees organized by category
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 mb-4">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-4xl font-serif">{category.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <h2 className="heading-serif-sm mb-2 group-hover:underline">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {category.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No categories available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}


