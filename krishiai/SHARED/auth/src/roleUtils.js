/**
 * packages/auth/src/roleUtils.js — Domain & Role verification helpers
 */

export const ROLES = {
  FARMER: 'FARMER',
  VENDOR: 'VENDOR',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
};

export const DOMAINS = {
  FARMER: 'farmer',
  VENDOR: 'vendor',
  ADMIN: 'admin',
  PUBLIC: 'public',
};

export const roleUtils = {
  isFarmer: (user) => user?.role?.toUpperCase() === ROLES.FARMER,
  isVendor: (user) => user?.role?.toUpperCase() === ROLES.VENDOR,
  isAdmin: (user) =>
    user?.role?.toUpperCase() === ROLES.ADMIN ||
    user?.role?.toUpperCase() === ROLES.SUPER_ADMIN,

  canAccessDomain: (user, domain) => {
    if (!domain || domain === DOMAINS.PUBLIC) return true;
    if (!user) return false;
    if (roleUtils.isAdmin(user)) return true; // Admins have master access
    if (domain === DOMAINS.FARMER) return roleUtils.isFarmer(user);
    if (domain === DOMAINS.VENDOR) return roleUtils.isVendor(user);
    if (domain === DOMAINS.ADMIN) return roleUtils.isAdmin(user);
    return false;
  },
};

export default roleUtils;
