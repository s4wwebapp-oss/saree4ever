import Image from 'next/image';

interface Review {
  id: string;
  customer_name: string;
  customer_role: string | null;
  content: string;
  rating: number;
  image_url: string | null;
  created_at?: string;
}

interface ReviewsSectionProps {
  reviews: Review[];
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  if (reviews.length === 0) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="heading-serif-md mb-4">Customer Reviews</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See what our customers are saying about their experience with Saree4ever
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6"
            >
              {/* Header with profile picture and name */}
              <div className="flex items-start mb-4">
                {review.image_url ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0">
                    <Image
                      src={review.image_url}
                      alt={review.customer_name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 mr-4 flex-shrink-0 flex items-center justify-center">
                    <span className="text-gray-500 text-lg font-semibold">
                      {review.customer_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 mb-1 truncate">
                    {review.customer_name}
                  </h4>
                  {review.customer_role && (
                    <p className="text-sm text-gray-500 mb-2 truncate">
                      {review.customer_role}
                    </p>
                  )}
                  {/* Star Rating */}
                  <div className="flex items-center gap-0.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 fill-gray-300'
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  {/* Date */}
                  {review.created_at && (
                    <p className="text-xs text-gray-400">
                      {formatDate(review.created_at)}
                    </p>
                  )}
                </div>
              </div>

              {/* Review Content */}
              <div className="mt-4">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {review.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}





