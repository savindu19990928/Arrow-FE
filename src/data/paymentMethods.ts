import type { PaymentMethod } from '../types/api';

export const paymentMethods: {id: PaymentMethod;title: string;description: string;}[] = [
{
  id: 'KOKO',
  title: 'Koko',
  description: 'Split your payment into 3 interest-free instalments. You’ll be redirected to Koko to complete it.'
},
{
  id: 'MINTPAY',
  title: 'Mintpay',
  description: 'Pay in 3 instalments with Mintpay. You’ll be redirected to Mintpay to complete it.'
},
{
  id: 'BANK_TRANSFER',
  title: 'Direct bank transfer',
  description: 'Transfer to our account and upload your slip. We confirm your order once payment is verified.'
}];