'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface Category {
  name: string;
  slug: string;
  image_url: string;
}

interface ExpandableCategoryGridProps {
  categories: Category[];
}

export default function ExpandableCategoryGrid({ categories }: ExpandableCategoryGridProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Show first 4 categories initially, rest when expanded
  const initialCategories = categories.slice(0, 4);
  const remainingCategories = categories.slice(4);

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
  };

  return (
    <div className="flex justify-center gap-4 md:gap-6 lg:gap-8 flex-wrap">
      {/* First 4 categories */}
      {initialCategories.map((category) => (
        <Link
          key={category.slug}
          href={`/categories/${category.slug}`}
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

      {/* "Other" expand button - only show if there are more categories and not expanded */}
      {remainingCategories.length > 0 && !isExpanded && (
        <button
          onClick={handleExpand}
          className="group flex flex-col items-center cursor-pointer"
        >
          <div className="relative w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 mb-2 border-2 border-gray-400 group-hover:border-black transition-all shadow-sm flex items-center justify-center">
            <span className="text-2xl md:text-3xl font-bold text-gray-600 group-hover:text-black transition-colors">
              +
            </span>
          </div>
          <span className="text-xs md:text-sm font-medium text-center group-hover:text-black transition-colors max-w-[100px]">
            Others
          </span>
        </button>
      )}

      {/* Remaining categories - shown when expanded */}
      {isExpanded && remainingCategories.map((category) => (
        <Link
          key={category.slug}
          href={`/categories/${category.slug}`}
          className="group flex flex-col items-center animate-[fadeIn_0.3s_ease-in-out]"
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

      {/* Collapse button - shown when expanded */}
      {isExpanded && remainingCategories.length > 0 && (
        <button
          onClick={handleCollapse}
          className="group flex flex-col items-center cursor-pointer animate-[fadeIn_0.3s_ease-in-out]"
        >
          <div className="relative w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 mb-2 border-2 border-gray-400 group-hover:border-black transition-all shadow-sm flex items-center justify-center">
            <span className="text-2xl md:text-3xl font-bold text-gray-600 group-hover:text-black transition-colors">
              −
            </span>
          </div>
          <span className="text-xs md:text-sm font-medium text-center group-hover:text-black transition-colors max-w-[100px]">
            Less
          </span>
        </button>
      )}
    </div>
  );
}

