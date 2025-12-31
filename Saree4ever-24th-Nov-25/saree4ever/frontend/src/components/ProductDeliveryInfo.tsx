'use client';

export default function ProductDeliveryInfo() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="space-y-3">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="font-medium text-sm">Free Shipping</p>
            <p className="text-xs text-gray-600">Free shipping across India on all orders</p>
          </div>
        </div>
        <div className="flex items-start">
          <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium text-sm">Easy Returns</p>
            <p className="text-xs text-gray-600">7 days return policy</p>
          </div>
        </div>
        <div className="flex items-start">
          <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <p className="font-medium text-sm">Authentic Products</p>
            <p className="text-xs text-gray-600">100% authentic handwoven sarees</p>
          </div>
        </div>
      </div>
    </div>
  );
}




