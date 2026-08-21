export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  profile?: CustomerProfile;
  date_joined: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface CustomerProfile {
  phone?: string;
  address?: string;
  is_suspended_from_booking: boolean;
  no_show_count: number;
  notes?: string;
  avatar?: string;
}

export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  display_order: number;
  is_active: boolean;
  services_count?: number;
}

export interface Service {
  id: number;
  category: number;
  category_name?: string;
  category_slug?: string;
  name: string;
  slug: string;
  short_description: string;
  full_description: string;
  price: string | number;
  duration_minutes: number;
  buffer_time_minutes: number;
  image?: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  duration_minutes: number;
  available_capacity: number;
}

export interface AvailabilityResult {
  is_open: boolean;
  reason?: string;
  date: string;
  service_id: number;
  service_name: string;
  price: string;
  slots: TimeSlot[];
}

export interface BusinessHours {
  id: number;
  weekday: number;
  weekday_display: string;
  open_time: string;
  close_time: string;
  is_closed: boolean;
  max_concurrent_capacity: number;
}

export interface DateOverride {
  id: number;
  date: string;
  open_time?: string | null;
  close_time?: string | null;
  is_closed: boolean;
  reason: string;
}

export interface BlockedSlot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
}

export interface BookingQRCode {
  id: number;
  secure_token: string;
  qr_image?: string;
  is_used: boolean;
  scanned_at?: string;
  created_at: string;
}

export interface BookingItemProduct {
  id: number;
  product: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: string | number;
}

export interface Booking {
  id: string;
  booking_reference: string;
  user?: number | null;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  guest_address?: string;
  service: Service;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'PENDING' | 'PAID' | 'CONFIRMED' | 'ATTENDED' | 'CANCELLED' | 'NO_SHOW' | 'COMPLETED';
  status_display: string;
  payment_status: 'UNPAID' | 'PAID' | 'REFUNDED';
  payment_status_display: string;
  service_price: string | number;
  product_addon_total: string | number;
  total_amount: string | number;
  customer_notes?: string;
  admin_notes?: string;
  session_products: BookingItemProduct[];
  qr_code?: BookingQRCode;
  hold_expires_at?: string;
  attended_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  is_active: boolean;
  products_count?: number;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
}

export interface Product {
  id: number;
  category: number;
  category_name?: string;
  category_slug?: string;
  name: string;
  slug: string;
  sku: string;
  short_description: string;
  description: string;
  price: string | number;
  sale_price?: string | number | null;
  effective_price: string | number;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_featured: boolean;
  is_session_product: boolean;
  is_in_stock: boolean;
  is_low_stock: boolean;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id?: number;
  product: Product;
  product_id?: number;
  quantity: number;
  subtotal: number;
}

export interface OrderItem {
  id: number;
  product: number;
  product_name: string;
  sku: string;
  unit_price: string | number;
  quantity: number;
  subtotal: string | number;
}

export interface Order {
  id: string;
  order_reference: string;
  user?: number | null;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  delivery_type: 'PICKUP' | 'DELIVERY';
  delivery_type_display: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  subtotal_amount: string | number;
  delivery_fee: string | number;
  total_amount: string | number;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'COMPLETED' | 'CANCELLED';
  status_display: string;
  payment_status: 'UNPAID' | 'PAID' | 'REFUNDED';
  payment_status_display: string;
  admin_notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface InventoryTransaction {
  id: number;
  product: number;
  product_name: string;
  transaction_type: string;
  quantity_change: number;
  balance_after: number;
  notes: string;
  created_at: string;
}

export interface SiteSetting {
  hero_headline: string;
  hero_subheadline: string;
  hero_image?: string;
  about_title: string;
  about_content: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  delivery_flat_fee: string | number;
  social_instagram: string;
  social_facebook: string;
  social_tiktok: string;
}

export interface Testimonial {
  id: number;
  client_name: string;
  client_title: string;
  quote: string;
  rating: number;
  avatar?: string;
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

export interface DashboardMetrics {
  total_revenue: number;
  total_revenue_formatted: string;
  monthly_revenue: number;
  monthly_revenue_formatted: string;
  total_bookings: number;
  upcoming_bookings: number;
  total_orders: number;
  pending_orders: number;
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
}
