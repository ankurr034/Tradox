// ═══════════════════════════════════════════════════════════
//  NexusAI — Environment Configuration
//  All API URLs are centralized here for deployment flexibility
// ═══════════════════════════════════════════════════════════

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '' : 'http://localhost:8000');

export { API_BASE_URL };
