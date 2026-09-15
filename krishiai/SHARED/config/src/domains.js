/**
 * packages/config/src/domains.js — Domain routing & host mappings
 */

export const KRISHI_DOMAINS = {
  FARMER: {
    id: 'farmer',
    name: 'KrishiAI Farmer Experience',
    host: 'farmer.krishiai.com',
    localPort: 5173,
    entryRoute: '/chat',
  },
  VENDOR: {
    id: 'vendor',
    name: 'KrishiAI Vendor Marketplace & Procurement',
    host: 'vendor.krishiai.com',
    localPort: 5174,
    entryRoute: '/vendor-dashboard',
  },
  ADMIN: {
    id: 'admin',
    name: 'KrishiAI Master Control & Governance',
    host: 'admin.krishiai.com',
    localPort: 5175,
    entryRoute: '/admin/dashboard',
  },
};

export const getDomainForHostname = (hostname) => {
  if (!hostname) return KRISHI_DOMAINS.FARMER;
  if (hostname.startsWith('admin.') || hostname.includes(':5175')) return KRISHI_DOMAINS.ADMIN;
  if (hostname.startsWith('vendor.') || hostname.includes(':5174')) return KRISHI_DOMAINS.VENDOR;
  return KRISHI_DOMAINS.FARMER;
};
