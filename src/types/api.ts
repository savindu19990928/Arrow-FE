export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  profile_photo?: string | null;
  role: string;
  is_verified?: boolean;
  created_at?: string;
}

export interface Address {
  id: number;
  recipient_name: string;
  phone_number: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_or_province?: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  delivery_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type AddressInput = Omit<Address, 'id' | 'created_at' | 'updated_at'>;

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  parent?: number | null;
  parent_name?: string | null;
  display_order?: number;
  is_active?: boolean;
  product_count?: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
  description?: string;
}

export interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  sku: string;
  short_description: string;
  price: string;
  compare_at_price: string | null;
  discount_percentage: number | null;
  stock_quantity: number;
  in_stock: boolean;
  category: Category | null;
  brand: Brand | null;
  primary_image: string | null;
  has_3d_model: boolean;
  is_featured: boolean;
  average_rating: string | null;
  review_count: number;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
  display_order: number;
}

export interface ProductSpec {
  id: number;
  group: string;
  key: string;
  value: string;
  display_order: number;
}

export interface ProductVariant {
  id: number;
  sku: string;
  name: string;
  color?: string | null;
  size?: string | null;
  model_variant?: string | null;
  battery_capacity?: string | null;
  wheel_size?: string | null;
  configuration?: string | null;
  price_override?: string | null;
  final_price: string;
  stock_quantity: number;
  in_stock: boolean;
  image?: string | null;
  is_active: boolean;
}

export interface Viewer3D {
  id: number;
  name: string;
  has_3d_model: boolean;
  model_3d_file: string | null;
  model_3d_format?: string;
  model_3d_poster?: string | null;
  camera_orbit?: string;
  field_of_view?: string;
  auto_rotate?: boolean;
  allow_zoom?: boolean;
  environment_preset?: string;
}

export interface ProductDetail extends ProductSummary {
  description: string;
  warranty_information: string | null;
  estimated_arrival_days: number | null;
  images: ProductImage[];
  specifications: ProductSpec[];
  variants: ProductVariant[];
  viewer_3d: Viewer3D | null;
}

export interface ProductQuery {
  category?: string;
  brand?: string;
  min_price?: string;
  max_price?: string;
  in_stock?: boolean;
  has_3d_model?: boolean;
  is_featured?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  product_sku?: string;
  product_image: string | null;
  variant_id: number | null;
  variant_name: string | null;
  variant_sku?: string | null;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface Cart {
  id: number;
  guest_token?: string | null;
  items: CartItem[];
  total_items_count: number;
  subtotal: string;
  estimated_delivery_fee?: string;
  grand_total: string;
  max_lead_time_days?: number;
  updated_at?: string;
}

export interface WishlistItem {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    sku: string;
    price: string;
    in_stock: boolean;
    primary_image: string | null;
  };
  created_at: string;
}

export interface CouponResult {
  valid: boolean;
  code: string;
  discount_type: string;
  discount_value: number;
  discount_amount: number;
  discounted_subtotal: number;
  message: string;
}

export interface Campaign {
  id: number;
  title: string;
  slug: string;
  description: string;
  banner: string | null;
  discount_percentage: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_live: boolean;
}

export type PaymentMethod = 'KOKO' | 'MINTPAY' | 'BANK_TRANSFER';

export interface OrderItem {
  id: number;
  product?: number;
  product_name: string;
  variant_name: string | null;
  sku?: string;
  unit_price: string;
  quantity: number;
  total_price: string;
  warranty_snapshot?: string | null;
}

export interface StatusHistoryEntry {
  id: number;
  status: string;
  note: string;
  changed_by_name?: string;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: PaymentMethod;
  customer_name?: string;
  customer_contact?: string;
  shipping_recipient_name?: string;
  shipping_phone?: string;
  shipping_address_line1?: string;
  shipping_address_line2?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  subtotal: string;
  discount_amount: string;
  delivery_charge: string;
  total_amount: string;
  coupon_code?: string | null;
  estimated_arrival_date: string | null;
  courier_name?: string | null;
  tracking_number?: string | null;
  delivery_notes?: string | null;
  placed_at?: string;
  confirmed_at?: string | null;
  delivered_at?: string | null;
  items: OrderItem[];
  status_history?: StatusHistoryEntry[];
}

export interface OrderSummary {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: PaymentMethod;
  total_amount: string;
  placed_at: string;
  estimated_arrival_date: string | null;
  items_count: number;
  customer_name: string;
}

export interface TrackResult {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: PaymentMethod;
  courier_name: string | null;
  tracking_number: string | null;
  estimated_arrival_date: string | null;
  total_amount: string;
}

export interface CheckoutPayload {
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  guest_token?: string;
  shipping_recipient_name: string;
  shipping_phone: string;
  shipping_address_line1: string;
  shipping_address_line2?: string;
  shipping_city: string;
  shipping_state?: string;
  shipping_postal_code: string;
  shipping_country: string;
  payment_method: PaymentMethod;
  coupon_code?: string;
  delivery_notes?: string;
}

export interface BankAccount {
  bank_name: string;
  account_name: string;
  account_number: string;
  branch: string;
  swift_code: string;
}

export interface BankDetails {
  bank_accounts: BankAccount[];
  instructions: string;
}

export interface PaymentInitResponse {
  provider: string;
  payment_id: number;
  order_number: string;
  amount: number;
  currency?: string;
  checkout_url?: string;
  installments?: number;
  installment_amount?: number;
  message: string;
}

export interface CancellationRequest {
  id: number;
  reason: string;
  status: string;
  admin_note: string | null;
  created_at: string;
}

export interface ReturnRefundPayload {
  type: string;
  refund_amount: number;
  reason: string;
  bank_details_for_refund: string;
}

export interface Review {
  id: number;
  product: number;
  user_name: string;
  rating: number;
  title: string;
  review_text: string;
  verified_purchase: boolean;
  created_at: string;
}

export interface AppNotification {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  unread_count: number;
  notifications: AppNotification[];
}

export interface RegisterPayload {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

export interface AuthResult {
  access: string;
  refresh: string;
  user: User;
}