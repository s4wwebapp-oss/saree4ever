'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Check if user is already authenticated with valid token
    const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
    const adminAuth = localStorage.getItem('admin_auth');
    
    if (adminAuth === 'true' && token) {
      // Verify token is still valid by making a test API call
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/hero-slides`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          if (response.ok) {
            setAuthenticated(true);
          } else {
            // Token is invalid, clear auth
            localStorage.removeItem('token');
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_auth');
            setAuthenticated(false);
          }
        })
        .catch(() => {
          // Network error or invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_auth');
          setAuthenticated(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      alert('Please enter a password');
      return;
    }
    
    try {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@saree4ever.com';
      // FIXED: Always use the password the user typed, not from env
      const adminPassword = password;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/auth/admin/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('admin_token', data.token);
          localStorage.setItem('token', data.token);
          localStorage.setItem('admin_auth', 'true');
          setAuthenticated(true);
        } else {
          alert('Failed to get authentication token');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Authentication failed' }));
        alert(errorData.error || 'Invalid credentials');
        // Make sure we don't set authenticated to true on failure
        setAuthenticated(false);
        // Clear any old auth data
        localStorage.removeItem('token');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_auth');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      alert('Failed to authenticate. Please check your network connection and try again.');
      // Make sure we don't set authenticated to true on error
      setAuthenticated(false);
      // Clear any old auth data
      localStorage.removeItem('token');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_auth');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center bg-white">
        <div className="max-w-md w-full px-4">
          <h1 className="heading-serif-md mb-8 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter admin password"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Login
            </button>
          </form>
          <p className="text-xs text-gray-600 mt-4 text-center">
            Enter the password for the admin user in Supabase
          </p>
        </div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}


