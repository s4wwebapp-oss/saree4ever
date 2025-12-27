'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import Logo from '@/components/Logo';

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

interface MenuConfig {
  column_1_title: string;
  column_2_title: string;
  column_3_title: string;
}

export default function Header({}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [menuConfigs, setMenuConfigs] = useState<Record<string, MenuConfig>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [wishlistCount] = useState(0); // TODO: Implement wishlist functionality
  const [isScrolled, setIsScrolled] = useState(false);
  const [isComingSoonMode, setIsComingSoonMode] = useState(false);
  const { itemCount } = useCart();
  const pathname = usePathname();
  const shopDropdownRef = useRef<HTMLDivElement>(null);
  const collectionsDropdownRef = useRef<HTMLDivElement>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch collections, categories, types, announcement, and menu configs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collectionsRes, categoriesRes, typesRes, announcementRes, menuConfigRes] = await Promise.all([
          api.collections.getAll(),
          api.categories.getAll(),
          api.types.getAll(),
          api.announcement.getActive().catch(() => ({ announcement: null })), // Gracefully handle if no announcement
          api.menuConfig.getAll().catch(() => ({ configs: {} })), // Gracefully handle if no menu config
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
        
        // Create mock announcements array
        const mockAnnouncements: Announcement[] = [
          {
            id: 'mock-1',
            text: 'FREE SHIPPING WORLDWIDE | COMPLIMENTARY FALLS & PICO',
            link_url: null,
            link_target: '_self',
            is_active: true,
          },
          {
            id: 'mock-2',
            text: '🎉 Special Offer: Get 20% off on all Kanjivaram Silk Sarees. Limited time only!',
            link_url: '/collections/kanjivaram',
            link_target: '_self',
            is_active: true,
          },
        ];

        // Combine API announcement with mock announcements
        const allAnnouncements: Announcement[] = [];
        if (announcementData && announcementData.is_active) {
          allAnnouncements.push(announcementData);
        }
        allAnnouncements.push(...mockAnnouncements);

        setAnnouncements(allAnnouncements);
        if (allAnnouncements.length > 0) {
          setAnnouncement(allAnnouncements[0]);
        }

        // Set menu configs
        const configsData = (menuConfigRes as { configs?: Record<string, MenuConfig> }).configs || {};
        setMenuConfigs(configsData);
      } catch (error) {
        console.error('Failed to fetch navigation data:', error);
      }
    };
    fetchData();
  }, []);

  // Check if coming soon mode is active
  useEffect(() => {
    const checkComingSoonMode = () => {
      setIsComingSoonMode(document.body.classList.contains('coming-soon-mode'));
    };
    
    // Check initially
    checkComingSoonMode();
    
    // Watch for changes (when ComingSoon component mounts/unmounts)
    const observer = new MutationObserver(checkComingSoonMode);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  // Close mobile menu when Grand Opening mode is active
  useEffect(() => {
    if (isComingSoonMode) {
      setIsMenuOpen(false);
    }
  }, [isComingSoonMode]);

  // Handle scroll to collapse announcement and menu bars
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 50); // Show/hide after 50px scroll
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
        setCategoryDropdownOpen(false);
      }
    };
    if (openDropdown || categoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdown, categoryDropdownOpen]);

  const isActive = (path: string) => pathname === path;

  // Auto-scroll announcements
  useEffect(() => {
    if (announcements.length <= 1) return;

    const interval = setInterval(() => {
      setAnnouncementIndex((prev) => {
        const nextIndex = (prev + 1) % announcements.length;
        setAnnouncement(announcements[nextIndex]);
        return nextIndex;
      });
    }, 5000); // Change announcement every 5 seconds

    return () => clearInterval(interval);
  }, [announcements]);

  // Handle announcement carousel (if multiple announcements)
  const handleAnnouncementPrev = () => {
    if (announcements.length <= 1) return;
    const newIndex = announcementIndex === 0 ? announcements.length - 1 : announcementIndex - 1;
    setAnnouncementIndex(newIndex);
    setAnnouncement(announcements[newIndex]);
  };

  const handleAnnouncementNext = () => {
    if (announcements.length <= 1) return;
    const newIndex = (announcementIndex + 1) % announcements.length;
    setAnnouncementIndex(newIndex);
    setAnnouncement(announcements[newIndex]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="bg-white sticky top-0 z-50">
      {/* Top Announcement Bar - Black (Collapses on scroll) - Hidden in Grand Opening mode */}
      {announcement && announcement.is_active && !isComingSoonMode && (
        <div className={`bg-black text-white text-xs md:text-sm py-2 md:py-2.5 relative transition-all duration-300 ${
          isScrolled ? 'hidden' : 'block'
        }`}>
          <div className="max-w-7xl mx-auto px-8 md:px-4 flex items-center justify-center">
            {/* Left Arrow */}
            {announcements.length > 1 && (
              <button
                onClick={handleAnnouncementPrev}
                className="absolute left-2 md:left-4 p-1 hover:opacity-70 transition-opacity z-10"
                aria-label="Previous announcement"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Announcement Text - Allow wrapping on mobile */}
            <div className="text-center flex-1 px-6 md:px-0">
              {announcement.link_url ? (
                <Link
                  href={announcement.link_url}
                  target={announcement.link_target || '_self'}
                  className="block hover:opacity-80 transition-opacity break-words whitespace-normal"
                >
                  {announcement.text}
                </Link>
              ) : (
                <p className="break-words whitespace-normal">{announcement.text}</p>
              )}
            </div>

            {/* Right Arrow */}
            {announcements.length > 1 && (
              <button
                onClick={handleAnnouncementNext}
                className="absolute right-2 md:right-4 p-1 hover:opacity-70 transition-opacity z-10"
                aria-label="Next announcement"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Carousel Indicators */}
            {announcements.length > 1 && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                {announcements.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setAnnouncementIndex(index);
                      setAnnouncement(announcements[index]);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-opacity ${
                      index === announcementIndex ? 'bg-white' : 'bg-white/40'
                    }`}
                    aria-label={`Go to announcement ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Header Section - Fixed on scroll */}
      <div className="bg-white border-b border-gray-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Header: Search (Left) | Logo (Center) | User Icons (Right) - All in one row */}
          <div className={`hidden md:grid grid-cols-3 items-center gap-4 py-0 transition-all duration-300 ${
            isScrolled ? 'py-0' : ''
          }`}>
            {/* Search Bar - Left side */}
            <div className="flex justify-start">
              {!isComingSoonMode && (
                <form onSubmit={handleSearch} className="flex items-center border border-gray-300 rounded-sm w-full max-w-2xl">
                {/* All Categories Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    className="px-4 py-2.5 border-r border-gray-300 flex items-center gap-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <span>All Categories</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Category Dropdown Menu */}
                  {categoryDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg z-50 min-w-[200px] max-h-96 overflow-y-auto">
                      <div className="py-2">
                        {categories.slice(0, 20).map((category) => (
                          <Link
                            key={category.id}
                            href={`/categories/${category.slug}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black"
                            onClick={() => setCategoryDropdownOpen(false)}
                          >
                            {category.name}
                          </Link>
                        ))}
                        {categories.length > 20 && (
                          <Link
                            href="/categories"
                            className="block px-4 py-2 text-sm font-medium text-black hover:bg-gray-50 border-t border-gray-200"
                            onClick={() => setCategoryDropdownOpen(false)}
                          >
                            View All Categories
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Search Input */}
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm focus:outline-none bg-gray-100"
                />

                {/* Search Button */}
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Search"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
              )}
            </div>

            {/* Logo - Center */}
            <div className="flex items-center justify-center">
              <Logo size={{ width: 240, height: 90 }} backgroundColor="white" />
            </div>

            {/* User Icons - Right side */}
            {!isComingSoonMode ? (
              <div className="flex items-center gap-4 justify-end">
                <Link href="/wishlist" className="relative flex items-center hover:opacity-70 transition-opacity">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link href="/account" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Sign in/ Register</span>
                </Link>

                <Link href="/cart" className="relative flex items-center hover:opacity-70 transition-opacity">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </div>
            ) : (
              <div></div>
            )}
          </div>

          {/* Mobile Header: Hamburger | Logo | User Icons */}
          <div className="md:hidden flex items-center justify-between py-0">
            {/* Mobile menu button - Left side - Hidden in Grand Opening mode */}
            {!isComingSoonMode && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 flex-shrink-0"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            )}

            {/* Brand Logo - Center - Smaller for mobile */}
            <div className={`flex-1 flex justify-center items-center px-2 ${isComingSoonMode ? 'justify-center' : ''}`}>
              <Logo size={{ width: 180, height: 68 }} backgroundColor="white" />
            </div>

            {/* User Icons - Right side */}
            {!isComingSoonMode && (
              <div className="flex items-center gap-3">
              <Link href="/wishlist" className="relative flex items-center hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link href="/account" className="flex items-center hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>

              <Link href="/cart" className="relative flex items-center hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
            )}
          </div>

          {/* Mobile Search Bar - Below logo row */}
          <div className="md:hidden pb-0">
            <form onSubmit={handleSearch} className="flex items-center border border-gray-300 rounded-sm coming-soon-hide-search">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="px-2 py-1.5 border-r border-gray-300 flex items-center gap-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <span>All</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {categoryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg z-50 min-w-[200px] max-h-96 overflow-y-auto">
                    <div className="py-2">
                      {categories.slice(0, 20).map((category) => (
                        <Link
                          key={category.id}
                          href={`/categories/${category.slug}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black"
                          onClick={() => setCategoryDropdownOpen(false)}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-2 py-1.5 text-xs focus:outline-none bg-gray-100"
              />

              <button
                type="submit"
                className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Menu Bar - Navigation Links - Hidden on mobile */}
      <div className="bg-white border-b border-gray-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center gap-4 md:gap-6 lg:gap-8 py-3 overflow-x-auto coming-soon-hide-nav">
            <Link
              href="/"
              className={`text-sm font-medium whitespace-nowrap hover:underline text-black ${
                isActive('/') ? 'font-semibold underline' : ''
              }`}
            >
              Home
            </Link>
            <Link
              href="/collections/new-arrivals"
              className={`text-sm font-medium whitespace-nowrap hover:underline text-black ${
                isActive('/collections/new-arrivals') ? 'font-semibold underline' : ''
              }`}
            >
              New Arrivals
            </Link>
            <Link
              href="/products"
              className={`text-sm font-medium whitespace-nowrap hover:underline text-black ${
                isActive('/products') ? 'font-semibold underline' : ''
              }`}
            >
              All Products
            </Link>

            {/* Shop By Dropdown */}
            <div className="relative" ref={shopDropdownRef}>
              <button
                onClick={() => setOpenDropdown(openDropdown === 'shop-by' ? null : 'shop-by')}
                className={`text-sm font-medium whitespace-nowrap hover:underline text-black flex items-center gap-1 ${
                  openDropdown === 'shop-by' ? 'font-semibold underline' : ''
                }`}
              >
                <span>Shop By</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openDropdown === 'shop-by' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-200 shadow-lg z-50 min-w-[200px] py-2">
                  {types.slice(0, 15).map((type) => (
                    <Link
                      key={type.id}
                      href={`/products?type=${type.slug}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black"
                      onClick={() => setOpenDropdown(null)}
                    >
                      {type.name}
                    </Link>
                  ))}
                  {types.length > 15 && (
                    <Link
                      href="/products"
                      className="block px-4 py-2 text-sm font-medium text-black hover:bg-gray-50 border-t border-gray-200"
                      onClick={() => setOpenDropdown(null)}
                    >
                      View All Types
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Collections Dropdown */}
            <div className="relative" ref={collectionsDropdownRef}>
              <button
                onClick={() => setOpenDropdown(openDropdown === 'collections' ? null : 'collections')}
                className={`text-sm font-medium whitespace-nowrap hover:underline text-black flex items-center gap-1 ${
                  openDropdown === 'collections' ? 'font-semibold underline' : ''
                }`}
              >
                <span>Collections</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openDropdown === 'collections' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-200 shadow-lg z-50 min-w-[200px] max-h-96 overflow-y-auto py-2">
                  {collections.slice(0, 20).map((collection) => (
                    <Link
                      key={collection.id}
                      href={`/collections/${collection.slug}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black"
                      onClick={() => setOpenDropdown(null)}
                    >
                      {collection.name}
                    </Link>
                  ))}
                  {collections.length > 20 && (
                    <Link
                      href="/collections"
                      className="block px-4 py-2 text-sm font-medium text-black hover:bg-gray-50 border-t border-gray-200"
                      onClick={() => setOpenDropdown(null)}
                    >
                      View All Collections
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Categories Dropdown */}
            <div className="relative" ref={categoriesDropdownRef}>
              <button
                onClick={() => setOpenDropdown(openDropdown === 'categories' ? null : 'categories')}
                className={`text-sm font-medium whitespace-nowrap hover:underline text-black flex items-center gap-1 ${
                  openDropdown === 'categories' ? 'font-semibold underline' : ''
                }`}
              >
                <span>Categories</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openDropdown === 'categories' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-200 shadow-lg z-50 min-w-[200px] max-h-96 overflow-y-auto py-2">
                  {categories.slice(0, 20).map((category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black"
                      onClick={() => setOpenDropdown(null)}
                    >
                      {category.name}
                    </Link>
                  ))}
                  {categories.length > 20 && (
                    <Link
                      href="/categories"
                      className="block px-4 py-2 text-sm font-medium text-black hover:bg-gray-50 border-t border-gray-200"
                      onClick={() => setOpenDropdown(null)}
                    >
                      View All Categories
                    </Link>
                  )}
                </div>
              )}
            </div>

            <Link
              href="/offers"
              className={`text-sm font-medium whitespace-nowrap hover:underline text-black ${
                isActive('/offers') ? 'font-semibold underline' : ''
              }`}
            >
              Offers
            </Link>
            <Link
              href="/stories"
              className="text-sm font-medium text-black"
              onClick={() => setIsMenuOpen(false)}
            >
              Stories
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile menu - Hidden in Grand Opening mode */}
      {isMenuOpen && !isComingSoonMode && (
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
              href="/products"
              className="text-sm font-medium text-black"
              onClick={() => setIsMenuOpen(false)}
            >
              All Products
            </Link>
            <div className="pt-2">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'shop-by-mobile' ? null : 'shop-by-mobile')}
                className="text-sm font-medium text-black flex items-center gap-2 w-full"
              >
                Shop By
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openDropdown === 'shop-by-mobile' && (
                <div className="pl-4 pt-2 space-y-2">
                  {types.slice(0, 10).map((type) => (
                    <Link
                      key={type.id}
                      href={`/products?type=${type.slug}`}
                      className="block text-sm text-gray-600"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setOpenDropdown(null);
                      }}
                    >
                      {type.name}
                    </Link>
                  ))}
                  {types.length > 10 && (
                    <Link
                      href="/products"
                      className="block px-4 py-2 text-sm font-medium text-black hover:bg-gray-50 border-t border-gray-200"
                      onClick={() => setOpenDropdown(null)}
                    >
                      View All Types
                    </Link>
                  )}
                </div>
              )}
            </div>
            <div className="pt-2">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'collections-mobile' ? null : 'collections-mobile')}
                className="text-sm font-medium text-black flex items-center gap-2 w-full"
              >
                Collections
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openDropdown === 'collections-mobile' && (
                <div className="pl-4 pt-2 space-y-2">
                  {collections.slice(0, 10).map((collection) => (
                    <Link
                      key={collection.id}
                      href={`/collections/${collection.slug}`}
                      className="block text-sm text-gray-600"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setOpenDropdown(null);
                      }}
                    >
                      {collection.name}
                    </Link>
                  ))}
                  {collections.length > 10 && (
                    <Link
                      href="/collections"
                      className="block px-4 py-2 text-sm font-medium text-black hover:bg-gray-50 border-t border-gray-200"
                      onClick={() => setOpenDropdown(null)}
                    >
                      View All Collections
                    </Link>
                  )}
                </div>
              )}
            </div>
            <div className="pt-2">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'categories-mobile' ? null : 'categories-mobile')}
                className="text-sm font-medium text-black flex items-center gap-2 w-full"
              >
                Categories
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openDropdown === 'categories-mobile' && (
                <div className="pl-4 pt-2 space-y-2">
                  {categories.slice(0, 10).map((category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="block text-sm text-gray-600"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setOpenDropdown(null);
                      }}
                    >
                      {category.name}
                    </Link>
                  ))}
                  {categories.length > 10 && (
                    <Link
                      href="/categories"
                      className="block px-4 py-2 text-sm font-medium text-black hover:bg-gray-50 border-t border-gray-200"
                      onClick={() => setOpenDropdown(null)}
                    >
                      View All Categories
                    </Link>
                  )}
                </div>
              )}
            </div>
            <Link
              href="/offers"
              className="text-sm font-medium text-black"
              onClick={() => setIsMenuOpen(false)}
            >
              Offers
            </Link>
            <Link
              href="/stories"
              className="text-sm font-medium text-black"
              onClick={() => setIsMenuOpen(false)}
            >
              Stories
            </Link>
            <div className="pt-4 border-t border-gray-200">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(e as any);
                  }
                }}
                className="input-field w-full text-sm"
              />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
