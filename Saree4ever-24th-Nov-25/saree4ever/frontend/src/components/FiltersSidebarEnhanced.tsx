'use client';

import { useState, useEffect } from 'react';
import { useProductFilters } from '@/hooks/useProductFilters';
import { api } from '@/lib/api';

interface FiltersSidebarEnhancedProps {
  onFiltersChange?: () => void;
}

// Color definitions with hex values
const COLORS = [
  { name: 'Red', hex: '#DC2626' },
  { name: 'Maroon', hex: '#991B1B' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Navy', hex: '#1E3A8A' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Gold', hex: '#D97706' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Purple', hex: '#9333EA' },
  { name: 'Orange', hex: '#EA580C' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
  { value: 'popularity', label: 'Popularity' },
];

export default function FiltersSidebarEnhanced({ onFiltersChange }: FiltersSidebarEnhancedProps) {
  const { filters, updateFilters, clearFilters, toggleFilter, getActiveFilterCount } = useProductFilters();
  const [collections, setCollections] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      const [collectionsRes, categoriesRes, typesRes] = await Promise.all([
        api.collections.getAll(),
        api.categories.getAll(),
        api.types.getAll(),
      ]);
      
      setCollections((collectionsRes as any)?.collections || collectionsRes || []);
      setCategories((categoriesRes as any)?.categories || categoriesRes || []);
      setTypes((typesRes as any)?.types || typesRes || []);
    } catch (error) {
      console.error('Failed to load filter options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
    updateFilters({ [field]: value });
    onFiltersChange?.();
  };

  const handleSortChange = (value: string) => {
    updateFilters({ sortBy: value });
    onFiltersChange?.();
  };

  const activeCount = getActiveFilterCount();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Filters</h2>
        {activeCount > 0 && (
          <button
            onClick={() => {
              clearFilters();
              onFiltersChange?.();
            }}
            className="text-sm text-gray-600 hover:underline"
          >
            Clear All ({activeCount})
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <h3 className="font-medium mb-3 text-sm">Search</h3>
        <input
          type="text"
          placeholder="Search products..."
          value={filters.search || ''}
          onChange={(e) => {
            updateFilters({ search: e.target.value || undefined });
            onFiltersChange?.();
          }}
          className="input-field text-sm"
        />
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-medium mb-3 text-sm">Price Range (₹)</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => handlePriceChange('minPrice', e.target.value)}
            className="input-field w-full text-sm"
            min="0"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
            className="input-field w-full text-sm"
            min="0"
          />
        </div>
      </div>

      {/* Collections */}
      {!loading && collections.length > 0 && (
        <div>
          <h3 className="font-medium mb-3 text-sm">Collections</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {collections.map((collection) => (
              <label key={collection.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(filters.collections || []).includes(collection.slug)}
                  onChange={() => {
                    toggleFilter('collections', collection.slug);
                    onFiltersChange?.();
                  }}
                  className="w-4 h-4 border-black"
                />
                <span className="text-sm">{collection.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {!loading && categories.length > 0 && (
        <div>
          <h3 className="font-medium mb-3 text-sm">Categories</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(filters.categories || []).includes(category.slug)}
                  onChange={() => {
                    toggleFilter('categories', category.slug);
                    onFiltersChange?.();
                  }}
                  className="w-4 h-4 border-black"
                />
                <span className="text-sm">{category.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Types/Fabrics */}
      {!loading && types.length > 0 && (
        <div>
          <h3 className="font-medium mb-3 text-sm">Fabric / Type</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {types.map((type) => (
              <label key={type.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(filters.types || []).includes(type.slug)}
                  onChange={() => {
                    toggleFilter('types', type.slug);
                    onFiltersChange?.();
                  }}
                  className="w-4 h-4 border-black"
                />
                <span className="text-sm">{type.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      <div>
        <h3 className="font-medium mb-3 text-sm">Color</h3>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => {
                toggleFilter('colors', color.name.toLowerCase());
                onFiltersChange?.();
              }}
              className={`relative w-10 h-10 rounded border-2 transition-all ${
                (filters.colors || []).includes(color.name.toLowerCase())
                  ? 'border-black scale-110'
                  : 'border-gray-300 hover:border-black'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              {(filters.colors || []).includes(color.name.toLowerCase()) && (
                <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="font-medium mb-3 text-sm">Sort By</h3>
        <select
          value={filters.sortBy || 'newest'}
          onChange={(e) => handleSortChange(e.target.value)}
          className="input-field text-sm w-full"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Featured */}
      <div>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.featured || false}
            onChange={(e) => {
              updateFilters({ featured: e.target.checked || undefined });
              onFiltersChange?.();
            }}
            className="w-4 h-4 border-black"
          />
          <span className="text-sm font-medium">Featured Products Only</span>
        </label>
      </div>
    </div>
  );
}



