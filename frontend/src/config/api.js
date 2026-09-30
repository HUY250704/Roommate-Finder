const configuredApiUrl = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD
    ? 'https://roommate-finder-be-production.up.railway.app/api'
    : 'http://localhost:5000/api'
);
const normalizedApiUrl = configuredApiUrl.replace(/\/+$/, '');

export const API_BASE_URL = normalizedApiUrl.endsWith('/api')
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`;