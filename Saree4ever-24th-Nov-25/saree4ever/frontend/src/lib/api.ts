const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const DEFAULT_TIMEOUT = 10000; // 10 seconds

export interface ApiError {
  error: string;
  message?: string;
}

const isBrowser = typeof window !== 'undefined';

/**
 * Generic fetch wrapper with auth + error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const controller =
    !options.signal && typeof AbortController !== 'undefined'
      ? new AbortController()
      : undefined;

  // Convert headers to a record for easier manipulation
  const headersRecord: Record<string, string> = {};
  
  // Copy existing headers
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headersRecord[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headersRecord[key] = value;
      });
    } else {
      Object.assign(headersRecord, options.headers);
    }
  }

  // Only set JSON content-type when body isn't FormData
  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headersRecord['Content-Type']) {
    headersRecord['Content-Type'] = 'application/json';
  }

  // Attach auth token if running in browser
  if (isBrowser) {
    // Check for token in localStorage
    const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
    
    if (token) {
      headersRecord['Authorization'] = `Bearer ${token}`;
    }
  }

  const headers: HeadersInit = headersRecord;

  const config: RequestInit = {
    ...options,
    headers,
    signal: options.signal || controller?.signal,
    cache: 'force-cache', // Enable cache for static generation
    next: { revalidate: 3600 }, // Revalidate every hour
  };

  if (controller) {
    setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorBody: ApiError = await response
        .json()
        .catch(() => ({ error: `HTTP ${response.status}` }));
      const message =
        errorBody.error || errorBody.message || response.statusText;
      throw new Error(message);
    }

    // Some responses may have no body (204)
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (error: any) {
    // Handle network errors (fetch failed, connection refused, etc.)
    if (error?.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out`);
    }
    if (error?.message?.includes('fetch failed') || error?.message?.includes('Failed to fetch')) {
      // Network error - backend might not be running
      // Log warning but don't throw - let the calling code handle with fallback
      console.warn(`Network error fetching ${url}. Backend may not be running. Using fallback data.`);
      // Return a rejected promise so calling code can catch and use fallback
      return Promise.reject(new Error(`Unable to connect to server. Please ensure the backend is running.`));
    }
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
      console.warn(`Connection error to ${url}. Using fallback data.`);
      return Promise.reject(new Error(`Cannot connect to ${url}. Please check your network connection.`));
    }
    throw error;
  }
}

export async function get<T>(endpoint: string): Promise<T> {
  return fetchAPI<T>(endpoint, { method: 'GET' });
}

export async function post<T>(endpoint: string, data?: unknown): Promise<T> {
  const body = data instanceof FormData ? data : data ? JSON.stringify(data) : undefined;
  return fetchAPI<T>(endpoint, {
    method: 'POST',
    body,
  });
}

export async function put<T>(endpoint: string, data?: unknown): Promise<T> {
  return fetchAPI<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function patch<T>(endpoint: string, data?: unknown): Promise<T> {
  return fetchAPI<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function del<T>(endpoint: string): Promise<T> {
  return fetchAPI<T>(endpoint, { method: 'DELETE' });
}

const buildProductQuery = (params: Record<string, any> = {}) => {
  const query = new URLSearchParams();

  const appendList = (key: string, value?: string | string[]) => {
    if (!value) return;
    const values = Array.isArray(value) ? value : [value];
    if (values.length > 0) {
      query.append(key, values.join(','));
    }
  };

  if (params.featured) query.append('featured', 'true');
  ['collection', 'category', 'type', 'search', 'sortBy'].forEach((key) => {
    if (params[key]) query.append(key, String(params[key]));
  });
  appendList('collections', params.collections);
  appendList('categories', params.categories);
  appendList('types', params.types);
  appendList('colors', params.colors);
  appendList('subcategories', params.subcategories);
  if (params.minPrice !== undefined) query.append('minPrice', String(params.minPrice));
  if (params.maxPrice !== undefined) query.append('maxPrice', String(params.maxPrice));
  if (params.active !== undefined) query.append('active', String(params.active));
  if (params.limit !== undefined) query.append('limit', String(params.limit));
  if (params.offset !== undefined) query.append('offset', String(params.offset));

  return query.toString();
};

export const api = {
  // Auth
  auth: {
    signup: (data: unknown) => post('/auth/signup', data),
    signin: (data: unknown) => post('/auth/signin', data),
    adminSignin: (data: unknown) => post('/auth/admin/signin', data),
    signout: () => post('/auth/signout'),
    getCurrentUser: () => get('/auth/me'),
    checkNewUserDiscount: () => get('/auth/new-user-discount'),
  },

  // Products
  products: {
    getAll: (params?: Record<string, any>) => {
      // Add admin=true for admin requests (when token is present)
      // Only check localStorage in browser environment (client-side)
      const adminParams = { ...params };
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
        if (token) {
          adminParams.admin = 'true';
        }
      }
      const query = buildProductQuery(adminParams);
      return get(`/products${query ? `?${query}` : ''}`);
    },
    getBySlug: (slug: string) => get(`/products/${slug}`),
    getById: (id: string) => get(`/products/id/${id}`),
    create: (data: unknown) => post('/products', data),
    update: (id: string, data: unknown) => put(`/products/${id}`, data),
    delete: (id: string) => del(`/products/${id}`),
  },

  // Collections
  collections: {
    getAll: () => get('/collections'),
    // Admin endpoints
    getById: (id: string) => get(`/collections/${id}`),
    create: (data: unknown) => post('/collections', data),
    update: (id: string, data: unknown) => put(`/collections/${id}`, data),
    delete: (id: string) => del(`/collections/${id}`),
  },

  // Categories
  categories: {
    getAll: () => get('/categories'),
    getBySlug: (slug: string) => get(`/categories/${slug}`),
    create: (data: unknown) => post('/categories', data),
    update: (id: string, data: unknown) => put(`/categories/${id}`, data),
    delete: (id: string) => del(`/categories/${id}`),
  },

  // Types
  types: {
    getAll: () => get('/types'),
    getBySlug: (slug: string) => get(`/types/${slug}`),
    create: (data: unknown) => post('/types', data),
    update: (id: string, data: unknown) => put(`/types/${id}`, data),
    delete: (id: string) => del(`/types/${id}`),
  },

  // Inventory
  inventory: {
    getAvailable: (variantId: string) => get(`/inventory/available/${variantId}`),
    reserve: (data: unknown) => post('/inventory/reserve', data),
    commit: (data: unknown) => post('/inventory/commit', data),
    release: (data: unknown) => post('/inventory/release', data),
    getStockLevels: (threshold?: number) =>
      get(`/inventory/stock-levels${threshold ? `?threshold=${threshold}` : ''}`),
    getAdjustments: (params?: { variant_id?: string; product_id?: string; limit?: number; offset?: number }) => {
      const query = new URLSearchParams();
      if (params?.variant_id) query.append('variant_id', params.variant_id);
      if (params?.product_id) query.append('product_id', params.product_id);
      if (params?.limit) query.append('limit', String(params.limit));
      if (params?.offset) query.append('offset', String(params.offset));
      return get(`/inventory/adjustments${query.toString() ? `?${query}` : ''}`);
    },
    adjust: (data: {
      variant_id: string;
      quantity_change: number;
      type: string;
      notes?: string;
      reference_number?: string;
    }) => post('/inventory/adjust', data),
    getHistory: (variantId: string) => get(`/inventory/history/${variantId}`),
  },

  // CSV Import
  csv: {
    importProducts: (formData: FormData) =>
      fetchAPI('/csv-import/products', {
        method: 'POST',
        body: formData,
      }),
    importVariants: (formData: FormData) =>
      fetchAPI('/csv-import/variants', {
        method: 'POST',
        body: formData,
      }),
    importStock: (formData: FormData) =>
      fetchAPI('/csv-import/stock', {
        method: 'POST',
        body: formData,
      }),
    getHistory: () => get('/csv-import/history'),
  },

  // Orders
  orders: {
    create: (data: unknown) => post('/orders', data),
    getByNumber: (orderNumber: string) => get(`/orders/${orderNumber}`),
    getById: (id: string) => get(`/orders/id/${id}`),
    getUserOrders: () => get('/orders'),
    cancel: (id: string) => post(`/orders/${id}/cancel`),
    // Admin endpoints
    getAll: () => get('/orders/admin/all'),
    getStats: () => get('/orders/admin/stats'),
    updateStatus: (id: string, status: string) => patch(`/orders/${id}/status`, { status }),
    updatePaymentStatus: (id: string, payment_status: string) =>
      patch(`/orders/${id}/payment`, { payment_status }),
    ship: (id: string, data: { tracking_number: string; carrier: string; tracking_url?: string }) =>
      post(`/orders/${id}/ship`, {
        tracking_number: data.tracking_number,
        courier_name: data.carrier,
        tracking_url: data.tracking_url,
      }),
    deliver: (id: string) => post(`/orders/${id}/deliver`),
  },

  // Variants
  variants: {
    getByProduct: (productId: string) => get(`/variants/product/${productId}`),
    getById: (id: string) => get(`/variants/${id}`),
    // Admin endpoints
    create: (data: unknown) => post('/variants', data),
    update: (id: string, data: unknown) => put(`/variants/${id}`, data),
    delete: (id: string) => del(`/variants/${id}`),
    updateStock: (id: string, stock_quantity: number) => patch(`/variants/${id}/stock`, { stock_quantity }),
  },

  // Shipments
  shipments: {
    getByOrder: (orderId: string) => get(`/shipments/order/${orderId}`),
    getById: (id: string) => get(`/shipments/${id}`),
    // Admin endpoints
    create: (data: unknown) => post('/shipments', data),
    update: (id: string, data: unknown) => put(`/shipments/${id}`, data),
    updateTracking: (id: string, data: { tracking_number: string; courier_name: string; tracking_url?: string }) =>
      patch(`/shipments/${id}/tracking`, data),
    updateStatus: (id: string, data: { status: string; estimated_delivery_date?: string; delivered_at?: string }) =>
      patch(`/shipments/${id}/status`, data),
  },

  // Offers
  offers: {
    getActive: () => get('/offers/active'),
    getById: (id: string) => get(`/offers/${id}`),
    // Admin endpoints
    getAll: (params?: { limit?: number; offset?: number }) => {
      const query = new URLSearchParams();
      if (params?.limit) query.append('limit', String(params.limit));
      if (params?.offset) query.append('offset', String(params.offset));
      return get(`/offers${query.toString() ? `?${query}` : ''}`);
    },
    create: (data: unknown) => post('/offers', data),
    update: (id: string, data: unknown) => put(`/offers/${id}`, data),
    delete: (id: string) => del(`/offers/${id}`),
    updateStatus: (id: string, is_active: boolean) => patch(`/offers/${id}/status`, { is_active }),
  },

  // Audit
  audit: {
    getLogs: (params?: {
      actor_id?: string;
      action?: string;
      resource_type?: string;
      resource_id?: string;
      start_date?: string;
      end_date?: string;
      limit?: number;
      offset?: number;
    }) => {
      const query = new URLSearchParams();
      if (params?.actor_id) query.append('actor_id', params.actor_id);
      if (params?.action) query.append('action', params.action);
      if (params?.resource_type) query.append('resource_type', params.resource_type);
      if (params?.resource_id) query.append('resource_id', params.resource_id);
      if (params?.start_date) query.append('start_date', params.start_date);
      if (params?.end_date) query.append('end_date', params.end_date);
      if (params?.limit) query.append('limit', String(params.limit));
      if (params?.offset) query.append('offset', String(params.offset));
      return get(`/audit/logs${query.toString() ? `?${query}` : ''}`);
    },
    getImports: () => get('/csv-import/history'),
  },

  // Menu Config
  menuConfig: {
    getAll: () => get('/menu-config'),
    getByType: (menuType: string) => get(`/menu-config/${menuType}`),
    update: (menuType: string, data: { column_1_title: string; column_2_title: string; column_3_title: string }) =>
      put(`/menu-config/${menuType}`, data),
  },

  // Blog
  blog: {
    getAll: (params?: { limit?: number; offset?: number; category?: string; featured?: boolean; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.limit) query.append('limit', String(params.limit));
      if (params?.offset) query.append('offset', String(params.offset));
      if (params?.category) query.append('category', params.category);
      if (params?.featured !== undefined) query.append('featured', String(params.featured));
      if (params?.search) query.append('search', params.search);
      return get(`/blog?${query.toString()}`);
    },
    getBySlug: (slug: string) => get(`/blog/${slug}`),
    getCategories: () => get('/blog/categories'),
    // Admin endpoints
    getAllAdmin: (params?: { limit?: number; offset?: number; status?: string; category?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.limit) query.append('limit', String(params.limit));
      if (params?.offset) query.append('offset', String(params.offset));
      if (params?.status) query.append('status', params.status);
      if (params?.category) query.append('category', params.category);
      if (params?.search) query.append('search', params.search);
      return get(`/blog/admin/all?${query.toString()}`);
    },
    getById: (id: string) => get(`/blog/admin/${id}`),
    create: (data: unknown) => post('/blog/admin', data),
    update: (id: string, data: unknown) => put(`/blog/admin/${id}`, data),
    delete: (id: string) => del(`/blog/admin/${id}`),
  },

  // Announcement Bar
  announcement: {
    getActive: () => get('/announcement/active'),
    // Admin endpoints
    getAll: () => get('/announcement'),
    getById: (id: string) => get(`/announcement/${id}`),
    create: (data: unknown) => post('/announcement', data),
    update: (id: string, data: unknown) => put(`/announcement/${id}`, data),
    delete: (id: string) => del(`/announcement/${id}`),
  },

  // Hero Slides
  heroSlides: {
    getActive: () => get('/hero-slides/active'),
    // Admin endpoints
    getAll: () => get('/hero-slides'),
    getById: (id: string) => get(`/hero-slides/${id}`),
    create: (data: unknown) => post('/hero-slides', data),
    update: (id: string, data: unknown) => put(`/hero-slides/${id}`, data),
    delete: (id: string) => del(`/hero-slides/${id}`),
    reorder: (slideOrders: Array<{ id: string; display_order: number }>) => post('/hero-slides/reorder', { slideOrders }),
  },

  testimonials: {
    getActive: () => get('/testimonials/active').catch(() => ({ testimonials: [] })),
    getAll: () => get('/testimonials').catch(() => ({ testimonials: [] })),
    create: (data: unknown) => post('/testimonials', data),
    update: (id: string, data: unknown) => put(`/testimonials/${id}`, data),
    delete: (id: string) => del(`/testimonials/${id}`),
  },

  landingPageVideo: {
    getActive: () => get('/landing-page-video/active').catch(() => ({ videos: [] })),
    getAll: () => get('/landing-page-video').catch(() => ({ videos: [] })),
    getById: (id: string) => get(`/landing-page-video/${id}`),
    create: (data: unknown) => post('/landing-page-video', data),
    update: (id: string, data: unknown) => put(`/landing-page-video/${id}`, data),
    delete: (id: string) => del(`/landing-page-video/${id}`),
    reorder: (videoOrders: Array<{ id: string; display_order: number }>) => 
      post('/landing-page-video/reorder', { videoOrders }),
  },

  landingPageSections: {
    getVisibility: () => get('/landing-page-sections/visibility').catch(() => ({ visibility: {} })),
    getAll: () => get('/landing-page-sections'),
    updateVisibility: (sectionKey: string, isVisible: boolean) => 
      put('/landing-page-sections/visibility', { section_key: sectionKey, is_visible: isVisible }),
    bulkUpdateVisibility: (updates: Array<{ section_key: string; is_visible: boolean }>) => 
      put('/landing-page-sections/visibility/bulk', { updates }),
  },

  socialMediaSettings: {
    getVisibleLinks: () => get('/social-media-settings/links').catch(() => ({ links: [] })),
    getAll: () => get('/social-media-settings'),
    updateSetting: (platform: string, data: { url?: string; is_visible?: boolean; display_order?: number }) => 
      put(`/social-media-settings/${platform}`, data),
    bulkUpdate: (updates: Array<{ platform: string; url?: string; is_visible?: boolean; display_order?: number }>) => 
      put('/social-media-settings/bulk/update', { updates }),
  },

  comingSoon: {
    getSettings: () => get('/coming-soon/settings').catch(() => ({ settings: { is_enabled: false } })),
    updateSettings: (data: { is_enabled?: boolean; title?: string; subtitle?: string }) => 
      put('/coming-soon/settings', data),
    getMedia: () => get('/coming-soon/media').catch(() => ({ media: [] })),
    getAllMedia: () => get('/coming-soon/media/all'),
    createMedia: (data: unknown) => post('/coming-soon/media', data),
    updateMedia: (id: string, data: unknown) => put(`/coming-soon/media/${id}`, data),
    deleteMedia: (id: string) => del(`/coming-soon/media/${id}`),
    reorderMedia: (mediaOrders: Array<{ id: string; display_order: number }>) => 
      put('/coming-soon/media/reorder', { mediaOrders }),
  },
};

export default api;
