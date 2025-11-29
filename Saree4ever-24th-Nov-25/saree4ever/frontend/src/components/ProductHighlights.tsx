'use client';

interface ProductHighlightsProps {
  highlights: string[];
}

export default function ProductHighlights({ highlights }: ProductHighlightsProps) {
  if (!highlights || highlights.length === 0) return null;

  return (
    <div className="border-t border-gray-200 pt-6">
      <h3 className="font-semibold text-lg mb-4">Product Highlights</h3>
      <ul className="space-y-2">
        {highlights.map((highlight, index) => (
          <li key={index} className="flex items-start">
            <span className="text-green-600 mr-2 mt-1">✓</span>
            <span className="text-gray-700">{highlight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}




