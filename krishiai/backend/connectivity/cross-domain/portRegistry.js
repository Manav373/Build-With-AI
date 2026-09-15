/**
 * cross-domain/portRegistry.js
 * -------------------------------------------------------------
 * Central dynamic service registry defining all KrishiAI domains,
 * endpoints, ports, protocols, and status checks.
 */

export const KRISHI_DOMAINS = {
  BACKEND: {
    id: 'backend',
    name: 'FastAPI Backend API',
    port: 8000,
    baseUrl: 'http://localhost:8000',
    healthEndpoint: 'http://localhost:8000/docs',
    icon: '⚡',
    themeColor: '#10b981', // Emerald
    role: 'Central Intelligence & ML Orchestrator'
  },
  FARMER: {
    id: 'farmer',
    name: 'Farmer Advisory Portal',
    port: 5173,
    baseUrl: 'http://localhost:5173',
    healthEndpoint: 'http://localhost:5173',
    icon: '🌾',
    themeColor: '#22c55e', // Green
    role: 'AI Crop Diagnosis, Mandi Prices, Yield ML, Satellite Health'
  },
  VENDOR: {
    id: 'vendor',
    name: 'Vendor B2B Procurement Portal',
    port: 5174,
    baseUrl: 'http://localhost:5174',
    healthEndpoint: 'http://localhost:5174',
    icon: '🏪',
    themeColor: '#06b6d4', // Cyan
    role: 'Tenders, Live Negotiations, AI Quality Grading, Inventory'
  },
  ADMIN: {
    id: 'admin',
    name: 'Admin Governance Command Center',
    port: 5175,
    baseUrl: 'http://localhost:5175',
    healthEndpoint: 'http://localhost:5175',
    icon: '🛡️',
    themeColor: '#a855f7', // Purple
    role: 'System Auditing, Moderation, User Verification & Escrow'
  }
};

/**
 * Returns domain details by ID or port.
 */
export function getDomainByPort(port) {
  return Object.values(KRISHI_DOMAINS).find(d => d.port === Number(port)) || null;
}

export function getDomainById(id) {
  return KRISHI_DOMAINS[id.toUpperCase()] || null;
}

export default KRISHI_DOMAINS;
