'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { api } from '@/lib/api';

interface Variant {
  id: string;
  name: string;
  sku: string | null;
  price: number | null;
  compare_at_price: number | null;
  color: string | null;
  has_blouse: boolean;
  blouse_included: boolean;
  stock_quantity: number;
  track_inventory: boolean;
  image_url: string | null;
}

interface Product {
  id: string;
  name: string;
  primary_image_url: string | null;
  base_price: number | null | undefined;
}

interface ProductVariantSelectorProps {
  product: Product;
  variants: Variant[];
}

export default function ProductVariantSelector({
  product,
  variants,
}: ProductVariantSelectorProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [blouseIncluded, setBlouseIncluded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [availableStock, setAvailableStock] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();

  // Get unique colors from variants (handle undefined/null)
  const safeVariants = variants || [];
  const colors = Array.from(new Set(safeVariants.map((v) => v.color).filter(Boolean)));

  // Find matching variant when color/blouse changes
  useEffect(() => {
    const variant = safeVariants.find(
      (v) => v.color === selectedColor && v.blouse_included === blouseIncluded
    );
    setSelectedVariant(variant || null);
  }, [selectedColor, blouseIncluded, variants]);

  // Fetch available stock when variant changes
  useEffect(() => {
    if (selectedVariant) {
      setLoading(true);
      api.inventory
        .getAvailable(selectedVariant.id)
        .then((response: any) => {
          setAvailableStock(response.available_stock || selectedVariant.stock_quantity);
        })
        .catch(() => {
          setAvailableStock(selectedVariant.stock_quantity);
        })
        .finally(() => setLoading(false));
    } else {
      setAvailableStock(null);
    }
  }, [selectedVariant]);

  // Auto-select first color if none selected
  useEffect(() => {
    if (!selectedColor && colors.length > 0) {
      setSelectedColor(colors[0] as string);
    }
  }, [selectedColor, colors]);

  const handleAddToCart = () => {
    if (!selectedVariant || !availableStock || availableStock < quantity) {
      return;
    }

    const price = selectedVariant.price || product.base_price || 0;
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      quantity,
      price,
      image: selectedVariant.image_url || product.primary_image_url || '',
      title: product.name,
      variantName: selectedVariant.name,
      color: selectedVariant.color || undefined,
      hasBlouse: selectedVariant.blouse_included,
    });

    // Show success message (you can add a toast notification here)
    alert('Added to cart!');
  };

  const displayPrice = selectedVariant?.price || product.base_price || 0;
  const displayComparePrice = selectedVariant?.compare_at_price || null;
  const isOutOfStock = availableStock !== null && availableStock === 0;
  const isLowStock = availableStock !== null && availableStock > 0 && availableStock < 5;
  const canAddToCart = selectedVariant && availableStock !== null && availableStock >= quantity;

  return (
    <div className="space-y-6">
      {/* Color Selection */}
      {colors.length > 0 && (
        <div>
          <label className="block font-medium mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-4 py-2 border-2 ${
                  selectedColor === color
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 hover:border-black'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Blouse Option */}
      {safeVariants.some((v) => v.has_blouse) && (
        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={blouseIncluded}
              onChange={(e) => setBlouseIncluded(e.target.checked)}
              className="w-4 h-4 border-black"
            />
            <span className="font-medium">Include Blouse</span>
          </label>
        </div>
      )}

      {/* Selected Variant Info */}
      {selectedVariant && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Selected: {selectedVariant.name}</p>
              {selectedVariant.sku && (
                <p className="text-xs text-gray-500">SKU: {selectedVariant.sku}</p>
              )}
            </div>
            <div className="text-right">
              {displayPrice > 0 ? (
                <span className="text-xl font-semibold">₹{displayPrice.toLocaleString()}</span>
              ) : (
                <span className="text-xl font-semibold text-gray-500">Price not available</span>
              )}
              {displayComparePrice && displayPrice > 0 && displayComparePrice > displayPrice && (
                <span className="block text-sm text-gray-500 line-through">
                  ₹{displayComparePrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Stock Status */}
          {loading ? (
            <p className="text-sm text-gray-600">Checking stock...</p>
          ) : availableStock !== null ? (
            <div className="mb-4">
              {isOutOfStock ? (
                <p className="text-sm text-red-600 font-medium">Out of Stock</p>
              ) : isLowStock ? (
                <p className="text-sm text-orange-600 font-medium">
                  Only {availableStock} left in stock
                </p>
              ) : (
                <p className="text-sm text-green-600 font-medium">In Stock</p>
              )}
            </div>
          ) : null}

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4 mb-4">
            <label className="font-medium">Quantity</label>
            <div className="flex items-center border border-black">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                −
              </button>
              <span className="px-4 py-1 min-w-[3rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(availableStock || 1, quantity + 1))}
                disabled={!availableStock || quantity >= availableStock}
                className="px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className={`w-full py-3 font-medium ${
              canAddToCart
                ? 'btn-primary'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      )}

      {!selectedVariant && (
        <p className="text-sm text-gray-600">Please select a color to continue</p>
      )}
    </div>
  );
}

