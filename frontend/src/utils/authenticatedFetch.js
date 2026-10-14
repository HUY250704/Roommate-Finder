import { API_BASE_URL } from '../config/api';

let refreshRequest;

const refreshAccessToken = async () => {
  if (!refreshRequest) {
    refreshRequest = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    }).finally(() => {
      refreshRequest = null;
    });
  }

  const response = await refreshRequest;
  if (response.status === 401) {
    localStorage.removeItem('token');
    return null;
  }
  if (!response.ok) {
    throw new Error(`Could not refresh session (status ${response.status})`);
  }

  const data = await response.json();
  if (!data.token) {
    throw new Error('Refresh endpoint did not return an access token');
  }
  localStorage.setItem('token', data.token);
  return data.token;
};

export const authenticatedFetch = async (url, options = {}) => {
  const sendRequest = (token) => fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const response = await sendRequest(localStorage.getItem('token'));
  if (response.status !== 401) return response;

  const token = await refreshAccessToken();
  return token ? sendRequest(token) : response;
};
