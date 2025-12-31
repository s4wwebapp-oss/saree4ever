'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import Image from 'next/image';

interface OrderItem {
  id: string;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_image_url: string | null;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  order_items: OrderItem[];
  timeline?: Array<{
    timestamp: string;
    event: string;
    details: any;
  }>;
}

const statusSteps = [
  { key: 'pending', label: 'Ordered' },
  { key: 'confirmed', label: 'Paid' },
  { key: 'processing', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrder();
    
    // Poll for updates every 60 seconds
    const interval = setInterval(fetchOrder, 60000);
    
    // TODO: Connect to SSE endpoint for real-time updates
    // const eventSource = new EventSource('/api/realtime/events/user');
    // eventSource.addEventListener('order_updated', (event) => {
    //   const data = JSON.parse(event.data);
    //   if (data.order_id === order?.id) {
    //     fetchOrder();
    //   }
    // });

    return () => {
      clearInterval(interval);
      // eventSource.close();
    };
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response: any = await api.orders.getByNumber(orderId);
      setOrder(response.order || response);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="heading-serif-md mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The order you are looking for does not exist.'}</p>
        </div>
      </div>
    );
  }

  const currentStatusIndex = statusSteps.findIndex((s) => s.key === order.status);
  const isPaid = order.payment_status === 'paid';

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="heading-serif-md mb-2">Order #{order.order_number}</h1>
          <p className="text-gray-600">
            Status: <span className="font-medium capitalize">{order.status}</span>
          </p>
        </div>

        {/* Order Timeline */}
        <div className="mb-8 border-b border-gray-200 pb-8">
          <h2 className="font-semibold mb-4">Order Status</h2>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              
              return (
                <div key={step.key} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        isCompleted
                          ? 'bg-black border-black text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <p
                      className={`text-xs mt-2 text-center ${
                        isCurrent ? 'font-semibold' : 'text-gray-600'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 ${
                        isCompleted ? 'bg-black' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-8">
          <h2 className="font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-gray-200 pb-4">
                <div className="relative w-24 h-24 bg-gray-100 flex-shrink-0">
                  {item.product_image_url ? (
                    <Image
                      src={item.product_image_url}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.product_name}</h3>
                  {item.variant_name && (
                    <p className="text-sm text-gray-600">{item.variant_name}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    Quantity: {item.quantity} × ₹{item.unit_price.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{item.total_price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-8 border border-black p-6">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>₹{order.shipping_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (GST)</span>
              <span>₹{order.tax_amount.toLocaleString()}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount</span>
                <span>-₹{order.discount_amount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{order.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        {!isPaid && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200">
            <p className="font-medium mb-2">Payment Pending</p>
            <p className="text-sm text-gray-700">
              Your order has been created. Please complete payment to proceed.
            </p>
            {/* TODO: Add payment button/redirect */}
          </div>
        )}

        {/* Tracking Info */}
        {order.tracking_number && (
          <div className="mb-8 p-4 bg-gray-50 border border-gray-200">
            <p className="font-medium mb-2">Tracking Number</p>
            <p className="text-sm text-gray-700 font-mono">{order.tracking_number}</p>
            {order.shipped_at && (
              <p className="text-xs text-gray-600 mt-1">
                Shipped on: {new Date(order.shipped_at).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Timeline Events */}
        {order.timeline && order.timeline.length > 0 && (
          <div>
            <h2 className="font-semibold mb-4">Order Timeline</h2>
            <div className="space-y-3">
              {order.timeline.map((event, index) => (
                <div key={index} className="flex gap-4 pb-3 border-b border-gray-100">
                  <div className="flex-shrink-0 w-2 h-2 bg-black rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.event.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                    {event.details?.message && (
                      <p className="text-xs text-gray-500 mt-1">{event.details.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

