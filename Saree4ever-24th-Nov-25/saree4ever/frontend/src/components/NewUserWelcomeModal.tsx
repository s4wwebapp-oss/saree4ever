'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface NewUserWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DiscountInfo {
  eligible: boolean;
  discount_code: string;
  discount_percentage: number;
}

export default function NewUserWelcomeModal({ isOpen, onClose }: NewUserWelcomeModalProps) {
  const [discountInfo, setDiscountInfo] = useState<DiscountInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchDiscountInfo();
    }
  }, [isOpen]);

  const fetchDiscountInfo = async () => {
    try {
      setLoading(true);
      const response: any = await api.auth.checkNewUserDiscount();
      setDiscountInfo(response);
    } catch (error) {
      console.error('Error fetching discount info:', error);
      // If error, assume not eligible and close modal
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Don't show modal if not eligible
  if (!loading && (!discountInfo || !discountInfo.eligible)) {
    return null;
  }

  const handleCopyCode = () => {
    if (discountInfo?.discount_code) {
      navigator.clipboard.writeText(discountInfo.discount_code);
      // You could add a toast notification here
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white w-full max-w-md mx-4 p-8 relative border-2 border-black">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : discountInfo && discountInfo.eligible ? (
          <>
            {/* Welcome Message */}
            <div className="text-center mb-6">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="heading-serif-md mb-2 text-2xl">Welcome to Saree4Ever!</h2>
              <p className="text-gray-600">
                We're excited to have you join our community. Enjoy a special welcome discount on your first order!
              </p>
            </div>

            {/* Discount Coupon Card */}
            <div className="border-2 border-black bg-gradient-to-r from-pink-50 to-purple-50 p-6 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-pink-200 rounded-full -mr-10 -mt-10 opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-200 rounded-full -ml-8 -mb-8 opacity-50"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-1">Use code on your first order</p>
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className="text-3xl font-bold text-black font-mono tracking-wider">
                      {discountInfo.discount_code}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Copy code"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    Get {discountInfo.discount_percentage}% OFF
                  </p>
                </div>
              </div>
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 p-4 mb-6 rounded">
              <p className="text-sm text-blue-800 text-center">
                <strong>Good news!</strong> This discount will be automatically applied to your first order at checkout. 
                No need to enter the code manually!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  onClose();
                  window.location.href = '/collections';
                }}
                className="btn-primary w-full"
              >
                Start Shopping
              </button>
              <button
                onClick={onClose}
                className="btn-outline w-full"
              >
                Continue
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}





