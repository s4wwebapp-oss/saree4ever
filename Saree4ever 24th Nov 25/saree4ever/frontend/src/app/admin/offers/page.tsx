'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Offer {
  id: string;
  title: string;
  description: string | null;
  discount_type: string; // 'percentage' | 'fixed'
  discount_value: number;
  min_purchase_amount: number | null;
  max_discount_amount: number | null;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  usage_limit: number | null;
  usage_count: number;
  code: string | null;
  image_url: string | null;
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    activeOnly: false,
    expired: false,
  });

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const response: any = await api.offers.getAll({ limit: 100 });
      const offersList = response.offers || response || [];
      setOffers(offersList);
    } catch (error) {
      console.error('Failed to load offers:', error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    
    try {
      await api.offers.delete(id);
      loadOffers();
    } catch (error: any) {
      alert(error.message || 'Failed to delete offer');
    }
  };

  const handleStatusToggle = async (id: string, isActive: boolean) => {
    try {
      await api.offers.updateStatus(id, !isActive);
      loadOffers();
    } catch (error: any) {
      alert(error.message || 'Failed to update offer status');
    }
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const isUpcoming = (validFrom: string) => {
    return new Date(validFrom) > new Date();
  };

  const filteredOffers = offers.filter((offer) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        offer.title?.toLowerCase().includes(searchLower) ||
        offer.code?.toLowerCase().includes(searchLower) ||
        offer.description?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    if (filters.activeOnly) {
      if (!offer.is_active || isExpired(offer.valid_until)) return false;
    }
    if (filters.expired) {
      if (!isExpired(offer.valid_until)) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="heading-serif-md mb-2">Offers</h1>
          <p className="text-gray-600">Manage promotional offers and discounts</p>
        </div>
        <Link href="/admin/offers?action=create" className="btn-primary">
          + New Offer
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Title, Code, Description"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input-field text-sm"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.activeOnly}
                onChange={(e) => setFilters({ ...filters, activeOnly: e.target.checked })}
                className="w-4 h-4 border-black"
              />
              <span className="text-sm">Active Only</span>
            </label>
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.expired}
                onChange={(e) => setFilters({ ...filters, expired: e.target.checked })}
                className="w-4 h-4 border-black"
              />
              <span className="text-sm">Expired</span>
            </label>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ search: '', activeOnly: false, expired: false })}
              className="btn-outline w-full text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Offers Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Discount</th>
                <th className="px-6 py-3">Valid Period</th>
                <th className="px-6 py-3">Usage</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading offers...
                  </td>
                </tr>
              ) : filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No offers found.
                  </td>
                </tr>
              ) : (
                filteredOffers.map((offer) => {
                  const expired = isExpired(offer.valid_until);
                  const upcoming = isUpcoming(offer.valid_from);
                  
                  return (
                    <tr key={offer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium">{offer.title}</div>
                        {offer.description && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {offer.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {offer.code ? (
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {offer.code}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">
                          {offer.discount_type === 'percentage'
                            ? `${offer.discount_value}%`
                            : `₹${offer.discount_value}`}
                        </div>
                        {offer.min_purchase_amount && (
                          <div className="text-xs text-gray-500">
                            Min: ₹{offer.min_purchase_amount}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs">
                          <div>From: {new Date(offer.valid_from).toLocaleDateString()}</div>
                          <div>Until: {new Date(offer.valid_until).toLocaleDateString()}</div>
                        </div>
                        {expired && (
                          <span className="inline-block mt-1 text-xs text-red-600">Expired</span>
                        )}
                        {upcoming && (
                          <span className="inline-block mt-1 text-xs text-blue-600">Upcoming</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {offer.usage_count || 0}
                          {offer.usage_limit && ` / ${offer.usage_limit}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          expired
                            ? 'bg-gray-100 text-gray-800'
                            : upcoming
                            ? 'bg-blue-100 text-blue-800'
                            : offer.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {expired
                            ? 'Expired'
                            : upcoming
                            ? 'Upcoming'
                            : offer.is_active
                            ? 'Active'
                            : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleStatusToggle(offer.id, offer.is_active)}
                            className={`text-xs px-3 py-1 rounded ${
                              offer.is_active
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {offer.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <Link
                            href={`/admin/offers/${offer.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(offer.id)}
                            className="text-red-600 hover:text-red-900 font-medium text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


