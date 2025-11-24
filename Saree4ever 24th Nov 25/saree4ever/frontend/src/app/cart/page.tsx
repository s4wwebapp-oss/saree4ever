'use client';

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCart();
  const [validatedItems, setValidatedItems] = useState<Record<string, boolean>>({});
  const [validating, setValidating] = useState(false);

  // Validate availability before checkout
  const validateCart = async () => {
    setValidating(true);
    const validation: Record<string, boolean> = {};

    for (const item of items) {
      try {
        const response: any = await api.inventory.getAvailable(item.variantId);
        validation[item.variantId] = (response.available_stock || 0) >= item.quantity;
      } catch (error) {
        validation[item.variantId] = false;
      }
    }

    setValidatedItems(validation);
    setValidating(false);
  };

  useEffect(() => {
    if (items.length > 0) {
      validateCart();
    }
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="heading-serif-md mb-4">Your Cart</h1>
          <p className="text-gray-600 mb-8">Your cart is empty</p>
          <Link href="/collections" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const allValid = Object.values(validatedItems).every((v) => v);
  const subtotal = total;
  const shipping: number = 0; // Free shipping or calculate
  const tax: number = subtotal * 0.18; // 18% GST
  const finalTotal = subtotal + shipping + tax;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="heading-serif-md mb-8">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const isValid = validatedItems[item.variantId] !== false;
              return (
                <div
                  key={item.variantId}
                  className={`border p-4 flex flex-col sm:flex-row gap-4 ${
                    !isValid ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div className="relative w-full sm:w-24 h-32 sm:h-24 bg-gray-100 flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
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
                    <h3 className="font-medium mb-1">{item.title}</h3>
                    {item.variantName && (
                      <p className="text-sm text-gray-600 mb-2">{item.variantName}</p>
                    )}
                    {!isValid && (
                      <p className="text-sm text-red-600 mb-2">
                        This item is no longer available in the selected quantity
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-gray-300">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="px-3 py-1"
                        >
                          −
                        </button>
                        <span className="px-4 py-1 min-w-[3rem] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="px-3 py-1"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-sm text-red-600 hover:underline mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping.toLocaleString()}`}</span>
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
              </div>

              {validating ? (
                <button className="btn-primary w-full opacity-50 cursor-not-allowed" disabled>
                  Validating...
                </button>
              ) : !allValid ? (
                <button
                  onClick={validateCart}
                  className="btn-secondary w-full"
                >
                  Re-validate Cart
                </button>
              ) : (
                <Link href="/checkout" className="btn-primary w-full block text-center">
                  Proceed to Checkout
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

