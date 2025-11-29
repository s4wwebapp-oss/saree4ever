'use client';

import { useState } from 'react';

interface ProductTabsProps {
  description?: string | null;
  longDescription?: string | null;
  specifications?: Record<string, string>;
  reviews?: any[];
}

export default function ProductTabs({
  description,
  longDescription,
  specifications,
  reviews,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState('description');

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'reviews', label: 'Reviews' },
  ];

  return (
    <div className="mt-12 border-t border-gray-200">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            {tab.label}
            {tab.id === 'reviews' && reviews && reviews.length > 0 && (
              <span className="ml-2 text-xs text-gray-500">({reviews.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-8">
        {activeTab === 'description' && (
          <div className="prose max-w-none">
            {longDescription ? (
              <div dangerouslySetInnerHTML={{ __html: longDescription }} />
            ) : description ? (
              <p className="text-gray-700 leading-relaxed">{description}</p>
            ) : (
              <p className="text-gray-500">No description available.</p>
            )}
          </div>
        )}

        {activeTab === 'specifications' && (
          <div>
            {specifications && Object.keys(specifications).length > 0 ? (
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(specifications).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-100 pb-2">
                    <dt className="text-sm font-medium text-gray-600 mb-1">{key}</dt>
                    <dd className="text-sm text-gray-900">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-gray-500">No specifications available.</p>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            {reviews && reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < (review.rating || 0) ? 'fill-current' : 'text-gray-300'}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-medium">{review.customer_name || 'Customer'}</span>
                      <span className="text-xs text-gray-500 ml-2">{review.date || ''}</span>
                    </div>
                    <p className="text-gray-700">{review.content || review.review}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No reviews yet.</p>
                <p className="text-sm text-gray-400">Be the first to review this product!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}




