'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Type {
  id: string;
  name: string;
  slug: string;
}

interface Announcement {
  id: string;
  text: string;
  link_url: string | null;
  link_target: string;
  is_active: boolean;
}

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { itemCount } = useCart();
  const pathname = usePathname();
  const shopDropdownRef = useRef<HTMLDivElement>(null);
  const collectionsDropdownRef = useRef<HTMLDivElement>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch collections, categories, types, and announcement
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collectionsRes, categoriesRes, typesRes, announcementRes] = await Promise.all([
          api.collections.getAll(),
          api.categories.getAll(),
          api.types.getAll(),
          api.announcement.getActive().catch(() => ({ announcement: null })), // Gracefully handle if no announcement
        ]);
        
        // Normalize collections
        const collectionsData = (collectionsRes as { collections?: Collection[] }).collections || (collectionsRes as Collection[]) || [];
        setCollections(collectionsData);
        
        // Normalize categories
        const categoriesData = (categoriesRes as { categories?: Category[] }).categories || (categoriesRes as Category[]) || [];
        setCategories(categoriesData);
        
        // Normalize types
        const typesData = (typesRes as { types?: Type[] }).types || (typesRes as Type[]) || [];
        setTypes(typesData);

        // Set announcement
        const announcementData = (announcementRes as { announcement?: Announcement }).announcement;
        if (announcementData) {
          setAnnouncement(announcementData);
        }
      } catch (error) {
        console.error('Failed to fetch navigation data:', error);
      }
    };
    fetchData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const refs = [shopDropdownRef, collectionsDropdownRef, categoriesDropdownRef];
      const isOutside = refs.every(
        (ref) => !ref.current || !ref.current.contains(target)
      );
      if (isOutside) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdown]);

  const isActive = (path: string) => pathname === path;

  const renderAnnouncement = () => {
    if (!announcement || !announcement.is_active) return null;

    const content = (
      <p className="uppercase tracking-wide">
        {announcement.text}
      </p>
    );

    if (announcement.link_url) {
      return (
        <Link
          href={announcement.link_url}
          target={announcement.link_target || '_self'}
          className="block hover:opacity-80 transition-opacity"
        >
          {content}
        </Link>
      );
    }

    return content;
  };

  return (
    <header className="bg-white sticky top-0 z-50">
      {/* Top Announcement Bar */}
      {announcement && announcement.is_active && (
        <div className="bg-black text-white text-xs py-2 text-center">
          {renderAnnouncement()}
        </div>
      )}

      {/* Branding Area */}
      <div className="bg-white py-6 text-center border-b border-gray-200">
        <Link href="/" className="block">
          <h1 className="heading-serif text-4xl md:text-5xl font-bold mb-2">saree4ever</h1>
          <p className="text-sm font-sans tracking-widest uppercase text-gray-600">
            DRAPE YOUR DREAM
          </p>
        </Link>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-center h-14 pr-0">
            {/* Center Navigation */}
            <nav className="hidden md:flex items-center space-x-6 mx-auto">
              <Link
                href="/"
                className={`text-sm font-medium hover:underline text-black ${
                  isActive('/') ? 'font-semibold' : ''
                }`}
              >
                Home
              </Link>
              <Link
                href="/collections/new-arrivals"
                className={`text-sm font-medium hover:underline text-black ${
                  isActive('/collections/new-arrivals') ? 'font-semibold' : ''
                }`}
              >
                New Arrivals
              </Link>

              <Link
                href="/products"
                className={`text-sm font-medium hover:underline text-black ${
                  isActive('/products') || pathname.startsWith('/products/') ? 'font-semibold' : ''
                }`}
              >
                All Products
              </Link>

              {/* Shop By Dropdown */}
              <div className="relative" ref={shopDropdownRef}>
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'shop' ? null : 'shop')}
                  className="text-sm font-medium text-black hover:underline flex items-center space-x-1"
                >
                  <span>Shop By</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      openDropdown === 'shop' ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openDropdown === 'shop' && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border border-gray-200 shadow-2xl rounded-sm py-8 px-10 z-50 min-w-[550px] max-w-[950px]">
                    <div className="flex flex-col gap-8">
                      {/* Types Section */}
                      {types.length > 0 && (
                        <div>
                          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] mb-4 pb-2.5 border-b border-gray-200">
                            Shop By Type
                          </div>
                          <div className="flex flex-wrap items-center gap-x-10 gap-y-3.5">
                            {types.map((type) => (
                              <Link
                                key={type.id}
                                href={`/types/${type.slug}`}
                                className="text-sm font-normal text-gray-600 hover:text-black hover:font-medium transition-all duration-200 whitespace-nowrap relative group"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <span className="relative">
                                  {type.name}
                                  <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-200 group-hover:w-full"></span>
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Categories Section */}
                      {categories.length > 0 && (
                        <div>
                          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] mb-4 pb-2.5 border-b border-gray-200">
                            Shop By Category
                          </div>
                          <div className="flex flex-wrap items-center gap-x-10 gap-y-3.5">
                            {categories.map((category) => (
                              <Link
                                key={category.id}
                                href={`/categories/${category.slug}`}
                                className="text-sm font-normal text-gray-600 hover:text-black hover:font-medium transition-all duration-200 whitespace-nowrap relative group"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <span className="relative">
                                  {category.name}
                                  <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-200 group-hover:w-full"></span>
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Collections Dropdown */}
              <div className="relative" ref={collectionsDropdownRef}>
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'collections' ? null : 'collections')}
                  className="text-sm font-medium text-black hover:underline flex items-center space-x-1"
                >
                  <span>Collections</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      openDropdown === 'collections' ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openDropdown === 'collections' && collections.length > 0 && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border border-gray-200 shadow-2xl rounded-sm py-8 px-10 z-50 min-w-[550px] max-w-[950px]">
                    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3.5">
                      {collections.map((collection) => (
                        <Link
                          key={collection.id}
                          href={`/collections/${collection.slug}`}
                          className="text-sm font-normal text-gray-600 hover:text-black hover:font-medium transition-all duration-200 whitespace-nowrap relative group"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span className="relative">
                            {collection.name}
                            <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-200 group-hover:w-full"></span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Categories Dropdown */}
              <div className="relative" ref={categoriesDropdownRef}>
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'categories' ? null : 'categories')}
                  className="text-sm font-medium text-black hover:underline flex items-center space-x-1"
                >
                  <span>Categories</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      openDropdown === 'categories' ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openDropdown === 'categories' && categories.length > 0 && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border border-gray-200 shadow-2xl rounded-sm py-8 px-10 z-50 min-w-[550px] max-w-[950px]">
                    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3.5">
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/categories/${category.slug}`}
                          className="text-sm font-normal text-gray-600 hover:text-black hover:font-medium transition-all duration-200 whitespace-nowrap relative group"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span className="relative">
                            {category.name}
                            <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-200 group-hover:w-full"></span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/offers"
                className={`text-sm font-medium hover:underline text-black ${
                  isActive('/offers') ? 'font-semibold' : ''
                }`}
              >
                Offers
              </Link>

              <Link
                href="/stories"
                className={`text-sm font-medium hover:underline text-black ${
                  isActive('/stories') || pathname.startsWith('/stories/') ? 'font-semibold' : ''
                }`}
              >
                Stories
              </Link>
            </nav>

            {/* Right Utilities */}
            <div className="absolute -right-4 sm:-right-6 lg:-right-8 top-1/2 -translate-y-1/2 flex items-center space-x-6">
            {/* Search */}
            <Link
              href="/search"
              className="hidden md:flex items-center space-x-2 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="text-sm font-medium">SEARCH</span>
            </Link>

              {/* Account */}
              <Link href="/account" className="p-2 hover:opacity-70 transition-opacity">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative p-2 hover:opacity-70 transition-opacity">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4 px-4">
              <Link
                href="/"
                className="text-sm font-medium text-black"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/collections/new-arrivals"
                className="text-sm font-medium text-black"
                onClick={() => setIsMenuOpen(false)}
              >
                New Arrivals
              </Link>
              <Link
                href="/types"
                className="text-sm font-medium text-black"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop By Type
              </Link>
              <Link
                href="/categories"
                className="text-sm font-medium text-black"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop By Category
              </Link>
              <Link
                href="/collections"
                className="text-sm font-medium text-black"
                onClick={() => setIsMenuOpen(false)}
              >
                Collections
              </Link>
              <Link
                href="/offers"
                className="text-sm font-medium text-black"
                onClick={() => setIsMenuOpen(false)}
              >
                Offers
              </Link>
              <div className="pt-4 border-t border-gray-200">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field w-full text-sm"
                />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

