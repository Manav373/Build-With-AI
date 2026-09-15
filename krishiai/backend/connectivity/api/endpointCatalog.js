/**
 * api/endpointCatalog.js
 * -------------------------------------------------------------
 * Central catalog of all KrishiAI backend API endpoints, grouped by domain.
 */

export const ENDPOINT_CATALOG = {
  // 🌾 FARMER ENDPOINTS
  FARMER: {
    CHAT_DIAGNOSIS: '/api/v1/farmer/chat',
    CROP_RECOMMENDATION: '/api/v1/farmer/recommend',
    YIELD_PREDICTION: '/api/v1/farmer/predict',
    MANDI_PRICES: '/api/v1/farmer/market/prices',
    MANDI_NEARBY: '/api/v1/farmer/market/nearby',
    SATELLITE_NDVI: '/api/v1/farmer/satellite/ndvi',
    SCHEMES_LIST: '/api/v1/farmer/schemes',
    SCHEME_AI_SUMMARY: '/api/v1/farmer/schemes/summary',
    CALL_HISTORY: '/api/v1/farmer/voice/history',
    LOCATION_RESOLVE: '/api/v1/farmer/location/resolve'
  },

  // 🏪 VENDOR ENDPOINTS
  VENDOR: {
    STATS: '/api/v1/vendor/dashboard/stats',
    REQUIREMENTS: '/api/v1/vendor/requirements',
    APPLICATIONS: '/api/v1/vendor/applications',
    NEGOTIATE: '/api/v1/vendor/negotiation',
    ORDERS: '/api/v1/vendor/orders',
    PRODUCTS: '/api/v1/vendor/products',
    WAREHOUSE_SLOTS: '/api/v1/vendor/warehouse',
    AI_QUALITY_GRADE: '/api/v1/vendor/quality-ai/grade',
    PAYMENTS_LEDGER: '/api/v1/vendor/payments',
    TENDERS: '/api/v1/vendor/tenders'
  },

  // 🛡️ ADMIN ENDPOINTS
  ADMIN: {
    DASHBOARD_STATS: '/api/v1/admin/dashboard/stats',
    USERS_LIST: '/api/v1/admin/users',
    USER_MODERATE: '/api/v1/admin/users/moderate',
    VENDORS_PENDING: '/api/v1/admin/vendors/pending',
    VENDOR_VERIFY: '/api/v1/admin/vendors/verify',
    PRODUCTS_PENDING: '/api/v1/admin/products/pending',
    PRODUCT_MODERATE: '/api/v1/admin/products/moderate',
    COMPLAINTS: '/api/v1/admin/complaints',
    AUDIT_LOGS: '/api/v1/admin/audit-logs'
  },

  // ⚡ SYSTEM & WEBHOOKS
  SYSTEM: {
    HEALTH: '/health',
    DOCS: '/docs',
    AUTH_LOGIN: '/api/v1/auth/login',
    AUTH_REFRESH: '/api/v1/auth/refresh',
    VAPI_WEBHOOK: '/api/v1/voice/vapi/webhook',
    TWILIO_WHATSAPP_WEBHOOK: '/api/v1/whatsapp/webhook',
    WEATHER_CURRENT: '/api/v1/weather/current'
  }
};

export default ENDPOINT_CATALOG;
