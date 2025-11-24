'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Shipment {
  id: string;
  order_id: string;
  order_number?: string;
  tracking_number: string | null;
  courier_name: string | null;
  tracking_url: string | null;
  status: string;
  shipped_at: string | null;
  delivered_at: string | null;
  estimated_delivery_date: string | null;
  order?: {
    id: string;
    order_number: string;
    customer?: {
      name: string;
      email: string;
    };
  };
}

interface Order {
  id: string;
  order_number: string;
  tracking_number: string | null;
  status: string;
  shipped_at: string | null;
  delivered_at: string | null;
  customer?: {
    name: string;
    email: string;
  };
}

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    setLoading(true);
    try {
      // Since shipments are currently stored in orders table, we'll fetch orders with tracking
      const response: any = await api.orders.getAll();
      const ordersList = response.orders || response || [];
      
      // Filter orders that have tracking info (these are shipments)
      const shipmentsList = ordersList
        .filter((order: Order) => order.tracking_number)
        .map((order: Order) => ({
          id: order.id,
          order_id: order.id,
          order_number: order.order_number,
          tracking_number: order.tracking_number,
          courier_name: null,
          tracking_url: null,
          status: order.status,
          shipped_at: order.shipped_at,
          delivered_at: order.delivered_at,
          estimated_delivery_date: null,
          order: {
            id: order.id,
            order_number: order.order_number,
            customer: order.customer,
          },
        }));
      
      setShipments(shipmentsList);
      setOrders(ordersList);
    } catch (error) {
      console.error('Failed to load shipments:', error);
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.shipments.updateStatus(id, { status });
      loadShipments();
    } catch (error: any) {
      alert(error.message || 'Failed to update shipment status');
    }
  };

  const handleTrackingUpdate = async (id: string, trackingData: {
    tracking_number: string;
    courier_name: string;
    tracking_url?: string;
  }) => {
    try {
      await api.shipments.updateTracking(id, trackingData);
      loadShipments();
    } catch (error: any) {
      alert(error.message || 'Failed to update tracking');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'shipped': 'bg-blue-100 text-blue-800',
      'in_transit': 'bg-indigo-100 text-indigo-800',
      'out_for_delivery': 'bg-orange-100 text-orange-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredShipments = shipments.filter((shipment) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        shipment.order_number?.toLowerCase().includes(searchLower) ||
        shipment.tracking_number?.toLowerCase().includes(searchLower) ||
        shipment.order?.customer?.email?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    if (filters.status) {
      if (shipment.status !== filters.status) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="heading-serif-md mb-2">Shipments</h1>
          <p className="text-gray-600">Manage order shipments and tracking</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Order #, Tracking #, Email"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input-field text-sm"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ search: '', status: '' })}
              className="btn-outline w-full text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr>
                <th className="px-6 py-3">Order #</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Tracking #</th>
                <th className="px-6 py-3">Courier</th>
                <th className="px-6 py-3">Shipped Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading shipments...
                  </td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No shipments found.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs font-medium">
                      {shipment.order_number || shipment.order?.order_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {shipment.order?.customer?.name || 'Guest'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {shipment.order?.customer?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {shipment.tracking_number || '—'}
                    </td>
                    <td className="px-6 py-4">
                      {shipment.courier_name || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {shipment.shipped_at
                        ? new Date(shipment.shipped_at).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                        {shipment.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/orders/${shipment.order_id}`}
                        className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                      >
                        View Order
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


