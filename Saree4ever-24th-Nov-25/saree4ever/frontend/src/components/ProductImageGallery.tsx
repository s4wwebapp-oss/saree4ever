'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  discountPercent?: number | null;
}

export default function ProductImageGallery({
  images,
  productName,
  discountPercent,
}: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center rounded-lg border border-gray-200">
        <svg
          className="w-24 h-24 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-gray-500 font-medium">Image Coming Soon</p>
        <p className="text-sm text-gray-400 mt-1">Product images will be available shortly</p>
      </div>
    );
  }

  const selectedImage = images[selectedImageIndex];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div 
        className="relative aspect-square overflow-hidden bg-gray-100 rounded-lg border border-gray-200 cursor-zoom-in group"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onClick={() => {
          // Open full screen image viewer (can be enhanced with a modal)
          window.open(selectedImage, '_blank');
        }}
      >
        <Image
          src={selectedImage}
          alt={`${productName} - Image ${selectedImageIndex + 1}`}
          fill
          className={`object-cover transition-transform duration-300 ${
            isZoomed ? 'scale-110' : 'scale-100'
          }`}
          priority={selectedImageIndex === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {discountPercent && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold z-10">
            {discountPercent}% OFF
          </div>
        )}
        {/* Zoom Indicator */}
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
          Click to view full size
        </div>
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.slice(0, 4).map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative aspect-square overflow-hidden bg-gray-100 rounded border-2 transition-all ${
                selectedImageIndex === index
                  ? 'border-black'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <Image
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 25vw, 12.5vw"
              />
            </button>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 4 && (
        <p className="text-xs text-gray-500 text-center">
          Showing {Math.min(4, images.length)} of {images.length} images
        </p>
      )}
    </div>
  );
}




