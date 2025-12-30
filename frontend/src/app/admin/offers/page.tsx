'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  max_discount_amount: number | null;
  min_cart_total: number | null;
  usage_limit: number | null;
  usage_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type CouponFormState = {
  code: string;
  description: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number | string;
  max_discount_amount: string;
  min_cart_total: string;
  usage_limit: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
};

const defaultFormState: CouponFormState = {
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: 10,
  max_discount_amount: '',
  min_cart_total: '',
  usage_limit: '',
  starts_at: '',
  expires_at: '',
  is_active: true,
};

const formatDateTimeLocal = (value: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toIsoString = (value: string) => (value ? new Date(value).toISOString() : null);

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<CouponFormState>(defaultFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState({ search: '', status: 'all' as 'all' | 'active' | 'inactive' });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const response: any = await api.coupons.getAll({ limit: 200 });
      setCoupons(response.coupons || response || []);
    } catch (error) {
      console.error('Failed to load coupons:', error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormState(defaultFormState);
    setEditingId(null);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setFormState({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      max_discount_amount: coupon.max_discount_amount ? String(coupon.max_discount_amount) : '',
      min_cart_total: coupon.min_cart_total ? String(coupon.min_cart_total) : '',
      usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : '',
      starts_at: formatDateTimeLocal(coupon.starts_at),
      expires_at: formatDateTimeLocal(coupon.expires_at),
      is_active: coupon.is_active,
    });
    setFormMessage(null);
    setFormError(null);
  };

  const serializeForm = () => ({
    code: formState.code.trim().toUpperCase(),
    description: formState.description || null,
    discount_type: formState.discount_type,
    discount_value: Number(formState.discount_value) || 0,
    max_discount_amount: formState.max_discount_amount ? Number(formState.max_discount_amount) : null,
    min_cart_total: formState.min_cart_total ? Number(formState.min_cart_total) : null,
    usage_limit: formState.usage_limit ? Number(formState.usage_limit) : null,
    starts_at: toIsoString(formState.starts_at),
    expires_at: toIsoString(formState.expires_at),
    is_active: formState.is_active,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    setFormMessage(null);
    const payload = serializeForm();

    if (!payload.code) {
      setFormError('Coupon code is required');
      setSaving(false);
      return;
    }
    if (!payload.discount_value || payload.discount_value <= 0) {
      setFormError('Discount value must be greater than zero');
      setSaving(false);
      return;
    }

    try {
      if (editingId) {
        await api.coupons.update(editingId, payload);
        setFormMessage('Coupon updated successfully');
      } else {
        await api.coupons.create(payload);
        setFormMessage('Coupon created successfully');
      }
      await loadCoupons();
      resetForm();
    } catch (error: any) {
      setFormError(error?.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon permanently?')) return;
    try {
      await api.coupons.delete(id);
      await loadCoupons();
    } catch (error: any) {
      alert(error?.message || 'Failed to delete coupon');
    }
  };

  const handleToggle = async (coupon: Coupon) => {
    try {
      await api.coupons.update(coupon.id, { is_active: !coupon.is_active });
      await loadCoupons();
    } catch (error: any) {
      alert(error?.message || 'Failed to update coupon');
    }
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matches =
          coupon.code.toLowerCase().includes(search) ||
          coupon.description?.toLowerCase().includes(search) ||
          coupon.discount_type?.toLowerCase().includes(search);
        if (!matches) return false;
      }
      if (filters.status === 'active' && !coupon.is_active) return false;
      if (filters.status === 'inactive' && coupon.is_active) return false;
      return true;
    });
  }, [coupons, filters]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="heading-serif-md mb-2">Coupons</h1>
          <p className="text-gray-600">Create, edit, and monitor coupon codes in one place.</p>
        </div>
        <button
          onClick={resetForm}
          className="btn-outline self-start"
        >
          {editingId ? 'Cancel Editing' : 'Reset Form'}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Coupons Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Code or description"
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as 'all' | 'active' | 'inactive' })}
                  className="input-field text-sm"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ search: '', status: 'all' })}
                  className="btn-outline w-full text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                  <tr>
                    <th className="px-6 py-3">Code</th>
                    <th className="px-6 py-3">Discount</th>
                    <th className="px-6 py-3">Usage</th>
                    <th className="px-6 py-3">Schedule</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        Loading coupons...
                      </td>
                    </tr>
                  ) : filteredCoupons.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No coupons found.
                      </td>
                    </tr>
                  ) : (
                    filteredCoupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-mono text-sm">{coupon.code}</div>
                          {coupon.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{coupon.description}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium">
                            {coupon.discount_type === 'flat'
                              ? `₹${coupon.discount_value}`
                              : `${coupon.discount_value}%`}
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            {coupon.max_discount_amount && <div>Cap: ₹{coupon.max_discount_amount}</div>}
                            {coupon.min_cart_total && <div>Min cart: ₹{coupon.min_cart_total}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            {coupon.usage_count || 0}
                            {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-600">
                          <div>
                            {coupon.starts_at ? new Date(coupon.starts_at).toLocaleDateString() : 'Immediate'}
                          </div>
                          <div>
                            {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'No expiry'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {coupon.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggle(coupon)}
                            className="text-sm px-3 py-1 rounded border border-gray-200"
                          >
                            {coupon.is_active ? 'Pause' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <div>
            <h2 className="font-semibold text-lg mb-1">{editingId ? 'Edit Coupon' : 'Create Coupon'}</h2>
            <p className="text-sm text-gray-500">
              {editingId
                ? 'Update the selected coupon. Changes take effect immediately.'
                : 'Launch a new coupon with cart minimums, usage caps, and schedules.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Code *</label>
                <input
                  type="text"
                  value={formState.code}
                  onChange={(e) => setFormState({ ...formState, code: e.target.value.toUpperCase() })}
                  className="input-field"
                  placeholder="SAVE10"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  rows={2}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Type</label>
                  <select
                    value={formState.discount_type}
                    onChange={(e) => setFormState({ ...formState, discount_type: e.target.value as 'percentage' | 'flat' })}
                    className="input-field"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Value *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formState.discount_value}
                    onChange={(e) => setFormState({ ...formState, discount_value: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Max Discount (optional)</label>
                  <input
                    type="number"
                    min="0"
                    value={formState.max_discount_amount}
                    onChange={(e) => setFormState({ ...formState, max_discount_amount: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Min Cart Total (optional)</label>
                  <input
                    type="number"
                    min="0"
                    value={formState.min_cart_total}
                    onChange={(e) => setFormState({ ...formState, min_cart_total: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Usage Limit (optional)</label>
                  <input
                    type="number"
                    min="0"
                    value={formState.usage_limit}
                    onChange={(e) => setFormState({ ...formState, usage_limit: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="flex items-end space-x-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formState.is_active}
                      onChange={(e) => setFormState({ ...formState, is_active: e.target.checked })}
                      className="w-4 h-4 border-black"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Starts At</label>
                  <input
                    type="datetime-local"
                    value={formState.starts_at}
                    onChange={(e) => setFormState({ ...formState, starts_at: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expires At</label>
                  <input
                    type="datetime-local"
                    value={formState.expires_at}
                    onChange={(e) => setFormState({ ...formState, expires_at: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">{formError}</div>
            )}
            {formMessage && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm">{formMessage}</div>
            )}

            <button
              type="submit"
              disabled={saving}
              className={`btn-primary w-full ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {saving ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


