import { orderApi } from './storeApi';

/** Downloads the PDF invoice for an order and triggers a browser save. */
export async function downloadInvoice(orderId: number, orderNumber: string, contact?: string): Promise<void> {
  const blob = await orderApi.invoice(orderId, contact);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Invoice_${orderNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}