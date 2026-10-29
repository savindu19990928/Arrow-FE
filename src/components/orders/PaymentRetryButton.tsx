import React, { useState } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../utils/apiClient';
import { paymentLabel } from '../../utils/format';
import { paymentApi } from '../../utils/shopApi';
import { Button } from '../ui/Button';
import type { PaymentMethod } from '../../types/api';

export function PaymentRetryButton({ orderNumber, method }: {orderNumber: string;method: PaymentMethod;}) {
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true);
    try {
      const res = await paymentApi.initiate(orderNumber, method);
      if (res.checkout_url) {
        window.location.href = res.checkout_url;
        return;
      }
      toast(res.message);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={start} loading={loading}>
      Pay with {paymentLabel(method)}
    </Button>);

}