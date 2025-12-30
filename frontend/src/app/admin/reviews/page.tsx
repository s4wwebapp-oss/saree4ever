'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Image from 'next/image';

interface Review {
  id: string;
  customer_name: string;
  customer_role: string | null;
  content: string;
  rating: number;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_role: '',
    content: '',
    rating: 5,
    image_url: '',
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response: any = await api.testimonials.getAll();
      setReviews(response.testimonials || []);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReview) {
        await api.testimonials.update(editingReview.id, formData);
      } else {
        await api.testimonials.create(formData);
      }
      loadReviews();
      resetForm();
    } catch (error: any) {
      alert('Failed to save review: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.testimonials.delete(id);
      loadReviews();
    } catch (error: any) {
      alert('Failed to delete review: ' + error.message);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({
      customer_name: review.customer_name,
      customer_role: review.customer_role || '',
      content: review.content,
      rating: review.rating,
      image_url: review.image_url || '',
      is_active: review.is_active,
      display_order: review.display_order,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      customer_name: '',
      customer_role: '',
      content: '',
      rating: 5,
      image_url: '',
      is_active: true,
      display_order: 0,
    });
    setEditingReview(null);
    setShowForm(false);
  };

  const activeReviews = reviews.filter(r => r.is_active);
  const inactiveReviews = reviews.filter(r => !r.is_active);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="heading-serif-md mb-2">Customer Reviews</h1>
          <p className="text-gray-600">
            Manage testimonials and reviews displayed on your homepage
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ Add Review'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingReview ? 'Edit Review' : 'Add New Review'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g., Priya Sharma"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Customer Role (Optional)
                </label>
                <input
                  type="text"
                  value={formData.customer_role}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g., Wedding Bride, Regular Customer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Review Content *
              </label>
              <textarea
                required
                rows={4}
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Write the customer's review here..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Tip: Keep it authentic and specific. Mention product details or experience highlights.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Rating *
                </label>
                <select
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 stars)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 stars)</option>
                  <option value={3}>⭐⭐⭐ (3 stars)</option>
                  <option value={2}>⭐⭐ (2 stars)</option>
                  <option value={1}>⭐ (1 star)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      display_order: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <label className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Active (visible on website)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Customer Image URL (Optional)
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="https://example.com/customer-photo.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload image to Supabase Storage and paste the public URL here
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="btn-primary">
                {editingReview ? 'Update Review' : 'Add Review'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Reviews */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Active Reviews ({activeReviews.length})
        </h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : activeReviews.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">No active reviews yet</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              Add Your First Review
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Inactive Reviews */}
      {inactiveReviews.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Inactive Reviews ({inactiveReviews.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewCard({
  review,
  onEdit,
  onDelete,
}: {
  review: Review;
  onEdit: (review: Review) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={`bg-white border rounded-lg p-4 ${
        review.is_active ? 'border-gray-200' : 'border-gray-300 opacity-60'
      }`}
    >
      <div className="flex items-start mb-3">
        {review.image_url ? (
          <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
            <Image
              src={review.image_url}
              alt={review.customer_name}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex-shrink-0 flex items-center justify-center">
            <span className="text-gray-500 text-sm font-semibold">
              {review.customer_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{review.customer_name}</h4>
          {review.customer_role && (
            <p className="text-xs text-gray-500 truncate">{review.customer_role}</p>
          )}
          <div className="flex items-center gap-0.5 mt-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-700 line-clamp-3 mb-3">{review.content}</p>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>Order: {review.display_order}</span>
        <span className={review.is_active ? 'text-green-600' : 'text-gray-400'}>
          {review.is_active ? '● Active' : '○ Inactive'}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(review)}
          className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(review.id)}
          className="flex-1 px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
