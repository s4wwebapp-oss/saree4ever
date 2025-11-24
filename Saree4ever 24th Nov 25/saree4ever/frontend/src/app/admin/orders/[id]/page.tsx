'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface OrderItem {
  id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  shipping_address: any;
  billing_address: any;
  created_at: string;
  updated_at: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  shipments?: Array<{
    id: string;
    tracking_number: string;
    carrier: string;
    status: string;
  }>;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const res: any = await api.orders.getById(orderId);
      const orderData = res.order || res;
      setOrder(orderData);
      setNewStatus(orderData.status);
      setNewPaymentStatus(orderData.payment_status);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async () => {
    if (!order || !newStatus) return;
    
    setUpdating(true);
    try {
      await api.orders.updateStatus(orderId, newStatus);
      loadOrder(); // Reload order
      alert('Order status updated');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const updatePaymentStatus = async () => {
    if (!order || !newPaymentStatus) return;
    
    setUpdating(true);
    try {
      await api.orders.updatePaymentStatus(orderId, newPaymentStatus);
      loadOrder();
      alert('Payment status updated');
    } catch (error) {
      console.error('Failed to update payment status:', error);
      alert('Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  const shipOrder = async () => {
    if (!order || !trackingNumber || !carrier) {
      alert('Please enter tracking number and carrier');
      return;
    }
    
    setUpdating(true);
    try {
      await api.orders.ship(orderId, {
        tracking_number: trackingNumber,
        carrier,
      });
      loadOrder();
      setTrackingNumber('');
      setCarrier('');
      alert('Order shipped successfully');
    } catch (error) {
      console.error('Failed to ship order:', error);
      alert('Failed to ship order');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Order not found</p>
        <Link href="/admin/orders" className="btn-outline mt-4 inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/orders" className="text-sm text-gray-600 hover:underline mb-4 inline-block">
          ← Back to Orders
        </Link>
        <h1 className="heading-serif-md">Order {order.order_number}</h1>
        <p className="text-sm text-gray-600 mt-1">
          Placed on {new Date(order.created_at).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-start border-b border-gray-100 pb-4 last:border-0">
                  <div>
                    <div className="font-medium">{item.product_name}</div>
                    {item.variant_name && (
                      <div className="text-sm text-gray-500">{item.variant_name}</div>
                    )}
                    <div className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₹{item.total.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">₹{item.price.toLocaleString()} each</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-xl font-bold">₹{order.total_amount.toLocaleString()}</span>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="font-semibold mb-4">Shipping Address</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <div>{order.shipping_address.name}</div>
                <div>{order.shipping_address.address_line1}</div>
                {order.shipping_address.address_line2 && (
                  <div>{order.shipping_address.address_line2}</div>
                )}
                <div>
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                </div>
                <div>{order.shipping_address.country}</div>
                {order.shipping_address.phone && (
                  <div className="mt-2">Phone: {order.shipping_address.phone}</div>
                )}
              </div>
            </div>
          )}

          {/* Shipments */}
          {order.shipments && order.shipments.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="font-semibold mb-4">Shipments</h2>
              <div className="space-y-3">
                {order.shipments.map((shipment) => (
                  <div key={shipment.id} className="border border-gray-200 rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{shipment.carrier}</div>
                        <div className="text-sm text-gray-600">Tracking: {shipment.tracking_number}</div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                        {shipment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Order Status */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="font-semibold mb-4">Order Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="in_transit">In Transit</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={updateOrderStatus}
                  disabled={updating || newStatus === order.status}
                  className="btn-primary w-full mt-2 text-sm"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="font-semibold mb-4">Payment Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Status</label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
                <button
                  onClick={updatePaymentStatus}
                  disabled={updating || newPaymentStatus === order.payment_status}
                  className="btn-primary w-full mt-2 text-sm"
                >
                  Update Payment
                </button>
              </div>
              <div className="text-sm text-gray-600">
                Method: {order.payment_method || 'N/A'}
              </div>
            </div>
          </div>

          {/* Ship Order */}
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="font-semibold mb-4">Ship Order</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="input-field text-sm"
                    placeholder="Enter tracking number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Carrier</label>
                  <select
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="">Select carrier</option>
                    <option value="DTDC">DTDC</option>
                    <option value="BlueDart">BlueDart</option>
                    <option value="Delhivery">Delhivery</option>
                    <option value="Shiprocket">Shiprocket</option>
                    <option value="FedEx">FedEx</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button
                  onClick={shipOrder}
                  disabled={updating || !trackingNumber || !carrier}
                  className="btn-primary w-full text-sm"
                >
                  Mark as Shipped
                </button>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="font-semibold mb-4">Customer</h2>
            <div className="text-sm space-y-1">
              <div className="font-medium">{order.customer?.name || 'Guest'}</div>
              <div className="text-gray-600">{order.customer?.email}</div>
              {order.customer?.phone && (
                <div className="text-gray-600">{order.customer.phone}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

