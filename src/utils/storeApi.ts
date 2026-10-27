import { apiBlob, apiRequest } from './apiClient';
import type {
  Address,
  AddressInput,
  AppNotification,
  AuthResult,
  BankDetails,
  CancellationRequest,
  Campaign,
  Cart,
  Category,
  CheckoutPayload,
  CouponResult,
  NotificationsResponse,
  Order,
  OrderSummary,
  Paginated,
  PaymentInitResponse,
  PaymentMethod,
  ProductDetail,
  ProductQuery,
  ProductSummary,
  RegisterPayload,
  ReturnRefundPayload,
  Review,
  TrackResult,
  User,
  Viewer3D,
  WishlistItem } from
'../types/api';

type AuthEnvelope = Partial<AuthResult> & {data?: Partial<AuthResult>;};

function normalizeAuth(res: AuthEnvelope): AuthResult {
  const source = res.data ?? res;
  if (!source.access || !source.user) {
    throw new Error('Unexpected response from the server. Please try again.');
  }
  return { access: source.access, refresh: source.refresh ?? '', user: source.user };
}

export const authApi = {
  login: async (email: string, password: string) =>
  normalizeAuth(
    await apiRequest<AuthEnvelope>('/api/auth/login/', {
      method: 'POST',
      body: { email, password },
      auth: false
    })
  ),
  register: async (payload: RegisterPayload) =>
  normalizeAuth(
    await apiRequest<AuthEnvelope>('/api/auth/register/', {
      method: 'POST',
      body: payload,
      auth: false
    })
  ),
  profile: () => apiRequest<User>('/api/auth/profile/'),
  updateProfile: (payload: Partial<Pick<User, 'first_name' | 'last_name' | 'phone_number'>>) =>
  apiRequest<User>('/api/auth/profile/', { method: 'PATCH', body: payload }),
  changePassword: (payload: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }) =>
  apiRequest<{success: boolean;message: string;}>('/api/auth/change-password/', {
    method: 'POST',
    body: payload
  })
};

export const addressApi = {
  list: () => apiRequest<Address[] | Paginated<Address>>('/api/addresses/'),
  create: (payload: AddressInput) =>
  apiRequest<Address>('/api/addresses/', { method: 'POST', body: payload }),
  setDefault: (id: number) =>
  apiRequest<{success: boolean;}>(`/api/addresses/${id}/set-default/`, { method: 'POST' })
};

export const catalogApi = {
  categories: () =>
  apiRequest<Paginated<Category> | Category[]>('/api/catalog/categories/', {
    query: { page_size: 100 }
  }),
  products: (query: ProductQuery = {}) =>
  apiRequest<Paginated<ProductSummary>>('/api/catalog/products/', {
    query: { ...query }
  }),
  product: (slug: string) =>
  apiRequest<ProductDetail>(`/api/catalog/products/${encodeURIComponent(slug)}/`),
  model3d: (slug: string) =>
  apiRequest<Viewer3D>(`/api/catalog/products/${encodeURIComponent(slug)}/3d-model/`)
};

export const cartApi = {
  get: () => apiRequest<Cart>('/api/cart/'),
  add: (productId: number, variantId: number | null, quantity: number) =>
  apiRequest<Cart>('/api/cart/', {
    method: 'POST',
    body: { product_id: productId, variant_id: variantId ?? undefined, quantity }
  }),
  updateItem: (itemId: number, quantity: number) =>
  apiRequest<Cart>(`/api/cart/items/${itemId}/`, { method: 'PATCH', body: { quantity } }),
  removeItem: (itemId: number) =>
  apiRequest<Cart>(`/api/cart/items/${itemId}/`, { method: 'DELETE' }),
  merge: (guestToken: string) =>
  apiRequest<Cart>('/api/cart/merge/', { method: 'POST', body: { guest_token: guestToken } })
};

export const wishlistApi = {
  list: () => apiRequest<WishlistItem[] | Paginated<WishlistItem>>('/api/wishlist/'),
  toggle: (productId: number) =>
  apiRequest<{success: boolean;added: boolean;message: string;}>('/api/wishlist/', {
    method: 'POST',
    body: { product_id: productId }
  })
};

export const promoApi = {
  validateCoupon: (code: string, subtotal: number) =>
  apiRequest<CouponResult>('/api/promotions/coupons/validate/', {
    method: 'POST',
    body: { code, subtotal }
  }),
  campaigns: () => apiRequest<Campaign[] | Paginated<Campaign>>('/api/promotions/campaigns/')
};

export const orderApi = {
  checkout: (payload: CheckoutPayload) =>
  apiRequest<Order>('/api/orders/checkout/', { method: 'POST', body: payload }),
  list: (page = 1) =>
  apiRequest<Paginated<OrderSummary>>('/api/orders/', { query: { page } }),
  get: (id: number | string) => apiRequest<Order>(`/api/orders/${id}/`),
  invoice: (id: number | string, contact?: string) =>
  apiBlob(`/api/orders/${id}/invoice/`, { query: { contact } }),
  track: (orderNumber: string, contact: string) =>
  apiRequest<TrackResult>('/api/orders/track/', {
    query: { order_number: orderNumber, contact }
  }),
  cancel: (id: number, reason: string) =>
  apiRequest<CancellationRequest>(`/api/orders/${id}/cancel/`, {
    method: 'POST',
    body: { reason }
  }),
  returnRefund: (id: number, payload: ReturnRefundPayload) =>
  apiRequest<{id: number;status: string;}>(`/api/orders/${id}/return-refund/`, {
    method: 'POST',
    body: payload
  })
};

export const paymentApi = {
  bankDetails: () => apiRequest<BankDetails>('/api/payments/bank-details/'),
  initiate: (orderNumber: string, method: PaymentMethod) =>
  apiRequest<PaymentInitResponse>('/api/payments/initiate/', {
    method: 'POST',
    body: { order_number: orderNumber, payment_method: method }
  }),
  submitSlip: (form: FormData) =>
  apiRequest<{success: boolean;message: string;status: string;}>(
    '/api/payments/bank-transfer/submit-slip/',
    { method: 'POST', formData: form }
  )
};

export const reviewApi = {
  list: (productSlug: string, page = 1) =>
  apiRequest<Paginated<Review>>('/api/reviews/', {
    query: { product_slug: productSlug, page }
  }),
  submit: (payload: {product: number;rating: number;title: string;review_text: string;}) =>
  apiRequest<Review>('/api/reviews/submit/', { method: 'POST', body: payload })
};

export const notificationApi = {
  list: () => apiRequest<NotificationsResponse>('/api/notifications/'),
  markRead: (id: AppNotification['id']) =>
  apiRequest<{success: boolean;}>(`/api/notifications/${id}/mark-read/`, { method: 'POST' })
};