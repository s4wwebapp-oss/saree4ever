import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

interface Offer {
  id: string;
  name: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  start_date: string;
  end_date: string;
}

async function getActiveOffers(): Promise<Offer[]> {
  try {
    const response = await api.offers.getActive();
    return (response as { offers?: Offer[] }).offers || (response as Offer[]) || [];
  } catch (error) {
    console.error('Error fetching offers:', error);
    return [];
  }
}

export default async function OffersPage() {
  const offers = await getActiveOffers();

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="heading-serif-md mb-4">Special Offers</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our latest deals and discounts
          </p>
        </div>

        {offers.length > 0 ? (
          <div className="space-y-8">
            {offers.map((offer) => (
              <div key={offer.id} className="border border-black p-6">
                <h2 className="heading-serif-sm mb-2">{offer.name}</h2>
                {offer.description && (
                  <p className="text-gray-700 mb-4">{offer.description}</p>
                )}
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-semibold">
                    {offer.discount_type === 'percentage'
                      ? `${offer.discount_value}% OFF`
                      : `₹${offer.discount_value} OFF`}
                  </span>
                  <span className="text-sm text-gray-600">
                    Valid until {new Date(offer.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-8">No active offers at the moment.</p>
            <Link href="/collections" className="btn-primary">
              Browse Collections
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

