'use client';

import { useState } from 'react';

export default function FiltersSidebar() {
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const types = ['Kanjivaram', 'Banarasi', 'Silk', 'Cotton', 'Chiffon'];
  const colors = ['Red', 'Maroon', 'Blue', 'Green', 'Gold', 'Pink'];

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-lg">Filters</h2>

      {/* Price Range */}
      <div>
        <h3 className="font-medium mb-3">Price Range</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
            className="input-field w-full text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            className="input-field w-full text-sm"
          />
        </div>
      </div>

      {/* Fabric/Type */}
      <div>
        <h3 className="font-medium mb-3">Fabric / Type</h3>
        <div className="space-y-2">
          {types.map((type) => (
            <label key={type} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => toggleType(type)}
                className="w-4 h-4 border-black"
              />
              <span className="text-sm">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <h3 className="font-medium mb-3">Color</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => toggleColor(color)}
              className={`px-3 py-1 text-sm border ${
                selectedColors.includes(color)
                  ? 'bg-black text-white border-black'
                  : 'border-gray-300 hover:border-black'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {(priceRange.min || priceRange.max || selectedTypes.length > 0 || selectedColors.length > 0) && (
        <button
          onClick={() => {
            setPriceRange({ min: '', max: '' });
            setSelectedTypes([]);
            setSelectedColors([]);
          }}
          className="btn-outline w-full text-sm"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

