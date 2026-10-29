import { apiRequest, downloadFile, toList, toPage } from './apiClient';
import type {
  Address,
  AddressInput,
  AuthResponse,
  BankDetails,
  Brand,
  Campaign,
  Cart,
  Category,
  CheckoutPayload,
  CouponResult,
  NotificationList,
  Order,
  OrderSummary,
  Paginated,
  PaymentInitResult,
  PaymentMethod,
  ProductDetail,
  ProductQuery,
  ProductSummary,
  RegisterPayload,
  Review,
  User,
  Viewer3D,
  WishlistItem } from
'../types/api';

export const authApi = {
  login: (email: string, password: string) =>
  apiRequest<AuthResponse>('/api/auth/login/', { method: 'POST', body: { email, password } }),
  register: (payload: RegisterPayload) =>
  apiRequest<AuthResponse>('/api/auth/register/', { method: 'POST', body: payload }),
  profile: () => apiRequest<User>('/api/auth/profile/', { auth: true }),
  updateProfile: (payload: Partial<Pick<User, 'first_name' | 'last_name' | 'phone_number'>>) =>
  apiRequest<User>('/api/auth/profile/', { method: 'PATCH', body: payload, auth: true }),
  changePassword: (payload: {old_password: string;new_password: string;new_password_confirm: string;}) =>
  apiRequest<{success: boolean;message: string;}>('/api/auth/change-password/', {
    method: 'POST',
    body: payload,
    auth: true
  })
};

export const addressApi = {
  list: async () => toList(await apiRequest<Address[] | Paginated<Address>>('/api/addresses/', { auth: true })),
  create: (payload: AddressInput) => apiRequest<Address>('/api/addresses/', { method: 'POST', body: payload, auth: true }),
  setDefault: (id: number) =>
  apiRequest<{success: boolean;message: string;}>(`/api/addresses/${id}/set-default/`, { method: 'POST', auth: true })
};

export const catalogApi = {
  categories: async () =>
  toList(await apiRequest<Category[] | Paginated<Category>>('/api/catalog/categories/', { query: { page_size: 100 } })),
  products: async (query: ProductQuery = {}) =>
  toPage(
    await apiRequest<ProductSummary[] | Paginated<ProductSummary>>('/api/catalog/products/', {
      query: { ...query }
    })
  ),
  product: (slug: string) => apiRequest<ProductDetail>(`/api/catalog/products/${encodeURIComponent(slug)}/`),
  model3d: (slug: string) => apiRequest<Viewer3D>(`/api/catalog/products/${encodeURIComponent(slug)}/3d-model/`),
  brands: async (): Promise<Brand[]> => {
    const brands = new Map<string, Brand>();
    let page = 1;
    for (let i = 0; i < 10; i += 1) {
      const res = await catalogApi.products({ page, page_size: 100 });
      res.results.forEach((product) => {
        if (product.brand && !brands.has(product.brand.slug)) brands.set(product.brand.slug, product.brand);
      });
      if (!res.next) break;
      page += 1;
    }
    return Array.from(brands.values()).sort((a, b) => a.name.localeCompare(b.name));
  }
};

export const cartApi = {
  get: () => apiRequest<Cart>('/api/cart/', { auth: true, guest: true }),
  add: (productId: number, variantId: number | null, quantity: number) =>
  apiRequest<Cart>('/api/cart/', {
    method: 'POST',
    auth: true,
    guest: true,
    body: variantId ? { product_id: productId, variant_id: variantId, quantity } : { product_id: productId, quantity }
  }),
  update: (itemId: number, quantity: number) =>
  apiRequest<Cart>(`/api/cart/items/${itemId}/`, { method: 'PATCH', auth: true, guest: true, body: { quantity } }),
  remove: (itemId: number) =>
  apiRequest<Cart>(`/api/cart/items/${itemId}/`, { method: 'DELETE', auth: true, guest: true }),
  merge: (guestToken: string) =>
  apiRequest<Cart>('/api/cart/merge/', { method: 'POST', auth: true, body: { guest_token: guestToken } })
};

export const wishlistApi = {
  list: async () => toList(await apiRequest<WishlistItem[] | Paginated<WishlistItem>>('/api/wishlist/', { auth: true })),
  toggle: (productId: number) =>
  apiRequest<{success: boolean;added: boolean;message: string;}>('/api/wishlist/', {
    method: 'POST',
    auth: true,
    body: { product_id: productId }
  })
};

export const promoApi = {
  validate: (code: string, subtotal: number) =>
  apiRequest<CouponResult>('/api/promotions/coupons/validate/', {
    method: 'POST',
    auth: true,
    body: { code, subtotal }
  }),
  campaigns: async () => toList(await apiRequest<Campaign[] | Paginated<Campaign>>('/api/promotions/campaigns/'))
};

export const orderApi = {
  checkout: (payload: CheckoutPayload) =>
  apiRequest<Order>('/api/orders/checkout/', { method: 'POST', auth: true, guest: true, body: payload }),
  list: async () => toList(await apiRequest<OrderSummary[] | Paginated<OrderSummary>>('/api/orders/', { auth: true })),
  get: (id: number) => apiRequest<Order>(`/api/orders/${id}/`, { auth: true }),
  track: (orderNumber: string, contact: string) =>
  apiRequest<Order>('/api/orders/track/', { query: { order_number: orderNumber, contact } }),
  cancel: (id: number, reason: string) =>
  apiRequest<{id: number;status: string;}>(`/api/orders/${id}/cancel/`, {
    method: 'POST',
    auth: true,
    body: { reason }
  }),
  returnRefund: (
  id: number,
  payload: {type: string;refund_amount: number;reason: string;bank_details_for_refund: string;}) =>

  apiRequest<{id: number;status: string;}>(`/api/orders/${id}/return-refund/`, {
    method: 'POST',
    auth: true,
    body: payload
  }),
  invoice: (id: number, orderNumber: string, contact?: string) =>
  downloadFile(`/api/orders/${id}/invoice/`, `Invoice_${orderNumber}.pdf`, contact ? { contact } : undefined)
};

export const paymentApi = {
  bankDetails: () => apiRequest<BankDetails>('/api/payments/bank-details/'),
  initiate: (orderNumber: string, method: PaymentMethod) =>
  apiRequest<PaymentInitResult>('/api/payments/initiate/', {
    method: 'POST',
    auth: true,
    guest: true,
    body: { order_number: orderNumber, payment_method: method }
  }),
  submitSlip: (form: FormData) =>
  apiRequest<{success: boolean;message: string;status: string;}>('/api/payments/bank-transfer/submit-slip/', {
    method: 'POST',
    auth: true,
    guest: true,
    form
  })
};

export const reviewApi = {
  list: async (productSlug: string) =>
  toList(await apiRequest<Review[] | Paginated<Review>>('/api/reviews/', { query: { product_slug: productSlug } })),
  submit: (payload: {product: number;rating: number;title: string;review_text: string;}) =>
  apiRequest<Review>('/api/reviews/submit/', { method: 'POST', auth: true, body: payload })
};

export const notificationApi = {
  list: () => apiRequest<NotificationList>('/api/notifications/', { auth: true }),
  markRead: (id: number) =>
  apiRequest<{success: boolean;}>(`/api/notifications/${id}/mark-read/`, { method: 'POST', auth: true })
};