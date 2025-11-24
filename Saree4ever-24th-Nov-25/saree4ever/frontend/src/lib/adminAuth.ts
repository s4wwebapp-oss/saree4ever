/**
 * Admin authentication utility
 * Handles getting admin tokens for API calls
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

/**
 * Check if user is authenticated as admin
 */
export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('admin_auth') === 'true';
}

/**
 * Get admin token, attempting to fetch if not available
 */
export async function getAdminToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  // Check if we already have a token
  const existingToken = localStorage.getItem('admin_token') || localStorage.getItem('token');
  if (existingToken) {
    return existingToken;
  }

  // If admin_auth is set but no token, try to get one
  if (localStorage.getItem('admin_auth') === 'true') {
    try {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@saree4ever.com';
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

      const response = await fetch(`${API_URL}/auth/admin/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('admin_token', data.token);
          localStorage.setItem('token', data.token);
          return data.token;
        }
      }
    } catch (error) {
      console.warn('Failed to get admin token:', error);
    }
  }

  return null;
}

/**
 * Ensure admin token is available, show error if not
 */
export async function ensureAdminToken(): Promise<string | null> {
  const token = await getAdminToken();
  
  if (!token && isAdminAuthenticated()) {
    console.warn(
      'Admin authenticated but no token available. ' +
      'Please ensure admin credentials are configured in backend .env (ADMIN_EMAILS) ' +
      'and frontend .env.local (NEXT_PUBLIC_ADMIN_EMAIL, NEXT_PUBLIC_ADMIN_PASSWORD)'
    );
  }
  
  return token;
}


