'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface AnalyticsData {
  revenue: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    lastMonth: number;
  };
  orders: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  products: {
    total: number;
    active: number;
    lowStock: number;
  };
  customers: {
    total: number;
    newThisMonth: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
  }>;
  topCollections: Array<{
    id: string;
    name: string;
    revenue: number;
    products: number;
  }>;
  salesByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we have admin token, if not show helpful error
      if (!localStorage.getItem('token') && !localStorage.getItem('admin_token')) {
        if (localStorage.getItem('admin_auth') === 'true') {
          setError('Admin token not available. Please refresh the page or log out and log back in.');
        } else {
          setError('Admin authentication required.');
        }
        setLoading(false);
        return;
      }

      // Fetch orders to calculate analytics
      const ordersResponse: any = await api.orders.getAll();
      const orders = ordersResponse.orders || [];

      // Fetch products
      const productsResponse: any = await api.products.getAll();
      const products = productsResponse.products || productsResponse || [];

      // Fetch collections
      const collectionsResponse: any = await api.collections.getAll();
      const collections = (collectionsResponse as { collections?: any[] }).collections || (collectionsResponse as any[]) || [];

      // Calculate revenue metrics
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today);
      thisWeek.setDate(thisWeek.getDate() - 7);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const calculateRevenue = (startDate: Date, endDate?: Date) => {
        return orders
          .filter((order: any) => {
            const orderDate = new Date(order.created_at);
            if (endDate) {
              return orderDate >= startDate && orderDate <= endDate;
            }
            return orderDate >= startDate;
          })
          .reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);
      };

      const revenue = {
        total: orders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0),
        today: calculateRevenue(today),
        thisWeek: calculateRevenue(thisWeek),
        thisMonth: calculateRevenue(thisMonth),
        lastMonth: calculateRevenue(lastMonth, lastMonthEnd),
      };

      // Calculate order metrics
      const orderCounts = {
        total: orders.length,
        today: orders.filter((o: any) => new Date(o.created_at) >= today).length,
        thisWeek: orders.filter((o: any) => new Date(o.created_at) >= thisWeek).length,
        thisMonth: orders.filter((o: any) => new Date(o.created_at) >= thisMonth).length,
        pending: orders.filter((o: any) => o.status === 'pending' || o.status === 'confirmed').length,
        completed: orders.filter((o: any) => o.status === 'completed' || o.status === 'delivered').length,
        cancelled: orders.filter((o: any) => o.status === 'cancelled').length,
      };

      // Calculate product metrics
      const activeProducts = products.filter((p: any) => p.is_active !== false);
      const productMetrics = {
        total: products.length,
        active: activeProducts.length,
        lowStock: 0, // Would need inventory data
      };

      // Calculate customer metrics
      const uniqueCustomers = new Set(orders.map((o: any) => o.customer_email).filter(Boolean));
      const newCustomersThisMonth = new Set(
        orders
          .filter((o: any) => new Date(o.created_at) >= thisMonth)
          .map((o: any) => o.customer_email)
          .filter(Boolean)
      );
      const customerMetrics = {
        total: uniqueCustomers.size,
        newThisMonth: newCustomersThisMonth.size,
      };

      // Calculate top products
      const productRevenue: Record<string, { name: string; revenue: number; orders: number }> = {};
      orders.forEach((order: any) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const productId = item.product_id || item.product?.id;
            const productName = item.product_name || item.product?.name || 'Unknown';
            if (productId) {
              if (!productRevenue[productId]) {
                productRevenue[productId] = { name: productName, revenue: 0, orders: 0 };
              }
              productRevenue[productId].revenue += (item.price || 0) * (item.quantity || 0);
              productRevenue[productId].orders += 1;
            }
          });
        }
      });
      const topProducts = Object.entries(productRevenue)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Calculate top collections (simplified - would need proper collection mapping)
      const topCollections = collections.slice(0, 5).map((col: any) => ({
        id: col.id,
        name: col.name,
        revenue: 0, // Would need proper calculation
        products: 0, // Would need proper calculation
      }));

      // Calculate sales by day for the selected time range
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const salesByDay: Array<{ date: string; revenue: number; orders: number }> = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayOrders = orders.filter((o: any) => {
          const orderDate = new Date(o.created_at).toISOString().split('T')[0];
          return orderDate === dateStr;
        });
        salesByDay.push({
          date: dateStr,
          revenue: dayOrders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0),
          orders: dayOrders.length,
        });
      }

      setData({
        revenue,
        orders: orderCounts,
        products: productMetrics,
        customers: customerMetrics,
        topProducts,
        topCollections,
        salesByDay,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const getRevenueChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="heading-serif-md mb-2">Analytics</h1>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="heading-serif-md mb-2">Analytics</h1>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const maxRevenue = Math.max(...data.salesByDay.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-serif-md mb-2">Analytics</h1>
          <p className="text-gray-600">Track your store performance and sales metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border border-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-black p-6 bg-white">
          <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
          <div className="text-2xl font-bold mb-2">{formatCurrency(data.revenue.total)}</div>
          <div className="text-xs text-gray-500">All time</div>
        </div>
        <div className="border border-black p-6 bg-white">
          <div className="text-sm text-gray-600 mb-1">Today</div>
          <div className="text-2xl font-bold mb-2">{formatCurrency(data.revenue.today)}</div>
          <div className="text-xs text-gray-500">vs yesterday</div>
        </div>
        <div className="border border-black p-6 bg-white">
          <div className="text-sm text-gray-600 mb-1">This Month</div>
          <div className="text-2xl font-bold mb-2">{formatCurrency(data.revenue.thisMonth)}</div>
          <div className={`text-xs ${data.revenue.thisMonth >= data.revenue.lastMonth ? 'text-green-600' : 'text-red-600'}`}>
            {getRevenueChange(data.revenue.thisMonth, data.revenue.lastMonth)} vs last month
          </div>
        </div>
        <div className="border border-black p-6 bg-white">
          <div className="text-sm text-gray-600 mb-1">This Week</div>
          <div className="text-2xl font-bold mb-2">{formatCurrency(data.revenue.thisWeek)}</div>
          <div className="text-xs text-gray-500">Last 7 days</div>
        </div>
      </div>

      {/* Order Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-black p-6 bg-white">
          <div className="text-sm text-gray-600 mb-1">Total Orders</div>
          <div className="text-2xl font-bold mb-2">{data.orders.total}</div>
          <div className="text-xs text-gray-500">All time</div>
        </div>
        <div className="border border-black p-6 bg-white">
          <div className="text-sm text-gray-600 mb-1">Today</div>
          <div className="text-2xl font-bold mb-2">{data.orders.today}</div>
          <div className="text-xs text-gray-500">New orders</div>
        </div>
        <div className="border border-black p-6 bg-white">
          <div className="text-sm text-gray-600 mb-1">This Month</div>
          <div className="text-2xl font-bold mb-2">{data.orders.thisMonth}</div>
          <div className="text-xs text-gray-500">Orders placed</div>
        </div>
        <div className="border border-black p-6 bg-white">
          <div className="text-sm text-gray-600 mb-1">Completed</div>
          <div className="text-2xl font-bold mb-2">{data.orders.completed}</div>
          <div className="text-xs text-gray-500">{data.orders.pending} pending</div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="border border-black p-6 bg-white">
        <h2 className="font-semibold mb-4">Sales Trend</h2>
        <div className="h-64 flex items-end justify-between space-x-1">
          {data.salesByDay.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-black hover:bg-gray-800 transition-colors cursor-pointer"
                style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                title={`${formatDate(day.date)}: ${formatCurrency(day.revenue)}`}
              />
              <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left whitespace-nowrap">
                {formatDate(day.date)}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Total: {formatCurrency(data.salesByDay.reduce((sum, d) => sum + d.revenue, 0))}
          </div>
          <div className="text-gray-600">
            Avg: {formatCurrency(data.salesByDay.reduce((sum, d) => sum + d.revenue, 0) / data.salesByDay.length)}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products & Customers */}
        <div className="border border-black p-6 bg-white">
          <h2 className="font-semibold mb-4">Store Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Products</span>
              <span className="font-semibold">{data.products.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Products</span>
              <span className="font-semibold">{data.products.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Customers</span>
              <span className="font-semibold">{data.customers.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New This Month</span>
              <span className="font-semibold">{data.customers.newThisMonth}</span>
            </div>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="border border-black p-6 bg-white">
          <h2 className="font-semibold mb-4">Order Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="font-semibold">{data.orders.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="font-semibold text-green-600">{data.orders.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cancelled</span>
              <span className="font-semibold text-red-600">{data.orders.cancelled}</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completion Rate</span>
                <span className="font-semibold">
                  {data.orders.total > 0
                    ? ((data.orders.completed / data.orders.total) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      {data.topProducts.length > 0 && (
        <div className="border border-black p-6 bg-white">
          <h2 className="font-semibold mb-4">Top Products by Revenue</h2>
          <div className="space-y-3">
            {data.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.orders} orders</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(product.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-black p-6 bg-white">
          <div className="text-sm text-gray-600 mb-1">Average Order Value</div>
          <div className="text-2xl font-bold">
            {data.orders.total > 0
              ? formatCurrency(data.revenue.total / data.orders.total)
              : formatCurrency(0)}
          </div>
        </div>
        <div className="border border-black p-6 bg-white">
          <div className="text-sm text-gray-600 mb-1">Orders per Day (Avg)</div>
          <div className="text-2xl font-bold">
            {data.salesByDay.length > 0
              ? (data.salesByDay.reduce((sum, d) => sum + d.orders, 0) / data.salesByDay.length).toFixed(1)
              : '0'}
          </div>
        </div>
        <div className="border border-black p-6 bg-white">
          <div className="text-sm text-gray-600 mb-1">Revenue per Day (Avg)</div>
          <div className="text-2xl font-bold">
            {data.salesByDay.length > 0
              ? formatCurrency(data.salesByDay.reduce((sum, d) => sum + d.revenue, 0) / data.salesByDay.length)
              : formatCurrency(0)}
          </div>
        </div>
      </div>
    </div>
  );
}

