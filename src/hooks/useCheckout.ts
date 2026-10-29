import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useApi } from './useApi';
import { getErrorMessage, getFieldErrors, tokenStore } from '../utils/apiClient';
import { toNumber } from '../utils/format';
import { saveLastOrder } from '../utils/lastOrder';
import { addressApi, orderApi, paymentApi, promoApi } from '../utils/shopApi';
import { emptyAddress } from '../components/checkout/AddressFields';
import type { AddressInput, CheckoutPayload, CouponResult, PaymentMethod } from '../types/api';

export interface GuestDetails {
  name: string;
  email: string;
  phone: string;
}

export function useCheckout() {
  const { user } = useAuth();
  const { cart, refresh } = useCart();
  const navigate = useNavigate();

  const addresses = useApi(() => addressApi.list(), [user?.id], !!user);
  const [selectedAddress, setSelectedAddress] = useState<number | 'new'>('new');
  const [address, setAddress] = useState<AddressInput>(emptyAddress);
  const [saveAddress, setSaveAddress] = useState(true);
  const [guest, setGuest] = useState<GuestDetails>({ name: '', email: '', phone: '' });
  const [method, setMethod] = useState<PaymentMethod>('KOKO');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<CouponResult | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const list = addresses.data;
    if (!list) return;
    const preferred = list.find((a) => a.is_default) ?? list[0];
    setSelectedAddress(preferred ? preferred.id : 'new');
  }, [addresses.data]);

  useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        recipient_name: prev.recipient_name || `${user.first_name} ${user.last_name}`.trim(),
        phone_number: prev.phone_number || user.phone_number || ''
      }));
    }
  }, [user]);

  const subtotal = toNumber(cart?.subtotal);
  const discount = coupon?.valid ? toNumber(coupon.discount_amount) : 0;
  const delivery = toNumber(cart?.estimated_delivery_fee);
  const total = Math.max(0, subtotal - discount + delivery);

  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await promoApi.validate(code, subtotal);
      if (res.valid) {
        setCoupon(res);
        toast.success(res.message || 'Coupon applied');
      } else {
        setCoupon(null);
        setCouponError(res.message || 'This coupon is not valid.');
      }
    } catch (err) {
      setCoupon(null);
      setCouponError(getErrorMessage(err));
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponCode('');
  };

  const resolveShipping = (): AddressInput | null => {
    if (user && selectedAddress !== 'new') {
      const saved = addresses.data?.find((a) => a.id === selectedAddress);
      return saved ?? null;
    }
    return address;
  };

  const validate = (shipping: AddressInput | null): Record<string, string> => {
    const next: Record<string, string> = {};
    if (!user) {
      if (!guest.name.trim()) next.guest_name = 'Enter your full name';
      if (!/^\S+@\S+\.\S+$/.test(guest.email)) next.guest_email = 'Enter a valid email address';
      if (guest.phone.trim().length < 9) next.guest_phone = 'Enter a valid phone number';
    }
    if (!shipping) {
      next.address = 'Choose a delivery address';
      return next;
    }
    if (!shipping.recipient_name.trim()) next.recipient_name = 'Required';
    if (!shipping.phone_number.trim()) next.phone_number = 'Required';
    if (!shipping.address_line1.trim()) next.address_line1 = 'Required';
    if (!shipping.city.trim()) next.city = 'Required';
    if (!shipping.postal_code.trim()) next.postal_code = 'Required';
    if (!shipping.country.trim()) next.country = 'Required';
    return next;
  };

  const placeOrder = async () => {
    const shipping = resolveShipping();
    const validation = validate(shipping);
    setErrors(validation);
    if (Object.keys(validation).length || !shipping) {
      toast.error('Please complete the highlighted fields.');
      return;
    }

    const payload: CheckoutPayload = {
      shipping_recipient_name: shipping.recipient_name,
      shipping_phone: shipping.phone_number,
      shipping_address_line1: shipping.address_line1,
      shipping_address_line2: shipping.address_line2 || undefined,
      shipping_city: shipping.city,
      shipping_state: shipping.state_or_province || undefined,
      shipping_postal_code: shipping.postal_code,
      shipping_country: shipping.country,
      payment_method: method,
      coupon_code: coupon?.valid ? coupon.code : undefined,
      delivery_notes: (selectedAddress === 'new' ? address.delivery_notes : deliveryNotes) || undefined
    };
    if (!user) {
      payload.guest_name = guest.name.trim();
      payload.guest_email = guest.email.trim();
      payload.guest_phone = guest.phone.trim();
      payload.guest_token = tokenStore.getGuest();
    }

    setSubmitting(true);
    try {
      if (user && selectedAddress === 'new' && saveAddress) {
        try {
          await addressApi.create({ ...address, is_default: !addresses.data?.length });
        } catch {

          // Saving the address is a convenience; the order can continue without it.
        }}
      const order = await orderApi.checkout(payload);
      const contact = user ? user.email : guest.email.trim();
      saveLastOrder({ order, contact });
      void refresh();

      if (method !== 'BANK_TRANSFER') {
        try {
          const payment = await paymentApi.initiate(order.order_number, method);
          if (payment.checkout_url) {
            window.location.href = payment.checkout_url;
            return;
          }
        } catch (err) {
          toast.error(`Order placed, but we couldn't start the payment: ${getErrorMessage(err)}`);
        }
      }
      navigate(`/order/${order.order_number}`, { state: { order, contact } });
    } catch (err) {
      setErrors((prev) => ({ ...prev, ...getFieldErrors(err) }));
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    user,
    cart,
    addresses,
    selectedAddress,
    setSelectedAddress,
    address,
    updateAddress: (patch: Partial<AddressInput>) => setAddress((prev) => ({ ...prev, ...patch })),
    saveAddress,
    setSaveAddress,
    guest,
    updateGuest: (patch: Partial<GuestDetails>) => setGuest((prev) => ({ ...prev, ...patch })),
    method,
    setMethod,
    deliveryNotes,
    setDeliveryNotes,
    couponCode,
    setCouponCode,
    coupon,
    couponError,
    couponLoading,
    applyCoupon,
    removeCoupon,
    totals: { subtotal, discount, delivery, total },
    errors,
    submitting,
    placeOrder
  };
}