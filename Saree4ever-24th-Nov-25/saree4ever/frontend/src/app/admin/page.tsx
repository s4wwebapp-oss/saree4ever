'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface KPI {
  label: string;
  value: string | number;
  change?: string;
  icon: string;
}

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<KPI[]>([
    { label: 'Today Sales', value: '₹0', change: '+0%', icon: '💰' },
    { label: 'Orders (24h)', value: 0, change: '+0', icon: '🛒' },
    { label: 'Conversion %', value: '0%', change: '+0%', icon: '📊' },
    { label: 'Low Stock', value: 0, change: '', icon: '⚠️' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load KPIs
      // TODO: Replace with actual API calls
      // const stockLevels = await api.inventory.getStockLevels({ threshold: 10 });
      // const lowStockCount = stockLevels.stock_levels?.filter(s => s.is_low_stock).length || 0;
      
      setKpis([
        { label: 'Today Sales', value: '₹12,450', change: '+15%', icon: '💰' },
        { label: 'Orders (24h)', value: 8, change: '+2', icon: '🛒' },
        { label: 'Conversion %', value: '3.2%', change: '+0.5%', icon: '📊' },
        { label: 'Low Stock', value: 5, change: '', icon: '⚠️' },
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="heading-serif-md mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your store performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <div key={index} className="border border-black p-6 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{kpi.icon}</span>
              {kpi.change && (
                <span className={`text-sm ${kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.change}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold mb-1">{kpi.value}</div>
            <div className="text-sm text-gray-600">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="border border-black p-6">
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/products?action=create"
            className="border border-black p-4 hover:bg-gray-50 transition-colors text-center"
          >
            <div className="text-2xl mb-2">➕</div>
            <div className="text-sm font-medium">Add Product</div>
          </Link>
          <Link
            href="/admin/import"
            className="border border-black p-4 hover:bg-gray-50 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📥</div>
            <div className="text-sm font-medium">Import CSV</div>
          </Link>
          <Link
            href="/admin/offers?action=create"
            className="border border-black p-4 hover:bg-gray-50 transition-colors text-center"
          >
            <div className="text-2xl mb-2">🎁</div>
            <div className="text-sm font-medium">Create Offer</div>
          </Link>
          <Link
            href="/admin/inventory"
            className="border border-black p-4 hover:bg-gray-50 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📦</div>
            <div className="text-sm font-medium">Manage Stock</div>
          </Link>
        </div>
      </div>

      {/* Alerts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="border border-black p-6">
          <h2 className="font-semibold mb-4">Alerts</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200">
              <span className="text-xl">⚠️</span>
              <div className="flex-1">
                <div className="font-medium text-sm">5 products low on stock</div>
                <div className="text-xs text-gray-600 mt-1">Review inventory levels</div>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200">
              <span className="text-xl">📦</span>
              <div className="flex-1">
                <div className="font-medium text-sm">3 orders pending shipment</div>
                <div className="text-xs text-gray-600 mt-1">Create shipping labels</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="border border-black p-6">
          <h2 className="font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <span className="text-gray-400">2h ago</span>
              <span className="flex-1">Product "Kanjivaram Silk Saree" was updated</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <span className="text-gray-400">4h ago</span>
              <span className="flex-1">New order #ORD-1234 received</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <span className="text-gray-400">6h ago</span>
              <span className="flex-1">CSV import completed: 15 products imported</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <span className="text-gray-400">1d ago</span>
              <span className="flex-1">Stock adjusted for variant V-001</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing */}
      <div className="border border-black p-6">
        <h2 className="font-semibold mb-4">Top Performing Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200">
            <div className="font-medium mb-1">Kanjivaram</div>
            <div className="text-sm text-gray-600">45 products • ₹2.5L revenue</div>
          </div>
          <div className="p-4 border border-gray-200">
            <div className="font-medium mb-1">Bridal</div>
            <div className="text-sm text-gray-600">32 products • ₹1.8L revenue</div>
          </div>
          <div className="p-4 border border-gray-200">
            <div className="font-medium mb-1">New Arrivals</div>
            <div className="text-sm text-gray-600">28 products • ₹1.2L revenue</div>
          </div>
        </div>
      </div>
    </div>
  );
}


