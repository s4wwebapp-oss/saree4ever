'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import Logo from './Logo';

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

interface SocialMediaLink {
  platform: string;
  url: string;
}

export default function Header() {
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>([]);
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const pathname = usePathname();
  const shopDropdownRef = useRef<HTMLDivElement>(null);
  const collectionsDropdownRef = useRef<HTMLDivElement>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch collections, categories, types, announcement, and menu configs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collectionsRes, categoriesRes, typesRes, announcementRes, menuConfigRes, socialMediaRes] = await Promise.all([
          api.collections.getAll(),
          api.categories.getAll(),
          api.types.getAll(),
          api.announcement.getActive().catch(() => ({ announcement: null })), // Gracefully handle if no announcement
          api.menuConfig.getAll().catch(() => ({ configs: {} })), // Gracefully handle if no menu config
          api.socialMediaSettings.getVisibleLinks().catch(() => ({ links: [] })), // Gracefully handle if no social media settings
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

        // Set social media links
        const socialMediaData = (socialMediaRes as { links?: SocialMediaLink[] }).links || [];
        setSocialMediaLinks(socialMediaData);

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
    if (!openDropdown && !categoryDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if click is inside any dropdown container
      const isInsideShop = shopDropdownRef.current?.contains(target);
      const isInsideCollections = collectionsDropdownRef.current?.contains(target);
      const isInsideCategories = categoriesDropdownRef.current?.contains(target);
      
      // Also check for the category dropdown in search bar
      const categoryButton = target.closest('[data-category-dropdown]');
      
      if (!isInsideShop && !isInsideCollections && !isInsideCategories && !categoryButton) {
        setOpenDropdown(null);
        setCategoryDropdownOpen(false);
      }
    };
    
    // Use capture phase and add slight delay to avoid immediate closure
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
    }, 100);
    
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
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

  // Get icon SVG for each platform
  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, React.ReactElement> = {
      instagram: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      facebook: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      twitter: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      youtube: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      pinterest: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.023 0 1.518.769 1.518 1.69 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.001 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
        </svg>
      ),
    };
    return icons[platform] || null;
  };

  // Get hover color for each platform
  const getPlatformHoverColor = (platform: string) => {
    const colors: Record<string, string> = {
      instagram: 'hover:text-pink-600',
      facebook: 'hover:text-blue-600',
      twitter: 'hover:text-black',
      youtube: 'hover:text-red-600',
      pinterest: 'hover:text-red-700',
    };
    return colors[platform] || 'hover:text-gray-800';
  };

  return (
    <header className="bg-white sticky top-0 z-50">
      {/* Social Media Bar - Fixed at top - Only show if there are visible links */}
      {socialMediaLinks.length > 0 && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center md:justify-end py-2">
              <div className="flex items-center gap-4">
                {socialMediaLinks.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-600 transition-colors ${getPlatformHoverColor(link.platform)}`}
                    aria-label={`Follow us on ${link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}`}
                  >
                    {getPlatformIcon(link.platform)}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Announcement Bar - Black (Collapses on scroll) */}
      {announcement && announcement.is_active && (
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Brand Logo - Centered Below Announcement (Collapses on scroll) - Desktop only */}
          <div className={`text-center py-4 border-b border-gray-200 transition-all duration-300 hidden md:block ${
            isScrolled ? 'hidden' : ''
          }`}>
            <Logo 
              size={{ width: 280, height: 157 }}
              backgroundColor="transparent"
              className="mx-auto"
            />
          </div>

          {/* Mobile Top Row: Hamburger | Home Icon | Logo | Favorites + Profile */}
          <div className="md:hidden flex items-center justify-between py-3">
            {/* Left side: Hamburger menu and Home icon */}
            <div className="flex items-center gap-2">
              {/* Mobile menu button */}
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

              {/* Home Icon - Mobile only */}
              <Link 
                href="/" 
                className="p-2 flex-shrink-0 hover:opacity-70 transition-opacity"
                aria-label="Home"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>
            </div>

            {/* Brand Logo - Center */}
            <div className="flex-1 text-center flex items-center justify-center">
              <Logo 
                size={{ width: 200, height: 112 }}
                backgroundColor="transparent"
              />
            </div>

            {/* Favorites, Profile, and Cart Icons - Right side */}
            <div className="flex items-center gap-3">
              {/* Favourites/Wishlist Icon */}
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

              {/* Sign in/Register Icon */}
              <Link href="/account" className="flex items-center hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>

              {/* Shopping Bag/Cart Icon - Mobile */}
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
          </div>

          {/* Search Bar Row - Mobile and Desktop */}
          <div className="flex items-center gap-2 md:gap-4 py-2 md:py-4">
            {/* Search Bar with Category Dropdown */}
            <div className="flex-1 flex items-center">
              <form onSubmit={handleSearch} className="flex-1 flex items-center border border-gray-300 rounded-sm">
                {/* All Categories Dropdown - Smaller on mobile */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCategoryDropdownOpen(!categoryDropdownOpen);
                    }}
                    className="px-2 md:px-4 py-1.5 md:py-2.5 border-r border-gray-300 flex items-center gap-1 text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <span className="hidden sm:inline">All Categories</span>
                    <span className="sm:hidden">All</span>
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Category Dropdown Menu */}
                  {categoryDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg z-[100] min-w-[200px] max-h-96 overflow-y-auto">
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

                {/* Search Input - Smaller on mobile */}
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-2 md:px-4 py-1.5 md:py-2.5 text-xs md:text-sm focus:outline-none bg-gray-100"
                />

                {/* Search Button - Smaller on mobile */}
                <button
                  type="submit"
                  className="px-2 md:px-4 py-1.5 md:py-2.5 bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Search"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>

            {/* Shopping Bag/Cart - Desktop only in this row, mobile shows in top row if needed */}
            <div className="hidden md:flex items-center gap-4 md:gap-6">
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
                <span className="hidden md:inline text-sm font-medium text-gray-700">Sign in/ Register</span>
              </Link>

              <Link href="/cart" className="relative flex items-center hover:opacity-70 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Menu Bar - Navigation Links (Fixed on scroll) - Hidden on mobile */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center gap-4 md:gap-6 lg:gap-8 py-3 overflow-x-auto relative" style={{ overflow: 'visible' }}>
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
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const newState = openDropdown === 'shop-by' ? null : 'shop-by';
                  setOpenDropdown(newState);
                }}
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
                <div 
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-200 shadow-lg z-[100] min-w-[600px] py-4 rounded-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  {types.length > 0 ? (
                    <>
                      {(() => {
                        const shopByConfig = menuConfigs.shop_by;
                        const itemsPerColumn = Math.ceil(types.length / 3);
                        const column1 = types.slice(0, itemsPerColumn);
                        const column2 = types.slice(itemsPerColumn, itemsPerColumn * 2);
                        const column3 = types.slice(itemsPerColumn * 2);
                        
                        return (
                          <div className="grid grid-cols-3 gap-6 px-6">
                            {/* Column 1 */}
                            <div>
                              {shopByConfig?.column_1_title && (
                                <div className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-3 pb-2 border-b border-gray-200">
                                  {shopByConfig.column_1_title}
                                </div>
                              )}
                              <div className="space-y-1">
                                {column1.map((type) => (
                                  <Link
                                    key={type.id}
                                    href={`/products?type=${type.slug}`}
                                    className="block py-1.5 text-sm text-gray-700 hover:text-black transition-colors"
                                    onClick={() => setOpenDropdown(null)}
                                  >
                                    {type.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                            
                            {/* Column 2 */}
                            <div>
                              {shopByConfig?.column_2_title && (
                                <div className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-3 pb-2 border-b border-gray-200">
                                  {shopByConfig.column_2_title}
                                </div>
                              )}
                              <div className="space-y-1">
                                {column2.map((type) => (
                                  <Link
                                    key={type.id}
                                    href={`/products?type=${type.slug}`}
                                    className="block py-1.5 text-sm text-gray-700 hover:text-black transition-colors"
                                    onClick={() => setOpenDropdown(null)}
                                  >
                                    {type.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                            
                            {/* Column 3 */}
                            <div>
                              {shopByConfig?.column_3_title && (
                                <div className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-3 pb-2 border-b border-gray-200">
                                  {shopByConfig.column_3_title}
                                </div>
                              )}
                              <div className="space-y-1">
                                {column3.map((type) => (
                                  <Link
                                    key={type.id}
                                    href={`/products?type=${type.slug}`}
                                    className="block py-1.5 text-sm text-gray-700 hover:text-black transition-colors"
                                    onClick={() => setOpenDropdown(null)}
                                  >
                                    {type.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      {types.length > 15 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 px-6">
                          <Link
                            href="/products"
                            className="block text-center text-sm font-medium text-black hover:underline"
                            onClick={() => setOpenDropdown(null)}
                          >
                            View All Types
                          </Link>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="px-6 py-4 text-sm text-gray-500">No types available</div>
                  )}
                </div>
              )}
            </div>

            {/* Collections Dropdown */}
            <div className="relative" ref={collectionsDropdownRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const newState = openDropdown === 'collections' ? null : 'collections';
                  setOpenDropdown(newState);
                }}
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
                <div 
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-200 shadow-lg z-[100] min-w-[600px] max-h-96 overflow-y-auto py-4 rounded-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  {collections.length > 0 ? (
                    <>
                      {(() => {
                        const collectionsConfig = menuConfigs.collections;
                        const itemsPerColumn = Math.ceil(collections.length / 3);
                        const column1 = collections.slice(0, itemsPerColumn);
                        const column2 = collections.slice(itemsPerColumn, itemsPerColumn * 2);
                        const column3 = collections.slice(itemsPerColumn * 2);
                        
                        return (
                          <div className="grid grid-cols-3 gap-6 px-6">
                            {/* Column 1 */}
                            <div>
                              {collectionsConfig?.column_1_title && (
                                <div className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-3 pb-2 border-b border-gray-200">
                                  {collectionsConfig.column_1_title}
                                </div>
                              )}
                              <div className="space-y-1">
                                {column1.map((collection) => (
                                  <Link
                                    key={collection.id}
                                    href={`/collections/${collection.slug}`}
                                    className="block py-1.5 text-sm text-gray-700 hover:text-black transition-colors"
                                    onClick={() => setOpenDropdown(null)}
                                  >
                                    {collection.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                            
                            {/* Column 2 */}
                            <div>
                              {collectionsConfig?.column_2_title && (
                                <div className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-3 pb-2 border-b border-gray-200">
                                  {collectionsConfig.column_2_title}
                                </div>
                              )}
                              <div className="space-y-1">
                                {column2.map((collection) => (
                                  <Link
                                    key={collection.id}
                                    href={`/collections/${collection.slug}`}
                                    className="block py-1.5 text-sm text-gray-700 hover:text-black transition-colors"
                                    onClick={() => setOpenDropdown(null)}
                                  >
                                    {collection.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                            
                            {/* Column 3 */}
                            <div>
                              {collectionsConfig?.column_3_title && (
                                <div className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-3 pb-2 border-b border-gray-200">
                                  {collectionsConfig.column_3_title}
                                </div>
                              )}
                              <div className="space-y-1">
                                {column3.map((collection) => (
                                  <Link
                                    key={collection.id}
                                    href={`/collections/${collection.slug}`}
                                    className="block py-1.5 text-sm text-gray-700 hover:text-black transition-colors"
                                    onClick={() => setOpenDropdown(null)}
                                  >
                                    {collection.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      {collections.length > 20 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 px-6">
                          <Link
                            href="/collections"
                            className="block text-center text-sm font-medium text-black hover:underline"
                            onClick={() => setOpenDropdown(null)}
                          >
                            View All Collections
                          </Link>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="px-6 py-4 text-sm text-gray-500">No collections available</div>
                  )}
                </div>
              )}
            </div>

            {/* Categories Dropdown */}
            <div className="relative" ref={categoriesDropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'categories' ? null : 'categories');
                }}
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
                <div 
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-200 shadow-lg z-[100] min-w-[600px] max-h-96 overflow-y-auto py-4 rounded-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  {categories.length > 0 ? (
                    <>
                      {(() => {
                        const categoriesConfig = menuConfigs.categories;
                        const itemsPerColumn = Math.ceil(categories.length / 3);
                        const column1 = categories.slice(0, itemsPerColumn);
                        const column2 = categories.slice(itemsPerColumn, itemsPerColumn * 2);
                        const column3 = categories.slice(itemsPerColumn * 2);
                        
                        return (
                          <div className="grid grid-cols-3 gap-6 px-6">
                            {/* Column 1 */}
                            <div>
                              {categoriesConfig?.column_1_title && (
                                <div className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-3 pb-2 border-b border-gray-200">
                                  {categoriesConfig.column_1_title}
                                </div>
                              )}
                              <div className="space-y-1">
                                {column1.map((category) => (
                                  <Link
                                    key={category.id}
                                    href={`/categories/${category.slug}`}
                                    className="block py-1.5 text-sm text-gray-700 hover:text-black transition-colors"
                                    onClick={() => setOpenDropdown(null)}
                                  >
                                    {category.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                            
                            {/* Column 2 */}
                            <div>
                              {categoriesConfig?.column_2_title && (
                                <div className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-3 pb-2 border-b border-gray-200">
                                  {categoriesConfig.column_2_title}
                                </div>
                              )}
                              <div className="space-y-1">
                                {column2.map((category) => (
                                  <Link
                                    key={category.id}
                                    href={`/categories/${category.slug}`}
                                    className="block py-1.5 text-sm text-gray-700 hover:text-black transition-colors"
                                    onClick={() => setOpenDropdown(null)}
                                  >
                                    {category.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                            
                            {/* Column 3 */}
                            <div>
                              {categoriesConfig?.column_3_title && (
                                <div className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-3 pb-2 border-b border-gray-200">
                                  {categoriesConfig.column_3_title}
                                </div>
                              )}
                              <div className="space-y-1">
                                {column3.map((category) => (
                                  <Link
                                    key={category.id}
                                    href={`/categories/${category.slug}`}
                                    className="block py-1.5 text-sm text-gray-700 hover:text-black transition-colors"
                                    onClick={() => setOpenDropdown(null)}
                                  >
                                    {category.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      {categories.length > 20 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 px-6">
                          <Link
                            href="/categories"
                            className="block text-center text-sm font-medium text-black hover:underline"
                            onClick={() => setOpenDropdown(null)}
                          >
                            View All Categories
                          </Link>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="px-6 py-4 text-sm text-gray-500">No categories available</div>
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
              className={`text-sm font-medium whitespace-nowrap hover:underline text-black ${
                isActive('/stories') ? 'font-semibold underline' : ''
              }`}
            >
              Stories
            </Link>
          </nav>
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
