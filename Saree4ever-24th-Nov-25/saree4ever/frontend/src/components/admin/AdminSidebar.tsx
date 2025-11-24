import { useState } from 'react';
import Link from 'next/link';

export default function AdminSidebar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
    { label: 'Products', href: '/admin/products', icon: 'box' },
    { label: 'Inventory', href: '/admin/inventory', icon: 'clipboard' },
    { label: 'Orders', href: '/admin/orders', icon: 'shopping-bag' },
    { label: 'Customers', href: '/admin/customers', icon: 'users' },
    { label: 'Blog', href: '/admin/blog', icon: 'file-text' },
    { label: 'Hero Slides', href: '/admin/hero-slides', icon: 'image' },
    { label: 'Announcement', href: '/admin/announcement', icon: 'megaphone' },
    { label: 'CSV Import', href: '/admin/import', icon: 'upload' },
    { label: 'Audit Logs', href: '/admin/audit', icon: 'file-check' },
    { label: 'Settings', href: '/admin/settings', icon: 'settings' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-serif font-bold">Admin</h2>
      </div>
      <nav className="px-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
          >
            {/* Simple Icons */}
            <span className="mr-3 text-gray-500">
              {/* You can replace these with actual SVG icons */}
              <div className="w-5 h-5 bg-gray-200 rounded-sm" />
            </span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

