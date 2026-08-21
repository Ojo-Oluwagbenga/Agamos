import {
  AuthTokens,
  User,
  ServiceCategory,
  Service,
  ProductCategory,
  Product,
  Order,
  SiteSetting,
  Testimonial,
  DashboardMetrics,
  Booking,
  AvailabilityResult,
  BusinessHours,
  DateOverride,
  BlockedSlot,
  InventoryTransaction
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('agamos_access_token');
  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !endpoint.includes('/accounts/login/')) {
    const refreshToken = localStorage.getItem('agamos_refresh_token');
    if (refreshToken && !endpoint.includes('/token/refresh/')) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/accounts/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem('agamos_access_token', data.access);
          (headers as Record<string, string>)['Authorization'] = `Bearer ${data.access}`;
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
          if (!retryResponse.ok) {
            const errData = await retryResponse.json().catch(() => ({}));
            throw new Error(errData.detail || errData.message || 'Request failed after refresh');
          }
          return retryResponse.json();
        }
      } catch {
        localStorage.removeItem('agamos_access_token');
        localStorage.removeItem('agamos_refresh_token');
      }
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.detail ||
      errorData.message ||
      (typeof errorData === 'object' ? Object.values(errorData).flat().join(', ') : 'Network error');
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

async function requestList<T>(endpoint: string, options: RequestInit = {}): Promise<T[]> {
  const data = await request<any>(endpoint, options);
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

export const api = {
  // 1. Authentication
  auth: {
    login: (credentials: any) => request<{ access: string; refresh: string; user: User }>('/accounts/login/', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData: any) => request<{ tokens: AuthTokens; user: User }>('/accounts/register/', { method: 'POST', body: JSON.stringify(userData) }),
    googleLogin: (credential: string) => request<{ tokens: AuthTokens; user: User }>('/accounts/google/', { method: 'POST', body: JSON.stringify({ credential }) }),
    getProfile: () => request<User>('/accounts/profile/'),
    updateProfile: (data: any) => request<User>('/accounts/profile/', { method: 'PATCH', body: JSON.stringify(data) }),
    forgotPassword: (email: string) => request<{ detail: string }>('/accounts/forgot-password/', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (data: any) => request<{ detail: string }>('/accounts/reset-password/', { method: 'POST', body: JSON.stringify(data) }),
  },

  // 2. Services Catalog
  services: {
    getCategories: () => requestList<ServiceCategory>('/services/categories/'),
    list: (params?: { category?: string; featured?: boolean; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.featured) query.append('featured', 'true');
      if (params?.search) query.append('search', params.search);
      return requestList<Service>(`/services/?${query.toString()}`);
    },
    getBySlug: (slug: string) => request<Service>(`/services/${slug}/`),
  },

  // 3. Dynamic Availability
  availability: {
    getSlots: (serviceId: number, date: string) => request<AvailabilityResult>(`/availability/slots/?service_id=${serviceId}&date=${date}`),
    getWeeklyHours: () => requestList<BusinessHours>('/admin/weekly-availability/'),
    updateBusinessHour: (id: number, data: any) => request<BusinessHours>(`/admin/weekly-availability/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    getDateOverrides: () => requestList<DateOverride>('/admin/date-overrides/'),
    createDateOverride: (data: any) => request<DateOverride>('/admin/date-overrides/', { method: 'POST', body: JSON.stringify(data) }),
    deleteDateOverride: (id: number) => request<void>(`/admin/date-overrides/${id}/`, { method: 'DELETE' }),
    getBlockedSlots: () => requestList<BlockedSlot>('/admin/blocked-slots/'),
    createBlockedSlot: (data: any) => request<BlockedSlot>('/admin/blocked-slots/', { method: 'POST', body: JSON.stringify(data) }),
    deleteBlockedSlot: (id: number) => request<void>(`/admin/blocked-slots/${id}/`, { method: 'DELETE' }),
  },

  // 4. Bookings Engine
  bookings: {
    initiate: (data: any) => request<{ booking: Booking; payment: any }>('/bookings/initiate/', { method: 'POST', body: JSON.stringify(data) }),
    getByRef: (reference: string) => request<Booking>(`/bookings/${reference}/`),
    getMyBookings: () => requestList<Booking>('/bookings/my-bookings/'),
    cancel: (reference: string, reason?: string) => request<{ detail: string }>(`/bookings/${reference}/cancel/`, { method: 'POST', body: JSON.stringify({ reason }) }),
  },

  // 5. Products Catalog
  products: {
    getCategories: () => requestList<ProductCategory>('/products/categories/'),
    list: (params?: { category?: string; featured?: boolean; session_product?: boolean; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.featured) query.append('featured', 'true');
      if (params?.session_product) query.append('session_product', 'true');
      if (params?.search) query.append('search', params.search);
      return requestList<Product>(`/products/?${query.toString()}`);
    },
    getBySlug: (slug: string) => request<Product>(`/products/${slug}/`),
  },

  // 6. Orders & Cart
  orders: {
    getCart: () => request<any>('/orders/cart/'),
    addToCart: (productId: number, quantity: number = 1) => request<any>('/orders/cart/', { method: 'POST', body: JSON.stringify({ product_id: productId, quantity }) }),
    removeFromCart: (itemId?: number) => request<any>('/orders/cart/', { method: 'DELETE', body: JSON.stringify({ item_id: itemId }) }),
    checkout: (orderData: any) => request<{ order: Order; payment: any }>('/orders/checkout/', { method: 'POST', body: JSON.stringify(orderData) }),
    getByRef: (reference: string) => request<Order>(`/orders/${reference}/`),
    getMyOrders: () => requestList<Order>('/orders/my-orders/'),
  },

  // 7. Payments
  payments: {
    verify: (reference: string) => request<{ status: string; payment_type: string; booking_reference?: string; order_reference?: string; message: string }>(`/payments/verify/${reference}/`),
  },

  // 8. QR Scanner
  qr: {
    verifyAndAttend: (token: string) => request<{ success: boolean; status: string; message: string; booking: any }>('/qr/verify-and-attend/', { method: 'POST', body: JSON.stringify({ token }) }),
    getStatus: (token: string) => request<any>(`/qr/status/${token}/`),
  },

  // 9. CMS
  cms: {
    getOverview: () => request<{ settings: SiteSetting; testimonials: Testimonial[] }>('/cms/content/'),
    getSettings: () => request<SiteSetting>('/cms/settings/'),
    updateSettings: (data: Partial<SiteSetting>) => request<SiteSetting>('/admin/cms/settings/', { method: 'PUT', body: JSON.stringify(data) }),
  },

  // 10. Admin Portal
  admin: {
    getMetrics: () => request<{ metrics: DashboardMetrics; today_agenda: Booking[]; recent_bookings: Booking[]; recent_orders: Order[]; low_stock_items: Product[] }>('/admin/metrics/'),
    
    // Services CRUD
    getServices: () => requestList<Service>('/admin/services/'),
    createService: (data: any) => request<Service>('/admin/services/', { method: 'POST', body: JSON.stringify(data) }),
    updateService: (id: number, data: any) => request<Service>(`/admin/services/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteService: (id: number) => request<void>(`/admin/services/${id}/`, { method: 'DELETE' }),

    // Categories CRUD
    getCategories: () => requestList<ServiceCategory>('/admin/service-categories/'),
    createCategory: (data: any) => request<ServiceCategory>('/admin/service-categories/', { method: 'POST', body: JSON.stringify(data) }),
    updateCategory: (id: number, data: any) => request<ServiceCategory>(`/admin/service-categories/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),

    // Bookings Oversight
    getBookings: (params?: { status?: string; date?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.date) query.append('date', params.date);
      if (params?.search) query.append('search', params.search);
      return requestList<Booking>(`/admin/bookings/?${query.toString()}`);
    },
    listBookings: (params?: { status?: string; date?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.date) query.append('date', params.date);
      if (params?.search) query.append('search', params.search);
      return requestList<Booking>(`/admin/bookings/?${query.toString()}`);
    },
    updateBooking: (id: string, data: any) => request<Booking>(`/admin/bookings/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),

    // Products CRUD
    getProducts: () => requestList<Product>('/admin/products/'),
    createProduct: (data: any) => request<Product>('/admin/products/', { method: 'POST', body: JSON.stringify(data) }),
    updateProduct: (id: number, data: any) => request<Product>(`/admin/products/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    uploadProductImage: (id: number, file: File, isPrimary: boolean = true) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('is_primary', isPrimary ? 'true' : 'false');
      return request<Product>(`/admin/products/${id}/upload_image/`, {
        method: 'POST',
        body: formData,
      });
    },
    deleteProduct: (id: number) => request<void>(`/admin/products/${id}/`, { method: 'DELETE' }),

    // Inventory
    getInventoryOverview: () => requestList<Product>('/admin/inventory/overview/'),
    getInventoryTransactions: () => requestList<InventoryTransaction>('/admin/inventory/transactions/'),
    adjustInventory: (data: { product_id: number; quantity_delta: number; transaction_type?: string; reason: string }) => request<any>('/admin/inventory/adjust/', { method: 'POST', body: JSON.stringify(data) }),

    // Orders
    getOrders: (params?: { status?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      return requestList<Order>(`/admin/orders/?${query.toString()}`);
    },
    listOrders: (params?: { status?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      return requestList<Order>(`/admin/orders/?${query.toString()}`);
    },
    updateOrder: (id: string, data: any) => request<Order>(`/admin/orders/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  // 11. Inventory Direct Aliases
  inventory: {
    getOverview: () => requestList<Product>('/admin/inventory/overview/'),
    getTransactions: () => requestList<InventoryTransaction>('/admin/inventory/transactions/'),
    adjustStock: (data: { product_id: number; quantity_change: number; transaction_type?: string; notes: string }) =>
      request<any>('/admin/inventory/adjust/', {
        method: 'POST',
        body: JSON.stringify({
          product_id: data.product_id,
          quantity_delta: data.quantity_change,
          transaction_type: data.transaction_type,
          reason: data.notes,
        }),
      }),
  },
};
