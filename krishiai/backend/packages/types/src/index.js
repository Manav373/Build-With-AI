/**
 * packages/types/src/index.js — Shared KrishiAI Frontend Types & Schemas
 */

export const UserRole = {
  FARMER: 'FARMER',
  VENDOR: 'VENDOR',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
};

export const OrderStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
};

export const EscrowStatus = {
  INITIATED: 'INITIATED',
  HELD: 'HELD_IN_ESCROW',
  RELEASED: 'RELEASED_TO_SELLER',
  REFUNDED: 'REFUNDED_TO_BUYER',
  DISPUTED: 'DISPUTED',
};

export const KYCStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
};

export const ComplaintSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

export const SoilType = {
  CLAY: 'Clay',
  SANDY: 'Sandy',
  LOAMY: 'Loamy',
  BLACK_COTTON: 'Black Cotton',
  ALLUVIAL: 'Alluvial',
  RED_LATERITE: 'Red & Laterite',
};

export const CropCategory = {
  CEREALS: 'Cereals & Grains',
  PULSES: 'Pulses & Legumes',
  OILSEEDS: 'Oilseeds',
  VEGETABLES: 'Vegetables',
  FRUITS: 'Fruits & Horticulture',
  CASH_CROPS: 'Commercial & Cash Crops',
};
