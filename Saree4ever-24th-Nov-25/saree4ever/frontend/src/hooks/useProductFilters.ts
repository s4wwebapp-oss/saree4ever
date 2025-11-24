'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export interface ProductFilters {
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  collections?: string[];
  categories?: string[];
  types?: string[];
  colors?: string[];
  subcategories?: string[];
  sortBy?: string;
  featured?: boolean;
}

type UpdateFiltersInput = Partial<ProductFilters> & {
  selectedCollections?: string[];
  selectedCategories?: string[];
  selectedTypes?: string[];
  selectedColors?: string[];
  selectedSubcategories?: string[];
};

export function useProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Initialize filters from URL
  const getFiltersFromURL = useCallback((): ProductFilters => {
    const filters: ProductFilters = {};
    
    if (searchParams?.get('search')) filters.search = searchParams.get('search') || undefined;
    if (searchParams?.get('q')) filters.search = searchParams.get('q') || undefined;
    if (searchParams?.get('minPrice')) filters.minPrice = searchParams.get('minPrice') || undefined;
    if (searchParams?.get('maxPrice')) filters.maxPrice = searchParams.get('maxPrice') || undefined;
    if (searchParams?.get('collections')) {
      filters.collections = searchParams.get('collections')?.split(',').filter(Boolean) || [];
    }
    if (searchParams?.get('categories')) {
      filters.categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
    }
    if (searchParams?.get('types')) {
      filters.types = searchParams.get('types')?.split(',').filter(Boolean) || [];
    }
    if (searchParams?.get('colors')) {
      filters.colors = searchParams.get('colors')?.split(',').filter(Boolean) || [];
    }
    if (searchParams?.get('subcategories')) {
      filters.subcategories = searchParams.get('subcategories')?.split(',').filter(Boolean) || [];
    }
    if (searchParams?.get('sortBy')) {
      filters.sortBy = searchParams.get('sortBy') || undefined;
    }
    if (searchParams?.get('featured') === 'true') {
      filters.featured = true;
    }
    
    return filters;
  }, [searchParams]);
  
  const [filters, setFilters] = useState<ProductFilters>(getFiltersFromURL);
  
  // Update filters when URL changes
  useEffect(() => {
    setFilters(getFiltersFromURL());
  }, [searchParams, getFiltersFromURL]);
  
  // Update URL with new filters
  const updateFilters = useCallback((newFilters: UpdateFiltersInput) => {
    // Map "selected" prefixed properties to internal filter names
    const mappedFilters: Partial<ProductFilters> = {};
    
    // Copy standard filter properties
    if (newFilters.search !== undefined) mappedFilters.search = newFilters.search;
    if (newFilters.minPrice !== undefined) mappedFilters.minPrice = newFilters.minPrice;
    if (newFilters.maxPrice !== undefined) mappedFilters.maxPrice = newFilters.maxPrice;
    if (newFilters.sortBy !== undefined) mappedFilters.sortBy = newFilters.sortBy;
    if (newFilters.featured !== undefined) mappedFilters.featured = newFilters.featured;
    
    // Map "selected" prefixed properties to internal filter names
    if (newFilters.selectedCollections !== undefined) {
      mappedFilters.collections = newFilters.selectedCollections;
    } else if (newFilters.collections !== undefined) {
      mappedFilters.collections = newFilters.collections;
    }
    
    if (newFilters.selectedCategories !== undefined) {
      mappedFilters.categories = newFilters.selectedCategories;
    } else if (newFilters.categories !== undefined) {
      mappedFilters.categories = newFilters.categories;
    }
    
    if (newFilters.selectedTypes !== undefined) {
      mappedFilters.types = newFilters.selectedTypes;
    } else if (newFilters.types !== undefined) {
      mappedFilters.types = newFilters.types;
    }
    
    if (newFilters.selectedColors !== undefined) {
      mappedFilters.colors = newFilters.selectedColors;
    } else if (newFilters.colors !== undefined) {
      mappedFilters.colors = newFilters.colors;
    }
    
    if (newFilters.selectedSubcategories !== undefined) {
      mappedFilters.subcategories = newFilters.selectedSubcategories;
    } else if (newFilters.subcategories !== undefined) {
      mappedFilters.subcategories = newFilters.subcategories;
    }
    
    const updatedFilters = { ...filters, ...mappedFilters };
    setFilters(updatedFilters);
    
    const params = new URLSearchParams();
    
    if (updatedFilters.search) params.set('search', updatedFilters.search);
    if (updatedFilters.minPrice) params.set('minPrice', updatedFilters.minPrice);
    if (updatedFilters.maxPrice) params.set('maxPrice', updatedFilters.maxPrice);
    if (updatedFilters.collections && updatedFilters.collections.length > 0) {
      params.set('collections', updatedFilters.collections.join(','));
    }
    if (updatedFilters.categories && updatedFilters.categories.length > 0) {
      params.set('categories', updatedFilters.categories.join(','));
    }
    if (updatedFilters.types && updatedFilters.types.length > 0) {
      params.set('types', updatedFilters.types.join(','));
    }
    if (updatedFilters.colors && updatedFilters.colors.length > 0) {
      params.set('colors', updatedFilters.colors.join(','));
    }
    if (updatedFilters.subcategories && updatedFilters.subcategories.length > 0) {
      params.set('subcategories', updatedFilters.subcategories.join(','));
    }
    if (updatedFilters.sortBy) params.set('sortBy', updatedFilters.sortBy);
    if (updatedFilters.featured) params.set('featured', 'true');
    
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [filters, router, pathname]);
  
  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    router.push(pathname, { scroll: false });
  }, [router, pathname]);
  
  // Toggle array filter (collections, categories, types, colors)
  const toggleFilter = useCallback((filterKey: 'collections' | 'categories' | 'types' | 'colors' | 'subcategories', value: string) => {
    const currentArray = filters[filterKey] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    updateFilters({ [filterKey]: newArray });
  }, [filters, updateFilters]);
  
  // Get active filter count
  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.collections && filters.collections.length > 0) count++;
    if (filters.categories && filters.categories.length > 0) count++;
    if (filters.types && filters.types.length > 0) count++;
    if (filters.colors && filters.colors.length > 0) count++;
    if (filters.subcategories && filters.subcategories.length > 0) count++;
    if (filters.featured) count++;
    return count;
  }, [filters]);
  
  return {
    filters,
    // Individual filter properties for convenience (with safe defaults)
    search: filters.search,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    selectedCollections: filters.collections || [],
    selectedCategories: filters.categories || [],
    selectedTypes: filters.types || [],
    selectedColors: filters.colors || [],
    selectedSubcategories: filters.subcategories || [],
    sortBy: filters.sortBy,
    updateFilters,
    clearFilters,
    toggleFilter,
    getActiveFilterCount,
  };
}


