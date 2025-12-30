'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: '📊', description: 'Snapshot of sales, orders, and quick links.' },
  { name: 'Products', href: '/admin/products', icon: '👕', description: 'Create or update core product details and pricing.' },
  { name: 'Variants', href: '/admin/variants', icon: '🎨', description: 'Manage size / color variations and inventory.' },
  { name: 'Types', href: '/admin/types', icon: '🧵', description: 'Define fabric or style types used for filters.' },
  { name: 'Categories', href: '/admin/categories', icon: '🏷️', description: 'Organize products into menu driven buckets.' },
  { name: 'Collections', href: '/admin/collections', icon: '📁', description: 'Curated groupings such as Festive or Bridal.' },
  { name: 'Filter Options', href: '/admin/filter-options', icon: '🔍', description: 'Manage colors, sizes, and sort options for storefront filters.' },
  { name: 'Menu Config', href: '/admin/menu-config', icon: '📋', description: 'Control mega menu column titles and links.' },
  { name: 'Hero Slides', href: '/admin/hero-slides', icon: '🖼️', description: 'Homepage carousel slides and links.' },
  { name: 'Landing Videos', href: '/admin/landing-page-video', icon: '🎥', description: 'Hero background loop and CTA for landing page.' },
  { name: 'Reviews', href: '/admin/reviews', icon: '⭐', description: 'Customer testimonials and reviews shown on homepage.' },
  { name: 'Page Sections', href: '/admin/landing-page-sections', icon: '👁️', description: 'Toggle featured rows like Trending or Testimonials.' },
  { name: 'Announcement', href: '/admin/announcement', icon: '📢', description: 'Banner text for offers, shipping, or alerts.' },
  { name: 'Blog/Stories', href: '/admin/blog', icon: '📝', description: 'Publish long-form articles and brand stories.' },
  { name: 'Reels/Videos', href: '/admin/reels', icon: '🎬', description: 'Short form videos used on Stories page.' },
  { name: 'Inventory', href: '/admin/inventory', icon: '📦', description: 'Stock levels per SKU with adjustment log.' },
  { name: 'Orders', href: '/admin/orders', icon: '🛒', description: 'Search and manage placed customer orders.' },
  { name: 'Shipments', href: '/admin/shipments', icon: '🚚', description: 'Mark orders shipped and add tracking links.' },
  { name: 'Offers', href: '/admin/offers', icon: '🎁', description: 'Set coupon style promotions and expiries.' },
  { name: 'CSV Import', href: '/admin/import', icon: '📥', description: 'Bulk upload products or inventory via CSV.' },
  { name: 'Customers', href: '/admin/customers', icon: '👥', description: 'View high value shoppers and order history.' },
  { name: 'Analytics', href: '/admin/analytics', icon: '📈', description: 'Traffic, revenue, retention trends.' },
  { name: 'Audit Logs', href: '/admin/audit', icon: '📋', description: 'Track admin changes for compliance.' },
  { name: 'Settings', href: '/admin/settings', icon: '⚙️', description: 'Store profile, email, and payment preferences.' },
  { name: 'Help & Guides', href: '/admin/help', icon: '💡', description: 'How-to articles, media specs, and workflows.' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    window.location.href = '/admin';
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-white border-r border-black transition-all duration-300 flex flex-col fixed h-screen z-40`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-black flex items-center justify-between">
          {sidebarOpen && (
            <Link href="/admin" className="heading-serif-sm">
              saree4ever
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
              return (
                <li key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-2 rounded transition-colors ${
                      isActive
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-100 text-black'
                    }`}
                    title={!sidebarOpen ? item.description || item.name : undefined}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {sidebarOpen && (
                      <>
                        <span className="text-sm font-medium flex-1">{item.name}</span>
                        {item.description && (
                          <span className="text-xs text-gray-300 group-hover:text-white" aria-label={`About ${item.name}`}>
                            ⓘ
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                  {item.description && (
                    <div
                      className={`pointer-events-none absolute ${sidebarOpen ? 'left-full ml-3' : 'left-16 ml-2'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150`}
                    >
                      <div className="bg-black text-white text-xs rounded px-3 py-2 shadow-lg w-56">
                        {item.description}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-black">
            <div className="text-xs text-gray-600 mb-2">
              <div className="font-semibold">Admin Panel</div>
              <div className="text-gray-500">Development</div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-black">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              {/* Global Search */}
              <div className="hidden md:flex items-center space-x-2 flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search products, orders, customers..."
                  className="input-field flex-1 text-sm"
                />
                <button className="p-2 hover:bg-gray-100 rounded">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <Link
                href="/admin/products?action=create"
                className="hidden md:flex items-center space-x-2 px-4 py-2 bg-black text-white text-sm hover:bg-gray-800 transition-colors"
              >
                <span>+</span>
                <span>New Product</span>
              </Link>

              {/* Notifications */}
              <button className="p-2 hover:bg-gray-100 rounded relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm font-medium">
                  A
                </div>
                {sidebarOpen && (
                  <div className="hidden md:block">
                    <div className="text-sm font-medium">Admin</div>
                    <div className="text-xs text-gray-600">admin@saree4ever.com</div>
                  </div>
                )}
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}


