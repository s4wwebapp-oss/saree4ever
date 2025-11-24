'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import AuthModal from '@/components/AuthModal';

interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response: any = await api.auth.getCurrentUser();
      setUser(response.user || response);
      setError(null);
    } catch (err: any) {
      // Check if it's an authentication error
      const errorMessage = err.message || '';
      if (errorMessage.includes('token') || errorMessage.includes('authenticated') || errorMessage.includes('401')) {
        setError('not_authenticated');
      } else {
        setError(errorMessage || 'Failed to load user information');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (error === 'not_authenticated' || (!user && error?.includes('token'))) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="heading-serif-md mb-4">My Account</h1>
            <p className="text-gray-600 mb-2">
              Please sign in to view your account information
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Sign in to access your orders, saved addresses, and account settings
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowAuthModal(true)}
                className="btn-primary"
              >
                Sign In
              </button>
              <Link href="/" className="btn-secondary">
                Continue Shopping
              </Link>
            </div>
            
            <AuthModal
              isOpen={showAuthModal}
              onClose={() => setShowAuthModal(false)}
              initialMode="signin"
            />
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="heading-serif-md mb-4">My Account</h1>
            <p className="text-gray-600 mb-8">
              {error || 'Unable to load account information'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="btn-primary">
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="heading-serif-md mb-2">My Account</h1>
          <p className="text-gray-600">Manage your account information and orders</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Account Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="border border-black p-6">
              <h2 className="font-semibold mb-4">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900">{user.email}</p>
                </div>
                {user.full_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-gray-900">{user.full_name}</p>
                  </div>
                )}
                {user.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-gray-900">{user.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border border-black p-6">
              <h2 className="font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/orders" className="btn-outline text-center">
                  View Orders
                </Link>
                <Link href="/cart" className="btn-outline text-center">
                  View Cart
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="border border-black p-6">
              <h3 className="font-semibold mb-4">Account Menu</h3>
              <nav className="space-y-2">
                <Link
                  href="/orders"
                  className="block text-sm hover:underline py-2"
                >
                  My Orders
                </Link>
                <Link
                  href="/account"
                  className="block text-sm hover:underline py-2 font-medium"
                >
                  Account Details
                </Link>
                <Link
                  href="/cart"
                  className="block text-sm hover:underline py-2"
                >
                  Shopping Cart
                </Link>
                <Link
                  href="/collections"
                  className="block text-sm hover:underline py-2"
                >
                  Browse Collections
                </Link>
                <button
                  onClick={async () => {
                    try {
                      await api.auth.signout();
                    } catch (err) {
                      console.error('Sign out error:', err);
                    } finally {
                      localStorage.removeItem('token');
                      router.refresh();
                      window.location.href = '/account';
                    }
                  }}
                  className="block text-sm hover:underline py-2 text-left text-red-600 w-full text-left"
                >
                  Sign Out
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

