const configuredApiUrl = import.meta.env.PROD
  ? 'https://roommate-finder-be-production.up.railway.app/api'
  : import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const normalizedApiUrl = configuredApiUrl.replace(/\/+$/, '');

export const API_BASE_URL = normalizedApiUrl.endsWith('/api')
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`;