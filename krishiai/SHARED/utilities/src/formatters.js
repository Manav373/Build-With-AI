/**
 * packages/utils/src/formatters.js — Standard Indian agricultural & monetary formatters
 */

export const formatCurrency = (amount, options = {}) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const num = Number(amount);
  if (options.compact) {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)} K`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatQuantity = (quantity, unit = 'Quintals') => {
  if (quantity === undefined || quantity === null) return `0 ${unit}`;
  return `${Number(quantity).toLocaleString('en-IN')} ${unit}`;
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};
