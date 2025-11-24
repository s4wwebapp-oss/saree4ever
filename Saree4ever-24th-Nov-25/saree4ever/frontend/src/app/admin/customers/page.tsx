'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Customer {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  order_count?: number;
  total_spent?: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual customers API endpoint when available
      // For now, we'll fetch from orders to get customer data
      const ordersResponse: any = await api.orders.getAll();
      const orders = ordersResponse.orders || [];
      
      // Extract unique customers from orders
      const customerMap = new Map<string, Customer>();
      
      orders.forEach((order: any) => {
        if (order.customer_email) {
          const email = order.customer_email;
          if (!customerMap.has(email)) {
            customerMap.set(email, {
              id: order.customer_id || email,
              email: email,
              full_name: order.customer_name || null,
              phone: order.customer_phone || null,
              created_at: order.created_at || new Date().toISOString(),
              order_count: 0,
              total_spent: 0,
            });
          }
          const customer = customerMap.get(email)!;
          customer.order_count = (customer.order_count || 0) + 1;
          customer.total_spent = (customer.total_spent || 0) + (order.total_amount || 0);
        }
      });
      
      setCustomers(Array.from(customerMap.values()));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customers');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.email.toLowerCase().includes(query) ||
      customer.full_name?.toLowerCase().includes(query) ||
      customer.phone?.includes(query)
    );
  });

  return (
    <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="heading-serif-md mb-2">Customers</h1>
            <p className="text-gray-600">Manage customer information and view order history</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white border border-gray-200 p-4 mb-6">
          <input
            type="text"
            placeholder="Search customers by email, name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 rounded">
            {error}
          </div>
        )}

        {/* Customers Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200">
            <p className="text-gray-600">
              {searchQuery ? 'No customers found matching your search.' : 'No customers found.'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Member Since
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {customer.full_name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.order_count || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ₹{customer.total_spent?.toLocaleString('en-IN') || '0'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.created_at
                        ? new Date(customer.created_at).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <Link
                        href={`/admin/orders?customer=${encodeURIComponent(customer.email)}`}
                        className="text-black hover:underline"
                      >
                        View Orders
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        {customers.length > 0 && (
          <div className="mt-6 bg-gray-50 border border-gray-200 p-4 rounded">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Customers:</span>
                <span className="ml-2 font-semibold">{customers.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Orders:</span>
                <span className="ml-2 font-semibold">
                  {customers.reduce((sum, c) => sum + (c.order_count || 0), 0)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Total Revenue:</span>
                <span className="ml-2 font-semibold">
                  ₹{customers.reduce((sum, c) => sum + (c.total_spent || 0), 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

