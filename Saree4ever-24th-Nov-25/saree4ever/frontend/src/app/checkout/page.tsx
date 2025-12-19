'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { api } from '@/lib/api';

interface DiscountInfo {
  eligible: boolean;
  discount_code: string;
  discount_percentage: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountInfo, setDiscountInfo] = useState<DiscountInfo | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    shipping_name: '',
    shipping_address_line1: '',
    shipping_address_line2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postal_code: '',
    shipping_country: 'India',
    billing_same_as_shipping: true,
    billing_name: '',
    billing_address_line1: '',
    billing_address_line2: '',
    billing_city: '',
    billing_state: '',
    billing_postal_code: '',
    billing_country: 'India',
    customer_notes: '',
  });

  // Check for user authentication and discount eligibility
  useEffect(() => {
    const checkDiscountEligibility = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const userResponse: any = await api.auth.getCurrentUser();
        if (userResponse?.user?.id) {
          setUserId(userResponse.user.id);
          
          // Check discount eligibility
          const discountResponse: any = await api.auth.checkNewUserDiscount();
          if (discountResponse?.eligible) {
            setDiscountInfo(discountResponse);
          }
        }
      } catch (error) {
        // User not authenticated or error - silently fail
        console.log('Not authenticated or discount not available');
      }
    };

    checkDiscountEligibility();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'billing_same_as_shipping' && checked) {
      setFormData({
        ...formData,
        billing_same_as_shipping: true,
        billing_name: formData.shipping_name,
        billing_address_line1: formData.shipping_address_line1,
        billing_address_line2: formData.shipping_address_line2,
        billing_city: formData.shipping_city,
        billing_state: formData.shipping_state,
        billing_postal_code: formData.shipping_postal_code,
        billing_country: formData.shipping_country,
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare order items from cart
      const orderItems = items.map((item) => ({
        variant_id: item.variantId,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      // Calculate totals (backend will verify and apply discount)
      const subtotal = total;
      const tax_amount = subtotal * 0.18; // 18% GST (calculated on full amount)
      const shipping_amount = 0; // Free shipping
      const discount_amount = 0; // Backend will calculate and apply discount automatically for eligible users
      const total_amount = subtotal + tax_amount + shipping_amount - discount_amount;

      // Create order
      const orderData = {
        user_id: userId || null, // Include user_id if authenticated
        email: formData.email,
        phone: formData.phone,
        shipping_name: formData.shipping_name,
        shipping_address_line1: formData.shipping_address_line1,
        shipping_address_line2: formData.shipping_address_line2 || null,
        shipping_city: formData.shipping_city,
        shipping_state: formData.shipping_state,
        shipping_postal_code: formData.shipping_postal_code,
        shipping_country: formData.shipping_country,
        billing_name: formData.billing_same_as_shipping ? formData.shipping_name : formData.billing_name,
        billing_address_line1: formData.billing_same_as_shipping ? formData.shipping_address_line1 : formData.billing_address_line1,
        billing_address_line2: formData.billing_same_as_shipping ? (formData.shipping_address_line2 || null) : (formData.billing_address_line2 || null),
        billing_city: formData.billing_same_as_shipping ? formData.shipping_city : formData.billing_city,
        billing_state: formData.billing_same_as_shipping ? formData.shipping_state : formData.billing_state,
        billing_postal_code: formData.billing_same_as_shipping ? formData.shipping_postal_code : formData.billing_postal_code,
        billing_country: formData.billing_same_as_shipping ? formData.shipping_country : formData.billing_country,
        items: orderItems,
        subtotal,
        tax_amount,
        shipping_amount,
        discount_amount,
        total_amount,
        customer_notes: formData.customer_notes || null,
      };

      const response: any = await api.orders.create(orderData);
      const order = response.order || response;

      // Clear cart
      clearCart();

      // Redirect to order confirmation
      router.push(`/orders/${order.order_number || order.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create order. Please try again.');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="heading-serif-md mb-4">Checkout</h1>
          <p className="text-gray-600 mb-8">Your cart is empty</p>
          <a href="/collections" className="btn-primary">
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  const subtotal = total;
  
  // Calculate discount amount if eligible (for display - backend will verify and apply)
  const discountAmount = discountInfo && discountInfo.eligible 
    ? (subtotal * discountInfo.discount_percentage) / 100 
    : 0;
  
  const tax = subtotal * 0.18; // Tax calculated on full amount (backend does the same)
  const shipping = 0;
  const finalTotal = subtotal + tax + shipping - discountAmount;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="heading-serif-md mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping & Billing Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Information */}
            <section>
              <h2 className="font-semibold text-lg mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section>
              <h2 className="font-semibold text-lg mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="shipping_name"
                    required
                    value={formData.shipping_name}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
                  <input
                    type="text"
                    name="shipping_address_line1"
                    required
                    value={formData.shipping_address_line1}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address Line 2</label>
                  <input
                    type="text"
                    name="shipping_address_line2"
                    value={formData.shipping_address_line2}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <input
                      type="text"
                      name="shipping_city"
                      required
                      value={formData.shipping_city}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State *</label>
                    <input
                      type="text"
                      name="shipping_state"
                      required
                      value={formData.shipping_state}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Postal Code *</label>
                    <input
                      type="text"
                      name="shipping_postal_code"
                      required
                      value={formData.shipping_postal_code}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Country *</label>
                    <input
                      type="text"
                      name="shipping_country"
                      required
                      value={formData.shipping_country}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Billing Address */}
            <section>
              <div className="mb-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="billing_same_as_shipping"
                    checked={formData.billing_same_as_shipping}
                    onChange={handleChange}
                    className="w-4 h-4 border-black"
                  />
                  <span className="text-sm">Billing address same as shipping</span>
                </label>
              </div>

              {!formData.billing_same_as_shipping && (
                <div className="space-y-4">
                  <h2 className="font-semibold text-lg mb-4">Billing Address</h2>
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="billing_name"
                      required={!formData.billing_same_as_shipping}
                      value={formData.billing_name}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
                    <input
                      type="text"
                      name="billing_address_line1"
                      required={!formData.billing_same_as_shipping}
                      value={formData.billing_address_line1}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  {/* Add more billing fields as needed */}
                </div>
              )}
            </section>

            {/* Notes */}
            <section>
              <label className="block text-sm font-medium mb-1">Order Notes (Optional)</label>
              <textarea
                name="customer_notes"
                value={formData.customer_notes}
                onChange={handleChange}
                rows={3}
                className="input-field"
              />
            </section>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border border-black p-6 sticky top-24">
              <h2 className="font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Discount ({discountInfo?.discount_code}) 
                      <span className="ml-1 text-xs">-{discountInfo?.discount_percentage}%</span>
                    </span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (GST)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>
                {discountAmount > 0 && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                    <p>✨ Your new user discount will be automatically applied!</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating Order...' : 'Create Order'}
              </button>

              <p className="text-xs text-gray-600 mt-4 text-center">
                You will complete payment after order creation
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

