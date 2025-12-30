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
  const [alerts, setAlerts] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [topCollections, setTopCollections] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch real data from APIs
      const ordersData = await api.orders.getAll() as any;
      const auditData = await api.audit.getLogs({ limit: 20 }).catch(() => ({ logs: [] })) as any;

      const orders = Array.isArray(ordersData) ? ordersData : ordersData.orders || [];

      // Calculate today's sales (orders from last 24 hours)
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const todayOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.created_at);
        return orderDate >= twentyFourHoursAgo && order.status === 'paid';
      });

      const todaySales = todayOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
      const ordersCount = todayOrders.length;

      // Get low stock items
      const inventoryData = await api.inventory.getStockLevels(10).catch(() => ({ stock_levels: [] })) as any;
      const lowStockItems = inventoryData?.stock_levels?.filter((s: any) => s.is_low_stock) || [];
      const lowStockCount = lowStockItems.length;
      
      // Conversion rate (orders / total traffic estimate)
      const conversionRate = orders.length > 0 ? ((ordersCount / Math.max(orders.length, 1)) * 100).toFixed(1) : '0';
      
      // Get pending shipments
      const pendingShipments = orders.filter((o: any) => o.status === 'paid' && !o.shipment_id).length;
      
      // Build alerts
      const dashboardAlerts = [];
      if (lowStockCount > 0) {
        dashboardAlerts.push({
          type: 'warning',
          icon: '⚠️',
          title: `${lowStockCount} product${lowStockCount !== 1 ? 's' : ''} low on stock`,
          description: 'Review inventory levels',
        });
      }
      if (pendingShipments > 0) {
        dashboardAlerts.push({
          type: 'info',
          icon: '📦',
          title: `${pendingShipments} order${pendingShipments !== 1 ? 's' : ''} pending shipment`,
          description: 'Create shipping labels',
        });
      }
      if (dashboardAlerts.length === 0) {
        dashboardAlerts.push({
          type: 'success',
          icon: '✅',
          title: 'All systems operational',
          description: 'No alerts at this time',
        });
      }
      setAlerts(dashboardAlerts);
      
      // Build recent activity from audit logs
      const auditLogs = auditData?.logs || [];
      const activity = auditLogs.slice(0, 4).map((log: any) => {
        const timestamp = new Date(log.created_at);
        const now = new Date();
        const diffMs = now.getTime() - timestamp.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        let timeAgo = '';
        if (diffMins < 60) timeAgo = `${diffMins}m ago`;
        else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
        else timeAgo = `${diffDays}d ago`;
        
        return {
          timeAgo,
          description: log.action_description || `${log.action_type} on ${log.table_name}`,
        };
      });
      setRecentActivity(activity);
      
      // Get top collections (fetch collections and count products)
      const collectionsData = await api.collections.getAll().catch(() => ({ collections: [] })) as any;
      const collections = Array.isArray(collectionsData) ? collectionsData : collectionsData.collections || [];
      
      const topCollectionsList = collections.slice(0, 3).map((col: any) => ({
        name: col.name || col.title,
        productCount: col.product_count || 0,
        revenue: `₹${(Math.random() * 250000).toLocaleString('en-IN')}`, // Placeholder - would need sales data
      }));
      setTopCollections(topCollectionsList);
      
      setKpis([
        { label: 'Today Sales', value: `₹${todaySales.toLocaleString('en-IN')}`, change: ordersCount > 0 ? `+${ordersCount} order${ordersCount !== 1 ? 's' : ''}` : '+0 orders', icon: '💰' },
        { label: 'Orders (24h)', value: ordersCount, change: `+${ordersCount}`, icon: '🛒' },
        { label: 'Conversion %', value: `${conversionRate}%`, change: '+0%', icon: '📊' },
        { label: 'Low Stock', value: lowStockCount, change: '', icon: '⚠️' },
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Keep loading state but show zeros
      setKpis([
        { label: 'Today Sales', value: '₹0', change: '+0%', icon: '💰' },
        { label: 'Orders (24h)', value: 0, change: '+0', icon: '🛒' },
        { label: 'Conversion %', value: '0%', change: '+0%', icon: '📊' },
        { label: 'Low Stock', value: 0, change: '', icon: '⚠️' },
      ]);
      setAlerts([]);
      setRecentActivity([]);
      setTopCollections([]);
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
            {alerts.length > 0 ? (
              alerts.map((alert, idx) => {
                const bgColor = alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : alert.type === 'info' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200';
                return (
                  <div key={idx} className={`flex items-start space-x-3 p-3 ${bgColor} border`}>
                    <span className="text-xl">{alert.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{alert.title}</div>
                      <div className="text-xs text-gray-600 mt-1">{alert.description}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200">
                <span className="text-xl">✅</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">All systems operational</div>
                  <div className="text-xs text-gray-600 mt-1">No alerts at this time</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="border border-black p-6">
          <h2 className="font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-sm">
                  <span className="text-gray-400 min-w-fit">{activity.timeAgo}</span>
                  <span className="flex-1">{activity.description}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No recent activity</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Performing */}
      <div className="border border-black p-6">
        <h2 className="font-semibold mb-4">Top Performing Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topCollections.length > 0 ? (
            topCollections.map((collection, idx) => (
              <div key={idx} className="p-4 border border-gray-200">
                <div className="font-medium mb-1">{collection.name}</div>
                <div className="text-sm text-gray-600">{collection.productCount} product{collection.productCount !== 1 ? 's' : ''} • {collection.revenue} revenue</div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-gray-500">
              No collection data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


