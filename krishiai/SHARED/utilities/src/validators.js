/**
 * packages/utils/src/validators.js — Statutory & Form validation helpers
 */

export const isValidPhone = (phone) => {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return (digits.length === 10 && /^[6-9]/.test(digits)) || (digits.length === 12 && digits.startsWith('91'));
};

export const isValidGST = (gstin) => {
  if (!gstin) return false;
  // 15-character GSTIN regex
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gstin.trim().toUpperCase());
};

export const isValidEmail = (email) => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};
