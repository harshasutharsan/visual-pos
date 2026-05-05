import { Transaction, Merchant } from '../types';

export const formatWhatsAppBill = (tx: Transaction, merchant?: Merchant): string => {
  const date = new Date(tx.timestamp).toLocaleString();
  let message = `*${merchant?.shop_name || 'VisualPOS Store'}*\n`;
  message += `_Bill ID: #${tx.id} | ${date}_\n`;
  message += `--------------------------\n`;

  tx.items.forEach(item => {
    const qtyStr = `${item.quantity} ${item.selectedUnit}`;
    const priceStr = (item.price * (
      ['g', 'ml'].includes(item.selectedUnit) ? item.quantity / 1000 : item.quantity
    )).toFixed(0);
    message += `• ${item.name}\n  ${qtyStr} x ${item.price} = *LKR ${priceStr}*\n`;
  });

  message += `--------------------------\n`;
  if (tx.discount > 0) {
    message += `Subtotal: LKR ${(tx.total + tx.discount).toFixed(0)}\n`;
    message += `Discount: -LKR ${tx.discount.toFixed(0)}\n`;
  }
  message += `*TOTAL: LKR ${tx.total.toLocaleString()}*\n`;
  message += `--------------------------\n`;
  message += `Payment: ${tx.paymentMethod}\n`;
  if (merchant?.address) message += `📍 ${merchant.address}\n`;
  message += `\n*Thank you for your visit!*`;

  return encodeURIComponent(message);
};
